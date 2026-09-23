/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, JournalType, ConsentedMemory } from './types';
import globalSoundscape from './components/SoundscapeEngine';
import {
  BookOpen,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Calendar,
  Trash2,
  Check,
  Flame,
  MessageSquare,
  PenTool,
  Image as ImageIcon,
  Type,
  List,
  Quote,
  Palette,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eraser,
  RotateCcw,
  Download,
  Share2,
} from 'lucide-react';

interface ReflectionJournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onDeleteEntry: (id: string) => void;
  onShareWithSerenity: (text: string) => void;
  onUpdateEntryReflection?: (id: string, reflection: string) => void;
  accentColor?: string;
  consentedMemories?: ConsentedMemory[];
  initialPrompt?: string;
}

// Serenity-themed emotional stickers replacing generic emojis
export const EMOTIONAL_STICKERS = [
  { id: 'peaceful', label: 'Peaceful', sticker: '🌸', name: 'Pressed Flower', color: 'bg-[#94A47A]/15 text-[#5B8E7D] border-[#94A47A]/30' },
  { id: 'grateful', label: 'Grateful', sticker: '✨', name: 'Golden Star', color: 'bg-[#D4A373]/15 text-[#C67C58] border-[#D4A373]/30' },
  { id: 'anxious', label: 'Anxious', sticker: '☁️', name: 'Soft Cloud', color: 'bg-[#7EA0B7]/15 text-[#7EA0B7] border-[#7EA0B7]/30' },
  { id: 'sad', label: 'Heavy Heart', sticker: '🐚', name: 'Ocean Shell', color: 'bg-[#818cf8]/15 text-[#818cf8] border-[#818cf8]/30' },
  { id: 'hopeful', label: 'Hopeful', sticker: '🌿', name: 'Fern Frond', color: 'bg-[#5B8E7D]/15 text-[#5B8E7D] border-[#5B8E7D]/30' },
  { id: 'tired', label: 'Gentle Rest', sticker: '🌒', name: 'Moon Phase', color: 'bg-indigo-900/15 text-indigo-700 border-indigo-200' },
  { id: 'restless', label: 'Restless', sticker: '🦋', name: 'Butterfly', color: 'bg-amber-800/15 text-amber-700 border-amber-200' },
  { id: 'neutral', label: 'Centered', sticker: '🍵', name: 'Ceramic Tea', color: 'bg-stone-500/15 text-stone-700 border-stone-200' },
] as const;

export const PAPER_STYLES = [
  { id: 'warm-ivory', name: 'Warm Ivory', bgClass: 'bg-[#FAF7F2] text-[#2C2018]', borderClass: 'border-[#E6DEC8]' },
  { id: 'parchment', name: 'Vintage Parchment', bgClass: 'bg-[#F5EFEB] text-[#33221A]', borderClass: 'border-[#DECDBB]' },
  { id: 'linen', name: 'Soft Linen', bgClass: 'bg-[#F2F5F3] text-[#202E28]', borderClass: 'border-[#CFDCD3]' },
  { id: 'ruled-botanical', name: 'Ruled Sage', bgClass: 'bg-[#FCFBF8] text-[#2C2018] bg-[linear-gradient(rgba(148,164,122,0.15)_1px,transparent_1px)] bg-[size:100%_28px]', borderClass: 'border-[#D5DFD1]' },
  { id: 'midnight-star', name: 'Midnight Paper', bgClass: 'bg-[#0F172A] text-slate-100', borderClass: 'border-slate-800' },
];

export const FONT_STYLES = [
  { id: 'serif', name: 'Classical Serif', fontClass: 'font-serif' },
  { id: 'sans', name: 'Handwritten Feel', fontClass: 'font-sans' },
  { id: 'dyslexic', name: 'Clean Legible', fontClass: 'font-sans tracking-wide leading-relaxed' },
];

