# Template Examples

This directory contains example documents showing proper use of the documentation templates defined in CLAUDE.md.

## Purpose

These examples serve as reference implementations to help you understand:
- Expected document structure and format
- Level of detail appropriate for each section
- How to use YAML frontmatter
- Proper code references with file:line format
- Verification evidence formatting
- Cross-document references

## Example Documents

### [example-INDEX.md](example-INDEX.md)
**Template:** `INDEX-template.md`

Shows a complete INDEX document for a simple feature (button color update). Demonstrates:
- YAML frontmatter with all required fields
- Phase breakdown with status badges
- Technical decisions log
- Verification checklist with specific criteria
- Timeline tracking
- Change log

**Use this when:** Starting any feature to understand INDEX structure

### [example-phase-design.md](example-phase-design.md)
**Template:** `phase-design-template.md`

Shows a complete phase design document. Demonstrates:
- Design decision structure (Options → Decision → Rationale)
- Technical approach documentation
- Component breakdown
- Risks and mitigation strategies
- Phase-specific verification plan (references INDEX for overall verification)

**Use this when:** Planning a phase to understand design documentation structure

### [example-phase-execution.md](example-phase-execution.md)
**Template:** `phase-execution-template.md`

Shows a complete phase execution document. Demonstrates:
- Implementation log with dated entries
- Code references with file:line numbers
- Verification evidence with actual command output
- Challenge/solution documentation
- Before/after screenshots

**Use this when:** During implementation to understand execution documentation structure

## Key Patterns to Notice

### 1. YAML Frontmatter
All documents use consistent YAML frontmatter for metadata:
```yaml
---
status: "planned" | "in-progress" | "complete" | "blocked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

### 2. Code References
Always use file:line or file:line-range format:
```markdown
[`src/theme/index.js:15`](../../src/theme/index.js#L15)
[`src/component.tsx:42-51`](../../src/component.tsx#L42-L51)
```

### 3. Verification Evidence
Include actual command output, not just claims:
```bash
$ npm run build
 ✓ Compiled successfully
Exit code: 0
```

### 4. Cross-Document References
Link related documents:
```markdown
- Related to INDEX: [_sys_documents/execution/INDEX-feature.md](INDEX-feature.md)
- Related to Design: [phase1.1-design.md](../design/phase1.1-design.md)
```

### 5. INDEX as Single Source of Truth
Phase documents reference INDEX for:
- Overall verification checklist
- Major technical decisions
- Current blockers
- Feature-level status

Phase documents focus on phase-specific details.

## When to Use Full vs Abbreviated Workflow

**Full Workflow (like these examples):**
- Deep impact features
- Multiple phases with dependencies
- Architectural decisions required
- Database/API changes

**Abbreviated Workflow:**
- Shallow impact (< 50 lines, ≤ 3 files)
- No architecture/DB/API changes
- Straightforward implementation

See CLAUDE.md "Abbreviated Workflow" section for details.

## Real-World Example

The **test-rectangle feature** in `_sys_documents/execution/INDEX-test-rectangle.md` is a real example that was created to validate the documentation framework. It shows:
- How the templates work in practice
- Documentation for a very simple feature (13-line code change)
- Full workflow applied to shallow-impact feature (for framework testing)

**Note:** Test-rectangle used full workflow to validate templates, but would normally qualify for abbreviated workflow.

## Tips for Using These Examples

1. **Copy structure, not content** - Use these to understand format, but write content specific to your feature
2. **Match detail level** - Notice the level of detail in each section and aim for similar depth
3. **Follow verification patterns** - Always include command output with exit codes
4. **Reference INDEX** - Phase docs should reference INDEX for shared tracking content
5. **Update as you go** - Don't wait until end to document, update throughout implementation

## Testing Note

These examples are based on a fictional "button color update" feature. The test-rectangle feature in `_sys_documents/execution/` is a real example that was actually implemented and verified.

## Questions?

See [CLAUDE.md Documentation Standards section](../../CLAUDE.md#documentation-standards-mandatory) for complete framework documentation.
