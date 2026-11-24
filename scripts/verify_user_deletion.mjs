import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('public', 'playwright_screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('--- Starting User Deletion Flow Verification ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    slowMo: 120,
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });

  try {
    // 1. Sign in as Admin
    console.log('1. Signing in as Administrator...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    const adminBtn = page.locator('button:has-text("Admin")').first();
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
      await page.waitForTimeout(400);
      await page.locator('button[type="submit"]:has-text("Sign In")').click();
      await page.waitForTimeout(2000);
    }

    // 2. Navigate to /users
    console.log('2. Navigating to Users Management (/users)...');
    await page.goto('http://localhost:3000/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 3. Create a disposable user to delete
    const testUserName = 'Siddharth Rao';
    const testUserEmail = 'siddharth.rao@candelatech.com';
    console.log(`3. Creating target test employee: ${testUserName}...`);

    await page.locator('button:has-text("Create Account")').first().click();
    await page.locator('h2:has-text("Create Employee Account")').waitFor({ state: 'visible' });

    await page.locator('input[placeholder*="Rachel Adams"]').first().fill(testUserName);
    await page.locator('input[placeholder*="rachel.adams@candelatech.com"]').first().fill(testUserEmail);
    await page.locator('form button[type="submit"]:has-text("Create Account")').click();
    await page.waitForTimeout(3000);
    console.log('User created successfully.');

    // 4. Search for the user in the table
    console.log(`4. Searching for "${testUserName}" in table...`);
    const searchInput = page.locator('input[placeholder*="Search by name"]').first();
    await searchInput.fill(testUserName);
    await page.waitForTimeout(1500);

    const targetRow = page.locator(`tr:has-text("${testUserName}")`).first();
    await targetRow.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Target user found in table.');

    await page.screenshot({ path: path.join(screenshotDir, '06_user_before_delete.png') });

    // 5. Click the Delete button
    console.log('5. Clicking Delete (Trash) button for user...');
    const deleteBtn = targetRow.locator('button[title*="Delete"]').first();
    await deleteBtn.click();

    // 6. Confirm Dialog Check
    console.log('6. Awaiting confirmation dialog...');
    const dialogConfirmBtn = page.locator('button:has-text("Delete User")').last();
    await dialogConfirmBtn.waitFor({ state: 'visible', timeout: 5000 });

    await page.screenshot({ path: path.join(screenshotDir, '07_delete_confirm_dialog.png') });

    console.log('7. Confirming deletion...');
    await dialogConfirmBtn.click();
    
    // Wait for the deletion request and UI update
    console.log('Waiting for deletion to process...');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(screenshotDir, '08_after_deletion.png') });

    // 8. Verification: Ensure user is removed
    console.log('8. Verifying removal from directory...');
    const userCell = page.locator(`td:has-text("${testUserName}")`).first();
    await userCell.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    const userRowStillPresent = await userCell.isVisible();
    console.log(`Is user still visible in directory? ${userRowStillPresent ? 'YES (FAILED)' : 'NO (SUCCESSFULLY DELETED)'}`);

    if (userRowStillPresent) {
      throw new Error(`User ${testUserName} was not removed from the directory table.`);
    }

    console.log('SUCCESS: User deletion verified end-to-end!');
    await page.waitForTimeout(3000);

  } catch (err) {
    console.error('Error during deletion verification:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'delete_error.png') }).catch(() => {});
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
