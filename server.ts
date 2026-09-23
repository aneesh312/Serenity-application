/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Lazy-loaded Gemini AI Client to prevent startup crash if GEMINI_API_KEY is not defined yet
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for AI Voice Generation (Humanized meditation narrator)
app.post('/api/voice-guide', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({ audio: null, fallback: true });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Speak in a calm, soft, slow, grounded meditation whisper with gentle natural pauses, reassuring warmth, and steady cadence: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, rate: 24000 });
    } else {
      res.json({ audio: null, fallback: true });
    }
  } catch (err: any) {
    console.warn('Voice guide TTS endpoint fallback:', err.message || err);
    res.json({ audio: null, fallback: true });
  }
});

// API endpoint for AI Journal Deep Reflection
app.post('/api/reflect', async (req, res) => {
  try {
    const { journalText, mood } = req.body;
    if (!journalText) {
      res.status(400).json({ error: 'Journal text is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        reflection: "I hear the honesty and heart in what you've written. Honor where you are today with softness and grace.",
      });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are Serenity, an empathetic, non-judgmental wellness companion. A user just wrote this private journal entry (current mood: ${mood || 'unspecified'}):
"${journalText}"

Write a brief, comforting, 2-3 sentence philosophical reflection acknowledging their feelings with genuine warmth, gentle validation, and a grounding perspective. Do not give clinical diagnosis or generic unsolicited advice. Keep it poetic, quiet, and calming.`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });

    const reflection = response.text?.trim() || "Thank you for sharing your thoughts with yourself. Give yourself permission to rest.";
    res.json({ reflection });
  } catch (err: any) {
    console.error('API reflect error:', err);
    res.json({
      reflection: "Every thought you write is a step toward releasing what you no longer need to carry.",
    });
  }
});

// API endpoint for chatbot proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a clean friendly fallback if key is missing, so we never crash
      console.warn('GEMINI_API_KEY is not configured.');
      res.json({
        reply: "I'm here with you in spirit, but my digital voice key is offline right now. I'd love to listen anyway. What's on your mind?",
      });
      return;
    }

    // Call Gemini 3.5 Flash via @google/genai SDK
    const ai = getGeminiClient();

    // Normalize conversation so it starts with user and alternates strictly between user and model
    const normalizedMessages: { role: 'user' | 'model'; text: string }[] = [];
    for (const m of messages) {
      if (!m.role || !m.text) continue;
      const role = m.role === 'model' ? 'model' : 'user';
      if (normalizedMessages.length > 0 && normalizedMessages[normalizedMessages.length - 1].role === role) {
        normalizedMessages[normalizedMessages.length - 1].text += "\n" + m.text;
      } else {
        normalizedMessages.push({ role, text: m.text });
      }
    }

    // Ensure it starts with user (Gemini API requirement)
    while (normalizedMessages.length > 0 && normalizedMessages[0].role !== 'user') {
      normalizedMessages.shift();
    }

    if (normalizedMessages.length === 0) {
      res.json({
        reply: "I'm listening. Please tell me more about what is on your mind.",
      });
      return;
    }

    const contents = normalizedMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
        maxOutputTokens: 800,
      },
    });

    const reply = response.text?.trim() || "I'm here. Please tell me more about how you are feeling.";
    res.json({ reply });

  } catch (error: any) {
    console.error('API Chat route error:', error);
    res.status(500).json({
      error: 'Failed to generate companion response',
      detail: error.message || String(error),
      reply: "I'm here with you. Sometimes finding the words is hard, but I am listening.",
    });
  }
});

// =============================================================================
// TO USE CLAUDE INSTEAD OF GEMINI (Requirement 5 structure):
// In the route above, instead of GoogleGenAI, you would run a fetch block like:
//
//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       "x-api-key": apiKey,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model: "claude-haiku-4-5",
//       max_tokens: 400,
//       temperature: 0.85,
//       system: systemPrompt,
//       messages: messages.map((m) => ({
//         role: m.role === "model" ? "assistant" : "user",
//         content: m.text,
//       })),
//     }),
//   });
//   const data = await claudeRes.json();
//   const reply = data?.content?.[0]?.text?.trim() ?? "…";
// =============================================================================


// Vite Dev Server Middleware or Static production serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite dev middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset serving loaded.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start fullstack server:', err);
});
