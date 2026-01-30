# Agent Guidance: Component Directory

## Component Creation Policy

**CRITICAL: Do NOT create new components without explicit approval.**

### Required Workflow

1. **Search First**: Before creating any new component, thoroughly search existing components in:
   - `src/components/` and all subdirectories
   - `template-aurora/src/` (Aurora template components)
   - Project dependencies (Material-UI, custom packages)

2. **Reuse Existing**: If a component exists that meets requirements:
   - Use it directly
   - Copy and modify from Aurora templates (preferred pattern)
   - Extend existing components

3. **Request Approval**: Only if no suitable component exists:
   - Clearly explain why existing components don't work
   - Describe the new component's purpose and scope
   - **WAIT for explicit user approval before creating**

## File Restrictions

**This directory is for React components ONLY.**

### ❌ Files that DO NOT belong here:
- Test files (*.test.js, *.spec.ts, etc.)
- Documentation files (README.md, *.md except this agent.md)
- Configuration files
- Utility functions (belongs in `src/utils/`)
- API hooks (belongs in `src/services/`)
- Type definitions (co-locate with component or use shared types)
- Build artifacts
- Any non-component code

### ✅ Files that DO belong here:
- React component files (*.jsx, *.tsx, *.js, *.ts)
- Component-specific styles (if using CSS modules)
- Component barrel exports (index.js/ts)

## Directory Structure

Components should be organized by feature or shared status:
```
src/components/
├── shared/          # Shared/common components
├── feature-name/    # Feature-specific components
└── agent.md         # This file
```

## Key Principles

1. **Search before create** - Existing solutions first
2. **Aurora-first** - Check templates before building custom
3. **Get approval** - Never assume a new component is needed
4. **Keep it clean** - Components only, no other file types
5. **Respect hierarchy** - No tests or docs in this tree

---

**Remember**: Creating a new component should be the LAST resort, not the first action.
