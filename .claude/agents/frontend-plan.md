---
title: 'Frontend Engineering Plan: Real-Time Chat Application'
description: 'UI components, pages, and Aurora patterns plan for internal organizational chat'
version: '1.0.0'
date: '2026-01-23'
agent: 'Frontend Engineer Agent'
status: complete
feature_id: 'FEAT-CHAT-001'
---

# Frontend Engineering Plan: Real-Time Chat Application

**REPOSITORY STRUCTURE NOTE:** This document contains historical references to `templates/aurora-next/` paths that do not exist in this repository. The actual repository structure is a single Next.js application with all code under `src/`. References to `@pierce/*` packages and monorepo paths are from an alternate/future architecture and should be treated as conceptual. Use relative imports from `src/` in actual implementation.

## CRITICAL: Development Server Constraints

**NEVER run `npm run dev` in the background:**

- If you need to start the dev server, inform the user and let them start it manually
- NEVER use `run_in_background: true` with Bash tool for `npm run dev`
- Dev servers must run in the terminal for proper log visibility and clean restarts
- This is a strict requirement across all agents

## 1. Component Selection

### 1.1 Chat Component Architecture

All chat components are custom-built for this repository following Material-UI v7 patterns and Next.js 15 App Router conventions. Components are located in `src/components/` and integrated with Supabase for real-time functionality.

**Note:** Aurora template references in this document are historical. This repository uses a single Next.js app structure under `src/`, not a monorepo with template directories.

| Component         | Repo Path                                                                                                       | Customization Level                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| ChatLayout        | `src/components/sections/chat/ChatLayout.jsx`                                                                   | **Modified** - Added ChatProvider wrapper, Supabase integration                           |
| ChatSidebar       | `templates/aurora-next/src/components/sections/chat/sidebar/ChatSidebar.jsx`                                    | `src/components/sections/chat/sidebar/ChatSidebar.jsx`                                    | Minimal - Layout preserved                                      |
| Conversation      | `templates/aurora-next/src/components/sections/chat/conversation/index.jsx`                                     | `src/components/sections/chat/conversation/index.jsx`                                     | **Modified** - Added Supabase conversation fetching via context |
| ConversationList  | `templates/aurora-next/src/components/sections/chat/sidebar/conversation-list/ConversationList.jsx`             | `src/components/sections/chat/sidebar/conversation-list/ConversationList.jsx`             | Minimal - Uses context data                                     |
| ConversationItem  | `templates/aurora-next/src/components/sections/chat/sidebar/conversation-list/ConversationItem.jsx`             | `src/components/sections/chat/sidebar/conversation-list/ConversationItem.jsx`             | Minimal - Prop interface preserved                              |
| Content           | `templates/aurora-next/src/components/sections/chat/conversation/main/content/Content.jsx`                      | `src/components/sections/chat/conversation/main/content/Content.jsx`                      | **Modified** - Supabase message loading                         |
| ContentFooter     | `templates/aurora-next/src/components/sections/chat/conversation/main/content-footer/ContentFooter.jsx`         | `src/components/sections/chat/conversation/main/content-footer/ContentFooter.jsx`         | **Modified** - Supabase message sending                         |
| ContentHeader     | `templates/aurora-next/src/components/sections/chat/conversation/main/ContentHeader.jsx`                        | `src/components/sections/chat/conversation/main/ContentHeader.jsx`                        | Minimal                                                         |
| Message           | `templates/aurora-next/src/components/sections/chat/conversation/main/content/message/index.jsx`                | `src/components/sections/chat/conversation/main/content/message/index.jsx`                | **Modified** - Real-time reaction updates                       |
| TextContent       | `templates/aurora-next/src/components/sections/chat/conversation/main/content/message/content/TextContent.jsx`  | `src/components/sections/chat/conversation/main/content/message/content/TextContent.jsx`  | Minimal                                                         |
| MediaContent      | `templates/aurora-next/src/components/sections/chat/conversation/main/content/message/content/MediaContent.jsx` | `src/components/sections/chat/conversation/main/content/message/content/MediaContent.jsx` | Minimal                                                         |
| FileContent       | `templates/aurora-next/src/components/sections/chat/conversation/main/content/message/content/FileContent.jsx`  | `src/components/sections/chat/conversation/main/content/message/content/FileContent.jsx`  | Minimal                                                         |
| RecipientsInfo    | `templates/aurora-next/src/components/sections/chat/conversation/aside/partials/RecipientsInfo.jsx`             | `src/components/sections/chat/conversation/aside/partials/RecipientsInfo.jsx`             | **Modified** - Supabase conversation name update                |
| ConversationAside | `templates/aurora-next/src/components/sections/chat/conversation/aside/ConversationAside.jsx`                   | `src/components/sections/chat/conversation/aside/ConversationAside.jsx`                   | Minimal                                                         |
| NewChat           | `templates/aurora-next/src/components/sections/chat/new/index.jsx`                                              | `src/components/sections/chat/new/index.jsx`                                              | **Modified** - Supabase conversation creation                   |
| NewChatHeader     | `templates/aurora-next/src/components/sections/chat/new/NewChatHeader.jsx`                                      | `src/components/sections/chat/new/NewChatHeader.jsx`                                      | **Modified** - Organization member search                       |

