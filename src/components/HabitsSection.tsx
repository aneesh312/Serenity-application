/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Droplet,
  Sun,
  Heart,
  Wind,
  Coffee,
  Book,
  Moon,
  Smile,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Palette,
  Users,
  Brain,
  Clock,
} from 'lucide-react';
import { Habit, HabitLog, HabitCategory } from '../types';

interface HabitsSectionProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onDeleteHabit: (id: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
  onUpdateHabitProgress?: (habitId: string, date: string, delta: number) => void;
  accentColor?: string;
}

// Category Configuration definition
export interface CategoryConfig {
  id: HabitCategory;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  badgeBg: string;
}

export const CATEGORY_CONFIGS: Record<HabitCategory, CategoryConfig> = {
  wellness: {
    id: 'wellness',
    name: 'Wellness',
    description: 'Nourishment, hydration, vitality, and physical restoration',
    icon: Heart,
    accentBg: 'bg-emerald-50/50',
    accentText: 'text-emerald-800',
    accentBorder: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100/70 text-emerald-800 border-emerald-200',
  },
  social: {
    id: 'social',
    name: 'Social',
    description: 'Human warmth, kind messages, check-ins, and heart connection',
    icon: Users,
    accentBg: 'bg-sky-50/50',
    accentText: 'text-sky-800',
    accentBorder: 'border-sky-200/80',
    badgeBg: 'bg-sky-100/70 text-sky-800 border-sky-200',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Art, journaling, expression, music, and playful curiosities',
    icon: Palette,
    accentBg: 'bg-amber-50/50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200/80',
    badgeBg: 'bg-amber-100/70 text-amber-800 border-amber-200',
  },
  mind: {
    id: 'mind',
    name: 'Mind',
    description: 'Presence, conscious breathing, contemplation, and peaceful pages',
    icon: Brain,
    accentBg: 'bg-purple-50/50',
    accentText: 'text-purple-800',
    accentBorder: 'border-purple-200/80',
    badgeBg: 'bg-purple-100/70 text-purple-800 border-purple-200',
  },
  body: {
    id: 'body',
    name: 'Body',
    description: 'Gentle stretching, peaceful strolls, posture, and body movement',
    icon: Activity,
    accentBg: 'bg-teal-50/50',
    accentText: 'text-teal-800',
    accentBorder: 'border-teal-200/80',
    badgeBg: 'bg-teal-100/70 text-teal-800 border-teal-200',
  },
  routine: {
    id: 'routine',
    name: 'Routine',
    description: 'Morning light, wind-down rituals, tidy spaces, and steady rhythms',
    icon: Clock,
    accentBg: 'bg-orange-50/50',
    accentText: 'text-orange-800',
    accentBorder: 'border-orange-200/80',
    badgeBg: 'bg-orange-100/70 text-orange-800 border-orange-200',
  },
};

// All category keys in order
export const CATEGORY_ORDER: HabitCategory[] = [
  'wellness',
  'social',
  'creative',
  'mind',
  'body',
  'routine',
];

