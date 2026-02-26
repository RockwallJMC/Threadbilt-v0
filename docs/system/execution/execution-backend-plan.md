---
title: "Backend Engineering Plan: Real-Time Chat Application"
description: "API design, business logic, and integration plan for Supabase-based chat backend"
version: "1.0.0"
date: "2026-01-23"
agent: "Wiring Engineer Agent"
status: complete
feature_id: "FEAT-CHAT-001"
---

# Backend Engineering Plan: Real-Time Chat Application

## CRITICAL: Development Server Constraints

**NEVER run `npm run dev` in the background:**
- If you need to start the dev server, inform the user and let them start it manually
- NEVER use `run_in_background: true` with Bash tool for `npm run dev`
- Dev servers must run in the terminal for proper log visibility and clean restarts
- This is a strict requirement across all agents

## 1. Architecture Overview

### 1.1 Backend Stack

The Real-Time Chat Application uses **Supabase as the complete backend platform** - there is no custom API server. All backend operations are handled through:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL (Supabase) | Data persistence with RLS |
| Authentication | Supabase Auth | JWT-based user identity |
| Real-time | Supabase Realtime | WebSocket subscriptions via Phoenix Channels |
| Storage | Supabase Storage | File attachments for chat |
| Edge Functions | Deno (Supabase) | Rate limiting, custom logic |
| RPC Functions | PL/pgSQL | Complex queries, business logic |

### 1.2 Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Hooks   │────▶│  Supabase SDK   │────▶│   PostgreSQL    │
│  (Client-side)  │◀────│   (supabase-js) │◀────│    (+ RLS)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      ▼                        │
         │              ┌───────────────┐                │
         │              │   Realtime    │◀───────────────┘
         │              │   (Phoenix)   │   LISTEN/NOTIFY
         │              └───────────────┘
         │                      │
         └──────────────────────┘
              WebSocket
```

---

## 2. Supabase Query Patterns

### 2.1 Conversations Operations

**Get User's Conversations (useConversations hook)**

```javascript
// Pattern: Get conversations with nested joins and aggregations
const { data: participations } = await supabase
  .from('conversation_participants')
  .select(`
    conversation_id,
    is_starred,
    is_muted,
    last_read_at,
    conversations (
      id,
      organization_id,
      name,
      is_group,
      created_by,
      created_at,
      updated_at
    )
  `)
  .eq('user_id', user.id)
  .order('joined_at', { ascending: false });

// Subsequent queries per conversation for:
// 1. Participants with profiles
// 2. Last message
// 3. Unread count
```

**Create Conversation**

```javascript
// Step 1: Insert conversation
const { data: conversation } = await supabase
  .from('conversations')
  .insert({
    organization_id: orgId,
    name: isGroup ? groupName : null,
    is_group: isGroup,
    created_by: user.id,
  })
  .select()
  .single();

// Step 2: Add participants (batch insert)
await supabase
  .from('conversation_participants')
  .insert([
    { conversation_id: conversation.id, user_id: creatorId, last_read_at: new Date().toISOString() },
    { conversation_id: conversation.id, user_id: recipientId },
    // ... additional participants for groups
  ]);
```

**Find Existing 1:1 Conversation**

```javascript
// Pattern: Check if 1:1 conversation exists between two users
const { data: recipientConvs } = await supabase
  .from('conversation_participants')
  .select(`
    conversation_id,
    conversations!inner (
      id,
      is_group
    )
  `)
  .eq('user_id', recipientId)
  .in('conversation_id', userConversationIds)
  .eq('conversations.is_group', false);
```

**Update Conversation Name (Groups Only)**

```javascript
await supabase
  .from('conversations')
  .update({ name: newName })
  .eq('id', conversationId)
  .eq('created_by', user.id); // RLS enforces this
```

### 2.2 Messages Operations

**Get Messages with Pagination (useMessages hook)**

```javascript
// Pattern: Paginated messages with sender profile
const { data: messages } = await supabase
  .from('messages')
  .select(`
    id,
    conversation_id,
    sender_id,
    content,
    attachments,
    reactions,
    created_at,
    updated_at,
    user_profiles:sender_id (
      id,
      email,
      full_name,
      avatar_url
    )
  `)
  .eq('conversation_id', conversationId)
  .is('deleted_at', null)
  .order('created_at', { ascending: true })
  .range(offset, offset + PAGE_SIZE - 1);
