# MUI Component Guide for PierceDesk

Complete reference for selecting and using MUI components correctly. This is the single source of truth for the react-mui-frontend-engineer sub-agent.

---

## Table of Contents

1. [Component Decision Tree](#1-component-decision-tree)
2. [Surface Components: Paper vs Card vs Box](#2-surface-components)
3. [Layout Components: Grid vs Stack vs Box vs Container](#3-layout-components)
4. [Typography Hierarchy](#4-typography-hierarchy)
5. [Page Structure Templates](#5-page-structure-templates)
6. [PierceDesk-Specific Patterns](#6-piercedesk-specific-patterns)
7. [Exemplar Files (Copy From These)](#7-exemplar-files)
8. [Anti-Pattern Gallery](#8-anti-pattern-gallery)
9. [MUI MCP Workflow](#9-mui-mcp-workflow)

---

## 1. Component Decision Tree

Use this flowchart to select the correct component:

### "I need a surface/container"

```
Does it have structured sections (header, body, actions, media)?
  YES → Card + CardHeader/CardContent/CardActions/CardMedia
  NO  → Does it need elevation or a visual boundary?
          YES → Paper (with background={1} for secondary surfaces)
          NO  → Is it a theme-aware wrapper or semantic HTML element?
                YES → Box (with component prop for semantics)
                NO  → Plain <div> or fragment
```

### "I need to arrange items"

```
Is it a responsive multi-column layout (forms, dashboards, grids)?
  YES → Grid container with Grid size={{ xs: 12, md: X }}
  NO  → Is it a single row or column of items with consistent spacing?
          YES → Stack (direction="column" default, or direction="row")
          NO  → Is it a page-level width constraint?
                YES → Container (maxWidth="sm" | "md" | "lg" | false)
                NO  → Box with sx prop (for one-off positioning)
```

### "I need to show text"

```
Is it a heading, body text, caption, or label?
  YES → Typography (with correct variant - see Section 4)
  NO  → Plain text inside a component
```

---

## 2. Surface Components

### 2A. Paper - The General Surface

**What it is:** A container that renders an elevated or outlined surface following Material Design.

**When to use:**
- Page sections and content areas
- Form containers
- Sidebars and panels
- Any content that needs a visual boundary
- When you DON'T need structured header/body/actions

**Props reference:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `1\|2\|3\|4\|5` | none | **PierceDesk custom** - maps to theme elevation backgrounds |
| `variant` | `"elevation"\|"outlined"` | `"outlined"` | **PierceDesk default is "outlined"** (standard MUI default is "elevation") |
| `elevation` | `0-24` | `1` | Shadow depth (only applies when variant="elevation") |
| `square` | `boolean` | `false` | If true, removes border-radius |
| `sx` | `object` | - | Style overrides |

**Standard PierceDesk Paper patterns:**

```jsx
// Primary content area (default surface)
<Paper sx={{ p: { xs: 3, md: 5 } }}>
  {/* content */}
</Paper>

// Secondary surface (sidebars, cards, auxiliary content)
<Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6 }}>
  {/* content */}
</Paper>

// Flat card-like surface (no shadow)
<Paper background={1} elevation={0} sx={{ p: 3 }}>
  {/* content */}
</Paper>

// Dashboard section with custom border
<Paper
  background={1}
  sx={(theme) => ({
    p: { xs: 2, md: 3 },
    borderRadius: 6,
    bgcolor: 'transparent',
    border: `1px solid ${theme.vars.palette.divider}`,
    boxShadow: `inset 0 1px 0 ${theme.vars.palette.divider}, ${theme.vars.shadows[2]}`,
  })}
>
  {/* dashboard widgets */}
</Paper>
```

### 2B. Card - Structured Content Surface

**What it is:** Paper + overflow:hidden + sub-components for structured content. Card IS Paper with extras.

**When to use:**
- Content with a clear header/title + body + actions pattern
- Product cards, profile cards, KPI/metric cards
- Items in a grid of similar content blocks
- Any content that benefits from CardHeader, CardMedia, CardActions
- Discrete items (not lists/collections - use Paper for those)

**When NOT to use:**
- Simple containers (use Paper)
- Form wrappers (use Paper)
- Page sections without header/actions (use Paper)
- Navigation surfaces (use Paper or Box)

**Sub-components:**

| Component | Purpose | Required? |
|-----------|---------|-----------|
| `CardHeader` | Title, subtitle, avatar, action button | Optional |
| `CardContent` | Main body content | Yes (wrap content) |
| `CardActions` | Buttons and action controls | Optional |
| `CardMedia` | Images, videos, media | Optional |
| `CardActionArea` | Makes the entire card clickable | Optional |

**Standard PierceDesk Card patterns:**

```jsx
// Basic Card with header and actions
<Card background={1} variant="outlined">
  <CardHeader
    title="Card Title"
    subheader="Subtitle text"
    action={
      <IconButton aria-label="settings">
        <IconifyIcon icon="material-symbols-light:more-vert" />
      </IconButton>
    }
  />
  <Divider />
  <CardContent>
    <Typography variant="body2">Card body content here.</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Action</Button>
  </CardActions>
</Card>

// KPI/Metric Card with avatar
<Card background={1} variant="outlined">
  <CardHeader
    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>K</Avatar>}
    title="Revenue"
    subheader="Last 30 days"
  />
  <CardContent>
    <Typography variant="h4">$42,500</Typography>
    <Typography variant="body2" color="text.secondary">+12% from last month</Typography>
  </CardContent>
</Card>

// Media Card (product, gallery item)
<Card background={1} variant="outlined" sx={{ maxWidth: 345 }}>
  <CardMedia
    component="img"
    alt="Product image"
    image="/path/to/image.webp"
    sx={{ height: 200, objectFit: 'cover' }}
  />
  <CardContent>
    <Typography variant="h6">Product Name</Typography>
    <Typography variant="body2" color="text.secondary">Description text.</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">View Details</Button>
    <Button size="small">Add to Cart</Button>
  </CardActions>
</Card>

// Clickable Card (entire surface is interactive)
<Card background={1} variant="outlined">
  <CardActionArea onClick={handleClick}>
    <CardContent>
      <Typography variant="h6">Click anywhere on this card</Typography>
      <Typography variant="body2">The entire card surface is the click target.</Typography>
    </CardContent>
  </CardActionArea>
</Card>

// Expandable Card with Collapse
<Card background={1} variant="outlined">
  <CardHeader title="Expandable Section" />
  <CardContent>
    <Typography variant="body2">Always visible content.</Typography>
  </CardContent>
  <CardActions disableSpacing>
    <IconButton onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
      <IconifyIcon icon="material-symbols-light:expand-all" />
    </IconButton>
  </CardActions>
  <Collapse in={expanded} timeout="auto" unmountOnExit>
    <CardContent>
      <Typography variant="body2">Hidden until expanded.</Typography>
    </CardContent>
  </Collapse>
</Card>
```

### 2C. Box - The Utility Wrapper

**What it is:** A theme-aware `<div>` with sx prop access. NOT a surface - it has no visual presentation by default.

**When to use:**
- Semantic HTML wrapper: `<Box component="section">`, `<Box component="nav">`
- One-off positioning/alignment that doesn't fit Stack or Grid
- Decorative elements (colored rectangles, spacers)
- Wrapping non-MUI components to apply sx styles
- Container for `maxWidth` constraints within a section

**When NOT to use:**
- **NEVER** for form column layout (use Grid)
- **NEVER** as `<Box sx={{ display: 'flex', gap: 2 }}>` for multiple children (use Stack)
- **NEVER** as a surface/card (use Paper or Card)
- **NEVER** with `<Box sx={{ display: 'flex', flexDirection: 'row' }}>` (use Stack direction="row")

**Correct Box usage:**

```jsx
// Semantic HTML element
<Box component="section" sx={{ py: 4 }}>
  <Typography variant="h5">Section Title</Typography>
</Box>

// Positioning wrapper
<Box sx={{ position: 'relative' }}>
  <Badge />
</Box>

// Decorative element
<Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main' }} />

// Width constraint within a section
<Box sx={{ maxWidth: { lg: 352 } }}>
  <TextField fullWidth label="Search" />
</Box>

// Flex justify for button row (acceptable - not form fields)
<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
  <Button>Cancel</Button>
  <Button variant="contained">Save</Button>
</Box>
```

### 2D. Surface Selection Quick Reference

| Scenario | Component | Example |
|----------|-----------|---------|
| Page section with form fields | Paper | `<Paper sx={{ p: { xs: 3, md: 5 } }}>` |
| Sidebar panel | Paper + background={1} | `<Paper background={1}>` |
| KPI/metric display with title + value + action | Card | `<Card background={1} variant="outlined">` |
| Product/item in a grid | Card + CardMedia | Card with image and actions |
| Simple elevated wrapper | Paper + elevation | `<Paper variant="elevation" elevation={2}>` |
| Dashboard widget | Paper + custom border | Paper with theme-aware border/shadow |
| Settings section with title + toggles | Paper or Card | CardHeader for title, CardContent for toggles |
| Data table wrapper | Paper | `<Paper sx={{ overflow: 'auto' }}>` |
| Semantic HTML wrapper | Box | `<Box component="main">` |
| Button alignment row | Box or Stack | `<Stack direction="row" justifyContent="flex-end">` |

---

## 3. Layout Components

### 3A. Grid - Multi-Column Responsive Layout

**What it is:** CSS grid-based 12-column layout system with responsive breakpoints.

**MUI v7 syntax (MANDATORY - never use v5/v6 syntax):**

```jsx
// CORRECT - MUI v7
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
</Grid>

// WRONG - old MUI v5/v6 (NEVER USE)
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>Content</Grid>  // NO 'item' prop, NO 'xs'/'md' props
</Grid>
```

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `container` | `boolean` | Makes this a grid container (parent) |
| `size` | `number\|object\|"grow"\|"auto"` | Column span (1-12) or responsive object |
| `spacing` | `number\|object` | Gap between items (theme spacing units) |
| `columns` | `number\|object` | Total columns (default 12) |
| `offset` | `number\|object` | Column offset |
| `direction` | `string\|object` | Row direction |

**MUI v7 improvements over v6:**
- No `item` prop needed - all children of container are items
- Uses CSS `gap` property (not negative margins) - no overflow issues
- Uses CSS variables internally
- Unlimited nesting depth
- `size="grow"` replaces old `xs={true}` (auto-fill remaining space)
- `size="auto"` for content-based width

**Standard Grid patterns:**

```jsx
// Two-column form (most common)
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField fullWidth label="First Name" />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField fullWidth label="Last Name" />
  </Grid>
</Grid>

// Three-column row
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="A" /></Grid>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="B" /></Grid>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="C" /></Grid>
</Grid>

// Asymmetric split (main + sidebar)
<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 8, xl: 9 }}>Main content</Grid>
  <Grid size={{ xs: 12, md: 4, xl: 3 }}>Sidebar</Grid>
</Grid>

// Address block (mixed widths)
<Grid container spacing={2}>
  <Grid size={12}><TextField fullWidth label="Street" /></Grid>
  <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="City" /></Grid>
  <Grid size={{ xs: 6, md: 3 }}><TextField fullWidth label="State" /></Grid>
  <Grid size={{ xs: 6, md: 3 }}><TextField fullWidth label="ZIP" /></Grid>
</Grid>

// Auto-growing item
<Grid container spacing={2}>
  <Grid size="grow"><TextField fullWidth label="Flexible width" /></Grid>
  <Grid size="auto"><Button variant="contained">Submit</Button></Grid>
</Grid>

// Dashboard widget grid
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, lg: 5, xl: 6 }}>Widget A</Grid>
  <Grid size={{ xs: 12, lg: 7, xl: 6 }}>Widget B</Grid>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>Widget C</Grid>
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>Widget D</Grid>
  <Grid size={{ xs: 12, lg: 4 }}>Widget E</Grid>
</Grid>
```

### 3B. Stack - One-Dimensional Spacing

**What it is:** Flexbox-based component for consistent spacing in a single direction.

**When to use:**
- Vertical spacing between sections: `<Stack spacing={3}>`
- Horizontal button rows: `<Stack direction="row" spacing={1}>`
- Anything that is a simple list of items in one direction
- Section separators with dividers: `<Stack divider={<Divider />}>`

**When NOT to use:**
- **NEVER** for form field column layout (use Grid)
- **NEVER** `<Stack direction="row">` for side-by-side form fields (use Grid)

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `"row"\|"column"\|"row-reverse"\|"column-reverse"\|object` | Layout direction (default: "column") |
| `spacing` | `number\|object` | Gap between children |
| `divider` | `ReactNode` | Element between each child |
| `justifyContent` | `string` | Main axis alignment |
| `alignItems` | `string` | Cross axis alignment |
| `flexWrap` | `string` | Wrap behavior |

**Standard Stack patterns:**

```jsx
// Vertical section spacing (most common)
<Stack spacing={3}>
  <Paper>Section 1</Paper>
  <Paper>Section 2</Paper>
  <Paper>Section 3</Paper>
</Stack>

// With dividers
<Stack spacing={2} divider={<Divider />}>
  <InfoRow label="Name" value="John" />
  <InfoRow label="Email" value="john@example.com" />
</Stack>

// Horizontal button row
<Stack direction="row" spacing={1} justifyContent="flex-end">
  <Button>Cancel</Button>
  <Button variant="contained">Save</Button>
</Stack>

// Responsive direction
<Stack
  direction={{ xs: 'column', md: 'row' }}
  spacing={{ xs: 2, md: 3 }}
  alignItems={{ xs: 'stretch', md: 'center' }}
>
  <Typography>Label</Typography>
  <TextField fullWidth label="Value" />
</Stack>

// Page section layout
<Stack spacing={3}>
  <Typography variant="h6">Section Title</Typography>
  <Grid container spacing={2}>
    {/* form fields */}
  </Grid>
</Stack>
```

### 3C. Container - Page-Level Width Constraint

**What it is:** Centers content horizontally and constrains max-width to a breakpoint.

**When to use:**
- Page-level content width control
- Centering content within a full-width area
- Form pages that shouldn't stretch to full width

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `maxWidth` | `"xs"\|"sm"\|"md"\|"lg"\|"xl"\|false` | Max width breakpoint |
| `fixed` | `boolean` | Fixed width at each breakpoint (vs fluid) |
| `disableGutters` | `boolean` | Remove horizontal padding |

**PierceDesk Container patterns:**

```jsx
// Standard page content constraint
<Container maxWidth="md">
  <Stack spacing={3}>
    {/* page content */}
  </Stack>
</Container>

// Custom max-width (PierceDesk pattern)
<Container maxWidth={false} sx={{ maxWidth: { xs: 628, md: 660 }, px: { xs: 0 } }}>
  {/* narrow form content */}
</Container>

// Full-width with responsive constraints
<Container maxWidth={false} sx={{ maxWidth: 520, px: { xs: 0 } }}>
  {/* narrow settings content */}
</Container>
```

### 3D. Layout Component Selection Quick Reference

| Need | Component | Pattern |
|------|-----------|---------|
| Side-by-side form fields | Grid | `<Grid container><Grid size={6}>...` |
| Vertical sections with spacing | Stack | `<Stack spacing={3}>...` |
| Page width constraint | Container | `<Container maxWidth="md">...` |
| Button row | Stack direction="row" | `<Stack direction="row" spacing={1}>...` |
| Dashboard widget grid | Grid | Responsive size props with breakpoints |
| Main + sidebar layout | Grid | `size={{ xs: 12, md: 8 }}` + `size={{ xs: 12, md: 4 }}` |
| Semantic wrapper | Box | `<Box component="section">...` |
| Positioning | Box | `<Box sx={{ position: 'relative' }}>...` |
| List with dividers | Stack + divider | `<Stack divider={<Divider />}>...` |
| Responsive stacking | Stack | `direction={{ xs: 'column', md: 'row' }}` |

---

## 4. Typography Hierarchy

### Variant Quick Reference

| Variant | HTML Element | Use For |
|---------|-------------|---------|
| `h1` | `<h1>` | Page titles (rarely used - too large for most pages) |
| `h2` | `<h2>` | Major section headings |
| `h3` | `<h3>` | Sub-section headings |
| `h4` | `<h4>` | Card titles, dialog titles |
| `h5` | `<h5>` | Widget titles, smaller card titles |
| `h6` | `<h6>` | Section labels within a page |
| `subtitle1` | `<h6>` | Secondary headings (16px) |
| `subtitle2` | `<h6>` | Tertiary headings, field group labels (14px) |
| `body1` | `<p>` | Default body text (16px) |
| `body2` | `<p>` | Secondary body text, descriptions (14px) |
| `caption` | `<span>` | Small labels, timestamps, helper text |
| `overline` | `<span>` | Category labels, small uppercase headers |

### PierceDesk Typography patterns:

```jsx
// Page title
<Typography variant="h5">Page Title</Typography>

// Section heading within Paper
<Typography variant="h6">Section Title</Typography>

// Field group label
<Typography variant="subtitle2" color="text.secondary" gutterBottom>
  Group Label
</Typography>

// Body description
<Typography variant="body2" color="text.secondary">
  Description text for context.
</Typography>

// Caption / helper text
<Typography variant="caption" color="text.secondary">
  Last updated 2 hours ago
</Typography>

// Separate style from semantics
<Typography variant="h6" component="h2">
  Looks like h6 but renders as <h2> for accessibility
</Typography>
```

### Typography Rules:
1. Never skip heading levels (h2 then h4 - missing h3)
2. Use `component` prop when semantic level differs from visual style
3. Use `color="text.secondary"` for de-emphasized text
4. Use `gutterBottom` for space below headings
5. Prefer Typography over raw `<p>`, `<h1>`, `<span>` tags

---

## 5. Page Structure Templates

### 5A. Standard Settings/Form Page

```jsx
const SettingsPage = () => {
  return (
    <Container maxWidth={false} sx={{ maxWidth: 660, px: { xs: 0 } }}>
      <Stack spacing={3}>
        {/* Page Header */}
        <Typography variant="h5">Settings</Typography>

        {/* Section 1 */}
        <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6 }}>
          <Stack spacing={3}>
            <Typography variant="h6">General</Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="First Name" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Last Name" />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth label="Email" />
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Section 2 */}
        <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Preferences</Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControlLabel control={<Switch />} label="Dark mode" />
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Save button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained">Save Changes</Button>
        </Box>
      </Stack>
    </Container>
  );
};
```

### 5B. Dashboard Page with Widgets

```jsx
const DashboardPage = () => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {/* Full-width greeting/header */}
      <Grid size={12}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5">Dashboard</Typography>
        </Paper>
      </Grid>

      {/* KPI Cards row */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card background={1} variant="outlined">
          <CardContent>
            <Typography variant="overline">Revenue</Typography>
            <Typography variant="h4">$42,500</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card background={1} variant="outlined">
          <CardContent>
            <Typography variant="overline">Orders</Typography>
            <Typography variant="h4">1,234</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Main content + sidebar */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper background={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6 }}>
          {/* Chart or main widget */}
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper background={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6 }}>
          {/* Sidebar widget */}
        </Paper>
      </Grid>
    </Grid>
  );
};
```

### 5C. List/Table Page

```jsx
const ListPage = () => {
  return (
    <Stack spacing={3}>
      {/* Header with actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Items</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Item
        </Button>
      </Stack>

      {/* Filters */}
      <Paper background={1} sx={{ p: 2, borderRadius: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Search" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" select label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Data table */}
      <Paper sx={{ overflow: 'auto' }}>
        <DataGrid rows={rows} columns={columns} />
      </Paper>
    </Stack>
  );
};
```

### 5D. Detail Page (Main + Sidebar)

```jsx
const DetailPage = () => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {/* Main content */}
      <Grid size={{ xs: 12, md: 8, xl: 9 }}>
        <Stack spacing={3}>
          <Paper sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3}>
              <Typography variant="h5">Item Details</Typography>
              <Grid container spacing={2}>
                {/* Detail fields */}
              </Grid>
            </Stack>
          </Paper>
        </Stack>
      </Grid>

      {/* Sidebar */}
      <Grid size={{ xs: 12, md: 4, xl: 3 }}>
        <Paper
          background={1}
          sx={{
            p: { xs: 3, md: 4 },
            position: { md: 'sticky' },
            top: { md: 80 },
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Summary</Typography>
            {/* Sidebar content */}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};
```

### 5E. Tab-Based Page

```jsx
const TabPage = () => {
  const [tab, setTab] = useState('general');

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Account Settings</Typography>

      <Paper>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={(e, v) => setTab(v)}>
              <Tab label="General" value="general" />
              <Tab label="Security" value="security" />
              <Tab label="Notifications" value="notifications" />
            </TabList>
          </Box>
          <TabPanel value="general">
            <Stack spacing={3}>
              <Grid container spacing={2}>
                {/* Tab content */}
              </Grid>
            </Stack>
          </TabPanel>
        </TabContext>
      </Paper>
    </Stack>
  );
};
```

---

## 6. PierceDesk-Specific Patterns

### 6A. The `background` Prop (Custom)

PierceDesk extends Paper and Card with a custom `background` prop that maps to theme elevation backgrounds:

```jsx
<Paper background={1} />  // theme.palette.background.elevation1
<Paper background={2} />  // theme.palette.background.elevation2
<Paper background={3} />  // theme.palette.background.elevation3
<Paper background={4} />  // theme.palette.background.elevation4
<Paper background={5} />  // theme.palette.background.elevation5
```

**Rules:**
- `background={1}` is the standard for secondary surfaces (sidebars, cards, panels)
- Default Paper (no background) for primary content areas
- `background={2}` or higher for nested surfaces inside `background={1}`
- Works on both Paper and Card components

### 6B. Standard Padding/Spacing Values

| Context | Value | Notes |
|---------|-------|-------|
| Paper padding (page sections) | `p: { xs: 3, md: 5 }` | Responsive, larger on desktop |
| Paper padding (compact/cards) | `p: { xs: 2, md: 3 }` | Smaller for dashboard widgets |
| Grid container spacing (forms) | `spacing={{ xs: 2, md: 3 }}` | Responsive |
| Grid container spacing (compact) | `spacing={2}` | For dense layouts |
| Stack section spacing | `spacing={3}` | Between major sections |
| Stack item spacing | `spacing={2}` | Between related items |
| Paper border-radius | `borderRadius: 6` | Standard rounded corners |
| DialogContent Grid margin-top | `sx={{ mt: 1 }}` | Prevents label overlap |

### 6C. Sticky Sidebar Pattern

```jsx
<Grid size={{ xs: 12, md: 4 }}>
  <Paper
    background={1}
    sx={{
      p: { xs: 3, md: 4 },
      position: { md: 'sticky' },
      top: { md: 80 },
    }}
  >
    {/* Sidebar content */}
  </Paper>
</Grid>
```

### 6D. IconifyIcon Usage

PierceDesk uses `@iconify/react` via a wrapped component:

```jsx
import IconifyIcon from 'components/base/IconifyIcon';

// Standard icon usage
<IconifyIcon icon="material-symbols-light:edit" />
<IconifyIcon icon="material-symbols-light:delete" />
<IconifyIcon icon="material-symbols-light:more-vert" />

// In IconButton
<IconButton aria-label="edit">
  <IconifyIcon icon="material-symbols-light:edit" />
</IconButton>
```

---

## 7. Exemplar Files (Copy From These)

These files demonstrate correct patterns. Study and copy structure from them:

### Layout Patterns
| File | Pattern Demonstrated |
|------|---------------------|
| `src/components/sections/dashboards/crm/index.jsx` | Complex nested Grid layout, responsive breakpoints |
| `src/components/sections/account/index.jsx` | Responsive drawer/sticky sidebar, Paper with background |
| `src/components/sections/ecommerce/customer/checkout/index.jsx` | Asymmetric Grid (8/4), sticky sidebar |
| `src/components/sections/ecommerce/customer/cart/index.jsx` | Grid container, Paper background, conditional empty state |

### Form Patterns
| File | Pattern Demonstrated |
|------|---------------------|
| `src/components/sections/projects/project-kanban/AddTaskDialog.jsx` | Dialog form with Grid, fullWidth fields, responsive sizing |
| `src/components/sections/kanban/kanban/task-details/TaskSummary.jsx` | Paper form with Grid+Stack, all fields fullWidth |
| `src/components/sections/account/personal-info/Names.jsx` | Simple form with fullWidth TextFields |
| `src/components/sections/invoice/create-invoice/index.jsx` | FormProvider + Stack + Container pattern |

### Surface Patterns
| File | Pattern Demonstrated |
|------|---------------------|
| `src/components/sections/account/common/InfoCard.jsx` | Paper background={1}, elevation=0, hover states |
| `src/components/sections/dashboards/crm/kpi/KPI.jsx` | Card with CardHeader, CardContent, CardActions, Collapse |
| `src/docs/component-docs/CardDoc.jsx` | All Card variants and sub-components |
| `src/docs/component-docs/PaperDoc.jsx` | Paper variants, backgrounds, elevations |

### Page Structure
| File | Pattern Demonstrated |
|------|---------------------|
| `src/components/sections/account/common/AccountTabPanel.jsx` | Tab panel page layout |
| `src/components/sections/account/common/AccountTabPanelSection.jsx` | Section within tab |

---

## 8. Anti-Pattern Gallery

### CRITICAL: Never Do These

#### 8.1 Box flex instead of Grid for form columns
```jsx
// WRONG
<Box sx={{ display: 'flex', gap: 2 }}>
  <TextField label="First" />
  <TextField label="Last" />
</Box>

// CORRECT
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="First" /></Grid>
  <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Last" /></Grid>
</Grid>
```

#### 8.2 Stack direction="row" for form columns
```jsx
// WRONG
<Stack direction="row" spacing={2}>
  <TextField label="A" />
  <TextField label="B" />
</Stack>

// CORRECT
<Grid container spacing={2}>
  <Grid size={6}><TextField fullWidth label="A" /></Grid>
  <Grid size={6}><TextField fullWidth label="B" /></Grid>
</Grid>
```

#### 8.3 Hardcoded widths on form inputs
```jsx
// WRONG
<TextField sx={{ width: 200 }} label="Name" />
<TextField sx={{ width: '50%' }} label="Email" />
<TextField sx={{ minWidth: 120 }} label="Status" />

// CORRECT
<Grid size={{ xs: 12, md: 6 }}>
  <TextField fullWidth label="Name" />
</Grid>
```

#### 8.4 Missing fullWidth on inputs inside Grid
```jsx
// WRONG - input won't fill the column
<Grid size={{ xs: 12, md: 6 }}>
  <TextField label="Name" />
</Grid>

// CORRECT
<Grid size={{ xs: 12, md: 6 }}>
  <TextField fullWidth label="Name" />
</Grid>
```

#### 8.5 Old Grid v5/v6 syntax
```jsx
// WRONG - old syntax
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>Content</Grid>
</Grid>

// CORRECT - MUI v7
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
</Grid>
```

#### 8.6 Box flex instead of Stack for vertical spacing
```jsx
// WRONG
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
  <Section1 />
  <Section2 />
</Box>

// CORRECT
<Stack spacing={3}>
  <Section1 />
  <Section2 />
</Stack>
```

#### 8.7 sx flexDirection instead of Stack direction prop
```jsx
// WRONG
<Stack sx={{ flexDirection: 'row' }}>

// CORRECT
<Stack direction="row">
```

#### 8.8 Paper where Card is appropriate
```jsx
// WRONG - has structured header/body/actions but uses Paper
<Paper background={1} sx={{ p: 3 }}>
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="h6">Revenue</Typography>
    <IconButton><MoreVertIcon /></IconButton>
  </Stack>
  <Typography variant="h4">$42,500</Typography>
  <Button size="small">View Details</Button>
</Paper>

// CORRECT - use Card for structured content
<Card background={1} variant="outlined">
  <CardHeader
    title="Revenue"
    action={<IconButton><MoreVertIcon /></IconButton>}
  />
  <CardContent>
    <Typography variant="h4">$42,500</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">View Details</Button>
  </CardActions>
</Card>
```

#### 8.9 Building page structure from scratch
```jsx
// WRONG - inventing layout from scratch
<div style={{ padding: 20 }}>
  <div style={{ display: 'flex', gap: 20 }}>
    <div style={{ flex: 2 }}>Main</div>
    <div style={{ flex: 1 }}>Sidebar</div>
  </div>
</div>

// CORRECT - use established page structure
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, md: 8 }}>
    <Paper sx={{ p: { xs: 3, md: 5 } }}>Main</Paper>
  </Grid>
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper background={1} sx={{ p: { xs: 3, md: 4 } }}>Sidebar</Paper>
  </Grid>
</Grid>
```

#### 8.10 Hardcoded pixel widths for drawers/panels
```jsx
// WRONG
<Drawer PaperProps={{ sx: { width: '480px' } }}>

// CORRECT
<Drawer PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 560 } } }}>
```

---

## 9. MUI MCP Workflow

The `mui-mcp` MCP server provides live access to MUI component documentation. **ALWAYS use these tools before writing MUI code you're unsure about:**

### Available Tools

| Tool | When to Use |
|------|-------------|
| `mcp__mui-mcp__search_components` | Find the right component for a use case |
| `mcp__mui-mcp__get_component_info` | Get props, imports, docs for a specific component |
| `mcp__mui-mcp__list_components` | Browse all 50+ MUI components |
| `mcp__mui-mcp__get_customization_guide` | Theming and sx prop patterns |
| `mcp__mui-mcp__get_mui_guide` | General MUI best practices |

### Mandatory MUI MCP Checks

**Before using ANY component you haven't used in this session:**
1. Call `get_component_info` to verify correct props and syntax
2. Check if there's a PierceDesk-specific pattern (see Section 6)

**When implementing a new page or feature:**
1. Call `search_components` to find the right components for each UI element
2. Call `get_component_info` for each component you'll use
3. Check exemplar files (Section 7) for existing patterns

**When unsure about styling:**
1. Call `get_customization_guide` for sx prop and theming patterns
2. Prefer theme values over hardcoded colors/sizes

### MUI MCP is NOT a substitute for this guide

MUI MCP provides standard MUI documentation. This guide provides PierceDesk-specific overrides:
- `background` prop on Paper/Card (not in MUI docs)
- Default `variant="outlined"` on Paper (PierceDesk override)
- Specific spacing values and responsive patterns
- Exemplar files to copy from

**Always cross-reference MUI MCP output with this guide. PierceDesk patterns take precedence.**
