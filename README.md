# Playwright Test Framework

Automated browser-based acceptance tests using Playwright and Typescript

## Prerequisites

For non-Linux run:
Node.js version 20 or later, download and install from https://nodejs.org/

For linux run:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Once installed verify installation:

```bash
node --version   # this should print v20.x.x or higher
npm --version    # this should print 10.x.x or higher
```

## Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/julesmulford/portfolio-playwright-tests.git
```

### Step 2: Install dependencies

From the project root directory, run:

```bash
npm ci
```

### Step 3: Install browser engines

```bash
npx playwright install --with-deps
```

### Step 4: Configure environment variables in env files

```bash
cp .env.example .env
```

Then open `.env` in a text editor and fill in your values:

```
BASE_URL=https://www.example.com/
TEST_USERNAME=email@example.com
PASSWORD=yourpassword
EXPECTED_PORTFOLIO_VALUE=0.00
```

| Variable | Description |
|----------|-------------|
| `BASE_URL` | The full URL of the application to test against |
| `TEST_USERNAME` | Account email or username for login (named `TEST_USERNAME` to avoid clashing with the Windows `USERNAME` system variable) |
| `PASSWORD` | Account password for login |
| `EXPECTED_PORTFOLIO_VALUE` | The expected portfolio balance to validate (e.g. `0.00`, `123.45`) |


Tests load configuration from `.env` by default. To test against staging, QA, or production, create a separate env file for each and enter the appropriate URL, credentials and expected portfolio value:

```bash
cp .env.example .env.staging
cp .env.example .env.qa
cp .env.example .env.production
```

### Step 5: First-run device approval

The application may prompt you to approve a new device on first login via email confirmation. Playwright uses its own browser profile so it will be recognised as a new device even if you've previously logged in from your regular browser.

To handle this:

1. Run the setup test **headed** so you can see and interact with the browser:
   ```bash
   npx playwright test --project=setup --reporter=list --headed
   ```
2. When the device approval prompt appears, complete the approval manually by clicking the confirmation link in your email
3. The persistent browser profile saves this approval. All subsequent runs will reuse the same device identity and skip the approval prompt.

If you ever delete the `playwright/.auth/profile/` directory, you will need to repeat this step.

## Cloudflare issues

You may encounter a cloudflare verification challenge when running the test headlessly. It is out of scope of this technical test to solve this limitation, however running the tests headed should prevent the challenge being displayed. Once a session has been established via a headed run, the persistent browser profile at `playwright/.auth/profile/` retains the clearance cookie, so subsequent headless runs on the same machine will typically pass without the challenge.


## Running the Tests

### Run all tests (headless, all browsers)

```bash
npm test
```

This runs every test across Chromium, Firefox, and WebKit in headless mode. Results are printed to the terminal and an HTML report is generated which is saved in the playwright-report folder.


### Run all tests against specific environments:

If env files have been defined for staging, qa or production environments they can be run as below:

```bash
npm run test:staging
npm run test:qa
npm run test:production
```

### Run in headed mode to see the UI or if you see a Cloudflare verification:

```bash
npm run test:headed
cross-env TEST_ENV=staging npx playwright test --reporter=list --headed
cross-env TEST_ENV=qa npx playwright test --reporter=list --headed
cross-env TEST_ENV=production npx playwright test --reporter=list --headed
```

### Run with step-through debugger

```bash
npm run test:debug
```

### Run a single browser only, headless / headed

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit

npx playwright test --project=chromium --headed
npx playwright test --project=firefox --headed
npx playwright test --project=webkit --headed

```

## Running by Tag

The tests are currently tagged with `@smoke`, `@portfolio`

```bash
# Run a specific tag headless/headed
npx playwright test --grep @portfolio
npx playwright test --grep @portfolio --reporter=list --headed

# Run multiple tags headless/headed
npx playwright test --grep "@smoke|@portfolio"
npx playwright test --grep "@smoke|@portfolio" --reporter=list --headed

# Exclude a tag headless/headed
npx playwright test --grep-invert @smoke
npx playwright test --grep-invert @smoke --reporter=list --headed

```

The tags could be expanded to different features as further tests are included in the framework.


## Viewing the Test Report

After a test run, open the Playwright HTML report showing pass/fail status, screenshots on failure, traces etc as below:

```bash
npm run report
```

## How Authentication Works

