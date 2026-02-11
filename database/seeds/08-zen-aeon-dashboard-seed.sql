-- Seed 08: Zen Aeon Project Dashboard Data
-- Seeds additional tasks across all columns for rich Gantt chart display,
-- plus meetings, events, and time entries for this specific project.
--
-- Zen Aeon project ID: de7be0a8-8f27-43e1-a9b8-16a2ff2f343e
-- Columns:
--   To Do:       2137825a-d349-4df1-85ef-b0e3b189915a
--   In Progress: 3b16c965-4a1b-4c1e-9631-ef54d1c0770e
--   Review:      42157e0b-3a4c-4a11-bbaa-3a68f7b98d4e
--   Completed:   a0dd5864-927e-49ce-bb23-8a40a38578d6

DO $$
DECLARE
  v_project_id UUID := 'de7be0a8-8f27-43e1-a9b8-16a2ff2f343e';
  v_col_todo UUID := '2137825a-d349-4df1-85ef-b0e3b189915a';
  v_col_progress UUID := '3b16c965-4a1b-4c1e-9631-ef54d1c0770e';
  v_col_review UUID := '42157e0b-3a4c-4a11-bbaa-3a68f7b98d4e';
  v_col_completed UUID := 'a0dd5864-927e-49ce-bb23-8a40a38578d6';
  v_user_id UUID;
  v_user2_id UUID;
  v_today DATE := CURRENT_DATE;
  v_meeting1_id UUID;
  v_meeting2_id UUID;
  v_meeting3_id UUID;
  v_meeting4_id UUID;
  v_event1_id UUID;
  v_event2_id UUID;
  v_event3_id UUID;
  v_event4_id UUID;
