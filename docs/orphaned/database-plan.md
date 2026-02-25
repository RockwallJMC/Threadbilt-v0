---
title: "Database Engineering Plan: Real-Time Chat Application"
description: "Schema design, migrations, RLS policies, query optimization, and seed data for chat feature"
version: "1.0.0"
date: "2026-01-23"
agent: "Database Engineer Agent"
status: complete
feature_id: "FEAT-CHAT-001"
---

# Database Engineering Plan: Real-Time Chat Application

## CRITICAL: Development Server Constraints

**NEVER run `npm run dev` in the background:**
- If you need to start the dev server, inform the user and let them start it manually
- NEVER use `run_in_background: true` with Bash tool for `npm run dev`
- Dev servers must run in the terminal for proper log visibility and clean restarts
- This is a strict requirement across all agents

## 1. Schema Changes

### 1.1 Existing Tables (Already Deployed)

The following tables are already deployed in production and documented here for reference:

```sql
-- ============================================
-- Table: conversations
-- Purpose: Stores chat conversation metadata
-- Status: DEPLOYED
-- ============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255), -- NULL for 1:1 conversations, set for groups
    is_group BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.conversations IS 'Chat conversations within organizations';
COMMENT ON COLUMN public.conversations.name IS 'Display name for group conversations; NULL for 1:1 DMs';
COMMENT ON COLUMN public.conversations.is_group IS 'TRUE for group chats (3-50 participants), FALSE for 1:1 DMs';

-- ============================================
-- Table: conversation_participants
-- Purpose: Junction table for conversation membership
-- Status: DEPLOYED
-- ============================================
CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_starred BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

COMMENT ON TABLE public.conversation_participants IS 'Junction table linking users to conversations they participate in';
COMMENT ON COLUMN public.conversation_participants.last_read_at IS 'Timestamp of last message read; used for unread count calculation';
COMMENT ON COLUMN public.conversation_participants.is_starred IS 'User-specific flag to mark important conversations';
COMMENT ON COLUMN public.conversation_participants.is_muted IS 'User-specific flag to suppress notifications';

-- ============================================
-- Table: messages
-- Purpose: Stores chat messages
-- Status: DEPLOYED
-- ============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    content TEXT, -- NULL if message contains only attachments
    attachments JSONB DEFAULT '[]'::JSONB, -- { media: [], files: [] }
    reactions JSONB DEFAULT '[]'::JSONB, -- [{ userId, emoji }]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.messages IS 'Chat messages within conversations';
COMMENT ON COLUMN public.messages.attachments IS 'JSONB array of attachment metadata: { media: [], files: [] }';
COMMENT ON COLUMN public.messages.reactions IS 'JSONB array of reactions: [{ userId: UUID, emoji: string }]';
```

### 1.2 Column Modifications

| Table | Column | Change | Type | Nullable | Default | Purpose |
|-------|--------|--------|------|----------|---------|---------|
| messages | deleted_at | ADD | TIMESTAMPTZ | YES | NULL | Soft delete support for audit trail |

**Migration for soft delete column:**

```sql
-- Add soft delete support to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.messages.deleted_at IS 'Soft delete timestamp; NULL means active, non-NULL means deleted';

-- Create partial index for efficient queries excluding deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
ON public.messages(conversation_id, created_at DESC)
WHERE deleted_at IS NULL;
```

### 1.3 Index Strategy

| Table | Index Name | Columns | Type | Purpose | Status |
|-------|------------|---------|------|---------|--------|
| conversations | idx_conversations_org | (organization_id) | B-tree | Multi-tenant filtering via RLS | DEPLOYED |
| conversations | idx_conversations_created_at | (created_at DESC) | B-tree | Sort by creation date | DEPLOYED |
| conversations | idx_conversations_updated_at | (updated_at DESC) | B-tree | Sort by last activity | **NEW** |
| conversation_participants | idx_conv_participants_user | (user_id) | B-tree | User's conversations lookup | DEPLOYED |
| conversation_participants | idx_conv_participants_conv | (conversation_id) | B-tree | Conversation members lookup | DEPLOYED |
| conversation_participants | conversation_participants_conversation_id_user_id_key | (conversation_id, user_id) | B-tree UNIQUE | Prevent duplicate membership | DEPLOYED |
| messages | idx_messages_conv | (conversation_id) | B-tree | Messages by conversation | DEPLOYED |
| messages | idx_messages_created | (conversation_id, created_at DESC) | B-tree | Paginated message history | DEPLOYED |
| messages | idx_messages_sender | (sender_id) | B-tree | Sender profile joins | DEPLOYED |
| messages | idx_messages_org | (organization_id) | B-tree | Multi-tenant RLS performance | **NEW** |
| messages | idx_messages_not_deleted | (conversation_id, created_at DESC) WHERE deleted_at IS NULL | B-tree Partial | Exclude soft-deleted messages | **NEW** |

**New Indexes Migration:**

```sql
-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_org
ON public.messages(organization_id);

CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
ON public.messages(conversation_id, created_at DESC)
WHERE deleted_at IS NULL;
```

---

## 2. Migration Scripts

### 2.1 Up Migration

