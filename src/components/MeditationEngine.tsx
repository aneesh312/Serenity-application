/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MeditationCategory,
  MeditationSession,
} from '../types';
import globalSoundscape from './SoundscapeEngine';
import globalVoiceGuide from '../lib/voiceGuide';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

export const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: 'peace-null-void',
    title: 'The Null Void Journey',
    categoryName: 'Peace & Transcendence',
    destinationName: 'The Null Void',
    subtitle: 'Dissolve mental clutter and enter infinite stillness',
    recommendedFor: 'Overthinking, anxiety & mental exhaustion',
    soundscape: 'null-void',
    soundFrequencyHz: 108,
    colorPalette: {
      primary: '#818cf8', // Soft Lavender
      accent: '#9d8df1',
      bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
      cardBg: 'bg-slate-900/90 text-slate-100',
    },
    breathingPattern: {
      name: 'Calm Vagal Pacing',
      inhale: 4,
      holdIn: 4,
      exhale: 6,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Mental Noise & Arrival',
        guidanceText:
          'Take a slow breath in... there is nowhere else you need to be. Observe the chatter in your mind without judging it.',
        durationSeconds: 35,
        affirmation: 'I see my thoughts, but I am the quiet observer behind them.',
      },
      {
        id: 'stage-2',
        title: '2. Acceptance & Clouds',
        guidanceText:
          "Do not chase your thoughts. Watch them drift like soft clouds across an open twilight sky. Let each cloud pass gently.",
        durationSeconds: 40,
        affirmation: 'I release all pressure to control or solve anything right now.',
      },
      {
        id: 'stage-3',
        title: '3. Breath Awareness',
        guidanceText:
          'Feel the cool air filling your lungs, and the warm release softening your neck, shoulders, and chest on the exhale.',
        durationSeconds: 45,
        breathingPacing: { inhale: 4, holdIn: 4, exhale: 6, holdOut: 2 },
        affirmation: 'My breath is the anchor returning me to this peaceful present.',
      },
      {
        id: 'stage-4',
        title: '4. The Null Void',
        guidanceText:
          'Step into the Null Void. Here, expectations, deadlines, fear, and labels temporarily lose all their weight. Only one soul remains: your own.',
        durationSeconds: 60,
        affirmation: 'In the stillness of the Null Void, I am boundless, weightless, and free.',
      },
      {
        id: 'stage-5',
        title: '5. Return & Peaceful Freedom',
        guidanceText:
          'Rest in this calm spaciousness. As you open your eyes, remember that this unshakable quiet center is always inside you.',
        durationSeconds: 30,
        affirmation: 'I return to life with a quiet mind and a light heart.',
      },
    ],
  },
  {
    id: 'self-love-healing',
    title: 'Self-Compassion & Healing',
    categoryName: 'Self Love',
    destinationName: 'The Gentle Sanctuary',
    subtitle: 'Learn kindness toward yourself without guilt or judgment',
    recommendedFor: 'Self-criticism, shame & emotional fatigue',
    soundscape: 'forest-presence',
    soundFrequencyHz: 110,
    colorPalette: {
      primary: '#94A47A', // Sage Green
      accent: '#818cf8',
      bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
      cardBg: 'bg-white/95 text-[#2C2018]',
    },
    breathingPattern: {
      name: 'Heart Healing Rhythm',
      inhale: 4,
      holdIn: 2,
      exhale: 6,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Welcoming the Self',
        guidanceText:
          'Place one hand gently over your heart. Feel the warmth of your palm. You have carried yourself through every difficult day.',
        durationSeconds: 35,
        affirmation: 'I welcome myself here exactly as I am, with all my human feelings.',
      },
      {
        id: 'stage-2',
        title: '2. Softening the Inner Critic',
        guidanceText:
          'Notice any harsh self-judgment or unrealistic standards you carried today. Soften your jaw, and let that heavy armor rest on the floor.',
        durationSeconds: 40,
        affirmation: 'I do not need to earn my right to rest. I am inherently worthy.',
      },
      {
        id: 'stage-3',
        title: '3. Healing Affirmation',
        guidanceText:
          'Breathe kindness directly into the center of your chest. You are doing the best you can with the energy you have.',
        durationSeconds: 45,
        affirmation: 'I forgive myself for what I did not know then.',
      },
      {
        id: 'stage-4',
        title: '4. The Warm Golden Light',
        guidanceText:
          'Visualize a gentle warm light radiating from your chest, wrapping around your body with unconditional acceptance.',
        durationSeconds: 45,
        affirmation: 'I am safe in my own heart. I am my own comforting friend.',
      },
    ],
  },
  {
    id: 'letting-go',
    title: 'Letting Go & Emotional Release',
    categoryName: 'Emotional Release',
    destinationName: 'The Flowing River',
    subtitle: 'Release heartbreak, regret, anger, and heavy attachment',
    recommendedFor: 'Heartbreak, resentment & holding on',
    soundscape: 'ocean-serenity',
    soundFrequencyHz: 136.1,
    colorPalette: {
      primary: '#7EA0B7', // Mist Blue
      accent: '#818cf8',
      bgGradient: 'from-sky-950 via-slate-900 to-indigo-950',
      cardBg: 'bg-white/95 text-[#2C2018]',
    },
    breathingPattern: {
      name: 'Release Breathing',
      inhale: 4,
      holdIn: 6,
      exhale: 8,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Naming the Heaviness',
        guidanceText:
          'Acknowledge what is weighing you down. An old conversation, a regret, or a lingering fear. Name it quietly in your mind without fighting it.',
        durationSeconds: 35,
        affirmation: 'I acknowledge the hurt without being defined by it.',
      },
      {
        id: 'stage-2',
        title: '2. The River of Stones',
        guidanceText:
          'Imagine holding that heavy stone in your palm beside a calm, clear flowing river. Feel how much energy it took to carry it.',
        durationSeconds: 40,
        affirmation: 'Holding onto this hurts me more than letting it go.',
      },
      {
        id: 'stage-3',
        title: '3. The Release',
        guidanceText:
          'Open your hand and let the stone slip into the water. Watch the gentle ripples expand as the current carries it away.',
        durationSeconds: 45,
        affirmation: 'I release what I cannot change. I make room for peace.',
      },
      {
        id: 'stage-4',
        title: '4. Open Hands, Light Heart',
        guidanceText:
          'Feel how light your palms and chest feel now. You do not need to pick the weight back up. Breathe in fresh, untroubled air.',
        durationSeconds: 40,
        affirmation: 'I am free to move forward unburdened.',
      },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude & Savoring Peace',
    categoryName: 'Positive Emotion',
    destinationName: 'The Sunlight Meadow',
    subtitle: 'Cultivate wonder and deep appreciation for ordinary moments',
    recommendedFor: 'Negativity bias, stress & feeling disconnected',
    soundscape: 'hearth-calm',
    soundFrequencyHz: 116.5,
    colorPalette: {
      primary: '#D4A373', // Soft Amber
      accent: '#818cf8',
      bgGradient: 'from-amber-950 via-stone-900 to-amber-900',
      cardBg: 'bg-white/95 text-[#2C2018]',
    },
    breathingPattern: {
      name: 'Sunlight Pacing',
      inhale: 4,
      holdIn: 4,
      exhale: 6,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Savoring the Simple',
        guidanceText:
          'Bring to mind three simple, quiet things that comforted you recently: a warm cup of tea, clean sheets, or the sound of morning rain.',
        durationSeconds: 35,
        affirmation: 'Joy lives quietly in the small details of my day.',
      },
      {
        id: 'stage-2',
        title: '2. Heartwarming Connection',
        guidanceText:
          'Think of someone whose presence or kind word brought ease to your life. Silently send them a wish of peace and wellness.',
        durationSeconds: 40,
        affirmation: 'I am connected to the warmth of others.',
      },
      {
        id: 'stage-3',
        title: '3. Resting in the Present',
        guidanceText:
          'Feel the miracle of breathing right now. Allow a subtle, gentle smile to rest on your lips as you savor this quiet moment.',
        durationSeconds: 40,
        affirmation: 'I am deeply grateful for this breath, this body, and this moment.',
      },
    ],
  },
  {
    id: 'focus-deep-work',
    title: 'Focus & Deep Work Centering',
    categoryName: 'Deep Work',
    destinationName: 'The Clarity Chamber',
    subtitle: 'Quiet distractions, sharpen attention, and enter flow state',
    recommendedFor: 'Study, creative writing & deep focus',
    soundscape: 'null-void',
    soundFrequencyHz: 108,
    colorPalette: {
      primary: '#818cf8',
      accent: '#7EA0B7',
      bgGradient: 'from-indigo-950 via-slate-900 to-slate-950',
      cardBg: 'bg-white/95 text-[#2C2018]',
    },
    breathingPattern: {
      name: '5-2-5 Centering',
      inhale: 5,
      holdIn: 2,
      exhale: 5,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Closing Open Loops',
        guidanceText:
          'Acknowledge any lingering notifications or buzzing thoughts. Imagine placing them gently into an envelope and sealing it for later.',
        durationSeconds: 30,
        affirmation: 'Right now, there is only this single task and this single moment.',
      },
      {
        id: 'stage-2',
        title: '2. Aligning Intention',
        guidanceText:
          'State clearly in your mind: "My intention is to focus with ease, curiosity, and steady clarity."',
        durationSeconds: 35,
        affirmation: 'I work with calm clarity and steady purpose.',
      },
      {
        id: 'stage-3',
        title: '3. Entering Flow',
        guidanceText:
          'Feel the razor-sharp clarity in your mind. You are ready to create and learn with effortless focus.',
        durationSeconds: 30,
        affirmation: 'My attention is focused, calm, and sovereign.',
      },
    ],
  },
  {
    id: 'sleep-drift',
    title: 'Night Mode & Sleep Drift',
    categoryName: 'Sleep Drift',
    destinationName: 'The Cosmic Dreamscape',
    subtitle: 'Slow breathing, dim starry visuals, and calming sleep transition',
    recommendedFor: 'Bedtime anxiety, insomnia & racing mind',
    soundscape: 'deep-sleep',
    soundFrequencyHz: 72.5,
    colorPalette: {
      primary: '#9d8df1',
      accent: '#7EA0B7',
      bgGradient: 'from-slate-950 via-indigo-950 to-slate-950',
      cardBg: 'bg-slate-900/90 text-indigo-100',
    },
    breathingPattern: {
      name: '4-7-8 Somatic Relaxation',
      inhale: 4,
      holdIn: 7,
      exhale: 8,
      holdOut: 2,
    },
    stages: [
      {
        id: 'stage-1',
        title: '1. Closing the Day',
        guidanceText:
          'The day is done. Everything you accomplished was enough, and everything left undone can wait for tomorrow. Your only job now is to rest.',
        durationSeconds: 40,
        affirmation: 'I release all responsibilities of the day. I am safe to sleep.',
      },
      {
        id: 'stage-2',
        title: '2. Somatic Relaxation Scan',
        guidanceText:
          'Unclench your teeth. Drop your shoulders down away from your ears. Let your fingers soften and your legs become heavy like warm sand.',
        durationSeconds: 50,
        affirmation: 'My body is safe, heavy, and ready for deep rest.',
      },
      {
        id: 'stage-3',
        title: '3. Drifting into Stillness',
        guidanceText:
          'Breathe slowly with the quiet night sky. With every exhale, sink deeper into the pillow. Let your thoughts fade into gentle, quiet darkness.',
        durationSeconds: 60,
        affirmation: 'I drift into peaceful, restorative sleep.',
      },
    ],
  },
];

