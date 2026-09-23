/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export type CharacterExpression = 'idle' | 'breathing' | 'listening' | 'speaking' | 'warm_smile' | 'crisis';

interface CompanionCharacterProps {
  expression: CharacterExpression;
  accentColor?: string;
}

interface EyeData {
  cx: number;
  cy: number;
  r: number;
  scaleY: number;
  rotate: number;
}

interface EyesConfig {
  leftEye: EyeData;
  rightEye: EyeData;
  eyebrows: boolean;
  eyebrowAngle: number;
  closed?: boolean;
  curved?: boolean;
}

export default function CompanionCharacter({ expression, accentColor = '#a855f7' }: CompanionCharacterProps) {
  const instanceId = React.useId().replace(/:/g, '-');
  const bodyGradId = `bodyGrad-${instanceId}`;
  const highlightGradId = `highlightGrad-${instanceId}`;

  // Eye coordinates and sizes based on expression
  const getEyesConfig = (): EyesConfig => {
    switch (expression) {
      case 'crisis':
        // Sad / concerned eyes
        return {
          leftEye: { cx: 40, cy: 48, r: 4, scaleY: 1, rotate: 15 },
          rightEye: { cx: 60, cy: 48, r: 4, scaleY: 1, rotate: -15 },
          eyebrows: true,
          eyebrowAngle: 15,
        };
      case 'listening':
        // Wide alert curious eyes
        return {
          leftEye: { cx: 38, cy: 46, r: 5.5, scaleY: 1, rotate: 0 },
          rightEye: { cx: 62, cy: 46, r: 5.5, scaleY: 1, rotate: 0 },
          eyebrows: false,
          eyebrowAngle: 0,
        };
      case 'speaking':
        // Semi-closed expressive eyes
        return {
          leftEye: { cx: 39, cy: 47, r: 5, scaleY: 0.8, rotate: 0 },
          rightEye: { cx: 61, cy: 47, r: 5, scaleY: 0.8, rotate: 0 },
          eyebrows: true,
          eyebrowAngle: 0,
        };
      case 'warm_smile':
        // Happy squinting curved-up eyes
        return {
          leftEye: { cx: 39, cy: 48, r: 5, scaleY: 0.3, rotate: 0 },
          rightEye: { cx: 61, cy: 48, r: 5, scaleY: 0.3, rotate: 0 },
          eyebrows: true,
          eyebrowAngle: -10,
          curved: true,
        };
      case 'breathing':
        // Relaxed closed eyes (gently curved down/sleeping)
        return {
          leftEye: { cx: 39, cy: 49, r: 5, scaleY: 0.1, rotate: 0 },
          rightEye: { cx: 61, cy: 49, r: 5, scaleY: 0.1, rotate: 0 },
          eyebrows: false,
          eyebrowAngle: 0,
          closed: true,
        };
      case 'idle':
      default:
        // Normal open friendly eyes
        return {
          leftEye: { cx: 39, cy: 47, r: 5, scaleY: 1, rotate: 0 },
          rightEye: { cx: 61, cy: 47, r: 5, scaleY: 1, rotate: 0 },
          eyebrows: true,
          eyebrowAngle: 0,
        };
    }
  };

  const eyes = getEyesConfig();

  // Mouth path based on expression
  const getMouthPath = () => {
    switch (expression) {
      case 'crisis':
        // Small worried frown or straight line
        return 'M 44 60 Q 50 56 56 60';
      case 'listening':
        // Slightly parted interested mouth
        return 'M 45 58 Q 50 63 55 58';
      case 'speaking':
        // Open talking oval/mouth
        return 'M 45 58 Q 50 66 55 58';
      case 'warm_smile':
        // Wide happy smile
        return 'M 42 56 Q 50 68 58 56';
      case 'breathing':
        // Tiny gentle breathing mouth (circle/whistle shape)
        return 'M 48 59 Q 50 61 52 59';
      case 'idle':
      default:
        // Gentle neutral smile
        return 'M 43 57 Q 50 63 57 57';
    }
  };

  // Pulse animation for breathing mode or idle
  const bodyVariants = {
    idle: {
      scale: [1, 1.02, 1],
      y: [0, -3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    breathing: {
      scale: [1, 1.15, 0.98, 1],
      y: [0, -8, 2, 0],
      transition: {
        duration: 8, // slow breath cycle
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    listening: {
      scale: [1, 1.01, 1],
      y: [0, -1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    speaking: {
      scale: [1.02, 0.99, 1.03, 1],
      y: [0, -2, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    warm_smile: {
      scale: [1, 1.04, 1],
      y: [0, -4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    crisis: {
      scale: [1, 0.98, 1],
      y: [0, 1, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="relative w-full h-full mx-auto flex items-center justify-center">
      {/* Soft background aura/glow */}
      <motion.div
        className="absolute w-[70%] h-[70%] rounded-full filter blur-2xl opacity-40"
        style={{ backgroundColor: accentColor }}
        animate={{
          scale: expression === 'breathing' ? [1, 1.3, 0.9, 1] : [1, 1.1, 1],
          opacity: expression === 'breathing' ? [0.3, 0.6, 0.2, 0.3] : [0.3, 0.45, 0.3],
        }}
        transition={{
          duration: expression === 'breathing' ? 8 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Companion Character SVG */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-xl select-none"
        variants={bodyVariants}
        animate={expression}
      >
        <defs>
          {/* Main body gradient */}
          <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="60%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          {/* Accent glow on top */}
          <radialGradient id={highlightGradId} cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Character Body (A cute cloud-like or rounded droplet-like form) */}
        <path
          d="M 50 15 
             C 72 15, 85 30, 85 52 
             C 85 75, 70 85, 50 85 
             C 30 85, 15 75, 15 52 
             C 15 30, 28 15, 50 15 Z"
          fill={`url(#${bodyGradId})`}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />

        {/* Highlight overlay for nice 3D depth */}
        <path
          d="M 50 15 
             C 72 15, 85 30, 85 52 
             C 85 75, 70 85, 50 85 
             C 30 85, 15 75, 15 52 
             C 15 30, 28 15, 50 15 Z"
          fill={`url(#${highlightGradId})`}
          opacity="0.6"
        />

        {/* Soft Pink Cheeks */}
        <motion.ellipse
          cx="28"
          cy="56"
          rx="6"
          ry="3.5"
          fill="#f43f5e"
          opacity={expression === 'crisis' ? '0.15' : '0.25'}
          animate={{ scale: expression === 'warm_smile' ? 1.2 : 1 }}
        />
        <motion.ellipse
          cx="72"
          cy="56"
          rx="6"
          ry="3.5"
          fill="#f43f5e"
          opacity={expression === 'crisis' ? '0.15' : '0.25'}
          animate={{ scale: expression === 'warm_smile' ? 1.2 : 1 }}
        />

        {/* Eyebrows */}
        {eyes.eyebrows && (
          <>
            {/* Left Eyebrow */}
            <motion.path
              d="M 32 38 Q 38 37 44 40"
              stroke="#4b5563"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={expression === 'crisis' ? { y: 2, rotate: 10 } : { y: 0, rotate: 0 }}
            />
            {/* Right Eyebrow */}
            <motion.path
              d="M 56 40 Q 62 37 68 38"
              stroke="#4b5563"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={expression === 'crisis' ? { y: 2, rotate: -10 } : { y: 0, rotate: 0 }}
            />
          </>
        )}

        {/* Eyes */}
        {/* Left Eye */}
        {eyes.closed ? (
          <path
            d="M 34 50 Q 39 53 44 50"
            stroke="#4b5563"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : eyes.curved ? (
          <path
            d="M 33 51 Q 38 45 43 51"
            stroke="#4b5563"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <motion.ellipse
            cx={eyes.leftEye.cx}
            cy={eyes.leftEye.cy}
            rx={eyes.leftEye.r}
            ry={eyes.leftEye.r * eyes.leftEye.scaleY}
            fill="#374151"
            animate={expression === 'idle' ? { scaleY: [1, 0.1, 1, 1] } : {}}
            transition={expression === 'idle' ? { repeat: Infinity, duration: 4, repeatDelay: 3 } : {}}
          />
        )}

        {/* Right Eye */}
        {eyes.closed ? (
          <path
            d="M 56 50 Q 61 53 66 50"
            stroke="#4b5563"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : eyes.curved ? (
          <path
            d="M 57 51 Q 62 45 67 51"
            stroke="#4b5563"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <motion.ellipse
            cx={eyes.rightEye.cx}
            cy={eyes.rightEye.cy}
            rx={eyes.rightEye.r}
            ry={eyes.rightEye.r * eyes.rightEye.scaleY}
            fill="#374151"
            animate={expression === 'idle' ? { scaleY: [1, 0.1, 1, 1] } : {}}
            transition={expression === 'idle' ? { repeat: Infinity, duration: 4, repeatDelay: 3.1 } : {}}
          />
        )}

        {/* Sweet expressive eye shines for non-closed states */}
        {!eyes.closed && !eyes.curved && (
          <>
            <ellipse cx={eyes.leftEye.cx - 1.5} cy={eyes.leftEye.cy - 1.5} rx="1.5" ry="1.5" fill="#ffffff" />
            <ellipse cx={eyes.rightEye.cx - 1.5} cy={eyes.rightEye.cy - 1.5} rx="1.5" ry="1.5" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        <motion.path
          d={getMouthPath()}
          stroke="#4b5563"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ d: getMouthPath() }}
          transition={{ duration: 0.2 }}
        />
      </motion.svg>
    </div>
  );
}
