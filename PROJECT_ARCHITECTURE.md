# Serenity Wellness Companion — Complete System Architecture & AI Specification

> **Target Audience:** AI Models (LLMs), System Architects, and Full-Stack Developers  
> **Purpose:** Comprehensive, single-source-of-truth technical blueprint describing the entire system topology, file inventory, runtime environments, programming languages, database schemas (relational SQL & local persistence), API endpoints, audio synthesis pipeline, and behavioral mechanics.

---

## 1. Executive Summary & Purpose

**Serenity Wellness Companion** is an offline-first, full-stack therapeutic self-care application. It provides:
1. **Empathetic AI Companion Dialogue**: Grounded conversation powered by Gemini 3.5 Flash with clinical safety triggers and fallback responses.
2. **Humanized Voice Synthesis**: Dual-tier speech generation utilizing server-side Gemini Audio (`gemini-3.1-flash-tts-preview`) and client-side Web Speech API.
3. **4-Phase Somatic Breathwork & Guided Meditation**: Inhale-Hold-Exhale-Rest rhythms synchronized with haptics, easing curves, and singing bowl chimes across 6 curated journeys.
4. **Tactile Reflection Journal**: Washi-tape aesthetic notebook with emotional sticker stamps, drawing canvas, voice-to-text dictation, and AI reflections.
5. **Interactive Wellness Activities**: Thought cloud dissolution, digital mandala coloring, Zen stone balancing, Socratic cards, somatic resets, and flow focus timers.
6. **Private Care Ledger**: Medication tracking, 7-day adherence grid, crisis resource directory, and consensual memory vault.

---

## 2. Languages, Runtimes & Technology Stack

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Languages** | **TypeScript** | `~5.8.2` | Core programming language across frontend and backend |
| | **JavaScript (ESM & CJS)**| ES2022+ | Build output and runtime execution |
| | **SQL (PostgreSQL / SQLite)**| Standard ANSI SQL | Relational database schema specification & storage |
| | **HTML5 & CSS3** | Modern W3C | Semantic markup and styling |
| **Runtime Environments** | **Node.js** | `>=20.x` | Server runtime executing Express and `tsx` |
| | **Vite Dev Server** | `6.2.3` | SPA bundling & HMR middleware in development |
| **Frontend Framework** | **React** | `19.0.1` | Client-side reactive UI components and hooks |
| | **React DOM** | `19.0.1` | DOM renderer for React |
| **Styling & Design** | **Tailwind CSS** | `4.1.14` | Utility-first CSS engine via `@tailwindcss/vite` |
| | **Lucide Icons** | `0.546.0` | Comprehensive vector iconography library |
| **Animations & Physics**| **Motion (`motion/react`)**| `12.23.24`| Spring animations, layout shifts, gesture tracking |
| **Server Framework** | **Express** | `4.21.2` | Node.js web server handling API routing & static serving |
| **Build & Bundler** | **esbuild** | `0.25.0` | Compiles `server.ts` to CommonJS `dist/server.cjs` |
| | **tsx** | `4.21.0` | TypeScript execution engine for `npm run dev` |
| **AI SDK** | **@google/genai** | `2.4.0` | Google GenAI SDK for Gemini 3.5 Flash, 3.7 Flash & 3.1 TTS |
| **Audio Processing** | **Web Audio API** | Native Browser | Procedural synthesis for pink noise, waves, hearth, chimes |
| | **Web Speech API** | Native Browser | High-frequency client-side speech fallback |

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT ENVIRONMENT                                   │
│                                (Browser / Mobile Webview)                               │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                 REACT 19 SPA ROOT                                 │  │
│  │                                    (App.tsx)                                      │  │
│  │  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌────────────┐ │  │
│  │  │  Sanctuary Chat   │ │  Breathing / Zen  │ │  Journal / Canvas │ │ Activities │ │  │
│  │  │ (Companion.tsx)   │ │  (Meditation.tsx) │ │  (Journal.tsx)    │ │ (Screen)   │ │  │
│  │  └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘ └──────┬─────┘ │  │
│  │            │                     │                     │                  │       │  │
│  │  ┌─────────┴─────────────────────┴─────────────────────┴──────────────────┴────┐  │  │
│  │  │                       AUDIO & VOCAL SYNTHESIS ENGINE                        │  │  │
│  │  │  • SoundscapeEngine.ts (Web Audio API Oscillators, BiquadFilters, GainNodes)│  │  │
│  │  │  • voiceGuide.ts (Gemini PCM audio decoder + Web Speech API fallback)       │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                          LOCAL STORAGE PERSISTENCE                          │  │  │
│  │  │  • serenity_journal_entries  • serenity_medications    • serenity_memories  │  │  │
│  │  │  • serenity_chat_history     • serenity_milestones     • serenity_profile   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┬────────────────────────────────────────┘  │
└─────────────────────────────────────────────┼───────────────────────────────────────────┘
                                              │ HTTP JSON Requests (CORS / Same-Origin)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           SERVER-SIDE RUNTIME (Node.js / Express)                       │
