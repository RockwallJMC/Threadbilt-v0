---
phase: '1.1'
title: 'CRM Desk - Database Schema'
type: 'design'
status: 'approved'
version: '2.0'
created: '2026-01-27'
updated: '2026-01-27'
author: 'Pierce Team'
reviewers: ['user']
dependencies: []
blocks: ['1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
related_docs:
  - '_sys_documents/execution/INDEX-crm-desk-mvp.md'
  - '_sys_documents/as-builts/database-schema-as-built.md'
estimated_hours: 8
complexity: 'medium'
impact: 'deep'
verification:
  - 'All 6 tables created via Supabase MCP'
  - 'RLS policies enabled and tested on all tables'
  - 'Foreign key constraints verified'
  - 'Indexes created for performance'
---

# Phase 1.1: CRM Desk - Database Schema

## Overview

This phase creates the complete database schema for the CRM Desk MVP, establishing the foundation for managing customer relationships from lead capture through closed deals. The schema includes 6 new tables that integrate with existing \`accounts\` and \`user_profiles\` tables.

**Key Deliverables:**
- 6 new tables with multi-tenant RLS (contacts, leads, opportunities, proposals, proposal_line_items, activities)
- Complete CRM lifecycle support (lead → opportunity → proposal → close)
- Activities table as Digital Thread foundation
- Polymorphic relationships for flexible entity linking

**Business Value:**
- Enables complete sales pipeline management
- Foundation for revenue tracking and forecasting
- Digital Thread begins capturing customer interaction history

## Design Decisions

[Complete design decisions from brainstorming - see sections above]

## Tables Summary

1. **contacts** - People at companies (15 columns)
2. **leads** - Unqualified prospects (19 columns)
3. **opportunities** - Sales pipeline deals (18 columns)
4. **proposals** - Formal quotes (16 columns)
5. **proposal_line_items** - Line items in proposals (10 columns)
6. **activities** - CRM interaction timeline (14 columns, polymorphic)

## Complete SQL Schema

See full document backup for complete SQL CREATE TABLE statements for all 6 tables with:
- Column definitions
- Constraints and CHECKs
- Indexes for performance  
- RLS policies
- Foreign keys

## Related Documentation

- [INDEX: CRM Desk MVP](../execution/INDEX-crm-desk-mvp.md)
- [Database Schema As-Built](../as-builts/database-schema-as-built.md)
- [PierceDesk Transformation Plan](../roadmap/piercedesk-transformation-plan.md)

---

**Status**: ✅ Approved
**Ready for Implementation**: Yes
**Next Step**: Execute via supabase-database-architect agent
