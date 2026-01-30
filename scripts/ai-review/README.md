# AI Review Chain

This workflow gates on Amazon Q's check, optionally waits for comment-based reviews from other bots, then approves and merges if enabled.

## Overview

The AI review chain automates code reviews by coordinating multiple AI reviewers in sequence, ensuring thorough quality checks before merge.

This workflow will automatically approve and merge PRs when all AI reviewers have completed their checks successfully.

## Required Secrets

Create the following repository secrets:

- AUTO_MERGE_ENABLED (set to "true" to allow auto-merge)
- MERGE_METHOD (optional: merge, squash, rebase; default: squash)

## Required Variables

Set these repository variables (Settings → Secrets and variables → Actions → Variables):

- Q_CHECK_NAME (default in workflow: "Amazon Q Developer")
- OPTIONAL_REVIEWERS (comma-separated GitHub logins to wait for comments, e.g. "gemini-code-assist[bot],chatgpt-codex-connector[bot],claude[bot]")
- REVIEW_WAIT_TIMEOUT_MINUTES (default: 30)
- REVIEW_POLL_INTERVAL_SECONDS (default: 20)

## Permissions

The workflow requests:

- contents: write (merge)
- pull-requests: write (approve/merge)
- issues: write (read comments)
- checks: read (read check runs)

## Safety

Auto-merge is gated by AUTO_MERGE_ENABLED and will skip draft PRs.

## Notes

This workflow requires all configured reviewers to complete before proceeding to merge.
