# PierceDesk6 - Technology Stack & Development

## Programming Languages & Frameworks

### Primary Stack
- **JavaScript/JSX**: ES2022+ with modern syntax
- **React 19.2.4**: Latest React with concurrent features
- **Next.js 16.1.5**: Full-stack React framework with App Router
- **Node.js**: Runtime environment for development and build

### UI & Styling
- **Material-UI 7.3.4**: Component library and design system
- **Emotion**: CSS-in-JS styling solution
- **GSAP**: Animation library for interactive elements
- **Iconify**: Comprehensive icon system

## Backend & Database

### Backend Services
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Primary database with advanced features
- **Row-Level Security (RLS)**: Database-level access control
- **Real-time Subscriptions**: Live data updates

### Authentication
- **Supabase Auth**: Primary authentication system
- **JWT Tokens**: Secure session management
- **Multi-tenant Architecture**: Organization-based isolation

## Development Tools & Build System

### Build & Development
- **Turbopack**: Next.js development bundler
- **ESLint 9.39.2**: Code linting and quality
- **Prettier 3.6.2**: Code formatting
- **TypeScript 5.9.3**: Type checking (dev dependency)

### Testing Framework
- **Playwright 1.58.0**: End-to-end testing
- **Jest 30.2.0**: Unit testing framework
- **Testing Library**: React component testing utilities

### Package Management
- **npm**: Primary package manager
- **Node.js 18+**: Required runtime version

## Key Dependencies

### Data Management
- **SWR 2.3.6**: Data fetching and caching
- **Axios 1.12.2**: HTTP client
- **React Hook Form 7.65.0**: Form management
- **Yup 1.7.1**: Schema validation

### UI Components & Features
- **@mui/x-data-grid 8.14.1**: Advanced data tables
- **@mui/x-date-pickers 8.14.1**: Date/time selection
- **ECharts 6.0.0**: Data visualization
- **FullCalendar 6.1.19**: Calendar functionality
- **TipTap 3.7.2**: Rich text editor

### Utilities
- **Day.js 1.11.18**: Date manipulation
- **Lodash.merge 4.6.2**: Object utilities
- **i18next 25.6.0**: Internationalization
- **Clsx 2.1.1**: Conditional CSS classes

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (port 4000)
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # ESLint code analysis
npm run lint:next    # Next.js specific linting
npm run pretty       # Format code with Prettier
```

### Testing
```bash
npm test             # Run Playwright tests
npm run test:e2e     # End-to-end tests
npm run test:ui      # Interactive test UI
npm run test:ci      # CI/CD test execution
```

## Environment Configuration

### Required Environment Variables
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous key
- **SUPABASE_SERVICE_ROLE_KEY**: Server-side Supabase key

### Development Setup
1. **Node.js 18+**: Install required runtime
2. **Environment Files**: Configure `.env.local` and `.env.test`
3. **Dependencies**: Run `npm install`
4. **Database**: Set up Supabase project and run migrations
5. **Development**: Start with `npm run dev`

## Performance & Optimization

### Build Optimization
- **Bundle Analyzer**: Analyze bundle size
- **Turbopack**: Fast development builds
- **Memory Allocation**: 4GB heap size for builds
- **Code Splitting**: Automatic route-based splitting

### Runtime Performance
- **SWR Caching**: Intelligent data caching
- **React 19**: Concurrent rendering features
- **Image Optimization**: Next.js automatic optimization
- **Lighthouse Audits**: Performance monitoring

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers