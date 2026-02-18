---
name: frontend-patterns:paper-rules
description: "Paper component background={1} usage rules - when to use and when not to use based on context (tab containers, dashboard widgets, form wrappers, kanban layouts)"
version: "1.0.0"
tags: ["frontend", "mui", "react", "paper", "patterns"]
related_skills: ["frontend-patterns:grid-selection", "frontend-patterns:page-templates"]
---

# Paper Component `background={1}` Rules

## Context-Dependent Usage

<CRITICAL_REQUIREMENT>
Paper background={1} usage is CONTEXT-DEPENDENT. Follow these exact rules.
</CRITICAL_REQUIREMENT>

## USE `background={1}` When

### 1. Dashboard Widget Cards

Dashboard widgets and KPI cards **MUST** have `background={1}`.

```javascript
import Paper from '@mui/material/Paper';

// CORRECT - Dashboard widget
<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <SectionHeader title="Sale Funnel" />
  <WidgetContent />
</Paper>

// CORRECT - KPI card
<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <Typography variant="h6">Total Pipeline Value</Typography>
  <Typography variant="h3">$2.4M</Typography>
</Paper>
```

**Examples in codebase:**
- `src/components/sections/dashboards/crm/sale-funnel/SaleFunnel.jsx` (line 13)
- `src/components/sections/dashboards/crm/kpi/CRMKPIs.jsx` (line 19)

### 2. Tab Containers on Detail Pages

Papers that wrap `TabContext` and `Tabs` **MUST** have `background={1}`.

```javascript
import Paper from '@mui/material/Paper';
import TabContext from '@mui/lab/TabContext';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// CORRECT - Tab container
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
  <TabContext value={activeTab}>
    <Tabs onChange={handleTabChange}>
      <Tab label="Overview" value="overview" />
      <Tab label="Activity" value="activity" />
    </Tabs>

    <TabPanel value="overview">
      <OverviewContent />
    </TabPanel>
  </TabContext>
</Paper>
```

**Examples in codebase:**
- `src/components/sections/crm/account-detail/index.jsx` (line 92)
- `src/components/sections/crm/contact-detail/index.jsx` (line 91)

### 3. Visual Hierarchy Elements

Papers used for creating layered visual depth.

```javascript
// CORRECT - Visual hierarchy
<Paper background={1} sx={{ p: { xs: 3, lg: 5 } }}>
  <SpecialContentSection />
</Paper>
```

**Example in codebase:**
- `src/components/sections/starter/index.jsx` (lines 40, 79)

---

## DON'T USE `background={1}` When

### 1. Simple Form Wrappers

Form wrappers should **NOT** have `background={1}`.

```javascript
import Paper from '@mui/material/Paper';

// CORRECT - Simple form wrapper
<Paper sx={{ p: { xs: 3, md: 5 } }}>
  <FormComponent />
</Paper>

// WRONG - Should NOT have background prop
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
  <FormComponent />
</Paper>
```

**Examples in codebase:**
- `src/components/sections/crm/add-contact/index.jsx` (line 35) ✅ CORRECT - no background prop
- `src/components/sections/ecommerce/admin/product-listing/index.jsx` (line 22) ✅ CORRECT - no background prop

### 2. Kanban/Board Layouts

Full-page kanban and board layouts use custom styling, **NOT** `background={1}`.

```javascript
import Paper from '@mui/material/Paper';

// CORRECT - Kanban layout with custom styling
<Paper sx={{ bgcolor: 'background.default' }}>
  <KanbanBoard />
</Paper>

// CORRECT - Board with custom background
<Paper sx={{
  backgroundImage: `url('${backgroundOption.background}')`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover'
}}>
  <BoardContent />
</Paper>
```

**Examples in codebase:**
- `src/components/sections/crm/opportunities/index.jsx` (lines 27, 29)
- `src/components/sections/kanban/kanban/index.jsx` (lines 22, 24)

### 3. Custom Colored Papers

Papers with custom background colors should **NOT** have `background={1}`.

```javascript
// CORRECT - Custom colored Paper
<Paper sx={{ bgcolor: 'primary.main', p: 2 }}>
  <MessageBubble />
</Paper>

// CORRECT - Gradient background
<Paper sx={{
  background: 'linear-gradient(135deg, ...)',
  p: 2
}}>
  <PromoBanner />
</Paper>
```

