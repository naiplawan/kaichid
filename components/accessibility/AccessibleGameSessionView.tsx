import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Settings, Play, Pause, Square, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessibleGameCard } from './AccessibleGameCard';
import { useGameSession } from '@/lib/hooks/useGameSession';
import { 
  useLiveRegion, 
  useFocusManager, 
  useKeyboardNavigation,
  useReducedMotion,
  useContrastChecker,
  createSkipLink,
  useAriaDescribedBy,
  announceToScreenReader
} from '@/lib/accessibility/a11y-utils';

interface AccessibleGameSessionViewProps {
  sessionId: string;
  showSettings?: boolean;
  enableSounds?: boolean;
  onSettingsToggle?: () => void;
  onSoundToggle?: () => void;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export function AccessibleGameSessionView({
  sessionId,
  showSettings = false,
  enableSounds = true,
  onSettingsToggle,
  onSoundToggle,
  onGameEnd,
  onError
}: AccessibleGameSessionViewProps) {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<HTMLDivElement>(null);
  
  const [soundEnabled, setSoundEnabled] = useState(enableSounds);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  
  const { announce } = useLiveRegion();
  const { trapFocus, setFocusToFirst, restoreFocus } = useFocusManager();
  const { handleArrowKeys, handleEscapeKey } = useKeyboardNavigation();
  const prefersReducedMotion = useReducedMotion();
  const { checkContrast } = useContrastChecker();
  const { describedById, setDescription } = useAriaDescribedBy(`session-view-${sessionId}`);

  const {
    session,
    players,
    currentQuestion,
    responses,
    loading,
    error,
    connectionStatus,
    presenceCount,
    gameHistory,
    startGame,
    submitResponse,
    advanceTurn,
    pauseGame,
    resumeGame,
    endGame,
    restartGame,
    getCurrentPlayer,
    isMyTurn,
    getGameStats,
  } = useGameSession({ 
    sessionId,
    onGameEvent: (eventType, event) => {
      // Announce game events with sound feedback
      switch (eventType) {
        case 'PLAYER_JOINED':
          const joinMessage = `Player joined. ${presenceCount} players now in game.`;
          announce(joinMessage, 'polite');
          if (soundEnabled) playSound('player-join');
          break;
        case 'PLAYER_LEFT':
          const leaveMessage = `Player left. ${presenceCount} players remaining.`;
          announce(leaveMessage, 'polite');
          if (soundEnabled) playSound('player-leave');
          break;
        case 'TURN_ADVANCED':
          const currentPlayer = getCurrentPlayer();
          if (currentPlayer) {
            const turnMessage = `Turn advanced. ${currentPlayer.id === 'current-user' ? 'Your turn to play' : `Player ${currentPlayer.position + 1}'s turn`}.`;
            announce(turnMessage, 'polite');
            if (soundEnabled) playSound('turn-advance');
            
            // Focus management for turn changes
            if (isMyTurn() && gameAreaRef.current) {
              setFocusToFirst(gameAreaRef.current);
            }
          }
          break;
        case 'GAME_STARTED':
          announce('Game has started. Good luck everyone!', 'assertive');
          if (soundEnabled) playSound('game-start');
          break;
        case 'GAME_PAUSED':
          announce('Game paused. All actions are temporarily disabled.', 'assertive');
          if (soundEnabled) playSound('game-pause');
          break;
        case 'GAME_RESUMED':
          announce('Game resumed. You can continue playing.', 'assertive');
          if (soundEnabled) playSound('game-resume');
          break;
        case 'GAME_ENDED':
          const stats = getGameStats();
          announce(`Game ended. Final scores announced. Total rounds played: ${stats.totalRounds}.`, 'assertive');
          if (soundEnabled) playSound('game-end');
          onGameEnd?.();
          break;
        case 'RESPONSE_SUBMITTED':
          announce('Your response has been submitted successfully.', 'polite');
          if (soundEnabled) playSound('response-submit');
          break;
        case 'CONNECTION_LOST':
          announce('Connection lost. Attempting to reconnect automatically.', 'assertive');
          if (soundEnabled) playSound('connection-lost');
          break;
        case 'CONNECTION_RESTORED':
          announce('Connection restored. Game state synchronized.', 'assertive');
          if (soundEnabled) playSound('connection-restored');
          break;
      }
    }
  });

  // Simple sound feedback system
  const playSound = (soundType: string) => {
    if (!soundEnabled) return;
    
    // Create audio context for accessibility sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different tones for different events
    const frequencies: Record<string, number> = {
      'player-join': 440,
      'player-leave': 330,
      'turn-advance': 523,
      'game-start': 659,
      'game-pause': 294,
      'game-resume': 392,
      'game-end': 220,
      'response-submit': 587,
      'connection-lost': 196,
      'connection-restored': 784,
    };
    
    oscillator.frequency.setValueAtTime(frequencies[soundType] || 440, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Setup skip links
  useEffect(() => {
    createSkipLink('main-game-content', 'Skip to main game content');
    createSkipLink('game-controls', 'Skip to game controls');
    createSkipLink('players-section', 'Skip to players section');
    createSkipLink('game-history', 'Skip to game history');
  }, []);

  // Update ARIA description
  useEffect(() => {
    if (session && players.length > 0) {
      const gameStats = getGameStats();
      const description = [
        `Game session with ${players.length} players connected`,
        `Round ${session.current_round} of ${session.max_rounds}`,
        `Status: ${session.status}`,
        `Connection: ${connectionStatus}`,
        isMyTurn() ? 'It is currently your turn' : 'Waiting for other players',
        `Game statistics: ${gameStats.totalRounds} rounds completed, ${gameStats.averageResponseTime}ms average response time`,
      ].join('. ');
      
      setDescription(description);
    }
  }, [session, players, connectionStatus, setDescription, getGameStats]);

  // Error handling
  useEffect(() => {
    if (error) {
      announce(`Game error: ${error}`, 'assertive');
      if (soundEnabled) playSound('connection-lost');
      onError?.(error);
    }
  }, [error, announce, soundEnabled, onError]);

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          if (session?.status === 'waiting') {
            handleStartGame();
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
        case 'r':
          e.preventDefault();
          handleRestartGame();
          break;
        case 'm':
          e.preventDefault();
          toggleSound();
          break;
        case 'h':
          e.preventDefault();
          toggleHighContrast();
          break;
        case '=':
          e.preventDefault();
          increaseFontSize();
          break;
        case '-':
          e.preventDefault();
          decreaseFontSize();
          break;
      }
    }
    
    // Escape key handling
    if (e.key === 'Escape') {
      handleEscapeKey(e);
    }
  };

  // Game control functions
  const handleStartGame = async () => {
    try {
      announce('Starting new game session...', 'polite');
      const questionQueue = Array.from({ length: 50 }, (_, i) => `question-${i}`);
      const success = await startGame(questionQueue);
      
      if (success) {
        announce('Game started successfully! First question is now active.', 'polite');
      } else {
        announce('Failed to start game. Please check your connection and try again.', 'assertive');
      }
    } catch (err) {
      announce('Error starting game. Please try again later.', 'assertive');
    }
  };

  const handlePauseResume = async () => {
    try {
      if (session?.status === 'active') {
        announce('Pausing game...', 'polite');
        await pauseGame();
      } else if (session?.status === 'paused') {
        announce('Resuming game...', 'polite');
        await resumeGame();
      }
    } catch (err) {
      announce('Error changing game state. Please try again.', 'assertive');
    }
  };

  const handleEndGame = async () => {
    try {
      announce('Ending game session...', 'polite');
      await endGame();
    } catch (err) {
      announce('Error ending game. Please try again.', 'assertive');
    }
  };

  const handleRestartGame = async () => {
    try {
      announce('Restarting game with same players...', 'polite');
      await restartGame();
    } catch (err) {
      announce('Error restarting game. Please try again.', 'assertive');
    }
  };

  // Accessibility controls
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    announce(`Sound effects ${newSoundState ? 'enabled' : 'disabled'}.`, 'polite');
    onSoundToggle?.();
  };

