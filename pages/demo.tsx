import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import demoLocale from '../locales/demo.json';

interface DemoQuestion {
  id: number;
  text: string;
  level: 'green' | 'yellow' | 'red';
  theme: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  personality: string;
  responses: { [questionId: number]: string };
  savedQuestions: number[];
  stats: {
    questionsAnswered: number;
    roomsJoined: number;
    insightsSaved: number;
  };
}

const mockUsers: MockUser[] = [
  {
    id: 'user1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: '👩‍🎨',
    personality: 'Creative and introspective',
    responses: {
      1: "Watching my dog chase butterflies in the garden. There's something pure about that moment of joy.",
      3: "I used to believe success meant climbing the corporate ladder. Now I think it's about creating meaningful connections.",
      5: 'I overcame my fear of public speaking by joining a local storytelling group. It taught me vulnerability is strength.',
    },
    savedQuestions: [1, 3, 5],
    stats: { questionsAnswered: 23, roomsJoined: 7, insightsSaved: 15 },
  },
  {
    id: 'user2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@example.com',
    avatar: '🧑‍💼',
    personality: 'Thoughtful and analytical',
    responses: {
      2: "Leonardo da Vinci. I'd love to understand how he connected art, science, and invention so seamlessly.",
      4: "When I'm mentoring younger colleagues. Helping others grow feels like my truest self.",
      6: "I'd start a foundation that teaches emotional intelligence in schools worldwide.",
    },
    savedQuestions: [2, 4, 6],
    stats: { questionsAnswered: 31, roomsJoined: 12, insightsSaved: 22 },
  },
  {
    id: 'user3',
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    avatar: '🌸',
    personality: 'Empathetic and wise',
    responses: {
      1: "The sound of rain on the roof while I'm reading a good book with tea in hand.",
      2: 'Maya Angelou. Her wisdom about resilience and grace would be incredible to experience firsthand.',
      3: "I used to think showing emotion was weakness. Now I know it's the foundation of authentic connection.",
    },
    savedQuestions: [1, 2, 3],
    stats: { questionsAnswered: 28, roomsJoined: 9, insightsSaved: 19 },
  },
  {
    id: 'user4',
    name: 'Alex Kim',
    email: 'alex.kim@example.com',
    avatar: '🎭',
    personality: 'Adventurous and philosophical',
    responses: {
      4: 'During late-night conversations with close friends, when all pretenses drop away.',
      5: 'I overcame my fear of failure by embracing it as a teacher. Each setback became a stepping stone.',
      6: "I'd travel to every country and document the universal human experiences that connect us all.",
    },
    savedQuestions: [4, 5, 6],
    stats: { questionsAnswered: 19, roomsJoined: 15, insightsSaved: 12 },
  },
];

const demoQuestions: DemoQuestion[] = [
  {
    id: 1,
    text: "What's one simple thing that always makes you smile?",
    level: 'green',
    theme: 'Joy & Happiness',
  },
  {
    id: 2,
    text: 'If you could have dinner with anyone from history, who would it be and why?',
    level: 'green',
    theme: 'Curiosity & Wonder',
  },
  {
    id: 3,
    text: "What's a belief you held strongly in the past that has completely changed?",
    level: 'yellow',
    theme: 'Growth & Change',
  },
  {
    id: 4,
    text: 'When do you feel most authentically yourself?',
    level: 'yellow',
    theme: 'Identity & Self',
  },
  {
    id: 5,
    text: "What's a fear you've overcome, and how did it change you?",
    level: 'red',
    theme: 'Courage & Vulnerability',
  },
  {
    id: 6,
    text: "If you knew you couldn't fail, what would you attempt?",
    level: 'red',
    theme: 'Dreams & Aspirations',
  },
];

