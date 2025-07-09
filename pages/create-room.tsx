import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function CreateRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rounds, setRounds] = useState(3);
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [themes, setThemes] = useState<string[]>([]);

  const handleThemeChange = (theme: string) => {
    setThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]));
  };

  const handleCreateRoom = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomId = uuidv4();

    const { data, error } = await supabase.from('game_rooms').insert([
      {
        id: roomId,
        room_code: roomCode,
        creator_id: user.id,
        max_players: maxPlayers,
        settings: {
          rounds,
          themes,
          level_progression: ['green', 'yellow', 'red'],
        },
      },
    ]);

    if (error) {
      setError('Failed to create room. Please try again.');
      console.error('Error creating room:', error);
      setLoading(false);
    } else {
      router.push(`/multiplayer/${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card p-8 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mystical text-mystical-gold mb-2">Create a KAICHID Circle</h1>
          <p className="text-gray-400">Set the intentions for your group conversation.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}

        <div className="space-y-6">
          {/* Max Players */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-2">Max Players</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="2"
                max="10"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xl font-bold text-mystical-gold">{maxPlayers}</span>
            </div>
          </div>

          {/* Rounds */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-2">Rounds</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xl font-bold text-mystical-gold">{rounds}</span>
            </div>
          </div>

          {/* Themes */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-2">Themes (Optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Relationships', 'Personal Growth', 'Values', 'Career', 'Fun', 'Icebreaker'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    themes.includes(theme)
                      ? 'border-mystical-gold bg-mystical-gold/20'
                      : 'border-gray-600 hover:border-mystical-gold/50'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full oracle-button py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? 'Creating Circle...' : 'Create Circle'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-mystical-gold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