### 1.2 Sidebar Layout Components

| Component         | Aurora Path                                               | Repo Path                               | Purpose                        |
| ----------------- | --------------------------------------------------------- | --------------------------------------- | ------------------------------ |
| ResizableSidebar  | `templates/aurora-next/.../layouts/ResizableSidebar.jsx`  | `src/.../layouts/ResizableSidebar.jsx`  | Desktop drag-to-resize sidebar |
| ResponsiveSidebar | `templates/aurora-next/.../layouts/ResponsiveSidebar.jsx` | `src/.../layouts/ResponsiveSidebar.jsx` | Mobile full-screen overlay     |
| MiniSidebar       | `templates/aurora-next/.../layouts/MiniSidebar.jsx`       | `src/.../layouts/MiniSidebar.jsx`       | Tablet collapsed sidebar       |
| SidebarHeader     | `templates/aurora-next/.../layouts/SidebarHeader.jsx`     | `src/.../layouts/SidebarHeader.jsx`     | Search and new chat button     |
| SidebarFallback   | `templates/aurora-next/.../layouts/SidebarFallback.jsx`   | `src/.../layouts/SidebarFallback.jsx`   | Empty state illustration       |

### 1.3 Message Format Components

| Component    | Aurora Path                                          | Repo Path                          | Purpose                     |
| ------------ | ---------------------------------------------------- | ---------------------------------- | --------------------------- |
| TextMessage  | `templates/aurora-next/.../formats/TextMessage.jsx`  | `src/.../formats/TextMessage.jsx`  | Plain text message bubble   |
| MediaMessage | `templates/aurora-next/.../formats/MediaMessage.jsx` | `src/.../formats/MediaMessage.jsx` | Image/video message preview |
| FileMessage  | `templates/aurora-next/.../formats/FileMessage.jsx`  | `src/.../formats/FileMessage.jsx`  | Document attachment display |
| AudioMessage | `templates/aurora-next/.../formats/AudioMessage.jsx` | `src/.../formats/AudioMessage.jsx` | Voice recording playback    |

### 1.4 Input Control Components

| Component         | Aurora Path                                                      | Repo Path                                      | Purpose                       |
| ----------------- | ---------------------------------------------------------------- | ---------------------------------------------- | ----------------------------- |
| TextInput         | `templates/aurora-next/.../content-footer/TextInput.jsx`         | `src/.../content-footer/TextInput.jsx`         | Multi-line message input      |
| ChatControls      | `templates/aurora-next/.../controls/ChatControls.jsx`            | `src/.../controls/ChatControls.jsx`            | Attachment buttons wrapper    |
| ChatAttachments   | `templates/aurora-next/.../controls/ChatAttachments.jsx`         | `src/.../controls/ChatAttachments.jsx`         | File picker integration       |
| ChatEmojiPicker   | `templates/aurora-next/.../controls/ChatEmojiPicker.jsx`         | `src/.../controls/ChatEmojiPicker.jsx`         | Emoji selection popover       |
| ChatCameraCapture | `templates/aurora-next/.../controls/ChatCameraCapture.jsx`       | `src/.../controls/ChatCameraCapture.jsx`       | Camera photo capture          |
| ChatAudioRecorder | `templates/aurora-next/.../controls/ChatAudioRecorder.jsx`       | `src/.../controls/ChatAudioRecorder.jsx`       | Voice recording               |
| AttachmentPreview | `templates/aurora-next/.../content-footer/AttachmentPreview.jsx` | `src/.../content-footer/AttachmentPreview.jsx` | Pre-send attachment thumbnail |

### 1.5 Common/Utility Components

