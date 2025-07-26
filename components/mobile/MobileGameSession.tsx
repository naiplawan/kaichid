import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Crown, 
  Clock, 
  MessageCircle, 
  Send,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileGameCard } from './MobileGameCard';
import { useGameSession } from '@/lib/hooks/useGameSession';
import { Question } from '@/lib/types';

interface MobileGameSessionProps {
  sessionId: string;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export function MobileGameSession({ 
  sessionId, 
  onGameEnd, 
  onError 
}: MobileGameSessionProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    getPlayerByUserId
  } = useGameSession({
    sessionId,
    onGameEvent: (eventType, payload) => {
      console.log('Mobile game event:', eventType, payload);
      
      if (eventType === 'RESPONSE_SUBMITTED') {
        setResponse('');
        setShowResponses(true);
      }
    }
  });

  // Handle keyboard visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(heightDiff);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Handle game completion
  useEffect(() => {
    if (session?.status === 'completed') {
      onGameEnd?.();
    }
  }, [session?.status, onGameEnd]);

  const handleStartGame = async () => {
    if (!session) return;

    const questionQueue = Array.from({ length: session.total_rounds }, (_, i) => 
      `question-${i + 1}`
    );

    await startGame(questionQueue);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim() || !isMyTurn()) return;

    setIsSubmitting(true);
    try {
      const success = await submitResponse(response.trim());
      if (success) {
        setResponse('');
        setTimeout(() => advanceTurn(), 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardSwipe = (direction: 'left' | 'right', question: Question) => {
    if (direction === 'right' && isMyTurn()) {
      // Show response input
      setShowResponses(true);
    } else if (direction === 'left' && isMyTurn()) {
      // Skip question
      advanceTurn();
    }
  };

  const handleGameAction = async (action: 'pause' | 'resume' | 'end') => {
    switch (action) {
      case 'pause':
        await pauseGame();
        break;
      case 'resume':
        await resumeGame();
        break;
      case 'end':
        await endGame();
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">Game session not found</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const myTurn = isMyTurn();

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background to-muted/20"
      style={{ paddingBottom: keyboardHeight }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Round</p>
              <p className="text-lg font-bold">{session.current_round}/{session.total_rounds}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`text-sm font-semibold capitalize ${
                session.status === 'active' ? 'text-green-600' :
                session.status === 'paused' ? 'text-yellow-600' :
                session.status === 'completed' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {session.status}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {presenceCount} online
            </span>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-center space-x-2 px-4 pb-3">
          {session.status === 'waiting' && (
            <Button onClick={handleStartGame} size="sm" className="flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>Start Game</span>
            </Button>
          )}
          {session.status === 'active' && (
            <Button 
              onClick={() => handleGameAction('pause')} 
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Pause className="h-3 w-3" />
              <span>Pause</span>
            </Button>
          )}
          {session.status === 'paused' && (
            <Button 
              onClick={() => handleGameAction('resume')} 
              size="sm"
              className="flex items-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Resume</span>
            </Button>
          )}
          <Button 
            onClick={() => handleGameAction('end')} 
            variant="destructive"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Square className="h-3 w-3" />
            <span>End</span>
          </Button>
        </div>
      </div>

      {/* Players Panel */}
      <div className="relative">
        <button
          onClick={() => setShowPlayers(!showPlayers)}
          className="w-full flex items-center justify-between p-4 bg-muted/50 border-b"
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Players ({players.length})</span>
          </div>
          {showPlayers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {showPlayers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-muted/30"
            >
              <div className="p-4 space-y-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      currentPlayer?.user_id === player.user_id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-background/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      <div className={`w-2 h-2 rounded-full ${
                        player.status === 'active' ? 'bg-green-500' :
                        player.status === 'inactive' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">Player {player.position + 1}</p>
                        {currentPlayer?.user_id === player.user_id && (
                          <p className="text-xs text-primary">Current Turn</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{player.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Content */}
      <div className="flex-1 p-4">
        {currentQuestion && session.status === 'active' && (
          <div className="space-y-6">
            {/* Current Turn Indicator */}
            {currentPlayer && (
              <div className="text-center">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                  myTurn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {myTurn ? "Your turn!" : `Player ${currentPlayer.position + 1}'s turn`}
                  </span>
                </div>
              </div>
            )}

            {/* Game Card */}
            <MobileGameCard
              question={currentQuestion}
              onSwipe={handleCardSwipe}
              disabled={!myTurn}
              isMyTurn={myTurn}
            />

            {/* Response Input */}
            {myTurn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 min-h-[120px] bg-background border rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {response.length}/500
                  </div>
                </div>

                <Button
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || isSubmitting || response.length > 500}
                  className="w-full flex items-center justify-center space-x-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Response'}</span>
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Responses Panel */}
      {responses.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="w-full flex items-center justify-between p-4 bg-muted/50 border-t"
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Responses ({responses.length})</span>
            </div>
            {showResponses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {showResponses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-background border-t"
              >
                <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
                  {responses.map((response, index) => {
                    const player = getPlayerByUserId(response.user_id);
                    return (
                      <motion.div
                        key={response.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">
                            Player {(player?.position ?? 0) + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(response.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-foreground">{response.response_text}</p>
                        {response.likes_count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ❤️ {response.likes_count} likes
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default MobileGameSession;