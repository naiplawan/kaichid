import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Play, LogOut, User, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { resetGame } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      resetGame();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Entering the KAICHID realm..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-kahoot font-bold text-teal-400">KAICHID</h1>
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/demo" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Try Demo</span>
              </Link>
            </Button>
          </motion.div>
          <span className="text-teal-200 font-medium">Welcome, {user.email?.split('@')[0]}</span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave Circle
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-5xl font-kahoot font-bold mb-4 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
            Choose Your Path
          </h2>
          <p className="text-teal-200/80 text-lg font-medium">Will you journey within yourself or connect with others?</p>
        </motion.div>

        {/* Game Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="kahoot-card p-8 text-center cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/solo">
              <div>
                <div className="text-6xl mb-6">🧘‍♀️</div>
                <h3 className="text-2xl font-kahoot font-bold mb-4 text-teal-400">Solo Journey</h3>
                <p className="text-teal-200/80 mb-6">
                  Embark on a personal quest of self-discovery. Reflect, journal, and grow through guided questions.
                </p>
                <Button size="lg" className="min-w-32">
                  <User className="w-5 h-5 mr-2" />
                  Begin Solitude
                </Button>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="kahoot-card p-8 text-center cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/multiplayer">
              <div>
                <div className="text-6xl mb-6">👥</div>
                <h3 className="text-2xl font-kahoot font-bold mb-4 text-teal-400">KAICHID Circle</h3>
                <p className="text-teal-200/80 mb-6">
                  Connect with friends in real-time conversations. Share insights and deepen bonds together.
                </p>
                <Button size="lg" className="min-w-32">
                  <Plus className="w-5 h-5 mr-2" />
                  Enter Circle
                </Button>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="kahoot-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-teal-400">Questions Explored</h4>
            <p className="text-3xl font-bold text-teal-100">42</p>
          </div>
          <div className="kahoot-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-teal-400">Insights Saved</h4>
            <p className="text-3xl font-bold text-white">18</p>
          </div>
          <div className="kahoot-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-teal-400">Circles Joined</h4>
            <p className="text-3xl font-bold text-white">7</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <Link href="/journal" className="kahoot-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">📖</div>
            <h5 className="font-semibold text-teal-400">My Journal</h5>
          </Link>
          <Link href="/create-room" className="kahoot-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">➕</div>
            <h5 className="font-semibold text-teal-400">Create Room</h5>
          </Link>
          <Link href="/join-room" className="kahoot-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">🚪</div>
            <h5 className="font-semibold text-teal-400">Join Room</h5>
          </Link>
          <Link href="/submit-question" className="kahoot-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">✍️</div>
            <h5 className="font-semibold text-teal-400">Submit Question</h5>
          </Link>
          <Link href="/profile" className="kahoot-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">⚙️</div>
            <h5 className="font-semibold text-teal-400">Settings</h5>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
