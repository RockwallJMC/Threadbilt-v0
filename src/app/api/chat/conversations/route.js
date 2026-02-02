import { createApiClient } from '@/lib/supabase/api-server';
import { NextResponse } from 'next/server';

/**
 * GET /api/chat/conversations
 * Fetch all conversations for the authenticated user
 */
export async function GET(request) {
  try {
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch conversations where user is a participant
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(
        `
        id,
        name,
        conversation_type,
        starred,
        archived,
        last_message_at,
        created_at,
        updated_at,
        participants:conversation_participants!inner(
          user_id,
          unread_count,
          starred,
          last_read_at,
          muted,
          user:user_profiles(
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq('conversation_participants.user_id', user.id)
      .is('conversation_participants.left_at', null)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/chat/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
export async function POST(request) {
  try {
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Organization membership not found' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipientIds, conversationName, initialMessage } = body;

    if (!recipientIds || recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    // Determine conversation type
    const conversationType = recipientIds.length > 1 ? 'group' : 'direct';

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        organization_id: membership.organization_id,
        conversation_type: conversationType,
        name: conversationName,
        created_by: user.id,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    // Add participants (including sender)
    const participantIds = [user.id, ...recipientIds];
    const uniqueParticipantIds = [...new Set(participantIds)]; // Remove duplicates

    const participants = uniqueParticipantIds.map((userId) => ({
      organization_id: membership.organization_id,
      conversation_id: conversation.id,
      user_id: userId,
    }));

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (partError) {
      console.error('Error adding participants:', partError);
      // Rollback: delete the conversation
      await supabase.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json(
        { error: 'Failed to add participants' },
        { status: 500 }
      );
    }

    // Send initial message if provided
    if (initialMessage) {
      const { error: messageError } = await supabase.from('messages').insert({
        organization_id: membership.organization_id,
        conversation_id: conversation.id,
        sender_id: user.id,
        text: initialMessage,
      });

      if (messageError) {
        console.error('Error sending initial message:', messageError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/chat/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/conversations
 * Update conversation properties (archive, star, etc.)
 */
export async function PATCH(request) {
  try {
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
    const { conversationId, updates } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Update conversation
    const { data: conversation, error: updateError } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/chat/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