```

**Send Message (useSendMessage hook)**

```javascript
// Step 1: Get conversation's organization_id
const { data: conversation } = await supabase
  .from('conversations')
  .select('organization_id')
  .eq('id', conversationId)
  .single();

// Step 2: Insert message with returning profile
const { data: message } = await supabase
  .from('messages')
  .insert({
    organization_id: conversation.organization_id,
    conversation_id: conversationId,
    sender_id: user.id, // RLS validates this matches auth.uid()
    content: messageData.text || null,
    attachments: messageData.attachments || null,
    reactions: [],
  })
  .select(`
    id,
    conversation_id,
    sender_id,
    content,
    attachments,
    reactions,
    created_at,
    user_profiles:sender_id (id, email, full_name, avatar_url)
  `)
  .single();

// Step 3: Update conversation updated_at (for sort order)
await supabase
  .from('conversations')
  .update({ updated_at: new Date().toISOString() })
  .eq('id', conversationId);

// Step 4: Update sender's last_read_at
await supabase
  .from('conversation_participants')
  .update({ last_read_at: new Date().toISOString() })
  .eq('conversation_id', conversationId)
  .eq('user_id', user.id);
```

**Add/Toggle Reaction**

```javascript
// Step 1: Get current reactions
const { data: message } = await supabase
  .from('messages')
  .select('reactions')
  .eq('id', messageId)
  .single();

// Step 2: Toggle reaction in array
const reactions = message.reactions || [];
const existingIndex = reactions.findIndex(
  (r) => r.userId === user.id && r.emoji === emoji
);

const updatedReactions = existingIndex >= 0
  ? reactions.filter((_, i) => i !== existingIndex) // Remove
  : [...reactions, { userId: user.id, emoji }];     // Add

// Step 3: Update
await supabase
  .from('messages')
  .update({ reactions: updatedReactions })
  .eq('id', messageId);
```

**Soft Delete Message**

```javascript
await supabase
  .from('messages')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', messageId)
  .eq('sender_id', user.id); // Only sender can delete
```

### 2.3 Participant Operations

**Get Conversation Participants**

```javascript
const { data: participants } = await supabase
  .from('conversation_participants')
  .select(`
    user_id,
    joined_at,
    user_profiles:user_id (
      id,
      email,
      full_name,
      avatar_url
    )
  `)
  .eq('conversation_id', conversationId);
```

**Update Star/Mute Status**

```javascript
await supabase
  .from('conversation_participants')
  .update({ is_starred: !currentValue })
  .eq('conversation_id', conversationId)
  .eq('user_id', user.id);
```

**Mark Conversation as Read**

```javascript
await supabase
  .from('conversation_participants')
  .update({ last_read_at: new Date().toISOString() })
  .eq('conversation_id', conversationId)
  .eq('user_id', user.id);
```

**Add Participant to Group (Creator Only)**

```javascript
// RLS policy requires conversation.created_by = auth.uid()
await supabase
  .from('conversation_participants')
  .insert({
    conversation_id: conversationId,
    user_id: newUserId,
  });
```

**Remove Participant / Leave Group**

```javascript
await supabase
  .from('conversation_participants')
  .delete()
  .eq('conversation_id', conversationId)
  .eq('user_id', userIdToRemove);
