# Debugging Next.js with Claude Code

This guide explains how to effectively use Claude Code to debug Next.js runtime issues.

## Quick Start

### Method 1: Direct Console Sharing (Immediate)

**Best for:** Quick bug fixes, immediate issues

1. Run dev server in terminal:
   ```bash
   npm run dev
   ```

2. When error occurs, copy the **complete** terminal output including:
   - Full error message
   - Stack trace
   - Line numbers
   - Any warnings before the error

3. Share with Claude Code in chat:
   ```
   I'm seeing this error in Next.js:

   [paste full error output]

   Can you help debug this?
   ```

4. Claude will follow systematic debugging process:
   - Phase 1: Analyze root cause from error messages
   - Phase 2: Compare against working patterns
   - Phase 3: Form hypothesis and minimal test
   - Phase 4: Implement fix with verification

### Method 2: Enhanced Logging (Recommended for Deep Debugging)

**Best for:** Complex issues, intermittent bugs, multi-component problems

1. Start dev server with logging:
   ```bash
   ./scripts/debug-with-logs.sh
   ```

2. Reproduce the issue

3. Share the log file with Claude:
   ```
   Claude, please analyze the debug logs at logs/nextjs-debug-[timestamp].log
   ```

4. Claude can then:
   - Read the complete log file
   - Trace through multi-component issues
   - Identify patterns in intermittent failures
   - See the full context of errors

### Method 3: VSCode Debugger Integration

**Best for:** Deep investigation, breakpoint debugging

The repository includes VSCode launch configurations at [.vscode/launch.json](/.vscode/launch.json):

1. **Debug server-side**:
   - Use "Next.js: debug server-side" configuration
   - Set breakpoints in server components, API routes
   - Run with F5

2. **Debug client-side**:
   - Use "Next.js: debug client-side" configuration
   - Opens Chrome DevTools
   - Debug browser JavaScript

3. **Debug full stack**:
   - Use "Next.js: debug full stack" configuration
   - Debugs both server and client simultaneously

**To share debugger findings with Claude:**

1. Set breakpoint at error location
2. Run debugger
3. Capture variable values, call stack
4. Share with Claude:
   ```
   At line X, I see these variable values:
   - variableA: [value]
   - variableB: [value]

   Call stack shows:
   [paste call stack]

   What's the root cause?
   ```

## Debugging Workflow with Claude

### Phase 1: Root Cause Investigation

Claude will systematically gather evidence:

1. **Read error messages carefully**
   - Complete stack traces
   - Line numbers and file paths
   - Error codes

2. **Reproduce consistently**
   - Exact steps to trigger
   - Frequency (always/intermittent)

3. **Check recent changes**
   ```bash
   # Claude may ask you to run:
   git diff
   git log --oneline -10
   ```

4. **Gather evidence in multi-component systems**
   - Add diagnostic logging
   - Trace data flow
   - Check each layer

### Phase 2: Pattern Analysis

Claude will:

1. Search for working examples in codebase
2. Compare against reference implementations (Aurora templates)
3. Identify differences
4. Understand dependencies

### Phase 3: Hypothesis and Testing

Claude will:

1. Form specific hypothesis about root cause
2. Propose minimal test to verify
3. Implement ONE change at a time
4. Verify before continuing

### Phase 4: Implementation

Claude will:

1. Create failing test case (TDD)
2. Implement single fix addressing root cause
3. Verify fix works
4. Run full verification (build, lint, tests)

## Common Debugging Scenarios

### Scenario 1: Build Error

**Error appears during `npm run build`**

Share with Claude:
```
Build failing with this error:

[paste complete build output from start to error]
```

Claude will:
1. Analyze build error for root cause
2. Check if it's a type error, import issue, or config problem
3. Trace back to source
4. Propose fix with verification

### Scenario 2: Runtime Error in Browser

**Error in browser console**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Copy complete error including stack trace
4. Share with Claude:
   ```
   Browser console shows:

   [paste error]

   Stack trace:
   [paste stack trace]
   ```

### Scenario 3: API Route Error

**Error in API route or server action**

1. Check terminal where dev server runs
2. Copy server error output
3. Share with Claude:
   ```
   API route /api/users failing with:

   [paste server error]
   ```

### Scenario 4: Hydration Mismatch

**"Text content does not match server-rendered HTML"**

This is a common Next.js issue. Share complete error:
```
Hydration error:

[paste full hydration error including component tree]
```

Claude will:
1. Identify which component has mismatch
2. Check for client-only code in server components
3. Verify data consistency between server/client
4. Propose fix (often useEffect or 'use client' directive)

### Scenario 5: Performance Issues

**App is slow or timing out**

1. Enable performance logging:
   ```bash
   NODE_ENV=development npm run dev
   ```

2. Open browser DevTools → Performance tab
3. Record the slow interaction
4. Share findings with Claude:
   ```
   Performance trace shows:
   - Component X taking 500ms to render
   - Multiple re-renders of Y

   Can you analyze?
   ```

## Best Practices

### DO:
- ✅ Share complete error messages (don't truncate)
- ✅ Include stack traces
- ✅ Mention what you changed recently
- ✅ Run verification commands Claude suggests
- ✅ Follow systematic debugging process
- ✅ Create test cases before fixing

### DON'T:
- ❌ Skip error details ("it just doesn't work")
- ❌ Try random fixes without Claude's analysis
- ✅ Make multiple changes at once
- ❌ Skip verification steps
- ❌ Claim "fixed" without running tests

## Advanced: Multi-Component Debugging

For complex issues spanning multiple layers:

1. **Add diagnostic logging** at each boundary:
   ```javascript
   // In component
   console.log('[ComponentName] Props:', props);
   console.log('[ComponentName] State:', state);

   // In API route
   console.log('[API] Request:', req.body);
   console.log('[API] Response:', response);
   ```

2. **Run and capture logs**:
   ```bash
   ./scripts/debug-with-logs.sh
   ```

3. **Share log file path with Claude**

4. Claude will trace through layers to find where it breaks

## Integration with Skills

Claude Code will automatically invoke debugging skills:

- **systematic-debugging**: For all bug investigation
- **TDD**: To create failing test before fix
- **VERIFY-BEFORE-COMPLETE**: To verify fix works
- **software-architecture**: To ensure fix follows patterns

## Emergency Debugging

**Under time pressure? Still follow the process.**

Systematic debugging is FASTER than guess-and-check:
- Random fixes: 2-3 hours of thrashing
- Systematic: 15-30 minutes
- Success rate: 95% vs 40%

## Getting Help

If systematic process reveals no clear root cause:

1. Document what you investigated
2. Share with Claude:
   ```
   Completed systematic debugging:
   - Checked: [list what you checked]
   - Found: [findings]
   - Still unclear: [what's unclear]

   What should we investigate next?
   ```

3. Claude may:
   - Suggest additional evidence gathering
   - Question architectural assumptions
   - Recommend involving domain expert

## Log File Management

Logs are stored in `logs/` directory:

```bash
# View latest log
ls -lt logs/ | head -1

# Search logs for specific error
grep -r "ERROR_TEXT" logs/

# Clean old logs (keep last 10)
ls -t logs/*.log | tail -n +11 | xargs rm
```

## Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Development workflows
- [DOCUMENTATION-GUIDE.md](./DOCUMENTATION-GUIDE.md) - Documentation standards
- `.claude/skills/systematic-debugging/` - Debugging skill details

---

**Remember:** Claude Code can't see your screen or debugger in real-time, but can analyze any output you share. The systematic debugging process works with any level of information sharing.
