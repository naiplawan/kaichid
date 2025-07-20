import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase, Question } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Book, ArrowLeft, Trash2, Heart, Calendar, Tag, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

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
    <div className="min-h-screen cyber-grid">
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
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Card className="neon-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center space-x-2 text-teal-400/60 hover:text-teal-300 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:animate-cyber-glitch" />
                <span>Back to Dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Book className="w-8 h-8 text-teal-400" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-kahoot font-bold text-teal-400">Soul Journal</h1>
                  <p className="text-teal-200/60 text-sm">Your saved insights and reflections</p>
                </div>
              </div>
              
              <div className="w-24"></div>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto p-6">
        {insights.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Card className="neon-border max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <motion.div
                  className="text-8xl mb-8"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  📖
                </motion.div>
                <h2 className="text-4xl font-kahoot font-bold text-teal-400 mb-6">Your Soul Journal Awaits</h2>
                <p className="text-teal-200/70 mb-8 text-lg leading-relaxed">
                  Begin your journey of self-discovery. Play solo games and save meaningful insights that resonate with your soul.
                </p>
                
                <div className="space-y-4">
                  <Button size="lg" onClick={() => router.push('/solo')} className="w-full max-w-xs">
                    <Play className="w-5 h-5 mr-2" />
                    Start Solo Journey
                  </Button>
                  <p className="text-teal-300/50 text-sm">
                    Swipe right ♥ on questions that speak to you
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-kahoot font-bold text-teal-400 mb-2">
                {insights.length} Saved Insights
              </h2>
              <p className="text-teal-200/60">Your collection of meaningful moments</p>
            </motion.div>
            
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className={`neon-border ${
                    insight.questions.length > 0 ? getLevelClass(insight.questions[0]?.level || 'green') : ''
                  }`}>
                    <CardContent className="p-6">
                      {insight.questions.length > 0 && (
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2 text-sm text-teal-300/70">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(insight.saved_at).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-teal-300/70">
                                <Tag className="w-4 h-4" />
                                <span>{insight.questions[0]?.theme}</span>
                              </div>
                            </div>
                            <h3 className="text-xl font-kahoot leading-relaxed text-teal-100 mb-4">
                              {insight.questions[0]?.text}
                            </h3>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-2 text-sm rounded-full border font-kahoot font-bold ${
                              insight.questions[0]?.level === 'green'
                                ? 'border-kahoot-green text-kahoot-green bg-kahoot-green/10'
                                : insight.questions[0]?.level === 'yellow'
                                ? 'border-kahoot-yellow text-kahoot-yellow bg-kahoot-yellow/10'
                                : 'border-kahoot-red text-kahoot-red bg-kahoot-red/10'
                            }`}
                          >
                            {insight.questions[0]?.level}
                          </motion.div>
                        </div>
                      )}

                      {insight.response && (
                        <div className="kahoot-card p-6 mb-6 bg-teal-500/5 border-teal-500/20">
                          <div className="flex items-center space-x-2 mb-3">
                            <Heart className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-kahoot font-medium text-teal-300">Your Reflection</span>
                          </div>
                          <p className="text-teal-200/90 whitespace-pre-wrap leading-relaxed">
                            {insight.response}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(insight.id)}
                          className="relative overflow-hidden"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove from Journal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: insights.length * 0.1 + 0.5 }}
              className="text-center pt-12"
            >
              <Card className="neon-border">
                <CardContent className="p-8">
                  <h3 className="text-xl font-kahoot font-bold text-teal-400 mb-4">Continue Your Journey</h3>
                  <p className="text-teal-200/70 mb-6">Discover more insights about yourself</p>
                  <Button onClick={() => router.push('/solo')} size="lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Explore More Questions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
