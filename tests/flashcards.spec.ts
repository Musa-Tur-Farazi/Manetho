import { test, expect } from './utils/test-utils';
import { testUsers, testData } from './utils/test-utils';

test.describe('Flashcards', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Sign in before each test
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
    await page.goto('/tools/flashcards');
  });

  test.describe('Page Layout', () => {
    test('should display flashcards interface', async ({ page }) => {
      // Check for main page elements
      await expect(page.locator('text=Flashcards')).toBeVisible();
      await expect(page.locator('text=Study Tools')).toBeVisible();
      
      // Check for main action buttons
      await expect(page.locator('text=Create Deck')).toBeVisible();
      await expect(page.locator('text=Add Card')).toBeVisible();
      await expect(page.locator('text=AI Generate')).toBeVisible();
    });

    test('should display deck list', async ({ page }) => {
      // Check for deck management section
      await expect(page.locator('text=My Decks')).toBeVisible();
      
      // Check for deck list container
      const deckList = page.locator('[data-testid="deck-list"], .deck-list');
      await expect(deckList).toBeVisible();
    });

    test('should display card list', async ({ page }) => {
      // Check for cards section
      await expect(page.locator('text=My Cards')).toBeVisible();
      
      // Check for card list container
      const cardList = page.locator('[data-testid="card-list"], .card-list');
      await expect(cardList).toBeVisible();
    });
  });

  test.describe('Deck Management', () => {
    test('should create new deck', async ({ page }) => {
      // Click create deck button
      await page.click('text=Create Deck');
      
      // Fill in deck details
      await page.fill('[name="name"]', 'Test Deck');
      await page.fill('[name="description"]', 'A test deck for E2E testing');
      await page.selectOption('[name="color"]', 'blue');
      await page.check('[name="isPublic"]');
      
      // Submit the form
      await page.click('text=Create Deck');
      
      // Check if deck is created
      await expect(page.locator('text=Test Deck')).toBeVisible();
    });

    test('should edit existing deck', async ({ page }) => {
      // Create a deck first
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Original Deck');
      await page.fill('[name="description"]', 'Original description');
      await page.click('text=Create Deck');
      
      // Edit the deck
      await page.click('[data-testid="edit-deck"], .edit-deck');
      await page.fill('[name="name"]', 'Updated Deck');
      await page.fill('[name="description"]', 'Updated description');
      await page.click('text=Update Deck');
      
      // Check if deck is updated
      await expect(page.locator('text=Updated Deck')).toBeVisible();
    });

    test('should delete deck', async ({ page }) => {
      // Create a deck first
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Deck to Delete');
      await page.fill('[name="description"]', 'This deck will be deleted');
      await page.click('text=Create Deck');
      
      // Delete the deck
      await page.click('[data-testid="delete-deck"], .delete-deck');
      await page.click('text=Delete');
      
      // Check if deck is deleted
      await expect(page.locator('text=Deck to Delete')).not.toBeVisible();
    });

    test('should display deck statistics', async ({ page }) => {
      // Create a deck with cards
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Statistics Deck');
      await page.click('text=Create Deck');
      
      // Add a card to the deck
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Test question');
      await page.fill('[name="answer"]', 'Test answer');
      await page.selectOption('[name="deckId"]', 'Statistics Deck');
      await page.click('text=Create Card');
      
      // Check for deck statistics
      await expect(page.locator('text=1 card')).toBeVisible();
    });

    test('should filter decks', async ({ page }) => {
      // Create multiple decks
      for (let i = 1; i <= 3; i++) {
        await page.click('text=Create Deck');
        await page.fill('[name="name"]', `Deck ${i}`);
        await page.click('text=Create Deck');
      }
      
      // Search for a specific deck
      await page.fill('[data-testid="search-input"], input[placeholder*="search"]', 'Deck 2');
      
      // Check if only Deck 2 is visible
      await expect(page.locator('text=Deck 2')).toBeVisible();
      await expect(page.locator('text=Deck 1')).not.toBeVisible();
      await expect(page.locator('text=Deck 3')).not.toBeVisible();
    });
  });

  test.describe('Card Management', () => {
    test('should create new card', async ({ page }) => {
      // Create a deck first
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Test Deck');
      await page.click('text=Create Deck');
      
      // Click add card button
      await page.click('text=Add Card');
      
      // Fill in card details
      await page.fill('[name="question"]', testData.flashcard.question);
      await page.fill('[name="answer"]', testData.flashcard.answer);
      await page.fill('[name="hint"]', testData.flashcard.hint);
      await page.fill('[name="explanation"]', testData.flashcard.explanation);
      await page.selectOption('[name="difficulty"]', testData.flashcard.difficulty);
      await page.selectOption('[name="deckId"]', 'Test Deck');
      
      // Submit the form
      await page.click('text=Create Card');
      
      // Check if card is created
      await expect(page.locator('text=What is the capital of France?')).toBeVisible();
    });

    test('should edit existing card', async ({ page }) => {
      // Create a card first
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Original question');
      await page.fill('[name="answer"]', 'Original answer');
      await page.click('text=Create Card');
      
      // Edit the card
      await page.click('[data-testid="edit-card"], .edit-card');
      await page.fill('[name="question"]', 'Updated question');
      await page.fill('[name="answer"]', 'Updated answer');
      await page.click('text=Update Card');
      
      // Check if card is updated
      await expect(page.locator('text=Updated question')).toBeVisible();
    });

    test('should delete card', async ({ page }) => {
      // Create a card first
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Card to Delete');
      await page.fill('[name="answer"]', 'This card will be deleted');
      await page.click('text=Create Card');
      
      // Delete the card
      await page.click('[data-testid="delete-card"], .delete-card');
      await page.click('text=Delete');
      
      // Check if card is deleted
      await expect(page.locator('text=Card to Delete')).not.toBeVisible();
    });

    test('should move cards between decks', async ({ page }) => {
      // Create two decks
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Deck 1');
      await page.click('text=Create Deck');
      
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Deck 2');
      await page.click('text=Create Deck');
      
      // Create a card in Deck 1
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Moveable card');
      await page.fill('[name="answer"]', 'This card will be moved');
      await page.selectOption('[name="deckId"]', 'Deck 1');
      await page.click('text=Create Card');
      
      // Move card to Deck 2
      await page.click('[data-testid="move-card"], .move-card');
      await page.selectOption('[name="targetDeck"]', 'Deck 2');
      await page.click('text=Move Card');
      
      // Check if card is moved
      await page.click('text=Deck 2');
      await expect(page.locator('text=Moveable card')).toBeVisible();
    });

    test('should display card statistics', async ({ page }) => {
      // Create a card
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Statistics card');
      await page.fill('[name="answer"]', 'Statistics answer');
      await page.click('text=Create Card');
      
      // Check for card statistics
      await expect(page.locator('text=0 reviews')).toBeVisible();
      await expect(page.locator('text=0% accuracy')).toBeVisible();
    });
  });

  test.describe('Study Sessions', () => {
    test('should start study session', async ({ page }) => {
      // Create a deck with cards
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Study Deck');
      await page.click('text=Create Deck');
      
      // Add a card
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Study question');
      await page.fill('[name="answer"]', 'Study answer');
      await page.selectOption('[name="deckId"]', 'Study Deck');
      await page.click('text=Create Card');
      
      // Start study session
      await page.click('text=Study Deck');
      await page.click('text=Start Studying');
      
      // Check if study mode is active
      await expect(page.locator('text=Study Mode')).toBeVisible();
      await expect(page.locator('text=Study question')).toBeVisible();
    });

    test('should show answer in study mode', async ({ page }) => {
      // Create and start study session
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Study Deck');
      await page.click('text=Create Deck');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Study question');
      await page.fill('[name="answer"]', 'Study answer');
      await page.selectOption('[name="deckId"]', 'Study Deck');
      await page.click('text=Create Card');
      
      await page.click('text=Study Deck');
      await page.click('text=Start Studying');
      
      // Show answer
      await page.click('text=Show Answer');
      
      // Check if answer is visible
      await expect(page.locator('text=Study answer')).toBeVisible();
    });

    test('should mark card as correct/incorrect', async ({ page }) => {
      // Create and start study session
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Study Deck');
      await page.click('text=Create Deck');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Study question');
      await page.fill('[name="answer"]', 'Study answer');
      await page.selectOption('[name="deckId"]', 'Study Deck');
      await page.click('text=Create Card');
      
      await page.click('text=Study Deck');
      await page.click('text=Start Studying');
      
      // Mark as correct
      await page.click('text=Correct');
      
      // Check if statistics are updated
      await expect(page.locator('text=1 correct')).toBeVisible();
    });

    test('should track study progress', async ({ page }) => {
      // Create study session with multiple cards
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Progress Deck');
      await page.click('text=Create Deck');
      
      // Add multiple cards
      for (let i = 1; i <= 3; i++) {
        await page.click('text=Add Card');
        await page.fill('[name="question"]', `Question ${i}`);
        await page.fill('[name="answer"]', `Answer ${i}`);
        await page.selectOption('[name="deckId"]', 'Progress Deck');
        await page.click('text=Create Card');
      }
      
      // Start studying
      await page.click('text=Progress Deck');
      await page.click('text=Start Studying');
      
      // Answer first card
      await page.click('text=Correct');
      
      // Check progress
      await expect(page.locator('text=1 of 3')).toBeVisible();
    });

    test('should end study session', async ({ page }) => {
      // Create and start study session
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'End Deck');
      await page.click('text=Create Deck');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'End question');
      await page.fill('[name="answer"]', 'End answer');
      await page.selectOption('[name="deckId"]', 'End Deck');
      await page.click('text=Create Card');
      
      await page.click('text=End Deck');
      await page.click('text=Start Studying');
      
      // End session
      await page.click('text=End Session');
      
      // Check if back to deck view
      await expect(page.locator('text=End Deck')).toBeVisible();
    });
  });

  test.describe('AI Generation', () => {
    test('should generate flashcards with AI', async ({ page }) => {
      // Click AI generate button
      await page.click('text=AI Generate');
      
      // Fill in generation form
      await page.fill('[name="topic"]', 'JavaScript Basics');
      await page.fill('[name="subject"]', 'Programming');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.fill('[name="count"]', '5');
      await page.fill('[name="additionalContext"]', 'Focus on fundamental concepts');
      
      // Submit the form
      await page.click('text=Generate Cards');
      
      // Wait for generation to complete
      await page.waitForSelector('text=Generated', { timeout: 60000 });
      
      // Check if cards are generated
      await expect(page.locator('text=JavaScript')).toBeVisible();
    });

    test('should handle AI generation errors', async ({ page }) => {
      // Mock AI service error
      await page.route('**/api/flashcards/generate/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' })
        });
      });
      
      // Try to generate cards
      await page.click('text=AI Generate');
      await page.fill('[name="topic"]', 'Test Topic');
      await page.click('text=Generate Cards');
      
      // Check for error message
      await expect(page.locator('text=AI service unavailable')).toBeVisible();
    });
  });

  test.describe('Search and Filtering', () => {
    test('should search cards', async ({ page }) => {
      // Create cards with different content
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Math question');
      await page.fill('[name="answer"]', 'Math answer');
      await page.click('text=Create Card');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Science question');
      await page.fill('[name="answer"]', 'Science answer');
      await page.click('text=Create Card');
      
      // Search for math cards
      await page.fill('[data-testid="search-input"], input[placeholder*="search"]', 'Math');
      
      // Check if only math card is visible
      await expect(page.locator('text=Math question')).toBeVisible();
      await expect(page.locator('text=Science question')).not.toBeVisible();
    });

    test('should filter by difficulty', async ({ page }) => {
      // Create cards with different difficulties
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Easy question');
      await page.fill('[name="answer"]', 'Easy answer');
      await page.selectOption('[name="difficulty"]', 'beginner');
      await page.click('text=Create Card');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Hard question');
      await page.fill('[name="answer"]', 'Hard answer');
      await page.selectOption('[name="difficulty"]', 'advanced');
      await page.click('text=Create Card');
      
      // Filter by beginner difficulty
      await page.selectOption('[data-testid="difficulty-filter"], select[name="difficulty"]', 'beginner');
      
      // Check if only beginner card is visible
      await expect(page.locator('text=Easy question')).toBeVisible();
      await expect(page.locator('text=Hard question')).not.toBeVisible();
    });

    test('should filter by deck', async ({ page }) => {
      // Create two decks
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Deck A');
      await page.click('text=Create Deck');
      
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Deck B');
      await page.click('text=Create Deck');
      
      // Add cards to different decks
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Deck A card');
      await page.selectOption('[name="deckId"]', 'Deck A');
      await page.click('text=Create Card');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Deck B card');
      await page.selectOption('[name="deckId"]', 'Deck B');
      await page.click('text=Create Card');
      
      // Filter by Deck A
      await page.selectOption('[data-testid="deck-filter"], select[name="deck"]', 'Deck A');
      
      // Check if only Deck A card is visible
      await expect(page.locator('text=Deck A card')).toBeVisible();
      await expect(page.locator('text=Deck B card')).not.toBeVisible();
    });
  });

  test.describe('Statistics and Analytics', () => {
    test('should display study statistics', async ({ page }) => {
      // Create and study some cards
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Stats Deck');
      await page.click('text=Create Deck');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Stats question');
      await page.fill('[name="answer"]', 'Stats answer');
      await page.selectOption('[name="deckId"]', 'Stats Deck');
      await page.click('text=Create Card');
      
      // Study the card
      await page.click('text=Stats Deck');
      await page.click('text=Start Studying');
      await page.click('text=Correct');
      
      // Check statistics
      await expect(page.locator('text=Study Statistics')).toBeVisible();
      await expect(page.locator('text=100% accuracy')).toBeVisible();
    });

    test('should track study streaks', async ({ page }) => {
      // This would require multiple study sessions over time
      // For now, we'll check if streak tracking elements exist
      await expect(page.locator('text=Study Streak')).toBeVisible();
    });
  });

  test.describe('Export and Import', () => {
    test('should export deck', async ({ page }) => {
      // Create a deck with cards
      await page.click('text=Create Deck');
      await page.fill('[name="name"]', 'Export Deck');
      await page.click('text=Create Deck');
      
      await page.click('text=Add Card');
      await page.fill('[name="question"]', 'Export question');
      await page.fill('[name="answer"]', 'Export answer');
      await page.selectOption('[name="deckId"]', 'Export Deck');
      await page.click('text=Create Card');
      
      // Export the deck
      await page.click('[data-testid="export-deck"], .export-deck');
      
      // Check if download starts
      const downloadPromise = page.waitForEvent('download');
      await page.click('text=Export');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('Export Deck');
    });

    test('should import deck', async ({ page }) => {
      // Click import button
      await page.click('[data-testid="import-deck"], .import-deck');
      
      // Upload a test file
      const testFile = {
        name: 'test-deck.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({
          name: 'Imported Deck',
          cards: [
            { question: 'Imported question', answer: 'Imported answer' }
          ]
        }))
      };
      
      await page.setInputFiles('input[type="file"]', {
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      // Check if deck is imported
      await expect(page.locator('text=Imported Deck')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navigate through interface with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should open create deck modal
      
      // Check if modal is open
      await expect(page.locator('text=Create Deck')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for ARIA labels on interactive elements
      const createButton = page.locator('text=Create Deck');
      await expect(createButton).toHaveAttribute('aria-label');
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/tools/flashcards');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large numbers of cards', async ({ page }) => {
      // Create many cards quickly
      for (let i = 1; i <= 10; i++) {
        await page.click('text=Add Card');
        await page.fill('[name="question"]', `Card ${i}`);
        await page.fill('[name="answer"]', `Answer ${i}`);
        await page.click('text=Create Card');
        await page.waitForTimeout(100); // Small delay
      }
      
      // Check if all cards are displayed
      for (let i = 1; i <= 10; i++) {
        await expect(page.locator(`text=Card ${i}`)).toBeVisible();
      }
    });
  });
}); 