const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/testing/playwright/screenshots');

const ensureScreenshotDir = () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
};

const sanitizeFileName = (value) =>
  value
    .replace(/[^a-z0-9-_ ]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

const captureScreenshot = async (page, testInfo, { always = true } = {}) => {
  if (!always && testInfo.status === testInfo.expectedStatus) {
    return;
  }

  ensureScreenshotDir();

  const titlePath =
    typeof testInfo.titlePath === 'function'
      ? testInfo.titlePath()
      : testInfo.titlePath || [testInfo.title];
  const title = sanitizeFileName(titlePath.join(' - '));
  const fileName = `${title}-${testInfo.project.name}.png`;
  const filePath = path.join(SCREENSHOT_DIR, fileName);

  await page.screenshot({ path: filePath, fullPage: true });
};

module.exports = {
  captureScreenshot,
  SCREENSHOT_DIR,
};
