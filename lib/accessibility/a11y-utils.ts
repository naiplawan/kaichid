// Accessibility utilities for WCAG 2.1 AA compliance

import { useEffect, useState, useCallback } from 'react';

/**
 * ARIA live regions for dynamic content announcements
 */
export type AriaLiveMode = 'off' | 'polite' | 'assertive';

export interface LiveRegionManager {
  announce: (message: string, priority?: AriaLiveMode) => void;
  clear: () => void;
}

export function useLiveRegion(): LiveRegionManager {
  const announce = useCallback((message: string, priority: AriaLiveMode = 'polite') => {
    // Create or update live region
    let liveRegion = document.getElementById(`live-region-${priority}`);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = `live-region-${priority}`;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only'; // Screen reader only
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);
    
    // Auto-clear after 5 seconds to prevent accumulation
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 5000);
  }, []);

  const clear = useCallback(() => {
    ['polite', 'assertive'].forEach(priority => {
      const liveRegion = document.getElementById(`live-region-${priority}`);
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    });
  }, []);

  return { announce, clear };
}

/**
 * Focus management utilities
 */
export interface FocusManager {
  trapFocus: (containerElement: HTMLElement) => () => void;
  restoreFocus: (element: HTMLElement) => void;
  setFocusToFirst: (containerElement: HTMLElement) => boolean;
  setFocusToLast: (containerElement: HTMLElement) => boolean;
  moveFocusToNext: (currentElement: HTMLElement) => boolean;
  moveFocusToPrevious: (currentElement: HTMLElement) => boolean;
}

export function useFocusManager(): FocusManager {
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element) => {
        const el = element as HTMLElement;
        return el.offsetWidth > 0 && el.offsetHeight > 0;
      }) as HTMLElement[];
  };

  const trapFocus = useCallback((containerElement: HTMLElement) => {
    const focusableElements = getFocusableElements(containerElement);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);

    // Set initial focus
    firstElement?.focus();

    // Return cleanup function
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((element: HTMLElement) => {
    element.focus();
  }, []);

  const setFocusToFirst = useCallback((containerElement: HTMLElement) => {
    const focusableElements = getFocusableElements(containerElement);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }, []);

  const setFocusToLast = useCallback((containerElement: HTMLElement) => {
    const focusableElements = getFocusableElements(containerElement);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
      return true;
    }
    return false;
  }, []);

  const moveFocusToNext = useCallback((currentElement: HTMLElement) => {
    const container = currentElement.closest('[role="application"], body') || document.body;
    const focusableElements = getFocusableElements(container as HTMLElement);
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
      return true;
    }
    return false;
  }, []);

  const moveFocusToPrevious = useCallback((currentElement: HTMLElement) => {
    const container = currentElement.closest('[role="application"], body') || document.body;
    const focusableElements = getFocusableElements(container as HTMLElement);
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
      return true;
    }
    return false;
  }, []);

  return {
    trapFocus,
    restoreFocus,
    setFocusToFirst,
    setFocusToLast,
    moveFocusToNext,
    moveFocusToPrevious,
  };
}

/**
 * Keyboard navigation utilities
 */
export interface KeyboardNavigation {
  handleArrowKeys: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => number;
  handleHomeEnd: (e: KeyboardEvent, items: HTMLElement[]) => void;
  handleEscapeKey: (e: KeyboardEvent, onEscape: () => void) => void;
}

export function useKeyboardNavigation(): KeyboardNavigation {
  const handleArrowKeys = useCallback((
    e: KeyboardEvent, 
    items: HTMLElement[], 
    currentIndex: number
  ): number => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  }, []);

  const handleHomeEnd = useCallback((e: KeyboardEvent, items: HTMLElement[]) => {
    switch (e.key) {
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }, []);

  const handleEscapeKey = useCallback((e: KeyboardEvent, onEscape: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape();
    }
  }, []);

  return {
    handleArrowKeys,
    handleHomeEnd,
    handleEscapeKey,
  };
}

/**
 * Color contrast utilities for WCAG AA compliance
 */
export interface ContrastChecker {
  checkContrast: (foreground: string, background: string) => number;
  isAACompliant: (foreground: string, background: string, isLargeText?: boolean) => boolean;
  isAAACompliant: (foreground: string, background: string, isLargeText?: boolean) => boolean;
  suggestBetterColor: (foreground: string, background: string) => string;
}