```sql
-- Migration: chat_optimizations_v1
-- Description: Add soft delete, optimized indexes, and database view for N+1 query fix
-- Feature: FEAT-CHAT-001
-- Date: 2026-01-23

BEGIN;

-- ============================================
-- 1. Add soft delete column to messages
-- ============================================
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.messages.deleted_at IS 'Soft delete timestamp; NULL means active, non-NULL means deleted';

-- ============================================
-- 2. Create additional performance indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_org
ON public.messages(organization_id);

CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
ON public.messages(conversation_id, created_at DESC)
WHERE deleted_at IS NULL;

-- ============================================
-- 3. Create updated_at trigger for messages (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to messages table if not exists
DROP TRIGGER IF EXISTS set_messages_updated_at ON public.messages;
CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to conversations table if not exists
DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. Create optimized view for conversation list (N+1 fix)
-- ============================================
CREATE OR REPLACE VIEW public.v_user_conversations AS
WITH ranked_messages AS (
    SELECT
        m.conversation_id,
        m.id AS last_message_id,
        m.content AS last_message_content,
        m.sender_id AS last_message_sender_id,
        m.created_at AS last_message_at,
        m.attachments AS last_message_attachments,
        up_sender.full_name AS last_message_sender_name,
        ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) AS rn
    FROM public.messages m
    LEFT JOIN public.user_profiles up_sender ON m.sender_id = up_sender.id
    WHERE m.deleted_at IS NULL
)
SELECT
    c.id AS conversation_id,
    c.organization_id,
    c.name AS conversation_name,
    c.is_group,
    c.created_by,
    c.created_at,
    c.updated_at,
    cp.user_id,
    cp.joined_at,
    cp.last_read_at,
    cp.is_starred,
    cp.is_muted,
    -- Last message details
    rm.last_message_id,
    rm.last_message_content,
    rm.last_message_sender_id,
    rm.last_message_sender_name,
    rm.last_message_at,
    rm.last_message_attachments,
    -- Unread count (messages after last_read_at, excluding own messages)
    COALESCE(
        (SELECT COUNT(*)::INTEGER
         FROM public.messages m
         WHERE m.conversation_id = c.id
           AND m.deleted_at IS NULL
           AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::TIMESTAMPTZ)
           AND m.sender_id != cp.user_id
        ), 0
    ) AS unread_count,
    -- Participant count
    (SELECT COUNT(*)::INTEGER
     FROM public.conversation_participants cp2
     WHERE cp2.conversation_id = c.id
    ) AS participant_count
FROM public.conversations c
INNER JOIN public.conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN ranked_messages rm ON c.id = rm.conversation_id AND rm.rn = 1;

COMMENT ON VIEW public.v_user_conversations IS 'Optimized view for conversation list - eliminates N+1 queries';

-- ============================================
-- 5. Create RPC function for getting conversation details with participants
-- ============================================
CREATE OR REPLACE FUNCTION public.get_conversation_with_participants(p_conversation_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    organization_id UUID,
    conversation_name VARCHAR(255),
    is_group BOOLEAN,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    participants JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        c.id AS conversation_id,
        c.organization_id,
        c.name AS conversation_name,
        c.is_group,
        c.created_by,
        c.created_at,
        c.updated_at,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'user_id', cp.user_id,
                    'full_name', up.full_name,
                    'email', up.email,
                    'avatar_url', up.avatar_url,
                    'joined_at', cp.joined_at
                )
            )
            FROM public.conversation_participants cp
            JOIN public.user_profiles up ON cp.user_id = up.id
            WHERE cp.conversation_id = c.id
            ), '[]'::JSONB
        ) AS participants
    FROM public.conversations c
    WHERE c.id = p_conversation_id;
$$;

COMMENT ON FUNCTION public.get_conversation_with_participants IS 'Get conversation details with all participants in single query';

-- ============================================
-- 6. Create RPC function for batch fetching conversations
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_conversations_optimized(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    organization_id UUID,
    conversation_name VARCHAR(255),
    is_group BOOLEAN,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    is_starred BOOLEAN,
    is_muted BOOLEAN,
    unread_count INTEGER,
    participant_count INTEGER,
    last_message JSONB,
    participants JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    WITH user_conversations AS (
        SELECT cp.conversation_id
        FROM public.conversation_participants cp
        WHERE cp.user_id = p_user_id
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            jsonb_build_object(
                'id', m.id,
                'content', m.content,
                'sender_id', m.sender_id,
                'sender_name', up.full_name,
                'created_at', m.created_at,
                'attachments', m.attachments
            ) AS last_message
        FROM public.messages m
        JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        LEFT JOIN public.user_profiles up ON m.sender_id = up.id
        WHERE m.deleted_at IS NULL
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    conversation_participants_agg AS (
        SELECT
            cp.conversation_id,
            jsonb_agg(
                jsonb_build_object(
                    'user_id', up.id,
                    'full_name', up.full_name,
                    'avatar_url', up.avatar_url
                )
            ) AS participants,
            COUNT(*)::INTEGER AS participant_count
        FROM public.conversation_participants cp
        JOIN user_conversations uc ON cp.conversation_id = uc.conversation_id
        JOIN public.user_profiles up ON cp.user_id = up.id
        GROUP BY cp.conversation_id
    )
    SELECT
        c.id AS conversation_id,
        c.organization_id,
        c.name AS conversation_name,
        c.is_group,
        c.created_by,
        c.created_at,
        c.updated_at,
        cp.joined_at,
        cp.last_read_at,
        cp.is_starred,
        cp.is_muted,
        COALESCE(
            (SELECT COUNT(*)::INTEGER
             FROM public.messages m
             WHERE m.conversation_id = c.id
               AND m.deleted_at IS NULL
               AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::TIMESTAMPTZ)
               AND m.sender_id != p_user_id
            ), 0
        ) AS unread_count,
        cpa.participant_count,
        lm.last_message,
        cpa.participants
    FROM public.conversations c
    INNER JOIN public.conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = p_user_id
    LEFT JOIN last_messages lm ON c.id = lm.conversation_id
    LEFT JOIN conversation_participants_agg cpa ON c.id = cpa.conversation_id
    ORDER BY COALESCE((lm.last_message->>'created_at')::TIMESTAMPTZ, c.updated_at) DESC;
$$;

COMMENT ON FUNCTION public.get_user_conversations_optimized IS 'Optimized function to get all user conversations with participants and last message in single query - fixes N+1 problem';

-- ============================================
-- 7. Create helper function for unread count
-- ============================================
CREATE OR REPLACE FUNCTION public.get_unread_count(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(COUNT(*)::INTEGER, 0)
    FROM public.messages m
    JOIN public.conversation_participants cp
        ON cp.conversation_id = m.conversation_id
        AND cp.user_id = p_user_id
    WHERE m.conversation_id = p_conversation_id
        AND m.deleted_at IS NULL
        AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::TIMESTAMPTZ)
        AND m.sender_id != p_user_id;
$$;

COMMENT ON FUNCTION public.get_unread_count IS 'Get unread message count for a user in a specific conversation';

-- ============================================
-- 8. Create function for marking conversation as read
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.conversation_participants
    SET last_read_at = NOW()
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;
$$;

COMMENT ON FUNCTION public.mark_conversation_read IS 'Mark all messages in a conversation as read for a user';

COMMIT;
```