```

---

## 3. RPC Functions

### 3.1 get_user_default_organization

**Purpose**: Get the first organization a user belongs to. Used when creating conversations to set organization_id.

```sql
CREATE OR REPLACE FUNCTION public.get_user_default_organization(p_user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = p_user_id
    LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_default_organization(UUID) TO authenticated;
```

**Usage**:
```javascript
const { data: orgId } = await supabase.rpc(
  'get_user_default_organization',
  { p_user_id: user.id }
);
```

### 3.2 get_unread_count

**Purpose**: Efficiently count unread messages for a conversation-user pair.

```sql
CREATE OR REPLACE FUNCTION public.get_unread_count(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.messages m
    JOIN public.conversation_participants cp
        ON cp.conversation_id = m.conversation_id
        AND cp.user_id = p_user_id
    WHERE m.conversation_id = p_conversation_id
        AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::TIMESTAMPTZ)
        AND m.sender_id != p_user_id
        AND m.deleted_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION public.get_unread_count(UUID, UUID) TO authenticated;
```

### 3.3 get_conversations_with_details (Optimization - Phase 2)

**Purpose**: Single query to get conversations with last message and unread count, eliminating N+1 queries.

```sql
CREATE OR REPLACE FUNCTION public.get_conversations_with_details(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    organization_id UUID,
    name TEXT,
    is_group BOOLEAN,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_starred BOOLEAN,
    is_muted BOOLEAN,
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER,
    last_message_id UUID,
    last_message_content TEXT,
    last_message_created_at TIMESTAMPTZ,
    last_message_sender_id UUID,
    last_message_sender_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH user_conversations AS (
        SELECT
            cp.conversation_id,
            cp.is_starred,
            cp.is_muted,
            cp.last_read_at,
            c.organization_id,
            c.name,
            c.is_group,
            c.created_by,
            c.created_at,
            c.updated_at
        FROM conversation_participants cp
        JOIN conversations c ON c.id = cp.conversation_id
        WHERE cp.user_id = p_user_id
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.id AS message_id,
            m.content,
            m.created_at AS message_created_at,
            m.sender_id,
            COALESCE(up.full_name, up.email) AS sender_name
        FROM messages m
        JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        LEFT JOIN user_profiles up ON m.sender_id = up.id
        WHERE m.deleted_at IS NULL
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    unread_counts AS (
        SELECT
            m.conversation_id,
            COUNT(*)::INTEGER AS unread_count
        FROM messages m
        JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        WHERE m.created_at > COALESCE(uc.last_read_at, '1970-01-01'::TIMESTAMPTZ)
            AND m.sender_id != p_user_id
            AND m.deleted_at IS NULL
        GROUP BY m.conversation_id
    )
    SELECT
        uc.conversation_id,
        uc.organization_id,
        uc.name,
        uc.is_group,
        uc.created_by,
        uc.created_at,
        uc.updated_at,
        uc.is_starred,
        uc.is_muted,
        uc.last_read_at,
        COALESCE(urc.unread_count, 0) AS unread_count,
        lm.message_id AS last_message_id,
        lm.content AS last_message_content,
        lm.message_created_at AS last_message_created_at,
        lm.sender_id AS last_message_sender_id,
        lm.sender_name AS last_message_sender_name
    FROM user_conversations uc
    LEFT JOIN last_messages lm ON uc.conversation_id = lm.conversation_id
    LEFT JOIN unread_counts urc ON uc.conversation_id = urc.conversation_id
    ORDER BY COALESCE(lm.message_created_at, uc.created_at) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_conversations_with_details(UUID) TO authenticated;
```

### 3.4 check_conversation_participant

**Purpose**: Verify user is participant before operations (used by RLS).

```sql
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
    p_conversation_id UUID,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND user_id = p_user_id
    );
$$;
```

---

## 4. Real-Time Subscriptions

### 4.1 Channel Architecture

```javascript
// Single channel for all chat real-time events
const channel = supabase
  .channel('chat-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, handleNewMessage)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, handleMessageUpdate)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, handleConversationUpdate)
  .subscribe();
```

### 4.2 Subscription Patterns

**New Messages Subscription**

```javascript
// useChatRealtime hook pattern
supabase
  .channel('chat-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      // Note: Supabase Realtime only supports 'eq' filter
      // Client-side filtering required for conversation_id IN (...)
    },
    async (payload) => {
      // Filter on client side
      if (!conversationIds.includes(payload.new.conversation_id)) return;

      // Skip own messages (handled optimistically)
      if (payload.new.sender_id === currentUser.id) return;

      // Fetch sender profile for display
      const { data: senderProfile } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', payload.new.sender_id)
        .single();

      onNewMessage(transformMessage(payload.new, senderProfile));
    }
  )
  .subscribe();
```

**Message Updates Subscription (Reactions)**

```javascript
.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
  },
  (payload) => {
    if (!conversationIds.includes(payload.new.conversation_id)) return;
    onMessageUpdated(payload.new, payload.new.conversation_id);
  }
)
```

**New Conversations Subscription**

```javascript
// Subscribe to conversation_participants for current user
supabase
  .channel('new-conversations')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'conversation_participants',
      filter: `user_id=eq.${userId}`, // Server-side filter supported
    },
    async (payload) => {
      // Fetch full conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', payload.new.conversation_id)
        .single();

      onNewConversation(conversation);
    }
  )
  .subscribe();