| Component       | Aurora Path                                              | Repo Path                              | Purpose                         |
| --------------- | -------------------------------------------------------- | -------------------------------------- | ------------------------------- |
| RecipientAvatar | `templates/aurora-next/.../common/RecipientAvatar.jsx`   | `src/.../common/RecipientAvatar.jsx`   | User avatar with presence badge |
| AudioPlayer     | `templates/aurora-next/.../common/AudioPlayer.jsx`       | `src/.../common/AudioPlayer.jsx`       | Audio playback controls         |
| MessageHeader   | `templates/aurora-next/.../partials/MessageHeader.jsx`   | `src/.../partials/MessageHeader.jsx`   | Sender name and timestamp       |
| ActionButtons   | `templates/aurora-next/.../partials/ActionButtons.jsx`   | `src/.../partials/ActionButtons.jsx`   | React/reply/delete actions      |
| ReactionPreview | `templates/aurora-next/.../partials/ReactionPreview.jsx` | `src/.../partials/ReactionPreview.jsx` | Emoji reaction display          |
| ContentSkeleton | `templates/aurora-next/.../partials/ContentSkeleton.jsx` | `src/.../partials/ContentSkeleton.jsx` | Loading state skeleton          |
| StarterMessage  | `templates/aurora-next/.../partials/StarterMessage.jsx`  | `src/.../partials/StarterMessage.jsx`  | Conversation start indicator    |
| ContentFallback | `templates/aurora-next/.../partials/ContentFallback.jsx` | `src/.../partials/ContentFallback.jsx` | Empty conversation state        |

### 1.6 Custom Components Created (Non-Aurora)

| Component            | Path                                | Purpose                                    | Reason                                                   |
| -------------------- | ----------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| ChatProvider         | `src/providers/ChatProvider.jsx`    | Global chat state and Supabase integration | No Aurora equivalent - custom Supabase integration layer |
| ChatReducer          | `src/reducers/ChatReducer.js`       | State management actions                   | No Aurora equivalent - custom state logic                |
| useConversations     | `src/hooks/useConversations.js`     | SWR hook for conversation list             | No Aurora equivalent - Supabase data fetching            |
| useMessages          | `src/hooks/useMessages.js`          | SWR infinite hook for messages             | No Aurora equivalent - paginated message loading         |
| useSendMessage       | `src/hooks/useSendMessage.js`       | Message send mutation                      | No Aurora equivalent - Supabase insert                   |
| useStartConversation | `src/hooks/useStartConversation.js` | Create conversation mutation               | No Aurora equivalent - 1:1 and group creation            |
| useChatRealtime      | `src/hooks/useChatRealtime.js`      | WebSocket subscription                     | No Aurora equivalent - Supabase Realtime                 |
| useCurrentUser       | `src/hooks/useCurrentUser.js`       | Authenticated user profile                 | No Aurora equivalent - Supabase Auth                     |

---

## 2. Page Structure

### 2.1 App Router Pages

| Route                         | Page                                                 | Layout     | Components Used                       |
| ----------------------------- | ---------------------------------------------------- | ---------- | ------------------------------------- |
| `/apps/chat`                  | `src/app/(main)/apps/chat/page.jsx`                  | ChatLayout | Chat (empty state)                    |
| `/apps/chat/new`              | `src/app/(main)/apps/chat/new/page.jsx`              | ChatLayout | NewChat, NewChatHeader, ContentFooter |
| `/apps/chat/[conversationId]` | `src/app/(main)/apps/chat/[conversationId]/page.jsx` | ChatLayout | Conversation, Content, ContentFooter  |

### 2.2 Page Hierarchy

```
src/app/
└── (main)/
    └── apps/
        └── chat/
            ├── layout.jsx          # Wraps with ChatLayout
            ├── page.jsx            # Default empty state
            ├── new/
            │   └── page.jsx        # New conversation flow
            └── [conversationId]/
                └── page.jsx        # Active conversation view
```

### 2.3 Layout Nesting

```
RootLayout
└── MainLayout (DashboardLayout with topbar/sidebar)
    └── ChatLayout (ChatProvider + chat-specific layout)
        ├── ChatSidebar (conversation list)
        └── {children} (page content)
```

---

## 3. Component Architecture

### 3.1 Component Tree

