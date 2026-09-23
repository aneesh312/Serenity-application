/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Flame,
  Moon,
  Sun,
  Palette,
  CloudRain,
  Wind,
  Layers,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Bookmark,
} from 'lucide-react';
import globalSoundscape from '../components/SoundscapeEngine';
import globalVoiceGuide from '../lib/voiceGuide';

interface ActivitiesScreenProps {
  accentColor?: string;
  onActivityDone?: (activityName: string) => void;
  calmMinutes?: number;
  mindfulStreak?: number;
}

// Reflection Deck
const REFLECTION_CARDS = [
  {
    id: 'rc-1',
    category: 'Grounding',
    question: 'What is one pressure you are holding onto that is not actually your responsibility to solve today?',
    wisdom: 'Let the weight rest on the floor. You only need to breathe right now.',
  },
  {
    id: 'rc-2',
    category: 'Gratitude',
    question: 'Think of one place on Earth where you felt completely safe and quiet. What did the air smell like?',
    wisdom: 'Your memory can be a sanctuary whenever you need shelter.',
  },
  {
    id: 'rc-3',
    category: 'Self-Compassion',
    question: 'If a beloved friend came to you with your exact tired feelings today, what gentle words would you whisper to them?',
    wisdom: 'Give yourself that same soothing grace.',
  },
  {
    id: 'rc-4',
    category: 'Emotional Release',
    question: 'What emotion are you resisting feeling? What happens if you allow it to exist for 60 seconds without running away?',
    wisdom: 'Emotions are only weather passing through the open sky of your soul.',
  },
  {
    id: 'rc-5',
    category: 'Present Awareness',
    question: 'Notice 3 subtle sounds in your current room that you were tuning out until this very second.',
    wisdom: 'Reality is quietly vibrant in this exact moment.',
  },
];

// Daily Quests
const DAILY_QUESTS = [
  { id: 'q1', text: 'Take 5 deep diaphragm sighs before lunch', target: 5, reward: '🍃 Sage Leaf' },
  { id: 'q2', text: 'Spend 3 minutes in the Null Void stillness', target: 3, reward: '✨ Star Shimmer' },
  { id: 'q3', text: 'Write 1 honest thought in your sealed notebook', target: 1, reward: '🌸 Pressed Flower' },
  { id: 'q4', text: 'Drink a cup of warm tea with undivided presence', target: 1, reward: '🍵 Ceramic Cup' },
];