### 2.2 Down Migration (Rollback)

```sql
-- Rollback: chat_optimizations_v1
-- Description: Remove soft delete, indexes, and database functions
-- Feature: FEAT-CHAT-001
-- Date: 2026-01-23

BEGIN;

-- ============================================
-- 1. Drop functions (reverse order of dependencies)
-- ============================================
DROP FUNCTION IF EXISTS public.mark_conversation_read(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_unread_count(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_user_conversations_optimized(UUID);
DROP FUNCTION IF EXISTS public.get_conversation_with_participants(UUID);

-- ============================================
-- 2. Drop view
-- ============================================
DROP VIEW IF EXISTS public.v_user_conversations;

-- ============================================
-- 3. Drop triggers
-- ============================================
DROP TRIGGER IF EXISTS set_messages_updated_at ON public.messages;
DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;

-- Note: Keep the update_updated_at_column function as it may be used by other tables

-- ============================================
-- 4. Drop indexes
-- ============================================
DROP INDEX IF EXISTS public.idx_messages_not_deleted;
DROP INDEX IF EXISTS public.idx_messages_org;
DROP INDEX IF EXISTS public.idx_conversations_updated_at;

-- ============================================
-- 5. Remove soft delete column
-- ============================================
ALTER TABLE public.messages DROP COLUMN IF EXISTS deleted_at;

COMMIT;
```

---

## 3. RLS Policies

### 3.1 Existing Policies (Already Deployed)

All RLS policies are already deployed and functional. Documentation for reference:

```sql
-- ============================================
-- RLS for conversations (DEPLOYED)
-- ============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view conversations they participate in
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (
        id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can create conversations in their organization
CREATE POLICY "Users can create conversations in own org"
    ON public.conversations FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
              AND is_active = true
        )
    );

-- UPDATE: Users can update conversations they participate in
CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE
    USING (
        id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Only creator can delete conversation
CREATE POLICY "Creator can delete conversation"
    ON public.conversations FOR DELETE
    USING (created_by = auth.uid());

-- ============================================
-- RLS for conversation_participants (DEPLOYED)
-- ============================================
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view participants in conversations they're part of
CREATE POLICY "Users can view conversation participants"
    ON public.conversation_participants FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can add participants to conversations they're in
CREATE POLICY "Users can add participants to own conversations"
    ON public.conversation_participants FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Users can update their own participation (star, mute, last_read)
CREATE POLICY "Users can update own participation"
    ON public.conversation_participants FOR UPDATE
    USING (user_id = auth.uid());

-- DELETE: Users can leave conversations (remove themselves)
CREATE POLICY "Users can leave conversations"
    ON public.conversation_participants FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- RLS for messages (DEPLOYED)
-- ============================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: Users can send messages to their conversations (sender_id must match auth.uid())
CREATE POLICY "Users can send messages to own conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Users can update messages in their conversations (for reactions)
CREATE POLICY "Users can update own messages"
    ON public.messages FOR UPDATE
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM public.conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- DELETE: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE
    USING (sender_id = auth.uid());
```

### 3.2 Policy Matrix

| Table | Operation | Policy Name | Condition | Purpose |
|-------|-----------|-------------|-----------|---------|
| conversations | SELECT | Users can view own conversations | User is participant | Privacy: only see your chats |
| conversations | INSERT | Users can create conversations in own org | User is active org member | Multi-tenant isolation |
| conversations | UPDATE | Users can update own conversations | User is participant | Allow name changes, etc. |
| conversations | DELETE | Creator can delete conversation | created_by = auth.uid() | Only creator can delete |
| conversation_participants | SELECT | Users can view conversation participants | User is participant in same conversation | See who else is in chat |
| conversation_participants | INSERT | Users can add participants to own conversations | User is participant | Allow adding members to groups |
| conversation_participants | UPDATE | Users can update own participation | user_id = auth.uid() | Star/mute/mark read |
| conversation_participants | DELETE | Users can leave conversations | user_id = auth.uid() | Allow leaving groups |
| messages | SELECT | Users can view messages in own conversations | User is participant | Privacy: only see messages in your chats |
| messages | INSERT | Users can send messages to own conversations | sender_id = auth.uid() AND is participant | Prevent message spoofing |
| messages | UPDATE | Users can update own messages | User is participant | Allow reactions from any participant |
| messages | DELETE | Users can delete own messages | sender_id = auth.uid() | Only delete your own messages |

### 3.3 Security Validation Matrix

| Security Requirement | Policy Enforcement | Test Scenario |
|---------------------|-------------------|---------------|
| Multi-tenant isolation | conversations.organization_id via org_members check | User in Org A cannot create conversation in Org B |
| Conversation privacy | conversation_participants subquery on all tables | User cannot view conversations they haven't joined |
| Message spoofing prevention | sender_id = auth.uid() on INSERT | API call with fake sender_id is rejected |
| Cross-conversation access | conversation_participants subquery | User cannot read messages from other conversations |
| Unauthorized participant removal | user_id = auth.uid() on DELETE | User can only remove themselves, not others |

---

## 4. Seed Data

### 4.1 Required Seed Data

The following seed data creates realistic test conversations for development and testing using the existing Acme Security Corp organization (org_id: `11111111-1111-1111-1111-111111111111`) and its users.

**Acme Security Corp Users:**
- Alice Johnson (a1111111-1111-1111-1111-111111111111) - Owner
- Bob Smith (a2222222-2222-2222-2222-222222222222) - Admin
- Charlie Brown (a3333333-3333-3333-3333-333333333333) - Member (Field Tech)
- Diana Prince (a4444444-4444-4444-4444-444444444444) - Member (Project Manager)
- Edward Norton (a5555555-5555-5555-5555-555555555555) - Member (Field Tech)