```
<ChatLayout>
  ├── <ChatProvider>                          # Global state + Supabase hooks
  │   ├── <ChatSidebar>
  │   │   ├── <SidebarHeader>
  │   │   │   ├── <SearchFilterMenu />        # Search conversations
  │   │   │   ├── <FilterMenu />              # All/Unread/Starred filter
  │   │   │   └── <Button: New Chat />
  │   │   ├── <ConversationList>
  │   │   │   ├── <CollapsiblePanel title="starred">
  │   │   │   │   └── <ConversationItem />[]
  │   │   │   └── <CollapsiblePanel title="messages">
  │   │   │       └── <ConversationItem />[]
  │   │   └── <SidebarFallback />             # When no conversations
  │   │
  │   └── {children: Page Content}
  │       │
  │       ├── [/apps/chat] <Chat />           # Empty state illustration
  │       │
  │       ├── [/apps/chat/new] <NewChat>
  │       │   ├── <NewChatHeader>
  │       │   │   └── <Autocomplete: Recipient Search />
  │       │   └── <ContentFooter>
  │       │       ├── <TextInput />
  │       │       ├── <AttachmentPreview />[]
  │       │       └── <ChatControls />
  │       │
  │       └── [/apps/chat/[id]] <Conversation>
  │           ├── <ContentHeader>
  │           │   ├── <RecipientAvatar />
  │           │   ├── <Typography: Name />
  │           │   └── <IconButton: Toggle Aside />
  │           ├── <Content>
  │           │   ├── <StarterMessage /> or <ContentFallback />
  │           │   ├── <Divider: Date />[]
  │           │   └── <Message />[]
  │           │       ├── <MessageHeader />
  │           │       ├── <TextContent />
  │           │       ├── <MediaContent />
  │           │       ├── <FileContent />
  │           │       ├── <ActionButtons />
  │           │       └── <ReactionPreview />
  │           ├── <ContentFooter />
  │           └── <ConversationAside>
  │               ├── <AsideHeader />
  │               ├── <RecipientsInfo />
  │               ├── <MediaGallery />
  │               ├── <FileAttachments />
  │               └── <ConfirmationDialog: Delete />
```

### 3.2 Props Interfaces

```typescript
// ChatProvider Context Value
interface ChatContextValue {
  // State
  conversations: Conversation[];
  initialConversations: Conversation[];
  currentConversation: ConversationWithMessages | null;
  currentUser: User | null;
  contacts: Contact[];
  filterBy: 'all' | 'unread' | 'starred';
  searchQuery: string;
  shouldMessagesScroll: boolean;
  isChatSidebarOpen: boolean;

  // Loading states
  isLoading: boolean;
  isMessagesLoading: boolean;
  isContactsLoading: boolean;
  isSending: boolean;
  isCreating: boolean;

  // Pagination
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;

  // Dispatch
  chatDispatch: React.Dispatch<ChatAction>;

  // Actions
  handleChatSidebar: (open?: boolean) => void;
  handleSendMessage: (data: MessageData) => Promise<void>;
  handleStartConversation: (
    recipientId: string,
    initialMessage?: string,
  ) => Promise<{ conversationId: string; isNew: boolean }>;
  handleStartGroupConversation: (
    recipientIds: string[],
    groupName: string,
    initialMessage?: string,
  ) => Promise<{ conversationId: string; isNew: boolean }>;
  handleAddReaction: (messageId: string, emoji: string) => Promise<void>;
  handleToggleStarred: () => Promise<void>;
  handleUpdateConversationName: (name: string) => Promise<void>;

  // Refresh
  mutateConversations: () => void;
}

// Conversation data shape
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

interface Recipient {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'offline';
}

interface Message {
  id: string;
  senderId: string;
  type: 'sent' | 'received';
  text: string | null;
  attachments: {
    media?: { type: string; src: string }[];
    files?: { name: string; size: number; type: string; url: string }[];
  } | null;
  reactions: { userId: string; emoji: string }[];
  createdAt: Date;
  readAt: Date | null;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

// Message send payload
interface MessageData {
  text: string | null;
  attachments: {
    media?: { type: string; src: string }[];
    files?: { name: string; size: number; type: string }[];
  } | null;
}
```

---

## 4. State Management

### 4.1 State Requirements

| State                  | Scope                | Type             | Persistence | Source                       |
| ---------------------- | -------------------- | ---------------- | ----------- | ---------------------------- | ------------------- | ------- |
| `conversations`        | Global (ChatContext) | `Conversation[]` | SWR Cache   | Supabase query               |
| `currentConversation`  | Global (ChatContext) | `Conversation    | null`       | Session                      | Reducer + URL param |
| `currentUser`          | Global (ChatContext) | `User            | null`       | SWR Cache                    | Supabase Auth       |
| `contacts`             | Global (ChatContext) | `Contact[]`      | SWR Cache   | `organization_members` table |
| `messages`             | Per-conversation     | `Message[]`      | SWR Cache   | Supabase query (paginated)   |
| `filterBy`             | Global (ChatContext) | `'all'           | 'unread'    | 'starred'`                   | Session             | Reducer |
| `searchQuery`          | Global (ChatContext) | `string`         | Session     | Reducer                      |
| `isChatSidebarOpen`    | Global (ChatContext) | `boolean`        | Session     | Reducer                      |
| `shouldMessagesScroll` | Global (ChatContext) | `boolean`        | Session     | Reducer                      |

