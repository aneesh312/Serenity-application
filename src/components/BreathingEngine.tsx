/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Wind, Volume2, VolumeX, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import globalSoundscape from './SoundscapeEngine';
import globalVoiceGuide from '../lib/voiceGuide';

export interface BreathingMode {
  id: string;
  name: string;
  emotionTarget: string;
  description: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number; // Rest phase
  color: string;
  glowColor: string;
  guidance: {
    inhale: string;
    holdIn: string;
    exhale: string;
    holdOut: string;
  };
}

export const DYNAMIC_BREATHING_MODES: BreathingMode[] = [
  {
    id: 'calm-anxiety',
    name: 'Calm & Vagus Reset (4-4-6-2)',
    emotionTarget: 'Anxiety & Overthinking',
    description: 'The signature 4-4-6-2 vagal soothing cycle that slows heart rate and dissolves tension with an extended release.',
    inhale: 4,
    holdIn: 4,
    exhale: 6,
    holdOut: 2,
    color: '#818cf8', // Soft Lavender
    glowColor: 'rgba(129, 140, 248, 0.35)',
    guidance: {
      inhale: 'Breathe in slowly and deeply... expanding your chest.',
      holdIn: 'Hold gently... find the quiet stillness inside.',
      exhale: 'Now release your breath slowly... let everything soften and drop.',
      holdOut: 'Rest in pure silence... before the next breath begins.',
    },
  },
  {
    id: 'panic-reset',
    name: 'Panic De-escalation (4-6-8-2)',
    emotionTarget: 'Panic & Acute Distress',
    description: 'An extended 4-6-8-2 exhale cycle that activates the parasympathetic nervous system during distress.',
    inhale: 4,
    holdIn: 6,
    exhale: 8,
    holdOut: 2,
    color: '#7EA0B7', // Mist Blue
    glowColor: 'rgba(126, 160, 183, 0.4)',
    guidance: {
      inhale: 'Draw in cool, grounding air through your nose...',
      holdIn: 'Stay suspended... there is nowhere else you need to be. You are safe.',
      exhale: 'Long, continuous exhale through your mouth... releasing the tension outward.',
      holdOut: 'Rest empty... your heartbeat is settling into peaceful rhythm.',
    },
  },
  {
    id: 'sleep-drift',
    name: 'Sleep Drift (4-7-8-2)',
    emotionTarget: 'Insomnia & Restlessness',
    description: 'The natural tranquilizer 4-7-8-2 cycle that relaxes the nervous system for deep restorative sleep.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 2,
    color: '#9d8df1', // Muted Deep Lavender
    glowColor: 'rgba(157, 141, 241, 0.4)',
    guidance: {
      inhale: 'Inhale gentle stillness into your lungs...',
      holdIn: 'Hold peacefully... soften your eyelids, forehead, and shoulders.',
      exhale: 'Slow, melting exhale... sinking deeper into the comfort beneath you.',
      holdOut: 'Drift in the quiet dark space between thoughts.',
    },
  },
  {
    id: 'focus-clarity',
    name: 'Focus & Clarity (5-2-5-2)',
    emotionTarget: 'Study & Deep Work',
    description: 'A 5-2-5-2 balanced rhythm designed to quiet mental distractions and hone cognitive clarity.',
    inhale: 5,
    holdIn: 2,
    exhale: 5,
    holdOut: 2,
    color: '#94A47A', // Sage Green
    glowColor: 'rgba(148, 164, 122, 0.4)',
    guidance: {
      inhale: 'Inhale clarity and pure attention...',
      holdIn: 'Center your mind with steady awareness...',
      exhale: 'Exhale mental fog and restless thoughts...',
      holdOut: 'Rest in crisp, quiet focus.',
    },
  },
  {
    id: 'box-energy',
    name: 'Box Breathing (4-4-4-4)',
    emotionTarget: 'Centering & Balance',
    description: 'Equal 4-second box cycles for balanced equilibrium and emotional groundedness.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    color: '#D4A373', // Soft Amber
    glowColor: 'rgba(212, 163, 115, 0.4)',
    guidance: {
      inhale: 'Inhale with steady presence...',
      holdIn: 'Hold comfortably at the peak...',
      exhale: 'Exhale smoothly with control...',
      holdOut: 'Hold at the base of the box in stillness.',
    },
  },
];

