import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase, Question } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface SavedInsight {
  id: string;
  response: string | null;
  saved_at: string;
  questions: Question[];
}

export default function Journal() {
  const { user } = useAuth();
  const router = useRouter();
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_questions')
        .select(
          `
          id,
          response,
          saved_at,
          questions (*)
        `
        )
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Error fetching insights:', error);
      } else {
        setInsights(data as SavedInsight[]);
      }
      setLoading(false);
    };

    fetchInsights();
  }, [user, router]);

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'green':
        return 'level-green';
      case 'yellow':
        return 'level-yellow';
      case 'red':
        return 'level-red';
      default:
        return 'level-green';
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('saved_questions').delete().eq('id', id).eq('user_id', user.id);
    if (!error) {
      setInsights((prev) => prev.filter((insight) => insight.id !== id));
    }
  };

  if (loading) {
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
        <Link href="/dashboard" className="text-gray-400 hover:text-mystical-gold transition-colors">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-mystical text-mystical-gold">My Journal</h1>
        <div className="w-24"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {insights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📖</div>
            <h2 className="text-3xl font-mystical text-mystical-gold mb-4">Your Journal is Empty</h2>
            <p className="text-gray-300 mb-8">
              Play a solo game and swipe right on questions to save your insights here.
            </p>
            <Link href="/solo" className="oracle-button">
              Start a Solo Journey
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`mystical-card p-6 ${
                  insight.questions.length > 0 ? getLevelClass(insight.questions[0].level) : ''
                }`}
              >
                {insight.questions.length > 0 && (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">
                        {new Date(insight.saved_at).toLocaleDateString()} • {insight.questions[0].theme}
                      </p>
                      <h3 className="text-lg font-oracle leading-relaxed text-white mb-4">
                        {insight.questions[0].text}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1 text-sm rounded-full border ${
                        insight.questions[0].level === 'green'
                          ? 'border-green-oracle text-green-oracle'
                          : insight.questions[0].level === 'yellow'
                          ? 'border-yellow-oracle text-yellow-oracle'
                          : 'border-red-oracle text-red-oracle'
                      }`}
                    >
                      {insight.questions[0].level}
                    </div>
                  </div>
                )}

                {insight.response && (
                  <div className="mt-4 pt-4 border-t border-mystical-gold/20">
                    <p className="text-gray-200 whitespace-pre-wrap">{insight.response}</p>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(insight.id)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Remove from Journal
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
