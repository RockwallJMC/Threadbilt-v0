-- Migration: Chat App Enhancements
-- Description: Add missing tables and fields for full chat functionality
-- Date: 2026-01-31
-- Author: Claude (supabase-database-architect)

-- ============================================================================
-- PART 1: Update existing conversations table
-- ============================================================================

-- Add missing fields to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- Add constraint for conversation_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_conversation_type'
  ) THEN
    ALTER TABLE conversations
    ADD CONSTRAINT check_conversation_type
    CHECK (conversation_type IN ('direct', 'group'));
  END IF;
END$$;

-- Update is_group field to match conversation_type (migration helper)
UPDATE conversations
SET conversation_type = CASE WHEN is_group THEN 'group' ELSE 'direct' END
WHERE conversation_type IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_org_updated
  ON conversations(organization_id, updated_at DESC);

-- ============================================================================
-- PART 2: Update existing conversation_participants table
-- ============================================================================

-- Add missing fields to conversation_participants table
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS muted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill organization_id from conversations table
UPDATE conversation_participants cp
SET organization_id = c.organization_id
FROM conversations c
WHERE cp.conversation_id = c.id
  AND cp.organization_id IS NULL;

-- Make organization_id NOT NULL after backfill
ALTER TABLE conversation_participants
ALTER COLUMN organization_id SET NOT NULL;

-- Rename is_starred to starred for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'is_starred'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'starred'
  ) THEN
    ALTER TABLE conversation_participants RENAME COLUMN is_starred TO starred;
  END IF;
END$$;

-- Rename is_muted to muted for consistency
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'is_muted'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_participants' AND column_name = 'muted'
  ) THEN
    ALTER TABLE conversation_participants RENAME COLUMN is_muted TO muted;
  END IF;
END$$;

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversation_participants_conversation_id_user_id_key'
  ) THEN
    ALTER TABLE conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_user_id_key
    UNIQUE(conversation_id, user_id);
  END IF;
END$$;

-- ============================================================================
-- PART 3: Update existing messages table
-- ============================================================================

-- Add missing fields to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Migrate existing content to text field
UPDATE messages
SET text = content
WHERE text IS NULL AND content IS NOT NULL;

-- Add constraint for message_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_message_type'
  ) THEN
    ALTER TABLE messages
    ADD CONSTRAINT check_message_type
    CHECK (message_type IN ('text', 'media', 'file', 'system'));
  END IF;
END$$;

-- ============================================================================
-- PART 4: Create message_attachments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

  -- Attachment metadata
  attachment_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,

  -- Storage reference
  storage_bucket TEXT NOT NULL DEFAULT 'chat-media',
  storage_path TEXT NOT NULL,

  -- Media-specific metadata
  thumbnail_path TEXT,
  duration INTEGER,  -- For audio/video (seconds)
  width INTEGER,     -- For images/videos
  height INTEGER,    -- For images/videos

  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT check_attachment_type
    CHECK (attachment_type IN ('image', 'video', 'audio', 'file'))
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message
  ON message_attachments(message_id);

-- Enable RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations"
  ON message_attachments FOR SELECT
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can upload attachments to their messages"
  ON message_attachments FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid() AND m.sender_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 5: Create message_reactions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  emoji TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message
  ON message_reactions(message_id);

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations"
  ON message_reactions FOR SELECT
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions to messages"
  ON message_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 6: Create message_read_receipts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  read_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message
  ON message_read_receipts(message_id);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user
  ON message_read_receipts(user_id);

-- Enable RLS
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts in their conversations"
  ON message_read_receipts FOR SELECT
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON message_read_receipts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PART 7: Create trigger to update conversation.last_message_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- PART 8: Comments for documentation
-- ============================================================================

COMMENT ON TABLE message_attachments IS 'Stores file attachments for chat messages';
COMMENT ON TABLE message_reactions IS 'Stores emoji reactions to messages';
COMMENT ON TABLE message_read_receipts IS 'Tracks which users have read which messages';

COMMENT ON COLUMN conversations.conversation_type IS 'Type: direct (1-on-1) or group (multiple participants)';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of most recent message, denormalized for sorting';
COMMENT ON COLUMN conversation_participants.unread_count IS 'Denormalized count of unread messages for this user';
COMMENT ON COLUMN messages.text IS 'Message text content';
COMMENT ON COLUMN messages.message_type IS 'Type: text, media, file, or system';
COMMENT ON COLUMN message_attachments.storage_path IS 'Path to file in Supabase Storage bucket';
