import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mystical text-mystical-gold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Enter the sacred circle</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full oracle-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entering...' : 'Enter the Circle'}
          </button>
        </form>

        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2 border border-gray-600 text-gray-300 px-6 py-3 rounded-full hover:border-mystical-gold hover:text-mystical-gold transition-all"
        >
            <img src="https://www.google.com/favicon.ico" alt="Google icon" className="w-5 h-5" />
            <span>Sign in with Google</span>
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            New to the oracle?{' '}
            <Link href="/auth/register" className="text-mystical-gold hover:underline">
              Join the circle
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-mystical-gold transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
