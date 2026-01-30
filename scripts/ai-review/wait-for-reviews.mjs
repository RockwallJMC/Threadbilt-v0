import fs from "node:fs";

const githubToken = process.env.GITHUB_TOKEN;
const reviewerLogins = process.env.REVIEWER_LOGINS || "";
const timeoutMinutes = Number(process.env.TIMEOUT_MINUTES || 30);
const pollIntervalSeconds = Number(process.env.POLL_INTERVAL_SECONDS || 20);

if (!githubToken) {
  console.error("GITHUB_TOKEN missing.");
  process.exit(1);
}

const reviewers = reviewerLogins
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (reviewers.length === 0) {
  console.log("No optional reviewers configured. Skipping.");
  process.exit(0);
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

const owner = event.repository.owner.login;
const repoName = event.repository.name;
const pullNumber = pullRequest.number;
const githubApi = process.env.GITHUB_API_URL || "https://api.github.com";
const deadline = Date.now() + timeoutMinutes * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAll = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`GitHub API error: ${response.status} ${text}`);
    process.exit(1);
  }

  return response.json();
};

while (Date.now() < deadline) {
  const [reviews, issueComments, reviewComments] = await Promise.all([
    fetchAll(`${githubApi}/repos/${owner}/${repoName}/pulls/${pullNumber}/reviews?per_page=100`),
    fetchAll(`${githubApi}/repos/${owner}/${repoName}/issues/${pullNumber}/comments?per_page=100`),
    fetchAll(`${githubApi}/repos/${owner}/${repoName}/pulls/${pullNumber}/comments?per_page=100`),
  ]);

  const loginSet = new Set();
  const changesRequestedSet = new Set();

  for (const review of reviews) {
    if (review?.user?.login) {
      loginSet.add(review.user.login);
      if (review.state === "CHANGES_REQUESTED") {
        changesRequestedSet.add(review.user.login);
      }
    }
  }

  for (const comment of issueComments) {
    if (comment?.user?.login) {
      loginSet.add(comment.user.login);
    }
  }

  for (const comment of reviewComments) {
    if (comment?.user?.login) {
      loginSet.add(comment.user.login);
    }
  }

  if (changesRequestedSet.size > 0) {
    console.error(
      `Changes requested by: ${Array.from(changesRequestedSet).join(", ")}`
    );
    process.exit(1);
  }

  const missing = reviewers.filter((login) => !loginSet.has(login));
  if (missing.length === 0) {
    console.log(`All optional reviewers have commented: ${reviewers.join(", ")}`);
    process.exit(0);
  }

  await sleep(pollIntervalSeconds * 1000);
}

console.error(
  `Timed out waiting for optional reviewers: ${reviewers.join(", ")}`
);
process.exit(1);
