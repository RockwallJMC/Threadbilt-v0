# RLS + Auth Patterns

- Enforce `user_id = auth.uid()` on user-scoped tables.
- Use org-scoped policies when org context is required (see verification report).
- Validate access in API routes before executing mutations.
- Keep `created_by` and `owner_id` fields aligned with auth users.
