# Layout Patterns

## Page width

- Use `Container` for page-level width control.
- Example:
  - `Container maxWidth={false} sx={{ maxWidth: 520, px: { xs: 0 } }}`

## Card layout

- Wrap major form sections in `Paper background={1}` with `p: { xs: 3, md: 5 }` and `borderRadius: 6`.

## Grid patterns

- Two-column: `size={{ xs: 12, md: 6 }}`
- 8/4 split: `size={{ xs: 12, md: 8 }}` + `size={{ xs: 12, md: 4 }}`
- Address block:
  - Street: `12`
  - City: `6`
  - State: `3`
  - ZIP: `3`

## Stack usage

- Use `Stack` for vertical rhythm, not column sizing.
- Example: `Stack spacing={3}` for card content spacing.

## Anti-patterns

- Avoid `sx={{ flex: 2 }}` for column widths; use Grid sizes.
- Avoid hardcoded pixel widths for inputs.
