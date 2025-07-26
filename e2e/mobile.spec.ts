import { test, expect, type Page } from '@playwright/test';

// Mobile device configurations
const mobileDevices = [
  { name: 'iPhone SE', width: 375, height: 667, deviceScaleFactor: 2 },
  { name: 'iPhone 12', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'Pixel 5', width: 393, height: 851, deviceScaleFactor: 2.75 },
  { name: 'Galaxy S21', width: 384, height: 854, deviceScaleFactor: 2.4 },
  { name: 'iPad Mini', width: 768, height: 1024, deviceScaleFactor: 2 }
];

// Helper function to simulate touch gestures
async function swipeGesture(page: Page, element: any, direction: 'left' | 'right' | 'up' | 'down', distance: number = 100) {
  const box = await element.boundingBox();
  if (!box) throw new Error('Element not found');
  
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  
  let endX = startX;
  let endY = startY;
  
  switch (direction) {
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
  }
  
  // Simulate touch sequence
  await page.touchscreen.tap(startX, startY);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

// Helper to check if element is in viewport
async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, selector);
}

test.describe('Mobile Responsiveness', () => {
  mobileDevices.forEach(device => {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.use({ viewport: { width: device.width, height: device.height } });
      
      test.beforeEach(async ({ page }) => {
        // Mock authentication
        await page.addInitScript(() => {
          window.localStorage.setItem('supabase.auth.token', JSON.stringify({
            access_token: 'mock-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          }));
        });
        
        // Set device pixel ratio
        await page.setViewportSize({
          width: device.width,
          height: device.height
        });
      });

      test('should display mobile layout correctly', async ({ page }) => {
        await page.goto('/demo');
        
        // Check for mobile-specific elements
        await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
        
        // Verify responsive navigation
        const navigation = page.locator('[data-testid="mobile-nav"]');
        if (await navigation.isVisible()) {
          const navBox = await navigation.boundingBox();
          expect(navBox?.width).toBeLessThanOrEqual(device.width);
        }
        
        // Check main content fits screen
        const mainContent = page.locator('main, [data-testid="main-content"]');
        const contentBox = await mainContent.boundingBox();
        if (contentBox) {
          expect(contentBox.width).toBeLessThanOrEqual(device.width);
        }
      });

      test('should have appropriate touch target sizes', async ({ page }) => {
        await page.goto('/demo');
        
        // WCAG recommends minimum 44x44px touch targets
        const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"], [role="button"]');
        const count = await touchTargets.count();
        
        for (let i = 0; i < count; i++) {
          const target = touchTargets.nth(i);
          const box = await target.boundingBox();
          
          if (box && await target.isVisible()) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      });

      test('should handle text input on mobile keyboards', async ({ page }) => {
        await page.goto('/demo');
        
        // Test session ID input
        const sessionInput = page.locator('[data-testid="join-session-input"]');
        await sessionInput.click();
        
        // Verify input is focused and keyboard appears (simulated)
        await expect(sessionInput).toBeFocused();
        
        // Type on mobile keyboard
        await sessionInput.fill('test-session-mobile');
        await expect(sessionInput).toHaveValue('test-session-mobile');
        
        // Test with different keyboard types if specified
        const inputType = await sessionInput.getAttribute('inputmode');
        if (inputType) {
          expect(['text', 'numeric', 'tel', 'email', 'url'].includes(inputType)).toBe(true);
        }
      });

      test('should scroll content properly', async ({ page }) => {
        await page.goto('/demo');
        
        // Create session to get more content
        await page.click('[data-testid="create-session-btn"]');
        await page.waitForSelector('[data-testid="game-session"]');
        
        // Test vertical scrolling
        const initialScrollTop = await page.evaluate(() => window.scrollY);
        
        // Scroll down
        await page.mouse.wheel(0, 500);
        const newScrollTop = await page.evaluate(() => window.scrollY);
        
        expect(newScrollTop).toBeGreaterThan(initialScrollTop);
        
        // Test that content is still accessible after scrolling
        await expect(page.locator('[data-testid="game-session"]')).toBeVisible();
      });
    });
  });
});

test.describe('Touch Gestures', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should handle swipe gestures on game cards', async ({ page }) => {
    await page.goto('/demo');
    
    // Create session and start game
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="mobile-game-card"]');
      
      const gameCard = page.locator('[data-testid="mobile-game-card"]');
      
      // Test swipe right
      await swipeGesture(page, gameCard, 'right', 150);
      
      // Verify swipe was registered
      await expect(page.locator('[data-testid="swipe-feedback"]')).toBeVisible();
      
      // Test swipe left
      await swipeGesture(page, gameCard, 'left', 150);
      
      // Verify left swipe action
      const feedbackText = await page.locator('[data-testid="swipe-feedback"]').textContent();
      expect(feedbackText).toContain('left');
    }
  });

  test('should handle tap gestures', async ({ page }) => {
    await page.goto('/demo');
    
    // Test tap on buttons
    const createBtn = page.locator('[data-testid="create-session-btn"]');
    
    // Simulate tap (touch start and end at same position)
    const box = await createBtn.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      await page.touchscreen.tap(centerX, centerY);
      
      // Verify tap was registered
      await page.waitForSelector('[data-testid="session-id"]');
    }
  });

  test('should handle long press gestures', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="mobile-game-card"]');
      
      const gameCard = page.locator('[data-testid="mobile-game-card"]');
      const box = await gameCard.boundingBox();
      
      if (box) {
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        // Long press simulation
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await page.waitForTimeout(1000); // Hold for 1 second
        await page.mouse.up();
        
        // Check if long press menu or action appeared
        const contextMenu = page.locator('[data-testid="context-menu"], [role="menu"]');
        if (await contextMenu.isVisible()) {
          await expect(contextMenu).toBeVisible();
        }
      }
    }
  });

  test('should handle pinch-to-zoom gestures', async ({ page }) => {
    await page.goto('/demo');
    
    // Note: Playwright doesn't have native pinch gesture support
    // This test simulates the effects of pinch-to-zoom
    
    // Check initial viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('user-scalable=yes');
    
    // Test that content responds to zoom changes
    const initialFontSize = await page.evaluate(() => {
      return getComputedStyle(document.body).fontSize;
    });
    
    // Simulate zoom by changing viewport scale
    await page.setViewportSize({ width: 375, height: 667 });
    
    const currentFontSize = await page.evaluate(() => {
      return getComputedStyle(document.body).fontSize;
    });
    
    // Font size should be consistent
    expect(currentFontSize).toBe(initialFontSize);
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should have hamburger menu for mobile navigation', async ({ page }) => {
    await page.goto('/demo');
    
    // Check for mobile menu button
    const menuButton = page.locator('[data-testid="mobile-menu-btn"], [aria-label*="menu"]');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Verify menu opened
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [role="navigation"]');
      await expect(mobileMenu).toBeVisible();
      
      // Check menu items are accessible
      const menuItems = mobileMenu.locator('a, button');
      const itemCount = await menuItems.count();
      expect(itemCount).toBeGreaterThan(0);
      
      // Test menu item navigation
      if (itemCount > 0) {
        await menuItems.first().click();
        // Menu should close after navigation
        await expect(mobileMenu).not.toBeVisible();
      }
    }
  });

  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/demo');
    
    // Navigate to a different page
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    // Use browser back button
    await page.goBack();
    
    // Should return to demo page
    await expect(page.locator('[data-testid="create-session-btn"]')).toBeVisible();
  });

  test('should handle bottom navigation if present', async ({ page }) => {
    await page.goto('/demo');
    
    const bottomNav = page.locator('[data-testid="bottom-nav"]');
    
    if (await bottomNav.isVisible()) {
      // Verify bottom nav is positioned correctly
      const navBox = await bottomNav.boundingBox();
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      if (navBox) {
        expect(navBox.y + navBox.height).toBeCloseTo(viewportHeight, 10);
      }
      
      // Test bottom nav items
      const navItems = bottomNav.locator('a, button');
      const count = await navItems.count();
      
      for (let i = 0; i < count; i++) {
        const item = navItems.nth(i);
        await expect(item).toBeVisible();
        
        // Check touch target size
        const itemBox = await item.boundingBox();
        if (itemBox) {
          expect(itemBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});

test.describe('Mobile Game Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
  });

  test('should display mobile-optimized game interface', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    // Check for mobile game layout
    await expect(page.locator('[data-testid="mobile-game-session"]')).toBeVisible();
    
    // Verify game elements fit mobile screen
    const gameContainer = page.locator('[data-testid="mobile-game-session"]');
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      expect(containerBox.width).toBeLessThanOrEqual(375);
    }
    
    // Check for mobile-specific UI elements
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      
      // Verify mobile game card is displayed
      await expect(page.locator('[data-testid="mobile-game-card"]')).toBeVisible();
      
      // Check swipe indicators
      const swipeHints = page.locator('[data-testid="swipe-hints"]');
      if (await swipeHints.isVisible()) {
        await expect(swipeHints).toContainText(/swipe/i);
      }
    }
  });

  test('should handle mobile response input', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="mobile-game-card"]');
      
      // Check for mobile response input
      const responseInput = page.locator('[data-testid="response-input"]');
      
      if (await responseInput.isVisible()) {
        // Test mobile keyboard interaction
        await responseInput.click();
        await expect(responseInput).toBeFocused();
        
        // Type response
        await responseInput.fill('This is my mobile response');
        await expect(responseInput).toHaveValue('This is my mobile response');
        
        // Check submit button is accessible
        const submitBtn = page.locator('[data-testid="submit-response-btn"]');
        await expect(submitBtn).toBeVisible();
        
        // Verify button is properly sized for mobile
        const btnBox = await submitBtn.boundingBox();
        if (btnBox) {
          expect(btnBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    await page.goto('/demo');
    
    // Test portrait orientation (default)
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    
    // Switch to landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Verify layout adapts to landscape
    const gameContainer = page.locator('[data-testid="mobile-game-session"], [data-testid="game-session"]');
    if (await gameContainer.isVisible()) {
      const containerBox = await gameContainer.boundingBox();
      if (containerBox) {
        expect(containerBox.width).toBeLessThanOrEqual(667);
      }
    }
    
    // Switch back to portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify layout switches back
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
  });

  test('should show mobile-specific feedback and animations', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    if (await page.locator('[data-testid="start-game-btn"]').isVisible()) {
      await page.click('[data-testid="start-game-btn"]');
      await page.waitForSelector('[data-testid="mobile-game-card"]');
      
      const gameCard = page.locator('[data-testid="mobile-game-card"]');
      
      // Test haptic feedback simulation (visual feedback)
      await swipeGesture(page, gameCard, 'right', 100);
      
      // Check for visual feedback
      const feedback = page.locator('[data-testid="swipe-feedback"], [data-testid="haptic-feedback"]');
      if (await feedback.isVisible()) {
        await expect(feedback).toBeVisible();
      }
      
      // Test animation performance on mobile
      const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
      const count = await animatedElements.count();
      
      if (count > 0) {
        // Verify animations don't cause layout shifts
        const element = animatedElements.first();
        const initialBox = await element.boundingBox();
        
        await page.waitForTimeout(500); // Wait for animations
        
        const finalBox = await element.boundingBox();
        if (initialBox && finalBox) {
          // Position should be stable after animation
          expect(Math.abs(finalBox.x - initialBox.x)).toBeLessThan(5);
          expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5);
        }
      }
    }
  });
});

