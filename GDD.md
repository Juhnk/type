Game Design Document: TypeAmp
Version: 5.0 (Final Blueprint) Date: July 1, 2025 Author: Gemini AI
1.0 PRODUCT OVERVIEW & PHILOSOPHY
1.1 Product Name
Type
1.2 Tagline
Amplify Your Skill.
1.3 Core Philosophy
TypeAmp is founded on the principle of frictionless skill amplification. Every design and technical decision serves to remove barriers between the user and their goal of tangible improvement. Our philosophy is manifested in three key pillars:
Instant Access, Optional Identity: The full power of the application is available instantly, without requiring an account. Data is sacred and belongs to the user, persisted locally by default. An account is a feature, not a requirement—a tool for users who wish to sync their progress across devices.
Practice with Purpose: We believe that the most effective practice is one that mirrors real-world application. Typing should not be a disconnected activity but an opportunity to reinforce practical knowledge, whether that's code syntax, professional communication, or academic vocabulary.
Data-Driven Insight: Improvement comes from understanding performance. We provide users with deep, actionable analytics, moving beyond simple WPM to metrics like consistency and raw speed, allowing for precise identification of strengths and weaknesses.
1.4 Target Audience
Performance Enthusiasts: Typists who track their metrics and want to push their speed and accuracy to the highest levels.
Professionals & Students: Individuals seeking to improve their typing efficiency for job-related tasks (email, reports, coding, data entry) and academic work.
Keyboard Hobbyists: Users who enjoy customizing their tools, themes, and overall typing experience.
Casual Visitors: Anyone looking for a quick, high-quality typing test without the commitment of creating an account.
2.0 CORE FEATURES & FUNCTIONALITY
2.1 Typing Engine
The core of the TypeAmp experience.
Real-time Feedback: Instant character-by-character validation (correct, incorrect).
Comprehensive Metrics: Live calculation and post-test display of WPM, Raw WPM, Accuracy, and Consistency.
Multiple Game Modes:
Time: 15, 30, 60, 120 seconds.
Words: 10, 25, 50, 100 words.
Quote: Complete a specific block of text. This is the default mode for AI-generated content.
Customizable Content:
Word Lists: English (1k, 10k, 450k), programming languages (JavaScript, Python), etc.
Punctuation & Numbers: Toggles to include these characters in standard tests.
2.2 AI-Powered Learning Module (/learn)
The signature feature of TypeAmp.
Prompt-Driven Generation: Users enter a topic (e.g., "React hooks," "business negotiation emails"), and the AI generates a relevant, high-quality text block for practice.
Context-Aware Scenarios: The AI is engineered to produce realistic and practical content, providing a dual benefit of typing practice and knowledge reinforcement.
2.3 Analytics & User Profile (/profile)
Local-First History: All test results are saved to the user's browser localStorage by default.
Rich Data Visualization: The profile page features interactive line charts (using Recharts) to track performance trends over time.
Personal Best Tracking: The system automatically identifies and highlights personal bests (PBs) for every test configuration.
Tagging System: Users can add tags (e.g., "new keyboard," "tired") to tests to filter their history and analyze performance under different conditions.
2.4 Deep Customization (/settings)
Appearance: Curated themes, font selection, and the ability to toggle the visibility of UI elements.
Behavior: Control over caret style (line, block, underline), sound effects, and advanced features like the Pace Caret.
Test Difficulty:
Normal: Standard mode.
Expert: Test fails upon submitting an incorrect word.
Master: Test fails upon a single incorrect keystroke.
2.5 Command Palette
Frictionless Control: A modal accessible via Ctrl+K or Esc allows users to control the entire application (change modes, themes, settings) without leaving the keyboard, ensuring a state of flow.
3.0 USER EXPERIENCE & INTERFACE DESIGN
3.1 Design System
Component Library: shadcn/ui for its accessibility, composability, and clean aesthetic.
Typography:
UI: Inter for its clarity and modern feel.
Typing Text: Roboto Mono for its excellent readability and clear distinction between similar characters (e.g., O and 0).
Animation: Transitions are subtle and purposeful, primarily using CSS transform and opacity properties with cubic-bezier timing functions for a smooth, high-performance feel.
3.2 Page Layouts
3.2.1 Main Interface (/)
Layout: A single, centered column. Maximum focus is on the text area.
Components:
Header: Minimalist, with icon-based navigation (<Home>, <User>, <BarChart3>, <BrainCircuit>, <Settings>). A subtle Button with variant="outline" for "Login".
Configuration Bar: A row of Badge components above the text area displaying the current settings (e.g., time 60, english 1k). Clicking a badge opens the Command Palette.
Text Area: A large div where each character is a <span>. The active word has a subtle background highlight.
Live Stats: A minimal div below the text area displaying live WPM. Becomes less opaque during the test to reduce distraction.
Footer: Contains links to About, Privacy, and GitHub.
3.2.2 Profile Page (/profile)
Layout: A responsive grid.
Components:
Alert Component: A non-intrusive banner at the top: "Create a free account to sync your history across devices."
Summary Card: Displays four key metrics with large text and descriptive labels.
History Table: A Table component displaying recent tests. The TableHead is sticky.
Graphs Card: A Card containing a LineChart from Recharts. Select components allow changing the displayed metric (WPM, Accuracy) and time frame.
3.2.3 AI Learn Page (/learn)
Layout: A single, centered Card.
Components:
CardHeader: "Amplify Your Practice".
CardContent: An Input field for the user's prompt and a Button labeled "Generate".
CardFooter: Shows examples of effective prompts.
4.0 DETAILED FUNCTIONAL SPECIFICATIONS
4.1 Core Typing Engine Logic
State Management (Zustand Store):
testConfig: { mode, duration, wordlist, punctuation, difficulty }
textToType: string
charStates: Array<{ char: string, status: 'default' | 'correct' | 'incorrect' }>
userInput: string
gameStatus: 'ready' | 'running' | 'finished'
stats: { wpm, raw, acc, consistency, startTime, endTime }
handleKeyPress(event: KeyboardEvent) Function Logic:
If gameStatus is 'ready', set gameStatus to 'running', record stats.startTime, and start the main setInterval timer.
Prevent default browser actions for keys like Tab and Space (when not appropriate).
If event.key is Backspace:
If userInput.length === 0, do nothing.
Decrement userInput.length.
Update charStates[userInput.length].status to 'default'.
Update the state.
If event.key is a valid character:
const index = userInput.length;
const expectedChar = textToType[index];
const newStatus = event.key === expectedChar ? 'correct' : 'incorrect';
If difficulty === 'master' and newStatus === 'incorrect', end the game.
Update charStates[index].status to newStatus.
Append event.key to userInput.
Update the state.
Statistics Calculation Formulas:
WPM (Net): ( (totalCorrectChars / 5) / (elapsedMinutes) )
Raw WPM: ( (totalTypedChars / 5) / (elapsedMinutes) )
Accuracy: (totalCorrectChars / totalTypedChars) * 100
Consistency: The standard deviation of WPM samples taken at 3-second intervals throughout the test. A lower value is better.
4.2 Local Storage Data Model
Key: typeamp-data
Value (JSON String):