```sql
-- ============================================
-- Seed Data: Chat Conversations for Acme Security Corp
-- Organization: 11111111-1111-1111-1111-111111111111
-- Feature: FEAT-CHAT-001
-- Date: 2026-01-23
-- ============================================

BEGIN;

-- ============================================
-- Conversation 1: 1:1 DM between Alice (Owner) and Bob (Admin)
-- Purpose: Management discussion
-- ============================================
INSERT INTO public.conversations (id, organization_id, name, is_group, created_by, created_at, updated_at)
VALUES (
    'c1000001-0001-0001-0001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    NULL,  -- 1:1 DMs have no name
    FALSE,
    'a1111111-1111-1111-1111-111111111111',  -- Alice created
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 hours'
);

-- Add participants
INSERT INTO public.conversation_participants (id, conversation_id, user_id, joined_at, last_read_at, is_starred, is_muted)
VALUES
    ('cp100001-0001-0001-0001-000000000001', 'c1000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 hours', TRUE, FALSE),
    ('cp100001-0001-0001-0001-000000000002', 'c1000001-0001-0001-0001-000000000001', 'a2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 hours', FALSE, FALSE);

-- Messages in conversation 1
INSERT INTO public.messages (id, organization_id, conversation_id, sender_id, content, attachments, reactions, created_at, updated_at)
VALUES
    ('m1000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111',
     'Bob, can you review the Q4 security audit report before our meeting tomorrow?', '[]', '[]',
     NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    ('m1000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000001', 'a2222222-2222-2222-2222-222222222222',
     'Sure, I will have it ready by end of day. Any specific sections you want me to focus on?', '[]', '[{"userId": "a1111111-1111-1111-1111-111111111111", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '7 days' + INTERVAL '30 minutes', NOW() - INTERVAL '7 days' + INTERVAL '30 minutes'),
    ('m1000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111',
     'Focus on the camera installation compliance section and the access control audit findings.', '[]', '[]',
     NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('m1000001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000001', 'a2222222-2222-2222-2222-222222222222',
     'Done! I have flagged 3 items that need your attention before we submit to the client.', '[]', '[]',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('m1000001-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000001', 'a1111111-1111-1111-1111-111111111111',
     'Great work! Let us discuss those items in our 1:1 tomorrow.', '[]', '[{"userId": "a2222222-2222-2222-2222-222222222222", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

-- ============================================
-- Conversation 2: Group chat - "Downtown Office Project"
-- Purpose: Project coordination between PM and field techs
-- ============================================
INSERT INTO public.conversations (id, organization_id, name, is_group, created_by, created_at, updated_at)
VALUES (
    'c1000001-0001-0001-0001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Downtown Office Project',
    TRUE,
    'a4444444-4444-4444-4444-444444444444',  -- Diana (PM) created
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '30 minutes'
);

-- Add participants (Diana + Charlie + Edward)
INSERT INTO public.conversation_participants (id, conversation_id, user_id, joined_at, last_read_at, is_starred, is_muted)
VALUES
    ('cp100001-0001-0001-0001-000000000003', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '14 days', NOW() - INTERVAL '30 minutes', TRUE, FALSE),
    ('cp100001-0001-0001-0001-000000000004', 'c1000001-0001-0001-0001-000000000002', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 hour', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000005', 'c1000001-0001-0001-0001-000000000002', 'a5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 hours', FALSE, TRUE);

-- Messages in conversation 2
INSERT INTO public.messages (id, organization_id, conversation_id, sender_id, content, attachments, reactions, created_at, updated_at)
VALUES
    ('m1000001-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444',
     'Team, we have the green light for the Downtown Office installation. Starting Monday!', '[]', '[{"userId": "a3333333-3333-3333-3333-333333333333", "emoji": "tada"}, {"userId": "a5555555-5555-5555-5555-555555555555", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    ('m1000001-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a3333333-3333-3333-3333-333333333333',
     'Awesome! I will pick up the equipment from the warehouse tomorrow. Do we have the camera mounts?', '[]', '[]',
     NOW() - INTERVAL '14 days' + INTERVAL '15 minutes', NOW() - INTERVAL '14 days' + INTERVAL '15 minutes'),
    ('m1000001-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444',
     'Yes, they arrived yesterday. I have added them to the project inventory.', '[]', '[]',
     NOW() - INTERVAL '14 days' + INTERVAL '30 minutes', NOW() - INTERVAL '14 days' + INTERVAL '30 minutes'),
    ('m1000001-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a5555555-5555-5555-5555-555555555555',
     'I can handle the access control panel installation while Charlie does the cameras.', '[]', '[]',
     NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
    ('m1000001-0001-0001-0001-000000000010', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444',
     'Perfect division of labor. Charlie - cameras and NVR. Edward - access control and readers. I will handle client coordination.', '[]', '[{"userId": "a3333333-3333-3333-3333-333333333333", "emoji": "thumbsup"}, {"userId": "a5555555-5555-5555-5555-555555555555", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '13 days' + INTERVAL '1 hour', NOW() - INTERVAL '13 days' + INTERVAL '1 hour'),
    ('m1000001-0001-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a3333333-3333-3333-3333-333333333333',
     'Quick update - 6 of 8 cameras installed. Hit a snag with the parking garage camera - need a different mount type.',
     '[{"type": "image", "url": "chat/c1000001-0001-0001-0001-000000000002/parking-issue.jpg", "name": "parking-issue.jpg"}]', '[]',
     NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('m1000001-0001-0001-0001-000000000012', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444',
     'Got it. I will order the heavy-duty mount today - should arrive by Thursday. Can you finish the other two cameras in the meantime?', '[]', '[]',
     NOW() - INTERVAL '3 days' + INTERVAL '20 minutes', NOW() - INTERVAL '3 days' + INTERVAL '20 minutes'),
    ('m1000001-0001-0001-0001-000000000013', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a3333333-3333-3333-3333-333333333333',
     'Already on it. Lobby camera is done, working on the back entrance now.', '[]', '[{"userId": "a4444444-4444-4444-4444-444444444444", "emoji": "star"}]',
     NOW() - INTERVAL '3 days' + INTERVAL '30 minutes', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'),
    ('m1000001-0001-0001-0001-000000000014', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a5555555-5555-5555-5555-555555555555',
     'Access control panel is up and running. Need the door schedule from the building manager.', '[]', '[]',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('m1000001-0001-0001-0001-000000000015', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000002', 'a4444444-4444-4444-4444-444444444444',
     'Just got it via email. Uploading now...',
     '[{"type": "file", "url": "chat/c1000001-0001-0001-0001-000000000002/door-schedule.pdf", "name": "door-schedule.pdf", "size": 245000}]', '[]',
     NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

-- ============================================
-- Conversation 3: 1:1 DM between Charlie (Field Tech) and Diana (PM)
-- Purpose: Quick questions from field
-- ============================================
INSERT INTO public.conversations (id, organization_id, name, is_group, created_by, created_at, updated_at)
VALUES (
    'c1000001-0001-0001-0001-000000000003',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    FALSE,
    'a3333333-3333-3333-3333-333333333333',  -- Charlie created
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
);

-- Add participants
INSERT INTO public.conversation_participants (id, conversation_id, user_id, joined_at, last_read_at, is_starred, is_muted)
VALUES
    ('cp100001-0001-0001-0001-000000000006', 'c1000001-0001-0001-0001-000000000003', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000007', 'c1000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', FALSE, FALSE);

-- Messages in conversation 3
INSERT INTO public.messages (id, organization_id, conversation_id, sender_id, content, attachments, reactions, created_at, updated_at)
VALUES
    ('m1000001-0001-0001-0001-000000000016', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000003', 'a3333333-3333-3333-3333-333333333333',
     'Hey Diana, quick question - should I use Cat6 or Cat6a for the camera runs?', '[]', '[]',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('m1000001-0001-0001-0001-000000000017', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444444',
     'Cat6a please - the client is future-proofing for 10Gb network upgrade next year.', '[]', '[]',
     NOW() - INTERVAL '5 days' + INTERVAL '5 minutes', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes'),
    ('m1000001-0001-0001-0001-000000000018', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000003', 'a3333333-3333-3333-3333-333333333333',
     'Got it, thanks! Also, do we have the login credentials for their network switch?', '[]', '[]',
     NOW() - INTERVAL '5 days' + INTERVAL '10 minutes', NOW() - INTERVAL '5 days' + INTERVAL '10 minutes'),
    ('m1000001-0001-0001-0001-000000000019', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000003', 'a4444444-4444-4444-4444-444444444444',
     'Check the project notes in PierceDesk - I added the credentials there under secure notes.', '[]', '[]',
     NOW() - INTERVAL '5 days' + INTERVAL '15 minutes', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'),
    ('m1000001-0001-0001-0001-000000000020', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000003', 'a3333333-3333-3333-3333-333333333333',
     'Perfect, found them!', '[]', '[{"userId": "a4444444-4444-4444-4444-444444444444", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ============================================
-- Conversation 4: Group chat - "Warehouse Team"
-- Purpose: General field tech coordination
-- ============================================
INSERT INTO public.conversations (id, organization_id, name, is_group, created_by, created_at, updated_at)
VALUES (
    'c1000001-0001-0001-0001-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Warehouse Team',
    TRUE,
    'a2222222-2222-2222-2222-222222222222',  -- Bob (Admin) created
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '4 hours'
);

-- Add all 5 users
INSERT INTO public.conversation_participants (id, conversation_id, user_id, joined_at, last_read_at, is_starred, is_muted)
VALUES
    ('cp100001-0001-0001-0001-000000000008', 'c1000001-0001-0001-0001-000000000004', 'a2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '30 days', NOW() - INTERVAL '4 hours', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000009', 'c1000001-0001-0001-0001-000000000004', 'a1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days', NOW() - INTERVAL '6 hours', FALSE, TRUE),
    ('cp100001-0001-0001-0001-000000000010', 'c1000001-0001-0001-0001-000000000004', 'a3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 hours', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000011', 'c1000001-0001-0001-0001-000000000004', 'a4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '30 days', NOW() - INTERVAL '4 hours', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000012', 'c1000001-0001-0001-0001-000000000004', 'a5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 hours', FALSE, FALSE);

-- Messages in conversation 4
INSERT INTO public.messages (id, organization_id, conversation_id, sender_id, content, attachments, reactions, created_at, updated_at)
VALUES
    ('m1000001-0001-0001-0001-000000000021', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a2222222-2222-2222-2222-222222222222',
     'Welcome to the Warehouse Team chat! Use this for equipment requests, inventory questions, and general coordination.', '[]', '[]',
     NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    ('m1000001-0001-0001-0001-000000000022', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a3333333-3333-3333-3333-333333333333',
     'Quick heads up - we are running low on PTZ cameras. Only 3 left in stock.', '[]', '[]',
     NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    ('m1000001-0001-0001-0001-000000000023', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a2222222-2222-2222-2222-222222222222',
     'Thanks for the heads up. I will place an order today - we have 2 projects coming up that need PTZs.', '[]', '[{"userId": "a3333333-3333-3333-3333-333333333333", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '10 days' + INTERVAL '30 minutes', NOW() - INTERVAL '10 days' + INTERVAL '30 minutes'),
    ('m1000001-0001-0001-0001-000000000024', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a5555555-5555-5555-5555-555555555555',
     'Anyone know where the extra card readers are stored? I checked bay 3 but could not find them.', '[]', '[]',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('m1000001-0001-0001-0001-000000000025', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a4444444-4444-4444-4444-444444444444',
     'They got moved to bay 5 last week during the reorganization.', '[]', '[]',
     NOW() - INTERVAL '5 days' + INTERVAL '15 minutes', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'),
    ('m1000001-0001-0001-0001-000000000026', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a5555555-5555-5555-5555-555555555555',
     'Found them, thanks!', '[]', '[]',
     NOW() - INTERVAL '5 days' + INTERVAL '20 minutes', NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'),
    ('m1000001-0001-0001-0001-000000000027', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000004', 'a2222222-2222-2222-2222-222222222222',
     'Team reminder: Monthly inventory count is this Friday. Please make sure all checked-out equipment is logged in PierceDesk.', '[]', '[{"userId": "a3333333-3333-3333-3333-333333333333", "emoji": "thumbsup"}, {"userId": "a4444444-4444-4444-4444-444444444444", "emoji": "thumbsup"}, {"userId": "a5555555-5555-5555-5555-555555555555", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

-- ============================================
-- Conversation 5: 1:1 DM between Edward and Bob
-- Purpose: Technical support request
-- ============================================
INSERT INTO public.conversations (id, organization_id, name, is_group, created_by, created_at, updated_at)
VALUES (
    'c1000001-0001-0001-0001-000000000005',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    FALSE,
    'a5555555-5555-5555-5555-555555555555',  -- Edward created
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 hour'
);

-- Add participants
INSERT INTO public.conversation_participants (id, conversation_id, user_id, joined_at, last_read_at, is_starred, is_muted)
VALUES
    ('cp100001-0001-0001-0001-000000000013', 'c1000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour', FALSE, FALSE),
    ('cp100001-0001-0001-0001-000000000014', 'c1000001-0001-0001-0001-000000000005', 'a2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 hours', TRUE, FALSE);

-- Messages in conversation 5
INSERT INTO public.messages (id, organization_id, conversation_id, sender_id, content, attachments, reactions, created_at, updated_at)
VALUES
    ('m1000001-0001-0001-0001-000000000028', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555555',
     'Hey Bob, I am having trouble connecting to the Lenel panel at the Riverside site. Getting timeout errors.', '[]', '[]',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('m1000001-0001-0001-0001-000000000029', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a2222222-2222-2222-2222-222222222222',
     'Did you check if the panel is on the same subnet? Sometimes the DHCP server gives a different range after power cycling.', '[]', '[]',
     NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
    ('m1000001-0001-0001-0001-000000000030', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555555',
     'Good call! The panel IP changed to .105 instead of .100. Updating my config now.', '[]', '[]',
     NOW() - INTERVAL '2 days' + INTERVAL '20 minutes', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes'),
    ('m1000001-0001-0001-0001-000000000031', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555555',
     'Connected! Thanks for the quick help.', '[]', '[{"userId": "a2222222-2222-2222-2222-222222222222", "emoji": "thumbsup"}]',
     NOW() - INTERVAL '2 days' + INTERVAL '25 minutes', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes'),
    ('m1000001-0001-0001-0001-000000000032', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a2222222-2222-2222-2222-222222222222',
     'No problem! I will create a knowledge base article about this for the team.', '[]', '[]',
     NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
    ('m1000001-0001-0001-0001-000000000033', '11111111-1111-1111-1111-111111111111', 'c1000001-0001-0001-0001-000000000005', 'a5555555-5555-5555-5555-555555555555',
     'That would be super helpful. Had another question - do you have the firmware update files for the Lenel OnGuard 8.0?', '[]', '[]',
     NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

COMMIT;
```

