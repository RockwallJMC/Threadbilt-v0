import { createApiClient } from '@/lib/supabase/api-server';
import { NextResponse } from 'next/server';

/**
 * POST /api/chat/messages/[id]/reactions
 * Add a reaction to a message
 */
export async function POST(request, { params }) {
  try {
    const { id: messageId } = params;
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
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Verify message exists and user is a participant in the conversation
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select(
        `
        id,
        organization_id,
        conversation_id,
        conversation:conversations(
          participants:conversation_participants!inner(
            user_id
          )
        )
      `
      )
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is a participant
    const isParticipant = message.conversation.participants.some(
      (p) => p.user_id === user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Check if reaction already exists (toggle behavior)
    const { data: existingReaction } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existingReaction) {
      // Remove reaction (toggle off)
      const { error: deleteError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error removing reaction:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove reaction' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Reaction removed', removed: true },
        { status: 200 }
      );
    }

    // Add new reaction
    const { data: reaction, error: reactionError } = await supabase
      .from('message_reactions')
      .insert({
        organization_id: message.organization_id,
        message_id: messageId,
        user_id: user.id,
        emoji,
      })
      .select()
      .single();

    if (reactionError) {
      console.error('Error adding reaction:', reactionError);
      return NextResponse.json(
        { error: 'Failed to add reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reaction, added: true }, { status: 201 });
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/chat/messages/[id]/reactions:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/messages/[id]/reactions
 * Remove a specific reaction from a message
 */
export async function DELETE(request, { params }) {
  try {
    const { id: messageId } = params;
    const supabase = createApiClient(request);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get emoji from query params
    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Delete the reaction
    const { error: deleteError } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (deleteError) {
      console.error('Error removing reaction:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Reaction removed' },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/chat/messages/[id]/reactions:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
