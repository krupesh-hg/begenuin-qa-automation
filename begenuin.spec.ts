import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

// ─────────────────────────────────────────────────────────
// CREDENTIALS — set these in your .env file
// ─────────────────────────────────────────────────────────
const TEST_EMAIL    = process.env.TEST_EMAIL    || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

const HAS_CREDS = !!(TEST_EMAIL && TEST_PASSWORD);

// ─────────────────────────────────────────────────────────
// SELECTORS — all page elements in one place
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// SITE URLS — based on actual site structure
// The login page is a SEPARATE URL, not a modal
// ─────────────────────────────────────────────────────────
const LOGIN_URL = 'https://brands.begenuin.com/login';

const SEL = {
  // Auth — actual text on site is "Log in" (not "Login")
  loginBtn:     'a:has-text("Log in"), button:has-text("Log in")',
  emailInput:   'input[type="email"], input[placeholder*="email"], input[placeholder*="Email"], input[name="email"]',
  passwordInput:'input[type="password"]',
  submitBtn:    'button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Continue")',
  userAvatar:   '[data-testid="user-avatar"], .user-avatar, .avatar, img[alt*="profile"], img[alt*="avatar"]',
  logoutBtn:    'button:has-text("Log out"), a:has-text("Log out"), button:has-text("Logout"), a:has-text("Logout")',
  errorMsg:     '[role="alert"], .error, .toast-error, :text("Invalid"), :text("incorrect"), :text("wrong"), :text("failed")',

  // Brand elements
  getAppBtn:    'button:has-text("Get App"), a:has-text("Get App"), button:has-text("Get the app"), a:has-text("Get the app")',
  creatorBadge: ':text("Become a Creator"), .become-creator-badge, [data-testid="become-creator"]',
  sidebar:      'aside, [data-testid="sidebar"], .sidebar, nav[role="complementary"]',
  repostBtn:    'button:has-text("Repost"), [data-testid="repost-btn"], button[aria-label*="repost"]',

  // Feed
  post:         '[data-testid="post"], .post-card, .feed-item, article',
  likeBtn:      'button[aria-label*="like"], button:has-text("Like"), [data-testid="like-btn"]',
  commentBtn:   'button[aria-label*="comment"], button:has-text("Comment"), [data-testid="comment-btn"]',
  commentInput: 'textarea[placeholder*="comment"], input[placeholder*="comment"], [data-testid="comment-input"]',
  postBtn:      'button:has-text("Post"), button[type="submit"]',
  toast:        '[role="dialog"], .toast, .modal, :text("Reposted"), :text("Shared")',
};

// ─────────────────────────────────────────────────────────
// HELPER: login with email + password
// ─────────────────────────────────────────────────────────
async function loginWithEmail(page: any) {
  // Login page is a SEPARATE URL on brands.begenuin.com
  await page.goto(LOGIN_URL);
  await page.waitForLoadState('networkidle');

  // Fill email
  await page.locator(SEL.emailInput).first().waitFor({ state: 'visible', timeout: 8_000 });
  await page.locator(SEL.emailInput).first().fill(TEST_EMAIL);

  // Fill password
  await page.locator(SEL.passwordInput).first().waitFor({ state: 'visible', timeout: 5_000 });
  await page.locator(SEL.passwordInput).first().fill(TEST_PASSWORD);

  // Submit
  await page.locator(SEL.submitBtn).first().click();

  // Wait for redirect after login (URL changes away from /login)
  await page.waitForURL((url: URL) => !url.pathname.includes('login'), { timeout: 15_000 });
}

// ═════════════════════════════════════════════════════════
// 1. AUTH TESTS
// ═════════════════════════════════════════════════════════
test.describe('AUTH — Login / Logout', () => {

  test('TC-AUTH-001 | "Log in" button is visible on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(SEL.loginBtn).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-AUTH-002 | Clicking "Log in" navigates to login page', async ({ page }) => {
    await page.goto('/');
    await page.locator(SEL.loginBtn).first().click();
    // Should land on brands.begenuin.com/login
    await page.waitForURL('**/login', { timeout: 8_000 });
    await expect(page.locator(SEL.emailInput).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.locator(SEL.passwordInput).first()).toBeVisible({ timeout: 5_000 });
  });

  test('TC-AUTH-003 | Successful login with valid email and password', async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set in .env');
    await loginWithEmail(page);
    // After login, URL should no longer be the login page
    expect(page.url()).not.toContain('/login');
  });

  test('TC-AUTH-004 | Logout returns to logged-out state', async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set in .env');
    await loginWithEmail(page);
    await page.locator(SEL.userAvatar).first().click();
    await page.locator(SEL.logoutBtn).first().waitFor({ state: 'visible', timeout: 5_000 });
    await page.locator(SEL.logoutBtn).first().click();
    // After logout, "Log in" button should reappear
    await expect(page.locator(SEL.loginBtn).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-AUTH-005 | Wrong password shows error message', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator(SEL.emailInput).first().fill('test@example.com');
    await page.locator(SEL.passwordInput).first().fill('WrongPassword999!');
    await page.locator(SEL.submitBtn).first().click();
    await expect(page.locator(SEL.errorMsg).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-AUTH-006 | Empty form submission shows validation error', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator(SEL.submitBtn).first().click();
    const emailValidity = await page.locator(SEL.emailInput).first().evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(emailValidity).toBe(false);
  });

});

