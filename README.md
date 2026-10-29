Serenity Wellness Companion
Serenity Wellness Companion is an offline-first, full-stack wellness web application designed to support emotional grounding, guided breathing, reflective journaling, and personal medication-adherence tracking through a calm, tactile interface.
Features
AI Wellness Companion
- Conversational wellness support powered by the Google Gemini API.
- An empathetic, non-judgmental companion persona focused on grounding and emotional support.
- Browser-based speech synthesis for spoken responses.
- A safety interceptor that checks for configured high-risk language and presents crisis-support information.
Guided Breathing and Grounding
- Interactive four-phase breathing visualizer.
- Box Breathing: inhale, hold, exhale, and hold for four seconds each.
- 4-7-8 Relaxation: inhale for four seconds, hold for seven seconds, and exhale for eight seconds.
- Centering breathing pattern using a 4-2-4-2 second rhythm.
Ambient Soundscapes
- Browser-generated ambient tones, harmonic drones, breathing cues, and gentle chimes.
- Uses the native Web Audio API to synthesize sound without relying on large pre-recorded audio files.
Reflective Journal and Mood Tracking
- Write and maintain personal journal entries.
- Track moods including peaceful, anxious, sad, tired, restless, and neutral.
- View mood information across time through color-coded day stamps.
Medication and Self-Care Ledger
- Register medication details, dose information, schedules, and start dates.
- Track scheduled and logged doses using a seven-day overview.
- Display completion states such as Complete, Partial, Missed, and PRN (as needed).
- Show countdowns until the next scheduled dose.
- Support as-needed entries without penalizing daily compliance scores.
Progress and Milestones
- View wellness activity indicators, streaks, and milestones.
- Unlock collectible stickers based on configured journaling, breathing, and streak activities.
- Includes sticker themes such as leaf, candle, tea, moon, sun, and feather.
Responsive Interface
- React-based single-page application designed for responsive use.
- Warm, paper-inspired visuals with washi-tape-style tabs, organic textures, soft gradients, and earthy colors.
Technology Stack
Technology	Purpose
React 18+	User interface
TypeScript	Type-safe application code
Vite	Frontend development and build tooling
Tailwind CSS	Styling and custom theme
motion/react	UI animation and transitions
lucide-react	Icons
Web Audio API	Ambient audio synthesis
Web Speech API	Browser speech synthesis
Node.js	Backend runtime
Express.js	Backend server and API proxy
@google/genai	Google Gemini API integration
gemini-3.5-flash	Model identifier specified by the project
tsx	TypeScript development execution
esbuild	Backend bundling


System Architecture
┌────────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER                       │
│                                                            │
│  ┌─────────────────────┐   ┌────────────────────────────┐  │
│  │ AI Wellness Chat    │   │ Breathing and Soundscape   │  │
│  │ Serenity + Speech   │   │ Engines (Web Audio API)    │  │
│  └──────────┬──────────┘   └────────────────────────────┘  │
│             │                                              │
│             │ POST /api/chat                               │
│             ▼                                              │
│  ┌─────────────────────┐   ┌────────────────────────────┐  │
│  │ Express API Proxy   │   │ Browser localStorage       │  │
│  │                     │   │ Journal, mood, medication, │  │
│  │                     │   │ and dose-log records       │  │
│  └──────────┬──────────┘   └────────────────────────────┘  │
└─────────────┼──────────────────────────────────────────────┘
              │ Server-to-server API request
              ▼
