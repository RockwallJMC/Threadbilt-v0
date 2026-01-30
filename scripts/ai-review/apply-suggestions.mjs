import fs from "node:fs";
import { execSync } from "node:child_process";

const patchPath = process.env.PATCH_PATH;
if (!patchPath || !fs.existsSync(patchPath)) {
  console.log("No patch to apply.");
  process.exit(0);
}

try {
  execSync(`git apply --whitespace=nowarn "${patchPath}"`, { stdio: "inherit" });
} catch (error) {
  console.error("Failed to apply patch.");
  process.exit(1);
}

const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
if (!status) {
  console.log("Patch applied with no changes.");
  process.exit(0);
}

execSync("git config user.name \"ai-review-bot\"", { stdio: "inherit" });
execSync("git config user.email \"ai-review-bot@users.noreply.github.com\"", { stdio: "inherit" });
execSync("git add -A", { stdio: "inherit" });
execSync("git commit -m \"Apply AI review suggestions\"", { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
