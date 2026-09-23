/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Check,
  BookOpen,
  Calendar,
  Lock,
  Sun,
  Quote,
} from 'lucide-react';
import { DailyAffirmation, StoredDailyAffirmation } from '../types';
import globalVoiceGuide from '../lib/voiceGuide';

// Curated library of gentle, grounded, trauma-informed affirmations
export const AFFIRMATIONS_COLLECTION: DailyAffirmation[] = [
  {
    id: 'aff-1',
    text: 'You do not have to carry everything all at once. Put down what belongs to tomorrow.',
    category: 'rest',
    reflectionPrompt: 'What is one expectation you can set down for the rest of today?',
  },
  {
    id: 'aff-2',
    text: 'Breathing in, I calm my body. Breathing out, I smile to this quiet, present moment.',
    category: 'presence',
    reflectionPrompt: 'Notice where your breath reaches without forcing it.',
  },
  {
    id: 'aff-3',
    text: 'You are allowed to take up space, move at your own gentle pace, and rest without needing an excuse.',
    category: 'compassion',
    reflectionPrompt: 'Where in your life do you feel rushed, and how can you soften that rush?',
  },
  {
    id: 'aff-4',
    text: 'Your worth is not measured by your productivity. Being alive and here is enough.',
    category: 'trust',
    reflectionPrompt: 'Can you thank yourself simply for existing today?',
  },
  {
    id: 'aff-5',
    text: 'Softness is not weakness; it is the quiet courage to remain open in a hurried world.',
    category: 'courage',
    reflectionPrompt: 'What does treating yourself with tenderness look like right now?',
  },
  {
    id: 'aff-6',
    text: 'Even the tallest ancient trees rest during winter. Growth happens in unseen silence too.',
    category: 'rest',
    reflectionPrompt: 'What quiet growth is happening within you that you may not see yet?',
  },
  {
    id: 'aff-7',
    text: 'Give yourself the same tender patience and kindness you so willingly offer to others.',
    category: 'compassion',
    reflectionPrompt: 'What words would a caring friend say to you this morning?',
  },
  {
    id: 'aff-8',
    text: 'You have navigated every difficult day so far. Trust your quiet, steady resilience.',
    category: 'courage',
    reflectionPrompt: 'Recall a moment when your inner strength surprised you.',
  },
  {
    id: 'aff-9',
    text: 'Small, gentle steps still carry you forward. Honour the tiny victories today.',
    category: 'grounding',
    reflectionPrompt: 'What tiny step can you celebrate today?',
  },
  {
    id: 'aff-10',
    text: 'It is completely okay if all you did today was breathe and hold yourself together.',
    category: 'compassion',
    reflectionPrompt: 'Place a warm hand over your chest and acknowledge your courage.',
  },
  {
    id: 'aff-11',
    text: 'Peace begins the moment you stop demanding perfection from yourself.',
    category: 'trust',
    reflectionPrompt: 'Where can you let "good enough" be wonderful today?',
  },
  {
    id: 'aff-12',
    text: 'May you feel safe in your own mind, at home in your own body, and held by this day.',
    category: 'grounding',
    reflectionPrompt: 'Feel your feet resting on the ground. You are supported right here.',
  },
  {
    id: 'aff-13',
    text: 'Notice the tension you might be holding in your shoulders, and gently let it melt.',
    category: 'presence',
    reflectionPrompt: 'Drop your shoulders down, soften your jaw, and let your belly relax.',
  },
  {
    id: 'aff-14',
    text: 'Whatever comes today, you can meet it one breath, one minute at a time.',
    category: 'courage',
    reflectionPrompt: 'What is within your control right now in this exact minute?',
  },
  {
    id: 'aff-15',
    text: 'Your feelings are valid visitors, but they do not have to become your permanent home.',
    category: 'presence',
    reflectionPrompt: 'Can you observe your emotion without judging whether it is right or wrong?',
  },
  {
    id: 'aff-16',
    text: 'You are worthy of quiet mornings, deep nourishing breaths, and unhurried thoughts.',
    category: 'rest',
    reflectionPrompt: 'How can you give yourself five unhurried minutes today?',
  },
  {
    id: 'aff-17',
    text: 'Let go of who you think you are supposed to be, and embrace who you are today.',
    category: 'trust',
    reflectionPrompt: 'Who are you when you strip away the expectations of others?',
  },
  {
    id: 'aff-18',
    text: 'There is nowhere you need to rush to right now. Arrive fully in this breath.',
    category: 'presence',
    reflectionPrompt: 'Listen to the closest sound you can hear right now.',
  },
  {
    id: 'aff-19',
    text: 'Kindness towards yourself softens even the sharpest moments.',
    category: 'compassion',
    reflectionPrompt: 'How can you speak to yourself like someone you deeply love?',
  },
  {
    id: 'aff-20',
    text: 'You are learning, evolving, and doing better than you often give yourself credit for.',
    category: 'trust',
    reflectionPrompt: 'What is one lesson that has made you wiser this past year?',
  },
  {
    id: 'aff-21',
    text: 'Like clear water in a tranquil pond, clarity returns when you allow things to settle.',
    category: 'grounding',
    reflectionPrompt: 'Allow yourself to sit still for sixty seconds and watch the ripples settle.',
  },
  {
    id: 'aff-22',
    text: 'You do not have to figure out the whole staircase; just step gently onto the first stair.',
    category: 'courage',
    reflectionPrompt: 'What is the very next small action in front of you?',
  },
  {
    id: 'aff-23',
    text: 'Your boundaries are not walls; they are the doors through which peace enters.',
    category: 'compassion',
    reflectionPrompt: 'Is there a boundary you need to protect today with gentle firmness?',
  },
  {
    id: 'aff-24',
    text: 'Rest is not a reward you must earn; it is an essential rhythm of being alive.',
    category: 'rest',
    reflectionPrompt: 'What type of rest does your spirit crave today—physical, mental, or sensory?',
  },
  {
    id: 'aff-25',
    text: 'May you find unexpected pockets of joy in the simple, quiet corners of today.',
    category: 'presence',
    reflectionPrompt: 'Look around you right now. What simple object brings you comfort?',
  },
  {
    id: 'aff-26',
    text: 'You are allowed to begin again at any moment. Morning is not just a time, but a mindset.',
    category: 'trust',
    reflectionPrompt: 'Take a deep breath. This breath is a fresh start.',
  },
  {
    id: 'aff-27',
    text: 'Clouds come and go, but the blue sky behind them remains untouched and whole.',
    category: 'presence',
    reflectionPrompt: 'Remember that turbulent thoughts are just passing weather.',
  },
  {
    id: 'aff-28',
    text: 'Give yourself permission to be a masterpiece and a work in progress at the same time.',
    category: 'compassion',
    reflectionPrompt: 'Celebrate both how far you have come and what you are currently learning.',
  },
];

