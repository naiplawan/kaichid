import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import { AccessibleGameCard } from '@/components/accessibility/AccessibleGameCard';
import { AccessibleMobileGameSession } from '@/components/accessibility/AccessibleMobileGameSession';
import { AccessibleGameSessionView } from '@/components/accessibility/AccessibleGameSessionView';
import { 
  useLiveRegion, 
  useFocusManager, 
  useKeyboardNavigation,
  useContrastChecker,
  useReducedMotion,
  checkColorContrast,
  validateForm,
  announceToScreenReader
} from '@/lib/accessibility/a11y-utils';

// Mock the accessibility hooks
jest.mock('@/lib/accessibility/a11y-utils', () => ({
  useLiveRegion: jest.fn(() => ({
    announce: jest.fn(),
    clearAnnouncements: jest.fn()
  })),
  useFocusManager: jest.fn(() => ({
    trapFocus: jest.fn(),
    setFocusToFirst: jest.fn(),
    restoreFocus: jest.fn(),
    focusableElements: []
  })),
  useKeyboardNavigation: jest.fn(() => ({
    handleArrowKeys: jest.fn(),
    handleEscapeKey: jest.fn(),
    handleTabKey: jest.fn()
  })),
  useContrastChecker: jest.fn(() => ({
    checkContrast: jest.fn(() => ({ ratio: 4.5, isValid: true })),
    validateColors: jest.fn(() => true)
  })),
  useReducedMotion: jest.fn(() => false),
  useAriaDescribedBy: jest.fn(() => ({
    describedById: 'test-description',
    setDescription: jest.fn()
  })),
  checkColorContrast: jest.fn(() => ({ ratio: 4.5, isValid: true })),
  validateForm: jest.fn(() => ({ isValid: true, errors: [] })),
  announceToScreenReader: jest.fn(),
  createSkipLink: jest.fn()
}));

