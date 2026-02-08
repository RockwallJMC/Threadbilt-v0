---
name: frontend-patterns:error-prevention
description: "13 common frontend mistakes to avoid - Grid, Paper, padding, styling, and workflow errors with before/after examples"
version: "1.0.0"
tags: ["frontend", "mui", "react", "errors", "mistakes", "patterns"]
related_skills: ["frontend-patterns:paper-rules", "frontend-patterns:grid-selection"]
---

# Common Frontend Mistakes

13 critical errors to avoid when building frontend components.

## Grid & Layout Mistakes

### 1. Using Old MUI v5/v6 Syntax

```javascript
// ❌ WRONG
<Grid xs={12} md={6}>

// ✅ CORRECT  
<Grid size={{ xs: 12, md: 6 }}>
```

### 2. Creating Horizontal Scrolls Instead of Responsive Grids

```javascript
// ❌ WRONG - Creates horizontal scroll
<Stack direction="row">
  {items.map(item => <Card />)}
</Stack>

// ✅ CORRECT - Responsive grid
<Grid container spacing={2}>
  {items.map(item => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card />
    </Grid>
  ))}
</Grid>
```

### 3. Using Stack When Grid is Needed

- Use Stack: Simple vertical lists
- Use Grid: Multi-column card layouts

### 4. Missing container Prop

```javascript
// ❌ WRONG
<Grid spacing={2}>

// ✅ CORRECT
<Grid container spacing={2}>
```

## Paper Component Mistakes

### 5. Adding background={1} to Form Wrappers

```javascript
// ❌ WRONG
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
  <FormComponent />
</Paper>

// ✅ CORRECT
<Paper sx={{ p: { xs: 3, md: 5 } }}>
  <FormComponent />
</Paper>
```

### 6. Omitting background={1} from Tab Containers

```javascript
// ❌ WRONG
<Paper sx={{ p: { xs: 3, md: 5 } }}>
  <TabContext>...</TabContext>
</Paper>

// ✅ CORRECT
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
  <TabContext>...</TabContext>
</Paper>
```

### 7. Omitting background={1} from Dashboard Widgets

```javascript
// ❌ WRONG
<Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <WidgetContent />
</Paper>

// ✅ CORRECT
<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <WidgetContent />
</Paper>
```

## Padding & Spacing Mistakes

### 8. Fixed Padding Instead of Responsive

```javascript
// ❌ WRONG
<Paper sx={{ p: 3 }}>

// ✅ CORRECT
<Paper sx={{ p: { xs: 3, md: 5 } }}>
```

## Theme & Styling Mistakes

### 9. Hardcoded Colors

```javascript
// ❌ WRONG
color: '#2196f3'

// ✅ CORRECT
color: 'primary.main'
// OR
color: theme.palette.primary.main
```

### 10. ReactEchart Without Proper Height

```javascript
// ❌ WRONG
<ReactEchart option={...} sx={{ minHeight: 200 }} />

// ✅ CORRECT
<ReactEchart option={...} sx={{
  height: '100%',
  minHeight: { xs: 200, md: 350 },
  width: 1
}} />
```

## Workflow Mistakes

### 11. Creating Files Without Asking First

- ALWAYS ask: "Should I create A) Page B) Component C) Other?"
- No assumptions about file location

### 12. Building From Scratch Without Searching

- MUST search existing components
- Document search results
- Report similarity ratings

### 13. Not Checking MUI Documentation

- Check `.claude/mui-doc.txt` first
- Use MUI MCP server for complex components
- Consult `/documentation/icons` for icons

## Quick Checklist

Before claiming completion:

- [ ] No old Grid syntax (xs/md props)
- [ ] No horizontal scrolls (unless intentional)
- [ ] Paper background={1} correct per context
- [ ] Responsive padding on all Papers
- [ ] No hardcoded colors
- [ ] ReactEcharts have proper height
- [ ] Asked before creating files
- [ ] Searched existing components
- [ ] Checked MUI documentation

## Related Patterns

- **Paper rules:** See `frontend-patterns:paper-rules`
- **Grid selection:** See `frontend-patterns:grid-selection`
- **Resources:** See `frontend-patterns:resources`
