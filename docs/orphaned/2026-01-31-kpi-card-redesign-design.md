# KPI Card Redesign - Full-Featured Card Design

**Date:** 2026-01-31
**Component:** `src/components/sections/dashboards/crm/kpi/KPI.jsx`
**Status:** Design Approved

## Overview

Transform the CRM KPI cards from simple Paper components to full-featured Card components with interactive elements, expandable details, and enhanced visual design.

## Design Goals

1. Add interactive functionality (customize, export, alerts)
2. Provide expandable section for historical data and trends
3. Maintain existing visual styling (glow, border, border radius)
4. Improve information hierarchy with structured Card layout

## Component Structure

```
Card (replaces Paper)
├── CardHeader
│   ├── Avatar (displays KPI icon with colored background)
│   ├── title (KPI title, e.g., "Total Revenue")
│   └── action (three-dot menu for settings)
├── CardContent (main display area)
│   ├── Value display (large number, e.g., "$45,231")
│   └── Subtitle (e.g., "vs last month")
├── CardActions
│   ├── Action buttons (Customize, Export, Alerts)
│   └── Expand button (rotates to show more)
└── Collapse (expandable section)
    └── Historical data/trends/details
```

## Section 1: CardHeader

### Design
- **Avatar**: Shows the KPI icon (from current `icon.name` prop) with the icon's color as background
- **Title**: Displays the KPI title (e.g., "Total Revenue")
- **Subheader**: Shows last update time or "Real-time" indicator
- **Action Menu**: Three-dot IconButton with menu options (Settings, Download Data, Set Alert)

### Implementation
```jsx
<CardHeader
  avatar={
    <Avatar sx={{ bgcolor: icon.color }}>
      <IconifyIcon icon={icon.name} />
    </Avatar>
  }
  action={
    <IconButton aria-label="settings">
      <IconifyIcon icon="material-symbols-light:more-vert" />
    </IconButton>
  }
  title={title}
  subheader="Real-time"
/>
```

## Section 2: CardContent (Main Display)

### Design
- Large typography for value (h3)
- Secondary text for subtitle
- Simplified layout (no responsive flex switching)
- Tighter spacing

### Implementation
```jsx
<CardContent>
  <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
    {numberFormat(value)}
  </Typography>
  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
    {subtitle}
  </Typography>
</CardContent>
```

## Section 3: CardActions

### Design
Action buttons for:
1. **Customize** (tune icon) - Configure KPI display settings
2. **Export** (download icon) - Export KPI data to CSV/Excel
3. **Alert** (notifications icon) - Set up threshold alerts
4. **Expand** (expand-more icon) - Toggles expanded view, rotates 180° when open

### Implementation
```jsx
<CardActions disableSpacing>
  <IconButton aria-label="customize view">
    <IconifyIcon icon="material-symbols-light:tune" />
  </IconButton>
  <IconButton aria-label="export data">
    <IconifyIcon icon="material-symbols-light:download" />
  </IconButton>
  <IconButton aria-label="set alert">
    <IconifyIcon icon="material-symbols-light:notifications" />
  </IconButton>
  <IconButton
    onClick={handleExpandClick}
    aria-expanded={expanded}
    aria-label="show details"
    sx={{
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      marginLeft: 'auto',
      transition: (theme) =>
        theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
    }}
  >
    <IconifyIcon icon="material-symbols-light:expand-more" />
  </IconButton>
</CardActions>
```

## Section 4: Expandable Content (Collapse)

### Design
Shows additional KPI insights:
1. **Previous Period Value** - Comparison data
2. **Change Percentage** - With color indicator (green/red)
3. **Target Goal** - If applicable
4. **Last Updated** - Timestamp

### Implementation
```jsx
<Collapse in={expanded} timeout="auto" unmountOnExit>
  <CardContent>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
      KPI Details
    </Typography>

    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Previous Period
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {previousValue}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Change
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
          +7.2% ↑
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Target
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          $50,000
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Last Updated
        </Typography>
        <Typography variant="body2">
          2 minutes ago
        </Typography>
      </Box>
    </Stack>
  </CardContent>
</Collapse>
```

## Styling

### Card Wrapper
Maintain existing visual enhancements:
```jsx
sx={(theme) => ({
  boxShadow: `0 0 20px ${theme.vars.palette.divider}`,
  border: '0.5px solid white',
  borderRadius: '8px',
})}
```

### Other Properties
- `background={1}` - Theme-aware background
- `variant="outlined"` - Outlined card variant

## State Management

Add React state for expand/collapse:
```jsx
const [expanded, setExpanded] = useState(false);

const handleExpandClick = () => {
  setExpanded(!expanded);
};
```

## Required Imports

```jsx
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Stack,
  Box
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import useNumberFormat from 'hooks/useNumberFormat';
```

## MVP Data Handling

For initial implementation:
- Use placeholder/mock data for expandable section details
- Later iteration can extend API to provide: `previousValue`, `change`, `target`, `lastUpdated`

## Component Props

Existing props remain unchanged:
- `title` - KPI title
- `subtitle` - KPI subtitle
- `value` - KPI value (number)
- `icon` - Object with `name` (icon string) and `color` (color string)

## Migration Notes

- Replace `Paper` component with `Card`
- Remove outer padding from Card (CardHeader/CardContent have their own)
- Icon moves from content area to CardHeader avatar
- Layout simplifies (no responsive flex direction switching)

## Testing Considerations

- Verify expand/collapse animation works smoothly
- Test all action buttons are accessible
- Ensure responsive behavior on mobile/tablet
- Verify theme compliance in light/dark modes
- Check that glow, border, and border radius are preserved

## Future Enhancements

- Connect action buttons to actual functionality
- Integrate real historical data from API
- Add mini-charts in expanded section
- Add menu items to CardHeader action button
