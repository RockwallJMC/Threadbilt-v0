# Layout Patterns

Quick reference for common layout patterns in PierceDesk.

## The Golden Rules

1. **Grid for columns** - Never use flex or inline styles for form column layout
2. **Stack for vertical rhythm** - Section spacing, not column layout
3. **fullWidth on ALL inputs** - TextField, Select, Autocomplete, DatePicker
4. **MUI v7 syntax** - Use `size` prop, not `xs`/`md` props
5. **Correct surface** - Paper for containers, Card for structured content, Box for utility only
6. **Copy from exemplars** - Never invent page structure from scratch

## Page Structure Templates

### Settings/Form Page

```jsx
<Container maxWidth={false} sx={{ maxWidth: 660, px: { xs: 0 } }}>
  <Stack spacing={3}>
    <Typography variant="h5">Page Title</Typography>

    <Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Section Title</Typography>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Field A" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Field B" />
          </Grid>
        </Grid>
      </Stack>
    </Paper>

    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button variant="contained">Save</Button>
    </Box>
  </Stack>
</Container>
```

### Dashboard Page

```jsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  {/* KPI row */}
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

  {/* Main + sidebar */}
  <Grid size={{ xs: 12, md: 8 }}>
    <Paper background={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6 }}>
      {/* Chart widget */}
    </Paper>
  </Grid>
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper background={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 6 }}>
      {/* Side widget */}
    </Paper>
  </Grid>
</Grid>
```

### Detail Page (Main + Sidebar)

```jsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, md: 8, xl: 9 }}>
    <Stack spacing={3}>
      <Paper sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Typography variant="h5">Item Details</Typography>
          <Grid container spacing={2}>
            {/* detail fields */}
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  </Grid>
  <Grid size={{ xs: 12, md: 4, xl: 3 }}>
    <Paper
      background={1}
      sx={{ p: { xs: 3, md: 4 }, position: { md: 'sticky' }, top: { md: 80 } }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Summary</Typography>
        {/* sidebar content */}
      </Stack>
    </Paper>
  </Grid>
</Grid>
```

### List/Table Page

```jsx
<Stack spacing={3}>
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="h5">Items</Typography>
    <Button variant="contained" startIcon={<AddIcon />}>Add Item</Button>
  </Stack>

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

  <Paper sx={{ overflow: 'auto' }}>
    <DataGrid rows={rows} columns={columns} />
  </Paper>
</Stack>
```

### Tab-Based Page

```jsx
<Stack spacing={3}>
  <Typography variant="h5">Account Settings</Typography>
  <Paper>
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(e, v) => setTab(v)}>
          <Tab label="General" value="general" />
          <Tab label="Security" value="security" />
        </TabList>
      </Box>
      <TabPanel value="general">
        <Stack spacing={3}>
          <Grid container spacing={2}>{/* tab content */}</Grid>
        </Stack>
      </TabPanel>
    </TabContext>
  </Paper>
</Stack>
```

---

## Page Width

Use `Container` for page-level width control:
```jsx
<Container maxWidth={false} sx={{ maxWidth: 520, px: { xs: 0 } }}>
```

Or custom responsive max-width:
```jsx
<Container maxWidth={false} sx={{ maxWidth: { xs: 628, md: 660 }, px: { xs: 0 } }}>
```

---

## Surface Patterns

### Paper (General Surface)
```jsx
// Page section
<Paper background={1} sx={{ p: { xs: 3, md: 5 }, borderRadius: 6 }}>
  <Stack spacing={3}>
    <Typography variant="h6">Section Title</Typography>
    <Grid container spacing={2}>{/* form fields */}</Grid>
  </Stack>
</Paper>

// Sticky sidebar
<Paper background={1} sx={{ p: { xs: 3, md: 4 }, position: { md: 'sticky' }, top: { md: 80 } }}>
  {/* sidebar content */}
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

### Card (Structured Content)
```jsx
// KPI Card
<Card background={1} variant="outlined">
  <CardHeader title="Revenue" action={<IconButton>...</IconButton>} />
  <CardContent>
    <Typography variant="h4">$42,500</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">View Report</Button>
  </CardActions>
