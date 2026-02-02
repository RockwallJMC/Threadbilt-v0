'use client';

import createClient from 'lib/supabase/client';
import { useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// ============================================================================
// FETCHERS
// ============================================================================

/**
 * Fetcher function for all conversations
 * Uses API route for proper filtering and joins
 */
const conversationsFetcher = async () => {
  const response = await fetch('/api/chat/conversations');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch conversations');
  }
  const data = await response.json();
  return data.conversations || [];
};

/**
 * Fetcher function for messages in a specific conversation
 */
const messagesFetcher = async (conversationId) => {
  const response = await fetch(
    `/api/chat/conversations/${conversationId}/messages`
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch messages');
  }
  const data = await response.json();
  return data.messages || [];
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch all conversations for the current user
 *
 * @example
 * const { data: conversations, error, isLoading, mutate } = useConversations();
 */
export const useConversations = () => {
  const swr = useSWR('conversations', conversationsFetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    refreshInterval: 0, // Use real-time subscriptions instead
  });

  return swr;
};

/**
 * Hook to fetch messages for a specific conversation
 *
 * @param {string} conversationId - The conversation ID
 * @example
 * const { data: messages, error, isLoading, mutate } = useMessages(conversationId);
 */
export const useMessages = (conversationId) => {
  const swr = useSWR(
    conversationId ? ['messages', conversationId] : null,
    () => messagesFetcher(conversationId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      refreshInterval: 0, // Use real-time subscriptions instead
    }
  );

  return swr;
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mutation function for creating a new conversation
 */
const createConversationMutation = async (url, { arg }) => {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create conversation');
  }

  const data = await response.json();
  return data.conversation;
};

/**
 * Hook to create a new conversation
 *
 * @example
 * const { trigger: createConversation, isMutating } = useCreateConversation();
 * await createConversation({ recipientIds: [...], conversationName: 'Group', initialMessage: 'Hi' });
 */
export const useCreateConversation = () => {
  return useSWRMutation('create-conversation', createConversationMutation);
};

/**
 * Mutation function for sending a message
 */
const sendMessageMutation = async (url, { arg }) => {
  const { conversationId, text, messageType, attachments } = arg;

  const response = await fetch(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, messageType, attachments }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  const data = await response.json();
  return data.message;
};

/**
 * Hook to send a message to a conversation
 *
 * @example
 * const { trigger: sendMessage, isMutating } = useSendMessage();
 * await sendMessage({ conversationId, text: 'Hello!' });
 */
export const useSendMessage = () => {
  return useSWRMutation('send-message', sendMessageMutation);
};

/**
 * Mutation function for updating a message
 */
const updateMessageMutation = async (url, { arg }) => {
  const { conversationId, messageId, text, deleted } = arg;

  const response = await fetch(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, text, deleted }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update message');
  }

  const data = await response.json();
  return data.message;
};

/**
 * Hook to update a message (edit or delete)
 *
 * @example
 * const { trigger: updateMessage } = useUpdateMessage();
 * await updateMessage({ conversationId, messageId, text: 'Updated text' });
 */
export const useUpdateMessage = () => {
  return useSWRMutation('update-message', updateMessageMutation);
};

/**
 * Mutation function for toggling a reaction
 */
const toggleReactionMutation = async (url, { arg }) => {
  const { messageId, emoji } = arg;

  const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle reaction');
  }

  const data = await response.json();
  return data;
};

/**
 * Hook to toggle a reaction on a message
 *
 * @example
 * const { trigger: toggleReaction } = useToggleReaction();
 * await toggleReaction({ messageId, emoji: '❤️' });
 */
export const useToggleReaction = () => {
  return useSWRMutation('toggle-reaction', toggleReactionMutation);
};

/**
 * Mutation function for updating conversation properties
 */
const updateConversationMutation = async (url, { arg }) => {
  const { conversationId, updates } = arg;

  const response = await fetch('/api/chat/conversations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, updates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update conversation');
  }

  const data = await response.json();
  return data.conversation;
};

/**
 * Hook to update conversation properties (archive, star, etc.)
 *
 * @example
 * const { trigger: updateConversation } = useUpdateConversation();
 * await updateConversation({ conversationId, updates: { archived: true } });
 */
export const useUpdateConversation = () => {
  return useSWRMutation('update-conversation', updateConversationMutation);
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Hook to subscribe to new messages in a conversation
 *
 * @param {string} conversationId - The conversation ID to subscribe to
 * @param {Function} onNewMessage - Callback function called when a new message arrives
 *
 * @example
 * useMessageSubscription(conversationId, (message) => {
 *   console.log('New message:', message);
 *   mutate(); // Revalidate messages
 * });
 */
export const useMessageSubscription = (conversationId, onNewMessage) => {
  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (onNewMessage) {
            onNewMessage(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage, supabase]);
};

/**
 * Hook to subscribe to reaction changes on messages
 *
 * @param {string} conversationId - The conversation ID to subscribe to
 * @param {Function} onReactionChange - Callback function called when reactions change
 *
 * @example
 * useReactionSubscription(conversationId, () => {
 *   mutate(); // Revalidate messages to get updated reactions
 * });
 */
export const useReactionSubscription = (conversationId, onReactionChange) => {
  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to reaction inserts and deletes
    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // All events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          if (onReactionChange) {
            onReactionChange(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onReactionChange, supabase]);
};

/**
 * Hook to subscribe to conversation list changes
 *
 * @param {Function} onConversationChange - Callback function called when conversations change
 *
 * @example
 * useConversationSubscription(() => {
 *   mutate(); // Revalidate conversations list
 * });
 */
export const useConversationSubscription = (onConversationChange) => {
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new conversations
    const channel = supabase
      .channel('conversations-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (onConversationChange) {
            onConversationChange(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onConversationChange, supabase]);
};