│                                         (Port 3000)                                     │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Express Router (server.ts)                                                       │  │
│  │  ├── POST /api/chat        --> Gemini 3.5 Flash (Conversational Companion)        │  │
│  │  ├── POST /api/reflect     --> Gemini 3.7 Flash (Journal Analysis & Reflection)   │  │
│  │  └── POST /api/voice-guide --> Gemini 3.1 Flash Audio (Natural Voice Generation)  │  │
│  └──────────────────────────────────────────┬────────────────────────────────────────┘  │
│                                             │                                           │
│  ┌──────────────────────────────────────────┴────────────────────────────────────────┐  │
│  │  Vite Dev Middleware (Dev Mode) / Express Static Asset Server (Production dist/)  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────┬───────────────────────────────────────────┘
                                              │ Secure Outbound HTTPS Requests
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 GOOGLE GEMINI API CLOUD                                 │
│                                                                                         │
│    • gemini-3.5-flash             : Empathetic dialogue generation & crisis parsing     │
│    • gemini-3.7-flash             : Deep philosophical journal reflections              │
│    • gemini-3.1-flash-tts-preview : Studio meditative voice synthesis (Audio PCM)       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete Project Directory Tree & File Inventory

```
/
├── .env.example                      # Environment variables template (GEMINI_API_KEY, APP_URL)
├── .gitignore                        # Git exclusion rules (node_modules, dist, .env)
├── bun.lock                          # Dependency lockfile
├── index.html                        # HTML5 document entrypoint & web fonts
├── metadata.json                     # Applet capabilities, metadata & sandbox permissions
├── package.json                      # NPM configuration, dependencies & build scripts
├── server.ts                         # Backend server: Express routes, Gemini integration & Vite
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite build configuration with Tailwind plugin
├── HANDOUT.md                        # Historical project handout
├── PROJECT_ARCHITECTURE.md           # [THIS FILE] System architectural blueprint
└── src/
    ├── main.tsx                      # Client entrypoint mounting React to DOM #root
    ├── App.tsx                       # Master layout, navigation tabs, global state, modals
    ├── index.css                     # Global Tailwind CSS imports and custom utility styles
    ├── types.ts                      # Core TypeScript type definitions, interfaces & enums
    ├── ReflectionJournal.tsx         # Journaling module with sticker stamps, drawing canvas
    ├── components/
    │   ├── AmbientBackground.tsx     # Animated atmospheric backgrounds with particles
    │   ├── AuthModal.tsx             # Authentication modal (Google, Apple, Email, Guest)
    │   ├── BreathingEngine.tsx       # 4-stage somatic breathwork guide with audio chimes
    │   ├── CompanionCharacter.tsx    # Responsive animated avatar with emotive expressions
    │   ├── DailyAffirmation.tsx      # Daily morning affirmation card with localized date locking & audio
    │   ├── HabitsSection.tsx         # Positive micro-habits manager with custom definition, checklist & 7-day tracker
    │   ├── HabitTrends.tsx           # Recharts-powered habit completion trends, weekly curve & per-habit breakdown
    │   ├── MeditationEngine.tsx      # 6 multi-stage guided meditation sessions
    │   ├── MemoryManagerModal.tsx    # Consented memory manager for AI companion personalization
    │   ├── ProfessionalSupportModal.tsx # Crisis SOS hub, 988 Lifeline, global emergency help
    │   ├── SoundscapeEngine.ts       # Procedural Web Audio API soundscape generator
    │   └── Sticker.tsx               # Tactile SVG milestone badge renderer
    ├── lib/
    │   ├── careDirectory.ts          # Emergency contact databases and crisis guidelines
    │   ├── companion.ts              # Emotional heuristics, crisis detection, fallback prompts
    │   └── voiceGuide.ts             # Audio decoding & client-side speech synthesis engine
    └── screens/
        ├── ActivitiesScreen.tsx      # Hub for 6 mindful activities (Mandala, Pebbles, Focus)
        ├── CareScreen.tsx            # Medication ledger, 7-day adherence tracker & SOS
        └── ProgressScreen.tsx        # Milestone achievements, streak charts, mood analytics
```