  const toggleHighContrast = () => {
    const newContrastMode = !highContrastMode;
    setHighContrastMode(newContrastMode);
    announce(`High contrast mode ${newContrastMode ? 'enabled' : 'disabled'}.`, 'polite');
    
    // Apply high contrast styles
    if (newContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    announce(`Font size increased to ${newSize} pixels.`, 'polite');
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    announce(`Font size decreased to ${newSize} pixels.`, 'polite');
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        role="status"
        aria-live="polite"
        aria-label="Loading game session"
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <div>
                <h2 className="text-lg font-semibold">Loading Game Session</h2>
                <p className="text-sm text-muted-foreground">
                  Connecting to multiplayer server and synchronizing game state...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        role="alert"
        aria-live="assertive"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Game Session Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || 'Unable to load game session. Please check your internet connection and try again.'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Reload Game
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gameStats = getGameStats();

  return (
    <div 
      className={`min-h-screen bg-background transition-colors duration-200 ${highContrastMode ? 'high-contrast' : ''}`}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Game session view"
      aria-describedby={describedById}
      tabIndex={-1}
    >
      {/* Accessibility Controls Bar */}
      <div 
        className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b"
        role="toolbar"
        aria-label="Accessibility controls"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                aria-label={`${soundEnabled ? 'Disable' : 'Enable'} sound effects`}
                title="Toggle sound effects (Ctrl+M)"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHighContrast}
                aria-label={`${highContrastMode ? 'Disable' : 'Enable'} high contrast mode`}
                title="Toggle high contrast (Ctrl+H)"
              >
                HC
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decreaseFontSize}
                  aria-label="Decrease font size"
                  title="Decrease font size (Ctrl+-)"
                >
                  A-
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={increaseFontSize}
                  aria-label="Increase font size"
                  title="Increase font size (Ctrl+=)"
                >
                  A+
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Press Alt+H for keyboard shortcuts
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" aria-hidden="true" />
                    <span>Game Session</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {session.status}
                    </Badge>
                    
                    <div 
                      className="text-sm font-medium"
                      role="status"
                      aria-label={`Round ${session.current_round} of ${session.max_rounds}`}
                    >
                      Round {session.current_round}/{session.max_rounds}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Current Question */}
            <main 
              ref={mainContentRef}
              id="main-game-content"
              role="main"
              aria-label="Current game question"
            >
              {currentQuestion && session.status === 'active' ? (
                <div ref={gameAreaRef} className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {isMyTurn() ? 'Your Turn' : `Player ${(getCurrentPlayer()?.position ?? 0) + 1}'s Turn`}
                  </h2>
                  
                  <AccessibleGameCard
                    question={currentQuestion}
                    onSwipe={(direction, question) => {
                      if (isMyTurn()) {
                        if (direction === 'right') {
                          // Swipe right to like/accept
                          announce('Question accepted. Submitting positive response.', 'polite');
                          submitResponse('I like this question');
                        } else if (direction === 'left') {
                          // Swipe left to pass/skip
                          announce('Question skipped. Advancing to next turn.', 'polite');
                          advanceTurn();
                        }
                      }
                    }}
                    disabled={!isMyTurn()}
                    isMyTurn={isMyTurn()}
                    isCurrentCard={true}
                  />
                  
                  {!isMyTurn() && (
                    <div 
                      className="text-center py-8 text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      <p>Waiting for Player {(getCurrentPlayer()?.position ?? 0) + 1} to respond...</p>
                    </div>
                  )}
                </div>
              ) : session.status === 'waiting' ? (
                <Card>
                  <CardContent className="pt-6 text-center space-y-4">
                    <h2 className="text-xl font-semibold">Ready to Start?</h2>
                    <p className="text-muted-foreground">
                      All players are connected. Start the game when everyone is ready.
                    </p>
                    <Button onClick={handleStartGame} size="lg">
                      <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center space-y-4">
                    <h2 className="text-xl font-semibold">Game Paused</h2>
                    <p className="text-muted-foreground">
                      The game is currently paused. Resume when ready to continue.
                    </p>
                  </CardContent>
                </Card>
              )}
            </main>

