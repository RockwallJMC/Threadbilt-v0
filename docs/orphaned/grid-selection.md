---
name: frontend-patterns:grid-selection
description: "Grid layout pattern selection - MUI Grid vs CSS Grid vs Stack decision matrix with examples and use cases"
version: "1.0.0"
tags: ["frontend", "mui", "react", "grid", "layout", "patterns"]
related_skills: ["frontend-patterns:paper-rules", "frontend-patterns:page-templates"]
---

# Grid Layout Pattern Selection

Choose the correct grid approach based on your use case.

## Pattern 1: MUI Grid (Structured Layouts with Defined Columns)

**Use for:** Dashboard widgets, detail page sections, form layouts

### When to Use
- Need specific column counts at different breakpoints
- Structured layouts with defined responsive behavior
- Dashboard widget grids
- Detail pages with main + aside layout

### Syntax

```javascript
import Grid from '@mui/material/Grid';

// Dashboard KPI cards (4 columns desktop, 2 tablet, 1 mobile)
<Grid container spacing={2}>
  {kpis.map(kpi => (
    <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 3 }}>
      <KPICard {...kpi} />
    </Grid>
  ))}
</Grid>

// Recent items grid (3 columns desktop, 2 tablet, 1 mobile)
<Grid container spacing={2}>
  {items.map(item => (
    <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <ItemCard {...item} />
    </Grid>
  ))}
</Grid>

// Main + Aside layout
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8, xl: 9 }}>
    <MainContent />
  </Grid>
  <Grid size={{ xs: 12, md: 4, xl: 3 }}>
    <AsideContent />
  </Grid>
</Grid>
```

### Examples in Codebase
- Dashboard KPIs: `src/components/sections/crm/dashboard/DashboardLayout.jsx` (lines 51-82)
- Recent Proposals (SHOULD BE): `size={{ xs: 12, sm: 6, md: 4 }}` for 3-column grid
- My Positions: `src/components/sections/dashboards/hiring/my-positions/index.jsx` (lines 28-34)

---

## Pattern 2: CSS Grid (Flexible Auto-Fill Card Grids)

**Use for:** Product catalogs, file grids, media galleries

### When to Use
- Items should automatically wrap based on container width
- Don't need specific column counts per breakpoint
- Flexible product/file/media grids
- Min/max width constraints per item

### Syntax

```javascript
import Box from '@mui/material/Box';

// Basic auto-fill grid
<Box sx={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 2
}}>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</Box>

// Responsive minmax values
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(auto-fill, minmax(175px, 1fr))',
    sm: 'repeat(auto-fill, minmax(205px, 1fr))',
    md: 'repeat(auto-fill, minmax(185px, 1fr))',
    xl: 'repeat(auto-fill, minmax(205px, 1fr))'
  },
  gap: 2
}}>
  {files.map(file => (
    <FileCard key={file.id} file={file} />
  ))}
</Box>
```

### Examples in Codebase
- Product Grid: `src/components/sections/ecommerce/customer/products/ProductsGrid.jsx` (lines 19-21)
- File Grid View: `src/components/sections/file-manager/main/all-files/grid-view/index.jsx` (lines 51-56)

---

## Pattern 3: Stack (Simple Vertical Lists)

**Use for:** Job lists, activity feeds, simple sequential content

### When to Use
- Simple vertical stacking of items
- No multi-column layout needed
- Sequential content display
- Activity feeds, task lists

### Syntax

```javascript
import Stack from '@mui/material/Stack';

// Vertical list
<Stack direction="column" spacing={2}>
  {jobs.map(job => (
    <JobCard key={job.id} job={job} />
  ))}
</Stack>

// Vertical list with smaller gap
<Stack direction="column" gap={1}>
  {activities.map(activity => (
    <ActivityCard key={activity.id} activity={activity} />
  ))}
</Stack>
```

### Examples in Codebase
- Job List View: `src/components/sections/hiring/candidate/job-list/JobListView.jsx` (lines 5-10)
- Recent Proposals (CURRENT - WRONG): Uses Stack, should use MUI Grid Pattern 1

---

## Decision Matrix

| Criteria | Pattern | Example |
|----------|---------|---------|
| Need 4 columns desktop, 2 tablet, 1 mobile | MUI Grid Pattern 1 | `size={{ xs: 12, sm: 6, md: 3 }}` |
| Need 3 columns desktop, 2 tablet, 1 mobile | MUI Grid Pattern 1 | `size={{ xs: 12, sm: 6, md: 4 }}` |
| Need 2 columns desktop, 1 mobile | MUI Grid Pattern 1 | `size={{ xs: 12, md: 6 }}` |
| Items auto-wrap based on width | CSS Grid Pattern 2 | `minmax(200px, 1fr)` |
| Simple vertical list | Stack Pattern 3 | `direction="column"` |
| Main + Aside layout | MUI Grid Pattern 1 | 8/4 or 9/3 columns |

---

## Common Mistakes

### Mistake 1: Creating Horizontal Scrolls Instead of Responsive Grids

```javascript
// ❌ WRONG - Creates horizontal scroll
<Stack direction="row">
  {proposals.map(proposal => (
    <Card key={proposal.id}>...</Card>
  ))}
</Stack>

// ✅ CORRECT - Responsive grid (3 columns)
<Grid container spacing={2}>
  {proposals.map(proposal => (
    <Grid key={proposal.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <Card>...</Card>
    </Grid>
  ))}
</Grid>
```

### Mistake 2: Using Old MUI v5/v6 Syntax

```javascript
// ❌ WRONG - Old syntax
<Grid xs={12} md={6}>

// ✅ CORRECT - MUI v7 syntax
<Grid size={{ xs: 12, md: 6 }}>
```

### Mistake 3: Missing container Prop

```javascript
// ❌ WRONG - Missing container prop
<Grid spacing={2}>
  <Grid size={12}>

// ✅ CORRECT - Has container prop
<Grid container spacing={2}>
  <Grid size={12}>
```

### Mistake 4: Using Stack When Grid is Needed

```javascript
// ❌ WRONG - Stack for multi-column card grid
<Stack direction="column" spacing={2}>
  {widgets.map(widget => <Widget key={widget.id} />)}
</Stack>

// ✅ CORRECT - MUI Grid for multi-column layout
<Grid container spacing={2}>
  {widgets.map(widget => (
    <Grid key={widget.id} size={{ xs: 12, sm: 6, md: 4 }}>
      <Widget />
    </Grid>
  ))}
</Grid>
```

---

## Quick Reference

### Common Column Patterns

```javascript
// 1 column (full width)
size={{ xs: 12 }}

// 2 columns desktop, 1 mobile
size={{ xs: 12, md: 6 }}

// 3 columns desktop, 2 tablet, 1 mobile
size={{ xs: 12, sm: 6, md: 4 }}

// 4 columns desktop, 2 tablet, 1 mobile
size={{ xs: 12, sm: 6, md: 3 }}

// 6 columns desktop, 3 tablet, 2 mobile
size={{ xs: 6, sm: 4, md: 2 }}

// Main + Aside (2/3 + 1/3)
Main: size={{ xs: 12, md: 8 }}
Aside: size={{ xs: 12, md: 4 }}

// Main + Aside (3/4 + 1/4)
Main: size={{ xs: 12, md: 9 }}
Aside: size={{ xs: 12, md: 3 }}
```

---

## Related Patterns

- **Paper usage:** See `frontend-patterns:paper-rules` for Paper component patterns
- **Page templates:** See `frontend-patterns:page-templates` for full page structures with grid layouts
- **Error prevention:** See `frontend-patterns:error-prevention` for common Grid mistakes