export default function ReflectionJournal({
  entries,
  onAddEntry,
  onDeleteEntry,
  onShareWithSerenity,
  onUpdateEntryReflection,
  accentColor = '#818cf8',
  consentedMemories = [],
  initialPrompt,
}: ReflectionJournalProps) {
  const [activeTab, setActiveTab] = useState<JournalType>('free');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (initialPrompt) {
      setText((prev) => (prev.trim() ? prev : `Reflecting on: "${initialPrompt}"\n\n`));
    }
  }, [initialPrompt]);
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('peaceful');
  const [paperStyle, setPaperStyle] = useState(PAPER_STYLES[0]);
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  // Gratitude specific inputs
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  // Handwrite/sketch state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#2C2018');
  const [drawLineWidth, setDrawLineWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  // AI Reflection in-flight loading per entry
  const [reflectingId, setReflectingId] = useState<string | null>(null);
  const [activeViewEntryId, setActiveViewEntryId] = useState<string | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSpeechRecognitionSupported(hasSpeech);
  }, []);

  const handleTabChange = (tab: JournalType) => {
    setActiveTab(tab);
    globalSoundscape.playPaperFlip();
  };

  const toggleVoiceRecording = () => {
    if (!speechRecognitionSupported) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isRecording) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        (window as any)._serenityRecognition = recognition;
        setIsRecording(true);
      } catch (e) {
        console.error('Error starting voice recognition:', e);
      }
    } else {
      if ((window as any)._serenityRecognition) {
        (window as any)._serenityRecognition.stop();
      }
      setIsRecording(false);
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalText = text.trim();
    const gratitudeList = [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()].filter(Boolean);

    if (activeTab === 'gratitude') {
      if (gratitudeList.length === 0) return;
      finalText = `Daily Gratitudes:\n1. ${gratitude1}\n2. ${gratitude2}\n3. ${gratitude3}\n\n${text.trim()}`;
    }

    let sketchData: string | undefined = undefined;
    if (activeTab === 'sketch' && canvasRef.current && hasDrawn) {
      sketchData = canvasRef.current.toDataURL('image/png');
      if (!finalText) finalText = 'Mindful Sketch & Scribble';
    }

    if (attachedPhoto) {
      finalText += `\n[Photo Memory Attached]`;
    }

    if (!finalText && gratitudeList.length === 0 && !sketchData) return;

    globalSoundscape.playPaperFlip();

    onAddEntry({
      text: finalText,
      mood: selectedMood,
      type: activeTab,
      title: title.trim() || undefined,
      gratitudeItems: gratitudeList.length > 0 ? gratitudeList : undefined,
      sketchData: sketchData || attachedPhoto || undefined,
    });

    // Reset Form
    setText('');
    setTitle('');
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setAttachedPhoto(null);
    clearCanvas();
  };

  const handleRequestAiReflection = async (entry: JournalEntry) => {
    if (reflectingId) return;
    setReflectingId(entry.id);

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalText: entry.text, mood: entry.mood }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reflection && onUpdateEntryReflection) {
          onUpdateEntryReflection(entry.id, data.reflection);
        }
      }
    } catch (err) {
      console.error('Error fetching reflection:', err);
    } finally {
      setReflectingId(null);
    }
  };

  const activeEntry = entries.find((e) => e.id === activeViewEntryId);

  return (
    <div className="space-y-6 text-[#2C2018]">
      {/* Top Quiet Luxury Journal Header */}
      <div className="bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] p-5 rounded-[28px] border border-neutral-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#818cf8]/10 text-[#818cf8] rounded-2xl border border-[#818cf8]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-[#2C2018]">Cozy Personal Notebook</h2>
            <p className="text-xs text-neutral-500 font-serif italic">
              Encrypted, private space for your feelings, dreams, and mindful gratitude.
            </p>
          </div>
        </div>

        {/* Paper & Font Switcher Controls */}
        <div className="flex items-center gap-2">
          {/* Paper Style Selector */}
          <div className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-full border border-neutral-200">
            {PAPER_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setPaperStyle(style)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-serif transition ${
                  paperStyle.id === style.id ? 'bg-white text-[#2C2018] shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {style.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Font Selector */}
          <button
            onClick={() => {
              const nextIdx = (FONT_STYLES.findIndex((f) => f.id === fontStyle.id) + 1) % FONT_STYLES.length;
              setFontStyle(FONT_STYLES[nextIdx]);
            }}
            className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-full text-xs transition shadow-xs flex items-center gap-1"
            title="Switch Typography"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px] font-serif font-medium">{fontStyle.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Main Journaling Workspace: Notebook Card */}
      <div className={`p-6 sm:p-8 rounded-[36px] border shadow-xl relative transition-colors duration-300 ${paperStyle.bgClass} ${paperStyle.borderClass}`}>
        {/* Bookmark Ribbon Decor */}
        <div className="absolute top-0 right-12 w-6 h-14 bg-[#818cf8] rounded-b-md shadow-md flex items-end justify-center pb-1">
          <Bookmark className="w-3.5 h-3.5 text-white/80" />
        </div>

        {/* Journal Modes Tab Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-neutral-200/60 mb-6">
          {[
            { id: 'free', label: 'Free Thoughts', icon: PenTool },
            { id: 'voice', label: 'Voice Journal', icon: Mic },
            { id: 'gratitude', label: 'Gratitude Log', icon: Sparkles },
            { id: 'dream', label: 'Dream Sanctuary', icon: Flame },
            { id: 'sketch', label: 'Sketch & Draw', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as JournalType)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-serif transition-all ${
                  isSelected
                    ? 'bg-[#2C2018] text-white font-medium shadow-sm'
                    : 'bg-white/70 hover:bg-white text-neutral-600 border border-neutral-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Writing / Drawing Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Entry Title (Optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-transparent border-b border-neutral-300/60 focus:border-[#818cf8] outline-hidden text-lg sm:text-xl font-bold placeholder-neutral-400/80 pb-2 ${fontStyle.fontClass}`}
            />
          </div>

          {/* Mode 1: Gratitude Prompts */}
          {activeTab === 'gratitude' && (
            <div className="space-y-3 p-4 bg-white/60 rounded-2xl border border-amber-200/50">
              <span className="text-xs font-serif font-bold text-[#D4A373] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 3 Savoring Blessings of Today
              </span>
              <input
                type="text"
                placeholder="1. A comforting warm detail (e.g. morning chai, fresh breeze)..."
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                className="w-full p-2.5 bg-white/80 rounded-xl border border-neutral-200 text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#D4A373]"
              />
              <input
                type="text"
                placeholder="2. A kind connection or smile..."
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                className="w-full p-2.5 bg-white/80 rounded-xl border border-neutral-200 text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#D4A373]"
              />
              <input
                type="text"
                placeholder="3. Something I appreciate about myself..."
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                className="w-full p-2.5 bg-white/80 rounded-xl border border-neutral-200 text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#D4A373]"
              />
            </div>
          )}

          {/* Mode 2: Voice Dictation Interactive Visualizer */}
          {activeTab === 'voice' && (
            <div className="flex items-center justify-between p-4 bg-white/75 rounded-2xl border border-neutral-200/80">
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleVoiceRecording}
                  className={`p-3.5 rounded-full shadow-md transition ${
                    isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#818cf8] text-white hover:bg-[#727be0]'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
                <div>
                  <h4 className="font-serif text-xs font-bold">
                    {isRecording ? 'Listening softly to your voice...' : 'Tap microphone to speak'}
                  </h4>
                  <p className="text-[11px] text-neutral-500 font-serif italic">
                    {isRecording ? 'Spoken words are transcribed into your notes automatically.' : 'Speak freely without typing.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Handwrite / Sketch Canvas */}
          {activeTab === 'sketch' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-serif text-neutral-600 px-1">
                <span>Freehand Drawing Pad</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-full border">
                    {['#2C2018', '#818cf8', '#94A47A', '#D4A373', '#5B8E7D'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDrawColor(c)}
                        className={`w-4 h-4 rounded-full border ${drawColor === c ? 'scale-125 shadow-xs' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1.5 bg-white border rounded-full text-neutral-500 hover:text-rose-600"
                    title="Clear sketch"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={220}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-52 bg-white/90 border border-neutral-300/80 rounded-2xl shadow-inner cursor-crosshair touch-none"
              />
            </div>
          )}

          {/* Main Text Area for Journal Writing */}
          {activeTab !== 'sketch' && (
            <div>
              <textarea
                rows={6}
                placeholder={
                  activeTab === 'dream'
                    ? 'Record your dream sanctuary... What imagery, emotions, or symbols stood out?'
                    : 'Pour your heart out freely... Nothing is judged here.'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full p-4 bg-white/80 rounded-2xl border border-neutral-200/80 focus:border-[#818cf8] focus:ring-1 focus:ring-[#818cf8] outline-hidden text-sm leading-relaxed ${fontStyle.fontClass}`}
              />
            </div>
          )}

          {/* Attached Photo Preview if any */}
          {attachedPhoto && (
            <div className="relative inline-block mt-2">
              <img src={attachedPhoto} alt="Attached memory" className="w-24 h-24 object-cover rounded-xl border shadow-sm" />
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full text-xs shadow-md"
              >
                ×
              </button>
            </div>
          )}

          {/* Emotional Stickers Selection Bar (Replacing Generic Emojis) */}
          <div className="space-y-2 pt-2 border-t border-neutral-200/60">
            <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-neutral-500">
              Select Emotional Sticker Stamp:
            </span>
            <div className="flex flex-wrap gap-2">
              {EMOTIONAL_STICKERS.map((stk) => {
                const isSelected = selectedMood === stk.id;
                return (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => setSelectedMood(stk.id as JournalEntry['mood'])}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? `${stk.color} font-bold shadow-xs scale-105 border-neutral-800`
                        : 'bg-white/80 text-neutral-600 border-neutral-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-sm">{stk.sticker}</span>
                    <span>{stk.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hidden file input for Photo Attachment */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-200/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/80 hover:bg-white border border-neutral-200 text-neutral-700 rounded-full text-xs font-serif flex items-center gap-1.5 shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Add Photo Memory</span>
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="px-6 py-2.5 bg-[#2C2018] hover:bg-neutral-800 text-white rounded-full text-xs font-serif font-bold shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Sealed Entry</span>
            </motion.button>
          </div>
        </form>
      </div>

      {/* Past Entries Archive & Monthly Index */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#2C2018] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#818cf8]" />
            <span>Cherished Entries Archive ({entries.length})</span>
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center bg-white/60 rounded-[28px] border border-dashed border-neutral-300">
            <p className="font-serif italic text-xs text-neutral-500">
              Your notebook is fresh and waiting. Write your first gentle reflection above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => {
              const stickerObj = EMOTIONAL_STICKERS.find((s) => s.id === entry.mood) || EMOTIONAL_STICKERS[0];
              const isReflecting = reflectingId === entry.id;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  className="bg-white/85 backdrop-blur-md p-5 rounded-[28px] border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-serif border flex items-center gap-1 ${stickerObj.color}`}>
                        <span>{stickerObj.sticker}</span>
                        <span>{stickerObj.name}</span>
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">{entry.date}</span>
                    </div>

                    {entry.title && (
                      <h4 className="font-serif text-sm font-bold text-[#2C2018]">{entry.title}</h4>
                    )}

                    <p className="font-serif text-xs text-neutral-700 leading-relaxed whitespace-pre-line line-clamp-4">
                      {entry.text}
                    </p>

                    {/* Sketch or photo preview */}
                    {entry.sketchData && (
                      <img
                        src={entry.sketchData}
                        alt="Memory visual"
                        className="w-full h-32 object-contain bg-neutral-50 rounded-xl border"
                      />
                    )}

                    {/* AI Reflection Box if generated */}
                    {entry.aiReflection && (
                      <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#818cf8]/20 text-xs font-serif italic text-neutral-700 leading-relaxed">
                        <span className="font-bold text-[#818cf8] not-italic block mb-0.5">✨ Serenity's Reflection:</span>
                        "{entry.aiReflection}"
                      </div>
                    )}
                  </div>

                  {/* Entry Card Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {!entry.aiReflection && (
                        <button
                          onClick={() => handleRequestAiReflection(entry)}
                          disabled={isReflecting}
                          className="px-2.5 py-1 bg-[#818cf8]/10 hover:bg-[#818cf8]/20 text-[#818cf8] rounded-full text-[11px] font-serif transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isReflecting ? 'Reflecting...' : 'Seek AI Reflection'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => onShareWithSerenity(entry.text)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-[11px] font-serif transition flex items-center gap-1"
                        title="Bring into Chat with Serenity"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Discuss with Serenity</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
