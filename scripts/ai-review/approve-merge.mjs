import fs from "node:fs";

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error("GITHUB_TOKEN missing.");
  process.exit(1);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath || !fs.existsSync(eventPath)) {
  console.error("GITHUB_EVENT_PATH missing or invalid.");
  process.exit(1);
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const pullRequest = event.pull_request;
if (!pullRequest) {
  console.error("No pull_request found in event.");
  process.exit(1);
}

if (pullRequest.draft) {
  console.log("Pull request is draft. Skipping approval/merge.");
  process.exit(0);
}

const owner = event.repository.owner.login;
const repoName = event.repository.name;
const pullNumber = pullRequest.number;
const githubApi = process.env.GITHUB_API_URL || "https://api.github.com";
const mergeMethod = process.env.MERGE_METHOD || "squash";

const reviewResponse = await fetch(
  `${githubApi}/repos/${owner}/${repoName}/pulls/${pullNumber}/reviews`,
  {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: "Approved by automated Codex review chain.",
      event: "APPROVE",
    }),
  }
);

if (!reviewResponse.ok) {
  const text = await reviewResponse.text();
  console.error(`GitHub review error: ${reviewResponse.status} ${text}`);
  process.exit(1);
}

const mergeResponse = await fetch(
  `${githubApi}/repos/${owner}/${repoName}/pulls/${pullNumber}/merge`,
  {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merge_method: mergeMethod,
    }),
  }
);

if (!mergeResponse.ok) {
  const text = await mergeResponse.text();
  console.error(`GitHub merge error: ${mergeResponse.status} ${text}`);
  process.exit(1);
}
