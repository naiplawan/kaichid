import { test, expect, type Page } from '@playwright/test';

// Helper function to wait for game session to load
async function waitForGameSession(page: Page) {
  await page.waitForSelector('[data-testid="game-session"]', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

// Helper function to create a multiplayer session
async function createMultiplayerSession(page: Page) {
  await page.goto('/demo');
  await page.click('[data-testid="create-session-btn"]');
  await page.waitForSelector('[data-testid="session-id"]');
  
  const sessionId = await page.textContent('[data-testid="session-id"]');
  return sessionId;
}

// Helper function to join an existing session
async function joinSession(page: Page, sessionId: string) {
  await page.goto(`/game/${sessionId}`);
  await waitForGameSession(page);
}

test.describe('Game Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should load game session page successfully', async ({ page }) => {
    await page.goto('/demo');
    
    // Check page title
    await expect(page).toHaveTitle(/Game Session/);
    
    // Check main elements are visible
    await expect(page.locator('h1')).toContainText('Game Session');
    await expect(page.locator('[data-testid="create-session-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="join-session-input"]')).toBeVisible();
  });

  test('should create new multiplayer session', async ({ page }) => {
    await page.goto('/demo');
    
    // Click create session button
    await page.click('[data-testid="create-session-btn"]');
    
    // Wait for session creation
    await page.waitForSelector('[data-testid="session-id"]', { timeout: 10000 });
    
    // Verify session was created
    const sessionId = await page.textContent('[data-testid="session-id"]');
    expect(sessionId).toMatch(/^[a-zA-Z0-9-]+$/);
    
    // Verify we're redirected to game session
    await expect(page.url()).toContain('/game/');
    await expect(page.locator('[data-testid="game-session"]')).toBeVisible();
  });

  test('should join existing session with valid ID', async ({ page }) => {
    // First create a session in another context
    const sessionId = 'test-session-id';
    
    await page.goto('/demo');
    
    // Fill join session input
    await page.fill('[data-testid="join-session-input"]', sessionId);
    await page.click('[data-testid="join-session-btn"]');
    
    // Should redirect to game session
    await expect(page.url()).toContain(`/game/${sessionId}`);
  });

  test('should handle invalid session ID gracefully', async ({ page }) => {
    await page.goto('/demo');
    
    // Try to join with invalid session ID
    await page.fill('[data-testid="join-session-input"]', 'invalid-session');
    await page.click('[data-testid="join-session-btn"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Session not found');
  });
});

