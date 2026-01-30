import { test as setup } from '@playwright/test';
import { TEST_USERS, loginAsUser } from '../helpers/crm-test-data.js';

const authFile = 'tests/.auth/user.json';

setup('authenticate as sales manager', async ({ page }) => {
  await loginAsUser(page, TEST_USERS.salesManager);
  await page.context().storageState({ path: authFile });
});
