# Serenity Wellness Companion — Complete Project Handout & System Reference

> **Official Project Handout, Architecture Specification, and Outstanding Technical Ledger**  
> *Application Name:* Serenity Wellness Companion  
> *Platform Target:* Full-Stack Responsive Web Application (Offline-First SPA + Express Backend Proxy)

---

## 1. Executive Summary & Core Philosophy

**Serenity Wellness Companion** is an offline-first, full-stack therapeutic self-care application. Designed with a warm, tactile "Warm Hearth & Organic Parchment" aesthetic, the system provides emotional grounding, rhythmic somatic breathwork, reflective journaling, and a private medication adherence registry.

### Guiding Principles
- **Sealed & Private**: All personal, mental health, and medication entries exist strictly within the client's sandboxed local storage (`localStorage`). No server database receives, indexes, or logs user reflections or prescriptions.
- **Somatic & Tactile Aesthetics**: Eliminates sterile, generic "AI Slop" patterns. Utilizes washi-tape tabs, warm paper grain textures, tactile wax-seal emblems, and soothing earthy palettes (`#F4ECDD`, `#2C2018`, `#C67C58`, `#94A47A`).
- **Conversational Safety**: Incorporates proactive safety heuristics. Any crisis language immediately presents direct access to verified clinical crisis lines and supportive guidance.

---

## 2. System Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Therapeutic Chat    │  │ Breathing Engine │  │ Self-Care Ledger │  │
│  │ (Serenity + Local TTS)│  │ (Web Audio Synth)│  │ (7-Day Calendar) │  │
│  └───────────┬───────────┘  └──────────────────┘  └─────────┬────────┘  │
│              │                                              │           │
│              │ POST /api/chat                               │ Local I/O │
│              ▼                                              ▼           │
│  ┌───────────────────────┐                        ┌──────────────────┐  │
│  │ Express Proxy Server  │                        │   localStorage   │  │
│  │  (Port 3000 / tsx)    │                        │  (Sealed Ledger) │  │
│  └───────────┬───────────┘                        └──────────────────┘  │
└──────────────┼──────────────────────────────────────────────────────────┘
               │ Secure Server-to-Server
               ▼
┌─────────────────────────────────────────┐
│       Google Gemini 3.5 Flash API       │
│      (@google/genai TypeScript SDK)     │
└─────────────────────────────────────────┘
```

### Core Technologies
- **Frontend Framework**: React 18+ with TypeScript & Vite
- **Styling**: Tailwind CSS with custom earthy theme palettes
- **Animation Engine**: `motion/react` (Framer Motion) for fluid layout transitions and spring physics
- **Iconography**: `lucide-react`
- **Audio Synthesis**: Native Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `GainNode`) for ambient drones and rhythmic breathing tones
- **Speech Engine**: Web Speech API (`SpeechSynthesisUtterance`) with local voice selection and paced prosody
- **Backend API**: Express.js running on Node.js (Port 3000), bundling to CommonJS (`dist/server.cjs`) via `esbuild`
- **AI Intelligence**: `@google/genai` SDK interfacing with `gemini-3.5-flash`

---

## 3. Project Directory Map

```
/
├── .env.example                # Required environment variable specifications
├── metadata.json               # Platform capabilities & permissions declaration
├── package.json                # Dependencies, dev/build scripts
├── server.ts                   # Express server & Gemini API proxy route
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite bundler & Tailwind configuration
├── HANDOUT.md                  # Comprehensive project handout & unsolved issues
└── src/
    ├── main.tsx                # React DOM entrypoint
    ├── App.tsx                 # Root layout, navigation tabs, milestone evaluator
    ├── index.css               # Tailwind CSS entry imports & custom scrollbars
    ├── types.ts                # Shared TypeScript models and interfaces
    ├── ReflectionJournal.tsx   # Washi-tape journal screen & mood logger
    ├── components/
    │   ├── AmbientBackground.tsx    # Sanctuary color gradients & ambient particle layer
    │   ├── BreathingEngine.tsx      # Interactive 4-phase somatic breath visualizer
    │   ├── CompanionCharacter.tsx   # Animated character avatar with reactive expressions
    │   ├── SoundscapeEngine.ts      # Web Audio synthesizer for ambient soundscapes
    │   └── Sticker.tsx              # Tactile cozy reward stickers
    └── screens/
        ├── ActivitiesScreen.tsx     # Somatic activities, audio drones, grounding tools
        ├── CareScreen.tsx           # Medication ledger, 7-day tracker & safety seal
        └── ProgressScreen.tsx       # Wellness stats, streaks, sticker album & milestones
```

---

## 4. Key Data Models (`src/types.ts`)

### `Message`
```typescript
export interface Message {
  id: string;
  role: 'user' | 'serenity';
  text: string;
  timestamp: string;
}
```

### `Medication` & `DoseLog`
```typescript
export interface Medication {
  id: string;
  name: string;
  dose: string;
  timesOfDay: string[]; // e.g. ["08:00", "20:00"] or ["As-Needed"]
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  notes?: string;
  startDate: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  timeOfDay: string;
  takenAt: string; // ISO string
  date: string;    // YYYY-MM-DD
}
```

### `JournalEntry`
```typescript
export interface JournalEntry {
  id: string;
  text: string;
  mood: 'peaceful' | 'anxious' | 'sad' | 'tired' | 'restless' | 'neutral';
  date: string;
}
```

### `Sanctuary`
```typescript
export type SanctuaryId = 'misty-forest' | 'warm-hearth' | 'deep-ocean' | 'cozy-dusk';