            {/* Game Controls */}
            <section 
              ref={controlsRef}
              id="game-controls"
              role="region"
              aria-label="Game control buttons"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Game Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {session.status === 'waiting' && (
                      <Button onClick={handleStartGame} aria-describedby="start-game-hint">
                        <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                        Start Game
                      </Button>
                    )}
                    
                    {session.status === 'active' && (
                      <Button onClick={handlePauseResume} variant="outline" aria-describedby="pause-game-hint">
                        <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                        Pause
                      </Button>
                    )}
                    
                    {session.status === 'paused' && (
                      <Button onClick={handlePauseResume} aria-describedby="resume-game-hint">
                        <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                        Resume
                      </Button>
                    )}
                    
                    <Button onClick={handleRestartGame} variant="outline" aria-describedby="restart-game-hint">
                      <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                      Restart
                    </Button>
                    
                    <Button onClick={handleEndGame} variant="destructive" aria-describedby="end-game-hint">
                      <Square className="h-4 w-4 mr-2" aria-hidden="true" />
                      End Game
                    </Button>
                  </div>
                  
                  {/* Control hints */}
                  <div className="mt-4 text-xs text-muted-foreground space-y-1">
                    <div id="start-game-hint" className="sr-only">Start a new game with random questions</div>
                    <div id="pause-game-hint" className="sr-only">Pause the current game session</div>
                    <div id="resume-game-hint" className="sr-only">Resume the paused game session</div>
                    <div id="restart-game-hint" className="sr-only">Restart the game with same players</div>
                    <div id="end-game-hint" className="sr-only">End the game session permanently</div>
                    
