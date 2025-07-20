import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DoorOpen, ArrowLeft, Sparkles, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinRoom = () => {
    if (roomCode.trim().length === 6) {
      router.push(`/multiplayer/${roomCode.trim().toUpperCase()}`);
    } else {
      setError('Please enter a valid 6-character room code.');
    }
  };

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center px-6 py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-teal-500/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-web3-neon/10 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-10 w-40 h-40 bg-web3-cyber/10 rounded-full blur-xl"
          animate={{
            x: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
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
                <DoorOpen className="w-12 h-12 text-teal-400" />
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
                Join a KAICHID Circle
              </CardTitle>
              <p className="text-teal-200/70">Enter the 6-digit code to connect with friends</p>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="relative">
                <motion.input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-6 py-4 bg-kahoot-dark-surface border-2 border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-white text-3xl text-center tracking-widest font-kahoot font-bold transition-all"
                  placeholder="ABC123"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-teal-400/50"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ 
                    opacity: roomCode.length === 6 ? [0.5, 1, 0.5] : 0,
                    scale: roomCode.length === 6 ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              <div className="text-center text-sm text-teal-200/60">
                <p>Room codes are shared by the host</p>
                <p className="text-xs mt-1 text-teal-300/50">6 characters • Letters & Numbers</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleJoinRoom}
                  disabled={roomCode.length !== 6}
                  size="lg"
                  className="w-full relative overflow-hidden"
                >
                  <span className="relative flex items-center justify-center space-x-2">
                    <DoorOpen className="w-5 h-5" />
                    <span>Enter Circle</span>
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >
              <div className="text-center border-t border-teal-500/20 pt-6">
                <p className="text-teal-200/70 text-sm mb-4">
                  Don't have a room code?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/create-room')}
                    className="text-xs"
                  >
                    Create Room
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/demo')}
                    className="text-xs"
                  >
                    Try Demo
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center space-x-2 text-teal-400/60 hover:text-teal-300 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:animate-cyber-glitch" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
