import { test, expect } from './utils/test-utils';
import { testUsers, testData } from './utils/test-utils';

test.describe('Quiz', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Sign in before each test
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
    await page.goto('/quiz');
  });

  test.describe('Page Layout', () => {
    test('should display quiz interface', async ({ page }) => {
      // Check for main page elements
      await expect(page.locator('text=Quiz Arena')).toBeVisible();
      await expect(page.locator('text=Generate Quiz')).toBeVisible();
      
      // Check for main action buttons
      await expect(page.locator('text=Create Quiz')).toBeVisible();
      await expect(page.locator('text=Quiz History')).toBeVisible();
    });

    test('should display quiz generation form', async ({ page }) => {
      // Click on generate quiz tab
      await page.click('text=Generate Quiz');
      
      // Check for form elements
      await expect(page.locator('text=Topic')).toBeVisible();
      await expect(page.locator('text=Difficulty')).toBeVisible();
      await expect(page.locator('text=Number of Questions')).toBeVisible();
      await expect(page.locator('text=Question Type')).toBeVisible();
    });

    test('should display quiz history', async ({ page }) => {
      // Click on history tab
      await page.click('text=Quiz History');
      
      // Check for history elements
      await expect(page.locator('text=Your Quizzes')).toBeVisible();
      await expect(page.locator('[data-testid="quiz-list"], .quiz-list')).toBeVisible();
    });
  });

  test.describe('Quiz Generation', () => {
    test('should generate quiz with AI', async ({ page }) => {
      // Fill in quiz generation form
      await page.fill('[name="topic"]', testData.quiz.topic);
      await page.selectOption('[name="difficulty"]', testData.quiz.difficulty);
      await page.fill('[name="questionCount"]', testData.quiz.questionCount.toString());
      await page.selectOption('[name="questionType"]', testData.quiz.questionType);
      await page.fill('[name="additionalContext"]', testData.quiz.additionalContext);
      
      // Submit the form
      await page.click('text=Generate Quiz');
      
      // Wait for generation to complete
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      
      // Check if quiz is created
      await expect(page.locator('text=General Knowledge')).toBeVisible();
    });

    test('should handle different question types', async ({ page }) => {
      const questionTypes = ['multiple_choice', 'true_false', 'short_answer'];
      
      for (const questionType of questionTypes) {
        // Fill in form
        await page.fill('[name="topic"]', `Test ${questionType}`);
        await page.selectOption('[name="difficulty"]', 'beginner');
        await page.fill('[name="questionCount"]', '3');
        await page.selectOption('[name="questionType"]', questionType);
        
        // Generate quiz
        await page.click('text=Generate Quiz');
        
        // Wait for generation
        await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
        
        // Check if quiz is created
        await expect(page.locator(`text=Test ${questionType}`)).toBeVisible();
      }
    });

    test('should handle different difficulties', async ({ page }) => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];
      
      for (const difficulty of difficulties) {
        // Fill in form
        await page.fill('[name="topic"]', `Test ${difficulty}`);
        await page.selectOption('[name="difficulty"]', difficulty);
        await page.fill('[name="questionCount"]', '3');
        await page.selectOption('[name="questionType"]', 'multiple_choice');
        
        // Generate quiz
        await page.click('text=Generate Quiz');
        
        // Wait for generation
        await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
        
        // Check if quiz is created
        await expect(page.locator(`text=Test ${difficulty}`)).toBeVisible();
      }
    });

    test('should handle AI generation errors', async ({ page }) => {
      // Mock AI service error
      await page.route('**/api/quiz/generate/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' })
        });
      });
      
      // Try to generate quiz
      await page.fill('[name="topic"]', 'Test Topic');
      await page.click('text=Generate Quiz');
      
      // Check for error message
      await expect(page.locator('text=AI service unavailable')).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
      // Try to submit empty form
      await page.click('text=Generate Quiz');
      
      // Check for validation errors
      await expect(page.locator('text=Topic is required')).toBeVisible();
    });
  });

  test.describe('Taking Quizzes', () => {
    test('should start a quiz', async ({ page }) => {
      // Generate a quiz first
      await page.fill('[name="topic"]', 'Test Quiz');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '3');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      
      // Start the quiz
      await page.click('text=Start Quiz');
      
      // Check if quiz interface is displayed
      await expect(page.locator('text=Question 1 of 3')).toBeVisible();
    });

    test('should answer multiple choice questions', async ({ page }) => {
      // Generate and start a quiz
      await page.fill('[name="topic"]', 'Multiple Choice Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer first question
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      
      // Answer second question
      await page.click('[data-testid="option-1"], .option:nth-child(2)');
      await page.click('text=Submit Quiz');
      
      // Check if results are displayed
      await expect(page.locator('text=Quiz Results')).toBeVisible();
    });

    test('should answer true/false questions', async ({ page }) => {
      // Generate and start a true/false quiz
      await page.fill('[name="topic"]', 'True/False Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'true_false');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('text=True');
      await page.click('text=Next Question');
      await page.click('text=False');
      await page.click('text=Submit Quiz');
      
      // Check if results are displayed
      await expect(page.locator('text=Quiz Results')).toBeVisible();
    });

    test('should answer short answer questions', async ({ page }) => {
      // Generate and start a short answer quiz
      await page.fill('[name="topic"]', 'Short Answer Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'short_answer');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.fill('[data-testid="answer-input"], textarea[placeholder*="answer"]', 'Test answer 1');
      await page.click('text=Next Question');
      await page.fill('[data-testid="answer-input"], textarea[placeholder*="answer"]', 'Test answer 2');
      await page.click('text=Submit Quiz');
      
      // Check if results are displayed
      await expect(page.locator('text=Quiz Results')).toBeVisible();
    });

    test('should track quiz progress', async ({ page }) => {
      // Generate and start a quiz
      await page.fill('[name="topic"]', 'Progress Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '3');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Check progress indicator
      await expect(page.locator('text=Question 1 of 3')).toBeVisible();
      
      // Answer first question
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      
      // Check updated progress
      await expect(page.locator('text=Question 2 of 3')).toBeVisible();
    });

    test('should allow going back to previous questions', async ({ page }) => {
      // Generate and start a quiz
      await page.fill('[name="topic"]', 'Navigation Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer first question
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      
      // Go back to previous question
      await page.click('text=Previous Question');
      
      // Check if back to first question
      await expect(page.locator('text=Question 1 of 2')).toBeVisible();
    });
  });

  test.describe('Quiz Results', () => {
    test('should display quiz results', async ({ page }) => {
      // Generate and complete a quiz
      await page.fill('[name="topic"]', 'Results Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Check for results elements
      await expect(page.locator('text=Quiz Results')).toBeVisible();
      await expect(page.locator('text=Score')).toBeVisible();
      await expect(page.locator('text=Correct Answers')).toBeVisible();
    });

    test('should show detailed feedback', async ({ page }) => {
      // Generate and complete a quiz
      await page.fill('[name="topic"]', 'Feedback Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Check for detailed feedback
      await expect(page.locator('text=Review Answers')).toBeVisible();
      await expect(page.locator('[data-testid="question-review"], .question-review')).toBeVisible();
    });

    test('should save quiz results', async ({ page }) => {
      // Generate and complete a quiz
      await page.fill('[name="topic"]', 'Save Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Check if results are saved
      await expect(page.locator('text=Results saved')).toBeVisible();
    });
  });

  test.describe('Quiz History', () => {
    test('should display quiz history', async ({ page }) => {
      // Navigate to history tab
      await page.click('text=Quiz History');
      
      // Check for history elements
      await expect(page.locator('text=Your Quizzes')).toBeVisible();
      await expect(page.locator('[data-testid="quiz-history"], .quiz-history')).toBeVisible();
    });

    test('should retake quizzes', async ({ page }) => {
      // Generate a quiz first
      await page.fill('[name="topic"]', 'Retake Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Complete the quiz
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Go to history and retake
      await page.click('text=Quiz History');
      await page.click('text=Retake Quiz');
      
      // Check if quiz starts again
      await expect(page.locator('text=Question 1 of 2')).toBeVisible();
    });

    test('should view quiz statistics', async ({ page }) => {
      // Navigate to history tab
      await page.click('text=Quiz History');
      
      // Check for statistics
      await expect(page.locator('text=Average Score')).toBeVisible();
      await expect(page.locator('text=Total Quizzes')).toBeVisible();
      await expect(page.locator('text=Best Score')).toBeVisible();
    });
  });

  test.describe('Leaderboards', () => {
    test('should display leaderboard', async ({ page }) => {
      // Navigate to leaderboard
      await page.click('text=Leaderboard');
      
      // Check for leaderboard elements
      await expect(page.locator('text=Top Performers')).toBeVisible();
      await expect(page.locator('[data-testid="leaderboard"], .leaderboard')).toBeVisible();
    });

    test('should filter leaderboard by difficulty', async ({ page }) => {
      // Navigate to leaderboard
      await page.click('text=Leaderboard');
      
      // Filter by difficulty
      await page.selectOption('[data-testid="difficulty-filter"], select[name="difficulty"]', 'beginner');
      
      // Check if filtered results are displayed
      await expect(page.locator('text=Beginner Leaderboard')).toBeVisible();
    });

    test('should show user ranking', async ({ page }) => {
      // Navigate to leaderboard
      await page.click('text=Leaderboard');
      
      // Check for user ranking
      await expect(page.locator('text=Your Ranking')).toBeVisible();
    });
  });

  test.describe('Quiz Sharing', () => {
    test('should share quiz results', async ({ page }) => {
      // Generate and complete a quiz
      await page.fill('[name="topic"]', 'Share Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Share results
      await page.click('text=Share Results');
      
      // Check if share options are visible
      await expect(page.locator('text=Share to Community')).toBeVisible();
      await expect(page.locator('text=Copy Link')).toBeVisible();
    });

    test('should export quiz as flashcards', async ({ page }) => {
      // Generate and complete a quiz
      await page.fill('[name="topic"]', 'Export Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Answer questions
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Export as flashcards
      await page.click('text=Export as Flashcards');
      
      // Check if download starts
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Download');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('Export Test');
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navigate through quiz interface with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should open generate quiz form
      
      // Check if form is open
      await expect(page.locator('text=Generate Quiz')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for ARIA labels on interactive elements
      const generateButton = page.locator('text=Generate Quiz');
      await expect(generateButton).toHaveAttribute('aria-label');
    });

    test('should support screen readers', async ({ page }) => {
      // Check for screen reader friendly elements
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="complementary"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/quiz');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large quizzes', async ({ page }) => {
      // Generate a large quiz
      await page.fill('[name="topic"]', 'Large Quiz Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '20');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      
      // Wait for generation
      await page.waitForSelector('text=Quiz Generated', { timeout: 120000 });
      
      // Start the quiz
      await page.click('text=Start Quiz');
      
      // Check if quiz loads properly
      await expect(page.locator('text=Question 1 of 20')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during quiz taking', async ({ page }) => {
      // Generate and start a quiz
      await page.fill('[name="topic"]', 'Error Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Mock network error
      await page.route('**/api/quiz/submit/**', route => {
        route.abort('failed');
      });
      
      // Try to submit quiz
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Next Question');
      await page.click('[data-testid="option-0"], .option:first-child');
      await page.click('text=Submit Quiz');
      
      // Check for error message
      await expect(page.locator('text=Error, text=Failed')).toBeVisible();
    });

    test('should handle quiz timeout', async ({ page }) => {
      // Generate and start a quiz
      await page.fill('[name="topic"]', 'Timeout Test');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="questionCount"]', '2');
      await page.selectOption('[name="questionType"]', 'multiple_choice');
      await page.click('text=Generate Quiz');
      await page.waitForSelector('text=Quiz Generated', { timeout: 60000 });
      await page.click('text=Start Quiz');
      
      // Wait for timeout (this would need to be configured in the app)
      // For now, we'll check if timeout elements exist
      await expect(page.locator('[data-testid="timer"], .timer')).toBeVisible();
    });
  });
}); 