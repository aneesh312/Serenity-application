/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Message,
  JournalEntry,
  SanctuaryId,
  Sanctuary,
  CompanionResponse,
  Medication,
  DoseLog,
  ConsentedMemory,
  SoundscapeId,
  DailyAffirmation,
  Habit,
  HabitLog,
} from './types';
import { generateResponse, isCrisisMessage, CRISIS_TEXT, suggestActivities } from './lib/companion';
import CompanionCharacter, { CharacterExpression } from './components/CompanionCharacter';
import AmbientBackground from './components/AmbientBackground';
import BreathingEngine from './components/BreathingEngine';
import MeditationEngine from './components/MeditationEngine';
import ReflectionJournal from './ReflectionJournal';
import ProgressScreen from './screens/ProgressScreen';
import CareScreen from './screens/CareScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import ProfessionalSupportModal from './components/ProfessionalSupportModal';
import MemoryManagerModal from './components/MemoryManagerModal';
import AuthModal, { UserProfile } from './components/AuthModal';
import DailyAffirmationCard from './components/DailyAffirmation';
import globalSoundscape from './components/SoundscapeEngine';
import {
  Volume2,
  VolumeX,
  MessageSquare,
  BookOpen,
  Wind,
  Shield,
  Send,
  User,
  Heart,
  ChevronRight,
  Sparkles,
  TreePine,
  Flame,
  Waves,
  Sunset,
  AlertTriangle,
  LogOut,
  Clock,
  Award,
  Home,
  Sliders,
  Compass,
  Play,
  Volume1,
  Coffee,
  Check,
  Lock,
  Moon,
  Sun,
  Smile
} from 'lucide-react';

// Sanctuaries metadata mapping the requested 4 live wallpaper atmospheres
const SANCTUARIES: Sanctuary[] = [
  {
    id: 'misty-forest',
    name: 'Misty Bamboo Forest',
    colors: {
      bg: 'bg-[#94A47A]/10',
      card: 'bg-white/90',
      text: 'text-[#2C2018]',
      accent: '#94A47A', // Sage
      glow: 'shadow-[#94A47A]/10',
    },
    audioDroneFreq: 110, // low A
  },
  {
    id: 'cozy-dusk',
    name: 'Sunset Sanctuary',
    colors: {
      bg: 'bg-[#D3A29A]/10',
      card: 'bg-white/90',
      text: 'text-[#2C2018]',
      accent: '#D3A29A', // Dusty Rose
      glow: 'shadow-[#D3A29A]/10',
    },
    audioDroneFreq: 135, // Low C#
  },
  {
    id: 'deep-ocean',
    name: 'Starry Night Meadow',
    colors: {
      bg: 'bg-[#2C2018]/5',
      card: 'bg-white/95',
      text: 'text-[#2C2018]',
      accent: '#C67C58', // Terracotta
      glow: 'shadow-[#C67C58]/15',
    },
    audioDroneFreq: 165, // Low E
  },
  {
    id: 'warm-hearth',
    name: 'Cozy Crackling Hearth',
    colors: {
      bg: 'bg-[#C67C58]/10',
      card: 'bg-white/90',
      text: 'text-[#2C2018]',
      accent: '#C67C58', // Terracotta
      glow: 'shadow-[#C67C58]/20',
    },
    audioDroneFreq: 120, // warm drone
  },
];

const MOOD_PILLS = [
  { label: 'Peaceful', color: 'bg-emerald-500' },
  { label: 'Calm', color: 'bg-teal-400' },
  { label: 'Content', color: 'bg-orange-300' },
  { label: 'Happy', color: 'bg-yellow-400' },
  { label: 'Anxious', color: 'bg-purple-400' },
  { label: 'Tender', color: 'bg-pink-400' },
  { label: 'Heavy', color: 'bg-stone-400' },
  { label: 'Hopeful', color: 'bg-amber-400' },
  { label: 'Restless', color: 'bg-red-400' },
  { label: 'Sad', color: 'bg-sky-400' },
  { label: 'Grateful', color: 'bg-rose-400' },
  { label: 'Tired', color: 'bg-indigo-400' },
];

