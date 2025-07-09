import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { supabase, Question, GameRoom, RoomPlayer, GameSession } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-mystical-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mystical-card p-8 text-center"
        >
          <h1 className="text-2xl font-mystical text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen p-4">
      {/* Room Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mystical-card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-mystical text-mystical-gold">Room: {room.room_code}</h1>
          <div className="flex gap-3">
            {isRoomCreator && room.status === 'waiting' && players.length >= 2 && (
              <button onClick={startGame} className="btn-primary">
                Start Game
              </button>
            )}
            <button onClick={leaveRoom} className="btn-secondary">
              Leave Room
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>
            Status: <span className="text-mystical-gold capitalize">{room.status}</span>
          </span>
          <span>
            Players: {players.length}/{room.max_players}
          </span>
          <span>Rounds: {room.settings?.rounds || 5}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mystical-card p-6">
          <h2 className="text-xl font-mystical text-mystical-gold mb-4">Players</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 p-3 bg-mystical-dark-lighter rounded-lg"
                >
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">{player.username}</span>
                  {player.user_id === room.creator_id && (
                    <span className="text-xs bg-mystical-gold text-mystical-dark px-2 py-1 rounded">HOST</span>
                  )}
                  {player.user_id === user?.id && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">YOU</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {room.status === 'waiting' && players.length < 2 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm">Waiting for more players to join...</p>
            </div>
          )}
        </motion.div>

        {/* Game Area */}
        <div className="lg:col-span-2">
          {room.status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mystical-card p-8 text-center"
            >
              <h2 className="text-2xl font-mystical text-mystical-gold mb-4">Waiting for Game to Start</h2>
              <p className="text-gray-300 mb-6">
                {isRoomCreator
                  ? `You can start the game when you have at least 2 players (${players.length}/2)`
                  : 'The host will start the game soon...'}
              </p>

              <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                <div>
                  <h3 className="font-medium text-mystical-gold mb-2">Game Settings</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Rounds: {room.settings?.rounds || 5}</li>
                    <li>• Themes: {room.settings?.themes?.join(', ') || 'Mixed'}</li>
                    <li>• Levels: {room.settings?.level_progression?.join(' → ') || 'Progressive'}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-mystical-gold mb-2">How to Play</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Answer questions together</li>
                    <li>• Share your thoughts</li>
                    <li>• Learn about each other</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {room.status === 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mystical-card p-8"
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-mystical text-mystical-gold">
                    Round {multiplayerState.currentRound} of {multiplayerState.totalRounds}
                  </h2>
                </div>

                <div className="text-center p-6 bg-mystical-dark-lighter rounded-lg">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Multiplayer gameplay is currently being enhanced with Supabase Realtime.
                    <br />
                    <span className="text-yellow-400 font-semibold">
                      Demo: Turn-based play, chat, and wildcards coming soon!
                    </span>
                  </p>
                  <p className="text-gray-400 mt-4">
                    The foundation is ready - questions, responses, and real-time updates are all set up.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