export default function Demo() {
  const [currentStep, setCurrentStep] = useState<
    'intro' | 'solo' | 'multiplayer' | 'features' | 'userProfiles' | 'mockAuth'
  >('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [sampleResponse, setSampleResponse] = useState('');
  const [players] = useState(['You', 'Sarah', 'Marcus', 'Emma']);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [roomCode] = useState('ABC123');
  const [selectedMockUser, setSelectedMockUser] = useState<MockUser | null>(null);
  const [mockUserResponses, setMockUserResponses] = useState<{ [userId: string]: string }>({});
  const [currentMockUserIndex, setCurrentMockUserIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const locale = (demoLocale as any)[language];

  const currentQuestion = demoQuestions[currentQuestionIndex];
  const currentMockUser = mockUsers[currentMockUserIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < demoQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowResponse(false);
      setSampleResponse('');
      if (currentStep === 'multiplayer') {
        setCurrentPlayer((prev) => (prev + 1) % players.length);
      }
    }
  };

  const handleSwipe = (direction: 'insight' | 'skip') => {
    if (direction === 'insight') {
      setShowResponse(true);
      if (currentStep === 'solo') {
        // Use mock user response if available
        const mockResponse = currentMockUser?.responses[currentQuestion.id];
        setSampleResponse(
          mockResponse ||
            "I feel most authentic when I'm working on creative projects late at night, when the world is quiet and I can truly focus on expressing my ideas without judgment."
        );
      }
    } else {
      setTimeout(handleNextQuestion, 500);
    }
  };

  const simulateMultiplayerResponse = () => {
    const currentPlayerName = players[currentPlayer];
    const mockUser = mockUsers.find((user) => user.name.startsWith(currentPlayerName));
    if (mockUser && mockUser.responses[currentQuestion.id]) {
      setMockUserResponses((prev) => ({
        ...prev,
        [mockUser.id]: mockUser.responses[currentQuestion.id],
      }));
    }
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const switchMockUser = (user: MockUser) => {
    setSelectedMockUser(user);
    setCurrentMockUserIndex(mockUsers.findIndex((u) => u.id === user.id));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'green':
        return 'from-green-oracle to-green-light';
      case 'yellow':
        return 'from-yellow-oracle to-yellow-light';
      case 'red':
        return 'from-red-oracle to-red-light';
      default:
        return 'from-mystical-purple to-mystical-gold';
    }
  };

  const getLevelBorder = (level: string) => {
    switch (level) {
      case 'green':
        return 'border-green-oracle';
      case 'yellow':
        return 'border-yellow-oracle';
      case 'red':
        return 'border-red-oracle';
      default:
        return 'border-mystical-gold';
    }
  };

  return (
    <>
      <Head>
        <title>KAICHID Demo - Experience Meaningful Conversations</title>
        <meta
          name="description"
          content="Try the KAICHID experience - meaningful conversation cards for deeper connections"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-mystical-dark via-gray-900 to-mystical-purple">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-mystical text-mystical-gold hover:text-yellow-400 transition-colors">
            ← {locale.backToHome}
          </Link>
          <h1 className="text-3xl font-mystical text-mystical-gold">KAICHID Demo</h1>
          <button
            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
            className="oracle-button bg-mystical-gold text-mystical-dark"
          >
            {language === 'en' ? 'ภาษาไทย' : 'ENGLISH'}
          </button>
        </header>

        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Intro Step */}
            {currentStep === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-mystical text-mystical-gold mb-6"
                >
                  {locale.welcome}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-300 mb-12 leading-relaxed"
                >
                  {locale.experiencePower}
                </motion.p>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mystical-card p-6 text-center"
                  >
                    <div className="text-green-oracle text-4xl mb-4">🌱</div>
                    <h3 className="text-xl font-semibold text-green-oracle mb-2">{locale.greenLevel}</h3>
                    <p className="text-gray-300">
                      {locale.gentleIcebreakers}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mystical-card p-6 text-center"
                  >
                    <div className="text-yellow-oracle text-4xl mb-4">🌟</div>
                    <h3 className="text-xl font-semibold text-yellow-oracle mb-2">
                      {locale.yellowLevel}
                    </h3>
                    <p className="text-gray-300">
                      {locale.deeperQuestions}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="mystical-card p-6 text-center"
                  >
                    <div className="text-red-oracle text-4xl mb-4">🔥</div>
                    <h3 className="text-xl font-semibold text-red-oracle mb-2">{locale.redLevel}</h3>
                    <p className="text-gray-300">
                      {locale.vulnerableSharing}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-4"
                >
                  <p className="text-gray-400 mb-8">
                    {locale.chooseDemoExperience}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center">
                    <button onClick={() => setCurrentStep('solo')} className="oracle-button text-lg px-6 py-4">
                      {locale.soloModeDemo}
                    </button>
                    <button onClick={() => setCurrentStep('multiplayer')} className="oracle-button text-lg px-6 py-4">
                      {locale.multiplayerDemo}
                    </button>
                    <button onClick={() => setCurrentStep('userProfiles')} className="oracle-button text-lg px-6 py-4">
                      {locale.userProfiles}
                    </button>
                    <button onClick={() => setCurrentStep('mockAuth')} className="oracle-button text-lg px-6 py-4">
                      {locale.mockAuthentication}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mystical-card p-6 mb-12 text-left max-w-2xl mx-auto"
                >
                  <h3 className="text-2xl font-mystical text-mystical-gold mb-4">{locale.howToPlay}</h3>
                  <ol className="list-decimal list-inside text-gray-200 space-y-2">
                    {locale.howToPlaySteps.map((step: string, index: number) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  <div className="mt-4 text-sm text-gray-400">
                    {locale.safeSpace}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Solo Mode Demo */}
            {currentStep === 'solo' && (
              <motion.div
                key="solo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-mystical text-mystical-gold mb-4">
                    {locale.soloModeExperience}
                  </h2>
                  <p className="text-gray-300">
                    {locale.swipeRightForInsight}
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <span className="text-green-400">← {locale.skip}</span>
                    <span className="text-red-400">{locale.insight} →</span>
                  </div>
                </div>

                {/* Question Card */}
                <motion.div
                  key={currentQuestion.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mystical-card p-8 text-center mb-8 border-2 ${getLevelBorder(currentQuestion.level)}`}
                  style={{ minHeight: '300px' }}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${getLevelColor(
                      currentQuestion.level
                    )} text-white`}
                  >
                    {currentQuestion.level.toUpperCase()} • {currentQuestion.theme}
                  </div>

                  <h3 className="text-2xl font-oracle text-white mb-6 leading-relaxed">{currentQuestion.text}</h3>

                  <div className="flex justify-center gap-8">
                    <button
                      onClick={() => handleSwipe('skip')}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      {locale.skip}
                    </button>
                    <button
                      onClick={() => handleSwipe('insight')}
                      className="bg-gradient-to-r from-mystical-purple to-mystical-gold text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform"
                    >
                      {locale.insight}
                    </button>
                  </div>
                </motion.div>

                {/* Response Section */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mystical-card p-6 mb-8"
                    >
                      <h4 className="text-xl font-semibold text-mystical-gold mb-4">
                        {locale.yourReflection}
                      </h4>
                      <textarea
                        value={sampleResponse}
                        onChange={(e) => setSampleResponse(e.target.value)}
                        placeholder={locale.shareYourThoughts}
                        className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-mystical-gold"
                      />
                      <div className="flex justify-between mt-4">
                        <button onClick={handleNextQuestion} className="btn-primary">
                          {locale.saveAndContinue}
                        </button>
                        <span className="text-gray-400 text-sm">
                          {locale.question} {currentQuestionIndex + 1} {locale.of} {demoQuestions.length}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center">
                  <button
                    onClick={() => setCurrentStep('intro')}
                    className="text-mystical-gold hover:text-yellow-400 transition-colors"
                  >
                    ← {locale.backToDemoSelection}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Multiplayer Mode Demo */}
            {currentStep === 'multiplayer' && (
              <motion.div
                key="multiplayer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-mystical text-mystical-gold mb-4">
                    {locale.multiplayerExperience}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    {locale.roomCode}: <span className="font-mono text-mystical-gold">{roomCode}</span>
                  </p>
                </div>

                {/* Players Bar */}
                <div className="flex justify-center gap-4 mb-8">
                  {players.map((player, index) => (
                    <div
                      key={player}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        index === currentPlayer
                          ? 'border-mystical-gold bg-mystical-gold/20 text-mystical-gold'
                          : 'border-gray-600 bg-gray-800 text-gray-300'
                      }`}
                    >
                      {player} {index === currentPlayer && '(Current)'}
                    </div>
                  ))}
                </div>

                {/* Current Player Indicator */}
                <div className="text-center mb-6">
                  <p className="text-xl text-white">
                    {locale.itsTurn}
                    <span className="text-mystical-gold font-semibold">{` ${players[currentPlayer]}`}</span>
                  </p>
                </div>

                {/* Question Card */}
                <motion.div
                  key={`mp-${currentQuestion.id}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mystical-card p-8 text-center mb-8 border-2 ${getLevelBorder(currentQuestion.level)}`}
                  style={{ minHeight: '300px' }}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${getLevelColor(
                      currentQuestion.level
                    )} text-white`}
                  >
                    {currentQuestion.level.toUpperCase()} • {currentQuestion.theme}
                  </div>

                  <h3 className="text-2xl font-oracle text-white mb-6 leading-relaxed">{currentQuestion.text}</h3>

                  {currentPlayer === 0 ? (
                    <div className="flex justify-center gap-8">
                      <button
                        onClick={() => handleSwipe('skip')}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        {locale.skip}
                      </button>
                      <button
                        onClick={() => handleSwipe('insight')}
                        className="bg-gradient-to-r from-mystical-purple to-mystical-gold text-white px-6 py-3 rounded-lg hover:scale-105 transition-transform"
                      >
                        {locale.shareInsight}
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">
                      {locale.waitingForResponse}
                      <div className="mt-4">
                        <div className="inline-flex space-x-1">
                          <div className="w-2 h-2 bg-mystical-gold rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-mystical-gold rounded-full animate-pulse"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-mystical-gold rounded-full animate-pulse"
                            style={{ animationDelay: '0.4s' }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={simulateMultiplayerResponse}
                        className="mt-4 text-mystical-gold hover:text-yellow-400 transition-colors text-sm"
                      >
                        {locale.simulateResponse}
                      </button>
                    </div>
                  )}

                  {/* Show mock responses from other players */}
                  {Object.keys(mockUserResponses).length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-mystical-gold font-semibold">{locale.recentResponses}:</h4>
                      {Object.entries(mockUserResponses).map(([userId, response]) => {
                        const user = mockUsers.find((u) => u.id === userId);
                        return user ? (
                          <div key={userId} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{user.avatar}</span>
                              <span className="text-mystical-gold font-medium">{user.name}</span>
                            </div>
                            <p className="text-gray-300 italic text-sm">"{response}"</p>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Response Section for Multiplayer */}
                <AnimatePresence>
                  {showResponse && currentPlayer === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mystical-card p-6 mb-8"
                    >
                      <h4 className="text-xl font-semibold text-mystical-gold mb-4">
                        {locale.shareWithTheGroup}
                      </h4>
                      <textarea
                        placeholder={locale.shareYourInsight}
                        className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-mystical-gold"
                      />
                      <div className="flex justify-between mt-4">
                        <button onClick={handleNextQuestion} className="btn-primary">
                          {locale.shareAndNextPlayer}
                        </button>
                        <span className="text-gray-400 text-sm">
                          {locale.round} {Math.floor(currentQuestionIndex / players.length) + 1}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center">
                  <button
                    onClick={() => setCurrentStep('intro')}
                    className="text-mystical-gold hover:text-yellow-400 transition-colors"
                  >
                    ← {locale.backToDemoSelection}
                  </button>
                </div>
              </motion.div>
            )}

            {/* User Profiles Demo */}
            {currentStep === 'userProfiles' && (
              <motion.div
                key="userProfiles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-mystical text-mystical-gold mb-4">
                    {locale.mockUserProfiles}
                  </h2>
                  <p className="text-gray-300">
                    {locale.meetOurCommunity}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {mockUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className={`mystical-card p-6 cursor-pointer transition-all ${
                        selectedMockUser?.id === user.id ? 'ring-2 ring-mystical-gold' : ''
                      }`}
                      onClick={() => switchMockUser(user)}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-4">{user.avatar}</div>
                        <h3 className="text-xl font-semibold text-mystical-gold mb-2">{user.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{user.personality}</p>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">{locale.questions}:</span>
                            <span className="text-green-400">{user.stats.questionsAnswered}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">{locale.rooms}:</span>
                            <span className="text-yellow-400">{user.stats.roomsJoined}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">{locale.insights}:</span>
                            <span className="text-red-400">{user.stats.insightsSaved}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected User Detail */}
                {selectedMockUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mystical-card p-8"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-5xl">{selectedMockUser.avatar}</div>
                      <div>
                        <h3 className="text-2xl font-mystical text-mystical-gold">{selectedMockUser.name}</h3>
                        <p className="text-gray-400">{selectedMockUser.email}</p>
                        <p className="text-gray-300 italic">{selectedMockUser.personality}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Responses */}
                      <div>
                        <h4 className="text-xl font-semibold text-mystical-gold mb-4">
                          {locale.recentInsights}
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(selectedMockUser.responses).map(([questionId, response]) => {
                            const question = demoQuestions.find((q) => q.id === parseInt(questionId));
                            return question ? (
                              <div key={questionId} className="bg-gray-800 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-2">{question.text}</p>
                                <p className="text-gray-200 italic">"{response}"</p>
                                <div className="mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      question.level === 'green'
                                        ? 'bg-green-900 text-green-300'
                                        : question.level === 'yellow'
                                        ? 'bg-yellow-900 text-yellow-300'
                                        : 'bg-red-900 text-red-300'
                                    }`}
                                  >
                                    {question.level.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Mock Journal */}
                      <div>
                        <h4 className="text-xl font-semibold text-mystical-gold mb-4">
                          {locale.personalJournal}
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-6">
                          <p className="text-gray-300 mb-4">
                            "KAICHID has transformed how I connect with others. Each question opens a door to deeper
                            understanding."
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">{locale.favoriteLevel}: </span>
                              <span className="text-mystical-gold">
                                {Object.keys(selectedMockUser.responses).length > 2
                                  ? locale.redDeep
                                  : Object.keys(selectedMockUser.responses).length > 1
                                  ? locale.yellowMedium
                                  : locale.greenLight}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">{locale.joined}: </span>
                              <span className="text-gray-300">3 months ago</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">{locale.mostActive}: </span>
                              <span className="text-gray-300">Evening sessions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-center mt-8">
                  <button
                    onClick={() => setCurrentStep('intro')}
                    className="text-mystical-gold hover:text-yellow-400 transition-colors"
                  >
                    ← {locale.backToDemoSelection}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Mock Authentication Demo */}
            {currentStep === 'mockAuth' && (
              <motion.div
                key="mockAuth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-mystical text-mystical-gold mb-4">
                    {locale.mockAuthenticationFlow}
                  </h2>
                  <p className="text-gray-300">
                    {locale.experienceCompleteUserJourney}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Mock Login */}
                  <div className="mystical-card p-6">
                    <h3 className="text-xl font-semibold text-mystical-gold mb-4">
                      {locale.quickLogin}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {locale.chooseAMockUser}
                    </p>

                    <div className="space-y-3">
                      {mockUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedMockUser(user);
                            // Simulate login success
                            alert(
                              `Logged in as ${user.name}! 🎉\n\nYou now have access to:\n• Solo Mode\n• Create/Join Rooms\n• Personal Journal\n• Question Submission`
                            );
                          }}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <span className="text-2xl">{user.avatar}</span>
                          <div className="text-left">
                            <div className="font-semibold text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mock Features Access */}
                  <div className="mystical-card p-6">
                    <h3 className="text-xl font-semibold text-mystical-gold mb-4">
                      {locale.availableFeatures}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">🎯</span>
                          <span className="text-white">{locale.soloMode}</span>
                        </div>
                        <span className="text-green-400 text-sm">{locale.available}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-400">🎮</span>
                          <span className="text-white">{locale.multiplayerRooms}</span>
                        </div>
                        <span className="text-blue-400 text-sm">{locale.createJoin}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-400">📝</span>
                          <span className="text-white">{locale.personalJournal}</span>
                        </div>
                        <span className="text-purple-400 text-sm">{locale.private}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-400">💡</span>
                          <span className="text-white">{locale.submitQuestions}</span>
                        </div>
                        <span className="text-yellow-400 text-sm">{locale.community}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-red-400">📊</span>
                          <span className="text-white">{locale.analytics}</span>
                        </div>
                        <span className="text-red-400 text-sm">{locale.insights}</span>
                      </div>
                    </div>

                    {selectedMockUser && (
                      <div className="mt-6 p-4 bg-mystical-purple/20 border border-mystical-purple rounded-lg">
                        <p className="text-mystical-gold text-sm font-semibold mb-2">
                          {locale.loggedInAs}
                        </p>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>
                            ✓ {selectedMockUser.stats.questionsAnswered} {locale.questionsAnswered}
                          </div>
                          <div>
                            ✓ {selectedMockUser.stats.roomsJoined} {locale.multiplayerSessions}
                          </div>
                          <div>
                            ✓ {selectedMockUser.stats.insightsSaved} {locale.insightsSaved}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={() => setCurrentStep('intro')}
                    className="text-mystical-gold hover:text-yellow-400 transition-colors"
                  >
                    ← {locale.backToDemoSelection}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Links to Main App Sections */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link href="/dashboard" className="oracle-button bg-mystical-gold text-mystical-dark">
              {locale.goToDashboard}
            </Link>
            <Link href="/solo" className="oracle-button bg-green-oracle text-white">
              {locale.tryRealSoloMode}
            </Link>
            <Link href="/multiplayer/DEMO" className="oracle-button bg-purple-600 text-white">
              {locale.tryRealMultiplayer}
            </Link>
            <Link href="/journal" className="oracle-button bg-yellow-500 text-white">
              {locale.viewJournal}
            </Link>
            <Link href="/submit-question" className="oracle-button bg-blue-500 text-white">
              {locale.submitAQuestion}
            </Link>
          </div>

          {/* Call to Action */}
          {currentStep !== 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12 p-8 mystical-card max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-mystical text-mystical-gold mb-4">
                {locale.readyToStart}
              </h3>
              <p className="text-gray-300 mb-6">
                {locale.joinThousands}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="oracle-button text-lg px-8 py-4">
                  {locale.createAccount}
                </Link>
                <Link href="/auth/login" className="oracle-button text-lg px-8 py-4">
                  {locale.signIn}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
