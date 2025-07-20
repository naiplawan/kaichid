import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { Users, Settings, Sparkles, Crown, ArrowLeft, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen cyber-grid flex items-center justify-center px-6 py-8">
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
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-web3-neon/10 rounded-full blur-xl"
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="neon-border">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <motion.div
                className="relative"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Crown className="w-12 h-12 text-teal-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Users className="w-12 h-12 text-web3-neon" />
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-kahoot font-bold text-teal-400 mb-2">
                Create a KAICHID Circle
              </CardTitle>
              <p className="text-teal-200/70">Design the perfect space for meaningful connections</p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-kahoot-red/20 border border-kahoot-red text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-8">
              {/* Max Players */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <label className="block text-lg font-kahoot font-medium text-teal-300">Max Players</label>
                </div>
                <div className="kahoot-card p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                    <motion.span 
                      className="text-3xl font-kahoot font-bold text-teal-400 min-w-12 text-center"
                      key={maxPlayers}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {maxPlayers}
                    </motion.span>
                  </div>
                  <p className="text-teal-200/60 text-sm mt-2">More players = deeper conversations</p>
                </div>
              </motion.div>

              {/* Rounds */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-teal-400" />
                  <label className="block text-lg font-kahoot font-medium text-teal-300">Rounds</label>
                </div>
                <div className="kahoot-card p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={rounds}
                      onChange={(e) => setRounds(Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                    <motion.span 
                      className="text-3xl font-kahoot font-bold text-teal-400 min-w-12 text-center"
                      key={rounds}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {rounds}
                    </motion.span>
                  </div>
                  <p className="text-teal-200/60 text-sm mt-2">Each round goes deeper</p>
                </div>
              </motion.div>

              {/* Themes */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <label className="block text-lg font-kahoot font-medium text-teal-300">Conversation Themes</label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Relationships', 'Personal Growth', 'Values', 'Career', 'Fun', 'Icebreaker'].map((theme, index) => (
                    <motion.button
                      key={theme}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleThemeChange(theme)}
                      className={`p-4 rounded-xl border-2 transition-all font-kahoot font-medium ${
                        themes.includes(theme)
                          ? 'border-teal-400 bg-teal-400/20 text-teal-300 neon-glow'
                          : 'border-teal-500/30 hover:border-teal-400/50 text-teal-200/70 hover:text-teal-300'
                      }`}
                    >
                      {theme}
                    </motion.button>
                  ))}
                </div>
                <p className="text-teal-200/60 text-sm">Select themes to focus your conversations (optional)</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  size="lg"
                  className="w-full relative overflow-hidden"
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Creating Circle...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Create Circle</span>
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-6 border-t border-teal-500/20"
            >
              <Link 
                href="/dashboard" 
                className="inline-flex items-center space-x-2 text-teal-400/60 hover:text-teal-300 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:animate-cyber-glitch" />
                <span>Back to Dashboard</span>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