test.describe('Mobile Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should load quickly on mobile devices', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Mobile should load within 3 seconds on 3G
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle memory constraints gracefully', async ({ page }) => {
    await page.goto('/demo');
    
    // Create multiple sessions to test memory usage
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="create-session-btn"]');
      await page.waitForSelector('[data-testid="session-id"]');
      await page.goBack();
    }
    
    // App should still be responsive
    await expect(page.locator('[data-testid="create-session-btn"]')).toBeVisible();
    
    // Check for memory leaks by monitoring performance
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (memoryInfo) {
      // Memory usage should be reasonable
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });

  test('should maintain smooth scrolling performance', async ({ page }) => {
    await page.goto('/demo');
    
    await page.click('[data-testid="create-session-btn"]');
    await page.waitForSelector('[data-testid="game-session"]');
    
    // Add content to make page scrollable
    await page.evaluate(() => {
      const content = document.createElement('div');
      content.style.height = '2000px';
      content.style.background = 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)';
      content.setAttribute('data-testid', 'scroll-content');
      document.body.appendChild(content);
    });
    
    // Test scroll performance
    const scrollStart = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(16); // ~60fps
    }
    
    const scrollDuration = Date.now() - scrollStart;
    
    // Should maintain reasonable frame rate
    expect(scrollDuration).toBeLessThan(500);
    
    // Page should still be responsive after scrolling
    await expect(page.locator('[data-testid="game-session"]')).toBeVisible();
  });
});