/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type StickerType =
  | 'leaf'
  | 'flower'
  | 'sun'
  | 'moon'
  | 'heart'
  | 'tea'
  | 'book'
  | 'candle'
  | 'cloud'
  | 'rain'
  | 'star'
  | 'feather';

interface StickerProps {
  type: StickerType;
  className?: string;
  size?: number;
  locked?: boolean;
}

export default function Sticker({ type, className = '', size = 64, locked = false }: StickerProps) {
  // Common container with sticker-like paper cut style (white border + organic shadow)
  const filterId = `shadow-${type}`;

  const renderSVGContent = () => {
    switch (type) {
      case 'leaf':
        // Soft Sage Leaf
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Main stem */}
            <path
              d="M 15 80 Q 30 50 50 20"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaf shape */}
            <path
              d="M 50 20 Q 75 35 60 65 Q 45 80 15 80 Q 25 55 50 20 Z"
              fill="#94A47A"
              stroke="#2C2018"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Leaf veins */}
            <path
              d="M 32 65 Q 40 55 52 45 M 24 75 Q 35 70 42 62 M 45 45 Q 52 40 56 32"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Small accent flower sticker */}
            <circle cx="20" cy="30" r="4" fill="#D3A29A" stroke="#2C2018" strokeWidth="1.5" />
          </g>
        );

      case 'flower':
        // Dusty Rose Blossom
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Stem */}
            <path
              d="M 50 50 Q 52 75 45 85"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Side leaves */}
            <path
              d="M 49 68 Q 35 65 30 55 Q 42 55 49 68 Z"
              fill="#94A47A"
              stroke="#2C2018"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Flower Petals */}
            <g>
              {/* Petal back */}
              <circle cx="50" cy="30" r="16" fill="#D3A29A" stroke="#2C2018" strokeWidth="3" />
              <circle cx="34" cy="42" r="15" fill="#D3A29A" stroke="#2C2018" strokeWidth="3" />
              <circle cx="66" cy="42" r="15" fill="#D3A29A" stroke="#2C2018" strokeWidth="3" />
              <circle cx="42" cy="56" r="15" fill="#D3A29A" stroke="#2C2018" strokeWidth="3" />
              <circle cx="58" cy="56" r="15" fill="#D3A29A" stroke="#2C2018" strokeWidth="3" />
              {/* Center disc */}
              <circle cx="50" cy="45" r="10" fill="#EFE4D2" stroke="#2C2018" strokeWidth="3" />
              <circle cx="50" cy="45" r="3" fill="#C67C58" />
            </g>
          </g>
        );

      case 'sun':
        // Terracotta Radiance
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Sun rays */}
            <g stroke="#2C2018" strokeWidth="3" strokeLinecap="round">
              <line x1="50" y1="15" x2="50" y2="5" />
              <line x1="50" y1="85" x2="50" y2="95" />
              <line x1="15" y1="50" x2="5" y2="50" />
              <line x1="85" y1="50" x2="95" y2="50" />
              <line x1="25" y1="25" x2="18" y2="18" />
              <line x1="75" y1="75" x2="82" y2="82" />
              <line x1="75" y1="25" x2="82" y2="18" />
              <line x1="25" y1="75" x2="18" y2="82" />
            </g>
            {/* Center sun */}
            <circle cx="50" cy="50" r="22" fill="#C67C58" stroke="#2C2018" strokeWidth="3" />
            {/* Cozy blushing face */}
            <path
              d="M 43 48 Q 45 51 47 48"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 53 48 Q 55 51 57 48"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 46 56 Q 50 60 54 56"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="40" cy="52" r="2.5" fill="#D3A29A" />
            <circle cx="60" cy="52" r="2.5" fill="#D3A29A" />
          </g>
        );

      case 'moon':
        // Cozy Sleep Moon
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Crescent moon */}
            <path
              d="M 35 25 Q 65 25 65 55 Q 65 80 35 75 Q 52 68 52 50 Q 52 32 35 25 Z"
              fill="#EFE4D2"
              stroke="#2C2018"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Sleep eye */}
            <path
              d="M 50 48 Q 54 53 58 48"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Little stars surrounding */}
            <path d="M 22 35 L 24 39 L 28 40 L 24 41 L 22 45 L 20 41 L 16 40 L 20 39 Z" fill="#C67C58" />
            <path d="M 68 62 L 69 65 L 72 66 L 69 67 L 68 70 L 67 67 L 64 66 L 67 65 Z" fill="#C67C58" />
          </g>
        );

      case 'heart':
        // Warm Terracotta Heart sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            <path
              d="M 50 82 C 15 52 20 22 50 38 C 80 22 85 52 50 82 Z"
              fill="#C67C58"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Soft inner highlight */}
            <path
              d="M 32 38 Q 28 48 35 58"
              stroke="#EFE4D2"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      case 'tea':
        // Steam + Cup sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Steam curves */}
            <path
              d="M 40 25 Q 43 18 40 10 M 50 25 Q 53 18 50 10 M 60 25 Q 63 18 60 10"
              stroke="#C67C58"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cup body */}
            <path
              d="M 25 35 L 75 35 Q 75 70 50 72 Q 25 70 25 35 Z"
              fill="#D3A29A"
              stroke="#2C2018"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Handle */}
            <path
              d="M 75 42 Q 90 44 88 56 Q 85 64 72 62"
              fill="none"
              stroke="#2C2018"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Small flower print on cup */}
            <circle cx="50" cy="50" r="3" fill="#EFE4D2" />
            <circle cx="45" cy="50" r="1.5" fill="#94A47A" />
            <circle cx="55" cy="50" r="1.5" fill="#94A47A" />
            <circle cx="50" cy="45" r="1.5" fill="#94A47A" />
            <circle cx="50" cy="55" r="1.5" fill="#94A47A" />
          </g>
        );

      case 'book':
        // Cozy Open Book sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Pages back outline */}
            <path
              d="M 15 75 Q 32 68 50 74 Q 68 68 85 75 L 85 30 Q 68 23 50 29 Q 32 23 15 30 Z"
              fill="#EFE4D2"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Center fold */}
            <line x1="50" y1="29" x2="50" y2="74" stroke="#2C2018" strokeWidth="2" />
            {/* Cover spines showing under pages */}
            <path
              d="M 12 77 Q 32 70 50 76 Q 68 70 88 77"
              stroke="#C67C58"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Simulated text lines */}
            <path
              d="M 22 40 H 42 M 22 48 H 38 M 22 56 H 44 M 58 40 H 78 M 58 48 H 74 M 58 56 H 78"
              stroke="#2C2018"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bookmark leaf */}
            <path d="M 50 29 Q 52 42 58 48" stroke="#94A47A" strokeWidth="2.5" fill="none" />
          </g>
        );

      case 'candle':
        // Warm flickering candle jar
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Jar body */}
            <rect
              x="28"
              y="38"
              width="44"
              height="44"
              rx="6"
              fill="#EFE4D2"
              stroke="#2C2018"
              strokeWidth="3"
            />
            {/* Jar lid */}
            <ellipse cx="50" cy="36" rx="18" ry="4" fill="#C67C58" stroke="#2C2018" strokeWidth="2.5" />
            {/* Candle wax and wick inside */}
            <line x1="50" y1="46" x2="50" y2="38" stroke="#2C2018" strokeWidth="2.5" />
            {/* Flame */}
            <path
              d="M 50 34 C 44 26 50 12 50 12 C 50 12 56 26 50 34 Z"
              fill="#C67C58"
              stroke="#2C2018"
              strokeWidth="2"
            />
            {/* Glowing inner flame */}
            <path d="M 50 31 C 47 26 50 18 50 18 C 50 18 53 26 50 31 Z" fill="#F4ECDD" />
            {/* Label on jar */}
            <rect x="36" y="52" width="28" height="18" rx="2" fill="#94A47A" />
            {/* Tiny text symbol inside label */}
            <line x1="42" y1="61" x2="58" y2="61" stroke="#EFE4D2" strokeWidth="2" />
          </g>
        );

      case 'cloud':
        // Soft Sage Cloud sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            <path
              d="M 25 60 A 12 12 0 0 1 25 36 A 15 15 0 0 1 52 28 A 18 18 0 0 1 78 38 A 12 12 0 0 1 75 60 H 25 Z"
              fill="#94A47A"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Cute sleeping face */}
            <path
              d="M 38 48 Q 41 51 44 48"
              stroke="#EFE4D2"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 56 48 Q 59 51 62 48"
              stroke="#EFE4D2"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );

      case 'rain':
        // Cloud + rain drops sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Cloud body */}
            <path
              d="M 25 50 A 10 10 0 0 1 25 30 A 13 13 0 0 1 48 23 A 15 15 0 0 1 70 32 A 10 10 0 0 1 68 50 H 25 Z"
              fill="#EFE4D2"
              stroke="#2C2018"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Raindrops */}
            <path
              d="M 33 60 L 30 68 M 48 60 L 45 68 M 63 60 L 60 68"
              stroke="#C67C58"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'star':
        // Magic Cozy Star sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            <path
              d="M 50 12 L 62 38 L 90 40 L 68 58 L 75 86 L 50 70 L 25 86 L 32 58 L 10 40 L 38 38 Z"
              fill="#C67C58"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Star inner twinkle lines */}
            <path
              d="M 50 25 L 50 60 M 35 48 L 65 48"
              stroke="#EFE4D2"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'feather':
        // Cozy ink-dipped feather sticker
        return (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Central spine */}
            <path
              d="M 20 80 Q 50 50 80 20"
              stroke="#2C2018"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Vanes of feather */}
            <path
              d="M 25 75 Q 40 50 65 30 Q 82 23 80 20 Q 72 30 55 58 Q 30 75 25 75 Z"
              fill="#D3A29A"
              stroke="#2C2018"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Feather cuts */}
            <path
              d="M 40 60 L 33 64 M 50 50 L 41 55 M 65 36 L 58 41"
              stroke="#2C2018"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-block transition-transform duration-500 hover:rotate-3 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer border & backing circle mimicking a custom hand-drawn sticker */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full select-none"
        style={{
          filter: locked
            ? 'grayscale(1) contrast(0.6) opacity(0.4)'
            : 'drop-shadow(2px 3px 0px rgba(44, 32, 24, 0.12))',
        }}
      >
        <defs>
          {/* Subtle parchment backing texture */}
          <pattern id="sticker-paper" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#F4ECDD" />
          </pattern>
        </defs>

        {/* Paper contour/backing outline of sticker (generous white border) */}
        <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#2C2018" strokeWidth="4" />

        {/* Inner layout background */}
        <circle cx="50" cy="50" r="39" fill="url(#sticker-paper)" />

        {/* Dynamic content rendering based on type */}
        {renderSVGContent()}

        {/* Lock overlay icon if locked */}
        {locked && (
          <g transform="translate(36, 36) scale(0.28)">
            <rect x="10" y="40" width="80" height="50" rx="10" fill="#2C2018" />
            <path
              d="M 25 40 V 25 C 25 10 75 10 75 25 V 40"
              stroke="#2C2018"
              strokeWidth="15"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="50" cy="62" r="8" fill="#F4ECDD" />
          </g>
        )}
      </svg>
    </div>
  );
}
