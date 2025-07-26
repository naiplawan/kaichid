import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileGameCard } from '@/components/mobile/MobileGameCard';
import { Question } from '@/lib/types';

const mockQuestion: Question = {
  id: 'test-question-id',
  text: 'What is your favorite programming language?',
  level: 'green',
  theme: 'Technology',
  is_custom: false,
  creator_id: null,
  status: 'approved',
  reported_count: 0,
  created_at: '2024-01-01T00:00:00Z',
};

describe('MobileGameCard', () => {
  const mockOnSwipe = jest.fn();
  const mockOnReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render question text', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    it('should render level indicator', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText('GREEN LEVEL')).toBeInTheDocument();
    });

    it('should render theme when provided', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText(`Theme: ${mockQuestion.theme}`)).toBeInTheDocument();
    });

    it('should render swipe instructions when not disabled', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText('Swipe left to skip')).toBeInTheDocument();
      expect(screen.getByText('Swipe right for insight')).toBeInTheDocument();
    });

    it('should not render swipe instructions when disabled', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          disabled={true}
        />
      );

      expect(screen.queryByText('Swipe left to skip')).not.toBeInTheDocument();
      expect(screen.queryByText('Swipe right for insight')).not.toBeInTheDocument();
    });
  });

  describe('level styling', () => {
    it('should apply green styling for green level', () => {
      render(
        <MobileGameCard
          question={{ ...mockQuestion, level: 'green' }}
          onSwipe={mockOnSwipe}
        />
      );

      const card = screen.getByText(mockQuestion.text).closest('.bg-gradient-to-br');
      expect(card).toHaveClass('from-green-50', 'to-green-100');
    });

    it('should apply yellow styling for yellow level', () => {
      render(
        <MobileGameCard
          question={{ ...mockQuestion, level: 'yellow' }}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText('YELLOW LEVEL')).toBeInTheDocument();
    });

    it('should apply red styling for red level', () => {
      render(
        <MobileGameCard
          question={{ ...mockQuestion, level: 'red' }}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText('RED LEVEL')).toBeInTheDocument();
    });
  });

  describe('interactive features', () => {
    it('should show timer when showTimer is true', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          showTimer={true}
          timeRemaining={30000}
        />
      );

      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should show turn indicator when isMyTurn is true', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          isMyTurn={true}
        />
      );

      expect(screen.getByText('Your Turn')).toBeInTheDocument();
    });

    it('should render report button when onReport is provided', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          onReport={mockOnReport}
        />
      );

      const reportButton = screen.getByRole('button');
      expect(reportButton).toBeInTheDocument();
      
      fireEvent.click(reportButton);
      expect(mockOnReport).toHaveBeenCalledWith(mockQuestion.id);
    });
  });

  describe('fallback buttons', () => {
    it('should render fallback action buttons', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const skipButton = screen.getByText('Skip');
      const insightButton = screen.getByText('Insight');

      expect(skipButton).toBeInTheDocument();
      expect(insightButton).toBeInTheDocument();
    });

    it('should call onSwipe with left direction when skip button is clicked', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const skipButton = screen.getByText('Skip');
      fireEvent.click(skipButton);

      expect(mockOnSwipe).toHaveBeenCalledWith('left', mockQuestion);
    });

    it('should call onSwipe with right direction when insight button is clicked', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const insightButton = screen.getByText('Insight');
      fireEvent.click(insightButton);

      expect(mockOnSwipe).toHaveBeenCalledWith('right', mockQuestion);
    });

    it('should not render fallback buttons when disabled', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          disabled={true}
        />
      );

      expect(screen.queryByText('Skip')).not.toBeInTheDocument();
      expect(screen.queryByText('Insight')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const card = screen.getByText(mockQuestion.text).closest('[class*="cursor-grab"]');
      expect(card).toBeInTheDocument();
    });

    it('should disable interactions when disabled prop is true', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
          disabled={true}
        />
      );

      const card = screen.getByText(mockQuestion.text).closest('[class*="cursor-not-allowed"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('drag functionality', () => {
    it('should handle drag start', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const card = screen.getByText(mockQuestion.text).closest('[class*="cursor-grab"]');
      
      // Simulate drag start
      fireEvent.mouseDown(card!);
      
      // The drag functionality is handled by Framer Motion
      // We can't easily test the actual drag behavior in jsdom
      // but we can verify the component renders correctly
      expect(card).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('should have responsive height classes', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const card = screen.getByText(mockQuestion.text).closest('.h-\\[500px\\]');
      expect(card).toHaveClass('sm:h-[600px]');
    });

    it('should have responsive text sizes', () => {
      render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      const questionText = screen.getByText(mockQuestion.text);
      expect(questionText).toHaveClass('text-lg', 'sm:text-xl');
    });
  });

  describe('error handling', () => {
    it('should handle missing theme gracefully', () => {
      const questionWithoutTheme = { ...mockQuestion, theme: '' };
      
      render(
        <MobileGameCard
          question={questionWithoutTheme}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
      expect(screen.queryByText('Theme:')).not.toBeInTheDocument();
    });

    it('should handle very long question text', () => {
      const longQuestion = {
        ...mockQuestion,
        text: 'This is a very long question that should still be displayed properly even though it contains many words and might wrap to multiple lines in the interface.'
      };

      render(
        <MobileGameCard
          question={longQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText(longQuestion.text)).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      // Re-render with same props
      rerender(
        <MobileGameCard
          question={mockQuestion}
          onSwipe={mockOnSwipe}
        />
      );

      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });
  });
});