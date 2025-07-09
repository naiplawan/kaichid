import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-mystical-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-mystical text-mystical-gold"
        >
          KAICHID
        </motion.h1>
        <nav className="space-x-4">
          <Link href="/auth/login" className="oracle-button">
            Sign In
          </Link>
          <Link href="/auth/register" className="oracle-button">
            Join KAICHID
          </Link>
          <Link href="/demo" className="oracle-button bg-gradient-to-r from-green-400 to-purple-500 text-white">
            Try Demo
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-6xl font-mystical mb-6 bg-gradient-to-r from-mystical-gold to-mystical-purple bg-clip-text text-transparent">
            Unveil the Depths of Connection
          </h2>

          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Foster genuine human connections through guided, meaningful conversations. Journey from icebreakers to
            vulnerability with friends or in solitude.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <motion.div whileHover={{ scale: 1.05 }} className="mystical-card p-6 level-green">
                <div className="text-green-oracle text-4xl mb-4">🌱</div>
                <h3 className="font-mystical text-xl mb-2 text-green-oracle">Icebreaker</h3>
                <p className="text-gray-300 text-sm">
                  Begin with gentle questions that spark curiosity and ease into conversation.
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="mystical-card p-6 level-yellow">
                <div className="text-yellow-oracle text-4xl mb-4">🔍</div>
                <h3 className="font-mystical text-xl mb-2 text-yellow-oracle">Exploration</h3>
                <p className="text-gray-300 text-sm">
                  Dive deeper with questions that reveal values, dreams, and perspectives.
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="mystical-card p-6 level-red">
                <div className="text-red-oracle text-4xl mb-4">❤️</div>
                <h3 className="font-mystical text-xl mb-2 text-red-oracle">Vulnerability</h3>
                <p className="text-gray-300 text-sm">
                  Share authentic moments with questions that touch the heart and soul.
                </p>
              </motion.div>
            </div>

            <div className="space-x-4">
              <Link href="/auth/register" className="oracle-button text-lg px-8 py-4">
                Begin Your Journey
              </Link>
              <Link
                href="/demo"
                className="border border-mystical-gold text-mystical-gold px-8 py-4 rounded-full hover:bg-mystical-gold hover:text-mystical-dark transition-all duration-300"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <h3 className="text-3xl font-mystical mb-12 text-center text-mystical-gold">KAICHID Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-mystical-purple text-3xl mb-4">🎭</div>
              <h4 className="font-semibold mb-2">Solo Reflection</h4>
              <p className="text-gray-400 text-sm">
                Journey within yourself with private journaling and self-discovery.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-mystical-purple text-3xl mb-4">👥</div>
              <h4 className="font-semibold mb-2">Group Sessions</h4>
              <p className="text-gray-400 text-sm">Connect with friends in real-time multiplayer conversations.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-mystical-purple text-3xl mb-4">📖</div>
              <h4 className="font-semibold mb-2">Personal Journal</h4>
              <p className="text-gray-400 text-sm">Save insights and responses to track your growth over time.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-mystical-purple text-3xl mb-4">🎨</div>
              <h4 className="font-semibold mb-2">Mystical Design</h4>
              <p className="text-gray-400 text-sm">Beautiful tarot-inspired cards create an enchanting experience.</p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 border-t border-gray-800">
        <p>&copy; 2025 KAICHID. Fostering authentic connections.</p>
      </footer>
    </div>
  );
}