interface MeditationEngineProps {
  onSessionComplete?: (category: MeditationCategory) => void;
  accentColor?: string;
}

export default function MeditationEngine({
  onSessionComplete,
  accentColor = '#818cf8',
}: MeditationEngineProps) {
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemainingInStage, setSecondsRemainingInStage] = useState(0);
  const [voiceNarrationOn, setVoiceNarrationOn] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [liveCaption, setLiveCaption] = useState<string>('');

  const stageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    globalVoiceGuide.setCaptionListener(setLiveCaption);
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      globalVoiceGuide.stop();
    };
  }, []);

  const speakNarrative = (text: string) => {
    if (!voiceNarrationOn) return;
    globalVoiceGuide.speak(text, 'Kore');
  };

  const handleSelectSession = (session: MeditationSession) => {
    setActiveSession(session);
    setCurrentStageIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setSecondsRemainingInStage(session.stages[0].durationSeconds);

    // Crossfade ambient soundscape
    globalSoundscape.start(session.soundscape, 4.0);
  };

  const handleStartSession = () => {
    if (!activeSession) return;
    setIsPlaying(true);
    globalSoundscape.playSingingBowlChime(activeSession.soundFrequencyHz * 2);

    const currentStage = activeSession.stages[currentStageIndex];
    setSecondsRemainingInStage(currentStage.durationSeconds);
    speakNarrative(currentStage.guidanceText);

    runStageTimer(currentStage.durationSeconds);
  };

  const handlePauseSession = () => {
    setIsPlaying(false);
    if (stageTimerRef.current) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
    globalVoiceGuide.stop();
  };

  const runStageTimer = (duration: number) => {
    if (stageTimerRef.current) clearInterval(stageTimerRef.current);

    stageTimerRef.current = setInterval(() => {
      setSecondsRemainingInStage((prev) => {
        if (prev <= 1) {
          clearInterval(stageTimerRef.current!);
          advanceToNextStage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const advanceToNextStage = () => {
    if (!activeSession) return;

    if (currentStageIndex < activeSession.stages.length - 1) {
      const nextIndex = currentStageIndex + 1;
      setCurrentStageIndex(nextIndex);
      globalSoundscape.playSingingBowlChime(activeSession.soundFrequencyHz * 2.5);

      const nextStage = activeSession.stages[nextIndex];
      setSecondsRemainingInStage(nextStage.durationSeconds);
      speakNarrative(nextStage.guidanceText);

      runStageTimer(nextStage.durationSeconds);
    } else {
      // Session Completed
      setIsPlaying(false);
      setIsCompleted(true);
      globalSoundscape.playSingingBowlChime(activeSession.soundFrequencyHz * 1.5);
      onSessionComplete?.(activeSession.id);
      speakNarrative(
        'You have touched the quiet space of the Null Void. Carry this calm sovereign stillness with you into your day.'
      );
    }
  };

  const handleExitSession = () => {
    handlePauseSession();
    setActiveSession(null);
    setCurrentStageIndex(0);
    setIsCompleted(false);
    globalSoundscape.stop(2.0);
  };

  // --- VIEW 1: CATALOG OF QUIET LUXURY SESSIONS ---
  if (!activeSession) {
    return (
      <div className="space-y-6 text-[#2C2018]">
        {/* Header Philosophy Banner */}
        <div className="bg-gradient-to-br from-[#131B2E] via-[#0C1322] to-[#1E1B4B] text-white p-6 sm:p-8 rounded-[32px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A373] font-bold">
                The Null Void Sanctuary
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Multi-Emotional Meditation
            </h2>
            <p className="font-serif italic text-xs sm:text-sm text-slate-300 leading-relaxed">
              "The destination of meditation is the Null Void — not emptiness, but a peaceful space where thoughts dissolve and only pure awareness remains."
            </p>
          </div>
        </div>

        {/* 6 Meditation Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDITATION_SESSIONS.map((session) => {
            return (
              <motion.div
                key={session.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/70 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer"
                onClick={() => handleSelectSession(session)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-xs"
                      style={{ backgroundColor: session.colorPalette.primary }}
                    >
                      {session.categoryName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-serif italic">
                      {session.stages.length} stages
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#2C2018] group-hover:text-indigo-900 transition">
                      {session.title}
                    </h3>
                    <p className="text-xs text-neutral-600 font-serif italic mt-1 leading-relaxed">
                      {session.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 space-y-1 text-[11px] text-neutral-500 font-serif">
                    <p>
                      <strong className="text-neutral-700">Destination:</strong> {session.destinationName}
                    </p>
                    <p>
                      <strong className="text-neutral-700">Recommended for:</strong> {session.recommendedFor}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#818cf8]">
                  <span>Enter Journey</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- VIEW 2: ACTIVE IMMERSIVE MEDITATION PLAYER ---
  const currentStage = activeSession.stages[currentStageIndex];
  const totalStages = activeSession.stages.length;
  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[36px] border border-neutral-200/70 shadow-xl flex flex-col justify-between min-h-[560px] text-[#2C2018] relative overflow-hidden"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4 relative z-10">
        <button
          onClick={handleExitSession}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-serif transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceNarrationOn(!voiceNarrationOn)}
            className={`px-3 py-1.5 rounded-full border text-xs transition flex items-center gap-1.5 shadow-sm ${
              voiceNarrationOn
                ? 'bg-[#818cf8] text-white border-[#818cf8]'
                : 'bg-white text-neutral-400 border-neutral-200'
            }`}
            title="Toggle Voice Guidance"
          >
            {voiceNarrationOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-serif font-medium">{voiceNarrationOn ? 'Human Voice Guide' : 'Silent Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Experience */}
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-6 relative z-10 max-w-xl mx-auto w-full">
        {/* Stage step indicators */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-serif text-neutral-500 px-1">
            <span>
              Stage {currentStageIndex + 1} of {totalStages}
            </span>
            <span className="font-bold text-[#818cf8]">{activeSession.destinationName}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-neutral-200/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: activeSession.colorPalette.primary,
              }}
            />
          </div>
        </div>

        {/* Floating Meditative Core */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none my-2">
          <motion.div
            className="absolute inset-0 rounded-full filter blur-2xl"
            style={{ backgroundColor: activeSession.colorPalette.primary }}
            animate={{
              scale: isPlaying ? [1, 1.3, 1] : 1,
              opacity: isPlaying ? [0.25, 0.45, 0.25] : 0.2,
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-white/80 shadow-2xl flex flex-col items-center justify-center p-6 backdrop-blur-md relative z-10"
            style={{
              background: `radial-gradient(circle, ${activeSession.colorPalette.primary}25 0%, #ffffff 80%)`,
            }}
            animate={{ scale: isPlaying ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-8 h-8 mb-1" style={{ color: activeSession.colorPalette.primary }} />
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-neutral-800">
              {secondsRemainingInStage}s
            </span>
            <span className="text-[10px] font-serif uppercase tracking-wider text-neutral-500 font-bold">
              {currentStage.title.split('. ')[1] || currentStage.title}
            </span>
          </motion.div>
        </div>

        {/* Spoken Guidance Prompt */}
        <div className="min-h-[85px] flex flex-col justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-serif text-sm sm:text-base leading-relaxed text-neutral-800 font-medium italic"
            >
              "{currentStage.guidanceText}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Active Affirmation Badge */}
        {currentStage.affirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-[#FAF7F2] border border-neutral-200/80 rounded-2xl text-xs font-serif text-[#818cf8] font-semibold max-w-md shadow-xs"
          >
            ✨ Affirmation: "{currentStage.affirmation}"
          </motion.div>
        )}

        {/* Completion Screen celebration */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-serif text-center space-y-2 max-w-md shadow-sm"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Journey Transcended</h4>
            <p>You have touched the stillness of the Null Void. Carry this calm sovereign space with you.</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Session Action Controls */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-100 relative z-10">
        {isPlaying ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePauseSession}
            className="flex items-center gap-2 px-8 py-3 bg-[#2C2018] hover:bg-neutral-800 text-white rounded-full text-xs font-serif font-bold shadow-lg transition"
          >
            <Pause className="w-4 h-4 fill-white" /> Pause Journey
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleStartSession}
            className="flex items-center gap-2 px-10 py-3 text-white rounded-full text-xs sm:text-sm font-serif font-bold shadow-lg transition-all"
            style={{ backgroundColor: activeSession.colorPalette.primary }}
          >
            <Play className="w-4 h-4 fill-white" /> {isCompleted ? 'Repeat Journey' : 'Begin Journey'}
          </motion.button>
        )}

        {isPlaying && (
          <button
            onClick={advanceToNextStage}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-serif transition"
          >
            Next Stage →
          </button>
        )}
      </div>
    </motion.div>
  );
}