// Icon mapper helper
export const HABIT_ICONS = [
  { id: 'droplet', label: 'Water', icon: Droplet, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'wind', label: 'Breathe / Stretch', icon: Wind, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'sun', label: 'Morning Light', icon: Sun, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'heart', label: 'Self-Care', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'sparkles', label: 'Mindful Moment', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'coffee', label: 'Warm Tea / Coffee', icon: Coffee, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { id: 'book', label: 'Quiet Reading', icon: Book, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'moon', label: 'Rest / Sleep', icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'smile', label: 'Kindness', icon: Smile, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'activity', label: 'Gentle Walk', icon: Activity, color: 'text-lime-700 bg-lime-50 border-lime-200' },
];

export const PRESET_HABIT_IDEAS = [
  { title: 'Drink water', icon: 'droplet', category: 'wellness' as HabitCategory, targetFrequency: 8, unit: 'glasses' },
  { title: 'Send a loving check-in text', icon: 'smile', category: 'social' as HabitCategory, targetFrequency: 1, unit: 'times' },
  { title: '10-min freeform sketching or writing', icon: 'book', category: 'creative' as HabitCategory, targetFrequency: 10, unit: 'minutes' },
  { title: 'Gentle 5-min stretch', icon: 'wind', category: 'body' as HabitCategory, targetFrequency: 1, unit: 'times' },
  { title: 'Step into morning sunlight', icon: 'sun', category: 'routine' as HabitCategory, targetFrequency: 1, unit: 'times' },
  { title: 'Three conscious breaths', icon: 'sparkles', category: 'mind' as HabitCategory, targetFrequency: 3, unit: 'times' },
  { title: 'Warm herbal infusion', icon: 'coffee', category: 'wellness' as HabitCategory, targetFrequency: 2, unit: 'cups' },
  { title: 'Bedtime screen wind-down', icon: 'moon', category: 'routine' as HabitCategory, targetFrequency: 1, unit: 'times' },
];

export const HabitsSection: React.FC<HabitsSectionProps> = ({
  habits,
  habitLogs,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  onUpdateHabitProgress,
  accentColor = '#94A47A',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('wellness');
  const [newIcon, setNewIcon] = useState('droplet');
  const [newFrequency, setNewFrequency] = useState<number>(1);
  const [newUnit, setNewUnit] = useState('times');

  // Collapsible section state for each category (default all open)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const collapseAllCategories = () => {
    const next: Record<string, boolean> = {};
    CATEGORY_ORDER.forEach((cat) => {
      next[cat] = true;
    });
    setCollapsedCategories(next);
  };

  const expandAllCategories = () => {
    setCollapsedCategories({});
  };

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get progress for a specific habit on a specific date
  const getHabitCountForDate = (habitId: string, dateStr: string): number => {
    const log = habitLogs.find((l) => l.habitId === habitId && l.date === dateStr);
    return log?.count ?? (log ? 1 : 0);
  };

  // Helper for last 7 days history
  const getLast7Days = () => {
    const days = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];
      const dayNumber = d.getDate();
      const isToday = dateStr === todayStr;
      days.push({ dateStr, dayName, dayNumber, isToday });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Completed count for today (meaning goal reached >= targetFrequency)
  const completedTodayCount = habits.filter((h) => {
    const target = Math.max(1, h.targetFrequency || 1);
    const count = getHabitCountForDate(h.id, todayStr);
    return count >= target;
  }).length;

  const totalHabitsCount = habits.length;
  const completionPercentage =
    totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      icon: newIcon,
      targetFrequency: Math.max(1, newFrequency || 1),
      unit: newUnit.trim() || 'times',
    });

    setNewTitle('');
    setNewFrequency(1);
    setNewUnit('times');
    setShowAddForm(false);
  };

  const handleQuickAdd = (preset: typeof PRESET_HABIT_IDEAS[0]) => {
    if (habits.some((h) => h.title.toLowerCase() === preset.title.toLowerCase())) {
      return;
    }
    onAddHabit({
      title: preset.title,
      category: preset.category,
      icon: preset.icon,
      targetFrequency: preset.targetFrequency,
      unit: preset.unit,
    });
  };

  const handleStepProgress = (habitId: string, delta: number) => {
    if (onUpdateHabitProgress) {
      onUpdateHabitProgress(habitId, todayStr, delta);
    } else {
      onToggleHabit(habitId, todayStr);
    }
  };

  const renderHabitIcon = (iconName?: string) => {
    const found = HABIT_ICONS.find((i) => i.id === iconName) || HABIT_ICONS[0];
    const IconComponent = found.icon;
    return (
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${found.color}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  // Group habits by category
  const habitsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = habits.filter((h) => (h.category || 'wellness') === cat);
    return acc;
  }, {} as Record<HabitCategory, Habit[]>);

  // Active categories that contain at least one habit
  const activeCategories = CATEGORY_ORDER.filter(
    (cat) => habitsByCategory[cat] && habitsByCategory[cat].length > 0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Gentle Rituals & Progress */}
      <div className="bg-white/85 backdrop-blur-md rounded-[28px] border border-neutral-200/70 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="washi-tape washi-tape-sage -top-2 left-8" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#94A47A]/15 text-[#627546] border border-[#94A47A]/30">
                Daily Rhythms
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2018]">
              Small, Positive Habits
            </h3>
            <p className="text-xs text-neutral-600 max-w-md leading-relaxed font-sans">
              Gentle micro-habits anchor peace into your day. Track daily frequencies across categorized rituals without guilt—each small glass or breath brings calm.
            </p>
          </div>

          {/* Today's completion ring / progress summary */}
          <div className="flex items-center gap-4 bg-[#F4ECDD]/70 border border-neutral-200/60 rounded-2xl px-4 py-3 shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#94A47A] transition-all duration-500 ease-out"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-[#2C2018] font-mono">
                {completionPercentage}%
              </span>
            </div>

            <div className="text-left">
              <p className="text-[11px] font-bold text-[#2C2018]">
                {completedTodayCount} of {totalHabitsCount} goals met
              </p>
              <p className="text-[10px] text-neutral-500 font-serif italic">
                {completedTodayCount === totalHabitsCount && totalHabitsCount > 0
                  ? 'All daily targets reached'
                  : 'Every small progress counts'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Habits Checklist & Week Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Habits Grouped by Category */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-2">
                <span>Today’s Rhythms</span>
                <span className="text-[11px] font-mono font-normal text-neutral-400">
                  ({completedTodayCount}/{totalHabitsCount} finished)
                </span>
              </h4>

              {activeCategories.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-neutral-200 pl-2 text-[10px] text-neutral-500 font-sans">
                  <button
                    onClick={expandAllCategories}
                    className="hover:text-[#2C2018] underline underline-offset-2"
                  >
                    Expand all
                  </button>
                  <span>•</span>
                  <button
                    onClick={collapseAllCategories}
                    className="hover:text-[#2C2018] underline underline-offset-2"
                  >
                    Collapse all
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif bg-white hover:bg-neutral-50 text-[#2C2018] border border-neutral-200/80 shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#94A47A]" />
              <span>{showAddForm ? 'Close' : 'Add Habit'}</span>
            </button>
          </div>

          {/* Collapsible Add Habit Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateHabit}
                className="bg-white/95 rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs space-y-4 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-xs font-serif font-bold text-[#2C2018] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C67C58]" /> Create a Gentle Daily Habit
                  </span>
                  <span className="text-[10px] text-neutral-400 font-sans">
                    Define small, reachable daily frequencies
                  </span>
                </div>

                {/* Habit Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Drink a glass of water, gentle walk, send a kind note..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#94A47A]/30 bg-white"
                  />
                </div>

                {/* Frequency & Unit Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Daily Target Frequency
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 text-xs font-mono px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#94A47A]/30 bg-white"
                      />
                      <span className="text-xs text-neutral-500 font-sans">
                        per day
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="e.g. glasses, times, minutes, cups, pages"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#94A47A]/30 bg-white"
                    />
                  </div>
                </div>

                {/* Category & Icon Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#94A47A]/30 bg-white"
                    >
                      <option value="wellness">Wellness (Hydration, Nourishment, Rest)</option>
                      <option value="social">Social (Heart, Friends, Warm Connections)</option>
                      <option value="creative">Creative (Art, Journaling, Expression)</option>
                      <option value="mind">Mind (Breath, Presence, Pages)</option>
                      <option value="body">Body (Movement, Gentle Walks, Stretch)</option>
                      <option value="routine">Routine (Morning Light, Wind-down)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Choose Icon
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {HABIT_ICONS.map((ic) => {
                        const IconComponent = ic.icon;
                        const isSelected = newIcon === ic.id;
                        return (
                          <button
                            type="button"
                            key={ic.id}
                            onClick={() => setNewIcon(ic.id)}
                            className={`p-2 rounded-lg border transition shrink-0 ${
                              isSelected
                                ? 'bg-[#94A47A] text-white border-[#94A47A]'
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}
                            title={ic.label}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-serif text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full text-xs font-serif font-bold text-white bg-[#94A47A] hover:bg-[#83946a] shadow-2xs transition"
                  >
                    Save Habit
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Habits List Grouped by Category */}
          {habits.length === 0 ? (
            <div className="text-center py-10 bg-white/70 border border-neutral-200/60 rounded-3xl p-6 space-y-3">
              <Droplet className="w-8 h-8 text-[#94A47A] mx-auto opacity-60" />
              <p className="font-serif text-sm text-[#2C2018] font-bold">
                No habits established yet
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Begin with one or two effortless rituals across Wellness, Social, or Creative categories. Pick from the suggestions below or define your own daily frequency goals.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {CATEGORY_ORDER.map((catKey) => {
                const categoryHabits = habitsByCategory[catKey] || [];
                if (categoryHabits.length === 0) return null;

                const config = CATEGORY_CONFIGS[catKey] || CATEGORY_CONFIGS.wellness;
                const CategoryIcon = config.icon;
                const isCollapsed = !!collapsedCategories[catKey];

                const completedInCategory = categoryHabits.filter((h) => {
                  const target = Math.max(1, h.targetFrequency || 1);
                  const count = getHabitCountForDate(h.id, todayStr);
                  return count >= target;
                }).length;

                return (
                  <div
                    key={catKey}
                    className="bg-white/85 backdrop-blur-md rounded-2xl border border-neutral-200/70 overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Collapsible Category Header Accordion Button */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(catKey)}
                      className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition hover:bg-neutral-50/80 ${
                        isCollapsed ? 'bg-white' : 'bg-neutral-50/40 border-b border-neutral-100'
                      }`}
                      aria-expanded={!isCollapsed}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${config.badgeBg}`}>
                          <CategoryIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-xs sm:text-sm font-bold text-[#2C2018]">
                              {config.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-white text-neutral-600 border border-neutral-200">
                              {categoryHabits.length} {categoryHabits.length === 1 ? 'habit' : 'habits'}
                            </span>
                          </div>
                          <span className="hidden sm:block text-[10px] text-neutral-400 font-sans truncate">
                            {config.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono text-neutral-500 font-medium">
                          {completedInCategory}/{categoryHabits.length} done
                        </span>
                        <div className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500">
                          {isCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Category Content: Habit items */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 sm:p-3.5 space-y-2.5 overflow-hidden"
                        >
                          {categoryHabits.map((habit) => {
                            const targetGoal = Math.max(1, habit.targetFrequency || 1);
                            const currentCount = getHabitCountForDate(habit.id, todayStr);
                            const isCompletedToday = currentCount >= targetGoal;
                            const progressPct = Math.min(100, Math.round((currentCount / targetGoal) * 100));

                            // Calculate 7-day completion tally (days where goal was met)
                            const past7DaysCount = last7Days.filter((day) => {
                              const dayCount = getHabitCountForDate(habit.id, day.dateStr);
                              return dayCount >= targetGoal;
                            }).length;

                            return (
                              <motion.div
                                key={habit.id}
                                layout
                                className={`group bg-white rounded-xl border transition-all duration-200 p-3 sm:p-3.5 shadow-2xs ${
                                  isCompletedToday
                                    ? 'border-emerald-200/90 bg-emerald-50/15'
                                    : 'border-neutral-200/60 hover:border-neutral-300'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {/* Left: Quick complete button, icon & title info */}
                                  <div className="flex items-center gap-3 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => onToggleHabit(habit.id, todayStr)}
                                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                                        isCompletedToday
                                          ? 'bg-[#94A47A] border-[#94A47A] text-white shadow-2xs scale-105'
                                          : currentCount > 0
                                          ? 'bg-[#94A47A]/15 border-[#94A47A] text-[#627546]'
                                          : 'bg-white border-neutral-300 hover:border-[#94A47A] text-transparent'
                                      }`}
                                      title={
                                        isCompletedToday
                                          ? 'Reset today\'s progress'
                                          : targetGoal > 1
                                          ? `Progress: ${currentCount}/${targetGoal}. Click to advance or toggle`
                                          : 'Mark as completed today'
                                      }
                                      aria-label={`Mark ${habit.title} completed`}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </button>

                                    {/* Icon */}
                                    {renderHabitIcon(habit.icon)}

                                    {/* Title and details */}
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p
                                          className={`text-xs sm:text-sm font-sans font-medium truncate transition ${
                                            isCompletedToday
                                              ? 'line-through text-neutral-400'
                                              : 'text-[#2C2018]'
                                          }`}
                                        >
                                          {habit.title}
                                        </p>
                                        {targetGoal > 1 && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0">
                                            Goal: {targetGoal} {habit.unit || 'times'}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">
                                          {config.name}
                                        </span>
                                        <span className="text-[9px] text-neutral-300">•</span>
                                        <span className="text-[9.5px] text-[#94A47A] font-serif italic">
                                          {past7DaysCount} of 7 days goal reached
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Interactive Stepper & 7-day indicators */}
                                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                                    {/* Numeric Stepper Controller */}
                                    <div className="flex items-center gap-1.5 bg-neutral-50 px-2 py-1 rounded-xl border border-neutral-200/70">
                                      <button
                                        type="button"
                                        onClick={() => handleStepProgress(habit.id, -1)}
                                        disabled={currentCount <= 0}
                                        className="w-6 h-6 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white text-neutral-600 flex items-center justify-center transition shadow-2xs"
                                        title="Decrement count"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>

                                      <div className="min-w-[50px] text-center">
                                        <span className="text-xs font-mono font-bold text-[#2C2018]">
                                          {currentCount}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-400">
                                          /{targetGoal}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleStepProgress(habit.id, 1)}
                                        className="w-6 h-6 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition shadow-2xs"
                                        title="Increment count"
                                      >
                                        <Plus className="w-3 h-3 text-[#94A47A]" />
                                      </button>
                                    </div>

                                    {/* 7-day mini dots */}
                                    <div className="hidden md:flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded-lg border border-neutral-100">
                                      {last7Days.map((d) => {
                                        const dCount = getHabitCountForDate(habit.id, d.dateStr);
                                        const done = dCount >= targetGoal;
                                        const partial = dCount > 0 && dCount < targetGoal;

                                        return (
                                          <div
                                            key={d.dateStr}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                                              done
                                                ? 'bg-[#94A47A]'
                                                : partial
                                                ? 'bg-[#C67C58]'
                                                : d.isToday
                                                ? 'border border-neutral-400 bg-transparent'
                                                : 'bg-neutral-200'
                                            }`}
                                            title={`${d.dayName}: ${dCount}/${targetGoal} ${habit.unit || 'times'}`}
                                          />
                                        );
                                      })}
                                    </div>

                                    {/* Delete button */}
                                    <button
                                      onClick={() => onDeleteHabit(habit.id)}
                                      className="p-1.5 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Remove habit"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Progress Bar for multi-frequency habits */}
                                {targetGoal > 1 && (
                                  <div className="mt-2.5 pt-2 border-t border-neutral-100/80 flex items-center gap-3">
                                    <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                          width: `${progressPct}%`,
                                          backgroundColor: progressPct >= 100 ? '#627546' : progressPct > 0 ? '#94A47A' : '#E5E5E5',
                                        }}
                                      />
                                    </div>
                                    <span className="text-[9.5px] font-mono font-medium text-neutral-500 shrink-0">
                                      {progressPct}% ({currentCount} {habit.unit || 'times'})
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick preset habit ideas inspiration rack */}
          <div className="bg-[#F4ECDD]/60 border border-neutral-200/60 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10.5px] font-serif font-bold text-[#2C2018] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C67C58]" />
              Quick Positive Ideas to Add
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_HABIT_IDEAS.map((idea) => {
                const alreadyAdded = habits.some(
                  (h) => h.title.toLowerCase() === idea.title.toLowerCase()
                );
                return (
                  <button
                    key={idea.title}
                    disabled={alreadyAdded}
                    onClick={() => handleQuickAdd(idea)}
                    className={`text-[10px] font-sans px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 ${
                      alreadyAdded
                        ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-default'
                        : 'bg-white hover:bg-[#EFE4D2] text-[#2C2018] border-neutral-200/80 shadow-2xs'
                    }`}
                  >
                    <span className="text-[8.5px] uppercase tracking-wider font-bold text-neutral-400">
                      {idea.category}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span>{idea.title} ({idea.targetFrequency} {idea.unit})</span>
                    {alreadyAdded ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <Plus className="w-2.5 h-2.5 text-[#94A47A]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: 7-Day Consistency Grid & Philosophy */}
        <div className="space-y-4">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-neutral-200/70 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#94A47A]" />
              <h4 className="font-serif text-xs font-bold text-[#2C2018]">
                7-Day Consistency Glance
              </h4>
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {last7Days.map((d) => {
                const completedOnDay = habits.filter((h) => {
                  const target = Math.max(1, h.targetFrequency || 1);
                  const count = getHabitCountForDate(h.id, d.dateStr);
                  return count >= target;
                }).length;

                return (
                  <div
                    key={d.dateStr}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border transition ${
                      d.isToday
                        ? 'bg-[#EFE4D2] border-[#94A47A]/50 font-bold'
                        : 'bg-neutral-50/60 border-neutral-100'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400">
                      {d.dayName}
                    </span>
                    <span className="text-[11px] text-[#2C2018] font-mono my-0.5">
                      {d.dayNumber}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center mt-1 text-[8.5px] font-mono ${
                        completedOnDay > 0
                           ? 'bg-[#94A47A] text-white font-bold'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {completedOnDay}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] font-serif italic text-neutral-500 leading-relaxed pt-2 border-t border-neutral-100">
              Numbers represent the count of positive daily target goals fulfilled on each day.
            </p>
          </div>

          {/* Gentle Philosophy Card */}
          <div className="p-4 bg-[#F4ECDD] rounded-2xl border border-neutral-200/60 space-y-2 relative overflow-hidden">
            <div className="washi-tape washi-tape-sage -top-2 right-4" />
            <span className="text-[11px] font-serif font-bold text-[#2C2018] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#C67C58]" /> The Philosophy of Tiny Steps
            </span>
            <p className="text-[10.5px] text-neutral-600 leading-relaxed font-sans">
              "We often overestimate what we need to change in a day, and underestimate the power of drinking a few glasses of water or taking three conscious breaths."
            </p>
            <p className="text-[9.5px] text-neutral-400 font-mono">
              Never punish partial progress. Every single count is an act of care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitsSection;
