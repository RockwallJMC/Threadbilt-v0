-- Migration 007: Project Dashboard Tables
-- Creates project_meetings, project_events, time_entries and their junction tables
-- These support the /dashboard/project widgets (ScheduleMeeting, Events, HoursCompleted)

-- ============================================
-- 1. project_meetings
-- ============================================
CREATE TABLE IF NOT EXISTS project_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  meeting_link TEXT,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_meetings_project_id ON project_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_meetings_start_time ON project_meetings(start_time);

ALTER TABLE project_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meetings for projects they belong to"
  ON project_meetings FOR SELECT
  USING (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can insert meetings for projects they belong to"
  ON project_meetings FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Meeting creators can update their meetings"
  ON project_meetings FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Meeting creators can delete their meetings"
  ON project_meetings FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- 2. project_meeting_attendees
-- ============================================
CREATE TABLE IF NOT EXISTS project_meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES project_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'tentative')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON project_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON project_meeting_attendees(user_id);

ALTER TABLE project_meeting_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendees for meetings they can see"
  ON project_meeting_attendees FOR SELECT
  USING (
    meeting_id IN (
      SELECT m.id FROM project_meetings m
      JOIN project_members pm ON pm.project_id = m.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage attendees"
  ON project_meeting_attendees FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT m.id FROM project_meetings m
      JOIN project_members pm ON pm.project_id = m.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Attendees can update their own RSVP"
  ON project_meeting_attendees FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Project members can remove attendees"
  ON project_meeting_attendees FOR DELETE
  USING (
    meeting_id IN (
      SELECT m.id FROM project_meetings m
      JOIN project_members pm ON pm.project_id = m.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. project_events
-- ============================================
CREATE TABLE IF NOT EXISTS project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  all_day_event BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'upcoming' CHECK (category IN ('my_events', 'upcoming', 'important')),
  start_date DATE NOT NULL,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  event_type TEXT DEFAULT 'physical' CHECK (event_type IN ('physical', 'online', 'hybrid')),
  virtual_link TEXT,
  physical_location TEXT,
  notification_minutes INTEGER DEFAULT 15,
  color TEXT DEFAULT 'primary',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_events_project_id ON project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_events_start_date ON project_events(start_date);

ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for projects they belong to"
  ON project_events FOR SELECT
  USING (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can insert events for projects they belong to"
  ON project_events FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can update their events"
  ON project_events FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Event creators can delete their events"
  ON project_events FOR DELETE
  USING (created_by = auth.uid());

-- ============================================
-- 4. project_event_members
-- ============================================
CREATE TABLE IF NOT EXISTS project_event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES project_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON project_event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON project_event_members(user_id);

ALTER TABLE project_event_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members for events they can see"
  ON project_event_members FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM project_events e
      JOIN project_members pm ON pm.project_id = e.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can manage event members"
  ON project_event_members FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM project_events e
      JOIN project_members pm ON pm.project_id = e.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can remove event members"
  ON project_event_members FOR DELETE
  USING (
    event_id IN (
      SELECT e.id FROM project_events e
      JOIN project_members pm ON pm.project_id = e.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. time_entries
-- ============================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time entries for projects they belong to"
  ON time_entries FOR SELECT
  USING (
    project_id IN (
      SELECT pm.project_id FROM project_members pm
      WHERE pm.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert their own time entries"
  ON time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
  ON time_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
  ON time_entries FOR DELETE
  USING (user_id = auth.uid());