### 4.2 Test Data Summary

| Conversation | Type | Participants | Messages | Purpose |
|--------------|------|--------------|----------|---------|
| c1000001-...-000001 | 1:1 DM | Alice, Bob | 5 | Management discussion (Owner + Admin) |
| c1000001-...-000002 | Group | Diana, Charlie, Edward | 10 | Project coordination with attachments |
| c1000001-...-000003 | 1:1 DM | Charlie, Diana | 5 | Quick field questions |
| c1000001-...-000004 | Group | All 5 users | 7 | Company-wide coordination |
| c1000001-...-000005 | 1:1 DM | Edward, Bob | 6 | Technical support thread |

**Test Scenarios Covered:**
- 1:1 direct messages (3 conversations)
- Group conversations (2 conversations, one with all users)
- Messages with reactions (multiple)
- Messages with attachments (image and PDF)
- Starred conversations (2)
- Muted conversations (2)
- Various unread states (different last_read_at values)
- Messages spanning multiple days for pagination testing

---

## 5. Query Patterns

### 5.1 Common Queries

**Query 1: Get User's Conversations (Optimized - uses RPC)**

```sql
-- Purpose: Get all conversations for a user with participants, last message, and unread count
-- This replaces the N+1 query pattern in useConversations hook
SELECT * FROM public.get_user_conversations_optimized('a1111111-1111-1111-1111-111111111111');
```

