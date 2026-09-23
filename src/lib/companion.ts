/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message, CompanionResponse, ConsentedMemory } from '../types';

// ---- 1. CRISIS GATE (runs first, before any network call) ------------------
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'no reason to live',
  'self harm',
  'hurt myself',
  'emergency',
  'slashing',
  'overdose',
  'cutting myself',
  'hanging myself',
  'take my life',
  'better off dead',
];

export function isCrisisMessage(input: string): boolean {
  const lower = input.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export const CRISIS_TEXT =
  "I hear how much pain you're carrying right now, and I'm really glad you told me. " +
  "You don't have to carry this alone. Please reach out to someone who can " +
  "stay with you through this — the options in our SOS Support Hub connect you to real, caring people " +
  "any time of day.";

// ---- 2. LOW-MOOD ACTIVITY PILLS (local heuristics) --------------------
const LOW_MOOD_KEYWORDS = [
  'sad',
  'grieving',
  'burnt out',
  'burnout',
  'lonely',
  'exhausted',
  'hopeless',
  'anxious',
  'stress',
  'scared',
  'crying',
  'angry',
  'frustrated',
  'panic',
  'overwhelmed',
  'insomnia',
  'overthinking',
];

export const ACTIVITY_PILLS = [
  'Enter The Null Void',
  '4-4-6-2 Calming Breath',
  'Open Sanctuary Journal',
  '5-4-3-2-1 Grounding Tool',
];

export function suggestActivities(input: string): string[] | undefined {
  const lower = input.toLowerCase();
  return LOW_MOOD_KEYWORDS.some((kw) => lower.includes(kw)) ? ACTIVITY_PILLS : undefined;
}

// ---- 3. MASTER SERENITY SYSTEM PROMPT ----------------------------------------
export const SYSTEM_PROMPT = `
You are Serenity, an emotionally intelligent AI companion created to guide users toward inner silence, emotional clarity, and genuine peace.

Core Identity:
- You are not a human therapist or clinician, and you are honest about being an AI.
- You speak like a deeply warm, trustworthy, compassionate friend sitting quietly beside the user.
- Your presence feels calm, curious, empathetic, and grounded.

The 5-Step Active Listening Protocol:
Whenever the user shares emotions or difficulties, ALWAYS prioritize feeling heard before problem-solving:
1. Observe: Note the emotional tone with warmth (e.g. "I can hear how much weight you're carrying right now...").
2. Reflect: Mirror their experience without assuming (e.g. "It sounds like you felt really dismissed...").
3. Validate: Normalize their emotional response (e.g. "Anyone carrying that much would feel completely exhausted.").
4. Explore: Offer a gentle, non-intrusive open question (e.g. "What part of this feels heaviest on your heart right now?").
5. Support: Reaffirm your safe presence (e.g. "I'm right here with you. Take all the space you need.").

Philosophical & Communication Rules:
1. Grounded Warmth: Keep responses naturally concise yet deeply comforting (2 to 5 sentences). Never rush.
2. The Null Void Principle: In moments of intense overthinking or mental chatter, gently remind the user of the Null Void—a peaceful inner sanctuary where thoughts pass like clouds and identity temporarily rests in pure awareness.
3. No Jargon & No Emojis: Avoid clinical terms ("symptoms", "diagnosis", "cognitive distortions") and avoid emojis to maintain a timeless, deeply authentic presence.
4. Boundaries: If the user expresses self-harm or suicidal crisis, provide immediate warmth and pivot to the emergency support resources.
`.trim();

// ---- 4. MAIN GENERATION FUNCTION (async) -----------------------------------
export async function generateResponse(
  userMessage: string,
  history: Message[],
  userName?: string,
  memories?: ConsentedMemory[]
): Promise<CompanionResponse> {
  // 4a. Crisis gate FIRST — short-circuit, no LLM delay needed.
  if (isCrisisMessage(userMessage)) {
    return { text: CRISIS_TEXT, isCrisis: true, suggestions: ['Open SOS Support Hub', '5-4-3-2-1 Grounding'] };
  }

  // 4b. Format memory context if available
  let memoryContext = '';
  if (memories && memories.length > 0) {
    memoryContext = `\n\nConsented Long-Term Memory of User:\n${memories
      .map((m) => `- ${m.key}: ${m.value} (${m.category})`)
      .join('\n')}`;
  }

  // 4c. Build the message array for the model
  const messages = [
    ...history.map((m) => ({
      role: m.role === 'serenity' ? 'model' : 'user',
      text: m.text,
    })),
    { role: 'user', text: userMessage },
  ];

  let systemPrompt = SYSTEM_PROMPT;
  if (userName) {
    systemPrompt += `\n\nThe person's name is ${userName}; use it naturally and warmly when appropriate.`;
  }
  if (memoryContext) {
    systemPrompt += memoryContext;
  }

  // 4d. Call the server proxy (Gemini API key is secure server-side)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    if (!res.ok) {
      throw new Error(`Proxy error: ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.reply,
      isCrisis: false,
      suggestions: suggestActivities(userMessage),
    };
  } catch (err) {
    console.error('Serenity chat error:', err);
    return {
      text:
        "I'm having a gentle pause finding my words right now — give me just a " +
        "moment and try again. I'm right here with you.",
      isCrisis: false,
    };
  }
}
