
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useGame } from '@/contexts/GameContext';
import { supabase, Question, GameRoom } from '@/lib/supabase';
import Card from '@/components/Card';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
  id: string;
  username: string;
}

export default function MultiplayerRoom() {
  const router = useRouter();
  const { roomCode } = router.query;

  const { user } = useAuth();
  const { socket, joinRoom, sendMessage } = useSocket();
  const { gameState, setRoom } = useGame();

  const [room, setLocalRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!roomCode || !user) return;

    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (error || !data) {
        setError('Room not found.');
        setLoading(false);
        return;
      }

      setLocalRoom(data);
      setRoom(data);
      joinRoom(roomCode as string);
      setLoading(false);
    };

    fetchRoom();
  }, [roomCode, user, joinRoom, setRoom]);

  useEffect(() => {
    if (!socket) return;

    socket.on('update_players', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on('game_started', () => {
      setGameStarted(true);
    });

    return () => {
      socket.off('update_players');
      socket.off('game_started');
    };
  }, [socket]);

  const handleStartGame = () => {
    if (socket && room) {
      sendMessage('start_game', { roomCode });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-mystical-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl text-red-500">{error}</h1>
          <button onClick={() => router.push('/dashboard')} className="mt-4 oracle-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-mystical text-mystical-gold">Sacred Circle</h1>
        <div className="text-center">
          <p className="text-gray-400">Room Code</p>
          <p className="text-2xl font-bold tracking-widest">{roomCode}</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-mystical-gold">
          Leave Circle
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {!gameStarted ? (
          <Lobby players={players} onStartGame={handleStartGame} isHost={room?.creator_id === user?.uid} />
        ) : (
          <Game room={room} players={players} currentUser={user} />
        )}
      </main>
    </div>
  );
}

const Lobby = ({ players, onStartGame, isHost }: { players: Player[]; onStartGame: () => void; isHost: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mystical-card p-8 w-full max-w-2xl text-center"
  >
    <h2 className="text-3xl font-mystical text-mystical-gold mb-4">Lobby</h2>
    <p className="text-gray-300 mb-8">Waiting for players to join the circle...</p>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {players.map((player) => (
        <div key={player.id} className="bg-gray-800/50 p-4 rounded-lg text-center">
          <div className="text-4xl mb-2">🧘</div>
          <p className="font-semibold truncate">{player.username}</p>
        </div>
      ))}
    </div>

    {isHost && (
      <button onClick={onStartGame} className="oracle-button" disabled={players.length < 2}>
        Start Game ({players.length} / {players.length})
      </button>
    )}
    {!isHost && <p className="text-gray-400">Waiting for the host to start the game...</p>}
  </motion.div>
);

interface GameProps {
  room: GameRoom | null;
  players: Player[];
  currentUser: any; // Firebase User object
}

const Game = ({ room, players, currentUser }: GameProps) => {
  const { socket, sendMessage } = useSocket();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [responseInput, setResponseInput] = useState('');
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ player: string; message: string }[]>([]);

  useEffect(() => {
    if (!room || !socket) return;

    // Fetch questions based on room settings
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('level', room.settings.level_progression)
        .in('theme', room.settings.themes.length > 0 ? room.settings.themes : ['Relationships', 'Personal Growth', 'Values', 'Career', 'Fun', 'Icebreaker'])
        .eq('status', 'approved')
        .order('created_at', { ascending: false }); // Simple ordering for now

      if (error) {
        console.error('Error fetching questions for game:', error);
      } else {
        setQuestions(data || []);
        if (data && data.length > 0) {
          setCurrentQuestion(data[0]);
        }
      }
    };

    fetchQuestions();

    socket.on('next_turn', (playerId: string) => {
      setCurrentTurnPlayerId(playerId);
      setShowResponseInput(false);
      setResponseInput('');
      setQuestionIndex(prev => prev + 1);
    });

    socket.on('player_response', (data: { player: string; message: string }) => {
      setChatMessages(prev => [...prev, data]);
    });

    // Initial turn assignment (only for the host)
    if (room.creator_id === currentUser?.uid && players.length > 0) {
      sendMessage('assign_turn', { roomCode: room.room_code, playerId: players[0].id });
    }

    return () => {
      socket.off('next_turn');
      socket.off('player_response');
    };
  }, [room, socket, currentUser, players, sendMessage]);

  useEffect(() => {
    if (questions.length > 0 && questionIndex < questions.length) {
      setCurrentQuestion(questions[questionIndex]);
    } else if (questions.length > 0 && questionIndex >= questions.length) {
      // Game over logic
      console.log("Game Over!");
      sendMessage('game_over', { roomCode: room?.room_code });
    }
  }, [questionIndex, questions, room?.room_code, sendMessage]);

  const handleCardSwipe = (direction: 'left' | 'right', question: Question) => {
    if (currentUser?.uid !== currentTurnPlayerId) return; // Only current player can swipe

    if (direction === 'right') {
      setShowResponseInput(true);
    } else {
      sendMessage('turn_ended', { roomCode: room?.room_code, nextPlayerId: getNextPlayerId() });
    }
  };

  const handleSendResponse = () => {
    if (responseInput.trim() && currentQuestion) {
      sendMessage('send_response', { roomCode: room?.room_code, player: currentUser?.displayName || currentUser?.email, message: responseInput });
      sendMessage('turn_ended', { roomCode: room?.room_code, nextPlayerId: getNextPlayerId() });
    }
  };

  const getNextPlayerId = useCallback(() => {
    const currentIndex = players.findIndex(p => p.id === currentTurnPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex].id;
  }, [players, currentTurnPlayerId]);

  const isMyTurn = currentUser?.uid === currentTurnPlayerId;

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* Left Panel: Players & Chat */}
      <div className="md:w-1/3 p-4 border-r border-gray-800 flex flex-col">
        <h3 className="text-xl font-mystical text-mystical-gold mb-4">Players</h3>
        <div className="space-y-2 mb-6">
          {players.map((player) => (
            <div key={player.id} className={`p-3 rounded-lg ${
              player.id === currentTurnPlayerId ? 'bg-mystical-gold/30 border border-mystical-gold' : 'bg-gray-800/50'
            }`}>
              <span className="font-semibold">{player.username}</span>
              {player.id === currentUser?.uid && <span className="text-gray-400 text-sm ml-2">(You)</span>}
              {player.id === currentTurnPlayerId && <span className="text-mystical-gold text-sm ml-2">• Current Turn</span>}
            </div>
          ))}
        </div>

        <h3 className="text-xl font-mystical text-mystical-gold mb-4">Chat</h3>
        <div className="flex-1 bg-gray-800/50 rounded-lg p-4 overflow-y-auto mb-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold text-mystical-gold">{msg.player}:</span> {msg.message}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Card & Interaction */}
      <div className="md:w-2/3 p-4 flex flex-col items-center justify-center">
        {currentQuestion ? (
          <AnimatePresence mode="wait">
            {!showResponseInput ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  question={currentQuestion}
                  onSwipe={handleCardSwipe}
                  onReport={() => { /* Reporting in multiplayer might be different */ }}
                  disabled={!isMyTurn}
                />
              </motion.div>
            ) : (
              <motion.div
                key="response-input"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mystical-card p-8 w-full max-w-xl"
              >
                <h3 className="text-xl font-mystical mb-4 text-mystical-gold">Your Insight</h3>
                <p className="text-gray-300 mb-4">{currentQuestion.text}</p>
                <textarea
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="Share your thoughts with the circle..."
                  className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white resize-none"
                />
                <button onClick={handleSendResponse} className="oracle-button mt-4 w-full">
                  Share Insight
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="text-center text-gray-400">
            <p>Waiting for questions...</p>
          </div>
        )}
      </div>
    </div>
  );
};
