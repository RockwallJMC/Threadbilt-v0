import fs from "node:fs";

const githubToken = process.env.GITHUB_TOKEN;
const checkName = process.env.CHECK_NAME;
const timeoutMinutes = Number(process.env.TIMEOUT_MINUTES || 30);
const pollIntervalSeconds = Number(process.env.POLL_INTERVAL_SECONDS || 20);

if (!githubToken) {
  console.error("GITHUB_TOKEN missing.");
  process.exit(1);
}

if (!checkName) {
  console.error("CHECK_NAME missing.");
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

const owner = event.repository.owner.login;
const repoName = event.repository.name;
const headSha = pullRequest.head?.sha;
if (!headSha) {
  console.error("PR head SHA missing.");
  process.exit(1);
}

const githubApi = process.env.GITHUB_API_URL || "https://api.github.com";
const deadline = Date.now() + timeoutMinutes * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

while (Date.now() < deadline) {
  const response = await fetch(
    `${githubApi}/repos/${owner}/${repoName}/commits/${headSha}/check-runs?check_name=${encodeURIComponent(checkName)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`Check runs error: ${response.status} ${text}`);
    process.exit(1);
  }

  const data = await response.json();
  const runs = Array.isArray(data.check_runs) ? data.check_runs : [];
  const run = runs.find((item) => item.name === checkName);

  if (run) {
    if (run.status === "completed") {
      if (run.conclusion === "success") {
        console.log(`${checkName} succeeded.`);
        process.exit(0);
      }

      console.error(`${checkName} completed with conclusion: ${run.conclusion}`);
      process.exit(1);
    }
  }

  await sleep(pollIntervalSeconds * 1000);
}

console.error(`Timed out waiting for ${checkName} check.`);
process.exit(1);