### 4.2 Reducer Actions

```typescript
// ChatReducer action types
export const SET_CHAT_SIDEBAR_STATE = 'SET_CHAT_SIDEBAR_STATE'; // Toggle sidebar
export const SENT_MESSAGE = 'SENT_MESSAGE'; // Optimistic message add
export const DELETE_MESSAGE = 'DELETE_MESSAGE'; // Remove message
export const START_NEW_CONVERSATION = 'START_NEW_CONVERSATION'; // Create new conv
export const SET_CURRENT_CONVERSATION = 'SET_CURRENT_CONVERSATION'; // Select conversation
export const DELETE_CONVERSATION = 'DELETE_CONVERSATION'; // Remove conversation
export const SEARCH_CONVERSATIONS = 'SEARCH_CONVERSATIONS'; // Filter by search
export const FILTER_CONVERSIONS = 'FILTER_CONVERSIONS'; // All/Unread/Starred
export const UPDATE_CONVERSATION_NAME = 'UPDATE_CONVERSATION_NAME'; // Rename group
export const TOGGLE_STARRED_CONVERSATION = 'TOGGLE_STARRED_CONVERSATION'; // Star/unstar
export const SET_EMOJI_REACTION = 'SET_EMOJI_REACTION'; // Add/remove reaction
export const RESET = 'RESET'; // Reset state
export const SYNC_CONVERSATIONS = 'SYNC_CONVERSATIONS'; // Sync from SWR
export const SYNC_CURRENT_USER = 'SYNC_CURRENT_USER'; // Sync auth user
export const SET_SHOULD_SCROLL = 'SET_SHOULD_SCROLL'; // Control scroll
```

### 4.3 SWR Data Fetching

```typescript
// useConversations - Fetch user's conversation list
const { data, error, isLoading, mutate } = useSWR(
  'user-conversations',
  async () => {
    // 1. Get current user from Supabase Auth
    // 2. Query conversation_participants for user's conversations
    // 3. For each conversation, fetch participants and last message
    // 4. Calculate unread count based on last_read_at
    // 5. Transform to UI format and sort by last activity
  },
  { revalidateOnFocus: false, dedupingInterval: 5000 }
);

// useMessages - Infinite scroll message loading
const { data, size, setSize, isLoading, mutate } = useSWRInfinite(
  (pageIndex, previousPageData) => {
    if (!conversationId) return null;
    if (previousPageData && previousPageData.length < PAGE_SIZE) return null;
    return [`messages-${conversationId}`, pageIndex * PAGE_SIZE];
  },
  async ([key, offset]) => {
    // Fetch messages with sender profile JOIN
    // Transform to UI format with sent/received type
    // Return paginated results
  }
);

// useCurrentUser - Authenticated user with profile
const { data, isLoading } = useSWR(
  'current-user',
  async () => {
    // Get auth user from Supabase
    // Fetch user_profiles for display name and avatar
    // Return merged user object
  }
);
```

### 4.4 Real-Time Subscriptions (useChatRealtime)

```typescript
// Subscribe to new messages
supabase
  .channel('chat-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      // Filter to user's conversations (client-side)
      // Skip own messages (handled optimistically)
      // Fetch sender profile
      // Call onNewMessage callback
    },
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      // Handle reaction updates
      // Call onMessageUpdated callback
    },
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations',
    },
    (payload) => {
      // Handle name changes
      // Call onConversationUpdated callback
    },
  )
  .subscribe();
```

---

## 5. API Integration

### 5.1 Supabase Operations

