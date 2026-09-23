/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Cloud,
  LogOut,
  X,
  ArrowRight,
} from 'lucide-react';
import globalSoundscape from './SoundscapeEngine';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'apple' | 'email' | 'guest';
  isSynced: boolean;
  joinedDate: string;
  preferredIntent?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'options' | 'email' | 'onboarding'>('options');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedIntent, setSelectedIntent] = useState('Inner peace & stress relief');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    globalSoundscape.playSingingBowlChime(440);
    const mockGoogleUser: UserProfile = {
      id: `google-usr-${Date.now()}`,
      name: nameInput.trim() || 'Alex Rivera',
      email: 'alex.rivera@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      provider: 'google',
      isSynced: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      preferredIntent: selectedIntent,
    };
    onLogin(mockGoogleUser);
    onClose();
  };

  const handleGuestMode = () => {
    globalSoundscape.playPaperFlip();
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Kind Soul (Guest)',
      email: 'guest@offline-vault.local',
      provider: 'guest',
      isSynced: false,
      joinedDate: 'Today',
      preferredIntent: selectedIntent,
    };
    onLogin(guestUser);
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    globalSoundscape.playSingingBowlChime(528);
    const emailUser: UserProfile = {
      id: `email-${Date.now()}`,
      name: nameInput.trim() || emailInput.split('@')[0],
      email: emailInput.trim(),
      provider: 'email',
      isSynced: true,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      preferredIntent: selectedIntent,
    };
    onLogin(emailUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[36px] border border-neutral-200 shadow-2xl p-6 sm:p-8 max-w-md w-full relative text-[#2C2018] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full bg-neutral-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#818cf8]/15 text-[#818cf8] mx-auto flex items-center justify-center border border-[#818cf8]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight">
            {currentUser ? 'Your Serenity Sanctuary' : 'Welcome to Serenity'}
          </h3>
          <p className="text-xs text-neutral-500 font-serif italic">
            {currentUser
              ? 'Encrypted vault active with automatic mood and journal cloud backup.'
              : 'Sign in to sync your reflections, journals, and mindful streaks across all devices.'}
          </p>
        </div>

        {/* Case 1: Already Logged In Details */}
        {currentUser ? (
          <div className="space-y-5">
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-neutral-200 flex items-center gap-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-white shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#818cf8] text-white flex items-center justify-center font-serif font-bold text-base">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-serif text-sm font-bold text-[#2C2018]">{currentUser.name}</h4>
                <p className="text-xs text-neutral-500 font-mono">{currentUser.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-serif text-[#5B8E7D]">
                  <Cloud className="w-3 h-3" />
                  <span>{currentUser.isSynced ? 'Cloud Vault Synced & Encrypted' : 'Offline Mode (Local Storage)'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-serif text-neutral-600 bg-white p-3 rounded-xl border">
              <p>
                <strong>Member Since:</strong> {currentUser.joinedDate}
              </p>
              <p>
                <strong>Focus Intent:</strong> {currentUser.preferredIntent || 'Inner stillness'}
              </p>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-700 rounded-2xl text-xs font-serif font-bold transition flex items-center justify-center gap-2 border"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        ) : (
          /* Case 2: Onboarding & Login Options */
          <div className="space-y-4">
            {authMode === 'options' && (
              <div className="space-y-3">
                {/* Continue with Google */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 border-2 border-neutral-200/90 rounded-2xl text-xs sm:text-sm font-serif font-bold text-[#2C2018] shadow-xs flex items-center justify-center gap-3 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Continue with Apple */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-serif font-bold shadow-xs flex items-center justify-center gap-3 transition"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.02-.49 2.63-1.24z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                {/* Email / Password button */}
                <button
                  onClick={() => setAuthMode('email')}
                  className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-2xl text-xs font-serif font-semibold transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Continue with Email</span>
                </button>

                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-serif italic text-neutral-400">
                    or continue privately
                  </span>
                </div>

                {/* Guest Mode */}
                <button
                  onClick={handleGuestMode}
                  className="w-full py-3 px-4 bg-[#FAF7F2] hover:bg-[#F5EFEB] text-neutral-700 rounded-2xl text-xs font-serif font-medium border border-neutral-200 transition"
                >
                  Enter as Guest (Local Device Only)
                </button>
              </div>
            )}

            {authMode === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Maya)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3 bg-neutral-100 rounded-2xl text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#818cf8]"
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full p-3 bg-neutral-100 rounded-2xl text-xs font-serif outline-hidden focus:ring-1 focus:ring-[#818cf8]"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#2C2018] text-white rounded-2xl text-xs font-serif font-bold transition shadow-sm"
                >
                  Sign In / Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('options')}
                  className="w-full text-center text-xs font-serif text-neutral-500 hover:text-neutral-800"
                >
                  ← Back to options
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
