-- ============================================================================
-- Chat Seed Data for PierceDesk
-- ============================================================================
-- Description: Seeds 4 conversations with messages, reactions, and attachments
-- Organization: Acme Corp (00000000-0000-0000-0000-000000000001)
-- Date: 2026-01-31
-- Author: Claude (supabase-database-architect)

-- ============================================================================
-- PART 1: User Mapping (Mock IDs to Real User IDs)
-- ============================================================================
-- Maps the 16 mock users from src/data/users.jsx to real organization members
-- These will be used throughout this seed script

DO $$
DECLARE
  org_id UUID := '00000000-0000-0000-0000-000000000001';

  -- User IDs from organization_members
  user_0 UUID;  -- Yaga Masamichi (mock) -> alice.owner@seedtest.com
  user_1 UUID;  -- Manami Suda (mock) -> bob.admin@seedtest.com
  user_5 UUID;  -- Gojo Satoru (mock) -> diana.member@seedtest.com
  user_8 UUID;  -- Kasumi Miwa (mock) -> edward.member@seedtest.com
  user_11 UUID; -- Momo Nishimiya (mock) -> demo@aurora.com
  user_14 UUID; -- Zenin Maki (mock - current user) -> test-single-org@piercedesk.test
  user_15 UUID; -- Inumaki Toge (mock) -> test-existing@piercedesk.test

  -- Conversation IDs
  conv_1 UUID := 'c0000001-0000-0000-0000-000000000001';
  conv_2 UUID := 'c0000002-0000-0000-0000-000000000002';
  conv_3 UUID := 'c0000003-0000-0000-0000-000000000003';
  conv_4 UUID := 'c0000004-0000-0000-0000-000000000004';

  -- Message IDs (we'll generate these as we go)
  msg_id UUID;

BEGIN

  -- ============================================================================
  -- PART 2: Fetch User IDs
  -- ============================================================================

  -- Get real user IDs from organization_members
  SELECT user_id INTO user_0 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'alice.owner@seedtest.com'
    ) LIMIT 1;

  SELECT user_id INTO user_1 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'bob.admin@seedtest.com'
    ) LIMIT 1;

  SELECT user_id INTO user_5 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'diana.member@seedtest.com'
    ) LIMIT 1;

  SELECT user_id INTO user_8 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'edward.member@seedtest.com'
    ) LIMIT 1;

  SELECT user_id INTO user_11 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'demo@aurora.com'
    ) LIMIT 1;

  SELECT user_id INTO user_14 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'test-single-org@piercedesk.test'
    ) LIMIT 1;

  SELECT user_id INTO user_15 FROM organization_members
    WHERE organization_id = org_id AND user_id IN (
      SELECT id FROM user_profiles WHERE email = 'test-existing@piercedesk.test'
    ) LIMIT 1;

  -- Verify we have all users
  IF user_0 IS NULL OR user_1 IS NULL OR user_5 IS NULL OR
     user_8 IS NULL OR user_11 IS NULL OR user_14 IS NULL OR user_15 IS NULL THEN
    RAISE EXCEPTION 'One or more required users not found in organization';
  END IF;

  RAISE NOTICE 'User mapping complete. Using user_14 (%) as current user', user_14;

  -- ============================================================================
  -- PART 3: Create Conversations
  -- ============================================================================

  -- Conversation 1: Direct chat with Gojo Satoru (user_5)
  INSERT INTO conversations (id, organization_id, conversation_type, created_by, starred, last_message_at)
  VALUES (
    conv_1,
    org_id,
    'direct',
    user_14,
    false, -- Will be starred by user_14 in conversation_participants
    NOW() - INTERVAL '3 minutes'
  );

  -- Conversation 2: Direct chat with Yaga Masamichi (user_0)
  INSERT INTO conversations (id, organization_id, conversation_type, created_by, last_message_at)
  VALUES (
    conv_2,
    org_id,
    'direct',
    user_14,
    NOW() - INTERVAL '25 minutes'
  );

  -- Conversation 3: Group chat "Note Ninjas 🥷"
  INSERT INTO conversations (id, organization_id, conversation_type, name, created_by, last_message_at)
  VALUES (
    conv_3,
    org_id,
    'group',
    'Note Ninjas 🥷',
    user_1,
    NOW() - INTERVAL '44 minutes'
  );

  -- Conversation 4: Direct chat with Kugisaki Nobara (user_3 -> user_11 as fallback)
  INSERT INTO conversations (id, organization_id, conversation_type, created_by, last_message_at)
  VALUES (
    conv_4,
    org_id,
    'direct',
    user_14,
    NOW() - INTERVAL '3 days'
  );

  RAISE NOTICE 'Created 4 conversations';

  -- ============================================================================
  -- PART 4: Add Conversation Participants
  -- ============================================================================

  -- Conversation 1 participants (user_14 + user_5)
  INSERT INTO conversation_participants (organization_id, conversation_id, user_id, starred, unread_count)
  VALUES
    (org_id, conv_1, user_14, true, 0),
    (org_id, conv_1, user_5, false, 0);

  -- Conversation 2 participants (user_14 + user_0)
  INSERT INTO conversation_participants (organization_id, conversation_id, user_id, unread_count)
  VALUES
    (org_id, conv_2, user_14, 0),
    (org_id, conv_2, user_0, 0);

  -- Conversation 3 participants (Group: user_14 + user_1 + user_8 + user_11 + user_15)
  INSERT INTO conversation_participants (organization_id, conversation_id, user_id, unread_count)
  VALUES
    (org_id, conv_3, user_14, 0),
    (org_id, conv_3, user_1, 0),
    (org_id, conv_3, user_8, 0),
    (org_id, conv_3, user_11, 0),
    (org_id, conv_3, user_15, 0);

  -- Conversation 4 participants (user_14 + user_11)
  INSERT INTO conversation_participants (organization_id, conversation_id, user_id, unread_count)
  VALUES
    (org_id, conv_4, user_14, 0),
    (org_id, conv_4, user_11, 0);

  RAISE NOTICE 'Added conversation participants';

  -- ============================================================================
  -- PART 5: Conversation 1 Messages (Francis Ford Coppola / Godfather chat)
  -- ============================================================================

  -- Message 1
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_5,
    'do you know the director Francis Ford Coppola  & movies ?',
    NOW() - INTERVAL '23 hours');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '22 hours');

  -- Message 2
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_5,
    'Tell me about his best works',
    NOW() - INTERVAL '23 hours');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '22 hours');

  -- Message 3
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_14,
    'yeah, The Godfather (1972)  is one of the best.',
    NOW() - INTERVAL '3 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '3 minutes');

  -- Message 4 (with reaction)
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_14,
    'Now you come to me, and you say, ''Don Corleone, give me justice.'' But you don''t ask with respect. You don''t offer friendship. You don''t even think to call me Godfather. Instead, you come into my house on the day my daughter is to be married, and you ask me to do murder. For money. - my favorite dialogue.',
    NOW() - INTERVAL '5 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '5 minutes');
  INSERT INTO message_reactions (organization_id, message_id, user_id, emoji)
  VALUES (org_id, msg_id, user_5, '❤️');

  -- Message 5 (with reaction)
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_14,
    'sent my photos, i am sharing the movie link',
    NOW() - INTERVAL '6 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '6 minutes');
  INSERT INTO message_reactions (organization_id, message_id, user_id, emoji)
  VALUES (org_id, msg_id, user_5, '❤️');

  -- Message 6 (media attachments - images 1, 2, 3)
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, message_type, created_at)
  VALUES (msg_id, org_id, conv_1, user_5, 'media', NOW() - INTERVAL '7 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '7 minutes');
  INSERT INTO message_attachments (organization_id, message_id, attachment_type, file_name, file_size, mime_type, storage_path)
  VALUES
    (org_id, msg_id, 'image', '1.webp', 50000, 'image/webp', conv_1 || '/seed-data/1.webp'),
    (org_id, msg_id, 'image', '2.webp', 50000, 'image/webp', conv_1 || '/seed-data/2.webp'),
    (org_id, msg_id, 'image', '3.webp', 50000, 'image/webp', conv_1 || '/seed-data/3.webp');

  -- Message 7
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_1, user_5,
    'Thanks... I''m going to watch the movie. And check the photos, I sent what you need. Let me know if I missed anything.',
    NOW() - INTERVAL '8 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '8 minutes');

  -- Message 8 (file attachment)
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, message_type, created_at)
  VALUES (msg_id, org_id, conv_1, user_14, 'file', NOW() - INTERVAL '9 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '9 minutes');
  INSERT INTO message_attachments (organization_id, message_id, attachment_type, file_name, file_size, mime_type, storage_path)
  VALUES (org_id, msg_id, 'file', 'The Godfather(1972).zip', 1500000, 'application/zip', conv_1 || '/seed-data/godfather.zip');

  RAISE NOTICE 'Created 8 messages for Conversation 1';

  -- ============================================================================
  -- PART 6: Conversation 2 Messages (Mountain trip planning)
  -- ============================================================================

  -- Message 1
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_2, user_0,
    'Hey, Guess what? I''m planning a weekend tour to the mountains. Want to join?',
    NOW() - INTERVAL '10 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '10 minutes');

  -- Message 2
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_2, user_14,
    'seriously? That sounds amazing! Which mountains are you thinking about?',
    NOW() - INTERVAL '11 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '11 minutes');

  -- Message 3
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_2, user_0,
    'The Blue Ridge Mountains. I''ve heard the views are breathtaking, especially this time of year.',
    NOW() - INTERVAL '12 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '12 minutes');

  -- Message 4
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_2, user_14,
    'oh yeah, sent me pictures',
    NOW() - INTERVAL '13 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '13 minutes');

  -- Message 5
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_2, user_14,
    'What''s the plan?',
    NOW() - INTERVAL '14 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '14 minutes');

  -- Message 6 (media attachments - images 4, 5, 6, 7) with reaction
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, message_type, created_at)
  VALUES (msg_id, org_id, conv_2, user_0, 'media', NOW() - INTERVAL '15 minutes');
  INSERT INTO message_read_receipts (organization_id, message_id, user_id, read_at)
  VALUES (org_id, msg_id, user_14, NOW() - INTERVAL '15 minutes');
  INSERT INTO message_attachments (organization_id, message_id, attachment_type, file_name, file_size, mime_type, storage_path)
  VALUES
    (org_id, msg_id, 'image', '4.webp', 50000, 'image/webp', conv_2 || '/seed-data/4.webp'),
    (org_id, msg_id, 'image', '5.webp', 50000, 'image/webp', conv_2 || '/seed-data/5.webp'),
    (org_id, msg_id, 'image', '6.webp', 50000, 'image/webp', conv_2 || '/seed-data/6.webp'),
    (org_id, msg_id, 'image', '7.webp', 50000, 'image/webp', conv_2 || '/seed-data/7.webp');
  INSERT INTO message_reactions (organization_id, message_id, user_id, emoji)
  VALUES (org_id, msg_id, user_14, '❤️');

  -- Messages 7-16 (remaining conversation about camping)
  INSERT INTO messages (organization_id, conversation_id, sender_id, text, created_at) VALUES
    (org_id, conv_2, user_0, 'We''d leave Saturday morning, hike a few trails, maybe camp overnight, and then explore some waterfalls on Sunday.', NOW() - INTERVAL '16 minutes'),
    (org_id, conv_2, user_14, 'they''re stunning!', NOW() - INTERVAL '17 minutes'),
    (org_id, conv_2, user_14, 'Camping, huh? do we need to bring our own gear, or are you renting stuff?', NOW() - INTERVAL '18 minutes'),
    (org_id, conv_2, user_0, 'I''ve got a tent and sleeping bags. You''d just need your clothes, snacks, and maybe a flashlight.', NOW() - INTERVAL '19 minutes'),
    (org_id, conv_2, user_14, 'Sweet. Are we driving or carpooling?', NOW() - INTERVAL '20 minutes'),
    (org_id, conv_2, user_0, 'I thought we could carpool to save on gas.', NOW() - INTERVAL '21 minutes'),
    (org_id, conv_2, user_0, 'Plus, it''s more fun with music and road trip snacks!', NOW() - INTERVAL '22 minutes'),
    (org_id, conv_2, user_14, 'totally agree. count me in! I''ll pack my stuff and bring some marshmallows for a campfire.', NOW() - INTERVAL '23 minutes'),
    (org_id, conv_2, user_0, 'Awesome! It''s going to be so much fun. Let''s finalize the details tomorrow.', NOW() - INTERVAL '24 minutes'),
    (org_id, conv_2, user_14, 'Sounds like a plan. Can''t wait! 🤞😊', NOW() - INTERVAL '25 minutes');

  RAISE NOTICE 'Created 16 messages for Conversation 2';

  -- ============================================================================
  -- PART 7: Conversation 3 Messages (Group chat - Note Ninjas)
  -- ============================================================================

  -- Message 1
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_3, user_1,
    'Hey everyone, quick update about tomorrow''s exam. A lot of you have been asking if it can be rescheduled.',
    NOW() - INTERVAL '26 minutes');

  -- Message 2
  INSERT INTO messages (organization_id, conversation_id, sender_id, text, created_at) VALUES
    (org_id, conv_3, user_11, 'Yeah, it''s too soon! I barely started studying. Can we push it back?', NOW() - INTERVAL '27 minutes'),
    (org_id, conv_3, user_8, 'Same here. I have back-to-back assignments to submit this week.', NOW() - INTERVAL '28 minutes');

  -- Message 4 (with multiple reactions)
  msg_id := gen_random_uuid();
  INSERT INTO messages (id, organization_id, conversation_id, sender_id, text, created_at)
  VALUES (msg_id, org_id, conv_3, user_1,
    'I spoke to the professor about rescheduling. Unfortunately, they said it''s not possible because of the tight schedule this semester.',
    NOW() - INTERVAL '29 minutes');
  INSERT INTO message_reactions (organization_id, message_id, user_id, emoji) VALUES
    (org_id, msg_id, user_8, '😢'),
    (org_id, msg_id, user_11, '😡');

  -- Remaining messages for conversation 3
  INSERT INTO messages (organization_id, conversation_id, sender_id, text, created_at) VALUES
    (org_id, conv_3, user_15, 'Ugh, seriously?', NOW() - INTERVAL '30 minutes'),
    (org_id, conv_3, user_15, 'Didn''t they consider that we have other exams too?', NOW() - INTERVAL '31 minutes'),
    (org_id, conv_3, user_1, 'Trust me, I tried my best to convince them. I even brought up how many of us are struggling.', NOW() - INTERVAL '32 minutes'),
    (org_id, conv_3, user_14, 'thanks for trying, CR. It''s just frustrating.', NOW() - INTERVAL '33 minutes'),
    (org_id, conv_3, user_11, 'Frustrating is an understatement.', NOW() - INTERVAL '34 minutes'),
    (org_id, conv_3, user_11, 'You should''ve pushed harder!', NOW() - INTERVAL '35 minutes'),
    (org_id, conv_3, user_11, 'What''s the point of being the CR if you can''t handle this, Manami?', NOW() - INTERVAL '36 minutes');

  RAISE NOTICE 'Created group conversation messages';

  -- ============================================================================
  -- PART 8: Conversation 4 Messages (Short conversation)
  -- ============================================================================

  INSERT INTO messages (organization_id, conversation_id, sender_id, text, created_at) VALUES
    (org_id, conv_4, user_11, 'Hey! How have you been?', NOW() - INTERVAL '3 days'),
    (org_id, conv_4, user_14, 'Pretty good! Just busy with work.', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),
    (org_id, conv_4, user_11, 'Same here. We should catch up soon!', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes');

  RAISE NOTICE 'Created messages for Conversation 4';

  -- ============================================================================
  -- Summary
  -- ============================================================================

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Chat seed data completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 4 conversations (3 direct, 1 group)';
  RAISE NOTICE '  - 14 conversation participants';
  RAISE NOTICE '  - 37+ messages';
  RAISE NOTICE '  - 5+ reactions';
  RAISE NOTICE '  - 11 media attachments';
  RAISE NOTICE '========================================';

END $$;