BEGIN
  -- Get users from project members
  SELECT pm.user_id INTO v_user_id
  FROM project_members pm WHERE pm.project_id = v_project_id LIMIT 1;

  -- Fallback to any user
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM user_profiles ORDER BY created_at LIMIT 1;
  END IF;

  SELECT id INTO v_user2_id FROM user_profiles WHERE id != v_user_id ORDER BY created_at LIMIT 1;
  v_user2_id := COALESCE(v_user2_id, v_user_id);

  -- ============================================
  -- Additional Tasks for Gantt Chart
  -- Spread across all columns with proper date ranges
  -- ============================================

  -- TO DO column tasks (upcoming work)
  INSERT INTO project_tasks (project_id, column_id, title, description, priority, due_date, sort_order, created_by, created_at)
  VALUES
    (v_project_id, v_col_todo, 'Performance benchmarking', 'Run load tests and establish baseline metrics', 'high', v_today + INTERVAL '10 days', 2, v_user_id, v_today - INTERVAL '2 days'),
    (v_project_id, v_col_todo, 'Mobile responsive audit', 'Test all views on tablet and phone breakpoints', 'medium', v_today + INTERVAL '14 days', 3, v_user_id, v_today - INTERVAL '1 day'),
    (v_project_id, v_col_todo, 'Accessibility compliance', 'WCAG 2.1 AA audit and remediation plan', 'high', v_today + INTERVAL '18 days', 4, v_user2_id, v_today),
    (v_project_id, v_col_todo, 'Data migration scripts', 'Write ETL scripts for legacy data import', 'medium', v_today + INTERVAL '21 days', 5, v_user_id, v_today)
  ON CONFLICT DO NOTHING;

  -- IN PROGRESS column tasks (active work with varied timelines)
  INSERT INTO project_tasks (project_id, column_id, title, description, priority, due_date, sort_order, created_by, created_at)
  VALUES
    (v_project_id, v_col_progress, 'Authentication flow redesign', 'Implement OAuth2 + MFA support', 'urgent', v_today + INTERVAL '5 days', 6, v_user_id, v_today - INTERVAL '12 days'),
    (v_project_id, v_col_progress, 'Real-time notifications', 'WebSocket integration for live alerts', 'high', v_today + INTERVAL '8 days', 7, v_user2_id, v_today - INTERVAL '8 days'),
    (v_project_id, v_col_progress, 'Search indexing service', 'Elasticsearch integration for full-text search', 'medium', v_today + INTERVAL '12 days', 8, v_user_id, v_today - INTERVAL '6 days')
  ON CONFLICT DO NOTHING;

  -- REVIEW column tasks (pending approval)
  INSERT INTO project_tasks (project_id, column_id, title, description, priority, due_date, sort_order, created_by, created_at)
  VALUES
    (v_project_id, v_col_review, 'Payment gateway integration', 'Stripe + PayPal checkout flow', 'urgent', v_today + INTERVAL '2 days', 0, v_user_id, v_today - INTERVAL '18 days'),
    (v_project_id, v_col_review, 'Email template system', 'Transactional email templates with SendGrid', 'medium', v_today + INTERVAL '4 days', 1, v_user2_id, v_today - INTERVAL '14 days'),
    (v_project_id, v_col_review, 'CI/CD pipeline setup', 'GitHub Actions with staging + production deploys', 'high', v_today + INTERVAL '3 days', 2, v_user_id, v_today - INTERVAL '10 days'),
    (v_project_id, v_col_review, 'API rate limiting', 'Implement throttling middleware with Redis', 'medium', v_today + INTERVAL '5 days', 3, v_user2_id, v_today - INTERVAL '9 days')
  ON CONFLICT DO NOTHING;

  -- COMPLETED column tasks (done work for chart context)
  INSERT INTO project_tasks (project_id, column_id, title, description, priority, due_date, sort_order, created_by, created_at)
  VALUES
    (v_project_id, v_col_completed, 'Database schema design', 'Designed and migrated all core tables', 'high', v_today - INTERVAL '5 days', 0, v_user_id, v_today - INTERVAL '25 days'),
    (v_project_id, v_col_completed, 'Design system setup', 'MUI theme config, typography, color tokens', 'high', v_today - INTERVAL '8 days', 1, v_user2_id, v_today - INTERVAL '22 days'),
    (v_project_id, v_col_completed, 'Project scaffolding', 'Next.js App Router + folder structure + ESLint', 'medium', v_today - INTERVAL '12 days', 2, v_user_id, v_today - INTERVAL '30 days'),
    (v_project_id, v_col_completed, 'User profile CRUD', 'Full create/read/update with avatar upload', 'medium', v_today - INTERVAL '3 days', 3, v_user2_id, v_today - INTERVAL '15 days'),
    (v_project_id, v_col_completed, 'Role-based permissions', 'RLS policies for admin/manager/member roles', 'urgent', v_today - INTERVAL '6 days', 4, v_user_id, v_today - INTERVAL '20 days')
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Meetings for Zen Aeon
  -- ============================================

  v_meeting1_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, created_by)
  VALUES (
    v_meeting1_id, v_project_id,
    'Zen Aeon Sprint Planning',
    'Plan sprint 4 tasks and assign story points',
    (v_today + INTERVAL '10 minutes')::timestamptz,
    (v_today + INTERVAL '1 hour 10 minutes')::timestamptz,
    'https://meet.google.com/zen-sprint-plan',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  v_meeting2_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, created_by)
  VALUES (
    v_meeting2_id, v_project_id,
    'Design Review - Dashboard V2',
    'Walk through new dashboard mockups with the team',
    (v_today + INTERVAL '1 day 14 hours')::timestamptz,
    (v_today + INTERVAL '1 day 15 hours')::timestamptz,
    'https://meet.google.com/zen-design-review',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  v_meeting3_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, location, created_by)
  VALUES (
    v_meeting3_id, v_project_id,
    'Architecture Deep Dive',
    'Review microservices vs monolith decision for Zen Aeon backend',
    (v_today + INTERVAL '3 days 10 hours')::timestamptz,
    (v_today + INTERVAL '3 days 12 hours')::timestamptz,
    'Engineering Room B',
    v_user2_id
  ) ON CONFLICT DO NOTHING;

  v_meeting4_id := gen_random_uuid();
  INSERT INTO project_meetings (id, project_id, title, description, start_time, end_time, meeting_link, created_by)
  VALUES (
    v_meeting4_id, v_project_id,
    'Client Demo - Milestone 2',
    'Present completed features to stakeholders',
    (v_today + INTERVAL '6 days 16 hours')::timestamptz,
    (v_today + INTERVAL '6 days 17 hours 30 minutes')::timestamptz,
    'https://zoom.us/j/zen-aeon-demo',
    v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Meeting attendees
  INSERT INTO project_meeting_attendees (meeting_id, user_id, rsvp_status) VALUES
    (v_meeting1_id, v_user_id, 'accepted'),
    (v_meeting1_id, v_user2_id, 'accepted'),
    (v_meeting2_id, v_user_id, 'accepted'),
    (v_meeting2_id, v_user2_id, 'tentative'),
    (v_meeting3_id, v_user_id, 'accepted'),
    (v_meeting3_id, v_user2_id, 'accepted'),
    (v_meeting4_id, v_user_id, 'accepted'),
    (v_meeting4_id, v_user2_id, 'accepted')
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Events for Zen Aeon
  -- ============================================

  v_event1_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event1_id, v_project_id,
    'Sprint 4 - Development Phase',
    true, 'important',
    v_today, '09:00',
    v_today + INTERVAL '10 days', '17:00',
    'physical', 'Engineering Floor',
    15, 'warning', v_user_id
  ) ON CONFLICT DO NOTHING;

  v_event2_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, notification_minutes, color, created_by)
  VALUES (
    v_event2_id, v_project_id,
    'Zen Aeon Retrospective',
    false, 'upcoming',
    v_today + INTERVAL '10 days', '14:00',
    v_today + INTERVAL '10 days', '15:30',
    'online', 'https://meet.google.com/zen-retro',
    30, 'success', v_user_id
  ) ON CONFLICT DO NOTHING;

  v_event3_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, event_type, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event3_id, v_project_id,
    'Code Freeze - Release Candidate',
    false, 'important',
    v_today + INTERVAL '8 days', '18:00',
    'physical', 'All environments',
    60, 'error', v_user2_id
  ) ON CONFLICT DO NOTHING;

  v_event4_id := gen_random_uuid();
  INSERT INTO project_events (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, physical_location, notification_minutes, color, created_by)
  VALUES (
    v_event4_id, v_project_id,
    'Milestone 2 Launch Party',
    false, 'my_events',
    v_today + INTERVAL '14 days', '17:00',
    v_today + INTERVAL '14 days', '19:00',
    'hybrid', 'https://zoom.us/j/zen-party',
    'Main Lounge', 30, 'primary', v_user_id
  ) ON CONFLICT DO NOTHING;

  -- Event members
  INSERT INTO project_event_members (event_id, user_id) VALUES
    (v_event1_id, v_user_id),
    (v_event1_id, v_user2_id),
    (v_event2_id, v_user_id),
    (v_event2_id, v_user2_id),
    (v_event3_id, v_user_id),
    (v_event3_id, v_user2_id),
    (v_event4_id, v_user_id),
    (v_event4_id, v_user2_id)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- Time Entries for Zen Aeon (last 9 days)
  -- ============================================

  INSERT INTO time_entries (project_id, user_id, hours, date, description) VALUES
    (v_project_id, v_user_id, 7.0, v_today - INTERVAL '8 days', 'Auth flow implementation'),
    (v_project_id, v_user_id, 6.5, v_today - INTERVAL '7 days', 'Payment gateway research'),
    (v_project_id, v_user_id, 8.0, v_today - INTERVAL '6 days', 'Stripe integration coding'),
    (v_project_id, v_user_id, 5.5, v_today - INTERVAL '5 days', 'API endpoint development'),
    (v_project_id, v_user_id, 7.5, v_today - INTERVAL '4 days', 'Database query optimization'),
    (v_project_id, v_user_id, 6.0, v_today - INTERVAL '3 days', 'Frontend dashboard components'),
    (v_project_id, v_user_id, 4.5, v_today - INTERVAL '2 days', 'Code review and PR merges'),
    (v_project_id, v_user_id, 3.0, v_today - INTERVAL '1 day', 'Bug fixes and testing'),
    (v_project_id, v_user_id, 2.0, v_today, 'Sprint planning preparation'),
    (v_project_id, v_user2_id, 5.0, v_today - INTERVAL '8 days', 'UI component development'),
    (v_project_id, v_user2_id, 6.0, v_today - INTERVAL '7 days', 'Design system refinement'),
    (v_project_id, v_user2_id, 4.0, v_today - INTERVAL '6 days', 'Responsive layout testing'),
    (v_project_id, v_user2_id, 7.0, v_today - INTERVAL '5 days', 'Email template coding'),
    (v_project_id, v_user2_id, 5.5, v_today - INTERVAL '4 days', 'CI/CD pipeline config'),
    (v_project_id, v_user2_id, 8.0, v_today - INTERVAL '3 days', 'Integration testing'),
    (v_project_id, v_user2_id, 3.5, v_today - INTERVAL '2 days', 'Documentation updates'),
    (v_project_id, v_user2_id, 2.5, v_today - INTERVAL '1 day', 'Accessibility audit'),
    (v_project_id, v_user2_id, 1.5, v_today, 'Morning standup notes')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seeded Zen Aeon dashboard data: project_id=%', v_project_id;
END $$;
