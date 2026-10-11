<<<<<<< HEAD
# QuizPilot — Smart Revision Assistant 🚀

**QuizPilot** is a full-stack, AI-powered Board Quiz Platform engineered to help secondary and higher secondary students (CBSE / State Boards) master core concepts, diagnose weak syllabus topics, and build daily revision habits through adaptive difficulty algorithms.

Powered by the **official Google Gen AI SDK (`@google/genai`)** with a verified Board Question Bank fallback.

---

## 🌟 Key Platform Features

1. **Official Google Gemini Integration (`@google/genai`)**:
   - **Dedicated Gemini Service**: Built with the official Google Gen AI SDK for Node.js (`@google/genai`).
   - **Supported Models**: Configured with `gemini-2.5-flash`, `gemini-1.5-flash`, and `gemini-2.0-flash`.
   - **Structured JSON Schema**: Prompts enforce valid JSON output consisting of `question`, four distinct `options`, `correctAnswer` (0-3 index), `explanation`, `topic`, and `difficulty`.
   - **Strict Backend Validation**: Incoming Gemini responses are sanitized and validated on the server before being sanitized for students.
   - **Resilient Fallback**: If `GEMINI_API_KEY` is not configured, expired, rate-limited (HTTP 429), or encounters network/model issues, QuizPilot automatically engages the verified 33+ Board Question Bank and clearly informs the user.
   - **Secret Privacy**: `GEMINI_API_KEY` is stored strictly in `backend/.env` and is never exposed in React or client code.

2. **Dedicated Quiz Attempt Interface**:
   - Single-question pacing with 4 interactive options.
   - Question Navigation Palette with live color coding (Current, Answered, Unanswered, Marked for Review).
   - Real-time quiz timer with `mm:ss` formatting.
   - Mark for Review bookmarking.
   - Submission confirmation modal detailing answered and unattempted counts.

3. **Server-Side Evaluation & Scoring**:
   - Client sends only selected option indices; server computes scores and accuracy.
   - Anti-cheat prevention: Duplicate quiz retakes do not award duplicate leaderboard points.
   - Difficulty-weighted points system: Easy (10 pts), Medium (15 pts), Hard (25 pts), Adaptive (20 pts), plus +30 pts distinction bonus for &ge;90% accuracy.

4. **Weak Topics & Adaptive Difficulty**:
   - Aggregates past question performance per topic/unit.
   - Minimum sample thresholds before labeling a topic as weak.
   - Calculates recent performance trends (*Improving*, *Declining*, *Stable*).
   - One-click **"Revise Topic"** action generates a focused revision quiz on that exact concept.
   - Adaptive difficulty recommendation based on recent 5-attempt rolling accuracy.

5. **Consecutive Calendar Day Streaks**:
   - Tracks consecutive days with at least one completed quiz.
   - Displays current daily streak and all-time longest streak.
   - Automatically maintains streak on multiple daily quizzes without double-counting.

6. **Global Leaderboard**:
   - Real-time ranking based on points earned from verified attempts.
   - Complete privacy protection: display names and public stats only, never exposing emails or passwords.
   - Podium presentation for Top 3 (Gold, Silver, Bronze) with user's own ranking highlighted.

7. **One-Click CSV Export**:
   - Exports the authenticated student's actual saved history (Date, Subject, Unit, Difficulty, Total Questions, Correct, Score, Accuracy, Time Taken, Points Awarded).
   - Generates Excel-compatible UTF-8 CSV downloads.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + Vite 8
  - Tailwind CSS v4
  - React Router DOM v7
  - Axios (with JWT interceptors)
  - Lucide React (clean educational iconography)
  - Recharts (analytical progress visualizations)
- **Backend**:
  - Node.js (v18+)
  - Express.js v5
  - **Official Google Gen AI SDK (`@google/genai`)**
  - MongoDB & Mongoose (local instance or MongoDB Atlas)
  - JSON Web Tokens (`jsonwebtoken`)
  - Bcrypt password hashing (`bcryptjs`)

---

## 📁 Project Structure

```text
boards_quiz/
├── backend/
│   ├── config/             # MongoDB connection (db.js)
│   ├── controllers/        # Auth, Dashboard, Quiz, Analytics, Leaderboard, Export
│   ├── middleware/         # authMiddleware (JWT verification)
│   ├── models/             # User, Quiz, QuizAttempt, QuestionBank
│   ├── routes/             # Express API routes
│   ├── seed/               # Question bank seed & sample leaderboard users
│   ├── services/           # geminiService (@google/genai), aiService, questionBankService, evaluationService, streakService
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, Header, MetricCard, Palette, Modal, Badges
│   │   ├── context/        # AuthContext (state & session management)
│   │   ├── layouts/        # DashboardLayout, AuthLayout
│   │   ├── pages/          # Login, Register, Dashboard, Generator, Attempt, Results, WeakTopics, Leaderboard, History, Settings
│   │   ├── services/       # Axios API service integrations
│   │   ├── App.jsx         # Routing configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── package.json
```