---

## 5. Database Architecture & Data Persistence

The application currently employs a **Privacy-First Offline Architecture** using the browser's `localStorage` with JSON serialization. To support future cloud scaling or relational persistence (e.g. Cloud SQL / PostgreSQL / SQLite), the comprehensive relational schema below is designed and ready for implementation.

### 5.1 Relational SQL Database Schema (PostgreSQL / ANSI SQL DDL)

```sql
-- ============================================================================
-- SERENITY WELLNESS COMPANION — RELATIONAL SQL SCHEMA
-- Target Database: PostgreSQL 14+ / Cloud SQL / SQLite 3
-- ============================================================================

-- 1. USERS & PROFILES TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    auth_provider VARCHAR(32) NOT NULL DEFAULT 'guest', -- 'google', 'apple', 'email', 'guest'
    current_streak INTEGER NOT NULL DEFAULT 1,
    best_streak INTEGER NOT NULL DEFAULT 1,
    last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. CHAT SESSIONS & CONVERSATION HISTORY
CREATE TABLE chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'serenity')),
    text TEXT NOT NULL,
    is_crisis_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

-- 3. REFLECTIVE JOURNAL ENTRIES
CREATE TABLE journal_entries (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(32) NOT NULL CHECK (mood IN ('peaceful', 'anxious', 'sad', 'tired', 'restless', 'neutral', 'grateful', 'hopeful')),
    journal_type VARCHAR(32) NOT NULL DEFAULT 'free' CHECK (journal_type IN ('free', 'voice', 'gratitude', 'dream', 'sketch')),
    gratitude_items JSONB DEFAULT '[]'::jsonb, -- Array of strings
    sketch_data TEXT,                          -- Base64 SVG or canvas drawing data
    ai_reflection TEXT,                        -- Gemini 3.7 Flash philosophical response
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date DESC);

-- 4. CONSENTED USER MEMORIES (GDPR / Privacy Compliant AI Context)
CREATE TABLE consented_memories (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    memory_key VARCHAR(128) NOT NULL,
    memory_value TEXT NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('personal', 'grounding', 'preference', 'milestone', 'exam', 'family')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_memories_user ON consented_memories(user_id);

-- 5. MEDICATIONS & CARE REGISTRY
CREATE TABLE medications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    dose VARCHAR(64) NOT NULL,
    times_of_day JSONB NOT NULL DEFAULT '["08:00"]'::jsonb, -- e.g. ["08:00", "20:00"]
    days_of_week JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]'::jsonb, -- 0=Sun, 6=Sat
    notes TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_medications_user ON medications(user_id);

-- 6. MEDICATION DOSE ADHERENCE LOGS
CREATE TABLE dose_logs (
    id VARCHAR(64) PRIMARY KEY,
    medication_id VARCHAR(64) NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_of_day VARCHAR(32) NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_dose_unique_entry ON dose_logs(medication_id, log_date, time_of_day);

-- 7. MILESTONES & STAMP REWARDS
CREATE TABLE user_milestones (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_key VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    metric VARCHAR(32) NOT NULL,
    threshold INTEGER NOT NULL,
    sticker VARCHAR(32) NOT NULL,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_user_milestone ON user_milestones(user_id, milestone_key);

-- 8. COMPLETED MINDFULNESS & ACTIVITY SESSIONS
CREATE TABLE activity_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(64) NOT NULL, -- 'breathing', 'meditation', 'cloud_release', 'mandala', 'pebble_stack', 'focus_timer'
    duration_seconds INTEGER NOT NULL,
    meta_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_sessions_user ON activity_sessions(user_id, created_at DESC);
```

### 5.2 Client-Side Storage Schema (Current Active Implementation)

The browser saves state to `localStorage` under isolated key names:

| Storage Key | Schema Description |
| :--- | :--- |
| `serenity_chat_history` | `Message[]` (`id`, `role`, `text`, `timestamp`) |
| `serenity_journal_entries` | `JournalEntry[]` (`id`, `title`, `text`, `mood`, `date`, `type`, `gratitudeItems`, `sketchData`, `aiReflection`) |
| `serenity_medications` | `Medication[]` (`id`, `name`, `dose`, `timesOfDay`, `daysOfWeek`, `notes`, `startDate`) |
| `serenity_dose_logs` | `DoseLog[]` (`id`, `medicationId`, `timeOfDay`, `takenAt`, `date`) |
| `serenity_habits` | `Habit[]` (`id`, `title`, `category`, `icon`, `createdAt`) |
| `serenity_habit_logs` | `HabitLog[]` (`habitId`, `date`, `completedAt`) |
| `serenity_consented_memories` | `ConsentedMemory[]` (`id`, `key`, `value`, `category`, `addedAt`) |
| `serenity_user_profile` | `UserProfile` (`name`, `email`, `avatarUrl`, `provider`, `lastSyncAt`) |
| `serenity_daily_affirmation` | `StoredDailyAffirmation` (`date: YYYY-MM-DD`, `affirmation: DailyAffirmation`, `favorited: boolean`) |
| `serenity_saved_affirmations` | `DailyAffirmation[]` (user's saved favorite affirmations) |
| `serenity_unlocked_milestones` | Array of milestone IDs that the user has satisfied |
| `serenity_current_streak` | Integer day counter with calendar-day rollover checks |

---

## 6. Server API Specifications (`server.ts`)

The backend is an Express service listening on port `3000` with the following endpoints:

### 6.1 `POST /api/chat`
Proxies user conversation turns to Gemini 3.5 Flash with clinical companion system instructions.
- **Request Body:**
  ```json
  {
    "messages": [
      { "role": "user", "text": "I feel overwhelmed with work today." }
    ],
    "systemPrompt": "You are Serenity, an empathetic, soothing wellness companion..."
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Take a gentle pause. It makes complete sense that you feel overwhelmed..."
  }
  ```
- **Fallback Behavior:** If `GEMINI_API_KEY` is absent or the request times out, returns an empathetic local fallback without crashing.

### 6.2 `POST /api/reflect`
Analyzes a private journal entry to provide a comforting 2–3 sentence philosophical reflection.
- **Model Used:** `gemini-3.7-flash` (temperature: 0.7, maxOutputTokens: 250)
- **Request Body:**
  ```json
  {
    "journalText": "Today I took a walk in the rain and realized I need more rest.",
    "mood": "peaceful"
  }
  ```
- **Response:**
  ```json
  {
    "reflection": "The rain has a way of washing away excess noise, leaving room for what matters..."
  }
  ```

### 6.3 `POST /api/voice-guide`
Generates high-definition, whisper-like meditative audio via Gemini's TTS preview model.
- **Model Used:** `gemini-3.1-flash-tts-preview`
- **Voice Configurations:** `Kore` (default calm female tone), `Puck`, `Charon`, `Fenrir`, `Zephyr`
- **Request Body:**
  ```json
  {
    "text": "Breathe in deeply through your nose, letting your belly expand.",
    "voice": "Kore"
  }
  ```
- **Response:**
  ```json
  {
    "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
    "rate": 24000
  }
  ```
- **Fallback Flag:** If audio generation is unavailable, returns `{ "audio": null, "fallback": true }`, signaling the client to utilize the native Web Speech API.

---

## 7. Core Frontend Modules & User Interaction Flow

### 7.1 Primary Screen Hierarchy (`src/App.tsx`)
The application features 6 core tabs controlled via an ergonomic bottom tab bar:
1. **Sanctuary (`chat`)**: Conversational interface with Serenity avatar, emotion badge, message history, crisis detection triggers, and audio readout controls.
2. **Breathe & Meditate (`breathe`)**:
   - *Breathing Engine*: 4-phase somatic breath visualizer (Box breathing 4-4-4-4, Relaxing 4-7-8, Resonant 5-5-5-5, Awakening 4-2-4-2) with singing bowl chimes and haptics.
   - *Meditation Engine*: 6 journeys (*Peace in the Null Void*, *Healing Self-Love*, *Letting Go of Control*, *Gratitude & Heart Opening*, *Deep Focus*, *Drift to Sleep*).
3. **Journal (`journal`)**: Daily mood logger, multi-mode editor (Freeform, Voice Dictation, Gratitude Prompts, Dream Journal, Drawing Canvas), sticker stamp decorations, and AI reflection generator.
4. **Activities (`activities`)**: Mindful interaction tools:
   - *Thought Cloud Release*: Interactive worry typing and particle dissolution.
   - *Digital Mandala*: Geometric petal coloring with watercolor palettes.
   - *Zen Pebble Stacking*: Physics-based stone balancing with resonant acoustic pings.
   - *Socratic Prompt Cards*: Contemplative question deck.
   - *5-Minute Somatic Reset*: Guided physical tension release.
   - *Flow Focus Timer*: 25-minute Pomodoro cycle with 1-minute guided mindful pauses.
5. **Care Ledger (`care`)**: Medication schedule, 7-day adherence grid, SOS emergency buttons, trusted personal contacts.
6. **Progress (`progress`)**: Streak tracking, mood distribution charts, milestone rewards, and interactive sticker album.

---

## 8. Audio & Vocal Synthesis Architecture

```
                                  VOICE GENERATION PIPELINE
                                  
                                        User triggers
                                        Voice Guide
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │    voiceGuide.speakGuidance   │
                             └───────────────┬───────────────┘
                                             │
                       Is Gemini API Key & Network Available?
                                       /           \
                                 (YES)/             \(NO / Fallback)
                                     ▼               ▼
                        ┌──────────────────┐   ┌──────────────────────┐
                        │ POST             │   │ Web Speech API       │
                        │ /api/voice-guide │   │ (SpeechSynthesis)    │
                        └────────┬─────────┘   └──────────┬───────────┘
                                 │                        │
                          Base64 PCM audio                │ Native browser voice
                                 │                        │ with 0.82 pitch &
                                 ▼                        │ 0.88 speed pacing
                        ┌──────────────────┐              │
                        │ Web Audio API    │              │
                        │ AudioContext     │              │
                        │ Base64 -> Float32│              │
                        └────────┬─────────┘              │
                                 │                        │
                                 ▼                        ▼
                        ┌─────────────────────────────────────┐
                        │      Soothing Vocal Playback        │
                        └─────────────────────────────────────┘
```

### 8.1 Procedural Soundscape Engine (`src/components/SoundscapeEngine.ts`)
The soundscape synthesizer generates pure mathematical audio in real time using the browser's native `AudioContext`, requiring zero external MP3 assets:
- **Null Void**: 108Hz carrier + 114Hz binaural theta wave difference (6Hz theta relaxation beat).
- **Ocean Waves**: White noise passed through an automated LFO-modulated low-pass `BiquadFilterNode` simulating rhythmic shore breaks.
- **Rain Sanctuary**: Pink noise with high-pass filtration and micro-transient gain spikes simulating raindrops on leaves.
- **Hearth Fire**: Low-frequency rumble combined with randomized crackle impulses.
- **Forest Presence**: High-frequency acoustic wind resonance and gentle periodic rustle modulation.

---

## 9. Safety, Ethics, & Crisis Protocols

Serenity is an empathetic wellness guide, **not a clinical medical diagnostic tool**.
1. **Safety Trigger Words**: Monitored via regex patterns in `src/lib/companion.ts` (e.g. self-harm, suicide, severe depression, unmanageable crisis).
2. **Immediate Intervention**: Upon trigger detection:
   - Sets `isCrisis = true`.
   - Halts normal AI conversational responses.
   - Dispatches a warm, grounding message with explicit crisis support options.
   - Offers one-click connection to the **SOS Support Hub** (`ProfessionalSupportModal.tsx`) containing:
     - **988 Suicide & Crisis Lifeline** (Call/Text 988 in the US/Canada).
     - **The Trevor Project** (LGBTQ+ Crisis Support: 1-866-488-7386).
     - **Crisis Text Line** (Text HOME to 741741).
     - **International Befrienders Worldwide / IASP Directory**.

---

## 10. Development, Build, & Deployment Commands

```bash
# 1. Install project dependencies
npm install

# 2. Run local development server (Express + Vite on http://0.0.0.0:3000)
npm run dev

# 3. Perform type-checking and linting
npm run lint

# 4. Production build: Compiles Vite frontend & bundles server.ts via esbuild
npm run build

# 5. Launch production server
npm start
```

### Environment Configuration (`.env`)
```env
# Required for AI companion chat, journal reflection, and HD voice synthesis
GEMINI_API_KEY="your-gemini-api-key-here"

# Set automatically by hosting platform
APP_URL="http://localhost:3000"
```

---

## 11. AI Model Ingestion Quick Reference

When interpreting this codebase:
- **Root Component**: All client layout begins in `/src/App.tsx`.
- **Backend Endpoints**: All server APIs are defined in `/server.ts`.
- **Data Models**: All TypeScript interfaces reside in `/src/types.ts`.
- **Sound Generator**: Real-time Web Audio API logic is in `/src/components/SoundscapeEngine.ts`.
- **Voice Logic**: Multi-tier speech and audio decoding is in `/src/lib/voiceGuide.ts`.
- **Crisis Heuristics**: Crisis keyword matching and safety prompts reside in `/src/lib/companion.ts` and `/src/lib/careDirectory.ts`.
- **Storage Strategy**: LocalStorage is used for privacy-sealed offline resilience, with the relational SQL schema defined in Section 5 ready for Cloud SQL or PostgreSQL database migrations.