```

### 4.3 Presence Channel (Phase 3)

```javascript
// Future implementation for online/offline status
const presenceChannel = supabase.channel('presence', {
  config: {
    presence: { key: userId },
  },
});

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    // Update online users list
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User came online
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User went offline
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        online_at: new Date().toISOString(),
        user_id: userId
      });
    }
  });
```

### 4.4 Reconnection Handling

```javascript
// Built into useChatRealtime hook
const channel = supabase.channel('chat-realtime');

channel.on('system', { event: 'disconnect' }, () => {
  // Show reconnecting indicator
  setConnectionStatus('disconnected');
});

channel.on('system', { event: 'reconnected' }, () => {
  // Hide indicator, refetch missed messages
  setConnectionStatus('connected');
  mutateConversations(); // Refresh data
});
```

---

## 5. Edge Functions

### 5.1 Rate Limiter Edge Function

**Purpose**: Prevent message spam by enforcing 10 messages per minute per user.

**File: `supabase/functions/chat-rate-limit/index.ts`**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RATE_LIMIT = 10; // messages per window
const WINDOW_SECONDS = 60; // 1 minute window

interface RateLimitRequest {
  action: "check" | "increment";
}

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RateLimitRequest = await req.json();
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_SECONDS * 1000);

    // Count messages sent in current window
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .gte("created_at", windowStart.toISOString());

    if (countError) {
      throw countError;
    }

    const messageCount = count || 0;
    const remaining = Math.max(0, RATE_LIMIT - messageCount);
    const resetAt = new Date(windowStart.getTime() + WINDOW_SECONDS * 1000);

    if (body.action === "check") {
      const response: RateLimitResponse = {
        allowed: messageCount < RATE_LIMIT,
        remaining,
        reset_at: resetAt.toISOString(),
      };

      if (messageCount >= RATE_LIMIT) {
        const waitSeconds = Math.ceil((resetAt.getTime() - now.getTime()) / 1000);
        response.error = `Rate limit exceeded. Try again in ${waitSeconds} seconds.`;
      }

      return new Response(JSON.stringify(response), {
        status: messageCount >= RATE_LIMIT ? 429 : 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": resetAt.toISOString(),
        },
      });
    }

    // For "increment" action, just return current status
    // The actual increment happens via normal message INSERT
    return new Response(
      JSON.stringify({
        allowed: messageCount < RATE_LIMIT,
        remaining: Math.max(0, remaining - 1),
        reset_at: resetAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**Deployment**:
```bash
supabase functions deploy chat-rate-limit --project-ref <project-id>
```

**Client Usage**:
```javascript
const checkRateLimit = async () => {
  const { data, error } = await supabase.functions.invoke('chat-rate-limit', {
    body: { action: 'check' }
  });

  if (error || !data.allowed) {
    throw new Error(data?.error || 'Rate limit exceeded');
  }

  return data;
};

// In useSendMessage hook
const sendMessage = async (conversationId, messageData) => {
  await checkRateLimit(); // Throws if rate limited
  // ... proceed with sending
};
```

### 5.2 File Upload Validator (Phase 2)

**Purpose**: Validate file uploads before storage.

```typescript
// supabase/functions/validate-attachment/index.ts
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

