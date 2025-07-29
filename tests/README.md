# End-to-End Testing with Playwright

This directory contains comprehensive E2E tests for the Manetho learning platform using Playwright.

## 🚀 Quick Start

### Prerequisites

1. **Install Playwright**: Already installed as a dev dependency
2. **Install Browsers**: Run `npm run test:install` to install browser binaries
3. **Start the Application**: Run `npm run dev` to start the development server

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test suites
npm run test:auth
npm run test:navigation
npm run test:doubt-solving
npm run test:flashcards
npm run test:community
npm run test:quiz
npm run test:mind-maps
npm run test:calls
npm run test:profile
```

## 📁 Test Structure

```
tests/
├── README.md                 # This file
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
├── utils/
│   └── test-utils.ts        # Common test utilities and helpers
├── auth.spec.ts             # Authentication tests
├── navigation.spec.ts       # Navigation and routing tests
├── doubt-solving.spec.ts    # AI Doubt Solver tests
├── flashcards.spec.ts       # Flashcards feature tests
├── community.spec.ts        # Community and social features tests
├── quiz.spec.ts             # Quiz generation and taking tests
├── mind-maps.spec.ts        # Mind Maps feature tests
├── calls.spec.ts            # Calls & Group Study tests
└── profile.spec.ts          # User Profile tests
```

## 🧪 Test Coverage

### Authentication (`auth.spec.ts`)
- ✅ Landing page display
- ✅ User registration
- ✅ User login/logout
- ✅ Password reset
- ✅ Protected route access
- ✅ Session management
- ✅ Social authentication
- ✅ Form validation

### Navigation (`navigation.spec.ts`)
- ✅ Home page functionality
- ✅ Sidebar navigation
- ✅ Navbar interactions
- ✅ Breadcrumb navigation
- ✅ Mobile responsiveness
- ✅ URL navigation
- ✅ Search functionality
- ✅ Keyboard navigation

### AI Doubt Solver (`doubt-solving.spec.ts`)
- ✅ Chat interface
- ✅ Message sending/receiving
- ✅ File upload and processing
- ✅ Session management
- ✅ Chat history
- ✅ AI responses
- ✅ Error handling
- ✅ Accessibility features

### Flashcards (`flashcards.spec.ts`)
- ✅ Deck management (create, edit, delete)
- ✅ Card management (create, edit, delete, move)
- ✅ Study sessions
- ✅ AI generation
- ✅ Search and filtering
- ✅ Statistics and analytics
- ✅ Export/import functionality

### Community (`community.spec.ts`)
- ✅ Post creation (text, photo, poll)
- ✅ Post interactions (like, comment, share)
- ✅ User profiles
- ✅ Notifications
- ✅ Moderation features
- ✅ Real-time updates
- ✅ Search and filtering

### Quiz (`quiz.spec.ts`)
- ✅ Quiz generation with AI
- ✅ Taking quizzes (multiple choice, true/false, short answer)
- ✅ Quiz results and feedback
- ✅ Quiz history
- ✅ Leaderboards
- ✅ Quiz sharing
- ✅ Performance tracking

### Mind Maps (`mind-maps.spec.ts`)
- ✅ Mind map creation (manual and AI)
- ✅ Node management (add, edit, delete)
- ✅ Visualization features (layouts, themes)
- ✅ Collaboration features
- ✅ Export functionality
- ✅ Real-time updates

### Calls & Group Study (`calls.spec.ts`)
- ✅ Group study page layout and navigation
- ✅ Group creation and management
- ✅ Group chat interface
- ✅ Video meeting integration (Google Meet)
- ✅ Real-time messaging and file sharing
- ✅ Member management and invitations
- ✅ Search and filtering
- ✅ Mobile responsiveness
- ✅ Performance and accessibility

### User Profiles (`profile.spec.ts`)
- ✅ Profile page layout and information display
- ✅ User statistics and achievements
- ✅ Follow/unfollow functionality
- ✅ Profile posts and shared content
- ✅ Post interactions (likes, comments, shares)
- ✅ Navigation and theme switching
- ✅ Mobile responsiveness
- ✅ Accessibility features
- ✅ Performance testing

## 🛠️ Test Utilities

### PageActions Class
The `PageActions` class provides common helper methods:

```typescript
// Navigation
await pageActions.navigateTo('/path');
await pageActions.waitForPageLoad();

