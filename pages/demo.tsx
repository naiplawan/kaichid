import { useState } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { Play, Users, User, Sparkles, ArrowLeft, ArrowRight, Crown, Heart, Brain, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameCard } from '@/components/ui/game-card';
import demoLocale from '../locales/demo.json';

interface DemoQuestion {
  id: string;
  text: string;
  level: 'green' | 'yellow' | 'red';
  theme: string;
  is_custom: boolean;
  creator_id?: string;
  status: 'approved' | 'pending' | 'rejected';
  reported_count: number;
  created_at: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  personality: string;
  responses: { [questionId: string]: string };
  savedQuestions: string[];
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
    personality: 'Creative visionary',
    responses: {
      '1': "Watching my dog chase butterflies in the garden. There's something pure about that moment of joy.",
      '3': "I used to believe success meant climbing the corporate ladder. Now I think it's about creating meaningful connections.",
      '5': 'I overcame my fear of public speaking by joining a local storytelling group. It taught me vulnerability is strength.',
    },
    savedQuestions: ['1', '3', '5'],
    stats: { questionsAnswered: 23, roomsJoined: 7, insightsSaved: 15 },
  },
  {
    id: 'user2',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@example.com',
    avatar: '🧑‍💼',
    personality: 'Thoughtful leader',
    responses: {
      '2': "Leonardo da Vinci. I'd love to understand how he connected art, science, and invention so seamlessly.",
      '4': "When I'm mentoring younger colleagues. Helping others grow feels like my truest self.",
      '6': "I'd start a foundation that teaches emotional intelligence in schools worldwide.",
    },
    savedQuestions: ['2', '4', '6'],
    stats: { questionsAnswered: 31, roomsJoined: 12, insightsSaved: 22 },
  },
  {
    id: 'user3',
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    avatar: '🌸',
    personality: 'Empathetic soul',
    responses: {
      '1': "The sound of rain on the roof while I'm reading a good book with tea in hand.",
      '2': 'Maya Angelou. Her wisdom about resilience and grace would be incredible to experience firsthand.',
      '3': "I used to think showing emotion was weakness. Now I know it's the foundation of authentic connection.",
    },
    savedQuestions: ['1', '2', '3'],
    stats: { questionsAnswered: 28, roomsJoined: 9, insightsSaved: 19 },
  },
];