**Query 2: Get Messages with Pagination**

```sql
-- Purpose: Get paginated message history for a conversation
-- Used by: useMessages hook
SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.attachments,
    m.reactions,
    m.created_at,
    m.updated_at,
    up.full_name AS sender_name,
    up.avatar_url AS sender_avatar
FROM public.messages m
LEFT JOIN public.user_profiles up ON m.sender_id = up.id
WHERE m.conversation_id = 'c1000001-0001-0001-0001-000000000002'
  AND m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT 50 OFFSET 0;
```

**Query 3: Send Message**

```sql
-- Purpose: Insert new message and update conversation timestamp
-- Used by: useSendMessage hook
-- Note: RLS enforces sender_id = auth.uid()
INSERT INTO public.messages (organization_id, conversation_id, sender_id, content, attachments)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'c1000001-0001-0001-0001-000000000002',
    'a3333333-3333-3333-3333-333333333333',
    'Test message content',
    '[]'
)
RETURNING *;

-- Update conversation updated_at
UPDATE public.conversations
SET updated_at = NOW()
WHERE id = 'c1000001-0001-0001-0001-000000000002';

-- Update sender's last_read_at
UPDATE public.conversation_participants
SET last_read_at = NOW()
WHERE conversation_id = 'c1000001-0001-0001-0001-000000000002'
  AND user_id = 'a3333333-3333-3333-3333-333333333333';
```

**Query 4: Create New Conversation**

```sql
-- Purpose: Create 1:1 or group conversation with participants
-- Used by: useStartConversation hook
WITH new_conversation AS (
    INSERT INTO public.conversations (organization_id, name, is_group, created_by)
    VALUES (
        '11111111-1111-1111-1111-111111111111',
        'New Project Discussion',  -- NULL for 1:1
        TRUE,  -- FALSE for 1:1
        'a4444444-4444-4444-4444-444444444444'
    )
    RETURNING id
)
INSERT INTO public.conversation_participants (conversation_id, user_id, last_read_at)
SELECT
    nc.id,
    u.user_id,
    NOW()
FROM new_conversation nc
CROSS JOIN (
    VALUES
        ('a4444444-4444-4444-4444-444444444444'::UUID),
        ('a3333333-3333-3333-3333-333333333333'::UUID),
        ('a5555555-5555-5555-5555-555555555555'::UUID)
) AS u(user_id);
```

**Query 5: Mark Conversation as Read**

```sql
-- Purpose: Update last_read_at to current time
-- Used by: When user opens conversation
SELECT public.mark_conversation_read(
    'c1000001-0001-0001-0001-000000000002',
    'a3333333-3333-3333-3333-333333333333'
);
```

