# Deep Talk Oracle

Deep Talk Oracle is a web application designed to foster genuine human connections through guided, meaningful conversations. It offers a safe and intuitive space for self-reflection in solo mode and group interaction in multiplayer mode.

## Features

- **User Account Management:** Secure registration and login using email/password or Google social login.
- **Solo Mode:** Engage in personal self-reflection with questions categorized by depth (Green: Icebreaker, Yellow: Exploration, Red: Vulnerability). Users can save their insights to a personal journal.
- **Multiplayer Mode:** Create private rooms, invite friends, and participate in real-time, turn-based conversations. Includes a lobby system and dynamic question progression.
- **Dynamic Question System:** Questions are fetched from a Supabase database, categorized by level and theme. Users can also submit their own questions for moderation.
- **Card Interaction:** Intuitive swipe-based mechanism for interacting with question cards, featuring a Tarot-card aesthetic and smooth animations.
- **Personal Journal:** A dedicated section to review all saved questions and responses from solo sessions.
- **Question Reporting:** Users can report inappropriate questions for administrator review.

## Technology Stack

- **Frontend:** Next.js (React.js)
- **Backend:** Next.js API Routes & Socket.io (for real-time communication)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Firebase Authentication
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion

## Setup Instructions

Follow these steps to get the Deep Talk Oracle application up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <repository_url>
cd kaichid
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables. Replace the placeholder values with your actual API keys and URLs from Firebase and Supabase.

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Important:** The `SUPABASE_SERVICE_KEY` is a sensitive key and should only be used on the server-side (e.g., in `server/index.ts`). Never expose it to the client-side.

### 4. Supabase Database Setup

1.  **Create a new Supabase project.**
2.  **Run the SQL Schema:** Go to the SQL Editor in your Supabase dashboard and run the SQL script provided in `supabase/schema.sql` to create the necessary tables and functions.
    *   `user_profiles`
    *   `questions`
    *   `saved_questions`
    *   `game_rooms`
    *   `increment_reported_count` function
    *   Row Level Security (RLS) policies.
3.  **Enable `uuid-ossp` extension:** In your Supabase project, navigate to `Database` -> `Extensions` and enable the `uuid-ossp` extension. This is required for `uuid_generate_v4()`.

### 5. Firebase Authentication Setup

1.  **Create a new Firebase project.**
2.  **Enable Email/Password Authentication:** In the Firebase console, go to `Authentication` -> `Sign-in method` and enable `Email/Password`.
3.  **Enable Google Authentication:** Also enable `Google` as a sign-in provider.
4.  **Get Firebase Config:** Go to `Project settings` -> `General` and find your Firebase configuration object. Copy the values into your `.env.local` file.

### 6. Run the Application

To start the Next.js development server and the Socket.io server:

```bash
npm run dev
```

This will start the Next.js frontend on `http://localhost:3000` and the Socket.io backend on `http://localhost:3001`.

### 7. Run the Socket.io Server Separately (Optional, for production or if `npm run dev` doesn't start both)

If `npm run dev` does not automatically start the Socket.io server, or for production deployments, you can run it separately:

```bash
npm run server:dev
```

## Project Structure

```
kaichid/
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── pnpm-workspace.yaml
├── postcss.config.js
├── srs-kaichid.md
├── tailwind.config.js
├── tsconfig.json
├── .vscode/
│   └── tasks.json
├── components/
│   └── Card.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   └── SocketContext.tsx
├── lib/
│   ├── firebase.ts
│   └── supabase.ts
├── pages/
│   ├── _app.tsx
│   ├── dashboard.tsx
│   ├── index.tsx
│   ├── solo.tsx
│   ├── journal.tsx
│   ├── create-room.tsx
│   ├── join-room.tsx
│   ├── submit-question.tsx
│   ├── multiplayer/
│   │   └── [roomCode].tsx
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
├── server/
│   └── index.ts
├── styles/
│   └── globals.css
└── supabase/
    └── schema.sql
```

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is open source and available under the [MIT License](LICENSE).
