# Migration 007: Project Dashboard Tables

## Overview

Creates 5 new tables to support the `/dashboard/project` widgets:
- `project_meetings` - Meeting scheduling
- `project_meeting_attendees` - Meeting participants and RSVP
- `project_events` - Project events and milestones
- `project_event_members` - Event participants
- `time_entries` - Time tracking for projects

## Status

⏳ **Pending Manual Execution**

## Quick Start

### Method 1: Copy-Paste to Supabase Dashboard (Recommended)

1. **Execute Migration (Create Tables)**
   - Open [Supabase SQL Editor](https://app.supabase.com/project/iixfjulmrexivuehoxti/sql)
   - Copy contents of `007_project_dashboard_tables.sql`
   - Paste and click "Run"

2. **Execute Seed Data (Sample Data)**
   - In the same SQL Editor
   - Copy contents of `../seeds/07-project-dashboard-data.sql`
   - Paste and click "Run"

3. **Verify Migration**
   ```bash
   node database/migrations/verify-migration-007.mjs
   ```

### Method 2: Using Prepared Scripts

```bash
# Display SQL for copy-paste
node database/migrations/prepare-migration-007.mjs

# After manual execution, verify
node database/migrations/verify-migration-007.mjs
```

## What This Migration Creates

### Tables

**1. project_meetings**
- Core meeting data (title, description, times, links, location)
- Foreign key to `projects` table
- Created by user tracking

**2. project_meeting_attendees**
- Junction table for meeting participants
- RSVP status tracking (pending, accepted, declined, tentative)
- Unique constraint on (meeting_id, user_id)

**3. project_events**
- Project events (physical, online, hybrid)
- All-day or timed events
- Categories: my_events, upcoming, important
- Optional virtual link and physical location

**4. project_event_members**
- Junction table for event participants
- Unique constraint on (event_id, user_id)

**5. time_entries**
- Time tracking per project per user
- Hours (numeric with 2 decimal places)
- Date and description
- Check constraint: hours > 0

### Security

All tables have Row Level Security (RLS) enabled with policies:

- **SELECT**: Users can view data for projects they're members of
- **INSERT**: Users can create entries for their projects
- **UPDATE**: Users can update their own entries
- **DELETE**: Users can delete their own entries

### Indexes

Performance indexes created on:
- `project_meetings`: project_id, start_time
- `project_meeting_attendees`: meeting_id, user_id
- `project_events`: project_id, start_date
- `project_event_members`: event_id, user_id
- `time_entries`: project_id, user_id, date

### Sample Data

The seed file creates:
- 4 project meetings (spread across today to +5 days)
- 8 meeting attendees with various RSVP statuses
- 4 project events (physical, online, hybrid types)
- 7 event members
- 45+ time entries across 9 days for multiple users/projects

## Files

- `007_project_dashboard_tables.sql` - Migration DDL
- `../seeds/07-project-dashboard-data.sql` - Sample data
- `verify-migration-007.mjs` - Verification script
- `prepare-migration-007.mjs` - Display SQL for copy-paste
- `MIGRATION-007-README.md` - This file

## Troubleshooting

### Migration Fails

- Check for existing tables with same names
- Ensure `projects` table exists (referenced by foreign keys)
- Verify you're using service role key with DDL permissions

### Seed Fails

- Verify migration was successful first
- Check that at least one project exists in `projects` table
- Check that at least one user exists in `user_profiles` table
- Review error messages in Supabase SQL Editor

### Verification Fails

- Run migration before verification
- Check RLS policies aren't blocking service role
- Review Supabase logs for errors

## Expected Results

After successful execution:

```
✅ 5 tables created with RLS enabled
✅ 19 indexes created
✅ 20 RLS policies active
✅ 4 meetings with 8 attendees
✅ 4 events with 7 members
✅ 45+ time entries (~50 hours logged)
```

## Next Steps

After successful migration:
- Update API layer to expose new endpoints
- Create SWR hooks for data fetching
- Implement UI components for meetings/events/time tracking
- Add real-time subscriptions for live updates

## Notes

- Uses `gen_random_uuid()` for primary keys
- Timestamps use `TIMESTAMPTZ` for timezone awareness
- All foreign keys have `ON DELETE CASCADE` for cleanup
- CHECK constraints enforce data quality
- UNIQUE constraints prevent duplicate relationships