export interface Sanctuary {
  id: SanctuaryId;
  name: string;
  colors: {
    bg: string;
    card: string;
    text: string;
    accent: string;
    glow: string;
  };
  audioDroneFreq: number; // Fundamental frequency in Hz
}
```

---

## 5. Functional Deep Dives

### 1. Empathetic Companion & Crisis Safety Protocol
- **AI Persona**: Serenity acts as an attuned, non-judgmental wellness guide that emphasizes grounding, somatic presence, and gentle validation.
- **Safety Interceptor**: Incoming user prompts are scanned for high-risk indicators (self-harm, crisis keywords). When triggered, the system offers immediate crisis lifeline contacts (988 Suicide & Crisis Lifeline, Crisis Text Line) without passing judgment.
- **Voice Prosody**: Speech synthesis uses localized female and neutral voice packages at $0.90\times$ speed with custom pitch tuning for a soothing presence.

### 2. Somatic Breathwork & Audio Engine
- **Breathing Ratios**: Offers Box Breathing ($4\text{s}-4\text{s}-4\text{s}-4\text{s}$), 4-7-8 Relaxation ($4\text{s}-7\text{s}-8\text{s}$), and Centering ($4\text{s}-2\text{s}-4\text{s}-2\text{s}$).
- **Web Audio Generation**: Synthesizes warm harmonic drones, binaural beat overlays, and gentle acoustic chimes directly on the client's audio thread without loading heavy static media files.

### 3. Sealed Medication & Self-Care Ledger
- **7-Day Compliance Grid**: Dynamically inspects logged dose timestamps against registered schedules to generate compliance states (Complete, Partial, Missed, PRN).
- **Dynamic Countdown Timers**: Automatically calculates time remaining until the next scheduled dose (`Due in 45m`, `Due in 2h 15m`, `As needed`).
- **PRN Support**: Allows flexible, as-needed remedies (e.g. herbal infusions, rescue inhalers, soothing teas) without penalizing daily compliance scores.

### 4. Milestone & Sticker Journaling
- **Mood Matrix**: Tracks emotional state across time with color-coded day stamps.
- **Cozy Sticker Rewards**: Unlocks collectable hand-drawn style stickers (`leaf`, `candle`, `tea`, `moon`, `sun`, `feather`) based on streaks, journaling frequency, and breathwork sessions.

---

## 6. Unsolved Issues & Technical Limitations Ledger

| ID | Issue / Limitation | Domain | Severity | Description & Root Cause | Recommended Resolution Path |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **01** | **Background Alarm & Push Limitations** | PWA / Care | **High** | When browser tabs are closed or suspended by mobile OS battery savers, local `setTimeout` timers cannot fire audio reminders. | Implement a Service Worker with `PushManager` and Web Push notifications backed by a notification worker. |
| **02** | **Speech Synthesis Voice Inconsistency** | Audio / TTS | **Medium** | The Web Speech API depends on OS-installed voice packages. Linux/older Android devices fall back to mechanical, unnatural synthesis. | Integrate a server-side neural TTS streaming endpoint (e.g. Google Cloud TTS / ElevenLabs) for guaranteed voice consistency. |
| **03** | **Local Cache Eviction Risk** | Persistence | **High** | If a user clears browser cookies/storage or uses private browsing, all journal records and medication logs are permanently lost. | Implement an optional zero-knowledge client-side encrypted cloud sync (e.g., Firestore with AES-GCM user-passphrase encryption). |
| **04** | **Stateless Chat Memory across Sessions** | AI Engine | **Medium** | The `/api/chat` endpoint is stateless. Refreshing the browser resets Serenity's conversational memory of past sessions. | Cache previous message summaries in encrypted local storage and feed rolling context windows to the system prompt. |
| **05** | **Audio Glitching on Main Thread Load** | Somatic Audio | **Low** | Heavy DOM animations and React rerenders can occasionally cause minor audio pop/jitter on low-powered mobile processors. | Migrate pure Web Audio synthesis nodes to an isolated background `AudioWorkletProcessor` thread. |
| **06** | **Absence of Real-time Biometric Feedback** | Wellness Tech | **Low** | Breathing pacing is currently static and cannot adapt to user hyperventilation or elevated heart rates. | Implement camera-based photoplethysmography (PPG) or Web Bluetooth Heart Rate (BLE) monitor pairing. |

---

## 7. Developer Setup & Deployment Guide

### Local Development
```bash
# Install dependencies
npm install

# Start Express & Vite full-stack server
npm run dev
```

### Production Build & Launch
```bash
# Build static client assets and bundle Express backend
npm run build

# Start production CommonJS server
npm start
```

### Environment Declarations (`.env`)
```env
# Google Gemini API key used server-side
GEMINI_API_KEY=your_gemini_api_key_here
```
