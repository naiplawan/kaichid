import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SubmitQuestion() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [level, setLevel] = useState<'green' | 'yellow' | 'red'>('green');
  const [theme, setTheme] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!questionText || !theme) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const { error } = await supabase.from('questions').insert([
      {
        text: questionText,
        level,
        theme,
        is_custom: true,
        creator_id: user.id,
        status: 'pending',
      },
    ]);

    if (error) {
      setError('Failed to submit question. Please try again.');
      console.error('Error submitting question:', error);
    } else {
      setSuccess(true);
      setQuestionText('');
      setTheme('');
      setLevel('green');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mystical-card p-8 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mystical text-mystical-gold mb-2">Submit a Question</h1>
          <p className="text-gray-400">Contribute to the collective wisdom of the oracle.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded mb-6">
            Your question has been submitted for review. Thank you!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="questionText" className="block text-lg font-medium text-gray-300 mb-2">
              Your Question
            </label>
            <textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white resize-none"
              placeholder="e.g., What is a belief you hold that you would like to challenge?"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-300 mb-2">Level</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setLevel('green')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  level === 'green' ? 'border-green-oracle bg-green-oracle/20' : 'border-gray-600'
                }`}
              >
                Green
              </button>
              <button
                type="button"
                onClick={() => setLevel('yellow')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  level === 'yellow' ? 'border-yellow-oracle bg-yellow-oracle/20' : 'border-gray-600'
                }`}
              >
                Yellow
              </button>
              <button
                type="button"
                onClick={() => setLevel('red')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  level === 'red' ? 'border-red-oracle bg-red-oracle/20' : 'border-gray-600'
                }`}
              >
                Red
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="theme" className="block text-lg font-medium text-gray-300 mb-2">
              Theme
            </label>
            <input
              type="text"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white"
              placeholder="e.g., Self-Discovery"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full oracle-button py-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-mystical-gold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