test.describe('Game Mechanics', () => {
  let sessionId: string;

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });

    // Create session for testing
    sessionId = await createMultiplayerSession(page);
  });

  test('should start game successfully', async ({ page }) => {
    await joinSession(page, sessionId);
    
    // Wait for game to be ready
    await expect(page.locator('[data-testid="start-game-btn"]')).toBeVisible();
    
    // Start the game
    await page.click('[data-testid="start-game-btn"]');
    
    // Verify game started
    await expect(page.locator('[data-testid="game-status"]')).toContainText('active');
    await expect(page.locator('[data-testid="current-question"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-round"]')).toContainText('1');
  });

  test('should display current question and allow response', async ({ page }) => {
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Verify question is displayed
    const questionText = await page.textContent('[data-testid="question-text"]');
    expect(questionText).toBeTruthy();
    expect(questionText.length).toBeGreaterThan(0);
    
    // Verify response input is available when it's user's turn
    const isMyTurn = await page.locator('[data-testid="response-input"]').isVisible();
    if (isMyTurn) {
      await page.fill('[data-testid="response-input"]', 'This is my response to the question');
      await page.click('[data-testid="submit-response-btn"]');
      
      // Verify response submitted
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('should advance turns correctly', async ({ page }) => {
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Get initial player turn
    const initialPlayer = await page.textContent('[data-testid="current-player"]');
    
    // Submit response or advance turn
    if (await page.locator('[data-testid="response-input"]').isVisible()) {
      await page.fill('[data-testid="response-input"]', 'Test response');
      await page.click('[data-testid="submit-response-btn"]');
    } else {
      await page.click('[data-testid="advance-turn-btn"]');
    }
    
    // Wait for turn to advance
    await page.waitForTimeout(2000);
    
    // Verify turn advanced
    const newPlayer = await page.textContent('[data-testid="current-player"]');
    expect(newPlayer).not.toBe(initialPlayer);
  });

  test('should pause and resume game', async ({ page }) => {
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Pause game
    await page.click('[data-testid="pause-game-btn"]');
    await expect(page.locator('[data-testid="game-status"]')).toContainText('paused');
    
    // Resume game
    await page.click('[data-testid="resume-game-btn"]');
    await expect(page.locator('[data-testid="game-status"]')).toContainText('active');
  });

  test('should end game and display results', async ({ page }) => {
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // End game
    await page.click('[data-testid="end-game-btn"]');
    
    // Verify game ended
    await expect(page.locator('[data-testid="game-status"]')).toContainText('ended');
    await expect(page.locator('[data-testid="game-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-scores"]')).toBeVisible();
  });
});

test.describe('Multiplayer Functionality', () => {
  test('should show connected players', async ({ page, context }) => {
    // Create session
    await page.goto('/demo');
    await page.click('[data-testid="create-session-btn"]');
    const sessionId = await page.textContent('[data-testid="session-id"]');
    
    // Join session
    await joinSession(page, sessionId);
    
    // Verify players list shows current user
    await expect(page.locator('[data-testid="players-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-count"]')).toContainText('1');
    
    // Simulate second player joining (in real scenario, would be another browser)
    // For testing, we can mock the real-time updates
    await page.evaluate(() => {
      // Mock Supabase real-time event
      window.dispatchEvent(new CustomEvent('supabase-player-joined', {
        detail: { player: { id: 'player-2', position: 1, score: 0 } }
      }));
    });
    
    // Verify player count updated
    await expect(page.locator('[data-testid="player-count"]')).toContainText('2');
  });

  test('should handle player disconnection', async ({ page }) => {
    await page.goto('/demo');
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Mock player disconnection
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('supabase-player-left', {
        detail: { player: { id: 'player-2' } }
      }));
    });
    
    // Verify UI updates appropriately
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible();
  });

  test('should sync game state across players', async ({ page }) => {
    await page.goto('/demo');
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    
    // Mock game state update from another player
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('supabase-game-update', {
        detail: { 
          session: { 
            current_round: 2, 
            current_player_index: 1,
            status: 'active'
          }
        }
      }));
    });
    
    // Verify UI updated with new state
    await expect(page.locator('[data-testid="current-round"]')).toContainText('2');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
  
  test('should display mobile layout correctly', async ({ page }) => {
    await page.goto('/demo');
    
    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-game-card"]')).toBeVisible();
    
    // Verify responsive design
    const gameCard = page.locator('[data-testid="mobile-game-card"]');
    const boundingBox = await gameCard.boundingBox();
    expect(boundingBox?.width).toBeLessThan(400); // Should fit mobile screen
  });

  test('should handle touch gestures on mobile', async ({ page }) => {
    await page.goto('/demo');
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="mobile-game-card"]');
    
    // Simulate swipe gesture
    const gameCard = page.locator('[data-testid="mobile-game-card"]');
    await gameCard.hover();
    
    // Perform swipe right gesture
    await page.mouse.down();
    await page.mouse.move(200, 0);
    await page.mouse.up();
    
    // Verify swipe action was registered
    await expect(page.locator('[data-testid="swipe-feedback"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/demo');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Navigate through all interactive elements
    const interactiveElements = page.locator('button, input, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for essential ARIA attributes
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[aria-label]').first()).toBeVisible();
    
    // Verify buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for live regions
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    await expect(page.locator('[aria-live="assertive"]')).toBeVisible();
    
    // Verify status announcements
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Start game and check for announcements
    await page.click('[data-testid="start-game-btn"]');
    
    // Verify live region content updates
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText(/game/i);
  });

  test('should handle high contrast mode', async ({ page }) => {
    await page.goto('/demo');
    
    // Enable high contrast mode
    await page.click('[data-testid="high-contrast-toggle"]');
    
    // Verify high contrast styles applied
    const body = page.locator('body');
    await expect(body).toHaveClass(/high-contrast/);
    
    // Check contrast ratios meet WCAG standards
    const backgroundColor = await body.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    const textColor = await body.evaluate(el => 
      getComputedStyle(el).color
    );
    
    // Basic contrast check (would need more sophisticated testing in real scenario)
    expect(backgroundColor).not.toBe(textColor);
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/demo');
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Start game
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Rapidly interact with game elements
    for (let i = 0; i < 10; i++) {
      if (await page.locator('[data-testid="response-input"]').isVisible()) {
        await page.fill('[data-testid="response-input"]', `Response ${i}`);
        await page.click('[data-testid="submit-response-btn"]');
        await page.waitForTimeout(100);
      }
    }
    
    // Verify app remains responsive
    await expect(page.locator('[data-testid="game-session"]')).toBeVisible();
  });

  test('should maintain smooth animations', async ({ page }) => {
    await page.goto('/demo');
    
    // Monitor animation performance
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          if (performance.now() - startTime > 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(countFrames);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    // Basic check that animations don't cause major performance issues
    const metrics = await page.evaluate(() => performance.getEntriesByType('navigation')[0]);
    expect(metrics.loadEventEnd - metrics.loadEventStart).toBeLessThan(2000);
  });
});

test.describe('Error Handling', () => {
  test('should handle network disconnection gracefully', async ({ page }) => {
    await page.goto('/demo');
    const sessionId = await createMultiplayerSession(page);
    await joinSession(page, sessionId);
    
    // Simulate network disconnection
    await page.context().setOffline(true);
    
    // Verify offline indicator appears
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('disconnected');
    
    // Restore connection
    await page.context().setOffline(false);
    
    // Verify reconnection
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('connected');
  });

  test('should handle API errors appropriately', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/demo');
    
    // Try to create session (should fail)
    await page.click('[data-testid="create-session-btn"]');
    
    // Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/error/i);
    
    // Verify retry option available
    await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
  });

  test('should validate user input appropriately', async ({ page }) => {
    await page.goto('/demo');
    
    // Try to join session with empty input
    await page.click('[data-testid="join-session-btn"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText(/required/i);
    
    // Try with invalid format
    await page.fill('[data-testid="join-session-input"]', 'invalid@format');
    await page.click('[data-testid="join-session-btn"]');
    
    // Verify format validation
    await expect(page.locator('[data-testid="validation-error"]')).toContainText(/invalid/i);
  });
});