interface DailyAffirmationProps {
  onReflect?: (affirmation: DailyAffirmation) => void;
  accentColor?: string;
}

export const DailyAffirmationCard: React.FC<DailyAffirmationProps> = ({
  onReflect,
  accentColor = '#94A47A',
}) => {
  const [affirmation, setAffirmation] = useState<DailyAffirmation | null>(null);
  const [dateString, setDateString] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Helper to get local date in YYYY-MM-DD format
  const getTodayLocalDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Deterministic selector based on date string so each day gets a distinct, consistent affirmation
  const getAffirmationForDate = (dateKey: string): DailyAffirmation => {
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % AFFIRMATIONS_COLLECTION.length;
    return AFFIRMATIONS_COLLECTION[index];
  };

  useEffect(() => {
    const today = getTodayLocalDate();
    setDateString(today);

    // 1. Check localized storage for today's affirmation
    try {
      const savedData = localStorage.getItem('serenity_daily_affirmation');
      if (savedData) {
        const parsed: StoredDailyAffirmation = JSON.parse(savedData);
        // If the saved affirmation matches today's date, lock it in!
        if (parsed && parsed.date === today && parsed.affirmation) {
          setAffirmation(parsed.affirmation);
          setIsFavorited(Boolean(parsed.favorited));
          return;
        }
      }

      // 2. If no saved record for today, pick today's affirmation and lock it in localStorage
      const newAffirmation = getAffirmationForDate(today);
      const newRecord: StoredDailyAffirmation = {
        date: today,
        affirmation: newAffirmation,
        favorited: false,
      };
      localStorage.setItem('serenity_daily_affirmation', JSON.stringify(newRecord));
      setAffirmation(newAffirmation);
      setIsFavorited(false);
    } catch (err) {
      console.error('Error loading localized daily affirmation:', err);
      // Fallback
      setAffirmation(getAffirmationForDate(today));
    }
  }, []);

  // Format date for display (e.g. "Monday, September 21")
  const formattedDate = (() => {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Today';
    }
  })();

  const handleCopy = async () => {
    if (!affirmation) return;
    try {
      await navigator.clipboard.writeText(`"${affirmation.text}" — Serenity Daily Affirmation`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleFavorite = () => {
    if (!affirmation) return;
    const nextFavorite = !isFavorited;
    setIsFavorited(nextFavorite);

    try {
      const today = getTodayLocalDate();
      const currentStored = localStorage.getItem('serenity_daily_affirmation');
      if (currentStored) {
        const parsed: StoredDailyAffirmation = JSON.parse(currentStored);
        parsed.favorited = nextFavorite;
        localStorage.setItem('serenity_daily_affirmation', JSON.stringify(parsed));
      }

      // Also persist to saved favorites list
      const savedFavoritesRaw = localStorage.getItem('serenity_saved_affirmations');
      let savedFavorites: DailyAffirmation[] = savedFavoritesRaw ? JSON.parse(savedFavoritesRaw) : [];
      if (nextFavorite) {
        if (!savedFavorites.some((item) => item.id === affirmation.id)) {
          savedFavorites.push(affirmation);
        }
      } else {
        savedFavorites = savedFavorites.filter((item) => item.id !== affirmation.id);
      }
      localStorage.setItem('serenity_saved_affirmations', JSON.stringify(savedFavorites));
    } catch (e) {
      console.error('Error saving favorite affirmation:', e);
    }
  };

  const handleSpeak = async () => {
    if (!affirmation) return;
    if (isSpeaking) {
      globalVoiceGuide.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await globalVoiceGuide.speak(
        `Today's affirmation. ${affirmation.text}. Take a gentle breath, and remember: ${affirmation.reflectionPrompt || 'be kind to yourself.'}`
      );
    } catch (e) {
      console.error('Voice guide failed:', e);
    } finally {
      setIsSpeaking(false);
    }
  };

  if (!affirmation) {
    return null;
  }

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    grounding: { bg: 'bg-[#94A47A]/15', text: 'text-[#627546]', border: 'border-[#94A47A]/30' },
    compassion: { bg: 'bg-[#D3A29A]/15', text: 'text-[#A05C52]', border: 'border-[#D3A29A]/30' },
    presence: { bg: 'bg-[#8FA89B]/15', text: 'text-[#476858]', border: 'border-[#8FA89B]/30' },
    rest: { bg: 'bg-[#768A96]/15', text: 'text-[#445763]', border: 'border-[#768A96]/30' },
    courage: { bg: 'bg-[#C67C58]/15', text: 'text-[#8E4B29]', border: 'border-[#C67C58]/30' },
    trust: { bg: 'bg-[#B08968]/15', text: 'text-[#7D5333]', border: 'border-[#B08968]/30' },
  };

  const catStyle = categoryColorMap[affirmation.category] || categoryColorMap.grounding;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl bg-white/85 backdrop-blur-md px-6 py-5 border border-neutral-200/70 rounded-[28px] shadow-xs relative overflow-hidden my-3"
    >
      {/* Aesthetic washi tape on top border */}
      <div className="washi-tape washi-tape-sage -top-2 left-1/2 -translate-x-1/2" />

      {/* Header bar: Morning Date Badge & Category */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EFE4D2] border border-neutral-200/80 flex items-center justify-center text-[#C67C58]">
            <Sun className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                Daily Affirmation
              </span>
              <span className="text-[9px] text-neutral-400">•</span>
              <span className="text-[10px] font-serif italic text-neutral-500">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider border capitalize ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            {affirmation.category}
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-neutral-400 bg-neutral-100/80 border border-neutral-200/50"
            title="Localized state locks this affirmation for the full day to build focus."
          >
            <Lock className="w-2.5 h-2.5 text-neutral-400" />
            <span>Locked today</span>
          </span>
        </div>
      </div>

      {/* Main Affirmation Quote Section */}
      <div className="relative py-2 px-1">
        <Quote className="w-6 h-6 text-[#94A47A]/30 absolute -top-1 -left-2 rotate-180 pointer-events-none" />
        <p className="font-serif italic text-base sm:text-lg text-[#2C2018] leading-relaxed pl-4 pr-1 tracking-normal selection:bg-[#94A47A]/20">
          “{affirmation.text}”
        </p>
      </div>

      {/* Gentle Reflection Prompt whisper */}
      {affirmation.reflectionPrompt && (
        <div className="mt-2 pl-4 pr-1 flex items-start gap-1.5 text-[11px] font-serif text-[#C67C58] italic border-l-2 border-[#C67C58]/30">
          <Sparkles className="w-3 h-3 text-[#C67C58] shrink-0 mt-0.5" />
          <span>{affirmation.reflectionPrompt}</span>
        </div>
      )}

      {/* Interactive Action Ribbon */}
      <div className="mt-4 pt-3 border-t border-neutral-100/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Voice Readout Button */}
          <button
            onClick={handleSpeak}
            className={`px-2.5 py-1 rounded-full text-[10px] font-serif flex items-center gap-1.5 transition border ${
              isSpeaking
                ? 'bg-[#94A47A] text-white border-[#94A47A] shadow-xs'
                : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
            }`}
            title={isSpeaking ? 'Stop listening' : 'Listen to this gentle affirmation'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3 h-3 animate-pulse" />
                <span>Speaking...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-[#94A47A]" />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Copy to clipboard */}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-full text-[10px] font-serif bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200 flex items-center gap-1.5 transition"
            title="Copy affirmation to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Reflect in Journal */}
          {onReflect && (
            <button
              onClick={() => onReflect(affirmation)}
              className="px-2.5 py-1 rounded-full text-[10px] font-serif bg-[#F4ECDD] hover:bg-[#EFE4D2] text-[#2C2018] border border-neutral-200/80 flex items-center gap-1.5 transition shadow-2xs"
              title="Open journal with this affirmation prompt"
            >
              <BookOpen className="w-3 h-3 text-[#C67C58]" />
              <span className="hidden xs:inline">Reflect in</span> Journal
            </button>
          )}
        </div>

        {/* Favorite Heart Toggle */}
        <button
          onClick={handleToggleFavorite}
          className={`p-1.5 rounded-full border transition flex items-center justify-center ${
            isFavorited
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-white hover:bg-neutral-50 text-neutral-400 border-neutral-200'
          }`}
          title={isFavorited ? 'Saved to your favorites' : 'Save to favorite affirmations'}
          aria-label="Favorite affirmation"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

export default DailyAffirmationCard;
