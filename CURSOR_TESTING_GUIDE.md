# 🎭 Playwright Testing in Cursor IDE

This guide will help you run, debug, and visualize your Playwright tests directly in Cursor IDE.

## 🚀 Quick Start

### Running Tests in Cursor

1. **Open Terminal in Cursor** (`Ctrl+` ` or View → Terminal`)

2. **Install Playwright browsers** (first time only):
   ```bash
   npm run playwright:install
   ```

3. **Run tests with different modes**:

   **See Browser in Action (Headed Mode):**
   ```bash
   npm run test:e2e:headed
   # or for specific browser
   npm run test:e2e:chrome-headed
   npm run test:e2e:firefox-headed
   ```

   **Debug Mode (Step-through debugging):**
   ```bash
   npm run test:e2e:debug
   ```

   **UI Mode (Visual test runner):**
   ```bash
   npm run test:e2e:ui
   ```

## 🔍 Finding the "Show Browser" Option in Cursor

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Look for Playwright-related tasks

### Method 2: Terminal Commands
Since Cursor doesn't have a built-in Playwright extension UI, use these terminal commands:

```bash
# 👀 SEE BROWSER WINDOW
npm run test:e2e:headed

# 🐛 DEBUG WITH PLAYWRIGHT INSPECTOR
npm run test:e2e:debug

# 🎨 VISUAL TEST RUNNER (Best option!)
npm run test:e2e:ui
```

### Method 3: PowerShell Script (Windows)
```powershell
# Navigate to your project folder and run:
.\e2e\scripts\run-tests.ps1 -Headed -Browser firefox
```

## 🎯 Test Modes Explained

### 1. **Headed Mode** (See Browser)
```bash
npm run test:e2e:headed
```
- ✅ Browser window visible
- ✅ See exactly what's happening
- ✅ Great for development and debugging

### 2. **Debug Mode** (Step-through)
```bash
npm run test:e2e:debug
```
- ✅ Pauses at each step
- ✅ Inspector window opens
- ✅ Click "Step over" to proceed
- ✅ Set breakpoints in code

### 3. **UI Mode** (Best for Development)
```bash
npm run test:e2e:ui
```
- ✅ Web-based test runner
- ✅ Visual test selection
- ✅ Live test watching
- ✅ Built-in trace viewer
- ✅ Screenshots and videos

### 4. **Trace Mode** (Record Everything)
```bash
npm run test:e2e:trace
```
- ✅ Records complete test execution
- ✅ View traces with `npm run playwright:trace`

## 🔧 Configuration for Visibility

Your `playwright.config.ts` is already configured to show browsers in development:

```typescript
headless: process.env.CI ? true : false,
```

This means:
- **Local development**: Browser visible by default
- **CI/GitHub Actions**: Headless for speed

## 📊 Viewing Test Results

### 1. **HTML Report**
```bash
npm run playwright:report
```
- Opens detailed HTML report
- Shows screenshots, videos, traces
- Available after test runs

### 2. **Trace Viewer**
```bash
npm run playwright:trace
```
- Interactive trace playback
- See exactly what happened
- Timeline view of actions

### 3. **VS Code/Cursor Integration**
Install the Playwright extension for Cursor:
1. Go to Extensions (`Ctrl+Shift+X`)
2. Search for "Playwright Test for VSCode"
3. Install it
4. You'll get test discovery and run buttons

## 🎮 Interactive Commands

### Run Specific Tests
```bash
# Run only authentication tests
npx playwright test authentication

# Run only in Chrome
npm run test:e2e:chrome

# Run with video recording
npm run test:e2e:record
```

### Debug Specific Test
```bash
# Debug authentication tests in headed mode
npx playwright test authentication-with-mocks --headed --debug
```

## 🛠️ Troubleshooting

### "Can't see browser" Issues
1. **Check headless setting**: Ensure `headless: false` in config
2. **Use headed flag**: Always add `--headed` flag
3. **Try UI mode**: `npm run test:e2e:ui` is most visual

### "Tests timing out" Issues
1. **Check app is running**: Make sure `npm run dev` is active
2. **Increase timeouts**: Already configured in `playwright.config.ts`
3. **Use debug mode**: `npm run test:e2e:debug` to step through

### "Browser not found" Issues
```bash
# Reinstall browsers
npx playwright install
# or specific browser
npx playwright install chromium firefox
```

## 📱 Running Specific Browser Tests

```bash
# Chrome/Chromium only
npm run test:e2e:chrome-headed

# Firefox only  
npm run test:e2e:firefox-headed

# Both browsers
npm run test:e2e:headed
```

## 🎯 Best Practices for Development

1. **Start with UI Mode**:
   ```bash
   npm run test:e2e:ui
   ```

2. **Debug failing tests**:
   ```bash
   npm run test:e2e:debug
   ```

3. **Watch specific feature**:
   ```bash
   npx playwright test authentication --headed --watch
   ```

4. **Record problematic tests**:
   ```bash
   npx playwright test problem-test --headed --video=on --trace=on
   ```

## 🚀 GitHub Actions Integration

Your tests will run automatically on:
- Push to `main` or `develop`
- Pull requests
- Both Chrome and Firefox
- Artifacts saved for 30 days

## 📋 Quick Reference

| Task | Command |
|------|---------|
| See browser | `npm run test:e2e:headed` |
| Debug tests | `npm run test:e2e:debug` |
| Visual runner | `npm run test:e2e:ui` |
| Chrome only | `npm run test:e2e:chrome-headed` |
| Firefox only | `npm run test:e2e:firefox-headed` |
| View report | `npm run playwright:report` |
| View traces | `npm run playwright:trace` |

## 💡 Pro Tips

1. **Use UI Mode for development** - it's the most visual and interactive
2. **Debug mode for troubleshooting** - step through each action
3. **Headed mode for demos** - show stakeholders what's being tested
4. **Record videos for CI failures** - understand what went wrong

---

🎉 **You're all set!** Start with `npm run test:e2e:ui` to get the full visual experience. 