| Hook                                            | Table(s)                                                                  | Operation       | Description                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| `useConversations`                              | `conversation_participants`, `conversations`, `messages`, `user_profiles` | SELECT          | Fetch user's conversations with participants and last message      |
| `useMessages`                                   | `messages`, `user_profiles`                                               | SELECT          | Fetch paginated messages with sender info                          |
| `useSendMessage.sendMessage`                    | `messages`, `conversations`, `conversation_participants`                  | INSERT + UPDATE | Create message, update conversation timestamp, update last_read_at |
| `useSendMessage.addReaction`                    | `messages`                                                                | SELECT + UPDATE | Get current reactions, toggle user reaction                        |
| `useStartConversation.findOrCreateConversation` | `conversations`, `conversation_participants`, `messages`                  | SELECT + INSERT | Find existing 1:1 or create new conversation                       |
| `useStartConversation.startGroupConversation`   | `conversations`, `conversation_participants`, `messages`                  | INSERT          | Create group with multiple participants                            |
| `handleToggleStarred`                           | `conversation_participants`                                               | UPDATE          | Toggle is_starred for current user                                 |
| `handleUpdateConversationName`                  | `conversations`                                                           | UPDATE          | Update conversation name (groups only)                             |

### 5.2 Loading States

| State                 | UI Treatment                                | Component           |
| --------------------- | ------------------------------------------- | ------------------- |
| Conversations loading | Skeleton conversation items                 | `ConversationList`  |
| Messages loading      | Skeleton message bubbles                    | `ContentSkeleton`   |
| Sending message       | Message with spinner, "Sending..." button   | `ContentFooter`     |
| Creating conversation | Disabled send button with spinner           | `ContentFooter`     |
| File uploading        | Progress bar in attachment preview          | `AttachmentPreview` |
| No conversations      | Empty state illustration + "Start Chat" CTA | `SidebarFallback`   |
| No messages           | "Say hello to get started" message          | `ContentFallback`   |

### 5.3 Error States

| Error                        | UI Treatment                         | Recovery Action              |
| ---------------------------- | ------------------------------------ | ---------------------------- |
| Message send failed          | Console error, state not updated     | Retry via re-submit          |
| Conversation creation failed | Console error, thrown to caller      | Try again                    |
| Reaction update failed       | Console error                        | UI remains in previous state |
| WebSocket disconnect         | Auto-reconnect (exponential backoff) | Manual refresh if persistent |
| Auth failure                 | Redirect to login                    | Re-authenticate              |

---

## 6. Accessibility (WCAG 2.1 AA)

### 6.1 Requirements Checklist

- [x] Semantic HTML structure (lists, headings, buttons)
- [x] ARIA labels on interactive elements (IconifyIcon buttons have tooltips)
- [x] Keyboard navigation support (Tab through sidebar, conversations, input)
- [x] Focus management (Auto-focus on input when conversation opens)
- [x] Color contrast compliance (MUI theme handles 4.5:1 ratio)
- [ ] Screen reader testing - **Needs verification**
- [x] Focus indicators visible (MUI default focus rings)
- [ ] Skip links for navigation - **Not implemented**
- [x] Text resizable to 200% (responsive layout maintains usability)

### 6.2 Keyboard Navigation

| Action                 | Key                                       | Behavior                                  |
| ---------------------- | ----------------------------------------- | ----------------------------------------- |
| Navigate conversations | Tab / Shift+Tab                           | Focus moves through sidebar items         |
| Select conversation    | Enter                                     | Opens conversation, focuses message input |
| Send message           | Enter                                     | Sends message (Shift+Enter for newline)   |
| Close sidebar (mobile) | Escape                                    | Returns focus to conversation             |
| Add emoji              | Tab to emoji button, Enter to open picker | Focus moves to picker                     |
| Close emoji picker     | Escape                                    | Returns focus to input                    |

### 6.3 ARIA Implementation

```jsx
// Conversation list item
<ListItemButton
  role="button"
  aria-selected={isSelected}
  aria-label={`Conversation with ${recipients.join(', ')}. ${unreadCount} unread messages.`}
>

// Send button
<Button
  type="submit"
  aria-label={isSending ? 'Sending message' : 'Send message'}
  aria-busy={isSending}
>

// Message input
<TextField
  aria-label="Type a message"
  aria-describedby="attachment-count"
  multiline
/>
```

---

## 7. Responsive Design

### 7.1 Breakpoints

| Breakpoint | Width       | Sidebar Behavior                               | Conversation Aside         |
| ---------- | ----------- | ---------------------------------------------- | -------------------------- |
| xs         | < 600px     | Full-screen overlay (ResponsiveSidebar)        | Hidden                     |
| sm         | 600-900px   | Mini sidebar, click to expand (MiniSidebar)    | Hidden                     |
| md         | 900-1200px  | Resizable sidebar 280-400px (ResizableSidebar) | Hidden                     |
| lg         | 1200-1536px | Resizable sidebar 280-400px                    | Hidden by default          |
| xl         | >= 1536px   | Resizable sidebar 280-400px                    | Visible by default (404px) |

