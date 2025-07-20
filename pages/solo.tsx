import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { GameCard } from '@/components/ui/game-card';
import { Question } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Heart, SkipForward, Shuffle, Home, BookOpen } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function Solo() {
  const { user } = useAuth();
  const { gameState, setGameMode, setLevel, setCurrentQuestion, saveQuestion, markQuestionPlayed } = useGame();
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<'green' | 'yellow' | 'red'>('green');
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [privacy, setPrivacy] = useState<'private' | 'shared'>('private');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setGameMode('solo');

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, text, level, theme, is_custom, created_at, status, reported_count')
        .eq('level', selectedLevel)
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setAvailableQuestions(data || []);
      }
    };

    fetchQuestions();
  }, [user, router, setGameMode, selectedLevel]);

  const handleLevelSelect = (level: 'green' | 'yellow' | 'red') => {
    setSelectedLevel(level);
    setLevel(level);
    setShowLevelSelect(false);
  };

  const handleCardSwipe = (direction: 'left' | 'right', question: Question) => {
    markQuestionPlayed(question.id);

    if (direction === 'right') {
      // Insight - show response input
      setCurrentQuestion(question);
      setShowResponse(true);
    } else {
      // Skip - move to next question
      nextQuestion();
    }
  };

  const handleSaveResponse = () => {
    if (gameState.currentQuestion) {
      saveQuestion(gameState.currentQuestion, response, privacy);
    }
    setResponse('');
    setShowResponse(false);
    setPrivacy('private');
    nextQuestion();
  };

  const handleSkipResponse = () => {
    setResponse('');
    setShowResponse(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < availableQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End of deck
      setShowEndOfDeck(true);
    }
  };

  const [showEndOfDeck, setShowEndOfDeck] = useState(false);

  const reshuffleDeck = () => {
    setCurrentQuestionIndex(0);
    setShowEndOfDeck(false);
  };

  const changeLevels = () => {
    setShowLevelSelect(true);
    setShowEndOfDeck(false);
  };

  const handleReportQuestion = async (questionId: string) => {
    const { error } = await supabase.rpc('increment_reported_count', { q_id: questionId });
    if (error) {
      console.error('Error reporting question:', error);
    } else {
      // Maybe show a confirmation to the user
      console.log('Question reported');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-teal h-32 w-32"></div>
      </div>
    );
  }

  if (showLevelSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl font-kahoot font-bold mb-6 text-teal-400">Choose Your Depth</h1>
          <p className="text-teal-200/80 mb-12 text-lg font-medium">
            Select the conversation level that resonates with your current mood
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('green')}
              className="kahoot-card level-green p-8 cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-kahoot font-bold mb-4 text-kahoot-green">Icebreaker</h3>
              <p className="text-teal-200/70">Light, playful questions to ease into self-reflection</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('yellow')}
              className="kahoot-card level-yellow p-8 cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-kahoot font-bold mb-4 text-kahoot-yellow">Exploration</h3>
              <p className="text-teal-200/70">Deeper questions about values, dreams, and perspectives</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('red')}
              className="kahoot-card level-red p-8 cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-kahoot font-bold mb-4 text-kahoot-red">Vulnerability</h3>
              <p className="text-teal-200/70">Intimate questions that touch the heart and soul</p>
            </motion.div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-teal-400/60 hover:text-teal-300 transition-colors font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-800">
        <button
          onClick={() => setShowLevelSelect(true)}
          className="text-teal-400/60 hover:text-teal-300 transition-colors font-medium"
        >
          ← Change Level
        </button>
        <h1 className="text-xl font-kahoot font-bold text-teal-400">
          Solo Journey • {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
        </h1>
        <button
          onClick={() => router.push('/journal')}
          className="text-teal-400/60 hover:text-teal-300 transition-colors font-medium"
        >
          My Journal
        </button>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {showResponse ? (
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="kahoot-card p-8 w-full max-w-2xl"
            >
              <h3 className="text-xl font-kahoot font-bold mb-4 text-teal-400">Capture Your Insight</h3>
              <p className="text-teal-200/80 mb-6">{gameState.currentQuestion?.text}</p>

              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your thoughts, feelings, or insights..."
                className="w-full h-40 p-4 bg-kahoot-dark-surface border border-teal-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-100 resize-none backdrop-blur-sm"
              />

              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-teal-200">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === 'private'}
                    onChange={() => setPrivacy('private')}
                  />
                  Private
                </label>
                <label className="flex items-center gap-2 text-teal-200">
                  <input
                    type="radio"
                    name="privacy"
                    value="shared"
                    checked={privacy === 'shared'}
                    onChange={() => setPrivacy('shared')}
                  />
                  Shared
                </label>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button onClick={handleSaveResponse} className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Save to Journal
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSkipResponse}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              </div>
            </motion.div>
          ) : showEndOfDeck ? (
            <motion.div
              key="endofdeck"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="kahoot-card p-8 text-center w-full max-w-md"
            >
              <div className="text-6xl mb-6">🌟</div>
              <h3 className="text-2xl font-kahoot font-bold mb-4 text-teal-400">Journey Complete</h3>
              <p className="text-teal-200/80 mb-8">
                You've explored all questions in this level. What would you like to do next?
              </p>

              <div className="space-y-4">
                <Button onClick={reshuffleDeck} className="w-full" size="lg">
                  <Shuffle className="w-5 h-5 mr-2" />
                  Draw New Fate (Same Level)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/journal')}
                  className="w-full"
                  size="lg"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Review Insights
                </Button>
                <Button
                  variant="secondary"
                  onClick={changeLevels}
                  className="w-full"
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Consult New Deck
                </Button>
              </div>
            </motion.div>
          ) : (
            availableQuestions[currentQuestionIndex] && (
              <GameCard
                key={availableQuestions[currentQuestionIndex].id}
                question={availableQuestions[currentQuestionIndex]}
                onSwipe={handleCardSwipe}
                onReport={handleReportQuestion}
              />
            )
          )}
        </AnimatePresence>
      </main>

      {/* Progress */}
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-teal-400/70 mb-2 font-medium">
            <span>Question {currentQuestionIndex + 1}</span>
            <span>{availableQuestions.length} Total</span>
          </div>
          <div className="w-full bg-kahoot-dark-surface rounded-full h-3 border border-teal-500/20">
            <div
              className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-teal-500/30"
              style={{ width: `${((currentQuestionIndex + 1) / availableQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