                    <p><strong>Keyboard shortcuts:</strong></p>
                    <p>Ctrl+S: Start, Ctrl+P: Pause/Resume, Ctrl+E: End, Ctrl+R: Restart</p>
                    <p>Ctrl+M: Toggle sound, Ctrl+H: High contrast, Ctrl++/-: Font size</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players Section */}
            <section 
              ref={playersRef}
              id="players-section"
              role="region"
              aria-label="Players in game session"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Players ({players.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {players.map((player, index) => {
                      const isCurrent = session.current_player_index === player.position;
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isCurrent 
                              ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                              : 'bg-card border-border'
                          }`}
                          role="listitem"
                          aria-label={`Player ${index + 1}. Score: ${player.score}. ${isCurrent ? 'Current turn.' : ''} Status: ${player.status}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className={`w-3 h-3 rounded-full ${
                                player.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              aria-hidden="true"
                            />
                            <div>
                              <div className="font-medium">
                                Player {index + 1}
                                {isCurrent && (
                                  <Badge variant="outline" className="ml-2">
                                    Current Turn
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Score: {player.score}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Game Statistics */}
            <section role="region" aria-label="Game statistics">
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Rounds Completed:</span>
                      <span className="font-medium">{gameStats.totalRounds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Responses:</span>
                      <span className="font-medium">{gameStats.totalResponses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Time:</span>
                      <span className="font-medium">{gameStats.averageResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Status:</span>
                      <Badge 
                        variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                        className="capitalize"
                      >
                        {connectionStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recent Responses */}
            {responses.length > 0 && (
              <section 
                id="game-history"
                role="region" 
                aria-label="Recent game responses"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {responses.slice(-5).map((response, index) => (
                        <div
                          key={response.id}
                          className="p-3 bg-muted rounded-lg"
                          role="listitem"
                        >
                          <div className="text-sm font-medium mb-1">
                            Player {response.player_position + 1}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {response.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Screen reader status announcements */}
      <div className="sr-only" aria-live="polite" role="status">
        {session && `Game session active. Status: ${session.status}. Round ${session.current_round} of ${session.max_rounds}. ${players.length} players connected.`}
      </div>
      
      <div className="sr-only" aria-live="assertive" role="alert">
        {connectionStatus === 'disconnected' && 'Warning: Connection lost. Game may not function properly.'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
}

export default AccessibleGameSessionView;