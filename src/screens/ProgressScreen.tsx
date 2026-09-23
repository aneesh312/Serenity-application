/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Milestone, MilestoneMetric, Habit, HabitLog } from '../types';
import Sticker from '../components/Sticker';
import HabitTrends from '../components/HabitTrends';
import { Sparkles, Star, Calendar, Heart, Award, TrendingUp, Compass } from 'lucide-react';

interface ProgressScreenProps {
  streak: number;
  journalsCount: number;
  breathingSessionsCount: number;
  moodDaysCount: number;
  medsTakenCount: number;
  habits?: Habit[];
  habitLogs?: HabitLog[];
  onNavigateToCare?: () => void;
  accentColor?: string;
}

export default function ProgressScreen({
  streak,
  journalsCount,
  breathingSessionsCount,
  moodDaysCount,
  medsTakenCount,
  habits = [],
  habitLogs = [],
  onNavigateToCare,
  accentColor = '#94A47A',
}: ProgressScreenProps) {
  const [subTab, setSubTab] = useState<'trends' | 'milestones'>('trends');
  // Define standard non-competitive Milestones
  const milestones: Milestone[] = [
    {
      id: 'mile-1',
      title: 'Gentle Awakening',
      description: 'Entered the sanctuary for your first day of reflection.',
      metric: 'streak',
      threshold: 1,
      sticker: 'sun',
      unlocked: streak >= 1,
    },
    {
      id: 'mile-2',
      title: 'Comforting Habit',
      description: 'Visited your sanctuary for 5 consecutive check-ins.',
      metric: 'streak',
      threshold: 5,
      sticker: 'star',
      unlocked: streak >= 5,
    },
    {
      id: 'mile-3',
      title: 'The First Sigh',
      description: 'Completed your first conscious breathing session.',
      metric: 'breathing',
      threshold: 1,
      sticker: 'feather',
      unlocked: breathingSessionsCount >= 1,
    },
    {
      id: 'mile-4',
      title: 'Ocean of Calm',
      description: 'Completed 5 calming breathing sessions.',
      metric: 'breathing',
      threshold: 5,
      sticker: 'cloud',
      unlocked: breathingSessionsCount >= 5,
    },
    {
      id: 'mile-5',
      title: 'Voice of the Heart',
      description: 'Wrote your first private journal reflection.',
      metric: 'journals',
      threshold: 1,
      sticker: 'book',
      unlocked: journalsCount >= 1,
    },
    {
      id: 'mile-6',
      title: 'Volume of Comfort',
      description: 'Poured your thoughts out in 5 journal entries.',
      metric: 'journals',
      threshold: 5,
      sticker: 'candle',
      unlocked: journalsCount >= 5,
    },
    {
      id: 'mile-7',
      title: 'Emotional Awareness',
      description: 'Checked-in and logged your feelings on 3 different days.',
      metric: 'moods',
      threshold: 3,
      sticker: 'heart',
      unlocked: moodDaysCount >= 3,
    },
    {
      id: 'mile-8',
      title: 'Nourishing Habit',
      description: 'Marked your first daily medication self-care dose.',
      metric: 'meds',
      threshold: 1,
      sticker: 'tea',
      unlocked: medsTakenCount >= 1,
    },
    {
      id: 'mile-9',
      title: 'Safe Harbor',
      description: 'Stayed on top of self-care with 10 doses marked.',
      metric: 'meds',
      threshold: 10,
      sticker: 'leaf',
      unlocked: medsTakenCount >= 10,
    },
  ];

  const getMetricValue = (metric: MilestoneMetric) => {
    switch (metric) {
      case 'streak':
        return streak;
      case 'journals':
        return journalsCount;
      case 'breathing':
        return breathingSessionsCount;
      case 'moods':
        return moodDaysCount;
      case 'meds':
        return medsTakenCount;
    }
  };

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className="space-y-6 h-full py-1">
      {/* Sub-navigation switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-[#EFE4D2]/40 border border-neutral-200/50 rounded-full gap-2">
          <button
            onClick={() => setSubTab('trends')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'trends'
                ? 'bg-[#94A47A] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Habit Trends</span>
            {habits.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  subTab === 'trends'
                    ? 'bg-white/30 text-white'
                    : 'bg-neutral-200/70 text-neutral-600'
                }`}
              >
                {habits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('milestones')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'milestones'
                ? 'bg-[#94A47A] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Gentle Milestones</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                subTab === 'milestones'
                  ? 'bg-white/30 text-white'
                  : 'bg-neutral-200/70 text-neutral-600'
              }`}
            >
              {unlockedCount}/{milestones.length}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SUBTAB 1: HABIT TRENDS (RECHARTS) */}
        {subTab === 'trends' && (
          <motion.div
            key="progress-trends"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            <HabitTrends
              habits={habits}
              habitLogs={habitLogs}
              accentColor={accentColor}
              onNavigateToCare={onNavigateToCare}
            />
          </motion.div>
        )}

        {/* SUBTAB 2: GENTLE MILESTONES & BADGES */}
        {subTab === 'milestones' && (
          <motion.div
            key="progress-milestones"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Overview Stat Board - Custom hand-drawn card style */}
            <div className="relative p-6 bg-[#F4ECDD] rounded-3xl border border-neutral-200/60 shadow-sm overflow-hidden">
              {/* Washi tape visual accent top-left corner */}
              <div className="absolute top-2 left-4 w-12 h-4 bg-[#D3A29A]/50 rotate-[-4deg] border-b border-dashed border-neutral-400/20" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
                <div>
                  <h2 className="font-serif text-xl tracking-tight text-[#2C2018] flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C67C58]" /> Gentle Self-Care Milestones
                  </h2>
                  <p className="font-serif italic text-xs text-[#C67C58] mt-1">
                    Every step is a victory. There are no strict goals here, only soft milestones of self-compassion.
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-[#94A47A] text-white rounded-full text-xs font-semibold shadow-sm">
                  {unlockedCount} of {milestones.length} Unlocked
                </div>
              </div>

              {/* Dynamic Status Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                <div className="p-3 bg-white/60 border border-neutral-200/40 rounded-2xl text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Streak</span>
                  <span className="block text-lg font-serif font-bold text-[#2C2018] mt-1">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                  <span className="block text-[9px] italic text-[#C67C58] mt-0.5">Welcome back!</span>
                </div>

                <div className="p-3 bg-white/60 border border-neutral-200/40 rounded-2xl text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Reflections</span>
                  <span className="block text-lg font-serif font-bold text-[#2C2018] mt-1">{journalsCount}</span>
                  <span className="block text-[9px] italic text-[#C67C58] mt-0.5">Scribed safely</span>
                </div>

                <div className="p-3 bg-white/60 border border-neutral-200/40 rounded-2xl text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Breaths</span>
                  <span className="block text-lg font-serif font-bold text-[#2C2018] mt-1">{breathingSessionsCount}</span>
                  <span className="block text-[9px] italic text-[#C67C58] mt-0.5">Conscious sighs</span>
                </div>

                <div className="p-3 bg-white/60 border border-neutral-200/40 rounded-2xl text-center">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Mood Checks</span>
                  <span className="block text-lg font-serif font-bold text-[#2C2018] mt-1">{moodDaysCount} {moodDaysCount === 1 ? 'Day' : 'Days'}</span>
                  <span className="block text-[9px] italic text-[#C67C58] mt-0.5">Empathy flow</span>
                </div>

                <div className="p-3 bg-white/60 border border-neutral-200/40 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">Care Taken</span>
                  <span className="block text-lg font-serif font-bold text-[#2C2018] mt-1">{medsTakenCount} {medsTakenCount === 1 ? 'Dose' : 'Doses'}</span>
                  <span className="block text-[9px] italic text-[#C67C58] mt-0.5">Self-care doses</span>
                </div>
              </div>
            </div>

            {/* Grid of Milestone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {milestones.map((m) => {
                const currentVal = getMetricValue(m.metric);
                const progressPct = Math.min(100, Math.round((currentVal / m.threshold) * 100));

                return (
                  <motion.div
                    key={m.id}
                    whileHover={{ y: -2 }}
                    className={`p-4 bg-white rounded-3xl border shadow-sm relative flex items-center gap-4 ${
                      m.unlocked ? 'border-[#94A47A]/30' : 'border-neutral-200/60 opacity-90'
                    }`}
                  >
                    {/* Sticker Icon */}
                    <div className="shrink-0">
                      <Sticker type={m.sticker} size={56} locked={!m.unlocked} />
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-sm font-bold text-[#2C2018] truncate">
                          {m.title}
                        </h3>
                        {m.unlocked && (
                          <span className="p-0.5 bg-amber-50 rounded-full" title="Unlocked!">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-neutral-500 leading-relaxed mt-0.5">
                        {m.description}
                      </p>

                      {/* Gentle non-shaming progress tracker */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-[9px] font-medium text-neutral-400">
                          <span>
                            {currentVal} / {m.threshold}
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-[#F4ECDD]/60 h-1.5 rounded-full mt-1 overflow-hidden border border-neutral-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progressPct}%`,
                              backgroundColor: m.unlocked ? '#94A47A' : '#D3A29A',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
