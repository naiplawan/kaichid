import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Custom404() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const mysticalMessages = [
    "KAICHID's vision grows cloudy...",
    'This path leads to the void...',
    'The cards reveal nothing here...',
    'The mystical realm has shifted...',
    'Even KAICHID cannot find this...',
  ];

  const randomMessage = mysticalMessages[Math.floor(Math.random() * mysticalMessages.length)];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-mystical-dark via-purple-900/20 to-mystical-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mystical-card p-8 text-center max-w-2xl relative overflow-hidden"
      >
        {/* Mystical background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-mystical-gold/5 via-transparent to-purple-500/5 animate-pulse"></div>

        {/* Floating orbs */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-mystical-gold rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>

        <div className="relative z-10">
          {/* Mystical 404 */}
          <motion.div
            initial={{ rotateX: -90 }}
            animate={{ rotateX: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-8xl font-mystical text-transparent bg-gradient-to-r from-mystical-gold via-yellow-300 to-mystical-gold bg-clip-text mb-2">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-mystical-gold to-transparent mx-auto"></div>
          </motion.div>

          {/* Oracle message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-mystical text-mystical-gold mb-3">KAICHID Says</h2>
            <p className="text-lg text-gray-300 italic mb-4">"{randomMessage}"</p>
            <p className="text-gray-400">The page you seek has wandered into the ethereal realm and cannot be found.</p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <div className="w-2 h-2 bg-mystical-gold rounded-full animate-pulse"></div>
              <span>Returning to KAICHID in {countdown} seconds</span>
              <div className="w-2 h-2 bg-mystical-gold rounded-full animate-pulse"></div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
              <motion.div
                className="bg-gradient-to-r from-mystical-gold to-yellow-400 h-2 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
              ></motion.div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary">
                🏠 Return to Dashboard
              </Link>
              <Link href="/solo" className="btn-secondary">
                🎴 Begin Solo Journey
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-room" className="btn-mystical">
                ✨ Create KAICHID Circle
              </Link>
              <Link href="/join-room" className="btn-mystical">
                🌟 Join Friends
              </Link>
            </div>
          </motion.div>

          {/* Mystical footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-700"
          >
            <p className="text-xs text-gray-500 italic">
              "In the realm of meaningful connections, every path leads somewhere beautiful."
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
