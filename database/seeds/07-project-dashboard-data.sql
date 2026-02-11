-- Seed 07: Project Dashboard Data
-- Seeds project_meetings, project_events, and time_entries for existing projects
--
-- This seed dynamically references existing projects and users so it works
-- regardless of which projects/users exist in the database.
--
-- Run AFTER migration 007_project_dashboard_tables.sql

-- ============================================
-- Helper: Get first project and first user
-- We'll use CTEs to reference existing data dynamically
-- ============================================

DO $$
DECLARE
  v_project_id UUID;
  v_project2_id UUID;
  v_project3_id UUID;
  v_user_id UUID;
  v_user2_id UUID;
  v_meeting1_id UUID;
  v_meeting2_id UUID;
  v_meeting3_id UUID;
  v_meeting4_id UUID;
  v_event1_id UUID;
  v_event2_id UUID;
  v_event3_id UUID;
  v_event4_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get up to 3 projects
  SELECT id INTO v_project_id FROM projects WHERE deleted_at IS NULL ORDER BY last_viewed_at DESC NULLS LAST LIMIT 1;
  SELECT id INTO v_project2_id FROM projects WHERE deleted_at IS NULL AND id != COALESCE(v_project_id, '00000000-0000-0000-0000-000000000000') ORDER BY last_viewed_at DESC NULLS LAST LIMIT 1;
  SELECT id INTO v_project3_id FROM projects WHERE deleted_at IS NULL AND id NOT IN (COALESCE(v_project_id, '00000000-0000-0000-0000-000000000000'), COALESCE(v_project2_id, '00000000-0000-0000-0000-000000000000')) ORDER BY last_viewed_at DESC NULLS LAST LIMIT 1;

  -- Get up to 2 users
  SELECT id INTO v_user_id FROM user_profiles ORDER BY created_at LIMIT 1;
  SELECT id INTO v_user2_id FROM user_profiles WHERE id != COALESCE(v_user_id, '00000000-0000-0000-0000-000000000000') ORDER BY created_at LIMIT 1;

  -- Bail if no projects or users
  IF v_project_id IS NULL OR v_user_id IS NULL THEN
    RAISE NOTICE 'No projects or users found - skipping seed';
    RETURN;
  END IF;

  -- Use second user as fallback to first
  v_user2_id := COALESCE(v_user2_id, v_user_id);
  v_project2_id := COALESCE(v_project2_id, v_project_id);
  v_project3_id := COALESCE(v_project3_id, v_project_id);

  -- ============================================
  -- Meetings for Project 1
  -- ============================================

  -- Meeting 1: Happening now
  v_meeting1_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, location, created_by)
  VALUES (
    v_meeting1_id,
    v_project_id,
    'Sprint Planning - Week Review',
    'Review progress on current sprint tasks and plan next week priorities',
    (v_today + INTERVAL '0 hours')::timestamptz,
    (v_today + INTERVAL '1 hour')::timestamptz,
    'https://meet.google.com/abc-defg-hij',
    NULL,
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Meeting 2: Tomorrow
  v_meeting2_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, location, created_by)
  VALUES (
    v_meeting2_id,
    v_project_id,
    'Design Review with Stakeholders',
    'Present updated mockups and gather feedback from product team',
    (v_today + INTERVAL '1 day 14 hours')::timestamptz,
    (v_today + INTERVAL '1 day 15 hours')::timestamptz,
    'https://meet.google.com/klm-nopq-rst',
    NULL,
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Meeting 3: In 3 days
  v_meeting3_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, location, created_by)
  VALUES (
    v_meeting3_id,
    v_project_id,
    'Technical Architecture Discussion',
    'Deep dive into API design and database optimization strategies',
    (v_today + INTERVAL '3 days 10 hours')::timestamptz,
    (v_today + INTERVAL '3 days 11 hours 30 minutes')::timestamptz,
    NULL,
    'Conference Room B',
    v_user2_id
  ) ON CONFLICT DO NOTHING;

  -- Meeting 4: In 5 days
  v_meeting4_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, location, created_by)
  VALUES (
    v_meeting4_id,
    v_project_id,
    'Client Demo Preparation',
    'Dry run of the client presentation and feature walkthrough',
    (v_today + INTERVAL '5 days 16 hours')::timestamptz,
    (v_today + INTERVAL '5 days 17 hours')::timestamptz,
    'https://zoom.us/j/123456789',
    NULL,
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Meeting attendees
  INSERT INTO project_meeting_attendees (meeting_id, user_id, rsvp_status) VALUES
    (v_meeting1_id, v_user_id, 'accepted'),
    (v_meeting1_id, v_user2_id, 'accepted'),
    (v_meeting2_id, v_user_id, 'accepted'),
    (v_meeting2_id, v_user2_id, 'pending'),
    (v_meeting3_id, v_user_id, 'tentative'),
    (v_meeting3_id, v_user2_id, 'accepted'),
    (v_meeting4_id, v_user_id, 'accepted'),
    (v_meeting4_id, v_user2_id, 'accepted')
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Events for Project 1
  -- ============================================

  -- Event 1: Multi-day event starting today
  v_event1_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event1_id,
    v_project_id,
    'Sprint 12 - Development Phase',
    true,
    'important',
    v_today,
    '09:00',
    v_today + INTERVAL '5 days',
    '17:00',
    'physical',
    NULL,
    'Engineering Floor',
    15,
    'warning',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Event 2: Upcoming online event
  v_event2_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, notification_minutes, color, created_by)
  VALUES (
    v_event2_id,
    v_project_id,
    'Monthly Team Retrospective',
    false,
    'upcoming',
    v_today + INTERVAL '7 days',
    '14:00',
    v_today + INTERVAL '7 days',
    '15:30',
    'online',
    'https://meet.google.com/retro-monthly',
    30,
    'success',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Event 3: Personal/my_events
  v_event3_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, event_type, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event3_id,
    v_project_id,
    'Code Review Session',
    false,
    'my_events',
    v_today + INTERVAL '2 days',
    '10:00',
    'physical',
    'Dev Room 3',
    15,
    'primary',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Event 4: Hybrid event
  v_event4_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event4_id,
    v_project_id,
    'Quarterly Product Roadmap Review',
    false,
    'important',
    v_today + INTERVAL '14 days',
    '11:00',
    v_today + INTERVAL '14 days',
    '13:00',
    'hybrid',
    'https://zoom.us/j/roadmap-review',
    'Main Board Room',
    45,
    'success',
    v_user2_id
  ) ON CONFLICT DO NOTHING;

  -- Event members
  INSERT INTO project_event_members (event_id, user_id) VALUES
    (v_event1_id, v_user_id),
    (v_event1_id, v_user2_id),
    (v_event2_id, v_user_id),
    (v_event2_id, v_user2_id),
    (v_event3_id, v_user_id),
    (v_event4_id, v_user_id),
    (v_event4_id, v_user2_id)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Time Entries (last 9 days for all 3 projects)
  -- ============================================

  -- Project 1 time entries
  INSERT INTO time_entries (project_id, user_id, hours, date, description) VALUES
    (v_project_id, v_user_id, 6.5, v_today - INTERVAL '8 days', 'API endpoint development'),
    (v_project_id, v_user_id, 7.0, v_today - INTERVAL '7 days', 'Database schema design'),
    (v_project_id, v_user_id, 5.5, v_today - INTERVAL '6 days', 'Frontend component work'),
    (v_project_id, v_user_id, 8.0, v_today - INTERVAL '5 days', 'Integration testing'),
    (v_project_id, v_user_id, 4.0, v_today - INTERVAL '4 days', 'Code review and fixes'),
    (v_project_id, v_user_id, 7.5, v_today - INTERVAL '3 days', 'Feature implementation'),
    (v_project_id, v_user_id, 6.0, v_today - INTERVAL '2 days', 'Bug fixes and optimization'),
    (v_project_id, v_user_id, 3.5, v_today - INTERVAL '1 day', 'Documentation updates'),
    (v_project_id, v_user_id, 2.0, v_today, 'Sprint planning prep')
  ON CONFLICT DO NOTHING;

  -- Project 2 time entries (if different from project 1)
  IF v_project2_id != v_project_id THEN
    INSERT INTO time_entries (project_id, user_id, hours, date, description) VALUES
      (v_project2_id, v_user_id, 3.0, v_today - INTERVAL '8 days', 'Requirements gathering'),
      (v_project2_id, v_user_id, 5.0, v_today - INTERVAL '7 days', 'Wireframe design'),
      (v_project2_id, v_user_id, 4.5, v_today - INTERVAL '6 days', 'Prototype development'),
      (v_project2_id, v_user_id, 6.0, v_today - INTERVAL '5 days', 'User testing setup'),
      (v_project2_id, v_user_id, 2.5, v_today - INTERVAL '4 days', 'Feedback analysis'),
      (v_project2_id, v_user_id, 7.0, v_today - INTERVAL '3 days', 'Iteration on designs'),
      (v_project2_id, v_user_id, 5.5, v_today - INTERVAL '2 days', 'Component development'),
      (v_project2_id, v_user_id, 4.0, v_today - INTERVAL '1 day', 'Testing and QA'),
      (v_project2_id, v_user_id, 1.5, v_today, 'Status reporting')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Project 3 time entries (if different from projects 1 and 2)
  IF v_project3_id != v_project_id AND v_project3_id != v_project2_id THEN
    INSERT INTO time_entries (project_id, user_id, hours, date, description) VALUES
      (v_project3_id, v_user2_id, 4.0, v_today - INTERVAL '8 days', 'Security audit preparation'),
      (v_project3_id, v_user2_id, 3.5, v_today - INTERVAL '7 days', 'Vulnerability scanning'),
      (v_project3_id, v_user2_id, 6.0, v_today - INTERVAL '6 days', 'Penetration testing'),
      (v_project3_id, v_user2_id, 5.0, v_today - INTERVAL '5 days', 'Report compilation'),
      (v_project3_id, v_user2_id, 7.5, v_today - INTERVAL '4 days', 'Remediation planning'),
      (v_project3_id, v_user2_id, 8.0, v_today - INTERVAL '3 days', 'Fix implementation'),
      (v_project3_id, v_user2_id, 4.5, v_today - INTERVAL '2 days', 'Regression testing'),
      (v_project3_id, v_user2_id, 3.0, v_today - INTERVAL '1 day', 'Final review'),
      (v_project3_id, v_user2_id, 2.0, v_today, 'Compliance documentation')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Second user time entries for project 1
  INSERT INTO time_entries (project_id, user_id, hours, date, description) VALUES
    (v_project_id, v_user2_id, 4.0, v_today - INTERVAL '8 days', 'UI design review'),
    (v_project_id, v_user2_id, 5.5, v_today - INTERVAL '7 days', 'Component styling'),
    (v_project_id, v_user2_id, 3.0, v_today - INTERVAL '6 days', 'Accessibility testing'),
    (v_project_id, v_user2_id, 6.5, v_today - INTERVAL '5 days', 'Performance optimization'),
    (v_project_id, v_user2_id, 4.0, v_today - INTERVAL '4 days', 'Cross-browser testing'),
    (v_project_id, v_user2_id, 7.0, v_today - INTERVAL '3 days', 'Mobile responsive fixes'),
    (v_project_id, v_user2_id, 5.0, v_today - INTERVAL '2 days', 'Animation implementation'),
    (v_project_id, v_user2_id, 2.5, v_today - INTERVAL '1 day', 'Code cleanup'),
    (v_project_id, v_user2_id, 1.0, v_today, 'Morning standup notes')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seeded dashboard data for projects: %, %, %', v_project_id, v_project2_id, v_project3_id;
END $$;
