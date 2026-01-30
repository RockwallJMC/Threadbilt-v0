import fs from "node:fs";
import path from "node:path";

const provider = process.argv[2];
if (!provider) {
  console.error("Provider name required.");
  process.exit(1);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath || !fs.existsSync(eventPath)) {
  console.error("GITHUB_EVENT_PATH missing or invalid.");
  process.exit(1);
}

const providerEndpoint = process.env.PROVIDER_ENDPOINT;
const providerToken = process.env.PROVIDER_TOKEN;
if (!providerEndpoint || !providerToken) {
  console.error("PROVIDER_ENDPOINT/PROVIDER_TOKEN not set.");
  process.exit(1);
}

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  console.error("GITHUB_TOKEN missing.");
  process.exit(1);
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const pullRequest = event.pull_request;
if (!pullRequest) {
  console.error("No pull_request found in event.");
  process.exit(1);
}

const repo = event.repository?.full_name;
if (!repo) {
  console.error("Repository info missing.");
  process.exit(1);
}

const owner = event.repository.owner.login;
const repoName = event.repository.name;
const pullNumber = pullRequest.number;
const diffUrl = pullRequest.diff_url;
const headSha = pullRequest.head?.sha;

const providerPayload = {
  provider,
  repository: repo,
  pull_number: pullNumber,
  title: pullRequest.title,
  body: pullRequest.body,
  diff_url: diffUrl,
  head_sha: headSha,
};

const providerResponse = await fetch(providerEndpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${providerToken}`,
  },
  body: JSON.stringify(providerPayload),
});

if (!providerResponse.ok) {
  const text = await providerResponse.text();
  console.error(`Provider error: ${providerResponse.status} ${text}`);
  process.exit(1);
}

const providerResult = await providerResponse.json();
const reviewBody = providerResult.reviewBody || `Automated ${provider} review completed.`;
const approve = Boolean(providerResult.approve);
const suggestionsPatch = providerResult.suggestionsPatch;

const reviewEvent = approve ? "APPROVE" : "COMMENT";
const githubApi = process.env.GITHUB_API_URL || "https://api.github.com";

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
      body: reviewBody,
      event: reviewEvent,
    }),
  }
);

if (!reviewResponse.ok) {
  const text = await reviewResponse.text();
  console.error(`GitHub review error: ${reviewResponse.status} ${text}`);
  process.exit(1);
}

const outputsPath = process.env.GITHUB_OUTPUT;
const outputLines = [];

if (suggestionsPatch) {
  const patchFile = `${provider}-suggestions.patch`;
  fs.writeFileSync(patchFile, suggestionsPatch);
  outputLines.push("hasPatch=true");
  outputLines.push(`patchPath=${patchFile}`);
} else {
  outputLines.push("hasPatch=false");
  outputLines.push("patchPath=");
}

if (outputsPath) {
  fs.appendFileSync(outputsPath, outputLines.join("\n") + "\n");
}
