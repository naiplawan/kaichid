import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Play } from 'lucide-react';

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
        <Spinner size="xl" text="Awakening the mystical forces..." />
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
          className="text-3xl font-kahoot font-bold text-teal-400"
        >
          KAICHID
        </motion.h1>
        <nav className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" asChild>
              <Link href="/auth/login" className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="relative overflow-hidden">
              <Link href="/auth/register" className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Join KAICHID</span>
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="neon" asChild>
              <Link href="/demo" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Try Demo</span>
              </Link>
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center ">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-6xl font-kahoot font-bold mb-6 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
            Unveil the Depths of Connection
          </h2>

          <p className="text-xl mb-8 text-teal-200/80 max-w-2xl mx-auto font-medium">
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
              <motion.div whileHover={{ scale: 1.05 }} className="kahoot-card p-6 level-green">
                <div className="text-kahoot-green text-4xl mb-4">🌱</div>
                <h3 className="font-kahoot font-bold text-xl mb-2 text-kahoot-green">Icebreaker</h3>
                <p className="text-teal-200/70 text-sm">
                  Begin with gentle questions that spark curiosity and ease into conversation.
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="kahoot-card p-6 level-yellow">
                <div className="text-kahoot-yellow text-4xl mb-4">🔍</div>
                <h3 className="font-kahoot font-bold text-xl mb-2 text-kahoot-yellow">Exploration</h3>
                <p className="text-teal-200/70 text-sm">
                  Dive deeper with questions that reveal values, dreams, and perspectives.
                </p>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} className="kahoot-card p-6 level-red">
                <div className="text-kahoot-red text-4xl mb-4">❤️</div>
                <h3 className="font-kahoot font-bold text-xl mb-2 text-kahoot-red">Vulnerability</h3>
                <p className="text-teal-200/70 text-sm">
                  Share authentic moments with questions that touch the heart and soul.
                </p>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="text-lg px-8 py-4 min-w-48">
                  <Link href="/auth/register" className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Begin Your Journey</span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" size="lg" asChild className="text-lg px-8 py-4 min-w-48">
                  <Link href="/demo" className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>Try Demo</span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Problem-Solution Hook */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h3
              className="text-4xl font-kahoot font-bold mb-6 text-teal-400"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Why Settle for Small Talk?
            </motion.h3>
            <p className="text-xl text-teal-200/80 max-w-3xl mx-auto">
              In a world of endless scrolling and shallow connections, KAICHID brings back the art of meaningful
              conversation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="kahoot-card p-8 border-kahoot-red/30">
                <h4 className="text-2xl font-kahoot font-bold text-kahoot-red mb-6">The Problem We All Face</h4>
                <div className="space-y-4">
                  {[
                    'Social media feels empty and performative',
                    'Friends drift apart without real conversations',
                    'Dating apps lead to meaningless small talk',
                    'Family dinners become silent phone sessions',
                    "We're more connected yet lonelier than ever",
                  ].map((problem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-kahoot-red rounded-full" />
                      <span className="text-teal-200/70">{problem}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="kahoot-card p-8 border-kahoot-green/30">
                <h4 className="text-2xl font-kahoot font-bold text-kahoot-green mb-6">The KAICHID Solution</h4>
                <div className="space-y-4">
                  {[
                    'Questions designed by psychologists for depth',
                    'Safe spaces for vulnerable conversations',
                    'AI-powered matching based on your mood',
                    'Progress tracking for personal growth',
                    'Turn any gathering into meaningful connection',
                  ].map((solution, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-kahoot-green rounded-full" />
                      <span className="text-teal-200/70">{solution}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Social Proof Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-kahoot font-bold mb-4 text-teal-400">Join the Conversation Revolution</h3>
            <p className="text-teal-200/80">Thousands are already discovering deeper connections</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { number: '10,000+', label: 'Meaningful Conversations', icon: '💬' },
              { number: '2,500+', label: 'Active Community Members', icon: '👥' },
              { number: '95%', label: 'Report Feeling More Connected', icon: '❤️' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="kahoot-card p-8 text-center"
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-kahoot font-bold text-teal-400 mb-2">{stat.number}</div>
                <div className="text-teal-200/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote:
                  "KAICHID transformed our relationship. We went from surface-level chats to discussing our deepest dreams and fears. It's like couples therapy, but fun!",
                author: 'Sarah & Mike',
                role: 'Couple, together 3 years',
                avatar: '💑',
              },
              {
                quote:
                  "My teenage daughter and I barely talked. Now we have weekly KAICHID sessions and she actually opens up about her life. It's a miracle!",
                author: 'Jennifer',
                role: 'Parent',
                avatar: '👩‍👧',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
                className="kahoot-card p-6"
              >
                <div className="text-3xl mb-4">{testimonial.avatar}</div>
                <p className="text-teal-200/80 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <div className="font-kahoot font-bold text-teal-400">{testimonial.author}</div>
                  <div className="text-sm text-teal-300/70">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FOMO Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="kahoot-card p-12 text-center neon-border animate-neon-pulse">
            <motion.h3
              className="text-3xl font-kahoot font-bold mb-6 text-teal-400"
              animate={{
                textShadow: ['0 0 10px #14b8a6', '0 0 20px #14b8a6, 0 0 30px #14b8a6', '0 0 10px #14b8a6'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Don't Let Another Year Pass in Surface-Level Connections
            </motion.h3>
            <p className="text-xl text-teal-200/80 mb-8">
              While others scroll through endless feeds, you could be building the relationships that truly matter
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="text-lg px-8 py-4 min-w-52 relative overflow-hidden">
                  <Link href="/auth/register" className="flex items-center space-x-2">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <UserPlus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Start Your Journey Now</span>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="neon" size="lg" asChild className="text-lg px-8 py-4 min-w-52">
                  <Link href="/demo" className="flex items-center space-x-2">
                    <Play className="w-5 h-5" />
                    <span>See It In Action</span>
                  </Link>
                </Button>
              </motion.div>
            </div>

            <p className="text-sm text-teal-300/60">
              🎁 Free forever • No credit card required • Start connecting in 30 seconds
            </p>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-kahoot font-bold mb-4 text-teal-400">Transform Any Moment Into Connection</h3>
            <p className="text-teal-200/80">It's as simple as 1-2-3</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Pick Your Vibe',
                description: 'Choose from Icebreaker, Deep Dive, or Vulnerable levels based on your mood',
                icon: '🎯',
                color: 'kahoot-green',
              },
              {
                step: '2',
                title: 'Draw Your Card',
                description: 'Get AI-curated questions designed to spark meaningful conversation',
                icon: '🃏',
                color: 'kahoot-yellow',
              },
              {
                step: '3',
                title: 'Connect & Grow',
                description: 'Share, listen, and discover new depths in yourself and others',
                icon: '✨',
                color: 'kahoot-red',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="text-center"
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-6 rounded-full bg-${step.color}/20 border-2 border-${step.color} flex items-center justify-center text-2xl font-kahoot font-bold text-${step.color}`}
                  animate={{
                    scale: [1, 1.1, 1],
                    borderColor: [`var(--${step.color})`, `var(--${step.color})80`, `var(--${step.color})`],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {step.step}
                </motion.div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h4 className={`text-xl font-kahoot font-bold mb-3 text-${step.color}`}>{step.title}</h4>
                <p className="text-teal-200/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Use Cases Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-20 max-w-6xl mx-auto mb-10"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-kahoot font-bold mb-4 text-teal-400">Perfect for Every Situation</h3>
            <p className="text-teal-200/80">Turn awkward moments into meaningful memories</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { scenario: 'Date Night', icon: '💕', description: "Skip the 'how was work' and dive deep" },
              { scenario: 'Family Dinner', icon: '🍽️', description: 'Get everyone talking instead of scrolling' },
              { scenario: 'Friend Hangout', icon: '👫', description: 'Strengthen bonds beyond surface chat' },
              { scenario: 'Team Building', icon: '🏢', description: 'Build real connections at work' },
              { scenario: 'Long Car Rides', icon: '🚗', description: 'Make travel time meaningful' },
              { scenario: 'First Dates', icon: '☕', description: 'Break the ice with engaging questions' },
              { scenario: 'Therapy Sessions', icon: '🧠', description: 'Professional tools for deeper insight' },
              { scenario: 'Solo Reflection', icon: '🪞', description: 'Journey within and discover yourself' },
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="kahoot-card p-6 text-center cursor-pointer"
              >
                <div className="text-3xl mb-3">{useCase.icon}</div>
                <h4 className="font-kahoot font-bold text-teal-400 mb-2">{useCase.scenario}</h4>
                <p className="text-sm text-teal-200/70">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 border-t border-gray-800">
        <p className="text-teal-400/60">&copy; 2025 KAICHID. Fostering authentic connections.</p>
      </footer>
    </div>
  );
}
