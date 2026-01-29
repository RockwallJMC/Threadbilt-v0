# AI Agent Capability Matrix

**Quick reference for agent selection and coordination**

## Agent Overview

| Agent | Primary Focus | Complexity | Parallel Safe | MCP Tools |
|-------|---------------|------------|---------------|-----------|
| `Explore` | Research & Analysis | Low-Medium | ✅ Yes | ❌ No |
| `react-mui-frontend-engineer` | UI Components | Medium-High | ✅ Yes | ❌ No |
| `wiring-agent` | API Integration | Medium | ✅ Yes | ❌ No |
| `supabase-database-architect` | Database Operations | High | ⚠️ Careful | ✅ Yes |
| `playwright-tester` | E2E Testing | Medium | ✅ Yes | ❌ No |
| `documentation-expert` | Documentation | Low | ✅ Yes | ❌ No |
| `superpowers:code-reviewer` | Code Review | Medium | ✅ Yes | ❌ No |

## Detailed Agent Capabilities

### Explore Agent
**Purpose**: Codebase research and pattern discovery

**Capabilities**:
- Find existing patterns and components
- Analyze code architecture
- Discover implementation examples
- Research best practices

**When to Use**:
- Need to understand existing codebase
- Looking for similar implementations
- Researching before building new features
- Understanding system architecture

**Thoroughness Levels**:
- `quick`: Basic search, 5-10 minutes
- `medium`: Comprehensive analysis, 15-20 minutes
- `very thorough`: Deep dive, 30+ minutes

**Example Usage**:
```javascript
Task(Explore, "Find authentication patterns in the codebase", thoroughness: "medium")
Task(Explore, "Research Aurora dashboard components", thoroughness: "quick")
```

### react-mui-frontend-engineer
**Purpose**: UI component development with Material-UI and Aurora patterns

**Capabilities**:
- Build React components with MUI v7
- Duplicate and modify Aurora components
- Implement responsive designs
- Handle form validation and state management
- Apply theme and styling

**When to Use**:
- Creating new UI components
- Modifying existing interfaces
- Implementing responsive layouts
- Building forms and interactive elements

**Key Patterns**:
- Aurora-first approach (copy-then-modify)
- MUI v7 Grid with `size` prop
- Theme-based styling
- Accessibility compliance

**Example Usage**:
```javascript
Task(react-mui-frontend-engineer, "Build user profile settings page using Aurora patterns")
Task(react-mui-frontend-engineer, "Create responsive dashboard layout with MUI Grid")
```

### wiring-agent
**Purpose**: API integration and data flow management

**Capabilities**:
- Implement SWR data fetching hooks
- Handle authentication flows
- Manage routing and navigation
- Connect UI components to APIs
- Handle error states and loading

**When to Use**:
- Connecting components to APIs
- Implementing data fetching logic
- Setting up authentication flows
- Managing application state
- Handling API error scenarios

**Key Technologies**:
- SWR for data fetching
- Next.js App Router
- Supabase client integration
- React Hook Form

**Example Usage**:
```javascript
Task(wiring-agent, "Implement user profile API integration with SWR")
Task(wiring-agent, "Set up authentication flow with Supabase")
```

### supabase-database-architect
**Purpose**: Database schema design and management (Cloud-based)

**Capabilities**:
- Design database schemas
- Create and modify tables
- Implement Row Level Security (RLS)
- Write SQL queries and migrations
- Manage database relationships

**When to Use**:
- Creating new database tables
- Modifying existing schemas
- Implementing security policies
- Writing complex queries
- Database performance optimization

**Critical Notes**:
- ✅ ALWAYS uses Supabase MCP tools
- ❌ NEVER attempts local database connections
- ⚠️ Be careful with parallel execution (schema conflicts)
- 🔒 Multi-tenant with RLS by default

**Example Usage**:
```javascript
Task(supabase-database-architect, "Create user_profiles table with RLS policies")
Task(supabase-database-architect, "Add organization_id column to existing tables")
```

### playwright-tester
**Purpose**: End-to-end test creation and maintenance

**Capabilities**:
- Write E2E tests with Playwright
- Create page object models
- Handle authentication in tests
- Test responsive designs
- Debug failing tests

**When to Use**:
- Creating tests for new features
- Testing user workflows
- Validating responsive behavior
- Debugging test failures
- Maintaining existing test suites

**Key Patterns**:
- Page Object Model
- Data-testid selectors
- Authentication helpers
- Screenshot comparisons

**Example Usage**:
```javascript
Task(playwright-tester, "Create E2E tests for user registration flow")
Task(playwright-tester, "Add tests for responsive dashboard layout")
```

### documentation-expert
**Purpose**: Technical documentation creation and maintenance

**Capabilities**:
- Write clear technical documentation
- Create API documentation
- Update README files
- Generate code comments
- Maintain changelog

**When to Use**:
- Documenting new features
- Updating API documentation
- Creating user guides
- Maintaining project documentation
- Writing code comments

**Example Usage**:
```javascript
Task(documentation-expert, "Document the new user profile API endpoints")
Task(documentation-expert, "Update README with new authentication flow")
```

### superpowers:code-reviewer
**Purpose**: Code quality review and feedback

**Capabilities**:
- Review code for quality and standards
- Check security best practices
- Validate architectural patterns
- Suggest improvements
- Verify test coverage

**When to Use**:
- After major feature completion
- Before creating pull requests
- When code quality concerns arise
- For architectural validation
- Security review requirements

**Example Usage**:
```javascript
Task(superpowers:code-reviewer, "Review authentication implementation for security")
Task(superpowers:code-reviewer, "Validate new dashboard architecture")
```

## Coordination Patterns

### Sequential Dependencies
```javascript
// When output of one agent feeds into another
Task(Explore, "Find existing user management patterns")
// Wait for results, then:
Task(react-mui-frontend-engineer, "Build user management UI based on patterns found")
```

### Parallel Independent Work
```javascript
// When tasks can run simultaneously
Task(react-mui-frontend-engineer, "Build dashboard UI");
Task(wiring-agent, "Implement dashboard API integration");
Task(playwright-tester, "Create dashboard E2E tests");
```

### Database-First Pattern
```javascript
// Database changes often need to complete first
Task(supabase-database-architect, "Create user_profiles table")
// Then parallel:
Task(wiring-agent, "Create user profile API hooks");
Task(react-mui-frontend-engineer, "Build profile UI");
```

## Selection Guidelines

1. **Start with Explore** when you need to understand existing code
2. **Database first** for features requiring schema changes
3. **Parallel UI + API** for most feature development
4. **Tests alongside** implementation, not after
5. **Documentation last** after implementation is complete
6. **Code review** before major PRs or releases

## Common Anti-Patterns

❌ **Don't**: Use multiple database agents in parallel
❌ **Don't**: Skip exploration when building on existing patterns
❌ **Don't**: Write tests after implementation (use TDD)
❌ **Don't**: Create documentation before implementation
❌ **Don't**: Use agents for work you can do directly (simple questions)

✅ **Do**: Research first, implement in parallel, verify with evidence
✅ **Do**: Use database agent with MCP tools only
✅ **Do**: Follow TDD with test agent
✅ **Do**: Coordinate through GitHub issues for complex features