export default function ActivitiesScreen({
  accentColor = '#818cf8',
  onActivityDone,
  calmMinutes = 18,
  mindfulStreak = 4,
}: ActivitiesScreenProps) {
  const [activeModule, setActiveModule] = useState<
    | null
    | 'coloring'
    | 'thought-cloud'
    | 'pebbles'
    | 'reflection-cards'
    | 'pomodoro'
    | 'sleep-ritual'
    | 'sounds-journey'
    | 'five-min-reset'
  >(null);

  // --- 1. REFLECTION CARD DECK STATE ---
  const [cardIndex, setCardIndex] = useState(0);

  // --- 2. THOUGHT CLOUD RELEASE GAME STATE ---
  const [thoughtInput, setThoughtInput] = useState('');
  const [floatingThoughts, setFloatingThoughts] = useState<{ id: string; text: string; x: number; y: number }[]>([]);
  const [releasedCount, setReleasedCount] = useState(0);

  const handleReleaseThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtInput.trim()) return;
    const newThought = {
      id: `t-${Date.now()}`,
      text: thoughtInput.trim(),
      x: 20 + Math.random() * 60,
      y: 70,
    };
    setFloatingThoughts((prev) => [...prev, newThought]);
    setThoughtInput('');
    globalSoundscape.playSingingBowlChime(432);
    setReleasedCount((c) => c + 1);
  };

  const handleDissolveThought = (id: string) => {
    setFloatingThoughts((prev) => prev.filter((t) => t.id !== id));
    globalSoundscape.playSingingBowlChime(528);
    if (onActivityDone) onActivityDone('Thought Cloud Dissolve');
  };

  // --- 3. DIGITAL COLORING MANDALA STATE ---
  const [mandalaPalette, setMandalaPalette] = useState([
    '#94A47A', // Sage
    '#818cf8', // Lavender
    '#7EA0B7', // Mist Blue
    '#D4A373', // Amber
    '#5B8E7D', // Emerald
    '#F5EFEB', // Parchment
    '#33221A', // Espresso
  ]);
  const [selectedColor, setSelectedColor] = useState('#818cf8');
  const [mandalaColors, setMandalaColors] = useState<{ [key: string]: string }>({});

  const handleColorMandalaPiece = (pieceId: string) => {
    setMandalaColors((prev) => ({ ...prev, [pieceId]: selectedColor }));
    globalSoundscape.playSingingBowlChime(600 + Math.random() * 300);
  };

  // --- 4. ZEN PEBBLE STACKING STATE ---
  const [pebbles, setPebbles] = useState<number[]>([180, 140, 110, 80, 50]);
  const [stackedPebbles, setStackedPebbles] = useState<number[]>([]);

  const handleStackPebble = (size: number) => {
    setStackedPebbles((prev) => [...prev, size]);
    setPebbles((prev) => prev.filter((p) => p !== size));
    globalSoundscape.playSingingBowlChime(320 + stackedPebbles.length * 90);
    if (pebbles.length === 1 && onActivityDone) {
      onActivityDone('Zen Pebble Stacking');
    }
  };

  const handleResetPebbles = () => {
    setPebbles([180, 140, 110, 80, 50]);
    setStackedPebbles([]);
  };

  // --- 5. POMODORO + 1-MIN MINDFULNESS STATE ---
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'mindful-break'>('focus');
  const pomoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pomoActive && pomoTimeLeft > 0) {
      pomoTimerRef.current = setTimeout(() => setPomoTimeLeft((t) => t - 1), 1000);
    } else if (pomoTimeLeft === 0 && pomoActive) {
      if (pomoMode === 'focus') {
        setPomoMode('mindful-break');
        setPomoTimeLeft(60); // 1-minute mindfulness pause
        globalSoundscape.playSingingBowlChime(432);
        globalVoiceGuide.speak('Take one full, quiet breath. Relax your jaw, eyelids, and shoulders.');
      } else {
        setPomoMode('focus');
        setPomoTimeLeft(25 * 60);
        setPomoActive(false);
        if (onActivityDone) onActivityDone('Pomodoro Flow');
      }
    }
    return () => {
      if (pomoTimerRef.current) clearTimeout(pomoTimerRef.current);
    };
  }, [pomoActive, pomoTimeLeft, pomoMode]);

  // --- 6. 5-MINUTE SOMATIC RESET STATE ---
  const [resetStep, setResetStep] = useState(0);
  const resetSteps = [
    { title: '1. Jaw & Forehead Softening', desc: 'Unclench your back teeth. Let your tongue rest gently on the floor of your mouth. Smooth the space between your brows.', duration: '60s' },
    { title: '2. Shoulder Drop', desc: 'Inhale your shoulders up to your ears, then let them drop heavily with a long, satisfying exhale.', duration: '60s' },
    { title: '3. Horizon Eye Gazing', desc: 'Look away from screens. Gaze at the farthest point out the window or across the room to relieve optical strain.', duration: '60s' },
    { title: '4. Heart Palm Warmth', desc: 'Place both hands over your chest. Feel the steady rhythm that keeps you alive without asking for anything.', duration: '60s' },
    { title: '5. Diaphragm Deep Sigh', desc: 'Take a double inhale through your nose and let out an audible sigh. You are grounded.', duration: '60s' },
  ];

  // Daily Quests completion state
  const [completedQuests, setCompletedQuests] = useState<{ [key: string]: boolean }>({ q1: true });

  const toggleQuest = (id: string) => {
    setCompletedQuests((prev) => ({ ...prev, [id]: !prev[id] }));
    globalSoundscape.playSingingBowlChime(528);
  };

  return (
    <div className="space-y-6 text-[#2C2018] select-none pb-8">
      {/* Top Progression Banner with Quiet Luxury Aesthetics */}
      <div className="bg-gradient-to-br from-[#FAF7F2] via-white to-[#F5EFEB] p-6 rounded-[32px] border border-neutral-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A373] font-bold">
              Mindful Wellness Hub
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#2C2018]">Daily Calm & Grounding</h2>
          <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
            Engage in restful micro-rituals to de-stress, focus, and quiet the nervous system.
          </p>
        </div>

        {/* Daily Progression Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-neutral-200 shadow-2xs text-center">
            <span className="text-[10px] font-serif uppercase tracking-wider text-neutral-400 font-bold block">
              Mindful Streak
            </span>
            <span className="text-lg font-serif font-bold text-[#818cf8]">{mindfulStreak} Days 🔥</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-neutral-200 shadow-2xs text-center">
            <span className="text-[10px] font-serif uppercase tracking-wider text-neutral-400 font-bold block">
              Calm Minutes
            </span>
            <span className="text-lg font-serif font-bold text-[#94A47A]">{calmMinutes} Min ✨</span>
          </div>
        </div>
      </div>

      {/* Main Content: Activities Grid or Active Modal/Module */}
      <AnimatePresence mode="wait">
        {activeModule === null ? (
          <motion.div
            key="hub-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Daily Emotional Quests Checklist */}
            <div className="bg-white/85 backdrop-blur-md p-5 sm:p-6 rounded-[28px] border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#818cf8]" />
                  <span>Today's Gentle Quests</span>
                </h3>
                <span className="text-[11px] font-serif italic text-neutral-500">
                  {Object.values(completedQuests).filter(Boolean).length} of {DAILY_QUESTS.length} completed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DAILY_QUESTS.map((q) => {
                  const isDone = completedQuests[q.id];
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuest(q.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                        isDone ? 'bg-[#94A47A]/10 border-[#94A47A]/30 text-neutral-700' : 'bg-white border-neutral-200/80 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                            isDone ? 'bg-[#94A47A] border-[#94A47A] text-white' : 'border-neutral-300'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-serif ${isDone ? 'line-through opacity-70' : 'font-medium'}`}>
                          {q.text}
                        </span>
                      </div>
                      <span className="text-[11px] font-serif shrink-0">{q.reward}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Interactive Wellness Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Thought Cloud Release */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('thought-cloud')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#7EA0B7]/15 text-[#7EA0B7] rounded-2xl w-fit">
                    <Wind className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">Thought Cloud Release</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    Type or tap worry balloons, watch them float gently into the twilight sky and dissolve into stardust.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#7EA0B7]">
                  <span>Open Sky</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 2: Digital Coloring Mandalas */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('coloring')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#818cf8]/15 text-[#818cf8] rounded-2xl w-fit">
                    <Palette className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">Meditative Mandala</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    Color serene geometric sacred circles using soothing botanical watercolor palettes.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#818cf8]">
                  <span>Color Mandala</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 3: Zen Pebble Stacking */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('pebbles')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#94A47A]/15 text-[#94A47A] rounded-2xl w-fit">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">Zen Pebble Stacking</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    Stack river stones in peaceful equilibrium with gentle acoustic singing bowl resonance.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#94A47A]">
                  <span>Stack Stones</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 4: Reflection Cards */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('reflection-cards')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#D4A373]/15 text-[#D4A373] rounded-2xl w-fit">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">Socratic Reflection Cards</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    Draw a daily contemplative prompt designed to untangle difficult feelings and spark quiet insight.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#D4A373]">
                  <span>Draw Card</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 5: 5-Minute Somatic Reset */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('five-min-reset')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#5B8E7D]/15 text-[#5B8E7D] rounded-2xl w-fit">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">5-Minute Somatic Reset</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    A quick physical tension release sequence: jaw unclenching, eye horizon resting, and breath sighs.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-[#5B8E7D]">
                  <span>Begin Reset</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 6: Focus Pomodoro with Meditation */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setActiveModule('pomodoro')}
                className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-indigo-900/15 text-indigo-700 rounded-2xl w-fit">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018]">Flow Focus & Breath Pause</h4>
                  <p className="text-xs text-neutral-600 font-serif italic leading-relaxed">
                    25-minute quiet deep work session with a 1-minute guided mindfulness breathing chime interval.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-indigo-700">
                  <span>Enter Focus</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Active Module View */
          <motion.div
            key="active-module"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-[36px] border border-neutral-200/80 shadow-xl space-y-6"
          >
            {/* Top Back bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <button
                onClick={() => setActiveModule(null)}
                className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-serif transition flex items-center gap-1.5"
              >
                ← Return to Hub
              </button>
            </div>

            {/* MODULE 1: THOUGHT CLOUD RELEASE */}
            {activeModule === 'thought-cloud' && (
              <div className="space-y-4 text-center max-w-xl mx-auto">
                <h3 className="font-serif text-xl font-bold">Thought Cloud Release</h3>
                <p className="text-xs text-neutral-500 font-serif italic">
                  Name a worry, anxiety, or deadline. Place it in a cloud, and watch it dissolve harmlessly into the open sky.
                </p>

                {/* Sky Area */}
                <div className="relative h-64 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 rounded-[28px] p-4 overflow-hidden border border-indigo-900/60 shadow-inner flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
                  {floatingThoughts.map((th) => (
                    <motion.div
                      key={th.id}
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: -80, opacity: [0, 1, 1, 0.8] }}
                      transition={{ duration: 12, ease: 'linear' }}
                      onClick={() => handleDissolveThought(th.id)}
                      className="absolute p-3 bg-white/90 backdrop-blur-md text-[#2C2018] rounded-2xl shadow-lg border border-white/60 text-xs font-serif cursor-pointer hover:scale-110 transition flex items-center gap-1.5"
                      style={{ left: `${th.x}%` }}
                    >
                      <span>☁️</span>
                      <span>{th.text}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">(tap to dissolve)</span>
                    </motion.div>
                  ))}
                  {floatingThoughts.length === 0 && (
                    <p className="text-xs font-serif italic text-indigo-300/60">
                      The twilight sky is quiet. Add a thought below to let it drift away.
                    </p>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleReleaseThought} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a worry (e.g. 'Worried about tomorrow's presentation')..."
                    value={thoughtInput}
                    onChange={(e) => setThoughtInput(e.target.value)}
                    className="flex-1 p-3 bg-neutral-100 rounded-2xl text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#7EA0B7]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#7EA0B7] hover:bg-[#6e8fa6] text-white rounded-2xl text-xs font-serif font-bold transition shadow-sm flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Release to Sky
                  </button>
                </form>
              </div>
            )}

            {/* MODULE 2: MANDALA COLORING */}
            {activeModule === 'coloring' && (
              <div className="space-y-4 text-center max-w-xl mx-auto">
                <h3 className="font-serif text-xl font-bold">Meditative Mandala</h3>
                <p className="text-xs text-neutral-500 font-serif italic">
                  Tap any geometric petal to fill it with calm wellness colors.
                </p>

                {/* Palette Bar */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {mandalaPalette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        selectedColor === c ? 'scale-125 border-neutral-800 shadow-md' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* SVG Mandala Art */}
                <div className="flex justify-center p-4">
                  <svg width="240" height="240" viewBox="0 0 200 200" className="drop-shadow-md cursor-pointer">
                    {/* Ring 1 */}
                    <circle cx="100" cy="100" r="90" fill={mandalaColors['r1'] || '#ffffff'} stroke="#2C2018" strokeWidth="1.5" onClick={() => handleColorMandalaPiece('r1')} />
                    {/* Ring 2 Petals */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                      <g key={idx} transform={`rotate(${angle} 100 100)`}>
                        <path
                          d="M 100 100 L 80 40 Q 100 20 120 40 Z"
                          fill={mandalaColors[`p-${idx}`] || '#FAF7F2'}
                          stroke="#2C2018"
                          strokeWidth="1.5"
                          onClick={() => handleColorMandalaPiece(`p-${idx}`)}
                        />
                        <circle
                          cx="100"
                          cy="45"
                          r="6"
                          fill={mandalaColors[`c-${idx}`] || '#ffffff'}
                          stroke="#2C2018"
                          strokeWidth="1"
                          onClick={() => handleColorMandalaPiece(`c-${idx}`)}
                        />
                      </g>
                    ))}
                    {/* Center Core */}
                    <circle cx="100" cy="100" r="30" fill={mandalaColors['core'] || '#FAF7F2'} stroke="#2C2018" strokeWidth="2" onClick={() => handleColorMandalaPiece('core')} />
                    <circle cx="100" cy="100" r="14" fill={mandalaColors['innermost'] || '#ffffff'} stroke="#2C2018" strokeWidth="1.5" onClick={() => handleColorMandalaPiece('innermost')} />
                  </svg>
                </div>
              </div>
            )}

            {/* MODULE 3: ZEN PEBBLE STACKING */}
            {activeModule === 'pebbles' && (
              <div className="space-y-4 text-center max-w-xl mx-auto">
                <h3 className="font-serif text-xl font-bold">Zen Pebble Stacking</h3>
                <p className="text-xs text-neutral-500 font-serif italic">
                  Tap smooth river stones in order from largest to smallest to balance the tower.
                </p>

                {/* Stacking Ground */}
                <div className="h-64 bg-[#F5EFEB] rounded-[28px] border border-neutral-300/80 p-4 flex flex-col-reverse items-center justify-start relative shadow-inner">
                  <div className="w-64 h-3 bg-[#DECDBB] rounded-full border border-neutral-400 mb-2" />
                  {stackedPebbles.map((size, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="h-9 rounded-full border border-[#2C2018]/30 shadow-md my-0.5"
                      style={{
                        width: `${size}px`,
                        backgroundColor: idx % 2 === 0 ? '#94A47A' : '#7EA0B7',
                      }}
                    />
                  ))}
                  {stackedPebbles.length === 5 && (
                    <span className="absolute top-4 text-xs font-serif font-bold text-[#5B8E7D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✨ Balanced Tower Complete!
                    </span>
                  )}
                </div>

                {/* Available Pebbles */}
                <div className="flex items-center justify-center gap-3">
                  {pebbles.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleStackPebble(size)}
                      className="h-8 rounded-full bg-neutral-300 hover:bg-[#818cf8] hover:text-white transition border shadow-xs text-xs font-mono font-bold"
                      style={{ width: `${size}px` }}
                    >
                      {size}
                    </button>
                  ))}
                  {pebbles.length === 0 && (
                    <button
                      onClick={handleResetPebbles}
                      className="px-4 py-2 bg-[#2C2018] text-white rounded-full text-xs font-serif"
                    >
                      Restack Again
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 4: REFLECTION CARDS */}
            {activeModule === 'reflection-cards' && (
              <div className="space-y-4 text-center max-w-md mx-auto">
                <h3 className="font-serif text-xl font-bold">Reflection Cards</h3>
                <p className="text-xs text-neutral-500 font-serif italic">
                  Draw a card for quiet self-inquiry and grounding insight.
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={cardIndex}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 bg-gradient-to-br from-[#FAF7F2] to-white rounded-[32px] border-2 border-[#D4A373]/40 shadow-xl space-y-4 min-h-[200px] flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A373] font-bold">
                      {REFLECTION_CARDS[cardIndex].category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#2C2018] leading-relaxed">
                      "{REFLECTION_CARDS[cardIndex].question}"
                    </h4>
                    <p className="text-xs font-serif italic text-neutral-600 bg-amber-50/80 p-3 rounded-2xl border border-amber-100">
                      🌿 {REFLECTION_CARDS[cardIndex].wisdom}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={() => {
                    setCardIndex((i) => (i + 1) % REFLECTION_CARDS.length);
                    globalSoundscape.playPaperFlip();
                  }}
                  className="px-6 py-2.5 bg-[#D4A373] hover:bg-[#c29161] text-white rounded-full text-xs font-serif font-bold transition shadow-sm"
                >
                  Draw Next Card →
                </button>
              </div>
            )}

            {/* MODULE 5: 5-MINUTE SOMATIC RESET */}
            {activeModule === 'five-min-reset' && (
              <div className="space-y-5 text-center max-w-lg mx-auto">
                <h3 className="font-serif text-xl font-bold">5-Minute Somatic Reset</h3>
                <p className="text-xs text-neutral-500 font-serif italic">
                  Release accumulated posture tension and reset cognitive load.
                </p>

                <div className="p-6 bg-[#FAF7F2] rounded-[28px] border border-neutral-200 space-y-3">
                  <span className="text-xs font-serif font-bold text-[#5B8E7D] uppercase tracking-wider block">
                    {resetSteps[resetStep].title} ({resetSteps[resetStep].duration})
                  </span>
                  <p className="font-serif text-sm text-[#2C2018] leading-relaxed font-medium">
                    {resetSteps[resetStep].desc}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setResetStep((s) => Math.max(0, s - 1))}
                    disabled={resetStep === 0}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-xs font-serif disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      if (resetStep < resetSteps.length - 1) {
                        setResetStep((s) => s + 1);
                        globalSoundscape.playSingingBowlChime(432);
                      } else {
                        setActiveModule(null);
                        if (onActivityDone) onActivityDone('5-Minute Somatic Reset');
                      }
                    }}
                    className="px-6 py-2 bg-[#5B8E7D] text-white rounded-full text-xs font-serif font-bold shadow-sm"
                  >
                    {resetStep === resetSteps.length - 1 ? 'Complete Reset ✨' : 'Next Step →'}
                  </button>
                </div>
              </div>
            )}

            {/* MODULE 6: FOCUS POMODORO WITH MINDFULNESS */}
            {activeModule === 'pomodoro' && (
              <div className="space-y-4 text-center max-w-md mx-auto">
                <h3 className="font-serif text-xl font-bold">Flow Focus & Breath Pause</h3>
                <span className="text-xs font-serif px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {pomoMode === 'focus' ? '🎯 Deep Work Focus (25m)' : '✨ 1-Minute Mindfulness Pause'}
                </span>

                <div className="p-8 bg-white rounded-full w-48 h-48 mx-auto border-4 border-indigo-100 flex flex-col items-center justify-center shadow-lg my-2">
                  <span className="text-4xl font-mono font-bold text-[#2C2018]">
                    {Math.floor(pomoTimeLeft / 60)}:{String(pomoTimeLeft % 60).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-serif uppercase tracking-widest text-neutral-400 mt-1">
                    {pomoMode === 'focus' ? 'remaining' : 'breathe'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPomoActive(!pomoActive)}
                    className="px-8 py-3 bg-[#2C2018] text-white rounded-full text-xs font-serif font-bold shadow-md"
                  >
                    {pomoActive ? 'Pause Timer' : 'Start Focus'}
                  </button>
                  <button
                    onClick={() => {
                      setPomoActive(false);
                      setPomoTimeLeft(25 * 60);
                      setPomoMode('focus');
                    }}
                    className="p-3 bg-neutral-100 text-neutral-600 rounded-full text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