### 7.2 Mobile-Specific Behavior

| Interaction             | Desktop                    | Mobile (xs)                                  |
| ----------------------- | -------------------------- | -------------------------------------------- |
| Open sidebar            | Always visible             | Overlay via hamburger menu                   |
| Select conversation     | Updates main panel         | Navigates to `/chat/[id]` and closes sidebar |
| Back to list            | Click another conversation | Swipe right or back button                   |
| Long-press message      | Hover shows actions        | Long-press shows context menu                |
| Pull to refresh         | Not applicable             | Refresh conversation list                    |
| Swipe conversation item | Not applicable             | Reveal star/mute actions                     |

### 7.3 Layout Adaptations

```jsx
// Sidebar width by breakpoint
<ChatSidebar>
  {onlyXs ? (
    <ResponsiveSidebar>     {/* Full screen overlay */}
      {chatSidebarContent}
    </ResponsiveSidebar>
  ) : onlySm ? (
    <MiniSidebar>           {/* 72px collapsed, 320px expanded */}
      {chatSidebarContent}
    </MiniSidebar>
  ) : (
    <ResizableSidebar>      {/* 280-400px resizable */}
      {chatSidebarContent}
    </ResizableSidebar>
  )}
</ChatSidebar>

// Message input padding responsive
<Box sx={{ px: { xs: 3, md: 5 }, py: 2 }}>
  <ContentFooter />
</Box>
```

---

## 8. MUI v7 Patterns

### 8.1 Grid Usage

The chat layout uses Stack for flex layouts rather than Grid, as chat UIs are primarily column-based:

```tsx
// Chat layout - vertical stack
<Stack
  component={Paper}
  sx={({ mixins }) => ({
    height: mixins.contentHeight(topbarHeight, footerHeight + 1),
  })}
>
  <ChatSidebar />
  {children}
</Stack>

// Conversation - horizontal split with responsive margin
<Stack
  sx={(theme) => ({
    flexDirection: 'column',
    transition: theme.transitions.create('margin'),
    marginRight: { xl: isDrawerOpen ? 0 : `-${drawerWidth}px` },
  })}
>
```

### 8.2 Theme Integration

```tsx
// Background elevation levels
<Stack sx={{ bgcolor: 'background.elevation2', borderRadius: 6 }}>
  {/* Input area */}
</Stack>

// Transition animations
<Stack
  sx={(theme) => ({
    transition: theme.transitions.create('margin', {
      easing: isOpen
        ? theme.transitions.easing.easeOut
        : theme.transitions.easing.sharp,
      duration: theme.transitions.duration[
        isOpen ? 'enteringScreen' : 'leavingScreen'
      ],
    }),
  })}
>

// Message bubble styling
<Box
  sx={(theme) => ({
    bgcolor: isSent ? 'primary.main' : 'background.elevation1',
    color: isSent ? 'primary.contrastText' : 'text.primary',
    borderRadius: 2,
    px: 2,
    py: 1,
  })}
>
```

### 8.3 Drawer Implementation

```tsx
// Conversation aside drawer
<Drawer
  variant={isXl ? 'persistent' : 'temporary'}
  anchor="right"
  open={isOpen}
  onClose={handleClose}
  sx={{
    [`& .${drawerClasses.paper}`]: {
      width: drawerWidth,
      position: { xl: 'relative' },
      border: 0,
    },
  }}
>
  <ConversationAside />
</Drawer>
```

---

## 9. Testing Plan

### 9.1 Component Tests

- [ ] ChatProvider initializes with correct default state
- [ ] useConversations fetches and transforms data correctly
- [ ] useMessages paginates and loads more on scroll
- [ ] useSendMessage creates message with correct format
- [ ] useChatRealtime subscribes to correct channels
- [ ] ChatReducer handles all action types correctly

### 9.2 Integration Tests

- [ ] Navigate from conversation list to conversation detail
- [ ] Send message and see it appear in thread
- [ ] Create new 1:1 conversation and navigate to it
- [ ] Create new group conversation (when UI supports it)
- [ ] Star/unstar conversation and verify filter works
- [ ] Search conversations by name/recipient
- [ ] Receive real-time message from another user

### 9.3 Accessibility Tests

- [ ] Tab navigation through all interactive elements
- [ ] Screen reader announces conversation and message content
- [ ] Focus management when opening/closing sidebar
- [ ] High contrast mode visual verification

### 9.4 Responsive Tests

