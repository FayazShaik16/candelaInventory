import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('public', 'playwright_screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('Launching Chrome browser with Playwright...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    slowMo: 150, // smooth pacing so actions are clearly visible to user
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });

  const page = await context.newPage();

  try {
    console.log('1. Navigating to http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotDir, '01_login_page.png') });

    // Check if on login page
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      console.log('2. Signing in as Administrator...');
      const adminQuickBtn = page.locator('button:has-text("Admin")').first();
      if (await adminQuickBtn.isVisible()) {
        await adminQuickBtn.click();
      } else {
        await emailInput.fill('admin@candelatech.com');
        await page.locator('input[type="password"]').fill('CandelaPassword2026!');
      }

      await page.waitForTimeout(500);
      const signInBtn = page.locator('button[type="submit"]:has-text("Sign In")');
      await signInBtn.click();
      console.log('Clicked Sign In. Waiting for authentication...');
      await page.waitForTimeout(2000);
    }

    console.log('3. Navigating to Users Management (/users)...');
    await page.goto('http://localhost:3000/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotDir, '02_users_page.png') });

    console.log('4. Opening "Create Account" modal...');
    const createAccountBtn = page.locator('button:has-text("Create Account")').first();
    await createAccountBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createAccountBtn.click();

    // Wait for modal
    const modalHeading = page.locator('h2:has-text("Create Employee Account")');
    await modalHeading.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Modal opened successfully.');

    // User details to create
    const newUserName = 'Morgan Reed';
    const newUserEmail = 'morgan.reed@candelatech.com';
    const tempPassword = 'CandelaPassword2026!';

    console.log(`5. Filling user details: ${newUserName} (${newUserEmail})...`);
    // Full Name input
    const nameInput = page.locator('input[placeholder*="Rachel Adams"]').first();
    await nameInput.fill(newUserName);

    // Email input
    const modalEmailInput = page.locator('input[placeholder*="rachel.adams@candelatech.com"]').first();
    await modalEmailInput.fill(newUserEmail);

    // Temporary password input
    const tempPassInput = page.locator('input[placeholder*="Leave blank to auto-generate"]').first();
    if (await tempPassInput.isVisible()) {
      await tempPassInput.fill(tempPassword);
    }

    await page.screenshot({ path: path.join(screenshotDir, '03_create_modal_filled.png') });

    console.log('6. Submitting the Create Account form...');
    const submitBtn = page.locator('form button[type="submit"]:has-text("Create Account")');
    await submitBtn.click();

    // Wait for modal to close or notification toast
    console.log('Waiting for user creation to process...');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(screenshotDir, '04_user_created.png') });

    // Verify user in the table or search for the user
    console.log('7. Verifying user in table...');
    const searchInput = page.locator('input[placeholder*="Search users"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(newUserName);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotDir, '05_search_verified.png') });
    }

    const createdUserRow = page.locator(`td:has-text("${newUserName}"), span:has-text("${newUserName}")`).first();
    const isUserFound = await createdUserRow.isVisible();
    console.log(`User verification status: ${isUserFound ? 'FOUND & VERIFIED' : 'NOT FOUND IN TABLE'}`);

    console.log('Completed successfully! Keeping browser open for 6 seconds for visual confirmation...');
    await page.waitForTimeout(6000);

  } catch (err) {
    console.error('Error during Playwright execution:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png') }).catch(() => {});
  } finally {
    console.log('Closing browser...');
    await browser.close();
    console.log('Done.');
  }
}

run();