---

## ⚡ Quick Start & Google Gemini Setup

### 1. Obtain a Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google Account and click **"Get API key"**.
3. Create an API key in a Google Cloud project.

### 2. Configure Backend Environment
Navigate to `backend` and create your `.env` from `.env.example`:
```bash
cd backend
cp .env.example .env
```
Inside `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/quizpilot
JWT_SECRET=quizpilot_super_secret_jwt_key_2026_dev_prod

# Google Gemini API Key from Google AI Studio
# If left empty, QuizPilot smoothly uses the verified 33+ Board Question Bank
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note**: Never commit your `.env` file or real API keys to version control. The backend reads `GEMINI_API_KEY` strictly via `process.env`. The key is never transmitted or exposed to frontend React code.

### 3. Seed Verified Board Questions & Leaderboard
From the `backend` folder:
```bash
npm run seed
```
This initializes the verified Board Question Bank (Physics, Chemistry, Math, Biology, CS, English) and sets up sample leaderboard participants (`Aarav Sharma`, `Priya Patel`, etc.).

### 4. Start Backend Server
```bash
npm start
```
The backend API will start on `http://localhost:5000`.

### 5. Start Frontend Client
In a new terminal:
```bash
cd frontend
npm run dev
```
The Vite development server will open on `http://localhost:5173`.

---

## 🧪 Complete End-to-End Testing Walkthrough

Follow this verification flow:

1. **Authentication**:
   - Go to `http://localhost:5173/register` and create an account, or log in with demo student: `aarav.sharma@example.com` / `Password123!`.
2. **Dashboard Overview**:
   - View your current daily streak, average accuracy, points, and weak topic summaries.
3. **Generate a Quiz**:
   - Click **"Generate Quiz"** in the sidebar.
   - Choose Subject (e.g. *Physics*), Unit (e.g. *Electrostatics*), Difficulty (*Medium*), and Count (*5*).
   - Click **"Generate Quiz & Begin Revision"**.
   - Notice the badge:
     - If `GEMINI_API_KEY` is configured: labeled **AI Generated** with real-time generated questions.
     - If `GEMINI_API_KEY` is not set or rate-limited: labeled **Verified Question Bank** with full explanation keys.
4. **Attempt the Quiz**:
   - Answer the multiple-choice questions one by one.
   - Use the **Question Navigation Palette** and the **Next/Previous** buttons.
   - Mark questions for review and monitor the timer.
5. **Submit Quiz**:
   - Click **"Submit Quiz"** & confirm in the modal &rarr; Evaluates server-side &rarr; Navigates to `/results/:attemptId`.
6. **Detailed Results & Explanations**:
   - View total score, accuracy %, topic breakdown, and comprehensive explanations for every question.
7. **Weak Topics & Adaptive Engine**:
   - Navigate to **"Weak Topics"** to inspect detected concept areas and launch a targeted revision quiz.
8. **Leaderboard & Daily Streak**:
   - View updated points and rank on **"Leaderboard"**, and active flame streak in the header.
9. **Export CSV**:
   - Click **"Export Results CSV"** to download an Excel-ready CSV of your attempts.
10. **Sign Out & Sign In**:
    - Sign out and test re-authenticating.

---

## 🔒 Security & Data Integrity Highlights

- **Server-Side Evaluation**: The client never receives correct answers prior to submission.
- **Points Anti-Exploit**: Duplicate quiz submissions do not award duplicate points on the leaderboard.
- **Privacy Standard**: Leaderboard queries project only public fields (`displayName`, `points`, `quizzesCompleted`, `accuracy`), never exposing emails or password hashes.
- **Secure Password Hashing**: Passwords stored as Bcrypt hashes (salt rounds: 10).
- **Protected Endpoints**: All private routes enforce Bearer JWT authentication.

---

## 📄 License
ISC License. Built for students preparing for high-stakes Board Examinations.
=======
QuizPilot – Smart Revision Assistant

About

QuizPilot is an AI-powered revision platform designed to help students prepare for exams. It generates quizzes, tracks performance, identifies weak topics, and helps students improve through personalized practice.

Features

- AI-based quiz generation
- Smart weakness detection
- Adaptive difficulty levels
- Daily revision planner
- Performance reports and progress tracking

Tech Stack

- React.js, Vite
- Node.js, Express.js
- MongoDB Atlas
- JWT Authentication
- Google Gemini API

Getting Started

1. Clone the repository.
2. Install dependencies in the frontend and backend folders.
3. Configure the required environment variables.
4. Start the frontend and backend servers.

Goal

To make exam preparation more focused, personalized, and effective.
>>>>>>> 3088c95109e6d886bfea2948e1f2cc3173189cb1
