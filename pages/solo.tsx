import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/Card';
import { Question } from '@/lib/supabase';

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

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setGameMode('solo');

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
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
      saveQuestion(gameState.currentQuestion, response);
    }
    setResponse('');
    setShowResponse(false);
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-mystical-gold"></div>
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
          <h1 className="text-4xl font-mystical mb-6 text-mystical-gold">Choose Your Depth</h1>
          <p className="text-gray-300 mb-12 text-lg">
            Select the conversation level that resonates with your current mood
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('green')}
              className="mystical-card level-green p-8 cursor-pointer"
            >
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-mystical mb-4 text-green-oracle">Icebreaker</h3>
              <p className="text-gray-300">Light, playful questions to ease into self-reflection</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('yellow')}
              className="mystical-card level-yellow p-8 cursor-pointer"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-mystical mb-4 text-yellow-oracle">Exploration</h3>
              <p className="text-gray-300">Deeper questions about values, dreams, and perspectives</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => handleLevelSelect('red')}
              className="mystical-card level-red p-8 cursor-pointer"
            >
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-mystical mb-4 text-red-oracle">Vulnerability</h3>
              <p className="text-gray-300">Intimate questions that touch the heart and soul</p>
            </motion.div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-mystical-gold transition-colors"
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
          className="text-gray-400 hover:text-mystical-gold transition-colors"
        >
          ← Change Level
        </button>
        <h1 className="text-xl font-mystical text-mystical-gold">
          Solo Journey • {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}
        </h1>
        <button
          onClick={() => router.push('/journal')}
          className="text-gray-400 hover:text-mystical-gold transition-colors"
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
              className="mystical-card p-8 w-full max-w-2xl"
            >
              <h3 className="text-xl font-mystical mb-4 text-mystical-gold">Capture Your Insight</h3>
              <p className="text-gray-300 mb-6">{gameState.currentQuestion?.text}</p>

              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your thoughts, feelings, or insights..."
                className="w-full h-40 p-4 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mystical-gold text-white resize-none"
              />

              <div className="flex space-x-4 mt-6">
                <button onClick={handleSaveResponse} className="oracle-button flex-1">
                  Save to Journal
                </button>
                <button
                  onClick={handleSkipResponse}
                  className="border border-gray-600 text-gray-300 px-6 py-3 rounded-full hover:border-mystical-gold hover:text-mystical-gold transition-all"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          ) : showEndOfDeck ? (
            <motion.div
              key="endofdeck"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mystical-card p-8 text-center w-full max-w-md"
            >
              <div className="text-6xl mb-6">🌟</div>
              <h3 className="text-2xl font-mystical mb-4 text-mystical-gold">Journey Complete</h3>
              <p className="text-gray-300 mb-8">
                You've explored all questions in this level. What would you like to do next?
              </p>

              <div className="space-y-4">
                <button onClick={reshuffleDeck} className="w-full oracle-button">
                  Draw New Fate (Same Level)
                </button>
                <button
                  onClick={() => router.push('/journal')}
                  className="w-full border border-mystical-gold text-mystical-gold px-6 py-3 rounded-full hover:bg-mystical-gold hover:text-mystical-dark transition-all"
                >
                  Review Insights
                </button>
                <button
                  onClick={changeLevels}
                  className="w-full border border-gray-600 text-gray-300 px-6 py-3 rounded-full hover:border-mystical-gold hover:text-mystical-gold transition-all"
                >
                  Consult New Deck
                </button>
              </div>
            </motion.div>
          ) : (
            availableQuestions[currentQuestionIndex] && (
              <Card
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
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1}</span>
            <span>{availableQuestions.length} Total</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-mystical-gold to-mystical-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / availableQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
