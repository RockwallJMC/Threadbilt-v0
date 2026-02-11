# Dashboard Real Data Design

**Date:** 2026-02-11
**Goal:** When a project is selected on `/dashboard/project`, load Gantt chart, product roadmap, meetings, events, and hours from real Supabase data. No static/mock data fallback. If no data, show blank.

## Problem

The dashboard at `src/components/sections/dashboards/project/index.jsx` has SWR hooks wired to Supabase, but every widget falls back to static mock data from `src/data/project/dashboard.js` when the DB returns empty. There's also an auto-seeder that injects fake data into empty projects.

Three database tables needed by the hooks don't exist yet: `project_meetings`, `project_events`, `time_entries`.

## Changes

### 1. Database Migration

Create `database/migrations/007_project_dashboard_tables.sql`:

**Tables:**
- `project_meetings` (id, project_id, title, description, start_time, end_time, meeting_link, location, created_by, created_at, updated_at)
- `project_meeting_attendees` (id, meeting_id, user_id, rsvp_status)
- `project_events` (id, project_id, title, all_day_event, category, start_date, start_time, end_date, end_time, event_type, virtual_link, physical_location, notification_minutes, color, created_by, created_at, updated_at)
- `project_event_members` (id, event_id, user_id)
- `time_entries` (id, project_id, user_id, hours, date, description, created_at, updated_at)

All with:
- FKs to `projects(id)`, `user_profiles(id)`
- RLS enabled
- Policies matching existing project table patterns

### 2. Seed Data

Create `database/seeds/07-project-dashboard-data.sql` with sample meetings, events, and time entries for existing projects.

### 3. Dashboard Code

In `src/components/sections/dashboards/project/index.jsx`:
- Remove all imports from `data/project/dashboard`
- Remove `useSeedProjectData` hook and auto-seed useEffect
- Change fallbacks: `return []` instead of mock data

### 4. Widget Guards

Add null/empty guards in:
- TaskSummary (`.map()` crash)
- ProductRoadmap (`.map()` crash)
- ScheduleMeeting (`.map()` crash)
- ProjectDeadlines (`.map()` crash)
