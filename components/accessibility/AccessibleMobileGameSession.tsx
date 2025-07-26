import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, WifiOff, Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameSession } from '@/lib/hooks/useGameSession';
import { AccessibleGameCard } from './AccessibleGameCard';
import { 
  useLiveRegion, 
  useFocusManager, 
  useKeyboardNavigation,
  useReducedMotion,
  createSkipLink,
  useAriaDescribedBy 
} from '@/lib/accessibility/a11y-utils';

interface AccessibleMobileGameSessionProps {
  sessionId: string;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export function AccessibleMobileGameSession({
  sessionId,
  onGameEnd,
  onError
}: AccessibleMobileGameSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameActionsRef = useRef<HTMLDivElement>(null);
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const playersListRef = useRef<HTMLDivElement>(null);
  
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { announce } = useLiveRegion();
  const { trapFocus, setFocusToFirst } = useFocusManager();
  const { handleArrowKeys, handleEscapeKey } = useKeyboardNavigation();
  const prefersReducedMotion = useReducedMotion();
  const { describedById, setDescription } = useAriaDescribedBy(`mobile-session-${sessionId}`);

  const {
    session,
    players,
    currentQuestion,
    responses,
    loading,
    error,
    connectionStatus,
    presenceCount,
    startGame,
    submitResponse,
    advanceTurn,
    pauseGame,
    resumeGame,
    endGame,
    getCurrentPlayer,
    isMyTurn,
  } = useGameSession({ 
    sessionId,
    onGameEvent: (eventType, event) => {
      // Announce game events to screen readers
      switch (eventType) {
        case 'PLAYER_JOINED':
          announce(`A player joined the game. ${presenceCount} players online.`, 'polite');
          break;
        case 'PLAYER_LEFT':
          announce(`A player left the game. ${presenceCount} players online.`, 'polite');
          break;
        case 'TURN_ADVANCED':
          const currentPlayer = getCurrentPlayer();
          if (currentPlayer) {
            announce(`Turn advanced. It's now ${currentPlayer.id === 'current-user' ? 'your' : `Player ${currentPlayer.position + 1}'s`} turn.`, 'polite');
          }
          break;
        case 'GAME_PAUSED':
          announce('Game has been paused.', 'assertive');
          break;
        case 'GAME_RESUMED':
          announce('Game has been resumed.', 'assertive');
          break;
        case 'GAME_ENDED':
          announce('Game has ended.', 'assertive');
          onGameEnd?.();
          break;
        case 'RESPONSE_SUBMITTED':
          announce('Response submitted successfully.', 'polite');
          break;
      }
    }
  });

  // Set up skip links
  useEffect(() => {
    createSkipLink('main-content', 'Skip to main game content');
    createSkipLink('game-actions', 'Skip to game actions');
    createSkipLink('players-list', 'Skip to players list');
  }, []);

  // Update description based on game state
  useEffect(() => {
    if (session && players.length > 0) {
      const description = [
        `Mobile game session with ${players.length} players`,
        `Round ${session.current_round} of ${session.max_rounds}`,
        session.status === 'active' ? 'Game is active' : `Game is ${session.status}`,
        connectionStatus === 'connected' ? 'Connected to server' : 'Connection issues detected',
        isMyTurn() ? 'It is your turn to respond' : 'Waiting for other players',
      ].join('. ');
      
      setDescription(description);
    }
  }, [session, players, connectionStatus, setDescription]);

  // Handle errors
  useEffect(() => {
    if (error) {
      announce(`Error: ${error}`, 'assertive');
      onError?.(error);
    }
  }, [error, announce, onError]);

  // Focus management for game state changes
  useEffect(() => {
    if (session?.status === 'active' && isMyTurn() && responseInputRef.current) {
      responseInputRef.current.focus();
    }
  }, [session?.status, isMyTurn]);

  const handleStartGame = async () => {
    try {
      announce('Starting game...', 'polite');
      const questionQueue = Array.from({ length: 20 }, (_, i) => `question-${i}`);
      const success = await startGame(questionQueue);
      
      if (success) {
        announce('Game started successfully!', 'polite');
      } else {
        announce('Failed to start game. Please try again.', 'assertive');
      }
    } catch (err) {
      announce('Error starting game. Please try again.', 'assertive');
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    announce('Submitting response...', 'polite');
    
    try {
      const success = await submitResponse(responseText.trim());
      
      if (success) {
        setResponseText('');
        announce('Response submitted successfully!', 'polite');
        
        // Auto-advance turn after a delay
        setTimeout(async () => {
          await advanceTurn();
        }, 1000);
      } else {
        announce('Failed to submit response. Please try again.', 'assertive');
      }
    } catch (err) {
      announce('Error submitting response. Please try again.', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePauseResume = async () => {
    try {
      if (session?.status === 'active') {
        await pauseGame();
        announce('Game paused.', 'polite');
      } else if (session?.status === 'paused') {
        await resumeGame();
        announce('Game resumed.', 'polite');
      }
    } catch (err) {
      announce('Error changing game state. Please try again.', 'assertive');
    }
  };

  const handleEndGame = async () => {
    try {
      announce('Ending game...', 'polite');
      await endGame();
      announce('Game ended.', 'polite');
    } catch (err) {
      announce('Error ending game. Please try again.', 'assertive');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'Enter':
          if (responseText.trim() && isMyTurn()) {
            e.preventDefault();
            handleSubmitResponse();
          }
          break;
        case 'p':
          e.preventDefault();
          handlePauseResume();
          break;
        case 'e':
          e.preventDefault();
          handleEndGame();
          break;
      }
    }
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-background"
        role="status"
        aria-live="polite"
        aria-label="Loading game session"
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg font-medium">Loading game session...</p>
          <p className="text-sm text-muted-foreground">Please wait while we connect you to the game</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-background"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-destructive">Game Session Error</h1>
          <p className="text-muted-foreground">
            {error || 'Failed to load game session. Please check your connection and try again.'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background"
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Mobile game session"
      aria-describedby={describedById}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">
              Players ({players.length})
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div 
              className="flex items-center space-x-1"
              role="status"
              aria-label={`Connection status: ${connectionStatus}`}
            >
              {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" aria-hidden="true" />
              )}
              <span className="text-sm">
                {presenceCount} online
              </span>
              <span className="sr-only">
                Connection status: {connectionStatus}. {presenceCount} players online.
              </span>
            </div>
            
            {/* Round Progress */}
            <div 
              className="text-sm font-medium"
              role="status"
              aria-label={`Round ${session.current_round} of ${session.max_rounds}`}
            >
              {session.current_round}/{session.max_rounds}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-6 space-y-6">
        {/* Game Status */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            Game Session
          </h1>
          <div 
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              session.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : session.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
            role="status"
            aria-label={`Game status: ${session.status}`}
          >
            {session.status === 'active' && <Play className="h-4 w-4 mr-1" aria-hidden="true" />}
            {session.status === 'paused' && <Pause className="h-4 w-4 mr-1" aria-hidden="true" />}
            {session.status === 'waiting' && <Clock className="h-4 w-4 mr-1" aria-hidden="true" />}
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </div>
        </div>

        {/* Players List */}
        <section 
          ref={playersListRef}
          id="players-list"
          className="space-y-3"
          role="region"
          aria-label="Players in game session"
        >
          <h2 className="text-lg font-semibold">Players</h2>
          <div className="grid gap-2">
            {players.map((player, index) => {
              const isCurrent = session.current_player_index === player.position;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCurrent 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card border-border'
                  }`}
                  role="listitem"
                  aria-label={`Player ${index + 1}${isCurrent ? ' - Current turn' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      player.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">
                      Player {index + 1}
                      {isCurrent && <span className="sr-only"> - Current turn</span>}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score: {player.score}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Current Question */}
        {currentQuestion && session.status === 'active' && (
          <section 
            className="space-y-4"
            role="region"
            aria-label="Current question"
          >
            <h2 className="text-lg font-semibold">Current Question</h2>
            <AccessibleGameCard
              question={currentQuestion}
              onSwipe={(direction, question) => {
                if (direction === 'right') {
                  handleSubmitResponse();
                } else {
                  advanceTurn();
                }
              }}
              disabled={!isMyTurn()}
              isMyTurn={isMyTurn()}
              isCurrentCard={true}
            />
          </section>
        )}

        {/* Response Input */}
        {session.status === 'active' && isMyTurn() && (
          <section 
            className="space-y-4"
            role="region"
            aria-label="Submit your response"
          >
            <h2 className="text-lg font-semibold">Your Response</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="response-input" className="sr-only">
                  Type your response to the current question
                </label>
                <textarea
                  ref={responseInputRef}
                  id="response-input"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting}
                  aria-describedby="response-hint"
                  maxLength={500}
                />
                <div id="response-hint" className="text-sm text-muted-foreground mt-2">
                  Press Ctrl+Enter to submit quickly. {500 - responseText.length} characters remaining.
                </div>
              </div>
              
              <Button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim() || isSubmitting}
                className="w-full"
                size="lg"
                aria-describedby="submit-hint"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </Button>
              <div id="submit-hint" className="sr-only">
                Submit your response to advance to the next turn
              </div>
            </div>
          </section>
        )}

        {/* Waiting Message */}
        {session.status === 'active' && !isMyTurn() && (
          <section 
            className="text-center py-8"
            role="status"
            aria-live="polite"
          >
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Waiting for Response</h2>
              <p className="text-muted-foreground">
                Waiting for Player {(getCurrentPlayer()?.position ?? 0) + 1} to respond...
              </p>
            </div>
          </section>
        )}

        {/* Game Actions */}
        <section 
          ref={gameActionsRef}
          id="game-actions"
          className="space-y-4"
          role="region"
          aria-label="Game control actions"
        >
          <h2 className="text-lg font-semibold">Game Controls</h2>
          <div className="flex flex-col space-y-2">
            {session.status === 'waiting' && (
              <Button 
                onClick={handleStartGame}
                size="lg"
                className="w-full"
                aria-describedby="start-hint"
              >
                <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                Start Game
              </Button>
            )}
            
            {session.status === 'active' && (
              <Button 
                onClick={handlePauseResume}
                variant="outline"
                size="lg"
                className="w-full"
                aria-describedby="pause-hint"
              >
                <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                Pause Game
              </Button>
            )}
            
            {session.status === 'paused' && (
              <Button 
                onClick={handlePauseResume}
                size="lg"
                className="w-full"
                aria-describedby="resume-hint"
              >
                <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                Resume Game
              </Button>
            )}
            
            <Button 
              onClick={handleEndGame}
              variant="destructive"
              size="lg"
              className="w-full"
              aria-describedby="end-hint"
            >
              <Square className="h-4 w-4 mr-2" aria-hidden="true" />
              End Game
            </Button>
          </div>
          
          {/* Action hints */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div id="start-hint" className="sr-only">Start the game session with random questions</div>
            <div id="pause-hint" className="sr-only">Pause the current game session</div>
            <div id="resume-hint" className="sr-only">Resume the paused game session</div>
            <div id="end-hint" className="sr-only">End the game session permanently</div>
            <p>Keyboard shortcuts: Ctrl+P to pause/resume, Ctrl+E to end game</p>
          </div>
        </section>
      </main>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {session && `Game session loaded. Status: ${session.status}. Round ${session.current_round} of ${session.max_rounds}.`}
        {connectionStatus === 'connected' && 'Connected to game server.'}
        {connectionStatus === 'disconnected' && 'Disconnected from game server. Attempting to reconnect...'}
      </div>
    </div>
  );
}

export default AccessibleMobileGameSession;