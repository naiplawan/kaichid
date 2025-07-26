import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to inject axe-core
async function injectAxe(page: Page) {
  await page.addScriptTag({
    url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js'
  });
}

// Helper to run accessibility scan
async function runAccessibilityScan(page: Page, options: any = {}) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  
  return results;
}

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should pass WCAG 2.1 AA compliance on home page', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await runAccessibilityScan(page);
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass WCAG 2.1 AA compliance on game session page', async ({ page }) => {
    await page.goto('/demo');
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    const accessibilityScanResults = await runAccessibilityScan(page);
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // Check heading sequence
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingTexts = await headings.allTextContents();
    
    // Verify headings are not empty
    headingTexts.forEach(text => {
      expect(text.trim()).not.toBe('');
    });
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/demo');
    
    // Test with axe-core color contrast rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="main-content"]')
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/demo');
    
    // Start from first focusable element
    await page.keyboard.press('Tab');
    
    let focusedElements = [];
    let currentFocus = page.locator(':focus');
    
    // Navigate through all focusable elements
    for (let i = 0; i < 20; i++) {
      if (await currentFocus.count() > 0) {
        const tagName = await currentFocus.evaluate(el => el.tagName);
        const ariaLabel = await currentFocus.getAttribute('aria-label');
        const textContent = await currentFocus.textContent();
        
        focusedElements.push({
          tagName,
          ariaLabel,
          textContent: textContent?.slice(0, 50)
        });
        
        // Verify element is visible and focusable
        await expect(currentFocus).toBeVisible();
        await expect(currentFocus).toBeFocused();
      }
      
      await page.keyboard.press('Tab');
      currentFocus = page.locator(':focus');
    }
    
    // Verify we navigated through multiple elements
    expect(focusedElements.length).toBeGreaterThan(3);
  });

  test('should handle focus trapping in modal dialogs', async ({ page }) => {
    await page.goto('/demo');
    
    // Open a modal (assuming settings modal exists)
    if (await page.locator('[data-testid="settings-btn"]').isVisible()) {
      await page.click('[data-testid="settings-btn"]');
      
      // Verify modal is open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Test focus trapping
      const modal = page.locator('[role="dialog"]');
      const focusableElements = modal.locator('button, input, select, textarea, [tabindex="0"]');
      const firstElement = focusableElements.first();
      const lastElement = focusableElements.last();
      
      // Focus should be on first element
      await expect(firstElement).toBeFocused();
      
      // Tab to last element
      const count = await focusableElements.count();
      for (let i = 0; i < count - 1; i++) {
        await page.keyboard.press('Tab');
      }
      
      await expect(lastElement).toBeFocused();
      
      // Tab from last should go to first
      await page.keyboard.press('Tab');
      await expect(firstElement).toBeFocused();
      
      // Shift+Tab from first should go to last
      await page.keyboard.press('Shift+Tab');
      await expect(lastElement).toBeFocused();
    }
  });

  test('should provide screen reader announcements', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    await expect(liveRegions).toHaveCount(2); // Should have polite and assertive regions
    
    // Check specific live region attributes
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
    await expect(page.locator('[aria-live="assertive"]')).toBeVisible();
    
    // Test game state announcements
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="session-id"]');
    
    // Check if announcement was made
    const politeRegion = page.locator('[aria-live="polite"]');
    const regionContent = await politeRegion.textContent();
    expect(regionContent).toBeTruthy();
  });

  test('should have proper form labels and validation', async ({ page }) => {
    await page.goto('/demo');
    
    // Test join session form
    const joinInput = page.locator('[data-testid="join-session-input"]');
    
    // Verify input has proper labeling
    const ariaLabel = await joinInput.getAttribute('aria-label');
    const associatedLabel = await joinInput.getAttribute('aria-labelledby');
    
    expect(ariaLabel || associatedLabel).toBeTruthy();
    
    // Test form validation
    await page.click('[data-testid="join-session-btn"]');
    
    // Check for validation message
    const validationMessage = page.locator('[role="alert"], [aria-live="assertive"]');
    await expect(validationMessage).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/demo');
    
    // Check that animations are reduced/disabled
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    
    if (await animatedElements.count() > 0) {
      // Verify reduced motion styles are applied
      const computedStyle = await animatedElements.first().evaluate(el => {
        return getComputedStyle(el).animationDuration;
      });
      
      // Should be 0s or very short for reduced motion
      expect(['0s', '0.01s'].some(duration => computedStyle.includes(duration))).toBe(true);
    }
  });

  test('should have accessible button names', async ({ page }) => {
    await page.goto('/demo');
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      
      // Check for accessible name
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      const textContent = await button.textContent();
      const title = await button.getAttribute('title');
      
      const hasAccessibleName = ariaLabel || ariaLabelledBy || textContent?.trim() || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    await page.goto('/demo');
    
    // Enable high contrast if toggle exists
    const highContrastToggle = page.locator('[data-testid="high-contrast-toggle"]');
    
    if (await highContrastToggle.isVisible()) {
      await highContrastToggle.click();
      
      // Verify high contrast mode is applied
      const body = page.locator('body');
      const hasHighContrastClass = await body.evaluate(el => 
        el.classList.contains('high-contrast')
      );
      
      expect(hasHighContrastClass).toBe(true);
      
      // Test contrast after enabling high contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    }
  });

  test('should support font size adjustments', async ({ page }) => {
    await page.goto('/demo');
    
    // Test font size controls if they exist
    const increaseFontBtn = page.locator('[data-testid="increase-font-btn"]');
    const decreaseFontBtn = page.locator('[data-testid="decrease-font-btn"]');
    
    if (await increaseFontBtn.isVisible()) {
      // Get initial font size
      const initialFontSize = await page.evaluate(() => 
        getComputedStyle(document.documentElement).fontSize
      );
      
      // Increase font size
      await increaseFontBtn.click();
      
      // Verify font size increased
      const newFontSize = await page.evaluate(() => 
        getComputedStyle(document.documentElement).fontSize
      );
      
      expect(parseFloat(newFontSize)).toBeGreaterThan(parseFloat(initialFontSize));
      
      // Test decrease
      await decreaseFontBtn.click();
      
      const decreasedFontSize = await page.evaluate(() => 
        getComputedStyle(document.documentElement).fontSize
      );
      
      expect(parseFloat(decreasedFontSize)).toBeLessThan(parseFloat(newFontSize));
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should be accessible on mobile devices', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Run accessibility scan on mobile
    const accessibilityScanResults = await runAccessibilityScan(page);
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have appropriate touch targets', async ({ page }) => {
    await page.goto('/demo');
    
    const touchTargets = page.locator('button, a, input, [role="button"]');
    const count = await touchTargets.count();
    
    for (let i = 0; i < count; i++) {
      const target = touchTargets.nth(i);
      const boundingBox = await target.boundingBox();
      
      if (boundingBox) {
        // WCAG recommends minimum 44x44px touch targets
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support swipe gestures with proper announcements', async ({ page }) => {
    await page.goto('/demo');
    
    // Create session and start game
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="mobile-game-card"]');
      
      // Test swipe gesture on game card
      const gameCard = page.locator('[data-testid="mobile-game-card"]');
      
      // Perform swipe gesture
      await gameCard.hover();
      await page.mouse.down();
      await page.mouse.move(100, 0);
      await page.mouse.up();
      
      // Check for swipe announcement in live region
      const liveRegion = page.locator('[aria-live="polite"]');
      const announcement = await liveRegion.textContent();
      expect(announcement).toContain('swipe');
    }
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should provide comprehensive ARIA labels', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for essential ARIA landmarks
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    
    // Check for proper ARIA attributes on interactive elements
    const interactiveElements = page.locator('button, input, select, [role="button"], [role="tab"]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      
      // Each interactive element should have an accessible name
      const accessibleName = await element.evaluate(el => {
        return el.getAttribute('aria-label') || 
               el.getAttribute('aria-labelledby') || 
               el.textContent?.trim() ||
               el.getAttribute('title');
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/demo');
    
    // Monitor live region for announcements
    const announcements = [];
    
    await page.evaluate(() => {
      const liveRegion = document.querySelector('[aria-live="polite"]');
      if (liveRegion) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              window.__testAnnouncements = window.__testAnnouncements || [];
              window.__testAnnouncements.push(liveRegion.textContent);
            }
          });
        });
        
        observer.observe(liveRegion, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    });
    
    // Trigger actions that should create announcements
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForTimeout(1000);
    
    // Check for announcements
    const testAnnouncements = await page.evaluate(() => window.__testAnnouncements || []);
    expect(testAnnouncements.length).toBeGreaterThan(0);
  });

  test('should have proper table accessibility if tables exist', async ({ page }) => {
    await page.goto('/demo');
    
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        
        // Tables should have captions or aria-label
        const hasCaption = await table.locator('caption').count() > 0;
        const hasAriaLabel = await table.getAttribute('aria-label');
        
        expect(hasCaption || hasAriaLabel).toBeTruthy();
        
        // Check for proper header structure
        const headers = table.locator('th');
        if (await headers.count() > 0) {
          // Headers should have scope attribute
          const firstHeader = headers.first();
          const scope = await firstHeader.getAttribute('scope');
          expect(['col', 'row', 'colgroup', 'rowgroup'].includes(scope || '')).toBeTruthy();
        }
      }
    }
  });

  test('should handle form validation with screen reader support', async ({ page }) => {
    await page.goto('/demo');
    
    // Test form validation
    const joinInput = page.locator('[data-testid="join-session-input"]');
    const submitBtn = page.locator('[data-testid="join-session-btn"]');
    
    // Submit empty form
    await submitBtn.click();
    
    // Check for validation message
    const validationMessage = page.locator('[role="alert"], [aria-describedby], [aria-invalid="true"] + *');
    
    if (await validationMessage.count() > 0) {
      await expect(validationMessage).toBeVisible();
      
      // Validation message should be associated with input
      const inputAriaDescribedBy = await joinInput.getAttribute('aria-describedby');
      const messageId = await validationMessage.getAttribute('id');
      
      if (inputAriaDescribedBy && messageId) {
        expect(inputAriaDescribedBy).toContain(messageId);
      }
    }
  });
});