const demoQuestions: DemoQuestion[] = [
  // GREEN LEVEL - ICEBREAKER QUESTIONS (50 questions)
  {
    id: '1',
    text: "What's one simple thing that always makes you smile?",
    level: 'green',
    theme: 'Joy & Happiness',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    text: 'If you could have dinner with anyone from history, who would it be and why?',
    level: 'green',
    theme: 'Curiosity & Wonder',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    text: "What's your favorite way to spend a rainy day?",
    level: 'green',
    theme: 'Leisure & Comfort',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    text: "If you could instantly learn any skill, what would it be?",
    level: 'green',
    theme: 'Skills & Learning',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '5',
    text: "What's the best piece of advice you've ever received?",
    level: 'green',
    theme: 'Wisdom & Guidance',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '6',
    text: "What's your go-to comfort food?",
    level: 'green',
    theme: 'Food & Culture',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '7',
    text: "If you could travel anywhere right now, where would you go?",
    level: 'green',
    theme: 'Travel & Adventure',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '8',
    text: "What's a hobby you've always wanted to try?",
    level: 'green',
    theme: 'Hobbies & Interests',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '9',
    text: "What's your favorite childhood memory?",
    level: 'green',
    theme: 'Childhood & Nostalgia',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '10',
    text: "If you could have any superpower, what would it be?",
    level: 'green',
    theme: 'Imagination & Fun',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '11',
    text: "What's the most beautiful place you've ever seen?",
    level: 'green',
    theme: 'Beauty & Nature',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '12',
    text: "What's your favorite way to express creativity?",
    level: 'green',
    theme: 'Creativity & Art',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '13',
    text: "If you could only listen to one song for the rest of your life, what would it be?",
    level: 'green',
    theme: 'Music & Sound',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '14',
    text: "What's something you're surprisingly good at?",
    level: 'green',
    theme: 'Hidden Talents',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '15',
    text: "What's your favorite season and why?",
    level: 'green',
    theme: 'Seasons & Time',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '16',
    text: "If you could live in any fictional universe, which would you choose?",
    level: 'green',
    theme: 'Fiction & Fantasy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '17',
    text: "What's the best compliment you've ever received?",
    level: 'green',
    theme: 'Recognition & Praise',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '18',
    text: "What's your morning routine like?",
    level: 'green',
    theme: 'Daily Life',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '19',
    text: "If you could swap lives with someone for a day, who would it be?",
    level: 'green',
    theme: 'Perspective & Experience',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '20',
    text: "What's the most interesting thing you've learned recently?",
    level: 'green',
    theme: 'Learning & Discovery',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '21',
    text: "What's your favorite way to relax after a long day?",
    level: 'green',
    theme: 'Relaxation & Wellness',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '22',
    text: "If you could time travel, would you go to the past or future?",
    level: 'green',
    theme: 'Time & Possibility',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '23',
    text: "What's a tradition you really enjoy?",
    level: 'green',
    theme: 'Traditions & Culture',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '24',
    text: "What's the most spontaneous thing you've ever done?",
    level: 'green',
    theme: 'Spontaneity & Adventure',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '25',
    text: "If you could master any instrument, which would you choose?",
    level: 'green',
    theme: 'Music & Performance',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '26',
    text: "What's your favorite type of weather?",
    level: 'green',
    theme: 'Weather & Atmosphere',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '27',
    text: "What's something you do that always cheers you up?",
    level: 'green',
    theme: 'Self-Care & Joy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '28',
    text: "If you could own any animal as a pet, what would it be?",
    level: 'green',
    theme: 'Animals & Nature',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '29',
    text: "What's your favorite way to celebrate achievements?",
    level: 'green',
    theme: 'Celebration & Victory',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '30',
    text: "What's a movie that always makes you laugh?",
    level: 'green',
    theme: 'Entertainment & Humor',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '31',
    text: "If you could have one wish granted right now, what would it be?",
    level: 'green',
    theme: 'Wishes & Dreams',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '32',
    text: "What's your favorite way to spend time with friends?",
    level: 'green',
    theme: 'Friendship & Connection',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '33',
    text: "What's the coolest place you've ever visited?",
    level: 'green',
    theme: 'Travel & Exploration',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '34',
    text: "If you could be famous for something, what would it be?",
    level: 'green',
    theme: 'Fame & Recognition',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '35',
    text: "What's your favorite childhood game?",
    level: 'green',
    theme: 'Games & Play',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '36',
    text: "What's something you're excited about in the near future?",
    level: 'green',
    theme: 'Anticipation & Future',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '37',
    text: "If you could have dinner with any fictional character, who would it be?",
    level: 'green',
    theme: 'Fiction & Characters',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '38',
    text: "What's your favorite type of book or story?",
    level: 'green',
    theme: 'Books & Literature',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '39',
    text: "What's the best gift you've ever received?",
    level: 'green',
    theme: 'Gifts & Generosity',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '40',
    text: "If you could learn about any topic instantly, what would it be?",
    level: 'green',
    theme: 'Knowledge & Curiosity',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '41',
    text: "What's your favorite way to exercise or move your body?",
    level: 'green',
    theme: 'Health & Movement',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '42',
    text: "What's something small that can brighten your whole day?",
    level: 'green',
    theme: 'Small Joys',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '43',
    text: "If you could live in any time period, when would it be?",
    level: 'green',
    theme: 'History & Time',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '44',
    text: "What's your favorite way to be creative?",
    level: 'green',
    theme: 'Creative Expression',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '45',
    text: "What's the funniest thing that's happened to you recently?",
    level: 'green',
    theme: 'Humor & Laughter',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '46',
    text: "If you could speak any language fluently, which would you choose?",
    level: 'green',
    theme: 'Language & Communication',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '47',
    text: "What's your favorite holiday and why?",
    level: 'green',
    theme: 'Holidays & Celebration',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '48',
    text: "What's something you're really good at teaching others?",
    level: 'green',
    theme: 'Teaching & Sharing',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '49',
    text: "If you could redesign anything in the world, what would it be?",
    level: 'green',
    theme: 'Innovation & Design',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '50',
    text: "What's your favorite way to make someone else smile?",
    level: 'green',
    theme: 'Kindness & Joy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },

  // YELLOW LEVEL - EXPLORATION QUESTIONS (50 questions)
  {
    id: '51',
    text: "What's a belief you held strongly in the past that has completely changed?",
    level: 'yellow',
    theme: 'Growth & Change',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '52',
    text: 'When do you feel most authentically yourself?',
    level: 'yellow',
    theme: 'Identity & Self',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '53',
    text: "What's a decision you made that completely changed your life's direction?",
    level: 'yellow',
    theme: 'Life Choices',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '54',
    text: "What do you think is your greatest strength, and how did you develop it?",
    level: 'yellow',
    theme: 'Personal Strengths',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '55',
    text: "What's something about yourself that most people don't know?",
    level: 'yellow',
    theme: 'Hidden Depths',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '56',
    text: "How has your definition of success evolved over time?",
    level: 'yellow',
    theme: 'Success & Values',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '57',
    text: "What's a relationship that has profoundly shaped who you are?",
    level: 'yellow',
    theme: 'Relationships & Influence',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '58',
    text: "What do you wish you could tell your younger self?",
    level: 'yellow',
    theme: 'Wisdom & Reflection',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '59',
    text: "What's a challenge you're currently facing that you're learning from?",
    level: 'yellow',
    theme: 'Current Challenges',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '60',
    text: "How do you handle moments of self-doubt?",
    level: 'yellow',
    theme: 'Self-Doubt & Confidence',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '61',
    text: "What's a value that guides most of your important decisions?",
    level: 'yellow',
    theme: 'Core Values',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '62',
    text: "What does 'home' mean to you beyond just a physical place?",
    level: 'yellow',
    theme: 'Belonging & Home',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '63',
    text: "How do you think others perceive you versus how you see yourself?",
    level: 'yellow',
    theme: 'Self-Perception',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '64',
    text: "What's a pattern in your life that you've recently become aware of?",
    level: 'yellow',
    theme: 'Self-Awareness',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '65',
    text: "How has failure taught you something valuable?",
    level: 'yellow',
    theme: 'Failure & Learning',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '66',
    text: "What motivates you to keep going during difficult times?",
    level: 'yellow',
    theme: 'Motivation & Resilience',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '67',
    text: "What's something you're passionate about that others might find surprising?",
    level: 'yellow',
    theme: 'Hidden Passions',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '68',
    text: "How do you define love in your life?",
    level: 'yellow',
    theme: 'Love & Connection',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '69',
    text: "What's a compromise you've made that you later regretted?",
    level: 'yellow',
    theme: 'Compromises & Regrets',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '70',
    text: "How has your relationship with money evolved over time?",
    level: 'yellow',
    theme: 'Money & Values',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '71',
    text: "What's something you've had to unlearn as you've grown older?",
    level: 'yellow',
    theme: 'Unlearning & Growth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '72',
    text: "How do you balance being true to yourself with fitting in?",
    level: 'yellow',
    theme: 'Authenticity & Social Fit',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '73',
    text: "What's a boundary you've learned to set that improved your life?",
    level: 'yellow',
    theme: 'Boundaries & Self-Care',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '74',
    text: "How do you deal with uncertainty in your life?",
    level: 'yellow',
    theme: 'Uncertainty & Control',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '75',
    text: "What's a dream you've given up on, and how do you feel about it now?",
    level: 'yellow',
    theme: 'Dreams & Letting Go',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '76',
    text: "How do you want to be remembered by the people closest to you?",
    level: 'yellow',
    theme: 'Legacy & Memory',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '77',
    text: "What's something you believe about human nature?",
    level: 'yellow',
    theme: 'Human Nature & Philosophy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '78',
    text: "How has your understanding of friendship changed over the years?",
    level: 'yellow',
    theme: 'Friendship & Evolution',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '79',
    text: "What's a skill or trait you admire in others that you wish you had?",
    level: 'yellow',
    theme: 'Admiration & Growth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '80',
    text: "How do you handle criticism, especially when it feels unfair?",
    level: 'yellow',
    theme: 'Criticism & Response',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '81',
    text: "What's a life lesson you learned the hard way?",
    level: 'yellow',
    theme: 'Hard Lessons',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '82',
    text: "How do you nurture your mental and emotional health?",
    level: 'yellow',
    theme: 'Mental Health & Wellness',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '83',
    text: "What's something you've always wanted to ask someone but never had the courage?",
    level: 'yellow',
    theme: 'Unasked Questions',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '84',
    text: "How has your perspective on work-life balance evolved?",
    level: 'yellow',
    theme: 'Work & Life Balance',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '85',
    text: "What's a moment when you felt truly proud of yourself?",
    level: 'yellow',
    theme: 'Pride & Achievement',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '86',
    text: "How do you decide when to hold on and when to let go?",
    level: 'yellow',
    theme: 'Holding On & Letting Go',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '87',
    text: "What's something you're still trying to figure out about yourself?",
    level: 'yellow',
    theme: 'Self-Discovery',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '88',
    text: "How do you maintain hope during challenging periods?",
    level: 'yellow',
    theme: 'Hope & Perseverance',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '89',
    text: "What's a way you've surprised yourself recently?",
    level: 'yellow',
    theme: 'Self-Surprise',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '90',
    text: "How do you think your childhood shaped the person you are today?",
    level: 'yellow',
    theme: 'Childhood & Formation',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '91',
    text: "What's something you're grateful for that you used to take for granted?",
    level: 'yellow',
    theme: 'Gratitude & Appreciation',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '92',
    text: "How do you define personal growth for yourself?",
    level: 'yellow',
    theme: 'Personal Growth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '93',
    text: "What's a question you wish people would ask you more often?",
    level: 'yellow',
    theme: 'Desired Questions',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '94',
    text: "How do you handle the gap between who you are and who you want to be?",
    level: 'yellow',
    theme: 'Aspiration & Reality',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '95',
    text: "What's a belief about yourself that you've had to challenge?",
    level: 'yellow',
    theme: 'Self-Beliefs',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '96',
    text: "How do you want to grow in the next phase of your life?",
    level: 'yellow',
    theme: 'Future Growth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '97',
    text: "What's something you've learned about love from your relationships?",
    level: 'yellow',
    theme: 'Love & Relationships',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '98',
    text: "How do you navigate conflicts in important relationships?",
    level: 'yellow',
    theme: 'Conflict & Resolution',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '99',
    text: "What's something you're learning to accept about yourself?",
    level: 'yellow',
    theme: 'Self-Acceptance',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '100',
    text: "How has your definition of happiness changed over time?",
    level: 'yellow',
    theme: 'Happiness & Evolution',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },

  // RED LEVEL - VULNERABILITY QUESTIONS (50 questions)
  {
    id: '101',
    text: "What's a fear you've overcome, and how did it change you?",
    level: 'red',
    theme: 'Courage & Vulnerability',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '102',
    text: "If you knew you couldn't fail, what would you attempt?",
    level: 'red',
    theme: 'Dreams & Aspirations',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '103',
    text: "What's the most vulnerable you've ever been with another person?",
    level: 'red',
    theme: 'Vulnerability & Intimacy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '104',
    text: "What's a secret you've kept that you wish you could share?",
    level: 'red',
    theme: 'Secrets & Hidden Truth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '105',
    text: "When have you felt most broken, and what helped you heal?",
    level: 'red',
    theme: 'Brokenness & Healing',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '106',
    text: "What's something you're ashamed of that you've never told anyone?",
    level: 'red',
    theme: 'Shame & Confession',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '107',
    text: "How has grief or loss shaped who you are today?",
    level: 'red',
    theme: 'Grief & Loss',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '108',
    text: "What's a wound from your past that still affects you?",
    level: 'red',
    theme: 'Past Wounds',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '109',
    text: "What do you fear most about aging or the passage of time?",
    level: 'red',
    theme: 'Mortality & Time',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '110',
    text: "What's the loneliest you've ever felt?",
    level: 'red',
    theme: 'Loneliness & Isolation',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '111',
    text: "What's something you've done that you wish you could undo?",
    level: 'red',
    theme: 'Regret & Redemption',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '112',
    text: "How do you cope with feelings of inadequacy or not being enough?",
    level: 'red',
    theme: 'Inadequacy & Self-Worth',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '113',
    text: "What's a truth about yourself that you find difficult to accept?",
    level: 'red',
    theme: 'Difficult Truths',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '114',
    text: "When have you felt like you were living someone else's life?",
    level: 'red',
    theme: 'Authenticity & Identity Crisis',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '115',
    text: "What's your deepest insecurity, and where do you think it comes from?",
    level: 'red',
    theme: 'Insecurity & Origins',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '116',
    text: "How has mental health struggles (yours or someone close) affected your life?",
    level: 'red',
    theme: 'Mental Health & Impact',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '117',
    text: "What's something you're terrified people will discover about you?",
    level: 'red',
    theme: 'Hidden Fears',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '118',
    text: "When have you felt most misunderstood by others?",
    level: 'red',
    theme: 'Being Misunderstood',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '119',
    text: "What's a relationship that ended badly and still haunts you?",
    level: 'red',
    theme: 'Relationship Endings',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '120',
    text: "How do you deal with the parts of yourself you don't like?",
    level: 'red',
    theme: 'Self-Dislike & Shadow',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '121',
    text: "What's a moment when you felt completely powerless?",
    level: 'red',
    theme: 'Powerlessness & Control',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '122',
    text: "What's something you need to forgive yourself for?",
    level: 'red',
    theme: 'Self-Forgiveness',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '123',
    text: "How has betrayal (giving or receiving) shaped your ability to trust?",
    level: 'red',
    theme: 'Betrayal & Trust',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '124',
    text: "What's a dream you're afraid to pursue because of potential failure?",
    level: 'red',
    theme: 'Dreams & Fear of Failure',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '125',
    text: "When have you felt like you disappointed the people who matter most?",
    level: 'red',
    theme: 'Disappointment & Letting Down',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '126',
    text: "What's something about your family or upbringing that still affects you?",
    level: 'red',
    theme: 'Family & Childhood Impact',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '127',
    text: "How do you handle the weight of your own expectations?",
    level: 'red',
    theme: 'Self-Expectations & Pressure',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '128',
    text: "What's a part of your identity you've struggled to accept or embrace?",
    level: 'red',
    theme: 'Identity Struggles',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '129',
    text: "When have you felt like you were wearing a mask with everyone around you?",
    level: 'red',
    theme: 'Masks & Authenticity',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '130',
    text: "What's something you've sacrificed that you sometimes wonder about?",
    level: 'red',
    theme: 'Sacrifice & What If',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '131',
    text: "How do you cope when life feels meaningless or empty?",
    level: 'red',
    theme: 'Meaning & Existential Crisis',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '132',
    text: "What's a conversation you keep avoiding that you know you need to have?",
    level: 'red',
    theme: 'Avoided Conversations',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '133',
    text: "How has your relationship with your body changed throughout your life?",
    level: 'red',
    theme: 'Body Image & Self-Perception',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '134',
    text: "What's something you judge in others that you also see in yourself?",
    level: 'red',
    theme: 'Judgment & Self-Reflection',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '135',
    text: "When have you felt most like an outsider or like you didn't belong?",
    level: 'red',
    theme: 'Belonging & Exclusion',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '136',
    text: "What's a way you've hurt someone that you wish you could take back?",
    level: 'red',
    theme: 'Hurting Others & Remorse',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '137',
    text: "How do you handle feelings of jealousy or envy?",
    level: 'red',
    theme: 'Jealousy & Envy',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '138',
    text: "What's something you're still angry about that happened long ago?",
    level: 'red',
    theme: 'Anger & Unresolved Pain',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '139',
    text: "When have you felt like you were losing yourself in a relationship?",
    level: 'red',
    theme: 'Losing Self in Relationships',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '140',
    text: "What's something about death or dying that frightens you?",
    level: 'red',
    theme: 'Death & Mortality',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '141',
    text: "How do you deal with the gap between your public self and private struggles?",
    level: 'red',
    theme: 'Public vs Private Self',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '142',
    text: "What's a childhood experience that still influences how you see the world?",
    level: 'red',
    theme: 'Childhood Influence',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '143',
    text: "When have you felt most rejected or abandoned?",
    level: 'red',
    theme: 'Rejection & Abandonment',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '144',
    text: "What's something you're afraid to want because you might not get it?",
    level: 'red',
    theme: 'Fear of Wanting',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '145',
    text: "How has addiction (substance, behavior, etc.) affected your life or someone close?",
    level: 'red',
    theme: 'Addiction & Impact',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '146',
    text: "What's something you've never been able to say to someone you love?",
    level: 'red',
    theme: 'Unspoken Words',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '147',
    text: "When have you felt most like you were pretending to be someone you're not?",
    level: 'red',
    theme: 'Pretending & Authenticity',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '148',
    text: "What's a way your past continues to show up in your present relationships?",
    level: 'red',
    theme: 'Past Patterns in Present',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '149',
    text: "How do you handle the fear that you might never find your true purpose?",
    level: 'red',
    theme: 'Purpose & Fear',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '150',
    text: "What's the most important thing you've learned about love, loss, and being human?",
    level: 'red',
    theme: 'Love, Loss & Humanity',
    is_custom: false,
    status: 'approved',
    reported_count: 0,
    created_at: '2025-01-01T00:00:00Z',
  },
];

const levelIcons = {
  green: Target,
  yellow: Brain,
  red: Heart,
};

export default function Demo() {
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'solo' | 'multiplayer' | 'community' | 'features' | 'completed'
  >('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState('');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [currentLevel, setCurrentLevel] = useState<'green' | 'yellow' | 'red'>('green');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [completedMode, setCompletedMode] = useState<'solo' | 'multiplayer' | 'community' | 'features'>('solo');
  
  const locale = (demoLocale as any)[language];
  
  // Filter questions by current level for solo demo
  const levelQuestions = demoQuestions.filter(q => q.level === currentLevel);
  const currentQuestion = levelQuestions[currentQuestionIndex] || demoQuestions[currentQuestionIndex];

  const handleSwipe = (direction: 'left' | 'right', question: DemoQuestion) => {
    if (direction === 'right') {
      setShowResponse(true);
      const mockUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      setResponse(mockUser?.responses[question.id] || "This is a thoughtful response that shows deep reflection...");
    } else {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (currentStep === 'solo') {
      // In solo mode, use filtered questions by level
      if (currentQuestionIndex < levelQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowResponse(false);
        setResponse('');
      } else {
        // At end of level, show level completion or progress to next level
        if (currentLevel === 'green') {
          setCurrentLevel('yellow');
          setCurrentQuestionIndex(0);
        } else if (currentLevel === 'yellow') {
          setCurrentLevel('red');
          setCurrentQuestionIndex(0);
        } else {
          // Completed all levels - show completion screen
          setGameCompleted(true);
          setCompletedMode('solo');
          setCurrentStep('completed');
        }
        setShowResponse(false);
        setResponse('');
      }
    } else {
      // In other modes, use all questions
      if (currentQuestionIndex < demoQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowResponse(false);
        setResponse('');
      } else {
        // Completed demo - show completion screen
        setGameCompleted(true);
        setCompletedMode(currentStep as 'multiplayer' | 'community' | 'features');
        setCurrentStep('completed');
      }
    }
  };

  const handleReportQuestion = (questionId: string) => {
    // Demo function - just log
    console.log('Reported question:', questionId);
  };

  const resetDemoState = () => {
    setCurrentQuestionIndex(0);
    setShowResponse(false);
    setResponse('');
    setCurrentLevel('green');
    setGameCompleted(false);
    setCompletedMode('solo');
  };

  // Reset demo state when switching to solo
  React.useEffect(() => {
    if (currentStep === 'solo') {
      resetDemoState();
    }
  }, [currentStep]);

  return (
    <>
      <Head>
        <title>KAICHID Demo - Experience the Future of Meaningful Conversations</title>
        <meta
          name="description"
          content="Experience KAICHID's revolutionary conversation platform with Web3 design and AI-powered insights"
        />
      </Head>

      <div className="min-h-screen cyber-grid">
        {/* Modern Header */}
        <header className="glass-morphism border-b border-teal-500/20 p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:animate-cyber-glitch" />
              <span className="font-kahoot font-bold">Back to Home</span>
            </Link>
            
            <motion.h1 
              className="text-3xl font-kahoot font-bold text-teal-400"
              animate={{ 
                textShadow: [
                  "0 0 5px #14b8a6",
                  "0 0 10px #14b8a6, 0 0 20px #14b8a6",
                  "0 0 5px #14b8a6"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              KAICHID Demo
            </motion.h1>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                variant="neon"
                size="sm"
              >
                {language === 'en' ? 'ภาษาไทย' : 'ENGLISH'}
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Welcome Screen */}
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-6xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-12"
                >
                  <motion.h2
                    className="text-7xl font-kahoot font-bold mb-6 bg-gradient-to-r from-teal-400 via-web3-neon to-teal-600 bg-clip-text text-transparent"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Welcome to the Future
                  </motion.h2>
                  
                  <p className="text-2xl text-teal-200/80 mb-8 font-medium">
                    Experience next-generation conversations with Web3 design
                  </p>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid md:grid-cols-3 gap-8 mb-12"
                  >
                    {[
                      {
                        icon: Target,
                        level: 'Icebreaker',
                        color: 'kahoot-green',
                        description: 'Gentle questions to spark curiosity and connection',
                        bgColor: 'level-green'
                      },
                      {
                        icon: Brain,
                        level: 'Exploration',
                        color: 'kahoot-yellow',
                        description: 'Deep questions that reveal values and perspectives',
                        bgColor: 'level-yellow'
                      },
                      {
                        icon: Heart,
                        level: 'Vulnerability',
                        color: 'kahoot-red',
                        description: 'Intimate questions that touch the heart and soul',
                        bgColor: 'level-red'
                      }
                    ].map((level, index) => {
                      const IconComponent = level.icon;
                      return (
                        <motion.div
                          key={level.level}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.2 }}
                          whileHover={{ 
                            scale: 1.05,
                            y: -10,
                            transition: { duration: 0.2 }
                          }}
                          className={`kahoot-card p-8 text-center ${level.bgColor} hover:animate-neon-pulse`}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <IconComponent className={`w-16 h-16 mx-auto mb-4 text-${level.color}`} />
                          </motion.div>
                          <h3 className={`text-2xl font-kahoot font-bold mb-3 text-${level.color}`}>
                            {level.level}
                          </h3>
                          <p className="text-teal-200/70">
                            {level.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="space-y-6"
                  >
                    <p className="text-teal-300/80 text-lg font-medium mb-8">
                      Choose your experience
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { id: 'solo', icon: User, label: 'Solo Journey', desc: 'Personal reflection' },
                        { id: 'multiplayer', icon: Users, label: 'Group Play', desc: 'Connect with others' },
                        { id: 'community', icon: Crown, label: 'Community', desc: 'Meet our users' },
                        { id: 'features', icon: Sparkles, label: 'Features', desc: 'Explore the platform' }
                      ].map((option, index) => {
                        const IconComponent = option.icon;
                        return (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={() => setCurrentStep(option.id as any)}
                              variant="default"
                              size="xl"
                              className="w-full h-auto p-6 flex flex-col items-center space-y-3"
                            >
                              <IconComponent className="w-8 h-8" />
                              <div className="text-center">
                                <div className="font-bold">{option.label}</div>
                                <div className="text-sm opacity-80">{option.desc}</div>
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Solo Experience */}
            {currentStep === 'solo' && (
              <motion.div
                key="solo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Level Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 ${
                    currentLevel === 'green' ? 'border-kahoot-green bg-kahoot-green/10' :
                    currentLevel === 'yellow' ? 'border-kahoot-yellow bg-kahoot-yellow/10' :
                    'border-kahoot-red bg-kahoot-red/10'
                  }`}>
                    {React.createElement(levelIcons[currentLevel], { 
                      className: `w-6 h-6 ${
                        currentLevel === 'green' ? 'text-kahoot-green' :
                        currentLevel === 'yellow' ? 'text-kahoot-yellow' :
                        'text-kahoot-red'
                      }` 
                    })}
                    <span className={`font-kahoot font-bold text-lg ${
                      currentLevel === 'green' ? 'text-kahoot-green' :
                      currentLevel === 'yellow' ? 'text-kahoot-yellow' :
                      'text-kahoot-red'
                    }`}>
                      {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Level
                    </span>
                    <span className="text-teal-300/70 text-sm">
                      {currentQuestionIndex + 1}/{levelQuestions.length}
                    </span>
                  </div>
                </motion.div>
                <div className="text-center mb-8">
                  <motion.h2 
                    className="text-4xl font-kahoot font-bold text-teal-400 mb-4"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Solo Journey Experience
                  </motion.h2>
                  <p className="text-teal-200/80 text-lg">
                    Swipe through questions and explore your inner thoughts
                  </p>
                  <div className="flex justify-center items-center space-x-8 mt-6">
                    <motion.div 
                      className="flex items-center space-x-2 text-kahoot-red"
                      animate={{ x: [-5, 0, -5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Skip</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-2 text-kahoot-green"
                      animate={{ x: [5, 0, 5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span>Insight</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {currentQuestion && (
                  <div className="flex justify-center mb-8">
                    <GameCard
                      question={currentQuestion as any}
                      onSwipe={handleSwipe}
                      onReport={handleReportQuestion}
                    />
                  </div>
                )}

                {showResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="kahoot-card p-8 mb-8"
                  >
                    <h4 className="text-2xl font-kahoot font-bold text-teal-400 mb-4">
                      Your Reflection
                    </h4>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Share your thoughts and insights..."
                      className="w-full h-32 bg-kahoot-dark-surface border border-teal-500/30 rounded-xl p-4 text-teal-100 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 backdrop-blur-sm"
                    />
                    <div className="flex justify-between items-center mt-6">
                      <Button onClick={nextQuestion} variant="default" size="lg">
                        Save & Continue
                      </Button>
                      <span className="text-teal-400/70 font-medium">
                        Question {currentQuestionIndex + 1} of {currentStep === 'solo' ? levelQuestions.length : demoQuestions.length}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="text-center">
                  <Button
                    onClick={() => setCurrentStep('welcome')}
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Experience Selection
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Multiplayer Experience */}
            {currentStep === 'multiplayer' && (
              <motion.div
                key="multiplayer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <motion.h2 
                    className="text-4xl font-kahoot font-bold text-teal-400 mb-4"
                    animate={{ 
                      textShadow: [
                        "0 0 10px #14b8a6",
                        "0 0 20px #14b8a6, 0 0 30px #14b8a6",
                        "0 0 10px #14b8a6"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Multiplayer Room Experience
                  </motion.h2>
                  <div className="inline-flex items-center space-x-2 bg-kahoot-dark-surface px-6 py-3 rounded-xl border border-teal-500/30">
                    <Users className="w-5 h-5 text-teal-400" />
                    <span className="text-teal-200 font-mono">Room: DEMO123</span>
                  </div>
                </div>

                {/* Players Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {mockUsers.slice(0, 4).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`kahoot-card p-4 text-center ${
                        index === 0 ? 'neon-border animate-neon-pulse' : ''
                      }`}
                    >
                      <div className="text-3xl mb-2">{user.avatar}</div>
                      <div className="font-kahoot font-bold text-teal-300">{user.name}</div>
                      <div className="text-xs text-teal-400/70">
                        {index === 0 ? 'Your Turn' : 'Waiting'}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {currentQuestion && (
                  <div className="flex justify-center mb-8">
                    <GameCard
                      question={currentQuestion as any}
                      onSwipe={handleSwipe}
                      onReport={handleReportQuestion}
                    />
                  </div>
                )}

                {/* Recent Responses */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-teal-400 font-kahoot">Recent Responses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockUsers.slice(1, 3).map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.2 }}
                          className="flex items-start space-x-3 bg-kahoot-dark-surface p-4 rounded-xl"
                        >
                          <span className="text-2xl">{user.avatar}</span>
                          <div className="flex-1">
                            <div className="font-kahoot font-bold text-teal-300 mb-1">{user.name}</div>
                            <p className="text-teal-200/80 italic">
                              "{Object.values(user.responses)[0]}"
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={() => setCurrentStep('welcome')}
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Experience Selection
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Community Showcase */}
            {currentStep === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <motion.h2 
                    className="text-4xl font-kahoot font-bold text-teal-400 mb-4"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Meet Our Community
                  </motion.h2>
                  <p className="text-teal-200/80 text-lg">
                    Discover the diverse voices and perspectives in KAICHID
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {mockUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`kahoot-card p-6 cursor-pointer transition-all duration-300 ${
                        selectedUser?.id === user.id ? 'neon-border animate-neon-pulse' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-3">{user.avatar}</div>
                        <h3 className="text-xl font-kahoot font-bold text-teal-400 mb-2">{user.name}</h3>
                        <p className="text-teal-200/70 italic">{user.personality}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-teal-300">Questions:</span>
                          <span className="text-kahoot-green font-bold">{user.stats.questionsAnswered}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-teal-300">Rooms:</span>
                          <span className="text-kahoot-yellow font-bold">{user.stats.roomsJoined}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-teal-300">Insights:</span>
                          <span className="text-kahoot-red font-bold">{user.stats.insightsSaved}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="kahoot-card p-8"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="text-5xl">{selectedUser.avatar}</div>
                      <div>
                        <h3 className="text-2xl font-kahoot font-bold text-teal-400">{selectedUser.name}</h3>
                        <p className="text-teal-200/70">{selectedUser.email}</p>
                        <p className="text-teal-300 italic">{selectedUser.personality}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-kahoot font-bold text-teal-400 mb-4">Recent Insights</h4>
                        <div className="space-y-4">
                          {Object.entries(selectedUser.responses).map(([questionId, response]) => {
                            const question = demoQuestions.find(q => q.id === questionId);
                            return question ? (
                              <div key={questionId} className="bg-kahoot-dark-surface rounded-xl p-4">
                                <p className="text-sm text-teal-400/70 mb-2">{question.text}</p>
                                <p className="text-teal-200 italic">"{response}"</p>
                                <div className="mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    question.level === 'green' ? 'bg-kahoot-green/20 text-kahoot-green' :
                                    question.level === 'yellow' ? 'bg-kahoot-yellow/20 text-kahoot-yellow' :
                                    'bg-kahoot-red/20 text-kahoot-red'
                                  }`}>
                                    {question.level.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-kahoot font-bold text-teal-400 mb-4">Personal Journal</h4>
                        <div className="bg-kahoot-dark-surface rounded-xl p-6">
                          <p className="text-teal-200 mb-4">
                            "KAICHID has transformed how I connect with others. Each question opens a door to deeper understanding."
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-teal-400/70">Journey Started:</span>
                              <span className="text-teal-300">3 months ago</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400/70">Favorite Level:</span>
                              <span className="text-teal-300">Deep Vulnerability</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-teal-400/70">Most Active:</span>
                              <span className="text-teal-300">Evening sessions</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-center mt-8">
                  <Button
                    onClick={() => setCurrentStep('welcome')}
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Experience Selection
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Features Showcase */}
            {currentStep === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <motion.h2 
                    className="text-4xl font-kahoot font-bold text-teal-400 mb-4"
                    animate={{ 
                      textShadow: [
                        "0 0 10px #14b8a6",
                        "0 0 20px #14b8a6, 0 0 30px #14b8a6",
                        "0 0 10px #14b8a6"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Platform Features
                  </motion.h2>
                  <p className="text-teal-200/80 text-lg">
                    Discover what makes KAICHID unique
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {[
                    {
                      icon: User,
                      title: 'Solo Mode',
                      description: 'Personal reflection with AI-powered insights',
                      color: 'kahoot-green',
                      features: ['Private journaling', 'Progress tracking', 'Personalized questions']
                    },
                    {
                      icon: Users,
                      title: 'Multiplayer Rooms',
                      description: 'Real-time conversations with friends',
                      color: 'kahoot-blue',
                      features: ['Live sessions', 'Room codes', 'Group insights']
                    },
                    {
                      icon: Brain,
                      title: 'Smart Matching',
                      description: 'AI curates questions based on your mood',
                      color: 'kahoot-purple',
                      features: ['Mood detection', 'Adaptive difficulty', 'Personal growth']
                    },
                    {
                      icon: Crown,
                      title: 'Community Hub',
                      description: 'Connect with like-minded individuals',
                      color: 'kahoot-yellow',
                      features: ['Public insights', 'Community questions', 'Social features']
                    },
                    {
                      icon: Zap,
                      title: 'Real-time Analytics',
                      description: 'Track your conversation patterns',
                      color: 'web3-neon',
                      features: ['Engagement metrics', 'Growth tracking', 'Insights dashboard']
                    },
                    {
                      icon: Sparkles,
                      title: 'Web3 Integration',
                      description: 'Blockchain-verified authenticity',
                      color: 'web3-cyber',
                      features: ['NFT achievements', 'Decentralized storage', 'Token rewards']
                    }
                  ].map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          scale: 1.05,
                          y: -10,
                          transition: { duration: 0.2 }
                        }}
                        className="kahoot-card p-6 hover:animate-neon-pulse"
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <IconComponent className={`w-12 h-12 mb-4 text-${feature.color}`} />
                        </motion.div>
                        <h3 className={`text-xl font-kahoot font-bold mb-3 text-${feature.color}`}>
                          {feature.title}
                        </h3>
                        <p className="text-teal-200/70 mb-4">
                          {feature.description}
                        </p>
                        <ul className="space-y-1">
                          {feature.features.map((item, i) => (
                            <li key={i} className="text-sm text-teal-300/60 flex items-center">
                              <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => setCurrentStep('welcome')}
                    variant="ghost"
                    className="text-teal-400 hover:text-teal-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Experience Selection
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Game Completion Screen */}
            {currentStep === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-400 to-green-400 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Crown className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl font-kahoot font-bold text-teal-400 mb-4"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎉 Congratulations! 🎉
                  </motion.h2>
                  
                  <p className="text-xl text-teal-200/90 mb-6">
                    You've completed the KAICHID demo experience!
                  </p>
                  
                  <div className="max-w-md mx-auto bg-kahoot-dark-surface/50 p-6 rounded-xl border border-teal-500/30">
                    <h3 className="text-lg font-semibold text-teal-300 mb-4">Your Journey Summary</h3>
                    <div className="space-y-2 text-sm text-teal-200/80">
                      <div className="flex justify-between">
                        <span>Questions Explored:</span>
                        <span className="font-semibold text-teal-300">
                          {completedMode === 'solo' ? '151 (All Levels)' : `${demoQuestions.length} Questions`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Levels Completed:</span>
                        <span className="font-semibold text-teal-300">
                          {completedMode === 'solo' ? 'Green → Yellow → Red' : 'Demo Mode'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="font-semibold text-teal-300 capitalize">{completedMode === 'solo' ? 'Solo Journey' : 'Interactive Demo'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-teal-200/80">
                    Ready to start your real journey of self-discovery?
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" variant="default">
                      <Link href="/auth/register">Create Account</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/solo">Try Real Solo Mode</Link>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button
                      onClick={() => {
                        resetDemoState();
                        setCurrentStep('welcome');
                      }}
                      variant="ghost"
                      className="text-teal-400 hover:text-teal-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Restart Demo
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call to Action */}
          {currentStep !== 'welcome' && currentStep !== 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-16"
            >
              <Card className="max-w-2xl mx-auto p-8">
                <CardContent className="text-center space-y-6">
                  <motion.h3 
                    className="text-3xl font-kahoot font-bold text-teal-400"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Ready to Start Your Journey?
                  </motion.h3>
                  <p className="text-teal-200/80 text-lg">
                    Join thousands discovering deeper connections through KAICHID
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="xl" variant="default">
                      <Link href="/auth/register">Create Account</Link>
                    </Button>
                    <Button asChild size="xl" variant="outline">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-center mt-12"
          >
            <Button asChild variant="success">
              <Link href="/solo">Try Solo Mode</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="neon">
              <Link href="/journal">View Journal</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}