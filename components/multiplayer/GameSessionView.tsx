import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  MessageCircle,
  Crown,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useGameSession } from '@/lib/hooks/useGameSession';
import { Question } from '@/lib/types';

interface GameSessionViewProps {
  sessionId: string;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export function GameSessionView({ sessionId, onGameEnd, onError }: GameSessionViewProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.log('Game event:', eventType, payload);
      
      // Handle specific events
      if (eventType === 'RESPONSE_SUBMITTED') {
        setResponse(''); // Clear response input after submission
      }
    }
  });

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

    // Get questions for the game (you can customize this logic)
    const questionQueue = Array.from({ length: session.total_rounds }, (_, i) => 
      `question-${i + 1}` // This should be actual question IDs
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
        // Automatically advance turn after response submission
        setTimeout(() => advanceTurn(), 1000);
      }
    } finally {
      setIsSubmitting(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading game session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Game session not found</p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const myTurn = isMyTurn();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Game Session
            </CardTitle>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {presenceCount} online
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Round</p>
                <p className="text-2xl font-bold">
                  {session.current_round}/{session.total_rounds}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold capitalize ${
                  session.status === 'active' ? 'text-green-600' :
                  session.status === 'paused' ? 'text-yellow-600' :
                  session.status === 'completed' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {session.status}
                </p>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex gap-2">
              {session.status === 'waiting' && (
                <Button onClick={handleStartGame} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Game
                </Button>
              )}
              {session.status === 'active' && (
                <Button 
                  onClick={() => handleGameAction('pause')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              {session.status === 'paused' && (
                <Button 
                  onClick={() => handleGameAction('resume')} 
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button 
                onClick={() => handleGameAction('end')} 
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                End Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Players ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                className={`p-3 rounded-lg border ${
                  currentPlayer?.user_id === player.user_id
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                } ${
                  player.status === 'disconnected' ? 'opacity-50' : ''
                }`}
                animate={{
                  scale: currentPlayer?.user_id === player.user_id ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                  <div className={`w-2 h-2 rounded-full ${
                    player.status === 'active' ? 'bg-green-500' :
                    player.status === 'inactive' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                </div>
                <p className="font-medium mt-1">Player {player.position + 1}</p>
                <p className="text-sm text-muted-foreground">
                  Score: {player.score}
                </p>
                {currentPlayer?.user_id === player.user_id && (
                  <p className="text-xs text-primary font-medium mt-1">
                    Current Turn
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && session.status === 'active' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Current Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-lg border-2 ${
              currentQuestion.level === 'green' ? 'border-green-500 bg-green-50' :
              currentQuestion.level === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
              'border-red-500 bg-red-50'
            }`}>
              <p className="text-lg font-medium text-center">
                {currentQuestion.text}
              </p>
              <div className="mt-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.level === 'green' ? 'bg-green-100 text-green-800' :
                  currentQuestion.level === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.level.toUpperCase()} LEVEL
                </span>
              </div>
            </div>

            {/* Response Input */}
            {myTurn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    Your turn to respond!
                  </span>
                </div>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 min-h-[100px] border rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-muted-foreground">
                    {response.length}/500 characters
                  </p>
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || isSubmitting || response.length > 500}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Spinner size="sm" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                    Submit Response
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Waiting Message */}
            {!myTurn && currentPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center p-4 bg-muted rounded-lg"
              >
                <p className="text-muted-foreground">
                  Waiting for Player {currentPlayer.position + 1} to respond...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous Responses */}
      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responses ({responses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {responses.map((response, index) => {
                  const player = getPlayerByUserId(response.user_id);
                  return (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          Player {(player?.position ?? 0) + 1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(response.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{response.response_text}</p>
                      {response.likes_count > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          ❤️ {response.likes_count} likes
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GameSessionView;