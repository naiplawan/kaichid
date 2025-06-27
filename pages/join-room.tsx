
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mystical text-mystical-gold mb-2">Join a Sacred Circle</h1>
          <p className="text-gray-400">Enter the 6-digit code to join your friends.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}

        <div className="space-y-6">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white text-2xl text-center tracking-widest font-mono"
            placeholder="XYZ123"
          />

          <button
            onClick={handleJoinRoom}
            className="w-full oracle-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Circle
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
