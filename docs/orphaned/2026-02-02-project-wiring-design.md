# Project Wiring Design

**Date:** 2026-02-02
**Status:** Approved
**Feature:** Wire create-project form to database and load project data into dashboard

## Overview

Enable users to create projects that persist to the database, display them in the "Recent Projects" slider, and load project-specific data into all dashboard sections when a project is selected.

## Database Schema

### Tables

```sql
-- Core project table
projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(12,2),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  project_manager_id UUID REFERENCES user_profiles(id),
  background_image VARCHAR(500),
  background_color VARCHAR(500),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW()
)

-- Project board columns (stages)
project_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  card_limit INTEGER DEFAULT 20,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Project labels/tags
project_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Project team members
project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
)

-- Project tasks (board cards)
project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES project_columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  assignee_id UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### RLS Policies

All tables use organization-based RLS filtering via `organization_id` on the projects table.

## SWR Hooks

**File:** `src/services/swr/api-hooks/useProjectApi.js`

### List/Read Hooks
- `useProjects(filters?, config?)` - All projects
- `useRecentProjects(limit?, config?)` - Sorted by last_viewed_at
- `useProject(id, config?)` - Single project with relations

### Mutation Hooks
- `useCreateProject()` - Create project + columns + labels + members
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Soft delete
- `useUpdateLastViewed(projectId)` - Update last_viewed_at

### Dashboard Data Hooks
- `useProjectTaskMetrics(projectId)` - Task counts by column
- `useProjectTimeline(projectId)` - Tasks with dates
- `useProjectDeadlines(projectId)` - Upcoming due dates
- `useProjectRoadmap(projectId)` - Project milestones
- `useProjectMeetings(projectId)` - Meetings
- `useProjectEvents(projectId)` - Recent activities
- `useProjectHours(projectId)` - Time tracking

## Dashboard State Management

```jsx
const ProjectManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { data: recentProjects } = useRecentProjects(10);

  // Auto-select first project
  useEffect(() => {
    if (!selectedProjectId && recentProjects?.length > 0) {
      setSelectedProjectId(recentProjects[0].id);
    }
  }, [recentProjects, selectedProjectId]);

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    updateLastViewed(projectId);
  };

  // All section hooks receive selectedProjectId
  const { data: taskMetrics } = useProjectTaskMetrics(selectedProjectId);
  // ... etc
};
```

## Implementation Phases

### Phase 1: Database
- Create migration with all tables
- Add RLS policies
- Seed sample data

### Phase 2: API Layer
- Create useProjectApi.js SWR hooks
- Create API routes for CRUD

### Phase 3: Wire Create Form
- Update CreateProjectStepper to use mutation
- Handle success redirect

### Phase 4: Wire Dashboard
- Replace static data with useRecentProjects
- Add selection state and handlers
- Update BoardsSlider for selection

### Phase 5: Wire Dashboard Sections
- Update each section to accept projectId
- Create project-specific data hooks