// Authentication
await pageActions.signIn(email, password);
await pageActions.signUp(email, password, firstName, lastName);
await pageActions.signOut();

// Forms
await pageActions.fillForm({ field1: 'value1', field2: 'value2' });
await pageActions.submitForm();

// Modals
await pageActions.openModal(triggerSelector);
await pageActions.closeModal();

// Search
await pageActions.search('query');

// File upload
await pageActions.uploadFile(filePath, inputSelector);

// Assertions
await pageActions.expectToBeVisible(selector);
await pageActions.expectToHaveText(selector, text);
await pageActions.expectURL(path);
```

### Test Data
Common test data is available in `test-utils.ts`:

```typescript
import { testUsers, testData } from './utils/test-utils';

// Use predefined test users
const { student, teacher } = testUsers;

// Use predefined test data
const { flashcard, mindMap, quiz, communityPost } = testData;
```

### Selectors
Common selectors are defined for consistency:

```typescript
import { selectors } from './utils/test-utils';

// Use predefined selectors
await page.click(selectors.addButton);
await page.fill(selectors.searchInput, 'query');
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries on CI, 0 locally
- **Reporting**: HTML, JSON, and JUnit reports
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

### Environment Variables
```bash
BASE_URL=http://localhost:3000  # Base URL for tests
CI=true                        # Enable CI mode
```

## 📊 Test Reports

After running tests, view reports:

```bash
# Open HTML report
npm run test:report

# Reports are saved to:
# - test-results/results.json
# - test-results/results.xml
# - playwright-report/ (HTML report)
```

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### UI Mode
```bash
npm run test:ui
```

### Code Generation
```bash
npm run test:codegen
```

### Screenshots and Videos
- Screenshots are automatically taken on test failure
- Videos are recorded for failed tests
- Traces are collected for debugging

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:install
      - run: npm run build
      - run: npm start &
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📝 Writing New Tests

### Test Structure
```typescript
import { test, expect } from './utils/test-utils';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Setup: sign in, navigate to page
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
    await page.goto('/feature-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('button');
    
    // Act
    await page.fill('input', 'value');
    
    // Assert
    await expect(page.locator('text=Expected')).toBeVisible();
  });
});
```

### Best Practices
1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Use page actions** for common operations
4. **Use test data** for consistent test inputs
5. **Add proper assertions** to verify expected behavior
6. **Handle async operations** properly with waits
7. **Use data-testid attributes** for reliable selectors

### Adding New Test Files
1. Create a new `.spec.ts` file in the `tests/` directory
2. Import test utilities: `import { test, expect } from './utils/test-utils';`
3. Add test scripts to `package.json`
4. Update this README with new test coverage

## 🔍 Troubleshooting

### Common Issues

**Tests failing due to timing**
- Add explicit waits: `await page.waitForSelector(selector)`
- Use `waitForLoadState('networkidle')` for page loads

**Element not found**
- Check if element is visible: `await expect(element).toBeVisible()`
- Use more specific selectors
- Add data-testid attributes to components

**Authentication issues**
- Ensure test users exist in the database
- Check authentication flow in global setup

**Network errors**
- Mock external services in tests
- Use `page.route()` to intercept requests

### Getting Help
1. Check the [Playwright documentation](https://playwright.dev/)
2. View test reports for detailed error information
3. Use debug mode to step through tests
4. Check browser console for JavaScript errors

## 📈 Performance

### Test Execution Time
- **Full test suite**: ~10-15 minutes
- **Individual test files**: ~2-3 minutes
- **Single test**: ~30-60 seconds

### Optimization Tips
1. **Run tests in parallel** (already configured)
2. **Use test sharding** for CI/CD
3. **Mock external services** to reduce dependencies
4. **Optimize selectors** for faster element location
5. **Use headless mode** for faster execution

## 🤝 Contributing

When adding new features to the application:

1. **Write tests first** (TDD approach)
2. **Update existing tests** if breaking changes
3. **Add data-testid attributes** to new components
4. **Update test documentation** in this README
5. **Ensure all tests pass** before submitting PR

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Automation University](https://testautomationu.applitools.com/) 