</Card>

// Media Card
<Card background={1} variant="outlined" sx={{ maxWidth: 345 }}>
  <CardMedia component="img" image="/path.webp" sx={{ height: 200, objectFit: 'cover' }} />
  <CardContent>
    <Typography variant="h6">Product Name</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Details</Button>
  </CardActions>
</Card>

// Clickable Card
<Card background={1} variant="outlined">
  <CardActionArea onClick={handleClick}>
    <CardContent>
      <Typography variant="h6">Click anywhere</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

---

## Grid Patterns

### Two-Column Form
```jsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField fullWidth label="Field A" />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField fullWidth label="Field B" />
  </Grid>
</Grid>
```

### Three-Column Row
```jsx
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="A" /></Grid>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="B" /></Grid>
  <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth label="C" /></Grid>
</Grid>
```

### 8/4 Split (Primary + Sidebar)
```jsx
<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 8 }}>Main content</Grid>
  <Grid size={{ xs: 12, md: 4 }}>Sidebar</Grid>
</Grid>
```

### Address Block
```jsx
<Grid container spacing={2}>
  <Grid size={12}>
    <TextField fullWidth label="Street Address" />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <TextField fullWidth label="City" />
  </Grid>
  <Grid size={{ xs: 6, md: 3 }}>
    <TextField fullWidth label="State" />
  </Grid>
  <Grid size={{ xs: 6, md: 3 }}>
    <TextField fullWidth label="ZIP" />
  </Grid>
</Grid>
```

### Dashboard Widget Grid
```jsx
<Grid container spacing={{ xs: 2, md: 3 }}>
  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>KPI 1</Grid>
  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>KPI 2</Grid>
  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>KPI 3</Grid>
  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>KPI 4</Grid>
  <Grid size={{ xs: 12, md: 8 }}>Main Chart</Grid>
  <Grid size={{ xs: 12, md: 4 }}>Side Widget</Grid>
</Grid>
```

### Auto-Growing Item (MUI v7)
```jsx
<Grid container spacing={2}>
  <Grid size="grow"><TextField fullWidth label="Flexible width" /></Grid>
  <Grid size="auto"><Button variant="contained">Submit</Button></Grid>
</Grid>
```

---

## Dialog Form Layout

```jsx
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>Form Title</DialogTitle>
  <DialogContent>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={12}>
        <TextField fullWidth required label="Title" autoFocus />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth select label="Category">
          <MenuItem value="a">Option A</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth select label="Status">
          <MenuItem value="active">Active</MenuItem>
        </TextField>
      </Grid>
      <Grid size={12}>
        <TextField fullWidth multiline rows={3} label="Description" />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained">Save</Button>
  </DialogActions>
</Dialog>
```

**Critical:**
- `maxWidth="sm"` or `"md"` on Dialog
- `fullWidth` prop on Dialog
- `sx={{ mt: 1 }}` on Grid (prevents label overlap)
- `fullWidth` on every input
- `autoFocus` on first field

---

## Stack Usage

Use Stack for vertical rhythm between sections, NOT for column layout:
```jsx
// Vertical spacing
<Stack spacing={3}>
  <Paper>Section 1</Paper>
  <Paper>Section 2</Paper>
</Stack>

// With dividers
<Stack spacing={2} divider={<Divider />}>
  <InfoRow label="Name" value="John" />
  <InfoRow label="Email" value="john@example.com" />
</Stack>

// Horizontal button row (acceptable)
<Stack direction="row" spacing={1} justifyContent="flex-end">
  <Button>Cancel</Button>
  <Button variant="contained">Save</Button>
</Stack>
```

---

## Anti-Patterns (Never Do)

