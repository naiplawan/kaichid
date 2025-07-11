# Kaichid - Connect Through Meaningful Conversations 🌟

A beautiful, mystical card game application that brings people together through thought-provoking questions and meaningful conversations. Built with **Next.js**, **Supabase**, and **pnpm** for modern, scalable development.

## ✨ Features

- **Solo Mode**: Personal reflection with curated questions
- **Multiplayer Rooms**: Real-time group conversations (Supabase Realtime)
- **Question Library**: Curated and custom questions across different themes and difficulty levels
- **Journal**: Save and reflect on your answers
- **User Profiles**: Secure authentication and personalized experience
- **Real-time Updates**: Live multiplayer experiences with Supabase
- **Beautiful UI**: Mystical, responsive design with smooth animations

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with app router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **pnpm** - Fast, efficient package management

### Backend & Database
- **Supabase** - Complete backend solution
  - PostgreSQL database
  - Authentication (email/password)
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Edge functions (if needed)

### Deployment
- **Vercel** - Serverless deployment platform
- **Edge Runtime** - Fast global delivery

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) or npm
- **Supabase account** ([supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd kaichid
pnpm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 3. Environment Setup

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run the SQL migrations in your Supabase SQL editor:

1. Run `supabase/schema.sql` first (base schema)
2. Run `supabase/migrations/20250627120000_increment_reported_count.sql`
3. Run `supabase/migrations/20250627130000_multiplayer_support.sql`

Or use the Supabase CLI:

```bash
# If you have Supabase CLI installed
supabase db reset
```

### 5. Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### 6. Deployment on Vercel

1. Push to GitHub/GitLab
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## 📁 Project Structure

```
kaichid/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Game, Realtime)
├── lib/               # Utilities and Supabase client
├── pages/             # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── auth/          # Authentication pages
│   └── multiplayer/   # Room-based multiplayer
├── styles/            # Global styles
├── supabase/          # Database schema and migrations
└── public/            # Static assets
```

## 🎮 How to Play

### Solo Mode
1. Choose your preferred themes and difficulty
2. Answer thought-provoking questions
3. Save meaningful responses to your journal
4. Reflect on your personal growth

### Multiplayer Mode
1. Create a room with custom settings
2. Share the room code with friends
3. Take turns answering questions together
4. Build deeper connections through shared experiences

## 🔧 Development

### Available Scripts

```bash
# Package management
pnpm install           # Install dependencies
pnpm add <package>     # Add new dependency
pnpm remove <package>  # Remove dependency

# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript check

# VS Code tasks (Ctrl+Shift+P → "Tasks: Run Task")
# - Install Dependencies
# - Dev Server
# - Build
# - Lint
# - Type Check
```

### Database Schema

- **user_profiles**: User information and preferences
- **questions**: Question library with themes and difficulty levels
- **saved_questions**: User's saved answers and reflections
- **game_rooms**: Multiplayer room management
- **room_players**: Player tracking in rooms
- **game_sessions**: Active game state management
- **player_responses**: Multiplayer game responses

### Key Features

#### Authentication
- Email/password authentication via Supabase Auth
- Automatic user profile creation
- Row Level Security for data protection

#### Real-time Features
- Live player presence in rooms
- Real-time game state synchronization
- Instant updates across all connected clients

#### Question System
- Pre-approved question library
- Custom user-submitted questions
- Theme-based categorization (Relationships, Growth, Values, etc.)
- Difficulty progression (Green → Yellow → Red)

## 🔒 Security

- **Row Level Security (RLS)** on all tables
- **User-based access control** for sensitive data
- **Input validation** on all forms
- **XSS protection** with proper sanitization
- **CSRF protection** via Supabase

## 🌐 API Reference

### Questions API
- `GET /api/questions` - Get filtered questions
- `POST /api/questions/submit` - Submit custom question
- `POST /api/questions/[id]/report` - Report inappropriate content

### Rooms API
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room

### Saved Questions API
- `GET /api/saved-questions` - Get user's saved answers
- `POST /api/saved-questions` - Save/update answer

## 🎨 Theming

The app uses a mystical, warm color scheme:
- **Primary**: Mystical Gold (`#D4AF37`)
- **Background**: Deep Dark (`#0F0F23`)
- **Cards**: Dark Purple (`#1A1B3A`)
- **Text**: Light grays with golden accents

Customize in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      'mystical-gold': '#D4AF37',
      'mystical-dark': '#0F0F23',
      'mystical-dark-lighter': '#1A1B3A',
    }
  }
}
```

## 📈 Performance

- **Static Site Generation** for optimal loading
- **Image optimization** with Next.js
- **Bundle splitting** for efficient loading
- **Edge deployment** via Vercel
- **Optimistic updates** for real-time features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Test both solo and multiplayer features
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

- [ ] Advanced question filtering and search
- [ ] Private/public room options
- [ ] Question voting and rating system
- [ ] Export journal entries
- [ ] Mobile app (React Native)
- [ ] AI-powered question suggestions
- [ ] Group analytics and insights
- [ ] Customizable room themes

## 💬 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

*Made with ❤️ for meaningful connections and deeper conversations*

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm type-check
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (for API routes) | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## 🚨 Migration from Firebase

This project has been migrated from Firebase to Supabase for better fullstack capabilities:

- ✅ Authentication moved to Supabase Auth
- ✅ Database moved to Supabase (PostgreSQL)
- ✅ Real-time features using Supabase Realtime
- ✅ Removed Socket.io dependency
- ✅ Optimized for Vercel deployment

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Your Vercel URL]
- **Supabase Dashboard**: [Your Supabase Project]
- **Vercel Dashboard**: [Your Vercel Project]