export default function App() {
  // PERSISTED USER PROFILE
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('serenity_user_name') || '';
  });

  // PERSISTED APP DATA STATES
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('serenity_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [journals, setJournals] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('serenity_journal_entries');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSanctuaryId, setActiveSanctuaryId] = useState<SanctuaryId>(() => {
    return (localStorage.getItem('serenity_active_sanctuary') as SanctuaryId) || 'misty-forest';
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('serenity_medications');
    return saved ? JSON.parse(saved) : [];
  });
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('serenity_dose_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('serenity_habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading habits', e);
      }
    }
    return [
      {
        id: 'habit-water',
        title: 'Drink water',
        category: 'wellness',
        icon: 'droplet',
        targetFrequency: 8,
        unit: 'glasses',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-social',
        title: 'Send a loving check-in text',
        category: 'social',
        icon: 'smile',
        targetFrequency: 1,
        unit: 'times',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-creative',
        title: '10-min freeform sketching or writing',
        category: 'creative',
        icon: 'book',
        targetFrequency: 10,
        unit: 'minutes',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-stretch',
        title: 'Stretched for 5 minutes',
        category: 'body',
        icon: 'wind',
        targetFrequency: 1,
        unit: 'times',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-light',
        title: 'Basked in morning sunlight',
        category: 'routine',
        icon: 'sun',
        targetFrequency: 1,
        unit: 'times',
        createdAt: new Date().toISOString(),
      },
    ];
  });
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem('serenity_habit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize any old logs without count
        return parsed.map((l: any) => ({
          ...l,
          count: typeof l.count === 'number' ? l.count : 1,
        }));
      } catch (e) {
        console.error('Error loading habit logs', e);
      }
    }
    return [];
  });
  const [breathingSessionsCount, setBreathingSessionsCount] = useState<number>(() => {
    return Number(localStorage.getItem('serenity_breathing_sessions_count') || '0');
  });
  const [checkInDates, setCheckInDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('serenity_check_in_dates');
    return saved ? JSON.parse(saved) : [];
  });
  const [todayCheckedInMood, setTodayCheckedInMood] = useState<string>(() => {
    return localStorage.getItem('serenity_today_checked_in_mood') || '';
  });
  const [consentedMemories, setConsentedMemories] = useState<ConsentedMemory[]>(() => {
    const saved = localStorage.getItem('serenity_consented_memories');
    return saved ? JSON.parse(saved) : [];
  });

  // TRANSIENT APP STATES - Updated to 8 tabs matching mock design screenshots
  const [activeTab, setActiveTab] = useState<'home' | 'talk' | 'journal' | 'breathe' | 'activities' | 'progress' | 'care' | 'settings'>('home');
  const [breatheSubTab, setBreatheSubTab] = useState<'breathing' | 'meditation'>('breathing');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [journalInitialPrompt, setJournalInitialPrompt] = useState<string>('');

  const handleReflectAffirmation = (aff: DailyAffirmation) => {
    setJournalInitialPrompt(aff.reflectionPrompt ? `${aff.text} — ${aff.reflectionPrompt}` : aff.text);
    setActiveTab('journal');
  };
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('serenity_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [characterExpression, setCharacterExpression] = useState<CharacterExpression>('idle');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [soundscapeOn, setSoundscapeOn] = useState(false);
  const [rainLevel, setRainLevel] = useState(0.4);
  const [onboardingInput, setOnboardingInput] = useState('');

  // TEXT-TO-SPEECH VOICE SELECTION STATES
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('serenity_selected_voice') || '';
  });

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter primarily for English or active localized voices
      const englishVoices = allVoices.filter(v => v.lang.startsWith('en') || v.default);
      setVoices(englishVoices.length > 0 ? englishVoices : allVoices);
    };

    updateVoices();
    // Chrome / Safari load voices asynchronously
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceName) {
      // Find a premium or friendly natural sounding default voice
      const bestVoice = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Premium') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('Aria') ||
          v.name.includes('Zira')
      ) || voices[0];
      
      if (bestVoice) {
        setSelectedVoiceName(bestVoice.name);
      }
    }
  }, [voices, selectedVoiceName]);

  useEffect(() => {
    if (selectedVoiceName) {
      localStorage.setItem('serenity_selected_voice', selectedVoiceName);
    }
  }, [selectedVoiceName]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Derive active sanctuary
  const activeSanctuary = SANCTUARIES.find((s) => s.id === activeSanctuaryId) || SANCTUARIES[0];

  // Track daily check-in
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (userName && !checkInDates.includes(todayStr)) {
      setCheckInDates((prev) => [...prev, todayStr]);
    }
  }, [userName, checkInDates]);

  // Streak Calculator
  const calculateStreak = () => {
    if (checkInDates.length === 0) return 0;
    
    // Sort unique dates in descending order (newest first)
    const uniqueDates = Array.from(new Set(checkInDates)) as string[];
    const sortedDates = uniqueDates.sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split('T')[0];
    
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // If neither today nor yesterday is present, streak is reset to 0/1
    if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
      return 0;
    }
    
    let streakCount = 0;
    let currentDate = sortedDates.includes(todayStr) ? new Date() : yesterday;
    
    while (true) {
      const currentStr = currentDate.toISOString().split('T')[0];
      if (sortedDates.includes(currentStr)) {
        streakCount++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streakCount;
  };

  const streak = calculateStreak();
  const moodDaysCount = new Set(journals.map((j) => j.date.split('T')[0])).size;
  const medsTakenCount = doseLogs.length;

  const handleAddMedication = (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setDoseLogs((prev) => prev.filter((log) => log.medicationId !== id));
  };

  const handleToggleDose = (medicationId: string, timeOfDay: string, date: string) => {
    const existingLogIndex = doseLogs.findIndex(
      (log) =>
        log.medicationId === medicationId &&
        log.timeOfDay === timeOfDay &&
        log.date === date
    );

    if (existingLogIndex >= 0) {
      setDoseLogs((prev) => prev.filter((_, i) => i !== existingLogIndex));
    } else {
      const newLog: DoseLog = {
        id: `dose-${Date.now()}`,
        medicationId,
        timeOfDay,
        date,
        takenAt: new Date().toISOString(),
      };
      setDoseLogs((prev) => [...prev, newLog]);
    }
  };

  const handleAddHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitLogs((prev) => prev.filter((log) => log.habitId !== id));
  };

  const handleToggleHabit = (habitId: string, date: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    const targetGoal = Math.max(1, targetHabit?.targetFrequency || 1);

    const existingLogIndex = habitLogs.findIndex(
      (log) => log.habitId === habitId && log.date === date
    );

    if (existingLogIndex >= 0) {
      const currentLog = habitLogs[existingLogIndex];
      const currentCount = currentLog.count ?? 1;

      // If already fully completed or goal met, toggle back off to 0
      if (currentCount >= targetGoal) {
        setHabitLogs((prev) => prev.filter((_, i) => i !== existingLogIndex));
      } else {
        // Increment count towards targetGoal
        const updatedLogs = [...habitLogs];
        updatedLogs[existingLogIndex] = {
          ...currentLog,
          count: currentCount + 1,
          completedAt: new Date().toISOString(),
        };
        setHabitLogs(updatedLogs);
      }
    } else {
      // First log for this date: if target is 1, mark 1 (done). If target > 1, start with 1 step.
      const newLog: HabitLog = {
        habitId,
        date,
        count: 1,
        completedAt: new Date().toISOString(),
      };
      setHabitLogs((prev) => [...prev, newLog]);
    }
  };

  const handleUpdateHabitProgress = (habitId: string, date: string, delta: number) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    const targetGoal = Math.max(1, targetHabit?.targetFrequency || 1);

    const existingLogIndex = habitLogs.findIndex(
      (log) => log.habitId === habitId && log.date === date
    );

    if (existingLogIndex >= 0) {
      const currentLog = habitLogs[existingLogIndex];
      const currentCount = currentLog.count ?? 1;
      const nextCount = Math.max(0, currentCount + delta);

      if (nextCount === 0) {
        setHabitLogs((prev) => prev.filter((_, i) => i !== existingLogIndex));
      } else {
        const updatedLogs = [...habitLogs];
        updatedLogs[existingLogIndex] = {
          ...currentLog,
          count: nextCount,
          completedAt: new Date().toISOString(),
        };
        setHabitLogs(updatedLogs);
      }
    } else if (delta > 0) {
      const newLog: HabitLog = {
        habitId,
        date,
        count: delta,
        completedAt: new Date().toISOString(),
      };
      setHabitLogs((prev) => [...prev, newLog]);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    if (userName) {
      localStorage.setItem('serenity_user_name', userName);
    } else {
      localStorage.removeItem('serenity_user_name');
    }
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('serenity_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('serenity_journal_entries', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('serenity_active_sanctuary', activeSanctuaryId);
  }, [activeSanctuaryId]);

  useEffect(() => {
    localStorage.setItem('serenity_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('serenity_dose_logs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  useEffect(() => {
    localStorage.setItem('serenity_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('serenity_habit_logs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  useEffect(() => {
    localStorage.setItem('serenity_breathing_sessions_count', String(breathingSessionsCount));
  }, [breathingSessionsCount]);

  useEffect(() => {
    localStorage.setItem('serenity_check_in_dates', JSON.stringify(checkInDates));
  }, [checkInDates]);

  useEffect(() => {
    localStorage.setItem('serenity_today_checked_in_mood', todayCheckedInMood);
  }, [todayCheckedInMood]);

  useEffect(() => {
    localStorage.setItem('serenity_consented_memories', JSON.stringify(consentedMemories));
  }, [consentedMemories]);

  const handleAddMemory = (memory: Omit<ConsentedMemory, 'id' | 'addedAt'>) => {
    const newMem: ConsentedMemory = {
      ...memory,
      id: `mem-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    setConsentedMemories((prev) => [newMem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setConsentedMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    setConsentedMemories([]);
  };

  // Handle ambient soundscape transitions
  useEffect(() => {
    if (soundscapeOn) {
      const soundscapeMap: Record<SanctuaryId, SoundscapeId> = {
        'warm-hearth': 'hearth-calm',
        'misty-forest': 'forest-presence',
        'deep-ocean': 'ocean-serenity',
        'cozy-dusk': 'null-void',
        'null-void-dark': 'null-void',
      };
      const scId = soundscapeMap[activeSanctuary.id] || 'null-void';
      globalSoundscape.start(scId);
      globalSoundscape.setRainLevel(rainLevel);
    } else {
      globalSoundscape.stop();
    }
  }, [soundscapeOn, activeSanctuary.id]);

  useEffect(() => {
    if (soundscapeOn) {
      globalSoundscape.setRainLevel(rainLevel);
    }
  }, [rainLevel, soundscapeOn]);

  // Stop soundscapes on unmount
  useEffect(() => {
    return () => {
      globalSoundscape.stop();
    };
  }, []);

  // Scroll to bottom of chat logs
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Sync character expression to Tab
  useEffect(() => {
    if (activeTab === 'breathe') {
      setCharacterExpression('breathing');
    } else if (activeTab === 'journal' || activeTab === 'progress' || activeTab === 'care' || activeTab === 'home') {
      setCharacterExpression('warm_smile');
    } else {
      setCharacterExpression('idle');
    }
  }, [activeTab]);

  // TEXT-TO-SPEECH (TTS) Engine
  const speakTherapeuticResponse = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any current speech

    // Remove any special text formatting or URLs before speech
    const cleanText = text.replace(/[*#]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.90; // Gentle, comforting slow pacing
    utterance.pitch = 1.0; // Comforting, warm neutral frequency

    // Try to find the user's selected voice, or fall back to high quality ones
    let targetVoice = voices.find((v) => v.name === selectedVoiceName);
    if (!targetVoice) {
      targetVoice = voices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Premium') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('Aria') ||
          v.name.includes('Zira') ||
          v.lang === 'en-US'
      );
    }
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => setCharacterExpression('speaking');
    utterance.onend = () => setCharacterExpression('idle');
    utterance.onerror = () => setCharacterExpression('idle');

    window.speechSynthesis.speak(utterance);
  };

  // HANDLERS
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingInput.trim()) return;

    const finalName = onboardingInput.trim();
    setUserName(finalName);

    // Seed welcoming companion message from Serenity (previously Sam)
    const welcomeMsg: Message = {
      id: 'welcome-1',
      role: 'serenity',
      text: `Hi ${finalName}, I'm Serenity. I'm so glad you found your way to this sanctuary. Here, you are free to speak your mind, vent about your day, or just rest. Your secrets are completely safe with me, and I will always listen without judgment. How are you really doing today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    speakTherapeuticResponse(welcomeMsg.text);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Stop ongoing speech
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    setCharacterExpression('listening');

    // Build companion response
    const contextHistory = messages.slice(-12);

    // Call dynamic LLM generation through our server-side Express proxy
    const response = await generateResponse(textToSend, contextHistory, userName);

    setIsTyping(false);

    const companionMsg: Message = {
      id: `msg-${Date.now()}-serenity`,
      role: 'serenity',
      text: response.text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, companionMsg]);

    // Update expressions dynamically
    if (response.isCrisis) {
      setCharacterExpression('crisis');
    } else {
      setCharacterExpression('warm_smile');
      setTimeout(() => setCharacterExpression('idle'), 4000);
    }

    // Speak response
    speakTherapeuticResponse(response.text);
  };

  // Suggestions clicks
  const handlePillClick = (pill: string) => {
    if (pill === 'Start Calming Breath' || pill === 'Start 5-Minute Calming Breath' || pill === 'Let\'s practice a breathing cycle') {
      setActiveTab('breathe');
    } else if (pill === 'Write in Journal' || pill === 'Open Reflection Journal' || pill === 'Write in your journal') {
      setActiveTab('journal');
    } else if (pill === 'Grounding Ambient Synth' || pill === 'Can you help me ground myself?') {
      setSoundscapeOn(true);
      setActiveTab('activities');
    } else {
      // Send message in chat
      setActiveTab('talk');
      handleSendMessage(pill);
    }
  };

  // Journal entries
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setJournals((prev) => [newEntry, ...prev]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== id));
  };

  const handleUpdateEntryReflection = (id: string, reflection: string) => {
    setJournals((prev) =>
      prev.map((j) => (j.id === id ? { ...j, aiReflection: reflection } : j))
    );
  };

  const handleShareJournalWithSerenity = (text: string) => {
    setActiveTab('talk');
    handleSendMessage(`I wanted to share a private journal entry I wrote today: "${text}"`);
  };

  // Reset/Clear conversation history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history? Your profile name will be saved.')) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      const resetMsg: Message = {
        id: `msg-${Date.now()}-reset`,
        role: 'serenity',
        text: `The slate is clean, ${userName}. I'm here whenever you're ready to start fresh. How can I support you right now?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([resetMsg]);
    }
  };

  // Mood pill click from home screen
  const handleMoodCheckIn = (moodLabel: string) => {
    setTodayCheckedInMood(moodLabel);
    // Serenity gives a warm, instant clinical peer validation voice response
    const comfortingMessages: Record<string, string> = {
      Peaceful: `I'm so glad you are experiencing a moment of peace, ${userName}. Breathe it in, and let this calm space embrace you.`,
      Calm: `Calmness is a gentle anchor. Let's rest here in the stillness together, ${userName}.`,
      Content: `Contentment is a beautiful, humble victory. I'm so happy to share this warm quiet with you.`,
      Happy: `Your joy is beautiful! Feel free to bask in this warm sunshine, and remember this feeling, ${userName}.`,
      Anxious: `I hear you, ${userName}. It is completely okay and natural to feel anxious. We can slow everything down, there is no rush here.`,
      Tender: `Tenderness means your heart is open and feeling deeply. Be very gentle with yourself right now.`,
      Heavy: `When things feel heavy, you don't have to lift them alone. You can just rest your spirit right here.`,
      Hopeful: `Hope is like a soft green leaf reaching for light. It's a beautiful feeling to hold onto.`,
      Restless: `Restlessness is just energy waiting for a gentle path. Let's try a comforting breath cycle when you're ready.`,
      Sad: `It's okay to feel sad, ${userName}. Heavy clouds are a natural part of the sky. I am right here with you in the quiet.`,
      Grateful: `Gratitude warms the soul from inside out. Thank you for sharing your warm heart with me today.`,
      Tired: `You've carried so much today. Go ahead and close your eyes or let your body go soft. You are safe to rest.`,
    };

    const responseText = comfortingMessages[moodLabel] || `Thank you for sharing how you feel, ${userName}. I am right here with you.`;
    speakTherapeuticResponse(responseText);
  };

  // Render onboarding if user name is not defined
  if (!userName) {
    return (
      <div className="min-h-screen bg-[#F4ECDD] flex items-center justify-center p-6 text-[#2C2018] relative overflow-hidden font-sans">
        {/* String lights / glowing nodes decoration */}
        <div className="absolute top-0 inset-x-0 h-40 flex justify-around pointer-events-none opacity-40">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-[1px] h-12 bg-neutral-400" />
              <div className="w-2.5 h-2.5 bg-amber-300 rounded-full shadow-[0_0_8px_#f59e0b] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="max-w-md w-full relative">
          {/* Card with washi-tape */}
          <div className="p-8 bg-[#EFE4D2] border border-neutral-200 rounded-[32px] shadow-lg relative text-center space-y-6">
            <div className="washi-tape washi-tape-sage" />

            <div className="space-y-2 mt-4">
              <h1 className="font-serif text-3xl font-bold tracking-tight">Welcome to Serenity</h1>
              <p className="font-serif italic text-xs text-[#C67C58]">
                A quiet, offline-first peer-support sanctuary for your mind.
              </p>
            </div>

            <div className="w-28 h-28 mx-auto bg-white/40 rounded-full flex items-center justify-center border border-neutral-200">
              <CompanionCharacter expression="warm_smile" accentColor="#94A47A" />
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 font-sans text-left pl-1">
                  How should I address you, friend?
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your preferred name..."
                  value={onboardingInput}
                  onChange={(e) => setOnboardingInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-300 bg-white text-xs text-[#2C2018] focus:outline-none focus:ring-1 focus:ring-[#94A47A]"
                />
              </div>

              <button
                type="submit"
                disabled={!onboardingInput.trim()}
                className="w-full py-3 bg-[#94A47A] hover:bg-[#86956e] disabled:opacity-40 text-white rounded-2xl text-xs font-semibold shadow transition"
              >
                Step inside the Sanctuary
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-200/40 text-[10px] text-neutral-400 leading-relaxed font-serif italic">
              Your entries, reflections, and chat messages are encrypted locally and never transferred to any remote servers. You are completely safe.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4ECDD] text-[#2C2018] relative flex flex-col justify-between overflow-x-hidden font-sans pb-24">
      
      {/* Drifting particle lights */}
      <AmbientBackground sanctuaryId={activeSanctuaryId} accentColor={activeSanctuary.colors.accent} />

      {/* Decorative hanging garland string lights (replicating mock screen 1) */}
      <div className="absolute top-0 inset-x-0 h-10 flex justify-around pointer-events-none opacity-40 z-20">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[1px] h-6 bg-neutral-400/80" />
            <div className="w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_6px_#f59e0b] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Top Banner Row (Streak Tracker & Quick Tools) */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-lg font-bold tracking-tight text-[#2C2018]">Serenity</h1>
          <span className="text-[10px] bg-[#94A47A]/20 text-[#2C2018] font-serif italic px-2.5 py-0.5 rounded-full">
            Sanctuary Mode
          </span>
        </div>

        {/* Dynamic Streak Board & Quick SOS / Memory / Account triggers */}
        <div className="flex items-center gap-2">
          {/* Account / Cloud Sync Pill */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-2.5 py-1 bg-white hover:bg-neutral-50 border border-neutral-200/80 text-[#2C2018] rounded-full text-[10px] font-serif flex items-center gap-1.5 shadow-2xs transition"
            title="Google / Cloud Account & Sync Settings"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-3.5 h-3.5 rounded-full object-cover" />
            ) : (
              <User className="w-3 h-3 text-[#818cf8]" />
            )}
            <span className="font-medium">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
          </button>

          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
            title="Immediate Crisis & Professional Support Hub"
          >
            <Shield className="w-3 h-3 text-red-600" /> SOS Hub
          </button>

          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-2.5 py-1 bg-[#F4ECDD] hover:bg-[#EFE4D2] border border-neutral-200/80 text-[#2C2018] rounded-full text-[10px] font-serif italic flex items-center gap-1 shadow-xs transition"
            title="Serenity's Consented Memories"
          >
            <Sparkles className="w-3 h-3 text-[#C67C58]" /> Memories
          </button>

          <div className="px-3 py-1 bg-[#EFE4D2] border border-neutral-200/60 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-xs">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
            <span className="font-serif italic text-neutral-700">
              {streak} {streak === 1 ? 'day streak' : 'days streak'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN SCREEN GRID PANEL */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 flex-1 flex flex-col z-10 relative">
        
        <AnimatePresence mode="wait">
          
          {/* --- TAB 1: HOME SCREEN (The core cozy environment!) --- */}
          {activeTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="flex-1 flex flex-col items-center justify-between py-4"
            >
              {/* Cozy Editorial Greetings */}
              <div className="text-center space-y-1 mb-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                  Good day, {userName}
                </h2>
                <p className="font-serif italic text-xs text-[#C67C58]">
                  How are you feeling right now?
                </p>
              </div>

              {/* Character Cushion Frame */}
              <div className="relative w-full max-w-sm flex flex-col items-center justify-center py-4">
                {/* Round cozy rug cushion under the companion */}
                <div className="absolute bottom-4 w-40 h-8 bg-[#D3A29A]/30 rounded-full blur-[1px] border border-[#D3A29A]/10 shadow-inner" />
                <div className="w-40 h-40 z-10">
                  <CompanionCharacter expression={characterExpression} accentColor={activeSanctuary.colors.accent} />
                </div>
              </div>

              {/* Daily Affirmation Card (Locked for the day via localized state) */}
              <DailyAffirmationCard
                onReflect={handleReflectAffirmation}
                accentColor={activeSanctuary.colors.accent}
              />

              {/* 12 Mood Pills Grid Section (Replicating Screenshot 1) */}
              <div className="w-full max-w-xl bg-white/70 backdrop-blur-md p-6 border border-neutral-200/50 rounded-[28px] shadow-sm relative space-y-4">
                <div className="washi-tape washi-tape-sage" />
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 text-center">
                  Select a feeling to check-in
                </h4>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {MOOD_PILLS.map((m) => {
                    const active = todayCheckedInMood === m.label;
                    return (
                      <button
                        key={m.label}
                        onClick={() => handleMoodCheckIn(m.label)}
                        className={`px-2.5 py-2 rounded-full border text-[11px] font-serif transition flex items-center justify-center gap-1.5 ${
                          active
                            ? 'bg-[#94A47A] text-white border-[#94A47A] font-medium shadow-sm'
                            : 'bg-white/90 hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {todayCheckedInMood && (
                  <div className="text-center pt-2">
                    <p className="text-[11px] italic font-serif text-[#C67C58]">
                      Checked in today as: <span className="font-bold underline">{todayCheckedInMood}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- TAB 2: TALK SCREEN (Companion chat with washi bubbles) --- */}
          {activeTab === 'talk' && (
            <motion.div
              key="tab-talk"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col gap-4 bg-white/80 backdrop-blur-md p-5 sm:p-6 border border-neutral-200/50 rounded-[32px] shadow-md min-h-0"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F4ECDD] rounded-full border border-neutral-200 p-0.5 shrink-0">
                    <CompanionCharacter expression={characterExpression} accentColor={activeSanctuary.colors.accent} />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#2C2018]">Serenity</h3>
                    <p className="text-[10px] font-serif italic text-neutral-400">always here with you</p>
                  </div>
                </div>

                {/* Subheader Voice toggle & clear history button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`px-3 py-1 border rounded-full text-[10px] font-semibold transition ${
                      ttsEnabled
                        ? 'bg-[#94A47A] text-white border-[#94A47A]'
                        : 'bg-white border-neutral-200 text-neutral-500'
                    }`}
                  >
                    Voice: {ttsEnabled ? 'On' : 'Mute'}
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-1 border border-neutral-200 hover:bg-neutral-50 rounded-full text-[10px] text-neutral-500"
                  >
                    Clear Slate
                  </button>
                </div>
              </div>

              {/* Atmosphere Panel (Replicating Screenshot 2 options box) */}
              <div className="p-4 bg-[#F4ECDD]/60 rounded-2xl border border-neutral-200/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Sanctuary pickers */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-[#C67C58]">
                    Live Wallpaper & Atmosphere:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SANCTUARIES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSanctuaryId(s.id)}
                        className={`px-2.5 py-1 border rounded-full text-[10px] transition ${
                          activeSanctuaryId === s.id
                            ? 'bg-[#94A47A] text-white border-[#94A47A] font-semibold'
                            : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {s.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ambient Drone Sound control */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-[#C67C58]">
                    Background Sound While Chatting:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSoundscapeOn(false)}
                      className={`px-2.5 py-1 border rounded-full text-[10px] transition ${
                        !soundscapeOn
                          ? 'bg-[#94A47A] text-white border-[#94A47A] font-semibold'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      Mute
                    </button>
                    <button
                      onClick={() => {
                        setSoundscapeOn(true);
                        setRainLevel(0);
                      }}
                      className={`px-2.5 py-1 border rounded-full text-[10px] transition ${
                        soundscapeOn && rainLevel === 0
                          ? 'bg-[#94A47A] text-white border-[#94A47A] font-semibold'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      Kettle Drone
                    </button>
                    <button
                      onClick={() => {
                        setSoundscapeOn(true);
                        setRainLevel(0.4);
                      }}
                      className={`px-2.5 py-1 border rounded-full text-[10px] transition ${
                        soundscapeOn && rainLevel > 0
                          ? 'bg-[#94A47A] text-white border-[#94A47A] font-semibold'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      Gentle Rain
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Message Panel */}
              <div className="flex-1 overflow-y-auto min-h-[240px] max-h-[480px] md:max-h-[600px] pr-1 space-y-4 scrollbar-thin flex flex-col pt-2">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isCrisis = !isUser && m.text === CRISIS_TEXT;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col relative ${isUser ? 'items-end' : 'items-start pl-3'}`}
                    >
                      {/* Washi tape tab accent on the top-left of the chat card (Screenshot 2 design) */}
                      {!isUser && (
                        <div className="washi-tape top-[-4px] left-[16px] w-8 h-3 opacity-65" />
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm border relative ${
                          isUser
                            ? 'bg-[#94A47A] text-white border-[#94A47A]/30 rounded-tr-none'
                            : 'bg-[#F4ECDD] text-[#2C2018] border-neutral-200/60 rounded-tl-none pt-4'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        
                        {!isUser && (
                          <button
                            onClick={() => speakTherapeuticResponse(m.text)}
                            className="mt-2 text-[9px] font-serif italic text-[#C67C58] hover:underline flex items-center gap-1"
                            title="Replay Voice Reading"
                          >
                            <Volume2 className="w-3 h-3" /> Listen to voice
                          </button>
                        )}
                      </div>

                      {/* Timestamp and name tags */}
                      <div className="flex items-center gap-2 mt-1 px-1.5">
                        <span className="text-[9px] text-neutral-400 font-medium font-serif italic">
                          {isUser ? userName : 'Serenity'}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-light flex items-center gap-0.5 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(m.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Distress Crisis Card */}
                      {isCrisis && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-5 bg-red-50 border border-red-200 rounded-3xl max-w-md flex flex-col gap-3 text-left self-start shadow"
                        >
                          <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> Immediate Care Resources
                          </div>
                          <p className="text-[10.5px] text-red-800 leading-relaxed">
                            Please reach out to these confidential, free services staffed by caring human counselors 24/7:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1">
                            <div className="p-3 bg-white rounded-xl border border-red-100 flex flex-col">
                              <span className="font-bold text-red-950 text-[11px]">National Suicide Lifeline</span>
                              <a href="tel:988" className="text-red-600 font-bold hover:underline mt-1">
                                Call or Text 988
                              </a>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-red-100 flex flex-col">
                              <span className="font-bold text-red-950 text-[11px]">Crisis Text Line</span>
                              <a href="https://www.crisistextline.org/" target="_blank" rel="noreferrer" className="text-red-600 font-bold hover:underline text-left mt-1">
                                Text HOME to 741741
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex flex-col items-start pl-3 relative">
                    <div className="washi-tape top-[-4px] left-[16px] w-8 h-3 opacity-45" />
                    <div className="bg-[#F4ECDD] text-[#2C2018] border border-neutral-200/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 pt-4">
                      <span className="text-[10px] text-neutral-400 italic font-medium font-serif">Serenity is typing</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions activity pills */}
              {messages.length > 0 && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100/60 justify-center">
                  {messages[messages.length - 1].role === 'user' && suggestActivities(messages[messages.length - 1].text) ? (
                    suggestActivities(messages[messages.length - 1].text)?.map((pill) => (
                      <button
                        key={pill}
                        onClick={() => handlePillClick(pill)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-full text-[10px] font-semibold transition shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> {pill}
                      </button>
                    ))
                  ) : (
                    ['I feel a bit overwhelmed', 'Can you help me ground myself?', 'Tell me a comforting thought', 'Let\'s practice a breathing cycle'].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => handlePillClick(pill)}
                        className="px-3 py-1.5 bg-white/60 hover:bg-white text-neutral-500 hover:text-neutral-800 border border-neutral-200 rounded-full text-[10px] font-semibold transition"
                      >
                        {pill}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Message composing row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Speak to Serenity... Share what is on your mind..."
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#94A47A] bg-white text-[#2C2018]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 text-white rounded-2xl shadow transition-all disabled:opacity-40 shrink-0"
                  style={{ backgroundColor: activeSanctuary.colors.accent }}
                >
                  <Send className="w-4 h-4 fill-white" />
                </button>
              </form>
            </motion.div>
          )}

          {/* --- TAB 3: JOURNAL SCREEN (The book diary binder) --- */}
          {activeTab === 'journal' && (
            <motion.div
              key="tab-journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full bg-[#2C2018]/5 rounded-[32px] p-1.5 border border-neutral-200/40"
            >
              <ReflectionJournal
                entries={journals}
                onAddEntry={handleAddJournalEntry}
                onDeleteEntry={handleDeleteJournalEntry}
                onShareWithSerenity={handleShareJournalWithSerenity}
                onUpdateEntryReflection={handleUpdateEntryReflection}
                accentColor={activeSanctuary.colors.accent}
                initialPrompt={journalInitialPrompt}
              />
            </motion.div>
          )}

          {/* --- TAB 4: BREATHE / MEDITATE SCREEN --- */}
          {activeTab === 'breathe' && (
            <motion.div
              key="tab-breathing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full space-y-4"
            >
              {/* Sub-tab switcher */}
              <div className="flex justify-center">
                <div className="inline-flex p-1 bg-white/70 backdrop-blur-md rounded-full border border-neutral-200 shadow-sm">
                  <button
                    onClick={() => setBreatheSubTab('breathing')}
                    className={`px-4 py-1.5 rounded-full text-xs font-serif transition flex items-center gap-1.5 ${
                      breatheSubTab === 'breathing'
                        ? 'bg-[#2C2018] text-white font-bold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" /> Physiological Cycles
                  </button>
                  <button
                    onClick={() => setBreatheSubTab('meditation')}
                    className={`px-4 py-1.5 rounded-full text-xs font-serif transition flex items-center gap-1.5 ${
                      breatheSubTab === 'meditation'
                        ? 'bg-[#C67C58] text-white font-bold shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Guided Transcendence & Null Void
                  </button>
                </div>
              </div>

              {breatheSubTab === 'breathing' ? (
                <BreathingEngine
                  accentColor={activeSanctuary.colors.accent}
                  onCycleComplete={() => setBreathingSessionsCount((prev) => prev + 1)}
                  onStateChange={(state) => {
                    if (state === 'idle') setCharacterExpression('breathing');
                    else if (state === 'inhale') setCharacterExpression('breathing');
                    else if (state === 'hold') setCharacterExpression('listening');
                    else if (state === 'exhale') setCharacterExpression('speaking');
                  }}
                />
              ) : (
                <MeditationEngine
                  accentColor={activeSanctuary.colors.accent}
                  onSessionComplete={() => setBreathingSessionsCount((prev) => prev + 1)}
                />
              )}
            </motion.div>
          )}

          {/* --- TAB 5: ACTIVITIES SCREEN (NEW! Mindful tactile ceremonies) --- */}
          {activeTab === 'activities' && (
            <motion.div
              key="tab-activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ActivitiesScreen
                accentColor={activeSanctuary.colors.accent}
                onActivityDone={(name) => {
                  alert(`Wonderful! You successfully completed the ${name}. Your milestones progress has been updated.`);
                  setBreathingSessionsCount((prev) => prev + 1);
                }}
              />
            </motion.div>
          )}

          {/* --- TAB 6: PROGRESS SCREEN (With milestones & badges) --- */}
          {activeTab === 'progress' && (
            <motion.div
              key="tab-progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <ProgressScreen
                streak={streak}
                journalsCount={journals.length}
                breathingSessionsCount={breathingSessionsCount}
                moodDaysCount={moodDaysCount}
                medsTakenCount={medsTakenCount}
                habits={habits}
                habitLogs={habitLogs}
                onNavigateToCare={() => setActiveTab('care')}
                accentColor={activeSanctuary.colors.accent}
              />
            </motion.div>
          )}

          {/* --- TAB 7: CARE SCREEN (Directory + Medications) --- */}
          {activeTab === 'care' && (
            <motion.div
              key="tab-care"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <CareScreen
                medications={medications}
                onAddMedication={handleAddMedication}
                onDeleteMedication={handleDeleteMedication}
                doseLogs={doseLogs}
                onToggleDose={handleToggleDose}
                habits={habits}
                habitLogs={habitLogs}
                onAddHabit={handleAddHabit}
                onDeleteHabit={handleDeleteHabit}
                onToggleHabit={handleToggleHabit}
                onUpdateHabitProgress={handleUpdateHabitProgress}
                accentColor={activeSanctuary.colors.accent}
              />
            </motion.div>
          )}

          {/* --- TAB 8: SETTINGS SCREEN (Ambient Volume, Backup, Reset) --- */}
          {activeTab === 'settings' && (
            <motion.div
              key="tab-settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/80 backdrop-blur-md p-6 border border-neutral-200/50 rounded-[32px] shadow-md space-y-6"
            >
              {/* Header */}
              <div className="border-b border-neutral-100 pb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#C67C58]" />
                <h3 className="font-serif text-lg font-bold">Sanctuary Control Cabinet</h3>
              </div>

              {/* Soundscape volume */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-1.5">
                  <Volume1 className="w-4 h-4 text-[#94A47A]" /> Soundscape Parameters
                </h4>
                <div className="p-4 bg-[#F4ECDD] rounded-2xl border border-neutral-200/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">Atmosphere Synthesizer</span>
                    <button
                      onClick={() => setSoundscapeOn(!soundscapeOn)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border transition ${
                        soundscapeOn
                          ? 'bg-[#94A47A] text-white border-[#94A47A]'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {soundscapeOn ? 'Active' : 'Dormant'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      Precipitation volume ({Math.round(rainLevel * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={rainLevel}
                      onChange={(e) => setRainLevel(parseFloat(e.target.value))}
                      className="w-full accent-neutral-800"
                    />
                  </div>
                </div>
              </div>

              {/* Voice & Speech Engine */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-[#C67C58]" /> Serenity's Voice Engine
                </h4>
                <div className="p-4 bg-[#F4ECDD] rounded-2xl border border-neutral-200/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">Speech Synthesis (TTS)</span>
                    <button
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-full border transition ${
                        ttsEnabled
                          ? 'bg-[#94A47A] text-white border-[#94A47A]'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {ttsEnabled ? 'Vocal' : 'Silent'}
                    </button>
                  </div>

                  {ttsEnabled && (
                    <div className="space-y-3 border-t border-neutral-200/50 pt-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          Select Companion Voice
                        </label>
                        <select
                          value={selectedVoiceName}
                          onChange={(e) => {
                            setSelectedVoiceName(e.target.value);
                            // Speak a small preview with the new voice
                            setTimeout(() => {
                              const utterance = new SpeechSynthesisUtterance("Hello! This is my new voice.");
                              utterance.rate = 0.90;
                              utterance.pitch = 1.0;
                              const selected = window.speechSynthesis.getVoices().find(v => v.name === e.target.value);
                              if (selected) utterance.voice = selected;
                              window.speechSynthesis.speak(utterance);
                            }, 100);
                          }}
                          className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 outline-none focus:border-[#C67C58] transition"
                        >
                          {voices.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang}) {v.localService ? '[Local]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center bg-white/60 p-2.5 rounded-xl border border-neutral-200/30 gap-3">
                        <span className="text-[10px] text-neutral-500 leading-tight">
                          Try selecting premium, natural, or Google English voices for a warm, pleasant flow.
                        </span>
                        <button
                          onClick={() => {
                            speakTherapeuticResponse("I am here with you. Let us take a deep, slow breath together.");
                          }}
                          className="px-3 py-1 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-bold text-[#2C2018] flex items-center gap-1 shrink-0 transition"
                        >
                          <Play className="w-2.5 h-2.5 text-[#C67C58]" /> Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory & Trust Settings */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C67C58]" /> Serenity's Memory & Trust Vault
                </h4>
                <div className="p-4 bg-[#F4ECDD] rounded-2xl border border-neutral-200/40 space-y-3">
                  <p className="text-xs text-neutral-600 font-serif leading-relaxed">
                    Serenity only remembers what you explicitly consent to. You can review, edit, or purge any saved detail at any moment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsMemoryModalOpen(true)}
                      className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-serif font-bold text-[#2C2018] flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C67C58]" /> Manage Consented Memories
                    </button>
                    <button
                      onClick={() => setIsSupportModalOpen(true)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-serif font-bold text-red-700 flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-red-600" /> Open Crisis & Support Hub
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Locker */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#C67C58]" /> Security & Encrypted Cache
                </h4>
                <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 space-y-3 text-xs leading-relaxed text-neutral-500">
                  <p>
                    All of your logs, reflections, clinical provider bookmarks, medication times, and conversational details with Serenity are held <strong>strictly offline</strong> inside your browser's private local storage.
                  </p>
                  <p className="font-serif italic text-[#C67C58]">
                    No cookies are transmitted to third-party ad networks, and no trackers are loaded. This is a fully sealed peer sanctuary.
                  </p>

                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `serenity_backup_${new Date().toISOString().split('T')[0]}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className="px-3.5 py-1.5 border border-neutral-200 text-[#2C2018] font-semibold rounded-full hover:bg-neutral-50 transition"
                    >
                      Backup My Data (JSON)
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("WARNING: This will permanently delete your name, streak logs, chat history, medications, and journal entries. This action cannot be undone. Proceed?")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition shadow-sm"
                    >
                      Erase Entire Sanctuary Cache
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="mt-4 mb-24 text-center text-[10px] text-neutral-400/80 font-medium z-10 relative">
        Serenity Sanctuary • A safe, private space for peer wellness. Your data is strictly kept locally.
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          setUserName(user.name);
          localStorage.setItem('serenity_user_profile', JSON.stringify(user));
        }}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('serenity_user_profile');
        }}
      />
      <ProfessionalSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
      <MemoryManagerModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={consentedMemories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
      />

      {/* FLOATING BOTTOM COZY NAVIGATION BAR (Replicating Screenshot Navigation EXACTLY) */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#EFE4D2]/95 backdrop-blur-md border-t border-neutral-200/60 shadow-xl flex justify-around items-center py-2 px-3 z-50">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'home' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Home className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Home</span>
        </button>

        {/* Tab 2: Talk */}
        <button
          onClick={() => setActiveTab('talk')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'talk' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <MessageSquare className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Talk</span>
        </button>

        {/* Tab 3: Journal */}
        <button
          onClick={() => setActiveTab('journal')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'journal' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <BookOpen className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Journal</span>
        </button>

        {/* Tab 4: Breathe */}
        <button
          onClick={() => setActiveTab('breathe')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'breathe' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Wind className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Breathe</span>
        </button>

        {/* Tab 5: Activities */}
        <button
          onClick={() => setActiveTab('activities')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'activities' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Compass className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Activities</span>
        </button>

        {/* Tab 6: Progress */}
        <button
          onClick={() => setActiveTab('progress')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'progress' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Award className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Progress</span>
        </button>

        {/* Tab 7: Care */}
        <button
          onClick={() => setActiveTab('care')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'care' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Heart className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Care</span>
        </button>

        {/* Tab 8: Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex flex-col items-center flex-1 justify-center py-1 transition group"
        >
          <div className={`w-12 h-8 rounded-full flex items-center justify-center transition ${
            activeTab === 'settings' ? 'bg-[#94A47A]/35 text-[#2C2018]' : 'text-neutral-500 hover:text-neutral-800'
          }`}>
            <Sliders className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-serif italic text-[#2C2018] mt-1">Settings</span>
        </button>

      </nav>

    </div>
  );
}
