# BeGenuin & Carlist — Playwright Automation Tests

Automated end-to-end tests for **BeGenuin** (`begenuin.com`) and **Carlist** (`community.carlist.my`) web applications using Playwright + TypeScript.

---

## 📁 Files in this folder

| File | Purpose |
|---|---|
| `begenuin.spec.ts` | All 13 test cases |
| `playwright.config.ts` | Config — Edge browser, both brand URLs, session loading |
| `save-session.ts` | Run once to save your login session |
| `package.json` | Project dependencies |
| `.env.example` | Template for environment variables |
| `.gitignore` | Excludes node_modules, session, reports |

---

## ✅ Test Cases

| TC | Description | Login Required |
|---|---|---|
| TC-001 | Homepage loads successfully | No |
| TC-002 | Login button visible when logged out | No |
| TC-003 | Clicking Login opens Sign in popup | No |
| TC-004 | Login popup has Continue button | No |
| TC-005 | Login popup closes with X button | No |
| TC-006 | User is logged in — Log in button count = 0 | Yes (session) |
| TC-007 | Home tab is visible | No |
| TC-008 | Popular tab navigates correctly | No |
| TC-009 | Latest tab navigates correctly | No |
| TC-010 | Explore tab navigates correctly | No |
| TC-011 | Profile page loads for 23bcp360 | Yes (session) |
| TC-012 | Settings opens from profile menu | Yes (session) |
| TC-013 | Logout shows Log in button again | Yes (session) |

> Tests run on **both brands** automatically — 13 tests × 2 brands = **26 total test runs**

---

## 🚀 Setup (do this once)

### 1. Install Node.js
Download LTS version from https://nodejs.org

### 2. Clone the repo and install dependencies
```bash
git clone https://github.com/YOUR_USERNAME/begenuin-qa-automation.git
cd begenuin-qa-automation
npm install
```

### 3. Install Playwright with Edge browser
```bash
npx playwright install msedge
```

### 4. Save your login session (IMPORTANT)
```bash
npx ts-node save-session.ts
```

This opens Edge browser — **do not close it!**

- **Step 1:** Login on BeGenuin manually (Google, OTP, whatever works) → press **Enter** in terminal
- **Step 2:** Login on Carlist manually → press **Enter** in terminal
- Session saved to `session.json` — covers both sites ✅

> ⚠️ Never upload `session.json` to GitHub — it contains your login data!

---

## ▶️ Running Tests

### Run all tests (both brands)
```bash
npx playwright test
```

### Watch tests run in Edge browser (headed mode)
Already enabled by default — Edge opens automatically for each test.

### View HTML report after running
```bash
npx playwright show-report
```

### Run only BeGenuin tests
```bash
npx playwright test --project=begenuin
```

### Run only Carlist tests
```bash
npx playwright test --project=carlist
```

### Run a specific test by name
```bash
npx playwright test -g "TC-006"
```

---

## 🔑 Key Design Decisions

### Session-based login
Google login opens a new window that Playwright cannot control (Google blocks automation for security). OTP changes every time. Solution: **save session once manually**, reuse it in all tests automatically via `storageState` in config.

### dismissPopups() helper
The site shows unexpected popups like "Become a Creator" which block tests. Every test calls `dismissPopups()` after navigation — it finds and closes all modal close buttons, then presses Escape as backup.

### clickProfileButton() helper
The profile/avatar button has no stable `id` or `data-testid`. The helper tries 9 different selectors and confirms success by checking if the Settings/Logout menu appears.

### TC-006 login check
Uses `.count()` instead of `.isVisible()` — counts how many "Log in" elements exist. `0 = logged in (PASS)`, `>0 = not logged in (FAIL)`. More reliable as it never throws errors.

### Multi-brand via projects
`playwright.config.ts` defines two projects with different `baseURL`. The same test file runs for both brands automatically — adding a new brand = one new entry in the projects array.
