# Testing Guide for *Manetho*

This document gathers (a) a short primer on how our Jest + Testing-Library setup works, (b) an explanation of **snapshots**, and (c) every copy-pastable command we used while building/diagnosing the suite so your teammates can reproduce the exact steps.

---

## 1 · What are *snapshots*?

A **snapshot** is a serialized "picture" of a React tree (or any serialisable value) taken during the first successful test run.  
On subsequent runs Jest re-computes the tree and compares it to the stored file (`__snapshots__/…`).

*  ✅ If they match the component still renders as expected.
*  🔴 If they differ the test fails, flagging an unintended UI change (or reminding you to update the snapshot with `u`).

We **do not** currently rely on snapshot tests in Manetho—our assertions are behavioural (query elements, click, expect callbacks).  This keeps the test suite robust yet readable for non-testing experts.

---

## 2 · Installation

```bash
# 1) Install project dependencies *and* dev-dependencies (Jest, @testing-library, etc.)
#    Running plain `npm install` at the repo root is enough because the
#    dev dependencies are already listed in package.json.

npm install
```

If you clone the repo and skip `npm install` you will get *Cannot find module 'jest'* errors, so do make sure you run it once.

---

## 3 · Most-used commands (chronological trail)

> Copy-paste any command block directly into your terminal.

| # | Command | What it does |
|---|---------|--------------|
| 1 | `npm test -- --runInBand` | Runs **all** test suites in serial (useful on Windows where parallel jest workers can exhaust file handles). |
| 2 | `npm test -- --coverage` | Runs all tests **and** generates the HTML / lcov code-coverage report inside `coverage/`. |
| 3 | `npm test -- src/components/chat/__tests__/VideoCallToggle.test.tsx` | Run **one** specific test file. |
| 4 | `npm test -- src/components/chat` | Run every test *inside that folder* (recursive). |
| 5 | `npm test -- --runInBand src/__tests__/middleware.test.ts` | Run a single file **and** force serial execution. |
| 6 | `npm test -- --silent` | Suppress Jest’s own console output; useful when you only care about pass/fail without the console.log noise emitted by the components. |
| 7 | `npm test -- --watch` | Interactive watch-mode – Jest re-runs affected tests on every save. |
| 8 | `npx jest --clearCache` | Sometimes handy if watch-mode behaves oddly. |

Feel free to bookmark / share this table—every command is safe to run locally.

### Flag cheat-sheet

| Flag | Meaning |
|------|---------|
| `--runInBand` | Run tests sequentially **in the main process**. Slower on multi-core CPUs but avoids Windows/CI FS limits. |
| `--coverage`  | Collect line/function/branch coverage (Istanbul). Results are printed to console **and** written to `coverage/index.html`. |
| `--silent`    | Silence console.log/console.error coming from the *tests* themselves (does **not** silence failures). |
| `--watch`     | Watch mode: Jest keeps running, re-runs on file change. |
| `--maxWorkers=N` | Limit parallel workers (alternative to `--runInBand`). |

---

## 4 · How do the test files work?

* **Render** the component with `@testing-library/react` (`render(<Button />)`).
* **Act** by firing events: `fireEvent.click(button)` or `userEvent.type(input, 'Hi')`.
* **Assert** using DOM queries: `expect(screen.getByText('Submit')).toBeInTheDocument()`.
* External concerns (db, network, Agora RTC, Clerk, etc.) are **mocked** with `jest.mock()` so tests stay deterministic and offline-friendly.

Directory layout:

```
src/
  components/
    __tests__/      ← pure-frontend tests
  app/api/
    __tests__/      ← route / backend tests (App Router)
  lib/__tests__/    ← pure TS/JS helpers
```

You can open any `*.test.tsx` to see readable, real-world examples—no snapshot magic involved.

---

## 5 · Latest coverage snapshot (after v>%55 functions)

```
File                       | % Funcs | % Lines
---------------------------|---------|--------
src/components             | 68.6    | 78.2
src/components/chat        | 50.0    | 63.9
src/app/api (routes)       | 95+     | 95+
All files                  | 56-60   | 73+
```
Open `coverage/lcov-report/index.html` in your browser for a drill-down view.

---

## 6 · Running a **single file** or an **entire folder**

Run one specific file:

```bash
# Statistics counter only
npm test -- src/components/landingpage/section/__tests__/StatisticsSectionCounter.test.tsx
```

Run every test inside a folder (recursive):

```bash
# All chat-component suites
npm test -- src/components/chat
```

*(Append `--runInBand` if you need serial execution on Windows/CI.)*

---

Happy testing! 🎉 

---

## 7 · npm **vs** npx – why you may see both

