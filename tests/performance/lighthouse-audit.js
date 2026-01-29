// tests/performance/lighthouse-audit.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const pages = [
  { name: 'Leads List', url: 'http://localhost:4000/apps/crm/leads' },
  { name: 'Opportunities Kanban', url: 'http://localhost:4000/apps/crm/opportunities' },
  { name: 'Proposals List', url: 'http://localhost:4000/apps/crm/proposals' },
  { name: 'Lead Detail', url: 'http://localhost:4000/apps/crm/leads/lead_001' },
  { name: 'Opportunity Detail', url: 'http://localhost:4000/apps/crm/opportunities/opp_001' },
];

async function runLighthouse(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  // Save report
  const reportHtml = runnerResult.report;
  fs.writeFileSync(`test-results/lighthouse-${name.replace(/\s/g, '-').toLowerCase()}.html`, reportHtml);

  await chrome.kill();

  return {
    name,
    url,
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
  };
}

async function auditAll() {
  console.log('Starting Lighthouse audits...');
  console.log('Ensure dev server is running on http://localhost:4000\n');

  const results = [];

  for (const page of pages) {
    console.log(`Auditing: ${page.name}...`);
    const result = await runLighthouse(page.url, page.name);
    results.push(result);
    console.log(`  Performance: ${result.performance.toFixed(0)}`);
    console.log(`  Accessibility: ${result.accessibility.toFixed(0)}`);
    console.log(`  Best Practices: ${result.bestPractices.toFixed(0)}`);
    console.log(`  FCP: ${(result.fcp / 1000).toFixed(2)}s`);
    console.log(`  LCP: ${(result.lcp / 1000).toFixed(2)}s\n`);
  }

  // Write summary
  const summary = {
    timestamp: new Date().toISOString(),
    results,
    averages: {
      performance: results.reduce((sum, r) => sum + r.performance, 0) / results.length,
      accessibility: results.reduce((sum, r) => sum + r.accessibility, 0) / results.length,
      bestPractices: results.reduce((sum, r) => sum + r.bestPractices, 0) / results.length,
    }
  };

  fs.writeFileSync('test-results/lighthouse-summary.json', JSON.stringify(summary, null, 2));

  console.log('Audit complete! Summary:');
  console.log(`  Avg Performance: ${summary.averages.performance.toFixed(0)}`);
  console.log(`  Avg Accessibility: ${summary.averages.accessibility.toFixed(0)}`);
  console.log(`  Avg Best Practices: ${summary.averages.bestPractices.toFixed(0)}`);
}

auditAll().catch(console.error);
