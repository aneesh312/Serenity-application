/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  role: 'user' | 'serenity';
  text: string;
  timestamp: string;
}

export interface CompanionResponse {
  text: string;
  isCrisis: boolean;
  suggestions?: string[];
}

export type JournalType = 'free' | 'voice' | 'gratitude' | 'dream' | 'sketch';

export interface JournalEntry {
  id: string;
  text: string;
  mood: 'peaceful' | 'anxious' | 'sad' | 'tired' | 'restless' | 'neutral' | 'grateful' | 'hopeful';
  date: string;
  type?: JournalType;
  title?: string;
  gratitudeItems?: string[];
  sketchData?: string; // canvas drawing or color mood
  aiReflection?: string;
}

export type SoundscapeId =
  | 'null-void'
  | 'ocean-serenity'
  | 'forest-presence'
  | 'rain-sanctuary'
  | 'hearth-calm'
  | 'deep-sleep';

export interface SoundscapeEnvironment {
  id: SoundscapeId;
  name: string;
  subtitle: string;
  description: string;
  emotion: string;
  iconName: string;
  primaryFrequency: number;
  secondaryFrequency: number;
  natureFilterFreq: number;
  noiseType: 'airy' | 'waves' | 'leaves' | 'rain' | 'crackle' | 'cosmic';
  palette: {
    bg: string;
    card: string;
    text: string;
    accent: string;
    glow: string;
  };
}

export type MeditationCategory =
  | 'peace-null-void'
  | 'self-love-healing'
  | 'letting-go'
  | 'gratitude'
  | 'focus-deep-work'
  | 'sleep-drift';

export interface MeditationStage {
  id: string;
  title: string;
  guidanceText: string;
  durationSeconds: number; // typical recommended duration
  breathingPacing?: {
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
  affirmation?: string;
  visualization?: string;
}

export interface MeditationSession {
  id: MeditationCategory;
  title: string;
  categoryName: string;
  destinationName: string;
  subtitle: string;
  recommendedFor: string;
  soundscape: SoundscapeId;
  soundFrequencyHz: number;
  colorPalette: {
    primary: string;
    accent: string;
    bgGradient: string;
    cardBg: string;
  };
  breathingPattern: {
    name: string;
    inhale: number;
    holdIn: number;
    exhale: number;
    holdOut: number;
  };
  stages: MeditationStage[];
}

export interface ConsentedMemory {
  id: string;
  key: string;
  value: string;
  category: 'personal' | 'grounding' | 'preference' | 'milestone' | 'exam' | 'family';
  addedAt: string;
}

export interface TrustedContact {
  name: string;
  phone: string;
  relationship: string;
}

export type SanctuaryId = 'misty-forest' | 'warm-hearth' | 'deep-ocean' | 'cozy-dusk' | 'null-void-dark';

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
  audioDroneFreq: number; // Hz for ambient synth
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  timesOfDay: string[]; // e.g. ["08:00", "20:00"] or ["As-Needed"]
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  notes?: string;
  startDate: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  timeOfDay: string;
  takenAt: string; // ISO string
  date: string; // YYYY-MM-DD
}

export type MilestoneMetric = 'streak' | 'journals' | 'breathing' | 'moods' | 'meds' | 'meditations';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  metric: MilestoneMetric;
  threshold: number;
  sticker: 'leaf' | 'flower' | 'sun' | 'moon' | 'heart' | 'tea' | 'book' | 'candle' | 'cloud' | 'rain' | 'star' | 'feather';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyAffirmation {
  id: string;
  text: string;
  category: 'grounding' | 'compassion' | 'presence' | 'rest' | 'courage' | 'trust';
  reflectionPrompt?: string;
  author?: string;
}

export interface StoredDailyAffirmation {
  date: string; // YYYY-MM-DD
  affirmation: DailyAffirmation;
  favorited?: boolean;
}

export type HabitCategory = 'wellness' | 'social' | 'creative' | 'mind' | 'body' | 'routine';

export interface Habit {
  id: string;
  title: string;
  category?: HabitCategory;
  icon?: string; // e.g. 'droplet', 'sun', 'heart', 'sparkles', 'wind', 'coffee', 'book'
  targetFrequency?: number; // Daily goal, defaults to 1 if not specified
  unit?: string; // e.g. 'glasses', 'times', 'minutes', 'pages'
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  count?: number; // Numeric progress towards targetFrequency (defaults to 1)
  completedAt: string; // ISO string
}