export function useContrastChecker(): ContrastChecker {
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const checkContrast = useCallback((foreground: string, background: string): number => {
    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);
    
    if (!fgRgb || !bgRgb) return 0;

    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const isAACompliant = useCallback((
    foreground: string, 
    background: string, 
    isLargeText = false
  ): boolean => {
    const ratio = checkContrast(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }, [checkContrast]);

  const isAAACompliant = useCallback((
    foreground: string, 
    background: string, 
    isLargeText = false
  ): boolean => {
    const ratio = checkContrast(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }, [checkContrast]);

  const suggestBetterColor = useCallback((
    foreground: string, 
    background: string
  ): string => {
    const bgRgb = hexToRgb(background);
    if (!bgRgb) return foreground;

    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    // If background is dark, suggest white. If light, suggest black.
    return bgLuminance > 0.5 ? '#000000' : '#ffffff';
  }, []);

  return {
    checkContrast,
    isAACompliant,
    isAAACompliant,
    suggestBetterColor,
  };
}

/**
 * Reduced motion preferences
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * High contrast mode detection
 */
export function useHighContrast(): boolean {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

/**
 * Screen reader detection
 */
export function useScreenReader(): boolean {
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Check for common screen reader indicators
    const hasScreenReader = 
      'speechSynthesis' in window ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver');

    setIsScreenReader(hasScreenReader);
  }, []);

  return isScreenReader;
}

/**
 * Aria describedby utility
 */
export function useAriaDescribedBy(baseId: string): {
  describedById: string;
  setDescription: (description: string) => void;
  clearDescription: () => void;
} {
  const [description, setDescription] = useState<string>('');
  const describedById = `${baseId}-description`;

  useEffect(() => {
    if (description) {
      let descElement = document.getElementById(describedById);
      
      if (!descElement) {
        descElement = document.createElement('div');
        descElement.id = describedById;
        descElement.className = 'sr-only';
        document.body.appendChild(descElement);
      }
      
      descElement.textContent = description;
    }

    return () => {
      const descElement = document.getElementById(describedById);
      if (descElement && !description) {
        descElement.remove();
      }
    };
  }, [description, describedById]);

  const clearDescription = useCallback(() => {
    setDescription('');
    const descElement = document.getElementById(describedById);
    if (descElement) {
      descElement.remove();
    }
  }, [describedById]);

  return {
    describedById: description ? describedById : '',
    setDescription,
    clearDescription,
  };
}

/**
 * Skip link utility
 */
export function createSkipLink(targetId: string, label: string): void {
  // Remove existing skip link if present
  const existingSkipLink = document.getElementById('skip-link');
  if (existingSkipLink) {
    existingSkipLink.remove();
  }

  // Create skip link
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-link';
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
  
  // Insert at the beginning of body
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Form validation accessibility
 */
export interface AccessibleFormValidation {
  setFieldError: (fieldId: string, error: string) => void;
  clearFieldError: (fieldId: string) => void;
  announceError: (message: string) => void;
  getErrorId: (fieldId: string) => string;
}

export function useAccessibleFormValidation(): AccessibleFormValidation {
  const { announce } = useLiveRegion();

  const setFieldError = useCallback((fieldId: string, error: string) => {
    const errorId = `${fieldId}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'text-red-600 text-sm mt-1';
      errorElement.setAttribute('role', 'alert');
      
      const field = document.getElementById(fieldId);
      if (field) {
        field.setAttribute('aria-describedby', errorId);
        field.setAttribute('aria-invalid', 'true');
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
      }
    }
    
    errorElement.textContent = error;
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const clearFieldError = useCallback((fieldId: string) => {
    const errorId = `${fieldId}-error`;
    const errorElement = document.getElementById(errorId);
    const field = document.getElementById(fieldId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    if (field) {
      field.removeAttribute('aria-describedby');
      field.removeAttribute('aria-invalid');
    }
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Form error: ${message}`, 'assertive');
  }, [announce]);

  const getErrorId = useCallback((fieldId: string) => `${fieldId}-error`, []);

  return {
    setFieldError,
    clearFieldError,
    announceError,
    getErrorId,
  };
}

export default {
  useLiveRegion,
  useFocusManager,
  useKeyboardNavigation,
  useContrastChecker,
  useReducedMotion,
  useHighContrast,
  useScreenReader,
  useAriaDescribedBy,
  createSkipLink,
  useAccessibleFormValidation,
};