Deno.serve(async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({
      error: 'Invalid file type',
      allowed: ALLOWED_TYPES
    }), { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({
      error: 'File too large',
      max_size: MAX_SIZE
    }), { status: 400 });
  }

  return new Response(JSON.stringify({
    valid: true,
    type: file.type,
    size: file.size
  }));
});
```

---

## 6. Error Handling

### 6.1 Standard Error Codes

| HTTP Status | Code | Description | User Message |
|-------------|------|-------------|--------------|
| 400 | `VALIDATION_ERROR` | Invalid request data | "Please check your input and try again" |
| 400 | `EMPTY_MESSAGE` | Message has no content or attachments | "Message cannot be empty" |
| 400 | `INVALID_FILE_TYPE` | Unsupported attachment type | "This file type is not supported" |
| 400 | `FILE_TOO_LARGE` | Attachment exceeds 10MB | "File must be smaller than 10MB" |
| 401 | `UNAUTHORIZED` | No valid auth session | "Please log in to continue" |
| 403 | `FORBIDDEN` | User lacks permission | "You don't have access to this resource" |
| 403 | `NOT_PARTICIPANT` | User not in conversation | "You're not part of this conversation" |
| 404 | `NOT_FOUND` | Resource doesn't exist | "This item could not be found" |
| 409 | `DUPLICATE_CONVERSATION` | 1:1 already exists | "You already have a conversation with this person" |
| 429 | `RATE_LIMITED` | Too many messages | "Slow down! Try again in X seconds" |
| 500 | `INTERNAL_ERROR` | Server/database error | "Something went wrong. Please try again" |

### 6.2 Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retry_after?: number; // For rate limiting
  };
}

// Example
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "details": {
      "limit": 10,
      "remaining": 0,
      "reset_at": "2026-01-23T12:01:00Z"
    },
    "retry_after": 45
  }
}
```

### 6.3 Supabase Error Handling Pattern

```javascript
// In hooks, wrap Supabase calls with error handling
const sendMessage = async (conversationId, messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({ ... })
      .select()
      .single();

    if (error) {
      // Map Supabase errors to application errors
      if (error.code === '23503') { // Foreign key violation
        throw { code: 'NOT_FOUND', message: 'Conversation not found' };
      }
      if (error.code === '42501') { // RLS violation
        throw { code: 'FORBIDDEN', message: 'You cannot send messages to this conversation' };
      }
      throw { code: 'INTERNAL_ERROR', message: error.message };
    }

    return data;
  } catch (err) {
    setError(err);
    throw err;
  }
};
```

### 6.4 Real-time Error Handling

```javascript
// Handle WebSocket errors in useChatRealtime
channel.subscribe((status, err) => {
  if (status === 'SUBSCRIBED') {
    setConnectionStatus('connected');
  } else if (status === 'CHANNEL_ERROR') {
    console.error('Realtime channel error:', err);
    setConnectionStatus('error');
    // Attempt reconnect after delay
    setTimeout(() => channel.subscribe(), 5000);
  } else if (status === 'TIMED_OUT') {
    setConnectionStatus('timeout');
    // Show user "Reconnecting..." indicator
  }
});
```

---

## 7. Validation Rules

### 7.1 Message Validation

| Field | Rules | Error Code |
|-------|-------|------------|
| content | Max 4000 chars; nullable if attachments | `VALIDATION_ERROR` |
| attachments | Max 5 per message; each max 10MB | `VALIDATION_ERROR` |
| conversation_id | Must exist; user must be participant | `NOT_FOUND`, `FORBIDDEN` |
| sender_id | Must match auth.uid() (enforced by RLS) | `FORBIDDEN` |

**Client-side Validation (ContentFooter)**:
```javascript
const validateMessage = (text, attachments) => {
  if (!text?.trim() && (!attachments || attachments.length === 0)) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (text && text.length > 4000) {
    return { valid: false, error: 'Message too long (max 4000 characters)' };
  }
  if (attachments && attachments.length > 5) {
    return { valid: false, error: 'Too many attachments (max 5)' };
  }
  return { valid: true };
};
```

### 7.2 Conversation Validation

