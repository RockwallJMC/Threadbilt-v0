import { createApiClient } from '@/lib/supabase/api-server';
import { NextResponse } from 'next/server';

/**
 * GET /api/chat/conversations/[id]/messages
 * Fetch all messages for a specific conversation
 */
export async function GET(request, { params }) {
  try {
    const { id: conversationId } = params;
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a participant in this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('organization_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Fetch messages with sender info, attachments, reactions, and read receipts
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        message_type,
        text,
        edited,
        deleted,
        created_at,
        updated_at,
        sender:user_profiles!sender_id(
          id,
          email,
          full_name,
          avatar_url
        ),
        attachments:message_attachments(
          id,
          attachment_type,
          file_name,
          file_size,
          mime_type,
          storage_bucket,
          storage_path,
          thumbnail_path,
          width,
          height,
          duration
        ),
        reactions:message_reactions(
          id,
          emoji,
          user_id,
          created_at
        ),
        read_receipts:message_read_receipts(
          user_id,
          read_at
        )
      `
      )
      .eq('conversation_id', conversationId)
      .eq('deleted', false)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark messages as read for current user (upsert read receipts)
    if (messages && messages.length > 0) {
      const messageIds = messages.map((msg) => msg.id);
      const readReceipts = messageIds.map((messageId) => ({
        organization_id: participant.organization_id,
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString(),
      }));

      // Upsert read receipts (insert if not exists, update if exists)
      await supabase.from('message_read_receipts').upsert(readReceipts, {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: false,
      });

      // Update unread count for current user
      await supabase
        .from('conversation_participants')
        .update({ unread_count: 0, last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/chat/conversations/[id]/messages:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Send a new message to a conversation
 */
export async function POST(request, { params }) {
  try {
    const { id: conversationId } = params;
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a participant in this conversation
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('organization_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text, messageType = 'text', attachments = [] } = body;

    if (!text && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message must have text or attachments' },
        { status: 400 }
      );
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        organization_id: participant.organization_id,
        conversation_id: conversationId,
        sender_id: user.id,
        message_type: messageType,
        text: text || null,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Add attachments if provided
    if (attachments.length > 0) {
      const attachmentRecords = attachments.map((att) => ({
        organization_id: participant.organization_id,
        message_id: message.id,
        attachment_type: att.type,
        file_name: att.fileName,
        file_size: att.fileSize,
        mime_type: att.mimeType,
        storage_path: att.storagePath,
        thumbnail_path: att.thumbnailPath,
        width: att.width,
        height: att.height,
        duration: att.duration,
      }));

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert(attachmentRecords);

      if (attachmentError) {
        console.error('Error adding attachments:', attachmentError);
        // Don't fail the request, just log the error
      }
    }

    // Update conversation's last_message_at (trigger should handle this, but being explicit)
    await supabase
      .from('conversations')
      .update({ last_message_at: message.created_at })
      .eq('id', conversationId);

    // Increment unread count for other participants
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id, unread_count')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)
      .is('left_at', null);

    if (otherParticipants) {
      for (const participant of otherParticipants) {
        await supabase
          .from('conversation_participants')
          .update({ unread_count: (participant.unread_count || 0) + 1 })
          .eq('conversation_id', conversationId)
          .eq('user_id', participant.user_id);
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/chat/conversations/[id]/messages:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/conversations/[id]/messages
 * Update a message (edit text, mark as deleted, etc.)
 */
export async function PATCH(request, { params }) {
  try {
    const { id: conversationId } = params;
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, text, deleted } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }

    // Update message
    const updates = {};
    if (text !== undefined) {
      updates.text = text;
      updates.edited = true;
    }
    if (deleted !== undefined) {
      updates.deleted = deleted;
      updates.deleted_at = deleted ? new Date().toISOString() : null;
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating message:', updateError);
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: updatedMessage }, { status: 200 });
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/chat/conversations/[id]/messages:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