test.describe('Accessibility in Game Context', () => {
  test('should provide accessible game card interactions', async ({ page }) => {
    await page.goto('/demo');
    
    // Create session and start game
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="current-question"]');
      
      // Check game card accessibility
      const gameCard = page.locator('[data-testid="current-question"]');
      await expect(gameCard).toHaveAttribute('role', 'article');
      
      // Should have proper ARIA label
      const ariaLabel = await gameCard.getAttribute('aria-label');
      expect(ariaLabel).toContain('game card');
      
      // Should be keyboard navigable
      await gameCard.focus();
      await expect(gameCard).toBeFocused();
      
      // Test keyboard interactions
      await page.keyboard.press('ArrowRight');
      
      // Should announce swipe action
      const liveRegion = page.locator('[aria-live="polite"]');
      const announcement = await liveRegion.textContent();
      expect(announcement).toBeTruthy();
    }
  });

  test('should provide accessible player status information', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="players-list"]');
    
    // Check players list accessibility
    const playersList = page.locator('[data-testid="players-list"]');
    await expect(playersList).toHaveAttribute('role', 'region');
    await expect(playersList).toHaveAttribute('aria-label', /players/i);
    
    // Check individual player items
    const playerItems = playersList.locator('[role="listitem"]');
    const playerCount = await playerItems.count();
    
    for (let i = 0; i < playerCount; i++) {
      const player = playerItems.nth(i);
      const ariaLabel = await player.getAttribute('aria-label');
      
      // Should describe player status
      expect(ariaLabel).toContain('Player');
      expect(ariaLabel).toContain('Score');
    }
  });

  test('should handle game state changes accessibly', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    // Monitor for game state announcements
    const gameStatus = page.locator('[data-testid="game-status"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      // Start game
      await page.click('[data-testid="start-game-btn"]');
      
      // Should announce game started
      await expect(gameStatus).toContainText('active');
      
      // Should have live region announcement
      const liveRegion = page.locator('[aria-live="assertive"]');
      await expect(liveRegion).toContainText(/game/i);
    }
    
    // Test pause/resume if available
    if (await page.locator('[data-testid="pause-game-btn"]').isVisible()) {
      await page.click('[data-testid="pause-game-btn"]');
      await expect(gameStatus).toContainText('paused');
      
      // Should announce pause
      const pauseAnnouncement = await page.locator('[aria-live="assertive"]').textContent();
      expect(pauseAnnouncement).toContain('pause');
    }
  });
});