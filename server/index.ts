import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const io = new Server(3001, {
  cors: {
    origin: '*',
  },
});

interface Player {
  id: string;
  username: string;
}

interface RoomState {
  players: Player[];
  currentTurnPlayerId: string | null;
  // Add other game state variables as needed
}

const rooms = new Map<string, RoomState>();

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', async ({ roomCode, userId }) => {
    socket.join(roomCode);

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Could not fetch user profile');
      return;
    }

    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, { players: [], currentTurnPlayerId: null });
    }

    const room = rooms.get(roomCode)!;
    const newPlayer: Player = { id: userId, username: profile.username };

    if (!room.players.some(p => p.id === userId)) {
        room.players.push(newPlayer);
    }

    io.to(roomCode).emit('update_players', room.players);
    console.log(`User ${profile.username} joined room: ${roomCode}`);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (room && room.players.length > 0) {
      room.currentTurnPlayerId = room.players[0].id; // Assign first player as current turn
      io.to(roomCode).emit('game_started');
      io.to(roomCode).emit('next_turn', room.currentTurnPlayerId);
    }
    console.log(`Game started in room: ${roomCode}`);
  });

  socket.on('assign_turn', ({ roomCode, playerId }) => {
    const room = rooms.get(roomCode);
    if (room) {
      room.currentTurnPlayerId = playerId;
      io.to(roomCode).emit('next_turn', playerId);
    }
  });

  socket.on('turn_ended', ({ roomCode, nextPlayerId }) => {
    const room = rooms.get(roomCode);
    if (room) {
      room.currentTurnPlayerId = nextPlayerId;
      io.to(roomCode).emit('next_turn', nextPlayerId);
    }
  });

  socket.on('send_response', ({ roomCode, player, message }) => {
    io.to(roomCode).emit('player_response', { player, message });
  });

  socket.on('game_over', ({ roomCode }) => {
    io.to(roomCode).emit('game_over');
    rooms.delete(roomCode); // Clean up room state
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Handle player leaving room and update room state for remaining players
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('update_players', room.players);
        if (room.players.length === 0) {
          rooms.delete(roomCode);
        }
      }
    });
  });
});