| Field | Rules | Error Code |
|-------|-------|------------|
| name | Max 255 chars; required for groups | `VALIDATION_ERROR` |
| is_group | Boolean required | `VALIDATION_ERROR` |
| participants | 2 for 1:1; 3-50 for groups | `VALIDATION_ERROR` |
| organization_id | Must match user's org | `FORBIDDEN` |

**Group Validation**:
```javascript
const validateGroupCreation = (recipientIds, groupName) => {
  if (!groupName?.trim()) {
    return { valid: false, error: 'Group name is required' };
  }
  if (groupName.length > 255) {
    return { valid: false, error: 'Group name too long' };
  }
  if (!recipientIds || recipientIds.length < 2) {
    return { valid: false, error: 'Groups need at least 3 participants' };
  }
  if (recipientIds.length > 49) {
    return { valid: false, error: 'Groups limited to 50 participants' };
  }
  return { valid: true };
};
```

### 7.3 Attachment Validation

| Rule | Limit | Error Message |
|------|-------|---------------|
| Max file size | 10MB | "File exceeds 10MB limit" |
| Allowed types | jpg, png, gif, webp, pdf, doc, docx, xls, xlsx | "File type not supported" |
| Max attachments per message | 5 | "Too many attachments" |
| Total attachments size | 50MB per message | "Total attachment size too large" |

**MIME Type Validation**:
```javascript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const validateAttachment = (file) => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not supported` };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File exceeds 10MB limit' };
  }
  return { valid: true };
};
```

---

## 8. Business Logic

### 8.1 Rules Enforced by RLS

| Rule | Table | Policy Type | Implementation |
|------|-------|-------------|----------------|
| Multi-tenant isolation | All | SELECT/INSERT | `organization_id` via org membership check |
| Conversation access | conversations | SELECT | Must be in `conversation_participants` |
| Message access | messages | SELECT | Conversation participant check |
| Sender verification | messages | INSERT | `sender_id = auth.uid()` |
| Creator-only updates | conversations | UPDATE | `created_by = auth.uid()` |
| Own participation updates | conversation_participants | UPDATE | `user_id = auth.uid()` |

### 8.2 Rules Enforced by Application Logic

| Rule | Location | Implementation |
|------|----------|----------------|
| 1:1 conversation uniqueness | useStartConversation | Check existing before create |
| Group participant limits (3-50) | useStartConversation | Validate array length |
| Message rate limiting | Edge Function | 10/minute per user |
| Soft delete only | useSendMessage | Update `deleted_at`, never DELETE |
| Attachment type validation | Client + Edge Function | MIME type whitelist |
| Attachment size validation | Client + Storage Policy | Max 10MB |

### 8.3 Rules Enforced by Database Triggers

**Auto-update `updated_at`**:
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
```

### 8.4 Rules Enforced by Database Constraints

```sql
-- Unique 1:1 conversation check (application-level, DB backup)
ALTER TABLE conversation_participants
    ADD CONSTRAINT unique_conversation_participant
    UNIQUE (conversation_id, user_id);

-- Group participant minimum/maximum (check constraint)
-- Note: This requires a trigger since it spans rows
CREATE OR REPLACE FUNCTION check_group_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    participant_count INTEGER;
    is_group BOOLEAN;
BEGIN
    -- Get conversation type and current count
    SELECT c.is_group, COUNT(cp.id)
    INTO is_group, participant_count
    FROM conversations c
    LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE c.id = NEW.conversation_id
    GROUP BY c.is_group;

    -- For groups, enforce limits
    IF is_group THEN
        IF participant_count > 50 THEN
            RAISE EXCEPTION 'Group conversations limited to 50 participants';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
```

---

## 9. Storage Patterns

### 9.1 Attachment Upload Pattern

```javascript
// Path pattern: {org_id}/chat/{conversation_id}/{uuid}_{filename}
const uploadAttachment = async (conversationId, file) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get org_id from conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('organization_id')
    .eq('id', conversationId)
    .single();

  const fileId = crypto.randomUUID();
  const fileName = `${conv.organization_id}/chat/${conversationId}/${fileId}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);

  return {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    url: publicUrl,
  };
};
```

### 9.2 Storage Bucket Policy

```sql
-- Bucket: attachments
-- Policy: Participants can upload/download