* **`npm`** is the package-manager CLI. When we run `npm test` it simply looks up the `scripts.test` entry in `package.json` (→ `jest`).  
* **`npx`** executes a CLI *binary* that lives in `node_modules/.bin` **without** requiring a script entry. We used it exactly once (`npx jest --clearCache`) because there is no convenience npm-script for that sub-command.

> **TL;DR** For day-to-day work **`npm test`** (and friends) is enough.  
> You do **not** need to switch between the two unless you want a one-off CLI that has no npm-script wrapper.

---

## 8 · What we covered and *why*

| Area | What we verified | How |
|------|------------------|-----|
| **Frontend components** | Rendering, user interactions (clicks, key-press, hover), state updates | `@testing-library/react` + `fireEvent` / `userEvent` assertions (`Button`, `Navbar`, `ChatSidebar`, `VideoCall`, etc.) |
| **Backend / API routes** | Happy-path & error-path JSON responses, permission checks | Invoke exported `POST/GET` handlers directly, assert `NextResponse.json()` shape (`/api/doubt-solving`, `/api/check-file`, `/api/threads-drizzle`, …) |
| **Utilities** | Pure functions (file-download helper, Prisma/Drizzle helpers) | Vanilla Jest assertions, no React required |
| **Middleware** | Redirect map vs. fall-through | Mock `NextResponse` and feed dummy `NextRequest` |

### Mocking strategy (requirement #2 ✅)

* **Network**: `global.fetch = jest.fn(() => Promise.resolve({ ok:true, json:()=>… }))`
* **Agora SDK**: `jest.mock('agora-rtc-sdk-ng', () => ({ createClient: () => fakeClient }))`
* **Database layer**: Drizzle/Prisma helpers mocked so no real DB spin-up.
* **Auth (Clerk)**: `jest.mock('@clerk/nextjs', () => ({ useUser: () => ({ user:{…} }) }))`

This guarantees deterministic, offline-friendly tests while hitting every branch we care about.

### Unit-testing goals (requirement #1 ✅)

1. **Frontend** – Each interactive component has at least one test that:
   * Renders it in isolation.
   * Performs a user action (click / type).
   * Asserts visual or callback outcome.
2. **Backend** – Every `app/api/` route has tests for:
   * 200-OK happy path.
   * ≥1 failure path (missing param, external-service throw).

Together those cover “check whether components are working as expected” for both UI and serverless functions.

---

## 9 · Road-map to “Billion-Dollar” test maturity

These items are tracked in the project TODO list; tackle them incrementally.

| Priority | Task | Goal |
|----------|------|------|
| ⭐️ | Add edge-case unit tests (oversize file alert, ChatSidebar back navigation, VideoCall unsupported browser branch). | Lift **branch** coverage into the 60-70 % range. |
| ⭐️ | Integrate **StrykerJS** mutation testing (`npx stryker run`). | Prove assertions really fail when code mutates. |
| ⭐️ | Playwright E2E suite (`npx playwright install && npm run e2e`). | Assert full user journeys (sign-in → create thread → video call …). |
| ⭐️ | Axe-core accessibility audit (in component tests & Playwright). | Prevent regressions in a11y compliance. |
| ⭐️ | Lighthouse CI performance budget. | Fail PR if FCP/LCP/SI deviate. |
| — | Security & dependency scanning (OWASP ZAP, Snyk, npm-audit CI). | Continuous vulnerability detection. |
| — | Visual regression snapshots (Percy/Chromatic). | Pixel-level UI safety net. |

Each bullet adds *defence in depth*—aiming for >90 % branch, mutation score ≥80 %, and green a11y/perf/security gates.

---

## 10 · Reading the test code – common helpers demystified

Most suites follow the same three-step shape:

```ts
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

render(<MyComponent />);                // 1. Arrange
fireEvent.click(screen.getByText('Go')); // 2. Act
expect(screen.getByRole('alert')).toBeInTheDocument(); // 3. Assert
```

Reference of the helpers you will see over and over:

| Helper | What it does | Example |
|--------|--------------|---------|
| `render()` | Mounts a React component into a detached DOM for inspection. | `render(<Button label="save" />)` |
| `screen.getBy…` / `findBy…` / `queryBy…` | Queries the virtual DOM for an element. `get` throws if not found; `query` returns `null`; `find` is async + retries until timeout. | `screen.getByLabelText('Email')` |
| `fireEvent()` | Imperatively triggers a DOM event (click, change, keyDown…). | `fireEvent.change(input, { target: { value: 'abc' }})` |
| `waitFor()` | Polls until the callback stops throwing (useful for async state). | `await waitFor(() => expect(save).toHaveBeenCalled())` |
| `expect()` | Jest global assertion. Chain matchers like `toBeInTheDocument`, `toHaveTextContent`, etc. | `expect(btn).toBeDisabled()` |

Armed with these five, you can understand 95 % of the assertions in `src/**/__tests__`. 