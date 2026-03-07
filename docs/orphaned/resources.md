---
name: frontend-patterns:resources
description: "Available resources - MUI documentation, MCP server, icons, theme, component docs"
version: "1.0.0"
tags: ["frontend", "mui", "react", "resources", "documentation"]
related_skills: []
---

# Available Resources & Tools

## MUI Documentation Index

**Location:** `.claude/mui-doc.txt`

**Purpose:** Complete MUI v7 component documentation index with links

**When to use:** ALWAYS check first before using any MUI component

**Contains:**
- All component documentation links
- Customization guides (theming, dark mode, spacing)
- Integration guides (Next.js, TypeScript)
- Migration guides (v5→v6→v7)

## MUI MCP Server (mui-mcp)

**Type:** stdio MCP server

**Purpose:** Interactive component API reference, props, examples

**When to use:**
- Need current v7 syntax for complex components
- Verifying prop types and variants
- Getting code examples for DataGrid, Autocomplete, Date Pickers

## Icon Documentation

**Location:** `/documentation/icons`

**Purpose:** Available icon sets, naming conventions, usage patterns

**When to use:**
- Before hardcoding icon names
- Adding icons to buttons, cards, navigation
- Ensuring consistent icon usage

## Component Documentation

**Location:** `/component-docs/[slug]` (in app)

**Purpose:** PierceDesk custom component documentation

**When to use:**
- Understanding custom base components
- Before creating new shared components

## Theme Documentation

**Location:** `src/theme/` directory

**Files:**
- `palette/` - Color definitions
- `typography.js` - Type scale
- `components/` - Component overrides
- `mixins.js` - Responsive utilities

**When to use:**
- Verifying theme token names
- Understanding breakpoints
- Checking component overrides

## Resource Usage Workflow

1. Check `.claude/mui-doc.txt` for MUI component links
2. Use MUI MCP server for detailed API/props
3. Check `/documentation/icons` before adding icons
4. Review `src/theme/` for theme tokens
5. Search `src/components/` before creating

## Common Theme Tokens

```javascript
// Colors
theme.palette.primary.main
theme.palette.success.main
theme.palette.error.main
theme.palette.text.primary
theme.palette.background.default

// Spacing
theme.spacing(2)  // 16px
theme.spacing(3)  // 24px
theme.spacing(5)  // 40px

// Breakpoints
theme.breakpoints.up('xs')  // 0px+
theme.breakpoints.up('sm')  // 600px+
theme.breakpoints.up('md')  // 900px+
theme.breakpoints.up('lg')  // 1200px+
theme.breakpoints.up('xl')  // 1536px+
```

## Related Patterns

- **Paper rules:** See `frontend-patterns:paper-rules`
- **Grid selection:** See `frontend-patterns:grid-selection`
- **Page templates:** See `frontend-patterns:page-templates`
- **Error prevention:** See `frontend-patterns:error-prevention`
