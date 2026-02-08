# PierceDesk6 - Development Guidelines & Standards

## Code Quality Standards

### File Structure & Naming
- **Client Components**: Use `'use client';` directive at top of files requiring browser APIs
- **File Extensions**: Use `.js` for JavaScript files, `.jsx` for React components
- **Naming Convention**: PascalCase for components, camelCase for functions and variables
- **Export Pattern**: Default exports for main components, named exports for utilities

### Import Organization
```javascript
// External libraries first
import { Typography } from '@mui/material';
import useSWR from 'swr';

// Internal imports with relative paths
import createClient from 'lib/supabase/client';
import { generateProposalNumber } from 'utils/crm/proposalNumberGenerator';
```

### Documentation Standards
- **JSDoc Comments**: Comprehensive function documentation with parameters and return types
- **Inline Comments**: Explain complex business logic and TODO items
- **Example Usage**: Include usage examples in JSDoc for hooks and utilities
- **Parameter Validation**: Document required vs optional parameters

## Semantic Patterns & Architecture

### Data Fetching with SWR
**Pattern Frequency: 5/5 files**
```javascript
// Standard SWR hook pattern
export const useProposals = (filters = {}, config) => {
  const swr = useSWR(
    ['proposals', filters], // Key includes filters for cache separation
    () => proposalsFetcher(filters),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    }
  );
  return swr;
};
```

### Authentication & Security Pattern
**Pattern Frequency: 4/5 files**
```javascript
// Standard auth check pattern
const supabase = createClient();
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  throw new Error(authError?.message || 'Not authenticated');
}
```

### Error Handling Standards
**Pattern Frequency: 5/5 files**
```javascript
// Consistent error handling with descriptive messages
if (error) {
  throw new Error(`Failed to fetch proposal ${id}: ${error.message}`);
}

// Input validation with specific error messages
if (!arg.opportunity_id) {
  throw new Error('opportunity_id is required');
}
```

### Database Query Patterns
**Pattern Frequency: 4/5 files**
```javascript
// Standard Supabase query with joins and filtering
let query = supabase
  .from('proposals')
  .select(`
    *,
    opportunity:opportunities(
      *,
      account:accounts(*)
    )
  `)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

## Component Development Standards

### React Hook Patterns
**Pattern Frequency: 5/5 files**
```javascript
// State management with descriptive initial values
const [alignment, setAlignment] = useState('left');
const [formats, setFormats] = useState(() => ['bold', 'italic']);

// Event handlers with clear naming
const handleAlignment = (event, newAlignment) => {
  setAlignment(newAlignment);
};
```

### Material-UI Integration
**Pattern Frequency: 4/5 files**
```javascript
// Consistent sx prop usage for styling
<Typography
  variant="body1"
  sx={{
    mb: 2,
    color: 'text.secondary',
  }}
>

// Theme-aware styling patterns
sx={{
  backgroundColor: (theme) => `${theme.vars.palette.background.elevation1}`,
  borderBottom: (theme) => expanded === id ? `1px solid ${theme.vars.palette.divider}` : undefined,
}}
```

### Code Documentation Components
**Pattern Frequency: 3/5 files**
```javascript
// Standardized documentation structure
<DocPageLayout
  pageHeaderProps={{
    title: 'Component Name',
    description: 'Component description',
    breadcrumbs: [{ label: 'Docs', url: '#!' }, { label: 'Component' }],
    docLink: `${muiComponentBaseLink}/react-component`,
    folderLink: `${folderBaseLink}/ComponentDoc.jsx`,
  }}
>
```

## Data Management Patterns

### SWR Mutation Pattern
**Pattern Frequency: 4/5 files**
```javascript
// Standard mutation hook with success handling
export const useCreateProposal = () => {
  const mutation = useSWRMutation('create-proposal', createProposalMutation, {
    onSuccess: (data, key, config) => {
      if (config?.onSuccess) {
        config.onSuccess(data, key, config);
      }
    },
  });
  return mutation;
};
```

### Data Transformation Patterns
**Pattern Frequency: 3/5 files**
```javascript
// Consistent data structure for UI components
export const taskMetrics = [
  {
    title: 'Running',
    count: 7,
    change: {
      amount: 2,
      direction: 'less',
      timeFrame: 'last month',
    },
    icon: {
      name: 'material-symbols:note-outline',
      color: 'primary',
    },
  },
];
```

### Multi-tenant Data Isolation
**Pattern Frequency: 4/5 files**
- All database queries rely on Row-Level Security (RLS) for organization isolation
- No manual organization_id filtering in application code
- Authentication verification before all database operations

## Performance & Optimization

### Caching Strategies
- **SWR Keys**: Include relevant filters in cache keys for proper invalidation
- **Conditional Fetching**: Use null keys to prevent unnecessary requests
- **Revalidation Control**: Disable focus revalidation for better UX

### Code Splitting Patterns
- **Dynamic Imports**: Use for large components and documentation
- **Lazy Loading**: Implement for non-critical UI components
- **Bundle Optimization**: Separate vendor and application code

## Testing & Quality Assurance

### Component Testing Standards
- **Accessibility**: Include aria-labels and proper semantic markup
- **Error Boundaries**: Implement for robust error handling
- **Loading States**: Provide feedback during async operations

### Code Review Guidelines
- **Security**: Verify authentication checks and input sanitization
- **Performance**: Review query efficiency and caching strategies
- **Maintainability**: Ensure consistent patterns and documentation