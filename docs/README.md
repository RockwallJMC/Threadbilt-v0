# PierceDesk Documentation

Welcome to the PierceDesk documentation. This documentation covers the complete unified SaaS platform for physical security integrators.

## Documentation Structure

This documentation is organized into four main sections:

### 📐 [Architecture](architecture/)

Technical architecture and system design documentation:

- [**DESK-ARCHITECTURE.md**](architecture/DESK-ARCHITECTURE.md) - The 8-desk system overview
- **DATABASE-ARCHITECTURE.md** - Multi-tenant architecture, RLS, schema design
- **AUTHENTICATION-FLOW.md** - Supabase authentication and sessions
- **API-DESIGN.md** - REST API patterns and SWR hooks
- **DRAWER-ARCHITECTURE.md** - Contextual drawer system (future)
- **SECURITY-MODEL.md** - RLS, RBAC, encryption standards

### 🎯 [Features](features/)

Feature documentation for each operational desk:

- **CRM-DESK.md** - Leads, Opportunities, Proposals, Accounts, Contacts
- **HRM-DESK.md** - Employees, Teams, Skills, Time & Attendance
- **PROJECTS-DESK.md** - Project management, Gantt, Kanban, AIA Billing
- **SERVICE-DESK.md** - Service tickets, SLA management, Warranties
- **DISPATCH-DESK.md** - Scheduling, routing, field operations
- **ASSETS-DESK.md** - Vehicles, tools, GPS tracking
- **INVENTORY-DESK.md** - Warehouse management, materials tracking
- **BUSINESS-DESK.md** - Invoicing, P&L, QuickBooks integration

### 📚 [Guides](guides/)
### 👥 [User Journeys](user-journeys/)

User journey documentation for key roles and workflows:

- [**Sales Manager - Phase 1 CRM**](user-journeys/sales-manager-phase1-crm.md) - Daily and weekly workflows for sales management
- [**Sales Account Manager - Phase 1 CRM**](user-journeys/sales-account-manager-phase1-crm.md) - Lead-to-close sales process workflows
- **Service Manager - Service Desk** - Service ticket and SLA management (planned)
- **Project Manager - Projects Desk** - Project lifecycle management (planned)


How-to guides and best practices:

- [**DOCUMENTATION-GUIDE.md**](guides/DOCUMENTATION-GUIDE.md) - How to use the documentation framework
- **GETTING-STARTED.md** - New developer onboarding
- **DEVELOPMENT-SETUP.md** - Local development environment setup
- **TESTING-GUIDE.md** - Testing practices and frameworks
- **DEPLOYMENT-GUIDE.md** - Deployment procedures
- **CONTRIBUTING.md** - How to contribute to PierceDesk
- **TROUBLESHOOTING.md** - Common issues and solutions

### 🔌 [API](api/)

API and integration documentation:

- **REST-API.md** - Complete REST API reference
- **SUPABASE-SCHEMA.md** - Database schema documentation
- **SWR-HOOKS.md** - Data fetching patterns and hooks
- **WEBSOCKET-EVENTS.md** - Real-time events (future)

## Quick Links

### For New Developers
1. Start with [Getting Started Guide](guides/GETTING-STARTED.md)
2. Set up your [Development Environment](guides/DEVELOPMENT-SETUP.md)
3. Read [DESK-ARCHITECTURE](architecture/DESK-ARCHITECTURE.md) to understand the system
4. Review [Documentation Guide](guides/DOCUMENTATION-GUIDE.md) for contribution workflow

### For Feature Development
1. Review [Documentation Guide](guides/DOCUMENTATION-GUIDE.md) for the complete workflow
2. Check relevant [Feature Documentation](features/) for the desk you're working on
1. Review relevant [User Journeys](user-journeys/) to understand user workflows
3. Reference [API Documentation](api/) for integration patterns
4. Follow [Testing Guide](guides/TESTING-GUIDE.md) for test requirements

### For Architecture Decisions
1. Review existing [Architecture Documentation](architecture/)
2. Reference the transformation plan in `_sys_documents/roadmap/`
3. Check [DATABASE-ARCHITECTURE](architecture/DATABASE-ARCHITECTURE.md) for data model
4. Follow [API-DESIGN](architecture/API-DESIGN.md) patterns

## Documentation Principles

### Living Documentation
All documentation in this folder is **user-facing** and should be:
- Clear and jargon-free
- Up-to-date with current implementation
- Includes examples and code snippets
- Cross-referenced with related docs

### Internal vs. User-Facing
- **User-facing docs** (this folder): For developers, users, and stakeholders
- **Internal docs** (`_sys_documents/`): Planning, tracking, as-builts, execution logs

### Versioning
Documentation follows the codebase version:
- Updated with each feature release
- Breaking changes highlighted
- Deprecation notices included

## Contributing to Documentation

See [CONTRIBUTING.md](guides/CONTRIBUTING.md) and [DOCUMENTATION-GUIDE.md](guides/DOCUMENTATION-GUIDE.md) for:
- How to add new documentation
- Documentation standards and style guide
- Review process
- Templates and examples

## Documentation Status

| Section | Status | Last Updated |
|---------|--------|--------------|
| Architecture | 🚧 In Progress | 2026-01-27 |
| Features | ⏳ Planned | - |
| User Journeys | ✅ Phase 1 CRM Complete | 2026-01-27 |
| Guides | 🚧 In Progress | 2026-01-27 |
| API | ⏳ Planned | - |

### Legend
- ✅ Complete and current
- 🚧 In progress
- ⏳ Planned
- 📝 Needs update

## Getting Help

- **Documentation issues**: Open an issue on GitHub with label `documentation`
- **Feature questions**: Check relevant [Feature Documentation](features/)
- **Technical problems**: See [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md)
- **Architecture questions**: Review [Architecture](architecture/) docs or ask the team

## External Resources

- **Aurora UI Template**: https://aurora.themewagon.com/documentation/introduction
- **Material-UI Documentation**: https://mui.com/material-ui/getting-started/
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

**Last updated**: 2026-01-27
**Documentation version**: 1.0.0
**PierceDesk version**: MVP Development