{
  "version": "1.0",
  "userSettings": {
    "theme": "nord",
    "caretStyle": "block",
    "paceCaretWpm": 80
  },
  "testHistory": [
    {
      "id": "local-1656723456789",
      "wpm": 95,
      "accuracy": 98.5,
      "rawWpm": 101,
      "consistency": 88,
      "config": { "mode": "time", "duration": 60, "wordlist": "english1k" },
      "tags": ["new keyboard"],
      "timestamp": 1656723456789
    }
  ]
}
5.0 TECHNICAL ARCHITECTURE
5.1 Frontend
Framework: Next.js (with App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Library: shadcn/ui
State Management: Zustand
Data Fetching: SWR (for API calls)
Charting: Recharts
5.2 Backend
Framework: Node.js with Fastify
Language: TypeScript
ORM: Prisma
Database: PostgreSQL
Authentication: JWT (JSON Web Tokens)
5.3 Database Schema (PostgreSQL)
-- Users Table
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY, -- Using CUIDs
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UserSettings Table
CREATE TABLE "UserSettings" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "theme" VARCHAR(50) NOT NULL DEFAULT 'slate',
    "caretStyle" VARCHAR(20) NOT NULL DEFAULT 'line',
    "paceCaretWpm" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- TestResults Table
CREATE TABLE "TestResults" (
    "id" TEXT NOT NULL PRIMARY KEY, -- Using CUIDs
    "userId" TEXT NOT NULL,
    "wpm" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "rawWpm" INTEGER NOT NULL,
    "consistency" DOUBLE PRECISION,
    "config" JSONB NOT NULL,
    "tags" TEXT[],
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestResults_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

5.4 API Endpoint Specification
Public Endpoints
GET /api/words?list=english1k&limit=100 -> 200 OK with { words: [...] }
POST /api/generate-challenge -> Body: { prompt: string } -> 200 OK with { text: string }
Authenticated Endpoints (Requires Authorization: Bearer <JWT>)
POST /api/auth/register -> Body: { email, password } -> 201 Created with { user, token }
POST /api/auth/login -> Body: { email, password } -> 200 OK with { user, token }
GET /api/me/profile -> 200 OK with user profile data.
PUT /api/me/settings -> Body: { theme, caretStyle, ... } -> 200 OK
POST /api/me/tests -> Body: { wpm, accuracy, ... } -> 201 Created
POST /api/me/tests/bulk -> Body: { tests: [...] } -> 201 Created (For initial sync)
6.0 CONCLUSION
This document outlines the complete vision for TypeAmp. By adhering to the principles of frictionless access, purposeful practice, and data-driven insights, TypeAmp is positioned to become a definitive platform for skill amplification. The anonymous-first architecture ensures the widest possible reach, while the optional account system provides a powerful incentive for long-term user retention. The technical specifications provide a clear and robust foundation for building a high-quality, scalable, and maintainable application.