---

## Quick Decision Tree

Use this decision tree to determine Paper usage:

```
┌─────────────────────────────────────┐
│ Are you creating a Paper component? │
└─────────────┬───────────────────────┘
              │
              ├─ Contains TabContext/Tabs?
              │  └─ YES → USE background={1} ✅
              │
              ├─ Dashboard widget/KPI card?
              │  └─ YES → USE background={1} ✅
              │
              ├─ Visual hierarchy element?
              │  └─ YES → USE background={1} ✅
              │
              ├─ Simple form wrapper?
              │  └─ YES → NO background prop ❌
              │
              ├─ Kanban/board full-page layout?
              │  └─ YES → NO background prop (custom styling) ❌
              │
              └─ Custom colored Paper?
                 └─ YES → NO background prop ❌
```

---

## Responsive Padding (Always Required)

**ALL Papers must use responsive padding:**

```javascript
// CORRECT - Responsive padding
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>

// CORRECT - With height
<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>

// WRONG - Fixed padding
<Paper background={1} sx={{ p: 3 }}>

// WRONG - No padding
<Paper background={1}>
```

**Standard padding values:**
- Mobile (xs): `p: 3` (24px)
- Desktop (md): `p: 5` (40px)

---

## Common Mistakes

### Mistake 1: Adding background={1} to Form Wrappers

```javascript
// ❌ WRONG
<Grid container>
  <Grid size={12}>
    <PageHeader title="Add New Contact" />
  </Grid>
  <Grid size={12}>
    <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
      <AddContactStepper />
    </Paper>
  </Grid>
</Grid>

// ✅ CORRECT
<Grid container>
  <Grid size={12}>
    <PageHeader title="Add New Contact" />
  </Grid>
  <Grid size={12}>
    <Paper sx={{ p: { xs: 3, md: 5 } }}>
      <AddContactStepper />
    </Paper>
  </Grid>
</Grid>
```

### Mistake 2: Omitting background={1} from Tab Containers

```javascript
// ❌ WRONG - Tab container needs background={1}
<Paper sx={{ p: { xs: 3, md: 5 } }}>
  <TabContext value={activeTab}>
    <Tabs>...</Tabs>
  </TabContext>
</Paper>

// ✅ CORRECT
<Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
  <TabContext value={activeTab}>
    <Tabs>...</Tabs>
  </TabContext>
</Paper>
```

### Mistake 3: Omitting background={1} from Dashboard Widgets

```javascript
// ❌ WRONG - Dashboard widgets need background={1}
<Paper sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <SectionHeader title="Sale Funnel" />
  <WidgetContent />
</Paper>

// ✅ CORRECT
<Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
  <SectionHeader title="Sale Funnel" />
  <WidgetContent />
</Paper>
```

---

## Edge Cases

### Nested Papers

When Papers are nested, typically:
- **Outer Paper:** May or may not have background={1} depending on context
- **Inner Paper:** Usually uses custom styling, not background={1}

```javascript
// Example: Starter page with nested Papers
<Paper background={1} sx={{ p: { xs: 3, lg: 5 } }}>
  <Paper sx={{ position: 'absolute', inset: 0, height: '25%' }} />
  <Content />
</Paper>
```

### Sidebar Papers

Sidebar Papers typically do **NOT** need background={1}:

```javascript
// CORRECT - Sidebar Paper without background prop
<Grid size={{ xs: 12, lg: 3 }}>
  <AccountSidebar />  {/* Internal Paper does not need background={1} */}
</Grid>
```

---

## Summary Checklist

Before applying Paper component, verify:

- [ ] Identified Paper context (widget, tab, form, kanban, custom)
- [ ] Applied decision tree to determine background={1} usage
- [ ] Used responsive padding: `p: { xs: 3, md: 5 }`
- [ ] Verified against codebase examples
- [ ] No hardcoded colors (use theme tokens)

---

## Related Patterns

- **Grid layouts:** See `frontend-patterns:grid-selection` for layout patterns
- **Page templates:** See `frontend-patterns:page-templates` for full page structures
- **Error prevention:** See `frontend-patterns:error-prevention` for common Paper mistakes
