# Organization Setup UI - Design Document

**Date:** 2026-01-27
**Phase:** Phase D - Phase 1.2: Authentication & Multi-Tenancy
**Status:** Validated, Ready for Implementation

## Overview

Full-screen organization setup flow for authenticated users who don't have an organization yet. Users can either create a new organization or join an existing one via invite code.

## Components

### 1. Page Structure - `src/app/organization-setup/page.jsx`

**Layout:**
- Full-screen centered container using MUI Box with flexbox centering
- Paper component (`background={1}`) as main card
- Responsive padding: `p: { xs: 3, md: 5 }`
- Maximum width: 600px
- Protected route (redirect to login if not authenticated)

**Structure:**
```jsx
<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
  <Paper background={1} sx={{ p: { xs: 3, md: 5 }, maxWidth: 600, width: 1 }}>
    {/* Header */}
    <Typography variant="h4">Welcome to PierceDesk!</Typography>
    <Typography variant="body2" color="text.secondary">
      Get started by creating or joining an organization
    </Typography>

    {/* Tabs */}
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab label="Create Organization" />
      <Tab label="Join with Code" />
    </Tabs>

    {/* Tab Panels */}
    <TabPanel value={activeTab} index={0}>
      <CreateOrganizationForm />
    </TabPanel>
    <TabPanel value={activeTab} index={1}>
      <JoinOrganizationForm />
    </TabPanel>
  </Paper>
</Box>
```

**Route Protection:**
```javascript
const { user, loading } = useSupabaseAuth();

if (loading) return <LoadingSpinner />;
if (!user) redirect('/authentication/default/jwt/login');
```

### 2. CreateOrganizationForm - `src/components/sections/organization/CreateOrganizationForm.jsx`

**Form Fields:**
- Organization Name (required, min 3 chars, max 50 chars)

**Validation (Yup):**
```javascript
const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Organization name is required')
    .min(3, 'Organization name must be at least 3 characters')
    .max(50, 'Organization name must be at most 50 characters')
});
```

**Form Logic:**
```javascript
const { trigger, isMutating } = useCreateOrganization();
const { setOrganization } = useSupabaseAuth();

const onSubmit = async (formData) => {
  try {
    const orgId = await trigger({ name: formData.name });
    await setOrganization(orgId);
    // Auto-redirect handled by SupabaseAuthProvider
  } catch (err) {
    setError(err.message);
  }
};
```

**Components:**
- TextField (Material-UI)
- LoadingButton for submit (shows loading during API call)
- Alert component for error messages

### 3. JoinOrganizationForm - `src/components/sections/organization/JoinOrganizationForm.jsx`

**Form Fields:**
- Invite Code (required, alphanumeric)

**Validation (Yup):**
```javascript
const schema = yup.object({
  inviteCode: yup
    .string()
    .trim()
    .required('Invite code is required')
    .matches(/^[a-zA-Z0-9]+$/, 'Invite code must be alphanumeric')
});
```

**Form Logic:**
```javascript
const { trigger, isMutating } = useJoinOrganization();
const { setOrganization } = useSupabaseAuth();

const onSubmit = async (formData) => {
  try {
    const orgId = await trigger({ inviteCode: formData.inviteCode });
    await setOrganization(orgId);
    // Auto-redirect handled by SupabaseAuthProvider
  } catch (err) {
    // Parse error for user-friendly message
    setError(parseErrorMessage(err));
  }
};
```

**Error Messages:**
- "Invalid invite code"
- "Invite code expired"
- "You're already a member of this organization"
- Generic fallback for other errors

**Components:**
- TextField (Material-UI)
- LoadingButton for submit
- Alert component for error messages

## State Management

**Tab State (Page Level):**
```javascript
const [activeTab, setActiveTab] = useState(0); // 0 = Create, 1 = Join
```

**Authentication Context:**
- `user` - verify authentication status
- `setOrganization(orgId)` - set active org after success
- `loading` - global loading state

**API Hooks:**
- `useCreateOrganization()` from `src/services/swr/api-hooks/useOrganizationApi.js`
- `useJoinOrganization()` from `src/services/swr/api-hooks/useOrganizationApi.js`

## Success Flow

1. User submits form (Create or Join)
2. API mutation called via SWR hook
3. On success, receive `orgId`
4. Call `setOrganization(orgId)` from useSupabaseAuth
5. SupabaseAuthProvider detects organization set
6. Automatic redirect to dashboard (handled by provider lines 82-86)

## Material-UI Patterns

**Grid:** v7 syntax with `size` prop
**Paper:** `background={1}` for main container
**Padding:** Responsive `p: { xs: 3, md: 5 }`
**Colors:** Theme tokens only, no hardcoded values
**Typography:** Theme variants (h4, body2, etc.)

## Accessibility

- Semantic HTML elements
- ARIA labels on form fields
- Keyboard navigation support
- Error messages announced to screen readers
- Focus management for tabs

## Responsive Design

- Mobile-first approach
- Responsive padding on Paper component
- Full-width on mobile, max-width 600px on desktop
- Stack form elements vertically on all screen sizes

## Testing Strategy (TDD)

**Unit Tests:**
1. CreateOrganizationForm validation
2. JoinOrganizationForm validation
3. Form submission with success
4. Form submission with error
5. Route protection logic

**Integration Tests:**
1. Tab switching functionality
2. API hook integration
3. Auth context integration
4. Success flow (create → setOrganization → redirect)
5. Error handling flow

## Next Steps

1. Write tests (TDD - Red phase)
2. Implement components (Green phase)
3. Refactor and polish (Refactor phase)
4. Verify with VERIFY-BEFORE-COMPLETE skill
5. Commit with evidence