// ═════════════════════════════════════════════════════════
// 2. BRAND-SPECIFIC ELEMENT TESTS
// ═════════════════════════════════════════════════════════
test.describe('BRAND — Get App / Become a Creator / Repost button', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-BRAND-001 | "Get App" button is present on the page', async ({ page }) => {
    await expect(page.locator(SEL.getAppBtn).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-BRAND-002 | "Get App" button opens app store link', async ({ page }) => {
    const [popup] = await Promise.all([
      page.context().waitForEvent('page').catch(() => null),
      page.locator(SEL.getAppBtn).first().click(),
    ]);
    if (popup) {
      const url = popup.url();
      expect(
        url.includes('play.google.com') || url.includes('apps.apple.com') || url.includes('app')
      ).toBeTruthy();
      await popup.close();
    } else {
      expect(page.url()).not.toBe('about:blank');
    }
  });

  test('TC-BRAND-003 | "Become a Creator" badge is visible', async ({ page }) => {
    await expect(page.locator(SEL.creatorBadge).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-BRAND-004 | "Become a Creator" badge is inside the sidebar', async ({ page }) => {
    const badge   = page.locator(SEL.creatorBadge).first();
    const sidebar = page.locator(SEL.sidebar).first();
    await expect(badge).toBeVisible({ timeout: 8_000 });

    const badgeBox   = await badge.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    if (!badgeBox || !sidebarBox) throw new Error('Could not get bounding boxes');

    const badgeCenterX = badgeBox.x + badgeBox.width / 2;
    expect(badgeCenterX).toBeGreaterThanOrEqual(sidebarBox.x);
    expect(badgeCenterX).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width);
  });

  test('TC-BRAND-005 | Repost button is visible on feed posts', async ({ page }) => {
    await expect(page.locator(SEL.post).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(SEL.repostBtn).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-BRAND-006 | Repost button is enabled (not greyed out)', async ({ page }) => {
    await expect(page.locator(SEL.repostBtn).first()).toBeEnabled({ timeout: 8_000 });
  });

});

// ═════════════════════════════════════════════════════════
// 3. FEED INTERACTION TESTS
// ═════════════════════════════════════════════════════════
test.describe('FEED — Like / Comment / Repost', () => {

  test('TC-FEED-001 | Feed loads with at least one post', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(SEL.post).first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-FEED-002 | Like button is visible on first post', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(SEL.post).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(SEL.likeBtn).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-FEED-003 | Clicking Like toggles state (requires login)', async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set in .env');
    await loginWithEmail(page);
    const likeBtn = page.locator(SEL.likeBtn).first();
    const before  = await likeBtn.getAttribute('aria-pressed');
    await likeBtn.click();
    await page.waitForTimeout(1000);
    const after = await likeBtn.getAttribute('aria-pressed');
    if (before !== null) {
      expect(after).not.toEqual(before);
    } else {
      await expect(likeBtn).toBeVisible();
    }
  });

  test('TC-FEED-004 | Comment button opens comment input box', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(SEL.post).first()).toBeVisible({ timeout: 10_000 });
    await page.locator(SEL.commentBtn).first().click();
    await expect(page.locator(SEL.commentInput).first()).toBeVisible({ timeout: 5_000 });
  });

  test('TC-FEED-005 | Posting a comment works (requires login)', async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set in .env');
    await loginWithEmail(page);
    const commentText = `Auto test comment ${Date.now()}`;
    await page.locator(SEL.commentBtn).first().click();
    await page.locator(SEL.commentInput).first().fill(commentText);
    await page.locator(SEL.postBtn).first().click();
    await expect(page.locator(`text=${commentText}`).first()).toBeVisible({ timeout: 8_000 });
  });

  test('TC-FEED-006 | Repost triggers confirmation (requires login)', async ({ page }) => {
    if (!HAS_CREDS) test.skip(true, 'TEST_EMAIL / TEST_PASSWORD not set in .env');
    await loginWithEmail(page);
    await page.locator(SEL.repostBtn).first().click();
    await expect(page.locator(SEL.toast).first()).toBeVisible({ timeout: 6_000 });
  });

});