/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Phone,
  MessageSquare,
  UserCheck,
  Heart,
  Globe,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';
import { TrustedContact } from '../types';

interface ProfessionalSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContact?: TrustedContact | null;
  onSaveTrustedContact?: (contact: TrustedContact) => void;
}

export default function ProfessionalSupportModal({
  isOpen,
  onClose,
  trustedContact,
  onSaveTrustedContact,
}: ProfessionalSupportModalProps) {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'grounding' | 'directory' | 'trusted'>('hotlines');
  const [editingContact, setEditingContact] = useState(false);
  const [contactName, setContactName] = useState(trustedContact?.name || '');
  const [contactPhone, setContactPhone] = useState(trustedContact?.phone || '');
  const [contactRelation, setContactRelation] = useState(trustedContact?.relationship || 'Close Friend');

  // Grounding 5-4-3-2-1 interactive state
  const [groundingStep, setGroundingStep] = useState(5);

  if (!isOpen) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    onSaveTrustedContact?.({
      name: contactName.trim(),
      phone: contactPhone.trim(),
      relationship: contactRelation.trim(),
    });
    setEditingContact(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#FBF9F5] border border-neutral-200/80 rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#2C2018]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/30 rounded-2xl border border-red-500/40">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold tracking-tight">Support & Crisis Resources</h2>
              <p className="text-xs text-slate-300 font-serif italic">
                You are never alone. Confidential, compassionate help is available 24/7.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-neutral-200 bg-[#F4ECDD]/50 px-4 py-2 gap-2 text-xs font-serif overflow-x-auto">
          <button
            onClick={() => setActiveTab('hotlines')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hotlines'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200/60'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> 24/7 Hotlines
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grounding'
                ? 'bg-[#2C2018] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-[#94A47A] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200/60'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Professional Care
          </button>
          <button
            onClick={() => setActiveTab('trusted')}
            className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'trusted'
                ? 'bg-[#C67C58] text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Trusted Contact
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'hotlines' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 text-xs font-serif text-red-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Immediate Crisis Bridge</p>
                  <p className="text-red-700 leading-relaxed mt-0.5">
                    If you are thinking about self-harm or experiencing an overwhelming crisis, please reach out to trained professionals right now. Free, confidential, and available at all times.
                  </p>
                </div>
              </div>

              {/* Hotlines List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      USA & Canada
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#2C2018] mt-1">988 Suicide & Crisis Lifeline</h4>
                    <p className="text-xs text-neutral-500 font-serif">Call or text 988 anytime 24/7.</p>
                  </div>
                  <a
                    href="tel:988"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-serif font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call 988
                  </a>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Text Support
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#2C2018] mt-1">Crisis Text Line</h4>
                    <p className="text-xs text-neutral-500 font-serif">Text HOME to 741741 to connect with a counselor.</p>
                  </div>
                  <a
                    href="sms:741741?body=HOME"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-serif font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Text 741741
                  </a>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      LGBTQ+ Youth
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#2C2018] mt-1">The Trevor Project</h4>
                    <p className="text-xs text-neutral-500 font-serif">Call 1-866-488-7386 or text START to 678-678.</p>
                  </div>
                  <a
                    href="tel:18664887386"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-serif font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call TrevorLine
                  </a>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Global Directory
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#2C2018] mt-1">International Resources</h4>
                    <p className="text-xs text-neutral-500 font-serif">Befrienders Worldwide & IASP global index.</p>
                  </div>
                  <a
                    href="https://www.befrienders.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-serif font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5" /> View Global Index <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grounding' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm text-center space-y-4">
              <div className="max-w-md mx-auto space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C67C58] font-bold">
                  Somatic Anxiety Reset
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2C2018]">5-4-3-2-1 Sensory Grounding</h3>
                <p className="text-xs text-neutral-600 font-serif italic">
                  Reconnect with the physical world right here, right now.
                </p>
              </div>

              {/* Interactive Step Card */}
              <div className="p-6 bg-[#F4ECDD]/40 rounded-2xl border border-neutral-200 space-y-3 min-h-[160px] flex flex-col justify-center items-center">
                {groundingStep === 5 && (
                  <>
                    <span className="text-3xl font-serif font-extrabold text-[#C67C58]">5 THINGS</span>
                    <p className="font-serif text-sm font-semibold text-neutral-800">
                      Look around and name 5 things you can SEE right now.
                    </p>
                    <p className="text-xs text-neutral-500 font-serif italic">
                      (e.g., A speck of dust in the sunlight, the texture of your desk, the color of your shoes...)
                    </p>
                  </>
                )}
                {groundingStep === 4 && (
                  <>
                    <span className="text-3xl font-serif font-extrabold text-[#94A47A]">4 THINGS</span>
                    <p className="font-serif text-sm font-semibold text-neutral-800">
                      Touch and feel 4 things you can physically TOUCH.
                    </p>
                    <p className="text-xs text-neutral-500 font-serif italic">
                      (e.g., The fabric of your pants, your cool wristwatch, the smooth glass of a cup...)
                    </p>
                  </>
                )}
                {groundingStep === 3 && (
                  <>
                    <span className="text-3xl font-serif font-extrabold text-[#38bdf8]">3 THINGS</span>
                    <p className="font-serif text-sm font-semibold text-neutral-800">
                      Listen closely and identify 3 distinct sounds you can HEAR.
                    </p>
                    <p className="text-xs text-neutral-500 font-serif italic">
                      (e.g., A distant car, the hum of the refrigerator, your own quiet breath...)
                    </p>
                  </>
                )}
                {groundingStep === 2 && (
                  <>
                    <span className="text-3xl font-serif font-extrabold text-[#818cf8]">2 THINGS</span>
                    <p className="font-serif text-sm font-semibold text-neutral-800">
                      Notice 2 things you can SMELL around you.
                    </p>
                    <p className="text-xs text-neutral-500 font-serif italic">
                      (e.g., Soap on your hands, coffee, fresh air from an open window...)
                    </p>
                  </>
                )}
                {groundingStep === 1 && (
                  <>
                    <span className="text-3xl font-serif font-extrabold text-emerald-600">1 THING</span>
                    <p className="font-serif text-sm font-semibold text-neutral-800">
                      Notice 1 thing you can TASTE, or take a sip of cool water.
                    </p>
                    <p className="text-xs text-emerald-700 font-serif font-bold">
                      You have returned to the present moment. You are safe here.
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setGroundingStep((prev) => (prev > 1 ? prev - 1 : 5))}
                  className="px-6 py-2.5 bg-[#2C2018] text-white rounded-full text-xs font-serif font-bold transition hover:bg-neutral-800"
                >
                  {groundingStep > 1 ? `Completed (Move to ${groundingStep - 1})` : 'Restart Grounding Cycle'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2C2018] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#94A47A]" /> Finding a Professional Therapist or Psychiatrist
                </h4>
                <p className="text-xs text-neutral-600 font-serif leading-relaxed">
                  Serenity is an AI companion for emotional clarity, not a substitute for licensed clinical therapy. If you are seeking professional diagnosis, medication management, or psychotherapy, these verified directories can help:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif">
                  <a
                    href="https://www.psychologytoday.com/us/therapists"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between text-[#2C2018]"
                  >
                    <span>Psychology Today Directory</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                  <a
                    href="https://www.goodtherapy.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between text-[#2C2018]"
                  >
                    <span>GoodTherapy Network</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                  <a
                    href="https://openpathcollective.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between text-[#2C2018]"
                  >
                    <span>Open Path Collective (Affordable)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                  <a
                    href="https://findtreatment.gov/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between text-[#2C2018]"
                  >
                    <span>SAMHSA Treatment Finder</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trusted' && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C2018]">Designated Trusted Contact</h4>
                  <p className="text-xs text-neutral-500 font-serif">
                    A close friend or loved one you can alert with one tap during difficult moments.
                  </p>
                </div>
                {!editingContact && trustedContact && (
                  <button
                    onClick={() => setEditingContact(true)}
                    className="text-xs font-serif text-[#C67C58] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {!editingContact && trustedContact ? (
                <div className="p-4 bg-[#F4ECDD]/40 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#2C2018]">{trustedContact.name}</h5>
                    <p className="text-xs text-neutral-500 font-serif">
                      {trustedContact.relationship} • {trustedContact.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${trustedContact.phone}`}
                      className="px-3.5 py-1.5 bg-[#94A47A] text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={`sms:${trustedContact.phone}?body=Hey, I am having a rough moment and could use some company. Are you free to talk?`}
                      className="px-3.5 py-1.5 bg-[#C67C58] text-white rounded-xl text-xs font-serif font-bold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Text
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveContact} className="space-y-3">
                  <div>
                    <label className="block text-xs font-serif font-semibold text-neutral-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah / Mom / Alex"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#C67C58]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-serif font-semibold text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 (555) 019-2834"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#C67C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-serif font-semibold text-neutral-700 mb-1">
                        Relationship
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best Friend, Sister"
                        value={contactRelation}
                        onChange={(e) => setContactRelation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-[#C67C58]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {trustedContact && (
                      <button
                        type="button"
                        onClick={() => setEditingContact(false)}
                        className="px-4 py-1.5 text-xs font-serif text-neutral-600 hover:bg-neutral-100 rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-[#C67C58] text-white text-xs font-serif font-bold rounded-xl shadow"
                    >
                      Save Trusted Contact
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
