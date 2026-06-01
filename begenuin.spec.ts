import { test, expect } from '@playwright/test';

/**
 * NOTE: Before running these tests, save your login session first!
 * Run:  npx ts-node save-session.ts
 * Then: npx playwright test
 */

// ─────────────────────────────────────────────────────────
// HELPER: Dismiss any unexpected popup (Become a Creator etc)
// ─────────────────────────────────────────────────────────
async function dismissPopups(page: any) {
  try {
    await page.waitForTimeout(1500);
    const closeBtn = page.locator('button:has(span:text("Close"))');
    const count = await closeBtn.count();
    for (let i = 0; i < count; i++) {
      const visible = await closeBtn.nth(i).isVisible({ timeout: 1000 }).catch(() => false);
      if (visible) {
        await closeBtn.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch {}
}

// ─────────────────────────────────────────────────────────
// HELPER: Click the user profile/avatar button
// Tries multiple selectors until one works
// ─────────────────────────────────────────────────────────
async function clickProfileButton(page: any) {
  const selectors = [
    '[data-testid="user-avatar"]',
    '[data-testid="profile-btn"]',
    'button[aria-label*="profile"]',
    'button[aria-label*="account"]',
    'button[aria-label*="user"]',
    'img[alt*="profile"]',
    'img[alt*="avatar"]',
    // Genuin-specific: profile pic is usually a rounded img inside a button
    'button:has(img[class*="rounded"], img[class*="avatar"], img[class*="profile"])',
    // Last resort: any button near top right of page
    'header button:last-of-type',
    'nav button:last-of-type',
  ];

  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      const visible = await el.isVisible({ timeout: 1500 }).catch(() => false);
      if (visible) {
        await el.click();
        // Check if Settings/Logout menu appeared
        const menuVisible = await page.locator('text=Settings, text=Logout').first()
          .isVisible({ timeout: 2000 }).catch(() => false);
        if (menuVisible) return true;
      }
    } catch {}
  }
  return false;
}

// ═══════════════════════════════════════════
// SECTION 1 — BASIC (no login needed)
// ═══════════════════════════════════════════

test('TC-001 | Homepage loads successfully', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await expect(page.locator('body')).toBeVisible();
});

test('TC-002 | Login button visible when logged out', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await expect(
    page.locator('button:has-text("Log in"), a:has-text("Log in")').first()
  ).toBeVisible({ timeout: 8000 });
});

test('TC-003 | Clicking Login opens Sign in popup', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('button:has-text("Log in"), a:has-text("Log in")').first().click();
  await expect(page.locator('text=Sign in').first()).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input[placeholder="Enter Email"]').first()).toBeVisible({ timeout: 5000 });
});

test('TC-004 | Login popup has Continue button', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('button:has-text("Log in"), a:has-text("Log in")').first().click();
  await expect(page.locator('button:has-text("Continue")').first()).toBeVisible({ timeout: 8000 });
});

test('TC-005 | Login popup can be closed with X button', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('button:has-text("Log in"), a:has-text("Log in")').first().click();
  await expect(page.locator('text=Sign in').first()).toBeVisible({ timeout: 8000 });
  await page.locator('button:has(span:text("Close"))').first().click();
  await expect(page.locator('text=Sign in').first()).not.toBeVisible({ timeout: 5000 });
});

// ═══════════════════════════════════════════
// SECTION 2 — LOGGED IN CHECK
// ═══════════════════════════════════════════

test('TC-006 | User is logged in — Log in button not visible', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.waitForTimeout(2000); // let auth state settle fully

  // Count how many "Log in" elements exist on the page
  const loginCount = await page.locator(
    'button:has-text("Log in"), a:has-text("Log in")'
  ).count();

  // PASS = 0 login buttons found = user is logged in ✅
  expect(loginCount).toBe(0);
});

// ═══════════════════════════════════════════
// SECTION 3 — NAVIGATION TABS
// ═══════════════════════════════════════════

test('TC-007 | Home tab is visible', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await expect(
    page.locator('a:has-text("Home"), button:has-text("Home")').first()
  ).toBeVisible({ timeout: 8000 });
});

test('TC-008 | Popular tab navigates correctly', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('a:has-text("Popular"), button:has-text("Popular")').first().click();
  await expect(page).toHaveURL(/popular/, { timeout: 8000 });
});

test('TC-009 | Latest tab navigates correctly', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('a:has-text("Latest"), button:has-text("Latest")').first().click();
  await expect(page).toHaveURL(/latest/, { timeout: 8000 });
});

test('TC-010 | Explore tab navigates correctly', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await page.locator('a:has-text("Explore"), button:has-text("Explore")').first().click();
  await expect(page).toHaveURL(/explore/, { timeout: 8000 });
});

// ═══════════════════════════════════════════
// SECTION 4 — PROFILE
// ═══════════════════════════════════════════

test('TC-011 | Profile page loads for 23bcp360', async ({ page }) => {
  await page.goto('/profile/23bcp360');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  await expect(page.locator('text=23bcp360').first()).toBeVisible({ timeout: 8000 });
});

// ═══════════════════════════════════════════
// SECTION 5 — SETTINGS
// ═══════════════════════════════════════════

test('TC-012 | Settings opens from profile menu', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  const clicked = await clickProfileButton(page);
  if (!clicked) throw new Error('Could not find profile button — share its HTML with Claude!');
  await page.locator('text=Settings').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('text=Settings').first().click();
  await expect(page).toHaveURL(/settings/, { timeout: 8000 });
});

// ═══════════════════════════════════════════
// SECTION 6 — LOGOUT
// ═══════════════════════════════════════════

test('TC-013 | Logout shows Log in button again', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');
  await dismissPopups(page);
  const clicked = await clickProfileButton(page);
  if (!clicked) throw new Error('Could not find profile button — share its HTML with Claude!');
  await page.locator('text=Logout').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('text=Logout').first().click();
  await expect(
    page.locator('button:has-text("Log in"), a:has-text("Log in")').first()
  ).toBeVisible({ timeout: 10000 });
});
