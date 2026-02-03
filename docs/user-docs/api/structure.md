# PierceDesk6 - Project Structure & Architecture

## Directory Structure

### Core Application (`/src`)
```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/            # Authentication-related pages
│   ├── (ecommerce)/       # E-commerce functionality
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes and endpoints
│   ├── auth/              # Authentication pages
│   ├── organization-setup/ # Multi-tenant organization setup
│   └── showcase/          # Component showcase and documentation
├── components/            # Reusable UI components
│   ├── base/              # Base/foundational components
│   ├── common/            # Common utility components
│   ├── docs/              # Documentation components
│   ├── icons/             # Icon components
│   ├── sections/          # Page section components
│   └── styled/            # Styled components
├── providers/             # React Context providers
├── services/              # External service integrations
│   ├── axios/             # HTTP client configuration
│   ├── firebase/          # Firebase integration
│   └── swr/               # SWR data fetching hooks
├── data/                  # Static data and mock data
├── hooks/                 # Custom React hooks
├── layouts/               # Page layout components
├── lib/                   # Utility libraries and configurations
├── theme/                 # Material-UI theme configuration
└── utils/                 # Utility functions
```

### Documentation & Configuration
```
docs/                      # Comprehensive project documentation
├── api/                   # API documentation
├── architecture/          # System architecture docs
├── authentication/        # Auth system documentation
├── features/              # Feature specifications
├── guides/                # Development guides
├── quality/               # Quality assurance docs
├── testing/               # Testing documentation
└── user-journeys/         # User experience flows

database/                  # Database schemas and seeds
scripts/                   # Automation and utility scripts
tests/                     # Playwright E2E test suites
```

## Core Components & Relationships

### Authentication System
- **Supabase Integration**: Primary authentication provider
- **Multi-tenant Support**: Organization-based user isolation
- **Session Management**: Secure session handling with middleware
- **RBAC Implementation**: Role-based access control

### Data Layer Architecture
- **Providers**: React Context for state management
- **SWR Integration**: Data fetching and caching
- **Supabase Client**: Database operations with RLS
- **API Routes**: Next.js API endpoints for business logic

### UI Component Hierarchy
- **Theme System**: Material-UI theming with custom extensions
- **Layout Components**: Responsive layout system
- **Base Components**: Foundational UI elements
- **Section Components**: Page-specific component compositions

### CRM Module Structure
```
CRM System
├── Leads Management
├── Contacts Management
├── Accounts Management
├── Opportunities Pipeline
├── Proposals System
└── Dashboard & Analytics
```

## Architectural Patterns

### Multi-Tenant Architecture
- **Organization-based Isolation**: Complete data separation
- **Row-Level Security**: Database-enforced access control
- **Context Providers**: Organization-aware state management
- **Middleware Protection**: Route-level tenant validation

### Component Architecture
- **Atomic Design**: Hierarchical component structure
- **Provider Pattern**: Context-based state management
- **Hook Pattern**: Custom hooks for business logic
- **Layout Pattern**: Consistent page structure

### Data Flow Pattern
```
UI Components → Providers → SWR Hooks → API Routes → Supabase → Database
```

### Security Architecture
- **Authentication Layer**: Supabase Auth with JWT tokens
- **Authorization Layer**: RBAC with role-based permissions
- **Data Layer**: RLS policies for multi-tenant isolation
- **Transport Layer**: HTTPS with secure headers

## Development Environment
- **Next.js 16**: React framework with App Router
- **Material-UI 7**: Component library and theming
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Playwright**: End-to-end testing framework
- **ESLint/Prettier**: Code quality and formatting