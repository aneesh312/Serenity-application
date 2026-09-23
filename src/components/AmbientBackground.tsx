/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { SanctuaryId } from '../types';

interface AmbientBackgroundProps {
  sanctuaryId: SanctuaryId;
  accentColor: string;
}

export default function AmbientBackground({ sanctuaryId, accentColor }: AmbientBackgroundProps) {
  // Generate 24 string light bulbs dynamically for beautiful responsive wire drapes
  const bulbs = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const x = (i / 23) * 100; // use percentage width for fluid responsive placement!
      const phase = (i % 6) / 5; // wave drape phase (cycles every 6 bulbs)
      const y = 8 + phase * (1 - phase) * 24; // beautiful hanging curve
      const delay = (i * 0.15) % 2; // nice wave ripple sequence
      const colors = [
        '#fef08a', // soft warm yellow (yellow-200)
        '#fcd34d', // warm amber (amber-300)
        '#fdbb2d'  // cozy lantern gold
      ];
      const bulbColor = colors[i % colors.length];
      return { x, y, delay, color: bulbColor };
    });
  }, []);

  // Generate 20 stable, slow-drifting background particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const left = Math.random() * 100;
      const size = 12 + Math.random() * 16; // soft and visible but elegant sizes
      const delay = Math.random() * 10;
      const duration = 16 + Math.random() * 12; // extremely slow, calming, peaceful drift speeds
      
      let type: 'leaf' | 'spark' | 'bubble' | 'petal' = 'petal';
      let color = '';

      if (sanctuaryId === 'misty-forest') {
        type = 'leaf';
        // Sage-green, olive, and misty cedar leaves
        const forestColors = ['#8f9e7b', '#a3b38c', '#7d8e68', '#b9c7a5'];
        color = forestColors[i % forestColors.length];
      } else if (sanctuaryId === 'warm-hearth') {
        type = 'spark';
        // Fireside hearth golden and copper embers
        const hearthColors = ['#f59e0b', '#f97316', '#fbbf24', '#ea580c'];
        color = hearthColors[i % hearthColors.length];
      } else if (sanctuaryId === 'deep-ocean') {
        type = 'bubble';
        // Soothing aqua bubbles and light leaks
        const oceanColors = ['rgba(255, 255, 255, 0.18)', 'rgba(186, 230, 253, 0.25)', 'rgba(14, 165, 233, 0.12)'];
        color = oceanColors[i % oceanColors.length];
      } else { // cozy-dusk
        type = 'petal';
        // Soft lavender and twilight blossom petals
        const duskColors = ['#e8bbcb', '#d3a29a', '#deb1c1', '#fbcfe8', '#c084fc'];
        color = duskColors[i % duskColors.length];
      }

      return { id: i, left, size, delay, duration, type, color };
    });
  }, [sanctuaryId]);

  // Clean vector and HTML elements for custom particle graphics
  const renderParticle = (type: string, color: string, size: number) => {
    if (type === 'leaf') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="filter drop-shadow-sm">
          <path
            d="M2 22C4.5 15 8 11.5 14 8C11.5 11.5 9 14.5 9 19C9 20.5 8 22 8 22"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="0.75"
          />
          <path
            d="M14 8C20 4.5 22 2 22 2C22 2 19.5 4 13.5 10C7.5 16 2 22 2 22C2 22 4.5 20 10.5 14C16.5 8 14 8 14 8Z"
            fill={color}
            opacity="0.65"
          />
        </svg>
      );
    }
    if (type === 'petal') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="filter drop-shadow-sm">
          {/* Gently curved cherry blossom petal */}
          <path
            d="M12 2C16.5 2 20 7.5 20 12.5C20 17 16 20.5 12 20.5C8 20.5 4 17 4 12.5C4 7.5 7.5 2 12 2Z"
            fill={color}
            opacity="0.6"
          />
          <path
            d="M12 2 Q 13.5 11 12 20.5"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      );
    }
    if (type === 'spark') {
      return (
        <div
          className="rounded-full blur-[1px] animate-pulse"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}, 0 0 4px #fff`,
            opacity: 0.7,
          }}
        />
      );
    }
    if (type === 'bubble') {
      return (
        <div
          className="rounded-full border border-white/20 relative"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.15)',
            opacity: 0.65,
          }}
        >
          {/* Bubble reflection highlight */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/45 rounded-full" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Backing Ambient Blur Aura that breathes */}
      <motion.div
        className="absolute w-[45rem] h-[45rem] rounded-full filter blur-[110px]"
        style={{ backgroundColor: accentColor }}
        animate={{
          x: ['-8%', '8%', '-8%'],
          y: ['-8%', '4%', '-8%'],
          scale: [0.95, 1.1, 0.95],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[35rem] h-[35rem] rounded-full filter blur-[90px] bg-white/30"
        animate={{
          scale: [0.92, 1.08, 0.92],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* String Lights Garland at the Top of Viewport */}
      <div className="absolute top-0 left-0 right-0 h-16 w-full z-10 pointer-events-none">
        {/* Support Wires */}
        <svg className="absolute top-0 left-0 w-full h-16 opacity-25" viewBox="0 0 100 16" preserveAspectRatio="none">
          <path
            d="M 0 4 Q 8.3 12 16.6 4 Q 25 12 33.3 4 Q 41.6 12 50 4 Q 58.3 12 66.6 4 Q 75 12 83.3 4 Q 91.6 12 100 4"
            stroke="#271a11"
            strokeWidth="0.1"
            fill="none"
          />
        </svg>

        {/* Bulbs hanging dynamically */}
        {bulbs.map((bulb, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${bulb.x}%`,
              top: `${bulb.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Small Socket Connection Cap */}
            <div className="w-1 h-1 bg-[#271a11] rounded-t mx-auto" />
            
            {/* Warm Glowing light bulb bulb shape */}
            <motion.div
              className="w-2.5 h-3 rounded-b-full shadow-inner relative flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at top, #ffffff, ${bulb.color})`,
                boxShadow: `0 2px 12px ${bulb.color}80, 0 4px 22px ${bulb.color}40`,
              }}
              animate={{
                opacity: [0.75, 1, 0.75],
                scale: [0.96, 1.04, 0.96],
              }}
              transition={{
                duration: 3 + (index % 4) * 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bulb.delay,
              }}
            />
          </div>
        ))}
      </div>

      {/* Falling/Rising Calming Particles */}
      {particles.map((p) => {
        const isUpward = p.type === 'spark' || p.type === 'bubble';
        return (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.left}%`,
              top: isUpward ? '105%' : '-10%',
            }}
            initial={{
              y: isUpward ? 0 : -50,
              x: 0,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: isUpward ? -1200 : 1200,
              x: [0, Math.sin(p.id) * 50, -Math.sin(p.id) * 25, 0],
              opacity: [0, 0.8, 0.8, 0],
              rotate: p.type === 'leaf' || p.type === 'petal' ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            }}
          >
            {renderParticle(p.type, p.color, p.size)}
          </motion.div>
        );
      })}
    </div>
  );
}
