# Project Drawings Feature Design

**Date:** 2026-02-11
**Status:** Approved

## Overview

Add drawing management to the project kanban board's pinned "Drawings" swim lane. Users upload construction drawings (PDF, JPG, PNG) via a multi-step stepper dialog and view them as thumbnail cards in the lane.

## User Flow

1. User types a drawing title in the inline input at the bottom of the Drawings lane
2. "Add Drawing" button enables once title is entered
3. Clicking opens a 4-step stepper dialog:

| Step | Content | Validation |
|------|---------|------------|
| **1. Upload File** | Title displayed (read-only). Drag & drop zone for PDF/JPG/PNG. File preview with name/size. | File required, max 50MB, valid MIME type |
| **2. Drawing Type** | Select from fixed list | Selection required |
| **3. Version** | Free text input (e.g., "Rev A", "v1", "Draft 2") | Non-empty |
| **4. Review & Save** | Summary of all fields + file thumbnail. Save button. | All previous steps valid |

Navigation: Back/Next buttons. "Next" disabled until step is valid. Step 4 shows "Save".

## Drawing Types (Fixed List)

- Architectural
- Structural
- Mechanical
- Electrical
- Plumbing
- Civil
- Landscape
- Shop Drawing
- As-Built
- Detail

## Data Architecture

### Supabase Storage Bucket: `project-drawings`

- Public: false
- File size limit: 50MB
- Allowed MIME types: image/png, image/jpeg, image/jpg, application/pdf
- Path pattern: `{project_id}/{drawing_id}/{filename}`

### Database Table: `project_drawings`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| project_id | uuid | FK -> projects.id, NOT NULL |
| column_id | uuid | FK -> project_columns.id (Drawings column) |
| title | text | NOT NULL |
| drawing_type | text | NOT NULL |
| version | text | NOT NULL |
| file_name | text | Original filename |
| file_size | bigint | Bytes |
| mime_type | text | PDF/JPG/PNG |
| storage_path | text | Path in storage bucket |
| thumbnail_path | text | NULL for PDFs, same as storage_path for images |
| created_by | uuid | FK -> auth.users |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### RLS Policies

- Project members can SELECT/INSERT/UPDATE drawings for their projects
- DELETE restricted to project owner/admin

## Frontend Components

### New Files

1. **`src/components/sections/projects/project-kanban/AddDrawingDialog.jsx`**
   - MUI Stepper dialog with 4 steps
   - Each step rendered conditionally
   - Form state via useState
   - Calls upload API on save

2. **`src/components/sections/projects/project-kanban/DrawingCard.jsx`**
   - Aurora TaskCard pattern adapted for drawings
   - CardMedia: thumbnail for JPG/PNG, PDF icon placeholder for PDFs
   - Title text
   - Chips for drawing type + version
   - File type icon

3. **`src/services/swr/api-hooks/useProjectDrawingsApi.js`**
   - SWR hook for fetching/creating drawings
   - Pattern matches existing useProjectKanbanApi.js

4. **`src/app/api/projects/[projectId]/drawings/route.js`**
   - POST: handles file upload to storage + DB row insert
   - GET: returns drawings for project
   - Auth via Supabase JWT

### Modified Files

5. **`ProjectKanbanBridge.jsx`**
   - Drawings pinned lane fetches from project_drawings
   - Passes drawing data to column renderer

6. **`ProjectKanbanColumn.jsx`**
   - Detects Drawings lane
   - Renders DrawingCard instead of ProjectKanbanTask
   - Shows inline title input + "Add Drawing" button in footer
   - "Add Drawing" opens AddDrawingDialog with pre-filled title

### Reused Existing

- `FileDropZone.jsx` — drag & drop in step 1
- `convertFileToAttachment()` — file metadata extraction

## Upload Flow

1. Client sends FormData (file + metadata) to `POST /api/projects/[projectId]/drawings`
2. API route:
   - Authenticates via Supabase JWT
   - Uploads file to `project-drawings` bucket at `{projectId}/{drawingId}/{filename}`
   - JPG/PNG: thumbnail_path = storage_path (image is the thumbnail)
   - PDF: thumbnail_path = null (show PDF icon placeholder)
   - Inserts row into project_drawings
   - Returns drawing record
3. Client: SWR mutates, Drawings lane re-renders with new card

## Thumbnail Display

- JPG/PNG: Supabase signed URL in CardMedia (max 200px height)
- PDF: Static PDF icon placeholder with filename overlay
- No server-side PDF thumbnail generation (can add later via Edge Function)

## Scope Boundaries

- No drag-and-drop reordering of drawing cards (can add later)
- No inline editing of drawing metadata (can add later)
- No PDF thumbnail generation
- No drawing versioning history (single version field, not version chain)
- Changes scoped entirely to Drawings pinned lane — no impact on task flow
