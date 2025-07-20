import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { supabase, Question, GameRoom, RoomPlayer, GameSession } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Users, Play, LogOut, Crown, Zap, Clock, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface MultiplayerGameState {
  phase: 'waiting' | 'playing' | 'answering' | 'reviewing' | 'finished';
  currentQuestion: Question | null;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
}

export default function MultiplayerRoom() {
  const router = useRouter();
  const { roomCode } = router.query;

  const { user } = useAuth();
  const { gameState } = useGame();

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerGameState>({
    phase: 'waiting',
    currentQuestion: null,
    currentRound: 1,
    totalRounds: 5,
    timeRemaining: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);

  // Join room function
  const joinRoom = useCallback(async () => {
    if (!user || !room) return;

    setIsJoining(true);
    try {
      // Check if user is already in the room
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single();

      if (!existingPlayer) {
        // Add user to room
        const { error: joinError } = await supabase.from('room_players').insert({
          room_id: room.id,
          user_id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
        });

        if (joinError) {
          setError('Failed to join room');
          return;
        }
      } else {
        // Update last_seen for existing player
        await supabase
          .from('room_players')
          .update({ last_seen: new Date().toISOString(), is_active: true })
          .eq('id', existingPlayer.id);
      }

      // Update current_players count
      const { data: currentPlayers } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('is_active', true);

      await supabase
        .from('game_rooms')
        .update({ current_players: currentPlayers?.length || 0 })
        .eq('id', room.id);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  }, [user, room]);

  // Start game function (only for room creator)
  const startGame = useCallback(async () => {
    if (!user || !room || !isRoomCreator) return;

    try {
      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          room_id: room.id,
          total_rounds: room.settings?.rounds || 5,
        })
        .select()
        .single();

      if (sessionError) {
        setError('Failed to start game');
        return;
      }

      // Update room status
      await supabase.from('game_rooms').update({ status: 'playing' }).eq('id', room.id);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    }
  }, [user, room, isRoomCreator]);

  // Leave room function
  const leaveRoom = useCallback(async () => {
    if (!user || !room) return;

    try {
      await supabase.from('room_players').delete().eq('room_id', room.id).eq('user_id', user.id);

      router.push('/dashboard');
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  }, [user, room, router]);

  // Heartbeat to keep player active
  useEffect(() => {
    if (!user || !room) return;

    const heartbeat = setInterval(async () => {
      await supabase.rpc('update_player_last_seen', {
        p_room_id: room.id,
        p_user_id: user.id,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeat);
  }, [user, room]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!room || !user) return;

    // Create realtime channel for this room
    const roomChannel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${room.id}` },
        async () => {
          // Refresh players list
          const { data } = await supabase
            .from('room_players')
            .select('*')
            .eq('room_id', room.id)
            .eq('is_active', true)
            .order('joined_at');

          if (data) setPlayers(data);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${room.id}` },
        async () => {
          // Refresh room data
          const { data } = await supabase.from('game_rooms').select('*').eq('id', room.id).single();

          if (data) setRoom(data);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions', filter: `room_id=eq.${room.id}` },
        async () => {
          // Refresh game session
          const { data } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('room_id', room.id)
            .eq('status', 'active')
            .single();

          if (data) {
            setGameSession(data);
            setMultiplayerState((prev) => ({
              ...prev,
              phase: 'playing',
              currentRound: data.current_round,
              totalRounds: data.total_rounds,
            }));
          }
        }
      )
      .subscribe();

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [room, user]);

  // Initial data fetch
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!roomCode || typeof roomCode !== 'string') {
      setError('Invalid room code');
      setLoading(false);
      return;
    }

    const fetchRoomData = async () => {
      try {
        // Fetch room data
        const { data: roomData, error: roomError } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('room_code', roomCode)
          .single();

        if (roomError) {
          setError('Room not found');
          setLoading(false);
          return;
        }

        setRoom(roomData);
        setIsRoomCreator(roomData.creator_id === user.id);

        // Fetch players
        const { data: playersData } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', roomData.id)
          .eq('is_active', true)
          .order('joined_at');

        if (playersData) setPlayers(playersData);

        // Check for active game session
        const { data: sessionData } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('room_id', roomData.id)
          .eq('status', 'active')
          .single();

        if (sessionData) {
          setGameSession(sessionData);
          setMultiplayerState((prev) => ({
            ...prev,
            phase: 'playing',
            currentRound: sessionData.current_round,
            totalRounds: sessionData.total_rounds,
          }));
        }
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomCode, user, router]);

  // Auto-join room if not already joined
  useEffect(() => {
    if (room && user && !loading && !players.find((p) => p.user_id === user.id)) {
      joinRoom();
    }
  }, [room, user, loading, players, joinRoom]);

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Spinner size="xl" text="Connecting to the circle..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="neon-border">
            <CardContent className="p-8 text-center">
              <motion.div
                className="text-6xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                ⚠️
              </motion.div>
              <h1 className="text-2xl font-kahoot font-bold text-kahoot-red mb-4">Connection Error</h1>
              <p className="text-teal-200/70 mb-6">{error}</p>
              <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full">
                <Sparkles className="w-5 h-5 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen cyber-grid p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-40 h-40 bg-teal-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-32 h-32 bg-web3-cyber/10 rounded-full blur-xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Room Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 mb-6"
      >
        <Card className="neon-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="w-8 h-8 text-teal-400" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-kahoot font-bold text-teal-400">Circle: {room.room_code}</h1>
                  <p className="text-teal-200/60 text-sm">KAICHID Connection Space</p>
                </div>
              </div>
              <div className="flex gap-3">
                {isRoomCreator && room.status === 'waiting' && players.length >= 2 && (
                  <Button onClick={startGame} size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                )}
                <Button onClick={leaveRoom} variant="secondary" size="lg">
                  <LogOut className="w-5 h-5 mr-2" />
                  Leave Circle
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="kahoot-card p-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4 text-kahoot-green" />
                  <span className="text-teal-300">Status:</span>
                </div>
                <span className={`font-kahoot font-bold capitalize ${
                  room.status === 'waiting' ? 'text-kahoot-yellow' : 
                  room.status === 'playing' ? 'text-kahoot-green' : 'text-teal-400'
                }`}>{room.status}</span>
              </div>
              <div className="kahoot-card p-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4 text-kahoot-blue" />
                  <span className="text-teal-300">Players:</span>
                </div>
                <span className="font-kahoot font-bold text-teal-400">
                  {players.length}/{room.max_players}
                </span>
              </div>
              <div className="kahoot-card p-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="w-4 h-4 text-kahoot-purple" />
                  <span className="text-teal-300">Rounds:</span>
                </div>
                <span className="font-kahoot font-bold text-teal-400">{room.settings?.rounds || 5}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Players List */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="neon-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-teal-400">
                <Users className="w-6 h-6" />
                <span>Connected Souls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="kahoot-card p-4 level-green"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-4 h-4 rounded-full bg-kahoot-green"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      ></motion.div>
                      <span className="text-teal-200 font-kahoot flex-1">{player.username}</span>
                      <div className="flex space-x-1">
                        {player.user_id === room.creator_id && (
                          <span className="text-xs bg-teal-400 text-kahoot-dark px-2 py-1 rounded-full font-kahoot font-bold">
                            HOST
                          </span>
                        )}
                        {player.user_id === user?.id && (
                          <span className="text-xs bg-web3-neon text-kahoot-dark px-2 py-1 rounded-full font-kahoot font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {room.status === 'waiting' && players.length < 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="kahoot-card p-4 border-kahoot-yellow/30"
                >
                  <div className="flex items-center space-x-2 text-kahoot-yellow">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-kahoot">Waiting for more souls to join the circle...</p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Area */}
        <div className="lg:col-span-2">
          {room.status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="neon-border">
                <CardContent className="p-8 text-center">
                  <motion.div
                    className="text-6xl mb-6"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🔮
                  </motion.div>
                  <h2 className="text-3xl font-kahoot font-bold text-teal-400 mb-4">Circle is Forming</h2>
                  <p className="text-teal-200/70 mb-8 text-lg">
                    {isRoomCreator
                      ? `Ready to begin when you have at least 2 souls connected (${players.length}/2)`
                      : 'The host will begin our journey together soon...'}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="kahoot-card p-6 level-blue"
                    >
                      <h3 className="font-kahoot font-bold text-kahoot-blue mb-4 flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Circle Settings</span>
                      </h3>
                      <ul className="text-sm text-teal-200/70 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Rounds: {room.settings?.rounds || 5}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Themes: {room.settings?.themes?.join(', ') || 'All Dimensions'}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Journey: {room.settings?.level_progression?.join(' → ') || 'Surface to Soul'}</span>
                        </li>
                      </ul>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="kahoot-card p-6 level-green"
                    >
                      <h3 className="font-kahoot font-bold text-kahoot-green mb-4 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>The Journey</span>
                      </h3>
                      <ul className="text-sm text-teal-200/70 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Share authentic responses</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Listen with curiosity</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                          <span>Discover new dimensions</span>
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {room.status === 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="neon-border">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-kahoot font-bold text-teal-400 flex items-center space-x-2">
                        <Target className="w-6 h-6" />
                        <span>Round {multiplayerState.currentRound} of {multiplayerState.totalRounds}</span>
                      </h2>
                    </div>

                    <div className="kahoot-card p-8 text-center level-purple">
                      <motion.div
                        className="text-6xl mb-6"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        🚀
                      </motion.div>
                      <p className="text-teal-200 text-xl leading-relaxed mb-6">
                        The multiplayer experience is being enhanced with real-time magic!
                      </p>
                      <div className="kahoot-card p-6 bg-web3-neon/10 border-web3-neon/30">
                        <h3 className="text-web3-neon font-kahoot font-bold text-lg mb-4">Coming Soon to Your Circle:</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-web3-neon" />
                            <span className="text-teal-200">Turn-based gameplay</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-web3-neon" />
                            <span className="text-teal-200">Live reactions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-web3-neon" />
                            <span className="text-teal-200">Wildcard moments</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-teal-300/60 mt-6 text-sm">
                        The foundation is ready - questions, responses, and real-time sync are all prepared for launch.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
