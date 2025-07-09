import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-mystical-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-mystical text-mystical-gold">KAICHID</h1>
        <div className="flex items-center space-x-4">
          <Link href="/demo" className="oracle-button bg-gradient-to-r from-green-400 to-purple-500 text-white">
            Try Demo
          </Link>
          <span className="text-gray-300">Welcome, {user.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-mystical-gold transition-colors">
            Leave Circle
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-4xl font-mystical mb-4 bg-gradient-to-r from-mystical-gold to-mystical-purple bg-clip-text text-transparent">
            Choose Your Path
          </h2>
          <p className="text-gray-300 text-lg">Will you journey within yourself or connect with others?</p>
        </motion.div>

        {/* Game Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="mystical-card p-8 text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <Link href="/solo">
              <div>
                <div className="text-6xl mb-6">🧘‍♀️</div>
                <h3 className="text-2xl font-mystical mb-4 text-mystical-gold">Solo Journey</h3>
                <p className="text-gray-300 mb-6">
                  Embark on a personal quest of self-discovery. Reflect, journal, and grow through guided questions.
                </p>
                <div className="oracle-button inline-block">Begin Solitude</div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="mystical-card p-8 text-center cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            <Link href="/multiplayer">
              <div>
                <div className="text-6xl mb-6">👥</div>
                <h3 className="text-2xl font-mystical mb-4 text-mystical-gold">KAICHID Circle</h3>
                <p className="text-gray-300 mb-6">
                  Connect with friends in real-time conversations. Share insights and deepen bonds together.
                </p>
                <div className="oracle-button inline-block">Enter Circle</div>
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
          <div className="mystical-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-mystical-gold">Questions Explored</h4>
            <p className="text-3xl font-bold text-white">42</p>
          </div>
          <div className="mystical-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-mystical-gold">Insights Saved</h4>
            <p className="text-3xl font-bold text-white">18</p>
          </div>
          <div className="mystical-card p-6 text-center">
            <h4 className="text-lg font-semibold mb-2 text-mystical-gold">Circles Joined</h4>
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
          <Link href="/journal" className="mystical-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">📖</div>
            <h5 className="font-semibold text-mystical-gold">My Journal</h5>
          </Link>
          <Link href="/create-room" className="mystical-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">➕</div>
            <h5 className="font-semibold text-mystical-gold">Create Room</h5>
          </Link>
          <Link href="/join-room" className="mystical-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">🚪</div>
            <h5 className="font-semibold text-mystical-gold">Join Room</h5>
          </Link>
          <Link href="/submit-question" className="mystical-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">✍️</div>
            <h5 className="font-semibold text-mystical-gold">Submit Question</h5>
          </Link>
          <Link href="/profile" className="mystical-card p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">⚙️</div>
            <h5 className="font-semibold text-mystical-gold">Settings</h5>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
