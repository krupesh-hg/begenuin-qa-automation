# BeGenuin — Playwright Automation Tests

Automated tests for **BeGenuin** and **Carlist** web apps using Playwright + TypeScript.
Runs both brands in one command. All files are in this single folder.

---

## Files in this folder

| File | What it does |
|---|---|
| `begenuin.spec.ts` | All 18 test cases (Auth, Brand elements, Feed) |
| `playwright.config.ts` | Sets up BeGenuin + Carlist as two test brands |
| `.env` | Login credentials |
| `package.json` | Project dependencies |

---

## Setup 

### 1. Install Node.js
Download from https://nodejs.org — install the LTS version.

### 2. Open terminal in this folder
```
cd path/to/begenuin-qa-flat
```

### 3. Install dependencies
```
npm install
```

### 4. Install Playwright browser
```
npx playwright install chromium
```

### 5. Add your credentials to .env
Open the `.env` file and fill in:
```
TEST_EMAIL=your@email.com
TEST_PASSWORD=yourpassword
```

---

## Running tests

### Run all tests for both brands
```
npm test
```

### Run with browser visible (you can watch it)
```
npm run test:headed
```

### View the test report after running
```
npm run test:report
```

---

## Test cases

| TC ID | Test | Needs login? |
|---|---|---|
| TC-AUTH-001 | Login button visible | No |
| TC-AUTH-002 | Email + password fields appear | No |
| TC-AUTH-003 | Successful login | Yes |
| TC-AUTH-004 | Logout works | Yes |
| TC-AUTH-005 | Wrong password shows error | No |
| TC-AUTH-006 | Empty form shows validation | No |
| TC-BRAND-001 | "Get App" button present | No |
| TC-BRAND-002 | "Get App" opens app store | No |
| TC-BRAND-003 | "Become a Creator" badge visible | No |
| TC-BRAND-004 | Badge is inside the sidebar | No |
| TC-BRAND-005 | Repost button visible | No |
| TC-BRAND-006 | Repost button enabled | No |
| TC-FEED-001 | Feed loads with posts | No |
| TC-FEED-002 | Like button visible | No |
| TC-FEED-003 | Like toggles state | Yes |
| TC-FEED-004 | Comment box opens | No |
| TC-FEED-005 | Posting a comment works | Yes |
| TC-FEED-006 | Repost shows confirmation | Yes |

> Tests that need login are skipped automatically if .env is not filled.

---