### Flex for Form Columns
```jsx
// WRONG
<Box sx={{ display: 'flex', gap: 2 }}><TextField /><TextField /></Box>
// CORRECT
<Grid container spacing={2}>
  <Grid size={6}><TextField fullWidth /></Grid>
  <Grid size={6}><TextField fullWidth /></Grid>
</Grid>
```

### Hardcoded Widths
```jsx
// WRONG
<TextField sx={{ width: 200 }} />
// CORRECT
<Grid size={{ xs: 12, md: 6 }}><TextField fullWidth /></Grid>
```

### Stack direction="row" for Forms
```jsx
// WRONG
<Stack direction="row" spacing={2}><TextField /><TextField /></Stack>
// CORRECT
<Grid container spacing={2}>
  <Grid size={6}><TextField fullWidth /></Grid>
  <Grid size={6}><TextField fullWidth /></Grid>
</Grid>
```

### Missing fullWidth
```jsx
// WRONG
<TextField label="Description" />
// CORRECT
<TextField fullWidth label="Description" />
```

### Box as Flex Container for Children
```jsx
// WRONG
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
  <Section1 /><Section2 />
</Box>
// CORRECT
<Stack spacing={3}>
  <Section1 /><Section2 />
</Stack>
```

### Paper Where Card Fits Better
```jsx
// WRONG - manually building header+body+actions
<Paper background={1} sx={{ p: 3 }}>
  <Typography variant="h6">Revenue</Typography>
  <Typography variant="h4">$42,500</Typography>
  <Button size="small">View</Button>
</Paper>

// CORRECT - use Card for structured content
<Card background={1} variant="outlined">
  <CardHeader title="Revenue" />
  <CardContent><Typography variant="h4">$42,500</Typography></CardContent>
  <CardActions><Button size="small">View</Button></CardActions>
</Card>
```

---

## Spacing Quick Reference

| Context | Value |
|---------|-------|
| Grid container (forms) | `spacing={{ xs: 2, md: 3 }}` |
| Grid container (compact) | `spacing={2}` |
| Stack (sections) | `spacing={3}` |
| Stack (items) | `spacing={2}` |
| Paper padding (page) | `p: { xs: 3, md: 5 }` |
| Paper padding (compact) | `p: { xs: 2, md: 3 }` |
| Paper border radius | `borderRadius: 6` |
| DialogContent Grid | `sx={{ mt: 1 }}` |

---

## Exemplar Files

| Pattern | File |
|---------|------|
| Settings page | `src/components/sections/account/index.jsx` |
| Dashboard | `src/components/sections/dashboards/crm/index.jsx` |
| Dialog form | `src/components/sections/projects/project-kanban/AddTaskDialog.jsx` |
| Form in Paper | `src/components/sections/kanban/kanban/task-details/TaskSummary.jsx` |
| Card (KPI) | `src/components/sections/dashboards/crm/kpi/KPI.jsx` |
| Info card | `src/components/sections/account/common/InfoCard.jsx` |
| Checkout (main+sidebar) | `src/components/sections/ecommerce/customer/checkout/index.jsx` |
| Cart/list | `src/components/sections/ecommerce/customer/cart/index.jsx` |
| Tab panel | `src/components/sections/account/common/AccountTabPanel.jsx` |
| Invoice/form | `src/components/sections/invoice/create-invoice/index.jsx` |

---

## Component Docs

Source of truth for examples:
- `src/docs/component-docs/CardDoc.jsx` - Card variants, media, actions, expandable
- `src/docs/component-docs/PaperDoc.jsx` - Paper variants, backgrounds, elevations
- `src/docs/component-docs/BoxDoc.jsx` - Box as semantic element, sx prop
- `src/docs/component-docs/GridDoc.jsx` - Grid v7 patterns
- `src/docs/component-docs/StackDoc.jsx` - Stack usage
- `src/docs/component-docs/DialogDoc.jsx` - Dialog patterns
- `src/docs/component-docs/TextFieldDoc.jsx` - TextField patterns