- [ ] Mobile: Sidebar opens as full overlay
- [ ] Mobile: Selecting conversation closes sidebar
- [ ] Tablet: Mini sidebar expands on click
- [ ] Desktop: Sidebar resizes with drag handle
- [ ] XL: Aside panel visible by default

---

## 10. Remaining Work

### 10.1 Critical (P0) - Must Complete

| Task                                    | Status          | Notes                                               |
| --------------------------------------- | --------------- | --------------------------------------------------- |
| File upload to Supabase Storage         | **TODO**        | Currently uses `URL.createObjectURL()` - local only |
| 10MB file size validation (client-side) | **TODO**        | PRD REQ-CHAT-027                                    |
| Supported file type validation          | **TODO**        | PRD REQ-CHAT-028                                    |
| Presence indicators (online/offline)    | **TODO**        | Currently hardcoded to 'online'                     |
| Unread badge on conversation items      | **Implemented** | Via `unreadMessages` count                          |
| Message optimistic UI with retry        | **Partial**     | Optimistic add works, no retry on failure           |

### 10.2 High Priority (P1)

| Task                           | Status          | Notes                                                 |
| ------------------------------ | --------------- | ----------------------------------------------------- |
| Group conversation creation UI | **TODO**        | Hook exists, need modal for group name + multi-select |
| Add/remove group participants  | **TODO**        | Need ConversationAside controls                       |
| Leave group conversation       | **TODO**        | Need confirmation dialog + API call                   |
| Mute conversation toggle       | **TODO**        | Database field exists, need UI toggle                 |
| Connection lost banner         | **TODO**        | Need WebSocket status indicator                       |
| Rate limiting UI feedback      | **TODO**        | Show toast when rate limited                          |
| Infinite scroll for messages   | **Implemented** | Via `useSWRInfinite`                                  |

### 10.3 Medium Priority (P2)

| Task                         | Status       | Notes                   |
| ---------------------------- | ------------ | ----------------------- |
| Typing indicators            | **Deferred** | PRD marks as Phase 3    |
| Message content search       | **Deferred** | PRD marks as Phase 3    |
| Read receipts display        | **Deferred** | PRD marks as Phase 3    |
| Message edit (15 min window) | **Deferred** | PRD marks as Phase 2    |
| Pull-to-refresh on mobile    | **TODO**     | Native gesture support  |
| Swipe actions on mobile      | **TODO**     | Reveal star/mute/delete |

### 10.4 Known Issues

| Issue                                | Severity | Notes                                           |
| ------------------------------------ | -------- | ----------------------------------------------- |
| Attachment files only stored locally | High     | `URL.createObjectURL()` won't persist or share  |
| No error boundary around chat        | Medium   | Errors may crash entire layout                  |
| Duplicate message possible           | Low      | If real-time receives before optimistic confirm |
| Group conversation UI incomplete     | Medium   | Can't create groups from UI yet                 |
| Presence always shows online         | Medium   | Need real-time presence tracking                |

---

## Output Contract

### Provided To

| Recipient      | What is Provided                                   |
| -------------- | -------------------------------------------------- |
| Implementation | Complete component specifications and architecture |
| QA Agent       | Testing plan with component and integration tests  |
| Backend Agent  | Expected API contracts and data shapes             |

### Required From

| Source             | What is Required                               | Status                                    |
| ------------------ | ---------------------------------------------- | ----------------------------------------- |
| Backend Agent      | Supabase RLS policies and storage bucket setup | **Pending**                               |
| Database Agent     | Schema migrations applied                      | **Complete**                              |
| User Journey Agent | UX requirements and flows                      | **Received** (04_user-journey.md)         |
| PRD Agent          | UI/UX specifications                           | **Received** (05_product-requirements.md) |

---

## Information Requested (TBD Items)

| Item                         | Question                                   | Priority | Current Approach                       |
| ---------------------------- | ------------------------------------------ | -------- | -------------------------------------- |
| Storage bucket configuration | What bucket policies for chat attachments? | High     | Awaiting backend setup                 |
| Group creation UX            | Modal or inline flow?                      | Medium   | Assuming modal with name input         |
| Presence implementation      | Supabase Presence or custom table?         | Medium   | Supabase Realtime Presence recommended |
| Message retry mechanism      | How many retries? Exponential backoff?     | Low      | Currently no retry implemented         |
| Rate limit UI                | Toast or inline error?                     | Low      | Toast recommended                      |

---

_Generated with Claude AI assistance as directed by Pierce Desk_
_Document ID: FEAT-CHAT-001-E3_
_Generated: 2026-01-23_