// Mock game session hook
jest.mock('@/lib/hooks/useGameSession', () => ({
  useGameSession: jest.fn(() => ({
    session: {
      id: 'test-session',
      status: 'active',
      current_round: 1,
      max_rounds: 10,
      current_player_index: 0
    },
    players: [
      { id: 'player-1', position: 0, score: 0, status: 'active' },
      { id: 'player-2', position: 1, score: 0, status: 'active' }
    ],
    currentQuestion: {
      id: 'q1',
      text: 'What is your favorite color?',
      category: 'personal',
      difficulty: 'easy'
    },
    responses: [],
    loading: false,
    error: null,
    connectionStatus: 'connected',
    presenceCount: 2,
    startGame: jest.fn(() => Promise.resolve(true)),
    submitResponse: jest.fn(() => Promise.resolve(true)),
    advanceTurn: jest.fn(() => Promise.resolve(true)),
    pauseGame: jest.fn(() => Promise.resolve(true)),
    resumeGame: jest.fn(() => Promise.resolve(true)),
    endGame: jest.fn(() => Promise.resolve(true)),
    getCurrentPlayer: jest.fn(() => ({ id: 'player-1', position: 0, score: 0, status: 'active' })),
    isMyTurn: jest.fn(() => true),
    getGameStats: jest.fn(() => ({
      totalRounds: 1,
      totalResponses: 0,
      averageResponseTime: 0
    }))
  }))
}));

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Components', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));

    // Mock AudioContext for sound testing
    global.AudioContext = jest.fn().mockImplementation(() => ({
      createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        frequency: { setValueAtTime: jest.fn() },
        start: jest.fn(),
        stop: jest.fn(),
        type: 'sine'
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { 
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        }
      })),
      destination: {},
      currentTime: 0
    }));

    // Mock window.matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('AccessibleGameCard', () => {
    const mockQuestion = {
      id: 'test-question',
      text: 'What is your favorite programming language?',
      category: 'technology',
      difficulty: 'medium'
    };

    it('should render without accessibility violations', async () => {
      const { container } = render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={jest.fn()}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', () => {
      render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={jest.fn()}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByLabelText(/interactive game card/i)).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const mockOnSwipe = jest.fn();
      const user = userEvent.setup();

      render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      const card = screen.getByRole('article');
      
      // Test arrow key navigation
      await user.type(card, '{ArrowRight}');
      expect(mockOnSwipe).toHaveBeenCalledWith('right', mockQuestion);
      
      await user.type(card, '{ArrowLeft}');
      expect(mockOnSwipe).toHaveBeenCalledWith('left', mockQuestion);
    });

    it('should announce swipe actions to screen readers', async () => {
      const mockAnnounce = jest.fn();
      (useLiveRegion as jest.Mock).mockReturnValue({
        announce: mockAnnounce,
        clearAnnouncements: jest.fn()
      });

      const user = userEvent.setup();
      
      render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={jest.fn()}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      const card = screen.getByRole('article');
      await user.type(card, '{ArrowRight}');

      expect(mockAnnounce).toHaveBeenCalledWith(
        expect.stringContaining('swiped right'),
        'polite'
      );
    });

    it('should be disabled when not user turn', () => {
      render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={jest.fn()}
          disabled={true}
          isMyTurn={false}
          isCurrentCard={true}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByText(/waiting for other players/i)).toBeInTheDocument();
    });

    it('should support touch gestures with proper announcements', async () => {
      const mockOnSwipe = jest.fn();
      const mockAnnounce = jest.fn();
      
      (useLiveRegion as jest.Mock).mockReturnValue({
        announce: mockAnnounce,
        clearAnnouncements: jest.fn()
      });

      render(
        <AccessibleGameCard 
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      const card = screen.getByRole('article');

      // Simulate touch swipe
      fireEvent.touchStart(card, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchMove(card, {
        touches: [{ clientX: 200, clientY: 100 }]
      });
      
      fireEvent.touchEnd(card, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });

      expect(mockOnSwipe).toHaveBeenCalledWith('right', mockQuestion);
    });
  });

  describe('AccessibleMobileGameSession', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper application role and landmarks', () => {
      render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      expect(screen.getByRole('application')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile game session/i)).toBeInTheDocument();
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      
      render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      const app = screen.getByRole('application');
      
      // Test Ctrl+P for pause/resume
      await user.type(app, '{Control>}p{/Control}');
      
      // Test Ctrl+E for end game
      await user.type(app, '{Control>}e{/Control}');
    });

    it('should announce game events', () => {
      const mockAnnounce = jest.fn();
      (useLiveRegion as jest.Mock).mockReturnValue({
        announce: mockAnnounce,
        clearAnnouncements: jest.fn()
      });

      render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Should announce initial game state
      expect(mockAnnounce).toHaveBeenCalled();
    });

    it('should handle connection status changes', () => {
      const mockAnnounce = jest.fn();
      (useLiveRegion as jest.Mock).mockReturnValue({
        announce: mockAnnounce,
        clearAnnouncements: jest.fn()
      });

      render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      expect(screen.getByLabelText(/connection status/i)).toBeInTheDocument();
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });
  });

  describe('AccessibleGameSessionView', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessibility controls toolbar', () => {
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByLabelText(/accessibility controls/i)).toBeInTheDocument();
      
      // Sound controls
      expect(screen.getByLabelText(/sound effects/i)).toBeInTheDocument();
      
      // High contrast controls
      expect(screen.getByLabelText(/high contrast/i)).toBeInTheDocument();
      
      // Font size controls
      expect(screen.getByLabelText(/increase font size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/decrease font size/i)).toBeInTheDocument();
    });

    it('should toggle accessibility features', async () => {
      const user = userEvent.setup();
      
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Test sound toggle
      const soundButton = screen.getByLabelText(/sound effects/i);
      await user.click(soundButton);
      
      // Test high contrast toggle
      const contrastButton = screen.getByLabelText(/high contrast/i);
      await user.click(contrastButton);
      
      // Test font size controls
      const increaseFont = screen.getByLabelText(/increase font size/i);
      await user.click(increaseFont);
      
      const decreaseFont = screen.getByLabelText(/decrease font size/i);
      await user.click(decreaseFont);
    });

    it('should handle keyboard shortcuts for accessibility', async () => {
      const user = userEvent.setup();
      
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      const app = screen.getByRole('application');
      
      // Test sound toggle (Ctrl+M)
      await user.type(app, '{Control>}m{/Control}');
      
      // Test high contrast (Ctrl+H)
      await user.type(app, '{Control>}h{/Control}');
      
      // Test font size increase (Ctrl+=)
      await user.type(app, '{Control>}={/Control}');
      
      // Test font size decrease (Ctrl+-)
      await user.type(app, '{Control>}-{/Control}');
    });

    it('should provide comprehensive game statistics', () => {
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      expect(screen.getByLabelText(/game statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/rounds completed/i)).toBeInTheDocument();
      expect(screen.getByText(/total responses/i)).toBeInTheDocument();
      expect(screen.getByText(/average response time/i)).toBeInTheDocument();
      expect(screen.getByText(/connection status/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Utilities', () => {
    it('should check color contrast correctly', () => {
      const result = checkColorContrast('#000000', '#FFFFFF');
      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.isValid).toBe(true);
    });

    it('should validate forms with accessibility errors', () => {
      const formData = {
        response: '',
        email: 'invalid-email'
      };

      const result = validateForm(formData, {
        response: { required: true, minLength: 1 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Response is required');
      expect(result.errors).toContain('Email format is invalid');
    });

    it('should announce to screen readers', () => {
      const mockElement = document.createElement('div');
      mockElement.setAttribute('aria-live', 'polite');
      document.body.appendChild(mockElement);

      announceToScreenReader('Test announcement', 'polite');
      
      expect(mockElement.textContent).toBe('Test announcement');
      
      document.body.removeChild(mockElement);
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal dialogs', () => {
      const mockTrapFocus = jest.fn();
      (useFocusManager as jest.Mock).mockReturnValue({
        trapFocus: mockTrapFocus,
        setFocusToFirst: jest.fn(),
        restoreFocus: jest.fn(),
        focusableElements: []
      });

      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Focus trapping should be called for main content areas
      expect(mockTrapFocus).toHaveBeenCalled();
    });

    it('should restore focus after modal closes', () => {
      const mockRestoreFocus = jest.fn();
      (useFocusManager as jest.Mock).mockReturnValue({
        trapFocus: jest.fn(),
        setFocusToFirst: jest.fn(),
        restoreFocus: mockRestoreFocus,
        focusableElements: []
      });

      const { rerender } = render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Simulate component unmount
      rerender(<div />);
      
      expect(mockRestoreFocus).toHaveBeenCalled();
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preferences', () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);

      render(
        <AccessibleGameCard 
          question={{
            id: 'test',
            text: 'Test question',
            category: 'test',
            difficulty: 'easy'
          }}
          onSwipe={jest.fn()}
          disabled={false}
          isMyTurn={true}
          isCurrentCard={true}
        />
      );

      // Should not have animation classes when reduced motion is preferred
      const card = screen.getByRole('article');
      expect(card).not.toHaveClass('animate-pulse');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide live region updates', () => {
      const mockAnnounce = jest.fn();
      (useLiveRegion as jest.Mock).mockReturnValue({
        announce: mockAnnounce,
        clearAnnouncements: jest.fn()
      });

      render(
        <AccessibleMobileGameSession 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Should announce game state changes
      expect(mockAnnounce).toHaveBeenCalledWith(
        expect.stringContaining('game'),
        expect.any(String)
      );
    });

    it('should have proper heading hierarchy', () => {
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Check for proper heading levels
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    });

    it('should provide descriptive button labels', () => {
      render(
        <AccessibleGameSessionView 
          sessionId="test-session"
          onGameEnd={jest.fn()}
          onError={jest.fn()}
        />
      );

      // All buttons should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});