interface BreathingEngineProps {
  accentColor?: string;
  initialModeId?: string;
  onStateChange?: (state: 'idle' | 'inhale' | 'hold' | 'exhale') => void;
  onCycleComplete?: () => void;
}

export default function BreathingEngine({
  accentColor = '#818cf8',
  initialModeId = 'calm-anxiety',
  onStateChange,
  onCycleComplete,
}: BreathingEngineProps) {
  const [selectedMode, setSelectedMode] = useState<BreathingMode>(() => {
    return DYNAMIC_BREATHING_MODES.find((m) => m.id === initialModeId) || DYNAMIC_BREATHING_MODES[0];
  });
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [voiceGuidanceOn, setVoiceGuidanceOn] = useState(true);
  const [liveCaption, setLiveCaption] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inform parent and soundscape engine of phase
  useEffect(() => {
    const parentState =
      currentPhase === 'idle'
        ? 'idle'
        : currentPhase === 'holdIn' || currentPhase === 'holdOut'
        ? 'hold'
        : currentPhase === 'inhale'
        ? 'inhale'
        : 'exhale';
    onStateChange?.(parentState);

    // Synchronize ambient soundscape breath expansion
    globalSoundscape.setBreathingPhase(currentPhase);
  }, [currentPhase, onStateChange]);

  // Clean up timer on unmount
  useEffect(() => {
    globalVoiceGuide.setCaptionListener(setLiveCaption);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      globalSoundscape.setBreathingPhase('idle');
      globalVoiceGuide.stop();
    };
  }, []);

  const speakGuidance = (text: string) => {
    if (!voiceGuidanceOn) return;
    globalVoiceGuide.speak(text, 'Kore');
  };

  const startBreathing = () => {
    setIsActive(true);
    globalSoundscape.playSingingBowlChime(220);
    runPhase('inhale');
  };

  const stopBreathing = () => {
    setIsActive(false);
    setCurrentPhase('idle');
    setSecondsLeft(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    globalVoiceGuide.stop();
    globalSoundscape.setBreathingPhase('idle');
  };

  const resetBreathing = () => {
    stopBreathing();
    setTotalCycles(0);
  };

  const runPhase = (phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    setCurrentPhase(phase);
    let duration = 0;
    let guidancePrompt = '';

    switch (phase) {
      case 'inhale':
        duration = selectedMode.inhale;
        guidancePrompt = selectedMode.guidance.inhale;
        break;
      case 'holdIn':
        duration = selectedMode.holdIn;
        guidancePrompt = selectedMode.guidance.holdIn;
        break;
      case 'exhale':
        duration = selectedMode.exhale;
        guidancePrompt = selectedMode.guidance.exhale;
        break;
      case 'holdOut':
        duration = selectedMode.holdOut;
        guidancePrompt = selectedMode.guidance.holdOut;
        break;
    }

    if (duration === 0) {
      nextPhase(phase);
      return;
    }

    setSecondsLeft(duration);
    speakGuidance(guidancePrompt);

    // Haptic pulse on mobile if supported
    if ('vibrate' in navigator) {
      try {
        if (phase === 'inhale') navigator.vibrate([40]);
        else if (phase === 'exhale') navigator.vibrate([25, 40, 25]);
        else navigator.vibrate([15]);
      } catch (e) {}
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          nextPhase(phase);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const nextPhase = (current: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') => {
    if (!isActive) return;

    if (current === 'inhale') {
      if (selectedMode.holdIn > 0) runPhase('holdIn');
      else runPhase('exhale');
    } else if (current === 'holdIn') {
      runPhase('exhale');
    } else if (current === 'exhale') {
      if (selectedMode.holdOut > 0) runPhase('holdOut');
      else {
        setTotalCycles((prev) => prev + 1);
        onCycleComplete?.();
        runPhase('inhale');
      }
    } else if (current === 'holdOut') {
      setTotalCycles((prev) => prev + 1);
      onCycleComplete?.();
      runPhase('inhale');
    }
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale (Expand)';
      case 'holdIn':
        return 'Hold (Stillness)';
      case 'exhale':
        return 'Exhale (Release)';
      case 'holdOut':
        return 'Rest (Empty)';
      case 'idle':
      default:
        return 'Quiet Breathwork';
    }
  };

  // Precise Target Scale for each phase so Framer Motion interpolates continuously
  const getOrbTargetScale = () => {
    if (!isActive) return 1.0;
    switch (currentPhase) {
      case 'inhale':
        return 1.55; // Expand up to 1.55x
      case 'holdIn':
        return 1.55; // Remain still at peak
      case 'exhale':
        return 1.0;  // Smoothly and slowly contract back to 1.0x (longest release)
      case 'holdOut':
      case 'idle':
      default:
        return 1.0;  // Rest in stillness
    }
  };

  const getPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale':
        return selectedMode.inhale;
      case 'holdIn':
        return selectedMode.holdIn;
      case 'exhale':
        return selectedMode.exhale;
      case 'holdOut':
        return selectedMode.holdOut;
      default:
        return 0.5;
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 text-[#2C2018]">
      {/* Dynamic Mode Selector Bar with Warm Quiet Luxury Styling */}
      <div className="w-full max-w-xl flex flex-wrap gap-2 justify-center mb-3">
        {DYNAMIC_BREATHING_MODES.map((mode) => {
          const isSelected = selectedMode.id === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setSelectedMode(mode);
                if (isActive) stopBreathing();
              }}
              disabled={isActive}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all flex items-center gap-1.5 border shadow-sm ${
                isSelected
                  ? 'bg-[#2C2018] text-white border-[#2C2018] font-medium shadow-md scale-102'
                  : 'bg-white/85 hover:bg-white text-neutral-700 border-neutral-200/80 disabled:opacity-40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shadow-inner"
                style={{ backgroundColor: mode.color }}
              />
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Subtitle & Cycle Tracking */}
      <div className="text-center max-w-md px-4 min-h-[40px] flex flex-col justify-center mb-2">
        {!isActive ? (
          <p className="text-xs text-neutral-500 font-serif italic leading-relaxed">
            {selectedMode.emotionTarget} • Inhale {selectedMode.inhale}s, Hold {selectedMode.holdIn}s, Exhale {selectedMode.exhale}s, Rest {selectedMode.holdOut}s
          </p>
        ) : (
          <div className="flex items-center justify-center gap-4 text-xs font-serif text-neutral-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              Completed Cycle #{totalCycles}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-mono text-[11px] font-semibold text-[#2C2018]">
              {getPhaseTitle()} ({secondsLeft}s)
            </span>
          </div>
        )}
      </div>

      {/* Central Interactive Breathing Orb with Golden Fluid Radiance */}
      <div className="relative w-72 h-72 flex items-center justify-center my-4 select-none">
        {/* Soft Ambient Radiance Aura */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute rounded-full pointer-events-none filter blur-2xl"
              style={{
                backgroundColor: selectedMode.color,
                width: '210px',
                height: '210px',
              }}
              animate={{
                scale: getOrbTargetScale() * 1.35,
                opacity:
                  currentPhase === 'inhale'
                    ? [0.25, 0.45]
                    : currentPhase === 'holdIn'
                    ? 0.45
                    : currentPhase === 'exhale'
                    ? [0.45, 0.18]
                    : 0.2,
              }}
              transition={{
                duration: getPhaseDuration(),
                ease: currentPhase === 'exhale' ? [0.25, 0.1, 0.25, 1.0] : 'easeInOut',
              }}
            />
          )}
        </AnimatePresence>

        {/* Outer Pulsing Resonance Rings */}
        <motion.div
          className="absolute rounded-full border border-dashed opacity-35 pointer-events-none"
          style={{
            borderColor: selectedMode.color,
            width: '255px',
            height: '255px',
          }}
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        />

        {/* Dynamic Breathing Orb - Fixed Exhale animation */}
        <motion.div
          key={currentPhase}
          className="rounded-full flex flex-col items-center justify-center p-6 text-center border shadow-xl relative z-10 backdrop-blur-md"
          style={{
            borderColor: `${selectedMode.color}70`,
            backgroundColor: currentPhase === 'holdIn' ? `${selectedMode.color}15` : '#ffffffd9',
            boxShadow: isActive
              ? `0 0 35px ${selectedMode.glowColor}, inset 0 0 25px ${selectedMode.color}15`
              : '0 6px 24px rgba(0,0,0,0.06)',
            width: '185px',
            height: '185px',
          }}
          initial={{
            scale: currentPhase === 'inhale' ? 1.0 : currentPhase === 'holdIn' ? 1.55 : currentPhase === 'exhale' ? 1.55 : 1.0,
          }}
          animate={{ scale: getOrbTargetScale() }}
          transition={{
            duration: getPhaseDuration(),
            ease: currentPhase === 'exhale' ? [0.25, 0.1, 0.25, 1.0] : 'easeInOut',
          }}
        >
          {isActive ? (
            <div className="flex flex-col items-center justify-center">
              <motion.span
                key={currentPhase}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-serif font-bold uppercase tracking-wider text-neutral-800 mb-1"
              >
                {currentPhase === 'inhale' ? 'Inhale' : currentPhase === 'holdIn' ? 'Hold' : currentPhase === 'exhale' ? 'Exhale' : 'Rest'}
              </motion.span>
              <motion.span
                key={`num-${secondsLeft}-${currentPhase}`}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-mono font-extrabold text-[#2C2018] tracking-tight my-0.5"
              >
                {secondsLeft}
              </motion.span>
              <span className="text-[10px] text-neutral-500 font-serif italic">
                {currentPhase === 'holdOut' ? 'stillness' : 'seconds'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Wind className="w-10 h-10 stroke-[1.2]" style={{ color: selectedMode.color }} />
              <span className="font-serif font-bold text-xs text-neutral-700">Begin Breath</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Voice & Narrative Guidance Caption Box */}
      <div className="min-h-[52px] text-center px-6 max-w-md my-2 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${currentPhase}-${selectedMode.id}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs md:text-sm font-serif italic text-neutral-700 leading-relaxed font-medium"
          >
            "{isActive ? selectedMode.guidance[currentPhase === 'idle' ? 'inhale' : currentPhase] : selectedMode.description}"
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Session Controls with Quiet Luxury Polished Buttons */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => setVoiceGuidanceOn(!voiceGuidanceOn)}
          className={`px-3 py-2 rounded-full border text-xs transition flex items-center gap-1.5 shadow-sm ${
            voiceGuidanceOn
              ? 'bg-white text-neutral-800 border-neutral-300'
              : 'bg-neutral-100 text-neutral-400 border-neutral-200'
          }`}
          title="Toggle Spoken Voice Guidance"
        >
          {voiceGuidanceOn ? <Volume2 className="w-4 h-4 text-[#818cf8]" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[11px] font-serif font-medium">{voiceGuidanceOn ? 'Voice Guide On' : 'Muted'}</span>
        </button>

        {isActive ? (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={stopBreathing}
              className="p-3.5 bg-[#2C2018] hover:bg-neutral-800 text-white rounded-full transition shadow-lg flex items-center justify-center"
              title="Pause Cycle"
            >
              <Pause className="w-5 h-5 fill-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetBreathing}
              className="p-3.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-full transition shadow-sm"
              title="Reset Cycles"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={startBreathing}
            className="flex items-center gap-2 px-8 py-3 rounded-full text-xs md:text-sm font-serif font-bold text-white shadow-md transition-all"
            style={{ backgroundColor: selectedMode.color }}
          >
            <Play className="w-4 h-4 fill-white" /> Start Breathwork
          </motion.button>
        )}
      </div>
    </div>
  );
}