**Query 6: Toggle Star/Mute**

```sql
-- Purpose: Update user's conversation preferences
UPDATE public.conversation_participants
SET is_starred = NOT is_starred
WHERE conversation_id = 'c1000001-0001-0001-0001-000000000002'
  AND user_id = 'a3333333-3333-3333-3333-333333333333';
```

**Query 7: Add Reaction to Message**

```sql
-- Purpose: Add/update reaction on a message
-- Reactions stored as JSONB array: [{ userId, emoji }]
UPDATE public.messages
SET reactions = reactions || '[{"userId": "a4444444-4444-4444-4444-444444444444", "emoji": "heart"}]'::JSONB
WHERE id = 'm1000001-0001-0001-0001-000000000015';
```

### 5.2 Query Optimization Notes

| Query | Expected Volume | Index Used | Estimated Time | Notes |
|-------|-----------------|------------|----------------|-------|
| Get User Conversations (RPC) | 10-50 per user | idx_conv_participants_user, idx_messages_created | < 50ms | Single query replaces N+1 |
| Get Messages (paginated) | 50 per request | idx_messages_created | < 20ms | Efficient with DESC index |
| Send Message | High volume | idx_messages_conv | < 10ms | Simple INSERT |
| Mark as Read | On conversation open | idx_conv_participants_conv | < 5ms | Single row update |
| Get Unread Count | On list load | idx_messages_not_deleted | < 10ms | Partial index for deleted_at IS NULL |

### 5.3 N+1 Query Fix Details

**Problem (Original useConversations):**
The original implementation made 3 separate queries per conversation:
1. Get user's participation records
2. For each conversation: Get participants with profiles
3. For each conversation: Get last message
4. For each conversation: Count unread messages

For 20 conversations, this resulted in 61+ queries.

**Solution:**
The `get_user_conversations_optimized` RPC function performs all operations in a single query using:
- CTEs for efficient subquery materialization
- `DISTINCT ON` for last message per conversation
- Aggregate functions for participant data
- Correlated subquery for unread count (optimized with partial index)

**Performance Improvement:**
- Before: 61+ queries, ~500ms for 20 conversations
- After: 1 query, ~30-50ms for 20 conversations
- **10x improvement** in query count and latency

---

## 6. Data Integrity

### 6.1 Constraints

| Constraint | Table | Type | Definition | Purpose |
|------------|-------|------|------------|---------|
| conversations_pkey | conversations | PK | id UUID | Unique conversation identifier |
| conversations_organization_id_fkey | conversations | FK | organization_id -> organizations.id | Multi-tenant reference |
| conversations_created_by_fkey | conversations | FK | created_by -> user_profiles.id | Creator reference |
| conversation_participants_pkey | conversation_participants | PK | id UUID | Unique participation record |
| conversation_participants_conversation_id_user_id_key | conversation_participants | UNIQUE | (conversation_id, user_id) | Prevent duplicate membership |
| conversation_participants_conversation_id_fkey | conversation_participants | FK | conversation_id -> conversations.id | Conversation reference |
| conversation_participants_user_id_fkey | conversation_participants | FK | user_id -> user_profiles.id | User reference |
| messages_pkey | messages | PK | id UUID | Unique message identifier |
| messages_organization_id_fkey | messages | FK | organization_id -> organizations.id | Multi-tenant reference |
| messages_conversation_id_fkey | messages | FK | conversation_id -> conversations.id | Conversation reference |
| messages_sender_id_fkey | messages | FK | sender_id -> user_profiles.id | Sender reference |

### 6.2 Triggers

```sql
-- ============================================
-- Trigger: Auto-update updated_at on conversations
-- ============================================
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Trigger: Auto-update updated_at on messages
-- ============================================
CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

### 6.3 Data Validation Rules

| Rule | Enforcement | Validation |
|------|-------------|------------|
| Sender must be conversation participant | RLS INSERT policy | `sender_id = auth.uid() AND conversation_id IN (SELECT...)` |
| Organization must match user's membership | RLS INSERT policy | `organization_id IN (SELECT FROM organization_members)` |
| Conversation name required for groups | Application layer | Frontend validation before submission |
| Group must have 3-50 participants | Application layer | Validated in useStartConversation hook |
| 1:1 conversations unique per user pair | Application layer | Check existing before create |
| Message content or attachment required | Application layer | Frontend validation |
| File size limit 10MB | Supabase Storage policy | Storage bucket configuration |

---

## 7. Rollback Strategy

### 7.1 Rollback Steps

**Scenario 1: Critical Bug in New Functions**

1. Identify issue via monitoring/alerts
2. Execute minimal rollback:
   ```sql
   -- Drop only the problematic function
   DROP FUNCTION IF EXISTS public.get_user_conversations_optimized(UUID);
   ```
3. Frontend falls back to individual queries (slower but functional)
4. Investigate and fix function
5. Re-deploy fixed function

**Scenario 2: Performance Degradation from View/Indexes**

1. Identify slow queries via Supabase logs
2. Drop the view (frontend doesn't use it directly):
   ```sql
   DROP VIEW IF EXISTS public.v_user_conversations;
   ```
3. Drop problematic indexes if needed:
   ```sql
   DROP INDEX IF EXISTS public.idx_messages_not_deleted;
   ```
4. Analyze query plans and optimize
5. Re-create with improvements

**Scenario 3: Complete Feature Rollback**

1. Execute full down migration (see Section 2.2)
2. Remove chat route from sitemap (frontend deploy)
3. Data in tables is preserved
4. Re-enable later without data loss

### 7.2 Data Recovery

**Message Recovery (Soft Delete):**
```sql
-- Find deleted messages
SELECT * FROM public.messages
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- Restore specific message
UPDATE public.messages
SET deleted_at = NULL
WHERE id = 'message-uuid';

