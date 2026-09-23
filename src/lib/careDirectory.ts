/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProviderType = 'Therapist' | 'Coach' | 'Psychologist' | 'Psychiatrist';
export type ModalityType = 'In-person' | 'Video' | 'Phone';

export interface Provider {
  id: string;
  name: string;
  credentials: string;
  type: ProviderType;
  specialties: string[];
  modalities: ModalityType[];
  languages: string[];
  location: string;
  bio: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    bookUrl?: string;
  };
}

export const SAMPLE_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Dr. Evelyn Moss',
    credentials: 'PhD, Licensed Clinical Psychologist',
    type: 'Psychologist',
    specialties: ['Anxiety', 'Burnout', 'Grief', 'Mindfulness'],
    modalities: ['Video', 'In-person'],
    languages: ['English', 'Spanish'],
    location: 'Oakridge Wellness Center & Online',
    bio: 'Warm, collaborative, and evidence-based clinical psychologist specializing in stress regulation, trauma recovery, and holistic emotional resilience.',
    contact: {
      phone: '555-0199 (Sample)',
      email: 'dr.evelyn.moss.sample@serenity.io',
      website: 'https://moss-psychology-sample.io',
      bookUrl: '#book',
    },
  },
  {
    id: 'prov-2',
    name: 'Coach Marcus Vance',
    credentials: 'MFA, Board Certified Wellness Coach',
    type: 'Coach',
    specialties: ['Burnout', 'Life Transitions', 'Creative Block'],
    modalities: ['Video', 'Phone'],
    languages: ['English'],
    location: 'Online Only',
    bio: 'Dedicated creative life coach focusing on intentional pacing, burnout prevention, and guiding individuals through critical personal and professional transitions.',
    contact: {
      phone: '555-0142 (Sample)',
      email: 'marcus.vance.coach.sample@serenity.io',
      website: 'https://vance-coaching-sample.io',
      bookUrl: '#book',
    },
  },
  {
    id: 'prov-3',
    name: 'Sarah Jenkins, LCSW',
    credentials: 'Licensed Clinical Social Worker',
    type: 'Therapist',
    specialties: ['Grief', 'Self-Esteem', 'Relationship Stress'],
    modalities: ['In-person', 'Video', 'Phone'],
    languages: ['English', 'ASL'],
    location: 'Riverbed Therapy Collective & Online',
    bio: 'Deeply compassionate therapist offering a gentle somatic-informed sanctuary for processing deep grief, building self-love, and navigating interpersonal dynamics.',
    contact: {
      phone: '555-0177 (Sample)',
      email: 'sarah.jenkins.lcsw.sample@serenity.io',
      website: 'https://jenkins-therapy-sample.io',
      bookUrl: '#book',
    },
  },
  {
    id: 'prov-4',
    name: 'Dr. Raymond Patel',
    credentials: 'MD, Adult Psychiatrist & Neuroscientist',
    type: 'Psychiatrist',
    specialties: ['Sleep', 'ADHD', 'Mood Disorders', 'Anxiety'],
    modalities: ['Video'],
    languages: ['English', 'Hindi', 'Gujarati'],
    location: 'Metropolitan Psych Associates & Online',
    bio: 'Thoughtful, conservative psychopharmacologist who emphasizes the mind-body axis, sleep architecture optimization, and highly personalized medical guidance.',
    contact: {
      phone: '555-0155 (Sample)',
      email: 'dr.raymond.patel.sample@serenity.io',
      website: 'https://patel-psychiatry-sample.io',
      bookUrl: '#book',
    },
  },
];