┌────────────────────────────────────────────────────────────┐
│                    Google Gemini API                       │
│                 Accessed via @google/genai                 │
└────────────────────────────────────────────────────────────┘
Data Flow
1. The user interacts with the application in the browser.
2. AI chat requests are sent to the Express backend through /api/chat.
3. The backend uses the Google GenAI SDK and a server-side API key to contact the Gemini API.
4. The response is returned to the browser and displayed in the chat.
5. Speech synthesis, breathing visuals, and generated soundscapes use browser capabilities.
6. Journal entries, mood records, medication details, and dose logs are stored in browser localStorage.
Privacy and Safety
- Journal entries, mood records, medication details, and dose logs are stored in browser localStorage rather than a server database.
- localStorage is not encrypted by default. Anyone with access to the browser profile may be able to access stored records.
- Clearing browser storage or using private browsing may result in permanent loss of locally stored information.
- AI chat requests are sent to the backend and then to the external Gemini API. Chat content should not be assumed to have the same privacy properties as locally stored records.
- The safety interceptor uses configured keyword-based heuristics. It may miss context or produce false positives and is not a substitute for professional crisis assessment.
- The crisis resources described in the current project specification include the US-based 988 Suicide & Crisis Lifeline and Crisis Text Line. Verify appropriate local resources before deploying in other regions.
Data Models
The following TypeScript interfaces are defined in src/types.ts.
Message
export interface Message {
  id: string;
  role: 'user' | 'serenity';
  text: string;
  timestamp: string;
}
Medication
export interface Medication {
  id: string;
  name: string;
  dose: string;
  timesOfDay: string[];
  daysOfWeek: number[];
  notes?: string;
  startDate: string;
}
timesOfDay may contain scheduled times such as "08:00" and "20:00" or "As-Needed". In daysOfWeek, 0 represents Sunday and 6 represents Saturday.
DoseLog
export interface DoseLog {
  id: string;
  medicationId: string;
  timeOfDay: string;
  takenAt: string;
  date: string;
}
takenAt is an ISO timestamp, and date uses the YYYY-MM-DD format.
JournalEntry
export interface JournalEntry {
  id: string;
  text: string;
  mood: 'peaceful' | 'anxious' | 'sad' | 'tired' | 'restless' | 'neutral';
  date: string;
}
Sanctuary
export type SanctuaryId =
  | 'misty-forest'
  | 'warm-hearth'
  | 'deep-ocean'
  | 'cozy-dusk';

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
  audioDroneFreq: number;
}
Project Structure
/
├── .env.example
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── HANDOUT.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── ReflectionJournal.tsx
    ├── components/
    │   ├── AmbientBackground.tsx
    │   ├── BreathingEngine.tsx
    │   ├── CompanionCharacter.tsx
    │   ├── SoundscapeEngine.ts
    │   └── Sticker.tsx
    └── screens/
        ├── ActivitiesScreen.tsx
        ├── CareScreen.tsx
        └── ProgressScreen.tsx
Getting Started

Prerequisites:-
- Node.js and npm.
- A Google Gemini API key for the AI chat feature.
- A modern browser that supports the Web Audio API and Web Speech API.
1. Clone the Repository
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env file in the project root and add your Gemini API key:
GEMINI_API_KEY=your_gemini_api_key_here
Never commit .env or publish real API keys. Keep the key on the server and do not expose it through client-side environment variables.
4. Run in Development
npm run dev
The project specification describes an Express server on port 3000. Actual development URLs and whether Vite and Express start together depend on the scripts configured in package.json.
5. Build for Production
npm run build
6. Start the Production Server
npm start
The project specification describes a production Express bundle at dist/server.cjs. Confirm the build output and scripts in package.json before deployment.
Known Limitations
Area	Limitation
Background reminders	Browser timers may not run after a tab is closed or suspended by the operating system.
Speech synthesis	Available voices and speech quality vary by operating system and browser.
Local persistence	Clearing browser storage may permanently erase journal and medication records.
Chat memory	The /api/chat endpoint is stateless, so conversational memory does not automatically persist across sessions.
Audio stability	Heavy UI activity may cause audio glitches on lower-powered devices.
Biometric feedback	Breathing guidance does not currently adapt to real-time biometric measurements.


Future Improvements:-
- Investigate service workers and Web Push for more reliable reminders.
- Explore optional client-side encrypted cloud synchronization with carefully designed key management.
- Add privacy-conscious, locally stored conversation summaries for chat continuity.
- Evaluate more consistent speech synthesis options.
- Consider AudioWorkletProcessor for audio processing where beneficial.
- Explore optional biometric integrations with appropriate consent, validation, and device compatibility.
- Improve accessibility through screen-reader support, keyboard navigation, sufficient contrast, and reduced-motion preferences.
- Add automated tests for schedule calculations, dose logging, journal records, safety behavior, and API error handling.
Disclaimer
Serenity Wellness Companion is a self-care and wellness support application. It is not a medical device, diagnostic tool, emergency service, or replacement for qualified medical or mental-health care. AI-generated responses may be inaccurate. Medication decisions should follow guidance from a qualified healthcare professional.

If someone may be in immediate danger, contact local emergency services or a verified crisis-support service in their region.

Contributing:-
Contributions that improve accessibility, reliability, privacy, usability, testing, and documentation are welcome. Do not include private journal entries, medication details, API keys, or other sensitive information in issues or pull requests.
License
No license has been specified. Add a LICENSE file and update this section when a license is selected.
