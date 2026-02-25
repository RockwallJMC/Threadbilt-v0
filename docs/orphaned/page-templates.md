---
name: frontend-patterns:page-templates
description: "5 standard page structure templates - Simple Form, Detail with Sidebar, Dashboard Grid, Kanban/Board, List with Filters"
version: "1.0.0"
tags: ["frontend", "mui", "react", "templates", "patterns", "page-structure"]
related_skills: ["frontend-patterns:paper-rules", "frontend-patterns:grid-selection"]
---

# Standard Page Templates

5 recurring page structure patterns in the codebase.

## Template 1: Simple Form Page

**When to use:** Form pages, stepper workflows, single-purpose input

**Structure:** PageHeader + Paper wrapper (NO background prop)

```javascript
<Grid container>
  <Grid size={12}>
    <PageHeader title="..." breadcrumb={[...]} />
  </Grid>
  <Grid size={12}>
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <FormComponent />
    </Paper>
  </Grid>
</Grid>
```

**Examples:** `add-contact/index.jsx`, `product-listing/index.jsx`

## Template 2: Detail Page with Sidebar

**When to use:** Detail pages, entity views with sidebar

**Structure:** Header + Grid (sidebar 3-4 cols + main 8-9 cols)

```javascript
<Stack direction="column">
  <Stack sx={{ p: { xs: 3, md: 5 }, pb: 2 }}>
    <Typography variant="h4">{title}</Typography>
  </Stack>

  <Grid container spacing={2} sx={{ px: { xs: 3, md: 5 } }}>
    <Grid size={{ xs: 12, lg: 3 }}>
      <Sidebar />
    </Grid>
    <Grid size={{ xs: 12, lg: 9 }}>
      <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
        <TabContext>...</TabContext>
      </Paper>
    </Grid>
  </Grid>
</Stack>
```

**Key:** Main content has `Paper background={1}` for tabs

**Examples:** `account-detail/index.jsx`, `contact-detail/index.jsx`

## Template 3: Dashboard Grid

**When to use:** Dashboards, analytics, KPI displays

**Structure:** Header + Controls + Grid with widgets

```javascript
<Box>
  <DashboardHeader />
  <DashboardControls />
  <Box id="dashboard-content">
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KPIWidget />
      </Grid>
    </Grid>
  </Box>
</Box>
```

**Key:** Individual widgets have `Paper background={1}`

**Examples:** `dashboard/crm/DashboardLayout.jsx`

## Template 4: Full-Page App (Kanban/Board)

**When to use:** Kanban, pipeline, full-page interactive apps

**Structure:** Custom height, Paper without background, SimpleBar

```javascript
<Paper>
  <Header />
  <Paper sx={{
    height: ({ mixins }) => mixins.contentHeight(...),
    bgcolor: 'background.default'
  }}>
    <SimpleBar>
      <Stack sx={{ height: 1 }}>
        <AppContent />
      </Stack>
    </SimpleBar>
  </Paper>
</Paper>
```

**Key:** Uses `mixins.contentHeight()`, no `background={1}`

**Examples:** `opportunities/index.jsx`, `pipeline/index.jsx`

## Template 5: List View with Filters

**When to use:** Product catalogs, job listings, filterable lists

**Structure:** Filter drawer + content area

```javascript
<Grid container>
  <Grid size={12}>
    <TopSection toggleDrawer={...} />
  </Grid>
  <Grid size={12}>
    <Stack>
      <FilterDrawer open={...} />
      <Paper>
        <ItemsGrid />
      </Paper>
    </Stack>
  </Grid>
</Grid>
```

**Key:** Often uses CSS Grid auto-fill for items

**Examples:** `products/index.jsx`, `job-list/index.jsx`

## Related Patterns

- **Paper usage:** See `frontend-patterns:paper-rules`
- **Grid layouts:** See `frontend-patterns:grid-selection`
