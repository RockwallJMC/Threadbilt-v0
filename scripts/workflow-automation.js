#!/usr/bin/env node

/**
 * Workflow Automation Helpers
 * 
 * Automates common setup tasks for AI coding agents:
 * - GitHub issue creation
 * - Feature branch setup
 * - INDEX file creation
 * - Verification command runners
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkflowAutomation {
  constructor() {
    this.repoRoot = process.cwd();
    this.templatesDir = path.join(this.repoRoot, '.claude', 'templates');
    this.sysDocsDir = path.join(this.repoRoot, '_sys_documents');
  }

  /**
   * Create a new feature with automated setup
   * @param {string} featureName - Name of the feature (kebab-case)
   * @param {string} description - Brief description
   * @param {boolean} fullWorkflow - Use full workflow (default: auto-detect)
   */
  async createFeature(featureName, description, fullWorkflow = null) {
    console.log(`🚀 Creating feature: ${featureName}`);
    
    try {
      // 1. Create feature branch
      const branchName = `feature/desk-${featureName}`;
      console.log(`📝 Creating branch: ${branchName}`);
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

      // 2. Create INDEX file
      const indexPath = await this.createIndexFile(featureName, description, fullWorkflow);
      console.log(`📄 Created INDEX: ${indexPath}`);

      // 3. Create GitHub issue
      const issueNumber = await this.createGitHubIssue(featureName, description, indexPath);
      console.log(`🎫 Created GitHub issue: #${issueNumber}`);

      // 4. Update INDEX with issue number
      await this.updateIndexWithIssue(indexPath, issueNumber, branchName);

      // 5. Commit and push
      execSync(`git add ${indexPath}`, { stdio: 'inherit' });
      execSync(`git commit -m "Add feature INDEX for ${featureName}\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"`, { stdio: 'inherit' });
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

      // 6. Post kickoff comment
      execSync(`gh issue comment ${issueNumber} --body "🚀 Feature branch created and INDEX updated. Starting implementation..."`, { stdio: 'inherit' });

      console.log(`✅ Feature setup complete!`);
      console.log(`   Branch: ${branchName}`);
      console.log(`   Issue: #${issueNumber}`);
      console.log(`   INDEX: ${indexPath}`);
      
      return {
        branchName,
        issueNumber,
        indexPath
      };
    } catch (error) {
      console.error(`❌ Error creating feature: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create INDEX file from template
   */
  async createIndexFile(featureName, description, fullWorkflow) {
    const templatePath = path.join(this.templatesDir, 'INDEX-template.md');
    const indexPath = path.join(this.sysDocsDir, 'execution', `INDEX-${featureName}.md`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`INDEX template not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace template variables
    const now = new Date().toISOString().split('T')[0];
    template = template.replace(/\{FEATURE_NAME\}/g, featureName);
    template = template.replace(/\{DESCRIPTION\}/g, description);
    template = template.replace(/\{DATE\}/g, now);
    template = template.replace(/\{WORKFLOW_TYPE\}/g, fullWorkflow ? 'full' : 'abbreviated');

    // Ensure directory exists
    const indexDir = path.dirname(indexPath);
    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }

    fs.writeFileSync(indexPath, template);
    return indexPath;
  }

  /**
   * Create GitHub issue
   */
  async createGitHubIssue(featureName, description, indexPath) {
    const title = `Feature: ${featureName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')}`;

    const body = `## Overview
${description}

## Documentation
- INDEX: [${path.relative(this.repoRoot, indexPath)}](${path.relative(this.repoRoot, indexPath)})
- Design docs: Listed in INDEX

## Phases
- [ ] Phase 1.1: Initial Implementation
- [ ] Phase 1.2: Testing & Verification

## Branch
\`feature/desk-${featureName}\`

---
🤖 Created by Claude Code Workflow Automation`;

    try {
      const result = execSync(`gh issue create --title "${title}" --body "${body}"`, { 
        encoding: 'utf8' 
      });
      
      // Extract issue number from URL
      const match = result.match(/\/issues\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    } catch (error) {
      console.error('Failed to create GitHub issue:', error.message);
      throw error;
    }
  }

  /**
   * Update INDEX file with GitHub issue and branch info
   */
  async updateIndexWithIssue(indexPath, issueNumber, branchName) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add frontmatter fields
    content = content.replace(
      /^---\n([\s\S]*?)\n---/,
      (match, frontmatter) => {
        return `---\n${frontmatter}github_issue: ${issueNumber}\nfeature_branch: "${branchName}"\n---`;
      }
    );

    fs.writeFileSync(indexPath, content);
  }

  /**
   * Run verification commands and capture output
   */
  async runVerification() {
    console.log('🔍 Running verification commands...');
    
    const commands = [
      { name: 'Lint', cmd: 'npm run lint' },
      { name: 'Build', cmd: 'npm run build' },
      { name: 'Test', cmd: 'npm test' }
    ];

    const results = {};

    for (const { name, cmd } of commands) {
      console.log(`\n📋 Running ${name}...`);
      try {
        const output = execSync(cmd, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        results[name] = { success: true, output };
        console.log(`✅ ${name} passed`);
      } catch (error) {
        results[name] = { success: false, output: error.stdout || error.message };
        console.log(`❌ ${name} failed`);
      }
    }

    return results;
  }

  /**
   * Generate verification report
   */
  generateVerificationReport(results) {
    let report = '# Verification Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    for (const [name, result] of Object.entries(results)) {
      report += `## ${name}\n\n`;
      report += `Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
      report += '```\n';
      report += result.output;
      report += '\n```\n\n';
    }

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const automation = new WorkflowAutomation();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create-feature':
      const featureName = process.argv[3];
      const description = process.argv[4] || 'New feature implementation';
      if (!featureName) {
        console.error('Usage: node workflow-automation.js create-feature <feature-name> [description]');
        process.exit(1);
      }
      automation.createFeature(featureName, description);
      break;
      
    case 'verify':
      automation.runVerification().then(results => {
        const report = automation.generateVerificationReport(results);
        console.log('\n' + report);
      });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  create-feature <name> [description] - Create new feature with full setup');
      console.log('  verify                              - Run verification commands');
  }
}

module.exports = WorkflowAutomation;

