/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Medication, DoseLog, Habit, HabitLog } from '../types';
import { SAMPLE_PROVIDERS, Provider, ProviderType, ModalityType } from '../lib/careDirectory';
import HabitsSection from '../components/HabitsSection';
import {
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  Check,
  Lock,
  Bell,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Clock,
  Briefcase,
  ShieldCheck,
  Sparkles,
  History,
  Heart,
  Info,
  Award
} from 'lucide-react';

interface CareScreenProps {
  medications: Medication[];
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
  onDeleteMedication: (id: string) => void;
  doseLogs: DoseLog[];
  onToggleDose: (medicationId: string, timeOfDay: string, date: string) => void;
  habits?: Habit[];
  habitLogs?: HabitLog[];
  onAddHabit?: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onDeleteHabit?: (id: string) => void;
  onToggleHabit?: (habitId: string, date: string) => void;
  onUpdateHabitProgress?: (habitId: string, date: string, delta: number) => void;
  accentColor?: string;
}

const WEEKDAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

export default function CareScreen({
  medications,
  onAddMedication,
  onDeleteMedication,
  doseLogs,
  onToggleDose,
  habits = [],
  habitLogs = [],
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  onUpdateHabitProgress,
  accentColor = '#94A47A',
}: CareScreenProps) {
  const [subTab, setSubTab] = useState<'directory' | 'medications' | 'habits'>('habits');

  // Care Directory filter states
  const [selectedType, setSelectedType] = useState<ProviderType | 'All'>('All');
  const [selectedModality, setSelectedModality] = useState<ModalityType | 'All'>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | 'All'>('All');

  // Add medication form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedDays, setNewMedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // all days by default
  const [newMedNotes, setNewMedNotes] = useState('');
  const [newMedStartDate, setNewMedStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isAsNeeded, setIsAsNeeded] = useState(false);

  // Notification states
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Helper to calculate 7 days history
  const getLast7Days = () => {
    const days = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];
      const shortDate = d.getDate();
      days.push({ dateStr, dayName, shortDate });
    }
    return days;
  };

  // Helper to get stats of taken doses for date
  const getDoseStatsForDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T12:00:00'); // mid day avoids timezone drift
    const dayOfWeek = dateObj.getDay();

    // Find which medications are scheduled for this day
    const scheduledMeds = medications.filter((m) => m.daysOfWeek.includes(dayOfWeek));
    
    // Total scheduled doses (excluding PRN/As-Needed)
    const totalScheduled = scheduledMeds.reduce((acc, m) => {
      const scheduledTimes = m.timesOfDay.filter(t => t !== 'As-Needed' && t !== 'PRN');
      return acc + scheduledTimes.length;
    }, 0);

    // Doses logged for this date
    const takenLogs = doseLogs.filter((log) => log.date === dateStr);
    const totalTaken = takenLogs.length;

    return {
      totalScheduled,
      totalTaken,
      completed: totalScheduled > 0 && totalTaken >= totalScheduled,
      partial: totalScheduled > 0 && totalTaken > 0 && totalTaken < totalScheduled,
      noSchedules: totalScheduled === 0,
    };
  };

  // Helper to calculate remaining time
  const getNextDoseRemaining = (timeStr: string, daysOfWeek: number[]) => {
    const todayNum = new Date().getDay();
    if (!daysOfWeek.includes(todayNum)) {
      return { status: 'Not scheduled today', color: 'text-neutral-400 bg-neutral-100' };
    }

    if (timeStr === 'As-Needed' || timeStr === 'PRN') {
      return { status: 'As needed', color: 'text-[#C67C58] bg-[#C67C58]/10' };
    }

    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      const diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        return { status: 'Dose elapsed today', color: 'text-neutral-400 bg-neutral-100' };
      }

      const diffMins = Math.round(diffMs / 60000);
      if (diffMins < 60) {
        return { status: `Due in ${diffMins}m`, color: 'text-amber-700 bg-amber-50 animate-pulse' };
      } else {
        const diffHours = Math.floor(diffMins / 60);
        const remMins = diffMins % 60;
        return { status: `Due in ${diffHours}h ${remMins}m`, color: 'text-neutral-600 bg-[#EFE4D2]' };
      }
    } catch (e) {
      return { status: 'Scheduled', color: 'text-neutral-600 bg-neutral-100' };
    }
  };

  // Calculate today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDayOfWeek = new Date().getDay(); // 0-6

  // Get list of specialties present in mock data
  const allSpecialties = Array.from(
    new Set(SAMPLE_PROVIDERS.flatMap((p) => p.specialties))
  );

  // Filter providers
  const filteredProviders = SAMPLE_PROVIDERS.filter((p) => {
    const matchesType = selectedType === 'All' || p.type === selectedType;
    const matchesModality =
      selectedModality === 'All' || p.modalities.includes(selectedModality);
    const matchesSpecialty =
      selectedSpecialty === 'All' || p.specialties.includes(selectedSpecialty);
    return matchesType && matchesModality && matchesSpecialty;
  });

  // Handle Request notification permission
  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support local web notifications.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification('Serenity Reminders Enabled', {
          body: 'You will receive gentle medication reminders while the sanctuary is open.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add medication submit
  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDose.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dose: newMedDose.trim(),
      timesOfDay: [newMedTime],
      daysOfWeek: newMedDays,
      notes: newMedNotes.trim() || undefined,
      startDate: newMedStartDate,
    });

    // Reset fields
    setNewMedName('');
    setNewMedDose('');
    setNewMedTime('08:00');
    setNewMedDays([0, 1, 2, 3, 4, 5, 6]);
    setNewMedNotes('');
    setShowAddForm(false);
  };

  const toggleWeekday = (val: number) => {
    if (newMedDays.includes(val)) {
      if (newMedDays.length > 1) {
        setNewMedDays(newMedDays.filter((d) => d !== val));
      }
    } else {
      setNewMedDays([...newMedDays, val].sort());
    }
  };

  // Format scheduled days string
  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((d) => dayLabels[d]).join(', ');
  };

  // Filter today's medications
  const todayMeds = medications.filter((m) => m.daysOfWeek.includes(todayDayOfWeek));

  return (
    <div className="flex flex-col gap-6 h-full py-1">
      {/* Top Navigation Toggle - Custom Pills Style */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-[#EFE4D2]/40 border border-neutral-200/50 rounded-full gap-2">
          <button
            onClick={() => setSubTab('habits')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
              subTab === 'habits'
                ? 'bg-[#94A47A] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Daily Habits</span>
            {habits.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  subTab === 'habits'
                    ? 'bg-white/30 text-white'
                    : 'bg-neutral-200/70 text-neutral-600'
                }`}
              >
                {habits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('medications')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
              subTab === 'medications'
                ? 'bg-[#94A47A] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Medication Log
          </button>
          <button
            onClick={() => setSubTab('directory')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
              subTab === 'directory'
                ? 'bg-[#94A47A] text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Care Directory
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SUBTAB 1: CARE DIRECTORY */}
        {subTab === 'directory' && (
          <motion.div
            key="care-directory"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Pinned Urgent Crisis Banner */}
            <div className="p-4 bg-red-50/80 border border-red-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-2 left-4 w-12 h-4 bg-red-200/30 rotate-[-3deg]" />
              <div className="flex gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5 md:mt-0" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-red-950">In crisis right now? Professional support is a heartbeat away</h3>
                  <p className="text-[10.5px] text-red-800 leading-relaxed mt-0.5">
                    If you are experiencing overwhelming distress, reach out immediately. Free, 24/7, confidential human assistance:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href="tel:988"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                >
                  Call/Text 988
                </a>
                <a
                  href="https://www.crisistextline.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold shadow-sm transition flex items-center gap-1"
                >
                  Text HOME to 741741 <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Filter Pills Sidebar/Top Shelf */}
            <div className="p-5 bg-[#F4ECDD] rounded-3xl border border-neutral-200/50 space-y-4">
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2">
                  Provider Type
                </span>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Therapist', 'Coach', 'Psychologist', 'Psychiatrist'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type as ProviderType | 'All')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition ${
                        selectedType === type
                          ? 'bg-[#94A47A] text-white border-[#94A47A]'
                          : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2">
                    Modality
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'In-person', 'Video', 'Phone'].map((mod) => (
                      <button
                        key={mod}
                        onClick={() => setSelectedModality(mod as ModalityType | 'All')}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition ${
                          selectedModality === mod
                            ? 'bg-[#94A47A] text-white border-[#94A47A]'
                            : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2">
                    Specialty / Focus
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSpecialty('All')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition ${
                        selectedSpecialty === 'All'
                          ? 'bg-[#94A47A] text-white border-[#94A47A]'
                          : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      All Specialties
                    </button>
                    {allSpecialties.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setSelectedSpecialty(spec)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border transition ${
                          selectedSpecialty === spec
                            ? 'bg-[#94A47A] text-white border-[#94A47A]'
                            : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Providers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProviders.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-white border border-dashed border-neutral-200 rounded-3xl p-6">
                  <p className="font-serif italic text-sm text-neutral-400">No care providers fit these exact filter criteria.</p>
                  <button
                    onClick={() => {
                      setSelectedType('All');
                      setSelectedModality('All');
                      setSelectedSpecialty('All');
                    }}
                    className="mt-4 px-4 py-2 bg-[#94A47A] text-white rounded-full text-xs font-semibold shadow-sm hover:bg-[#94A47A]/90 transition"
                  >
                    Reset Filter Search
                  </button>
                </div>
              ) : (
                filteredProviders.map((p) => (
                  <div
                    key={p.id}
                    className="p-6 bg-[#F4ECDD] rounded-3xl border border-neutral-200/50 shadow-sm relative flex flex-col justify-between overflow-hidden"
                  >
                    {/* Washi tape tab top-left corner */}
                    <div className="absolute top-2 left-4 w-12 h-4 bg-[#D3A29A]/50 rotate-[-3deg] border-b border-dashed border-neutral-400/10" />

                    <div>
                      <div className="flex items-start justify-between gap-3 mt-2">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#2C2018] tracking-tight">{p.name}</h3>
                          <p className="font-serif italic text-[11px] text-[#C67C58] leading-tight mt-0.5">{p.credentials}</p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-[#94A47A] text-white rounded-full text-[9px] font-semibold uppercase tracking-wider">
                          {p.type}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-neutral-600 leading-relaxed mt-4 whitespace-pre-wrap">
                        {p.bio}
                      </p>

                      {/* Specialties badges */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {p.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[9.5px] px-2 py-0.5 bg-white/70 border border-neutral-200/40 rounded-full text-neutral-500 font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Location & Modality details */}
                      <div className="mt-4 space-y-1.5 border-t border-neutral-200/30 pt-3">
                        <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-500">
                          <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{p.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-500">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="capitalize">{p.modalities.join(', ')} Modality</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-500">
                          <Globe className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Languages: {p.languages.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex gap-2 mt-6 pt-3 border-t border-neutral-200/30">
                      {p.contact.phone && (
                        <a
                          href={`tel:${p.contact.phone}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-neutral-200 rounded-xl text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                        >
                          <Phone className="w-3 h-3 text-[#C67C58]" /> Call
                        </a>
                      )}
                      {p.contact.email && (
                        <a
                          href={`mailto:${p.contact.email}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-neutral-200 rounded-xl text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                        >
                          <Mail className="w-3 h-3 text-[#C67C58]" /> Email
                        </a>
                      )}
                      {p.contact.website && (
                        <a
                          href={p.contact.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-neutral-200 rounded-xl text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                        >
                          <Globe className="w-3 h-3 text-[#C67C58]" /> Web
                        </a>
                      )}
                      {p.contact.bookUrl && (
                        <a
                          href={p.contact.bookUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`This is a sample clinical provider listing. In a production build, this would securely redirect to Dr. ${p.name.split(' ').slice(-1)[0]}'s live booking scheduler.`);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#94A47A] text-white rounded-xl text-[10px] font-bold shadow-sm hover:bg-[#94A47A]/90 transition"
                        >
                          Book Now
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: DAILY MEDICATIONS */}
        {subTab === 'medications' && (
          <motion.div
            key="medications-tracker"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Sealed Safely Privacy Banner & Wax-Seal Emblem */}
            <div className="p-6 bg-[#F4ECDD] border border-neutral-200/60 rounded-[32px] shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C67C58]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex gap-4 items-start text-left">
                {/* Visual Premium Wax Seal Icon */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-[#C67C58] rounded-full shadow-md border-2 border-dashed border-[#F4ECDD]/30">
                  <span className="font-serif text-[10px] text-[#F4ECDD] font-bold tracking-widest uppercase rotate-[-12deg] select-none">
                    SEALED
                  </span>
                  <div className="absolute inset-1 rounded-full border border-[#F4ECDD]/10" />
                  <Lock className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-[#2C2018] text-white p-0.5 rounded-full border border-[#F4ECDD]" />
                </div>
                
                <div>
                  <h4 className="font-serif text-base font-bold text-[#2C2018] flex items-center gap-1.5">
                    Sealed Safely in Private Ledger <ShieldCheck className="w-4 h-4 text-[#94A47A]" />
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                    Your self-care cabinet, intake schedule, and history are preserved strictly inside your offline browser cache (<span className="font-mono text-[10px] bg-white/60 px-1.5 py-0.5 rounded border border-neutral-200/50">localStorage</span>). No servers, no tracking, no third-party diagnostics.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 border-neutral-200/50 pt-3 md:pt-0">
                <div className="text-[10px] text-neutral-400 font-mono text-center md:text-right">
                  STATUS: <span className="text-emerald-600 font-bold">100% OFFLINE</span>
                </div>
                <button
                  onClick={async () => {
                    if (!('Notification' in window)) {
                      alert('This browser does not support notifications.');
                      return;
                    }
                    if (Notification.permission !== 'granted') {
                      await handleRequestNotificationPermission();
                    } else {
                      // Trigger a sweet test notification
                      new Notification('Serenity Companion Reminder', {
                        body: 'Time to check on your self-care schedule. Take a deep, gentle breath.',
                        icon: '/favicon.ico',
                      });
                    }
                  }}
                  className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-[#2C2018] rounded-full text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-[#C67C58]" /> Test Private Notification
                </button>
              </div>
            </div>

            {/* 7-Day Compliance Tracker Calendar Row */}
            <div className="p-5 bg-white rounded-3xl border border-neutral-200/80 shadow-sm space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h4 className="font-serif text-xs font-bold text-[#2C2018] flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#C67C58]" /> Self-Care History (Past 7 Days)
                </h4>
                <span className="text-[10px] text-neutral-400 font-mono">Ledger Logs Sync Active</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {getLast7Days().map((day) => {
                  const stats = getDoseStatsForDate(day.dateStr);
                  const isToday = day.dateStr === todayStr;
                  
                  // Decide visual styling of each circle based on stats
                  let circleBg = 'bg-neutral-50 text-neutral-400 border-neutral-200/60';
                  let statusLabel = 'No doses';
                  
                  if (stats.completed) {
                    circleBg = 'bg-[#94A47A] text-white border-[#94A47A] shadow-sm shadow-[#94A47A]/20';
                    statusLabel = `Complete (${stats.totalTaken}/${stats.totalScheduled})`;
                  } else if (stats.partial) {
                    circleBg = 'bg-[#C67C58] text-white border-[#C67C58] shadow-sm shadow-[#C67C58]/10';
                    statusLabel = `Partial (${stats.totalTaken}/${stats.totalScheduled})`;
                  } else if (stats.totalScheduled > 0) {
                    circleBg = 'bg-neutral-100 text-neutral-400 border-neutral-300';
                    statusLabel = `Missed (${stats.totalTaken}/${stats.totalScheduled})`;
                  } else if (stats.noSchedules && stats.totalTaken > 0) {
                    circleBg = 'bg-[#EFE4D2] text-[#2C2018] border-[#EFE4D2]';
                    statusLabel = `Wellness dose logged`;
                  }
                  
                  return (
                    <div
                      key={day.dateStr}
                      className={`flex flex-col items-center p-2 rounded-2xl border transition ${
                        isToday ? 'border-[#C67C58] bg-[#C67C58]/5' : 'border-transparent'
                      }`}
                      title={`${day.dateStr}: ${statusLabel}`}
                    >
                      <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                        {day.dayName}
                      </span>
                      
                      <div className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center font-serif text-xs font-bold mt-1.5 transition-all ${circleBg}`}>
                        {stats.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        ) : stats.partial ? (
                          <span className="text-[9px] font-sans">{stats.totalTaken}</span>
                        ) : stats.noSchedules && stats.totalTaken > 0 ? (
                          <Heart className="w-3.5 h-3.5 fill-[#C67C58] text-[#C67C58]" />
                        ) : (
                          <span>{day.shortDate}</span>
                        )}
                      </div>
                      
                      {isToday && (
                        <span className="text-[8px] text-[#C67C58] font-bold mt-1 uppercase tracking-widest">
                          Today
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: Daily Dose Reminders & Actions */}
              <div className="lg:col-span-2 space-y-5 text-left">
                {/* Title and Form Toggle */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#94A47A]" /> Today's Active Schedules
                  </h3>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onAddMedication({
                          name: 'Calming Chamomile & Mint Tea',
                          dose: '1 Warm Mug',
                          timesOfDay: ['As-Needed'],
                          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                          notes: 'Brewed carefully, taken with a deep centering breath.',
                          startDate: todayStr
                        });
                        alert('Added a private "Calming Chamomile & Mint Tea" as-needed self-care support to your cabinet!');
                      }}
                      className="px-2.5 py-1.5 bg-[#F4ECDD] hover:bg-[#EFE4D2] text-[#2C2018] rounded-full text-[10px] font-bold border border-neutral-200/50 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" /> + Quick Tea Support
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsAsNeeded(false);
                        setShowAddForm(!showAddForm);
                      }}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-[#94A47A] hover:bg-[#94A47A]/90 text-white rounded-full text-[10px] font-bold shadow-sm transition"
                    >
                      <Plus className="w-3 h-3" /> Add Medication
                    </button>
                  </div>
                </div>

                {/* Add Medication Letter Form Drawer */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newMedName.trim() || !newMedDose.trim()) return;

                          onAddMedication({
                            name: newMedName.trim(),
                            dose: newMedDose.trim(),
                            timesOfDay: isAsNeeded ? ['As-Needed'] : [newMedTime],
                            daysOfWeek: newMedDays,
                            notes: newMedNotes.trim() || undefined,
                            startDate: newMedStartDate,
                          });

                          // Reset fields
                          setNewMedName('');
                          setNewMedDose('');
                          setNewMedTime('08:00');
                          setNewMedDays([0, 1, 2, 3, 4, 5, 6]);
                          setNewMedNotes('');
                          setIsAsNeeded(false);
                          setShowAddForm(false);
                        }}
                        className="p-5 bg-[#F4ECDD]/40 rounded-3xl border border-neutral-200/80 shadow-inner space-y-4 relative"
                      >
                        {/* Letter ribbon tag top corner */}
                        <div className="absolute top-2 right-4 w-12 h-4 bg-[#C67C58]/20 rotate-[5deg]" />
                        
                        <h4 className="font-serif text-xs font-bold text-[#2C2018] border-b border-neutral-200/30 pb-2">
                          Add New Medication or Wellness Aid
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Medication / Remedy Name
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sertraline, Vitamin D3, Calming Spray..."
                              value={newMedName}
                              onChange={(e) => setNewMedName(e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Dose Strength / Volume
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 50 mg, 1 capsule, 2 drops..."
                              value={newMedDose}
                              onChange={(e) => setNewMedDose(e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-400"
                            />
                          </div>
                        </div>

                        {/* As Needed PRN Toggle */}
                        <div className="flex items-center gap-2 p-2.5 bg-white/70 border border-neutral-200/40 rounded-xl">
                          <input
                            type="checkbox"
                            id="asNeededCheck"
                            checked={isAsNeeded}
                            onChange={(e) => setIsAsNeeded(e.target.checked)}
                            className="accent-[#94A47A] w-4 h-4"
                          />
                          <label htmlFor="asNeededCheck" className="text-[11px] font-semibold text-[#2C2018] cursor-pointer">
                            This is an "As-Needed" (PRN) support (no strict daily time scheduled)
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {!isAsNeeded && (
                            <div>
                              <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                                Scheduled Time
                              </label>
                              <input
                                type="time"
                                required={!isAsNeeded}
                                value={newMedTime}
                                onChange={(e) => setNewMedTime(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-400"
                              />
                            </div>
                          )}

                          <div className={isAsNeeded ? "sm:col-span-2" : ""}>
                            <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              required
                              value={newMedStartDate}
                              onChange={(e) => setNewMedStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                            Days of Week (Schedule Routine)
                          </label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {WEEKDAYS.map((day) => {
                              const active = newMedDays.includes(day.value);
                              return (
                                <button
                                  type="button"
                                  key={day.value}
                                  onClick={() => toggleWeekday(day.value)}
                                  className={`w-8 h-8 rounded-full text-[10.5px] font-bold transition flex items-center justify-center border ${
                                    active
                                      ? 'bg-[#94A47A] text-white border-[#94A47A] shadow-sm'
                                      : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                            Instructions / Self-Care Notes
                          </label>
                          <textarea
                            placeholder="e.g. Take with warm tea, keep near bedside table..."
                            value={newMedNotes}
                            onChange={(e) => setNewMedNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs bg-white resize-none focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-400"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-600 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#94A47A] hover:bg-[#94A47A]/90 text-white rounded-full text-xs font-bold shadow-sm transition"
                          >
                            Save Registry Record
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scheduled / Regular Doses for Today */}
                <div className="space-y-3">
                  {todayMeds.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-dashed border-neutral-200 rounded-3xl p-6">
                      <p className="font-serif italic text-xs text-neutral-400">No scheduled intakes recorded for today.</p>
                      <p className="text-[10px] text-neutral-400 mt-1">Add medication details above to begin tracking compliance.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Separate Scheduled from PRN/As-Needed for clearer layout */}
                      {todayMeds.map((med) => {
                        return med.timesOfDay.map((time) => {
                          const isPRN = time === 'As-Needed' || time === 'PRN';
                          const isTaken = doseLogs.some(
                            (log) =>
                              log.medicationId === med.id &&
                              log.timeOfDay === time &&
                              log.date === todayStr
                          );

                          const remInfo = getNextDoseRemaining(time, med.daysOfWeek);

                          return (
                            <div
                              key={`${med.id}-${time}`}
                              className={`p-4 rounded-3xl border transition flex items-center justify-between gap-4 ${
                                isTaken
                                  ? 'bg-[#94A47A]/5 border-[#94A47A]/20 opacity-85'
                                  : 'bg-white border-neutral-200/80 shadow-sm hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex gap-3.5 items-center min-w-0">
                                {/* Satisfaction Check Circle Action */}
                                <button
                                  onClick={() => onToggleDose(med.id, time, todayStr)}
                                  className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                                    isTaken
                                      ? 'bg-[#94A47A] border-[#94A47A] text-white scale-100 shadow-sm shadow-[#94A47A]/30'
                                      : 'bg-[#F4ECDD] hover:bg-[#EFE4D2] border-neutral-200 text-transparent scale-100'
                                  }`}
                                >
                                  <Check className="w-4.5 h-4.5 stroke-[3.5]" />
                                </button>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4
                                      className={`text-xs font-bold text-[#2C2018] truncate ${
                                        isTaken ? 'line-through text-neutral-400' : ''
                                      }`}
                                    >
                                      {med.name}
                                    </h4>
                                    
                                    {/* Dynamic Time Countdown badge */}
                                    {!isTaken && (
                                      <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold ${remInfo.color}`}>
                                        {remInfo.status}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-neutral-400 mt-1">
                                    <span className="font-serif italic text-[#C67C58] font-bold">{med.dose}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 font-medium">
                                      <Clock className="w-3 h-3 text-neutral-400" /> {time}
                                    </span>
                                    {med.notes && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[220px] italic text-neutral-500" title={med.notes}>
                                          "{med.notes}"
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                <span
                                  className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${
                                    isTaken
                                      ? 'bg-[#94A47A]/15 text-[#94A47A]'
                                      : 'bg-[#F4ECDD] text-neutral-500'
                                  }`}
                                >
                                  {isTaken ? 'Checked' : 'Awaiting'}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Column: Cabinet Lock & Details */}
              <div className="space-y-6 text-left">
                {/* Physical Cabinet Lock Cabinet */}
                <div className="p-5 bg-white rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="font-serif text-xs font-bold text-[#2C2018] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#C67C58]" /> Self-Care Cabinet ({medications.length})
                    </h4>
                    <span className="text-[9px] text-neutral-400 italic">Local Encrypted</span>
                  </div>

                  {medications.length === 0 ? (
                    <p className="text-[10px] italic text-neutral-400 text-center py-6">
                      Your self-care cabinet is currently empty. Add records using the form drawer.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {medications.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-[#F4ECDD]/35 border border-neutral-200/40 rounded-2xl flex items-center justify-between gap-3 hover:bg-[#F4ECDD]/50 transition-all"
                        >
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-neutral-800 truncate">
                              {m.name}
                            </span>
                            <span className="block text-[9.5px] text-[#C67C58] font-serif italic mt-0.5">
                              {m.dose} • {formatDays(m.daysOfWeek)}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {m.timesOfDay.map((time) => (
                                <span
                                  key={time}
                                  className="text-[8.5px] bg-white/80 border border-neutral-200/40 rounded px-1 text-neutral-500 font-mono"
                                >
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteMedication(m.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete medication schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Educational / Instructions Panel */}
                <div className="p-5 bg-[#F4ECDD] rounded-3xl border border-neutral-200/60 shadow-sm space-y-3.5 relative overflow-hidden">
                  {/* Washi-tape aesthetic detail */}
                  <div className="absolute top-2 left-4 w-12 h-4 bg-[#D3A29A]/40 rotate-[-4deg] border-b border-dashed border-[#F4ECDD]/10" />

                  <h4 className="font-serif text-xs font-bold text-[#2C2018] flex items-center gap-1.5 mt-2">
                    <Info className="w-4 h-4 text-[#C67C58]" /> Self-Care Guidelines
                  </h4>
                  
                  <div className="space-y-2 text-[11px] text-neutral-600 leading-relaxed">
                    <p>
                      Taking medications or wellness supplements consistently is a vital act of self-kindness. 
                    </p>
                    <p className="font-serif italic font-semibold text-[#2C2018]">
                      "Wellness starts by small, rhythmic acts of devotion to your own body and mind."
                    </p>
                    <p className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-200/30">
                      If you use custom widgets or devices, ensure your local browser permissions remain active to allow background workers to fire reminders instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: HABITS SECTION */}
        {subTab === 'habits' && (
          <motion.div
            key="care-habits"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            <HabitsSection
              habits={habits}
              habitLogs={habitLogs}
              onAddHabit={onAddHabit || (() => {})}
              onDeleteHabit={onDeleteHabit || (() => {})}
              onToggleHabit={onToggleHabit || (() => {})}
              onUpdateHabitProgress={onUpdateHabitProgress}
              accentColor={accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
