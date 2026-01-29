# Performance Benchmarks

## Overview

Performance benchmarks for CRM Desk MVP using Google Lighthouse. These benchmarks establish baseline metrics for future comparison and optimization efforts.

## Test Configuration

- **Tool**: Google Lighthouse
- **Categories**: Performance, Accessibility, Best Practices
- **Environment**: Local development server (http://localhost:4000)
- **Data**: Mock data from Phases 1.3-1.6
- **Browser**: Headless Chrome

## Pages Tested

1. **Leads List** - `/apps/crm/leads`
2. **Opportunities Kanban** - `/apps/crm/opportunities`
3. **Proposals List** - `/apps/crm/proposals`
4. **Lead Detail** - `/apps/crm/leads/lead_001`
5. **Opportunity Detail** - `/apps/crm/opportunities/opp_001`

## How to Run

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run Lighthouse audit
node tests/performance/lighthouse-audit.js
```

Results will be saved to:
- `test-results/lighthouse-summary.json` - Summary with averages
- `test-results/lighthouse-*.html` - Individual page reports

## Baseline Results

> **Note**: Baseline measurements to be captured after dev server is running.
> Run the audit script to generate initial benchmarks.

### Metrics Tracked

| Page | Performance | Accessibility | Best Practices | FCP | LCP | TBT |
|------|-------------|---------------|----------------|-----|-----|-----|
| Leads List | - | - | - | - | - | - |
| Opportunities Kanban | - | - | - | - | - | - |
| Proposals List | - | - | - | - | - | - |
| Lead Detail | - | - | - | - | - | - |
| Opportunity Detail | - | - | - | - | - | - |

**Averages:**
- Performance: -
- Accessibility: -
- Best Practices: -

## Performance Targets

### Current Targets (Development)

- **Performance Score**: ≥ 90
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TBT (Total Blocking Time)**: < 300ms
- **Accessibility Score**: ≥ 95
- **Best Practices Score**: ≥ 90

### Production Targets

When deployed to production with Supabase:
- **Performance Score**: ≥ 85 (accounting for network latency)
- **FCP**: < 2.0s
- **LCP**: < 3.0s
- **TBT**: < 400ms

## Optimization Opportunities

### Known Factors Affecting Performance

1. **Mock Data**: Current tests use client-side mock data with no network latency
2. **Authentication**: Phase 1.2 incomplete - auth overhead not measured
3. **Development Mode**: Next.js running in dev mode (unoptimized)
4. **Bundle Size**: No production build optimization applied

### Future Improvements

After Phase 1.2 (Auth & Multi-Tenancy):
- [ ] Re-run benchmarks with authenticated sessions
- [ ] Measure performance with real Supabase queries
- [ ] Test with production build (`npm run build && npm start`)
- [ ] Add network throttling to simulate real-world conditions
- [ ] Test with varying data volumes

## Interpreting Results

### Lighthouse Score Ranges

- **90-100**: Good - No action needed
- **50-89**: Needs Improvement - Review recommendations
- **0-49**: Poor - Requires attention

### Key Metrics Explained

- **FCP (First Contentful Paint)**: Time until first text/image appears
- **LCP (Largest Contentful Paint)**: Time until largest element is visible
- **TBT (Total Blocking Time)**: Time main thread is blocked from responding
- **SI (Speed Index)**: How quickly content is visually displayed
- **TTI (Time to Interactive)**: Time until page is fully interactive
- **CLS (Cumulative Layout Shift)**: Visual stability score

## Regression Testing

Run audits before each release to catch performance regressions:

```bash
# Before making changes
node tests/performance/lighthouse-audit.js
cp test-results/lighthouse-summary.json baseline-before.json

# After making changes
node tests/performance/lighthouse-audit.js
cp test-results/lighthouse-summary.json baseline-after.json

# Compare results
node -e "
const before = require('./baseline-before.json');
const after = require('./baseline-after.json');
console.log('Performance change:',
  after.averages.performance - before.averages.performance);
"
```

## Notes

- All tests run on localhost dev server with mock data
- Results will vary based on hardware and system load
- Production performance will differ due to Supabase latency
- Lighthouse reports available in HTML format for detailed analysis
- Accessibility and best practices scores remain consistent across environments

## Related Documentation

- [Mobile Responsiveness Audit](./MOBILE-RESPONSIVENESS-AUDIT.md)
- [Security Audit](./SECURITY-AUDIT.md)
- [Testing Status](../tests/TESTING-STATUS.md)
