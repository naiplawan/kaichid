# Product Requirements Document (PRD) for Deep Talk Card Game Web App

## 1. Introduction

### 1.1. Document Purpose
This Product Requirements Document (PRD) details the **"Deep Talk Card Game Web App"** from a product perspective, building upon the Software Requirements Specification (SRS). It aims to provide the development team with a clear understanding of the product's vision, features, and user experience, translating high-level requirements into actionable specifications.

### 1.2. Product Vision
To be the leading digital platform for fostering genuine human connections through guided, meaningful conversations, offering a safe and intuitive space for self-reflection and group interaction across varying levels of intimacy.

### 1.3. Target Audience
Individuals, friends, and small groups (2-10 players) seeking authentic, engaging, and reflective conversations. Users are typically mobile-savvy, appreciate intuitive design, and are interested in personal growth and strengthening relationships.

### 1.4. Business Goals
- **Engagement**: Increase user session duration and frequency through compelling content and interactive gameplay.
- **Retention**: Foster a loyal user base by providing a consistently valuable and enjoyable experience.
- **Scalability**: Build a robust platform capable of supporting a growing user base and content library.
- **User-Generated Content**: Encourage community contribution of questions to enrich the content library.
- **Safety & Inclusivity**: Ensure a positive and safe environment for all users.

## 2. Key Features and Functionality
This section details the primary features of the Deep Talk Oracle.

### 2.1. User Account Management
- **Registration & Login**: Users can create an account using email/password or social login (e.g., Google, Facebook).
- **User Profiles**: Each user will have a unique profile to store personal preferences, saved questions, and solo responses.
- **Security**: User credentials will be securely stored and managed (refer to SRS NFR-4.5.1).

### 2.2. Game Mode Selection
Upon login, users will be presented with a clear choice between two primary game modes:
- **Solo Mode**: For individual self-reflection and journaling.
- **Multiplayer Mode**: For real-time, turn-based interaction with friends or groups.

### 2.3. Solo Mode Experience
- **Level Selection**: Before starting, users select a conversation depth: Green (Icebreaker), Yellow (Exploration), or Red (Vulnerability).
- **Card Interaction**: Swipe-based mechanism (Insight/Skip) as defined in SRS FR-6.4 to FR-6.7.
- **Response Input**: After swiping "Insight," a text input field appears, allowing users to type their reflection or answer to the question.
- **Response Saving**: Users can save their typed responses, linked to the question, to their personal "Journal."
- **Privacy Controls**: For each saved response, users can set its privacy (e.g., "Private" by default, "Shared" if a future social sharing feature is implemented).
- **Journal/My Responses**: A dedicated section where users can review all their saved questions and responses, organized by date or level/theme.

### 2.4. Multiplayer Mode Experience

#### Room Creation:
- A user can create a new private game room.
- The system generates a unique, shareable 6-digit alphanumeric Room ID/Code (e.g., "XYZ123").
- The creator sets initial game parameters, such as:
  - Number of rounds (e.g., 1, 3, or 'until deck exhausted').
  - Level progression (e.g., fixed Green, or Green → Yellow → Red).
  - Optional themes (e.g., Relationships, Personal Growth).
  - Max players (2-10).

#### Room Joining:
Users can enter an existing Room ID/Code to join a game.

#### Lobby:
- Players joining a room will enter a lobby.
- The lobby displays a list of all connected players' usernames.
- The room creator sees a "Start Game" button, activated once a minimum of 2 players are present.

#### Turn-Based Gameplay:
- **Turn Order**: The system establishes and displays the current turn order (e.g., Player 1, Player 2...).
- **Question Display**: For the current player's turn, a new question card appears prominently. Other players see a "waiting for [Player Name]" or "listening" state.
- **Player Interaction**: The current player swipes the card (Insight/Skip).
- **Optional Response Sharing**: After swiping, the current player has the option to type and share their response with the group.
- **Group View**: Shared responses are immediately visible to all players in the room, appearing in a chat-like or response log area.
- **Turn Progression**: The turn automatically passes to the next player after the current player interacts or a configurable timer expires.
- **Level Progression**: The game automatically progresses through pre-defined levels (e.g., Round 1: Green, Round 2: Yellow, Round 3: Red), indicated clearly to all players.

#### Wildcard Actions:
Occasionally, special "wildcard" questions or actions will appear:
- "Pass the question to [another player's name]."
- "All players answer this question in brief."
- "Choose the next theme for this round."

The UI will present the wildcard action and relevant interactive options (e.g., player selection dropdown, multi-input field).

#### Game End:
The game concludes after a set number of rounds or when the question deck for the chosen level/theme is exhausted.

A **"Game Summary"** screen displays:
- List of questions discussed.
- Log of shared responses.
- Optional player score/engagement metrics (future consideration).

2.5. Dynamic Question System
Backend Database: All questions are stored and managed in a Firestore database.

Question Attributes: Each question has:

text (String): The question itself.

level (String): "green", "yellow", "red".

theme (String): e.g., "relationships", "personal growth", "values", "career", "fun".

isCustom (Boolean): Flag for user-submitted questions.

creatorId (String, Optional): User ID if custom.

status (String): "approved", "pending", "rejected" (for moderation).

reportedCount (Number): Counter for reports.

Filtering: Users can filter question decks by theme before starting a game.

Randomization: Questions are delivered randomly and avoid repetition within a single game session.

User Customization (Question Submission):

Registered users can submit new questions through a dedicated UI.

Submitted questions include proposed level and theme.

New custom questions are marked as "pending" for moderation.

Content Moderation:

Administrators have an interface (backend tool, not part of user-facing app) to review, approve, or reject pending custom questions.

Users can report inappropriate questions during gameplay. Reported questions are flagged for admin review.

Approved custom questions become available for all users.

2.6. Card Display & Interaction
Visual Fidelity: Tarot-card aesthetic with dynamic border colors based on the question's level (Green, Yellow, Red). Includes ornate inner borders and subtle glow effects.

Swipe Feedback: "INSIGHT" (green) and "SKIP" (red) indicators dynamically appear with increasing opacity and rotation during a swipe.

Animation: Smooth transitions for card swipes (off-screen or snap-back) and screen changes.

2.7. Deck Management
Session-Specific Tracking: Each game session (solo or multiplayer) tracks which questions have been played and discarded to ensure no repetition within that session.

End of Deck Modal: When the active deck (for the chosen level/theme) is exhausted, a modal appears, offering:

"Draw New Fate (Same Level)": Reshuffles all questions for the current level/theme, clearing session-specific discarded questions.

"Review Insights": Navigates to the user's "Saved Questions" (Journal) screen.

"Consult New Deck (Choose Level)": Returns to the game mode/level selection screen.

2.8. Saved Questions ("Journal")
Persistent Storage: Saved questions (Insight swipes) are persistently stored in the user's Firestore profile.

Review Interface: A scrollable list displaying saved questions, their level, and theme.

Response Display: If a response was recorded in solo mode, it's displayed alongside the question.

Removal: Users can remove questions from their saved list.

3. User Stories
This section describes key functionalities from the perspective of different user roles.

3.1. General User Stories (Applicable to all users)
As a new user, I want to create an account so I can save my progress and preferences.

As a user, I want to log in/out securely so my data is protected.

As a user, I want to see an inviting landing page so I understand what the app is about before diving in.

As a new user, I want to be guided through a "How to Play" section so I understand the game mechanics and levels.

As a user, I want to be able to swipe cards left or right so I can easily interact with questions.

As a user, I want to see clear visual feedback (INSIGHT/SKIP) when I swipe so I know my action is registered.

As a user, I want card animations to be smooth so the experience feels fluid and premium.

As a user, I want to see a Tarot-like design for the cards and interface so the app feels mystical and unique.

As a user, I want to review questions I've liked/saved so I can revisit them for personal reflection or future discussions.

As a user, I want the option to reshuffle the deck so I can continue playing without seeing old cards for a while.

As a user, I want to be notified when the deck is exhausted so I know my current game round is complete.

As a user, I want to exit the game at any time without judgment so I feel in control of my experience.

As a user, I want content to be respectful and inclusive so I feel safe and comfortable exploring deep topics.

3.2. Solo Mode User Stories
As a solo player, I want to choose a conversation level (Green, Yellow, Red) so I can tailor the depth of my self-reflection.

As a solo player, I want to type my responses to questions so I can record my thoughts.

As a solo player, I want to save my responses privately so only I can see them.

As a solo player, I want to view my past questions and responses in a "Journal" so I can track my personal growth.

3.3. Multiplayer Mode User Stories
As a user, I want to create a private room so I can play with my friends.

As a room creator, I want to share a Room ID/Code so my friends can join easily.

As a room creator, I want to set game parameters (duration, level progression) so I can customize the experience for my group.

As a player, I want to join an existing room with a Room ID/Code so I can play with others.

As a player in a lobby, I want to see who else has joined so I know when the game can start.

As a room creator, I want to start the game when enough players are ready so we can begin our deep talk session.

As a player, I want to know whose turn it is so I can follow the flow of the game.

As the current player, I want to see the question clearly so I can reflect and respond.

As a non-current player, I want to see a "waiting" indicator so I know when it's my turn.

As the current player, I want to optionally share my text response with the group so we can all engage.

As a player, I want to see other players' shared responses so I can follow the conversation.

As a player, I want the game to automatically progress through levels so the conversation deepens naturally.

As a player, I want to encounter "wildcard" actions so the game stays dynamic and surprising.

As a player, I want to see a game summary at the end so I can reflect on the discussions.

3.4. Content Creator/Administrator Stories
As an administrator, I want to approve or reject user-submitted questions so I can maintain content quality and safety.

As an administrator, I want to easily add, edit, or remove questions from the database so the content library can grow and stay fresh.

As an administrator, I want to review reported questions so I can address inappropriate content quickly.

4. Technical Considerations (Summary from SRS)
Frontend: Next.js (React.js)

Backend:  Next.js (React.js)

Database: Supabase

Real-time Communication: Socket.io

Authentication: Firebase Authentication

Styling: Tailwind CSS

Deployment: Frontend to static/serverless hosting; Backend to web service.

5. Metrics & Success Measures
User Engagement:

Average session duration (especially in multiplayer).

Number of cards swiped per session.

Number of responses saved (solo mode).

Frequency of app usage (daily/weekly active users).

Retention:

Percentage of users returning after 1 day, 7 days, 30 days.

Content Growth:

Number of user-submitted questions (and approval rate).

Diversity of questions across levels and themes.

Performance:

Swipe animation smoothness (target 60fps).

API response times (target <500ms).

Multiplayer latency (target <200ms).

User Satisfaction:

Positive user feedback (e.g., app store reviews, direct feedback).

Low bug/crash report rates.

6. Future Considerations (Out of Scope for Initial Release)
Voice input for responses.

User-to-user private messaging.

Integration with social platforms for sharing game summaries or responses.

Advanced moderation tools (AI-assisted content filtering).

More intricate game parameters (e.g., custom timers, specific turn orders).

User-specific analytics dashboard.

Multi-language support.