1. The `setup` project runs `auth.setup.ts` once before any browser tests that require authentication, this is currently set to be any tests running Chromium, Firefox or WebKit but new projects could be added without the authentication for tests that don't require it
2. It launches a **persistent browser context** using `playwright/.auth/profile/` which preserves device identity (cookies, IndexedDB, device tokens) between runs
3. It logs in through the UI and saves cookies/storage to `playwright/.auth/user.json`
4. Authenticated browser projects load that file via `storageState`, starting already logged in


## CI/CD

As CI/CD integration isn't in scope of this technical test only an example GitHub Actions workflow (`.github/workflows/playwright.yml`) that runs on PR to `master` is provided which:

1. Installs dependencies
2. Runs all tests headless
3. Uploads HTML report and test results as artifacts

Configuration is read from GitHub Secrets (`TEST_USERNAME`, `PASSWORD`, `BASE_URL`, `EXPECTED_PORTFOLIO_VALUE`) which will need to be set up.

Consideration will also be needed for first run device approval via CI/CD as with locally run tests, potentially using a solution such as API based authentication.


## Future Improvements

- **Allure Reporting** — Replace the built-in HTML reporter with Allure for richer test reporting. Would use `allure-playwright` as a custom reporter in `playwright.config.ts`.

- **Docker Support** — A `Dockerfile` using the official `mcr.microsoft.com/playwright` image for fully reproducible test execution across environments allowing for consistency when running on different machines.

- **CI Sharding** — Split test execution across multiple parallel GitHub Actions runners using Playwright's `--shard` flag and a matrix strategy which would reduce over CI execution time as the test suites grow.

- **Prettier + ESLint** — Enforce consistent formatting and catch code quality issues using Prettier `eslint-config-prettier` for auto-formatting, ESLint `typescript-eslint` and `eslint-plugin-playwright` for static analysis.

- **Environment Validation Helper** — Add a small helper that validates required environment variables at startup (e.g. `BASE_URL`, `TEST_USERNAME`, `PASSWORD`, `EXPECTED_PORTFOLIO_VALUE`) and fails with a clear error message.

- **Claude AI Integration via Claude Code Skills** — Use Claude skills to automate repetitive QA tasks: `/generate-tests` to scaffold new spec files, `/review-locators` to audit page objects against the DOM, and `/analyse-failures` to summarise test report artifacts and suggest fixes.

- **Claude AI in the CI Pipeline** — Add a post-test CI step that sends test results, failure logs, screenshots, and trace summaries to Claude analysis. Claude would triage each failing test: classify the cause and suggest a fix. This could be expanded to summarising nightly runs (flaky tests, slow running tests etc) and post this summary via Slack or email. 

- **Visual Regression Testing** — Use Playwright's built-in `toHaveScreenshot()` for pixel-level comparison on every test run. Baseline snapshots are committed to the repo and compared automatically on each run, with configurable thresholds for acceptable pixel differences which will catch layout changes that could be missed by functional assertions.

- **Network Mocking for Edge Cases** — Use Playwright's `page.route()` to intercept API calls and return controlled responses enabling testing error states such as 500 responses, timeouts, empty data etc.

- **Mobile Browser Testing** — Add `mobile-chrome` (e.g. Pixel 5) and `mobile-safari` (e.g. iPhone 12) projects to `playwright.config.ts` to run the test suites with mobile viewport sizes, mobile user agents and touch emulation, catching responsive layout issues.

- **Flake Detection** — A scheduled nightly CI job running `--repeat-each=3` to distinguish intermittent test failures from genuine failures.

- **API Test Data** — A `tests/api/` layer that calls the application's API directly to create test preconditions instead of using the UI to create accounts, balances etc faster than via the UI.

- **Additional UI tests** — Additional UI tests for authenticated and non authenticated features including a `tests/logged-out/` directory for tests that verify unauthenticated user journeys which wouldn't use `storageState` and have no dependency on the `setup` project.

- **API Tests** — Use Playwrights built-in request API context to test the applications REST endpoints without the browser covering areas such as authentication (valid and invalid credentials), portfolio endpoints (balances, invalid accounts) error handling (malformed requests, unauthorized access) etc 

- **Accessibility Tests** — Integrate `@axe-core/playwright` for use to run accessibility tests against key pages to ensure they conform to WCAG 2.1 Accessibility standards. 

- **Performance Tests** — Integrate k6 to performance test key API endpoints measuring things such as response latency under normal and peak load, verifying response times stay within acceptable thresholds (less than 500ms for example).