-- Upload policy
CREATE POLICY "Conversation participants can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid()
    )
    AND (storage.foldername(name))[3] IN (
        SELECT conversation_id::text
        FROM conversation_participants
        WHERE user_id = auth.uid()
    )
);

-- Download policy
CREATE POLICY "Conversation participants can download attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[3] IN (
        SELECT conversation_id::text
        FROM conversation_participants
        WHERE user_id = auth.uid()
    )
);
```

---

## 10. Testing Plan

### 10.1 Unit Tests

- [ ] `useConversations` - Fetch, transform, error handling
- [ ] `useMessages` - Pagination, transform, addMessage
- [ ] `useSendMessage` - Validation, error states, optimistic update
- [ ] `useStartConversation` - 1:1 finding, group creation
- [ ] `useChatRealtime` - Subscription setup, cleanup, filtering
- [ ] Validation functions - All edge cases

### 10.2 Integration Tests

- [ ] Create conversation flow (1:1 and group)
- [ ] Send and receive messages
- [ ] Real-time message delivery
- [ ] File attachment upload/download
- [ ] Star/mute functionality
- [ ] Leave group conversation
- [ ] Rate limiting enforcement

### 10.3 Security Tests

- [ ] RLS policy verification - Cross-org access blocked
- [ ] RLS policy verification - Non-participant access blocked
- [ ] Sender spoofing prevention
- [ ] File type validation bypass attempts
- [ ] Rate limit bypass attempts
- [ ] SQL injection in search queries

### 10.4 Performance Tests

- [ ] Conversation list load with 100 conversations
- [ ] Message pagination with 10,000 messages
- [ ] Concurrent WebSocket connections (50 users)
- [ ] Message throughput (100 messages/minute)

---

## 11. Output Contract

### Provided To

| Recipient | What is Provided |
|-----------|-----------------|
| Frontend Agent | Query patterns, response shapes, error codes |
| Database Agent | RPC function specifications, RLS requirements |
| QA Agent | Test scenarios, validation rules |
| INDEX.md | Complete backend implementation plan |

### Required From

| Source | What is Required | Status |
|--------|-----------------|--------|
| Product Requirements (05) | API requirements, business rules | **Received** |
| Architecture Change (06) | Integration points, data flows | **Received** |
| Database Plan | Schema definitions, indexes | **Pending** |

---

## Appendix A: Hook-to-Query Mapping

| Hook | Primary Query | Supporting Queries |
|------|--------------|-------------------|
| `useConversations` | `conversation_participants` JOIN `conversations` | participants, last_message, unread_count per conversation |
| `useMessages` | `messages` JOIN `user_profiles` | None (paginated single query) |
| `useSendMessage` | INSERT `messages` | SELECT `conversations` (org_id), UPDATE `conversations`, UPDATE `conversation_participants` |
| `useStartConversation` | INSERT `conversations`, INSERT `conversation_participants` | RPC `get_user_default_organization`, SELECT existing conversations |
| `useChatRealtime` | WebSocket subscription | SELECT `user_profiles` (for sender info on receive) |

## Appendix B: API Response Shapes

### Conversation (UI Format)
```typescript
interface Conversation {
  id: string;
  conversationName: string | null;
  recipients: Recipient[];
  messages: Message[];
  lastMessage: Message | null;
  unreadMessages: number;
  starred: boolean;
  muted: boolean;
  isGroup: boolean;
  createdAt: string;
}
```

### Message (UI Format)
```typescript
interface Message {
  id: string;
  senderId: string;
  type: 'sent' | 'received';
  text: string | null;
  attachments: Attachment[] | null;
  reactions: Reaction[];
  createdAt: Date;
  readAt: Date | null;
  sender: Sender | null;
}
```

### Recipient
```typescript
interface Recipient {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'offline';
}
```

---

*Generated with Claude AI assistance as directed by Pierce Desk*
*Document ID: FEAT-CHAT-001-E2*
*Generated: 2026-01-23*
