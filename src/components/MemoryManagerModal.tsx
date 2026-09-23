/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConsentedMemory } from '../types';
import { Brain, Trash2, Plus, X, Shield, Sparkles, Check, Heart } from 'lucide-react';

interface MemoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: ConsentedMemory[];
  onAddMemory: (memory: Omit<ConsentedMemory, 'id' | 'addedAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export default function MemoryManagerModal({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAllMemories,
}: MemoryManagerModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<ConsentedMemory['category']>('personal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    onAddMemory({
      key: key.trim(),
      value: value.trim(),
      category,
    });
    setKey('');
    setValue('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FBF9F5] border border-neutral-200/80 rounded-[32px] shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden text-[#2C2018]"
      >
        {/* Header */}
        <div className="p-6 bg-[#2C2018] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Consented Memory</h3>
              <p className="text-xs text-neutral-300 font-serif italic">
                What Serenity remembers to support you deeply
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Promise Banner */}
        <div className="bg-[#94A47A]/15 px-5 py-3 border-b border-neutral-200/60 flex items-center gap-2 text-xs font-serif text-[#2C2018]">
          <Shield className="w-4 h-4 text-[#94A47A] flex-shrink-0" />
          <span>All memories remain strictly private on your device. You have total control.</span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {showAddForm ? (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-xs text-[#2C2018]">Add a New Memory for Serenity</h4>
              <div>
                <label className="block text-[11px] font-serif text-neutral-600 mb-1">Topic / Key</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Favorite tea, Final exams date, Sibling name"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#94A47A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-serif text-neutral-600 mb-1">Detail / Memory</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Finals are on May 12th; gets nervous about calculus."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#94A47A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-serif text-neutral-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ConsentedMemory['category'])}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-none"
                >
                  <option value="personal">Personal Preferences</option>
                  <option value="grounding">Grounding Anchors</option>
                  <option value="exam">Exams & Milestones</option>
                  <option value="family">Family & Friends</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-serif text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#94A47A] text-white text-xs font-serif font-bold rounded-xl shadow"
                >
                  Save Memory
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl text-xs font-serif font-bold text-neutral-700 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-[#94A47A]" /> Add Consented Memory
            </button>
          )}

          {memories.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-neutral-400 font-serif">
              <Sparkles className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs italic">No memories stored yet.</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Serenity only stores what you share to make conversations warm and personal.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A47A] bg-[#94A47A]/15 px-2 py-0.5 rounded-md">
                        {m.category}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-[#2C2018]">{m.key}</h4>
                    </div>
                    <p className="text-xs text-neutral-600 font-serif">{m.value}</p>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete this memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {memories.length > 0 && (
          <div className="p-4 bg-[#F4ECDD]/40 border-t border-neutral-200/60 flex items-center justify-between">
            <span className="text-[11px] font-serif text-neutral-500">
              {memories.length} item{memories.length > 1 ? 's' : ''} stored locally
            </span>
            <button
              onClick={() => {
                if (window.confirm('Clear all stored memories for Serenity?')) {
                  onClearAllMemories();
                }
              }}
              className="text-xs font-serif text-red-600 hover:underline font-medium"
            >
              Clear All Memories
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