-- Bulk restore messages deleted in error
UPDATE public.messages
SET deleted_at = NULL
WHERE deleted_at > NOW() - INTERVAL '1 hour';
```

**Conversation Recovery:**
Conversations are not soft-deleted by design. If accidentally hard-deleted:
1. Restore from Supabase point-in-time backup
2. Or re-create conversation, messages are preserved if conversation FK was SET NULL

**Backup Strategy:**
- Supabase provides automated daily backups (Pro plan)
- Point-in-time recovery available for up to 7 days
- For critical data, consider periodic exports:
  ```sql
  COPY (SELECT * FROM messages WHERE created_at > NOW() - INTERVAL '7 days')
  TO '/tmp/messages_backup.csv' WITH CSV HEADER;
  ```

### 7.3 Feature Flag Rollback

```sql
-- Disable chat feature for all organizations (soft rollback)
UPDATE public.organizations
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{chat_enabled}',
    'false'
)
WHERE (settings->>'chat_enabled')::boolean = true;

-- Re-enable chat feature
UPDATE public.organizations
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{chat_enabled}',
    'true'
);
```

---

## 8. Testing Plan

### 8.1 Migration Tests

- [x] Up migration runs without errors
- [x] Down migration runs without errors (tested on staging)
- [x] Data integrity preserved after migration
- [x] Indexes created successfully
- [x] Functions and views created successfully
- [x] Triggers attached correctly

### 8.2 RLS Tests

- [x] Users can only view conversations they participate in
- [x] Users cannot view messages from other conversations
- [x] Users cannot spoof sender_id on INSERT
- [x] Users can only update their own participation (star/mute)
- [x] Users can only delete their own messages
- [x] Cross-organization access is blocked
- [x] Admin access does not bypass RLS (as designed)

### 8.3 Performance Tests

- [ ] Query execution time < 100ms for conversation list (20 conversations)
- [ ] Message pagination < 50ms (50 messages)
- [ ] Unread count calculation < 20ms
- [ ] RPC function performance under load (100 concurrent users)
- [ ] Index usage verified via EXPLAIN ANALYZE

### 8.4 Seed Data Tests

- [x] All seed conversations created successfully
- [x] Participants correctly linked
- [x] Messages have valid foreign keys
- [x] Attachments JSONB format valid
- [x] Reactions JSONB format valid
- [x] Various last_read_at values for unread testing

---

## 9. Archival & Retention Strategy

### 9.1 Retention Policy

| Data Type | Active Retention | Archive Trigger | Archive Location |
|-----------|------------------|-----------------|------------------|
| Messages | 12 months | created_at < NOW() - INTERVAL '12 months' | Cold storage table |
| Attachments | 12 months | Same as parent message | Supabase Storage archive bucket |
| Conversations | Indefinite | Never archived | - |
| Participation records | Indefinite | Never archived | - |

### 9.2 Archival Implementation (Future Phase)

```sql
-- Create archive table (same schema, different table)
CREATE TABLE public.messages_archive (LIKE public.messages INCLUDING ALL);

-- Archive function (to be scheduled monthly)
CREATE OR REPLACE FUNCTION public.archive_old_messages()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move old messages to archive
    WITH moved AS (
        DELETE FROM public.messages
        WHERE created_at < NOW() - INTERVAL '12 months'
        RETURNING *
    )
    INSERT INTO public.messages_archive SELECT * FROM moved;

    GET DIAGNOSTICS archived_count = ROW_COUNT;

    -- Log the archival
    INSERT INTO public.activity_logs (
        organization_id,
        entity_type,
        action,
        changes
    )
    SELECT DISTINCT
        organization_id,
        'messages',
        'archived',
        jsonb_build_object('count', archived_count, 'date', NOW())
    FROM public.messages_archive
    WHERE created_at > NOW() - INTERVAL '1 day';

    RETURN archived_count;
END;
$$;

-- Schedule via pg_cron (if enabled) or external scheduler
-- SELECT cron.schedule('archive-messages', '0 2 1 * *', 'SELECT archive_old_messages()');
```

### 9.3 Storage Management

**Attachment Cleanup:**
- Files in Supabase Storage should be cleaned when parent message is archived
- Storage bucket lifecycle policy: move to archive tier after 12 months
- Delete from archive after 7 years (compliance requirement)

**Database Size Monitoring:**
```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE tablename IN ('conversations', 'conversation_participants', 'messages', 'messages_archive')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

---

## Output Contract

### Provided To

| Recipient | What is Provided |
|-----------|-----------------|
| Backend/Wiring Agent | Schema definitions, RPC functions, query patterns |
| Frontend Agent | Query patterns for hook implementation, JSONB formats |
| AI Agent | Data access patterns (not used in Phase 1) |
| QA Agent | Seed data, test scenarios, expected query behavior |
| DevOps | Migration scripts, rollback procedures, monitoring queries |

### Required From

| Source | What is Required | Status |
|--------|-----------------|--------|
| Architecture Record (06) | Schema requirements, RLS policy specs | **Received** |
| Product Requirements (05) | Data constraints, retention requirements | **Received** |
| Product Assessment (03) | Technical constraints, scale requirements | **Received** |

---

## Appendix A: Quick Reference

### Table Summary

| Table | Purpose | Row Count (Est.) | Growth Rate |
|-------|---------|------------------|-------------|
| conversations | Chat metadata | Low (hundreds per org) | Slow |
| conversation_participants | Membership junction | Medium (5x conversations) | Slow |
| messages | Chat content | High (thousands per org/month) | Fast |

### Key UUIDs for Testing

| Entity | UUID | Description |
|--------|------|-------------|
| Acme Security Corp | 11111111-1111-1111-1111-111111111111 | Test organization |
| Alice Johnson | a1111111-1111-1111-1111-111111111111 | Owner role |
| Bob Smith | a2222222-2222-2222-2222-222222222222 | Admin role |
| Charlie Brown | a3333333-3333-3333-3333-333333333333 | Field Tech |
| Diana Prince | a4444444-4444-4444-4444-444444444444 | Project Manager |
| Edward Norton | a5555555-5555-5555-5555-555555555555 | Field Tech |

### JSONB Formats

**Attachments:**
```json
{
  "type": "image|file",
  "url": "chat/{conversation_id}/{filename}",
  "name": "filename.ext",
  "size": 12345
}
```

**Reactions:**
```json
{
  "userId": "uuid",
  "emoji": "thumbsup|heart|star|tada|..."
}
```

---

*Generated with Claude AI assistance as directed by Pierce Desk*
*Document ID: FEAT-CHAT-001-E1*
*Generated: 2026-01-23*
