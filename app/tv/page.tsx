'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Trophy, Zap, Radio, Sparkles, Shield } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

// ==========================================
// ⚙️ TYPES & CONFIGURATION
// ==========================================

interface BroadcastPayload {
  status: 'SHOW_STANDINGS' | 'IDLE' | 'HIDE';
  trigger_id: string;
  countdown_seconds?: number;
  duration_seconds?: number;
  countdown_sound?: boolean;
  reveal_sound?: boolean;
  banner_text?: string;
  triggered_at?: string;
  expires_at?: string;
}

const SAMPLE_EVENTS = [
  {
    id: "sample-1",
    eventName: "Elocution English (Aliya)",
    event_code: "EL-EN-01",
    category: "ON STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "Muhammed Sinan", chest_no: "104", teamName: "Hormuz", teamColor: "#2563eb", grade: "A+", points: 15 },
      { pos: 1, name: "Ahmad Raees", chest_no: "212", teamName: "Aden", teamColor: "#10b981", grade: "A+", points: 15 },
      { pos: 2, name: "Ibrahim Waseem", chest_no: "305", teamName: "Zanzibar", teamColor: "#ef4444", grade: "A", points: 10 },
      { pos: 3, name: "Sayyid Adil", chest_no: "109", teamName: "Hormuz", teamColor: "#2563eb", grade: "B", points: 6 },
    ]
  },
  {
    id: "sample-2",
    eventName: "Classical Arabic Calligraphy",
    event_code: "AR-CL-04",
    category: "OFF STAGE",
    section: "Foundation",
    winners: [
      { pos: 1, name: "Faisal Salih", chest_no: "318", teamName: "Zanzibar", teamColor: "#ef4444", grade: "A+", points: 12 },
      { pos: 2, name: "Sayyid Adil", chest_no: "109", teamName: "Hormuz", teamColor: "#2563eb", grade: "A", points: 8 },
      { pos: 3, name: "Nabeel Ishaq", chest_no: "220", teamName: "Aden", teamColor: "#10b981", grade: "A", points: 5 },
    ]
  },
  {
    id: "sample-3",
    eventName: "Grand Mashup Musicale",
    event_code: "MU-GR-09",
    category: "ON STAGE",
    section: "General",
    winners: [
      { pos: 1, name: "Team Aden Ensemble", chest_no: null, teamName: "Aden", teamColor: "#10b981", grade: "A+", points: 25 },
      { pos: 2, name: "Hormuz Symphony", chest_no: null, teamName: "Hormuz", teamColor: "#2563eb", grade: "A", points: 18 },
      { pos: 3, name: "Zanzibar Vocalists", chest_no: null, teamName: "Zanzibar", teamColor: "#ef4444", grade: "A", points: 12 },
    ]
  },
  {
    id: "sample-4",
    eventName: "Parliamentary Debate",
    event_code: "DB-SE-02",
    category: "ON STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "Hanoon & Team", chest_no: "115", teamName: "Hormuz", teamColor: "#2563eb", grade: "A+", points: 20 },
      { pos: 2, name: "Faheem & Team", chest_no: "324", teamName: "Zanzibar", teamColor: "#ef4444", grade: "A", points: 14 },
      { pos: 2, name: "Shuhaib & Team", chest_no: "231", teamName: "Aden", teamColor: "#10b981", grade: "A", points: 14 },
      { pos: 3, name: "Ishaq PC", chest_no: "311", teamName: "Zanzibar", teamColor: "#ef4444", grade: "B", points: 8 },
    ]
  },
  {
    id: "sample-5",
    eventName: "Spot Poetry Writing",
    event_code: "PT-FD-07",
    category: "OFF STAGE",
    section: "Foundation",
    winners: [
      { pos: 1, name: "Minhaj PV", chest_no: "216", teamName: "Aden", teamColor: "#10b981", grade: "A+", points: 10 },
      { pos: 2, name: "Ziyad Hussain", chest_no: "108", teamName: "Hormuz", teamColor: "#2563eb", grade: "A", points: 6 },
      { pos: 3, name: "Shemeem EC", chest_no: "329", teamName: "Zanzibar", teamColor: "#ef4444", grade: "B", points: 3 },
    ]
  },
  {
    id: "sample-6",
    eventName: "Urdu Ghazal Rendering",
    event_code: "GZ-UR-11",
    category: "ON STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "Ahmad Raees", chest_no: "212", teamName: "Aden", teamColor: "#10b981", grade: "A+", points: 15 },
      { pos: 2, name: "Muhammed Sinan", chest_no: "104", teamName: "Hormuz", teamColor: "#2563eb", grade: "A", points: 10 },
      { pos: 3, name: "Ishaq PC", chest_no: "311", teamName: "Zanzibar", teamColor: "#ef4444", grade: "A", points: 6 },
    ]
  }
];

const LIVE_UPDATES = [
  "⚡ AAWA '26 • PMSA ARTS FEST 2026-27 • WHEN VALUES SPEAK",
  "🏆 Real-Time Official Results Stream • 3 Houses Competing",
  "📍 Grand Finale Highlights: Mashup, Debate, Skit & Calligraphy",
  "✨ 29 SEP, 30 SEP & 01 OCT 2026 • PMSA WAFY COLLEGE KATTILANGADI"
];

// ==========================================
// 🔊 SYNTHESIZED WEB AUDIO ENGINE
// Zero external audio files required
// ==========================================
export function playTvSound(type: 'beep' | 'reveal') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'reveal') {
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = ctx.currentTime + idx * 0.12;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// ==========================================
// 🕒 LIVE CLOCK COMPONENT
// ==========================================
const LiveClock = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 shadow-md">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <div className="font-mono font-black text-xl md:text-2xl text-white tracking-wider drop-shadow-sm">
        {time || '--:--:--'}
      </div>
    </div>
  );
};

// ==========================================
// 🃏 TV-OPTIMIZED CONVEX 3D RESULT CARD
// 100% Solid text rows, rock-solid layout on WebOS TV
// ==========================================
const TvResultCard = ({ event }: { event: any }) => {
  const winners = event.winners ? event.winners.slice(0, 4) : [];
  const isCompact = winners.length > 3;

  return (
    <div className="relative w-[380px] sm:w-[400px] md:w-[420px] shrink-0 select-none">
      {/* Outer Golden Halo Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#caa02f]/40 via-amber-400/30 to-[#caa02f]/40 rounded-[2rem] opacity-70 pointer-events-none"></div>

      {/* Main 3D Card Shell */}
      <div 
        className="relative rounded-[1.8rem] p-5 text-white overflow-hidden border-2 border-[#caa02f]/80"
        style={{
          background: 'linear-gradient(90deg, #0d0a04 0%, #1f1809 50%, #0d0a04 100%)',
          boxShadow: 'inset 18px 0 25px -5px rgba(0,0,0,0.95), inset -18px 0 25px -5px rgba(0,0,0,0.95), 0 20px 40px -10px rgba(0,0,0,0.85)'
        }}
      >
        {/* Specular Center Axis Highlight */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }}
        />

        {/* Geometric Tech Square Dots Grid on Card Shell */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(#caa02f 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Top Ambient Glow */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#caa02f]/25 rounded-full blur-xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="relative z-10 border-b border-[#caa02f]/40 pb-3 mb-2.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#caa02f]/30 border border-[#caa02f]/60 text-[#fff7db] text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-[#fce8a6]" />
              {event.section || 'General Section'}
            </div>

            {event.event_code && (
              <span className="font-mono text-xs font-black text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-md border border-white/20 shadow-inner">
                #{event.event_code}
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-white tracking-tight leading-snug line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {event.eventName}
          </h3>
        </div>

        {/* Winners List (100% Solid Rows for clear visibility) */}
        <div className={`relative z-10 my-1 ${isCompact ? 'space-y-1.5' : 'space-y-2'}`}>
          {winners.map((w: any, idx: number) => {
            const isFirst = w.pos === 1;
            const isSecond = w.pos === 2;
            const isThird = w.pos === 3;

            return (
              <div 
                key={idx}
                className={`flex items-center justify-between rounded-xl border transition-all ${
                  isCompact ? 'p-2' : 'p-2.5'
                } ${
                  isFirst 
                    ? 'bg-[#181308] border-amber-400/90 shadow-[0_0_15px_rgba(202,160,47,0.3)]'
                    : isSecond
                    ? 'bg-[#0f1115] border-slate-400/50 shadow-sm'
                    : 'bg-[#140c07] border-amber-800/50 shadow-sm'
                }`}
              >
                {/* Left: Position Crest + Name & Team */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className={`rounded-lg flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-md ${
                      isCompact ? 'w-6 h-6 text-[11px]' : 'w-7 h-7 text-xs'
                    } ${
                      isFirst
                        ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-slate-950 font-black ring-2 ring-yellow-200 shadow-md'
                        : isSecond
                        ? 'bg-gradient-to-br from-white via-slate-200 to-slate-400 text-slate-950 font-black ring-1 ring-white/70 shadow-md'
                        : isThird
                        ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 font-bold ring-1 ring-amber-400/50 shadow-md'
                        : 'bg-slate-700 text-white font-bold'
                    }`}
                  >
                    {w.pos}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-white text-[14px] md:text-[15px] truncate flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <span className="truncate">{w.name}</span>
                      {w.chest_no && (
                        <span className="text-[11px] font-mono font-bold text-yellow-200 bg-black/80 px-1.5 py-0.2 rounded border border-amber-400/40 shrink-0">
                          #{w.chest_no}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm ring-1 ring-white/50"
                        style={{ backgroundColor: w.teamColor || '#caa02f' }}
                      />
                      <span className="text-xs font-bold text-[#fde68a] truncate tracking-wide drop-shadow-sm">
                        {w.teamName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Points + Grade */}
                <div className="text-right shrink-0 pl-2.5">
                  <div className="font-mono font-black text-base md:text-lg text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    +{w.points}
                    <span className="text-[10px] font-bold text-amber-200/80 uppercase ml-1">Pts</span>
                  </div>
                  {w.grade && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 inline-block mt-0.5 shadow-sm">
                      {w.grade}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Footer Accent */}
        <div className="relative z-10 pt-2.5 mt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-amber-200/80 font-mono">
          <span className="font-bold tracking-wider">AAWA ARTS FEST</span>
          <span className="text-[#caa02f] font-black flex items-center gap-1 tracking-wider">
            <Shield className="w-3.5 h-3.5" /> OFFICIAL
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🌊 HARDWARE-ACCELERATED TV RUNWAY (WebOS / Vu Compatible)
// Smooth 60fps GPU continuous translation
// ==========================================
const TvRunway = ({ events }: { events: any[] }) => {
  const displayList = events.length > 0 ? events : SAMPLE_EVENTS;
  // Repeat 4x for smooth infinite loop
  const items = [...displayList, ...displayList, ...displayList, ...displayList];

  const scrollX = useMotionValue(0);
  const cardWidth = 420;
  const gap = 32;
  const cardTotalWidth = cardWidth + gap;
  const singleSetWidth = displayList.length * cardTotalWidth;

  useAnimationFrame((_, delta) => {
    if (singleSetWidth === 0) return;
    // TV-safe constant linear glide speed (0.055 px per millisecond)
    const speed = 0.055;
    let nextX = scrollX.get() - speed * delta;
    if (nextX <= -singleSetWidth) {
      nextX += singleSetWidth;
    }
    scrollX.set(nextX);
  });

  return (
    <div className="relative w-full h-[460px] flex items-center overflow-hidden select-none">
      {/* 2D Hardware-Accelerated Track: 0% CPU overhead on Smart TVs */}
      <motion.div 
        className="flex gap-8 items-center h-full absolute left-0"
        style={{
          x: scrollX,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
        }}
      >
        {items.map((event, i) => (
          <TvResultCard key={`${event.id}-${i}`} event={event} />
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// 🏆 COMPACT TOP SCORES HUD (3 TEAMS ONLY)
// ==========================================
const TopScoresHUD = ({ 
  leaderboard, 
  isLiveBroadcastActive
}: { 
  leaderboard: any[]; 
  isLiveBroadcastActive: boolean;
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 shadow-md">
        <Trophy className="w-4 h-4 text-[#f5d77f]" />
        <div className="flex items-center gap-4 divide-x divide-white/15">
          {leaderboard.slice(0, 3).map((team, idx) => (
            <div key={team.id || idx} className={`flex items-center gap-2 ${idx !== 0 ? 'pl-4' : ''}`}>
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm ring-1 ring-white/30"
                style={{ backgroundColor: team.color_hex || team.color || '#caa02f' }}
              />
              <span className="font-extrabold text-white text-sm tracking-wide">{team.name}</span>
              <span className="font-mono font-black text-sm text-[#fce8a6] drop-shadow-sm">
                {team.points || team.stats?.total || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Live Broadcast Indicator */}
        {isLiveBroadcastActive && (
          <div className="pl-3 border-l border-white/20 flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>On Air</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ⏱️ 3D COUNTDOWN OVERLAY
// ==========================================
const BroadcastCountdownOverlay = ({
  count,
  bannerText
}: {
  count: number;
  bannerText: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center select-none"
    >
      <div className="absolute w-[600px] h-[600px] bg-[#caa02f]/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#caa02f]/25 border border-[#caa02f]/50 text-[#fce8a6] text-sm font-black uppercase tracking-widest shadow-lg">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          TV ARENA BROADCAST INCOMING
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mt-4 uppercase tracking-wider drop-shadow-lg">
          {bannerText || 'OFFICIAL HOUSE STANDINGS'}
        </h2>
      </motion.div>

      <div className="relative flex items-center justify-center">
        <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-[#caa02f]/40 animate-ping"></div>
        <div className="absolute w-52 h-52 md:w-64 md:h-64 rounded-full border-2 border-amber-300/30"></div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={count}
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#caa02f] via-amber-400 to-[#caa02f] flex items-center justify-center shadow-[0_0_80px_rgba(202,160,47,0.75)] border-4 border-white/70"
          >
            <span className="font-mono font-black text-8xl md:text-9xl text-slate-950 tracking-tighter">
              {count}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-amber-200/80 font-mono text-sm uppercase tracking-widest mt-10 font-bold drop-shadow-sm">
        Synthesizing live tabulation results...
      </p>
    </motion.div>
  );
};

// ==========================================
// 📊 BROADCAST HOUSE STANDINGS OVERLAY
// ==========================================
const BroadcastStandingsOverlay = ({ 
  isOpen, 
  onClose, 
  leaderboard,
  bannerText,
  durationRemaining,
  totalDuration
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  leaderboard: any[]; 
  bannerText: string;
  durationRemaining?: number;
  totalDuration?: number;
}) => {
  if (!isOpen) return null;

  const progressPercent = totalDuration && durationRemaining !== undefined && totalDuration > 0
    ? Math.max(0, Math.min(100, (durationRemaining / totalDuration) * 100))
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl bg-gradient-to-br from-[#1c160a] via-[#0d0a04] to-[#181206] border-2 border-[#caa02f] rounded-[2.5rem] p-6 md:p-10 shadow-[0_0_80px_rgba(202,160,47,0.3)] relative overflow-hidden text-white flex flex-col justify-between"
        >
          {/* Top Realtime Progress Bar */}
          {progressPercent !== null && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/60">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-[#caa02f]"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: 'linear', duration: 0.2 }}
              />
            </div>
          )}

          {/* Background Grid Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(#caa02f 1.5px, transparent 1.5px)`,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#caa02f]/30 pb-5 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#caa02f] to-amber-500 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(202,160,47,0.5)] font-black text-2xl">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-[#caa02f]/20 border border-[#caa02f]/40 text-[#fce8a6]">
                    OFFICIAL BROADCAST
                  </span>
                  {durationRemaining !== undefined && (
                    <span className="text-[11px] font-mono font-bold text-amber-200/80">
                      Auto-dismiss in {durationRemaining}s
                    </span>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mt-1 drop-shadow-sm">
                  {bannerText || 'House Standings'}
                </h2>
                <p className="text-xs text-amber-200/80 font-bold">
                  AAWA '26 PMSA Arts Fest • Live Grand Tabulation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition-all active:scale-95"
            >
              Close
            </button>
          </div>

          {/* 3 Teams Grand Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-6">
            {leaderboard.slice(0, 3).map((team, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;

              return (
                <div
                  key={team.id || idx}
                  className={`rounded-3xl p-6 border flex flex-col justify-between relative overflow-hidden transition-all ${
                    isFirst
                      ? 'bg-gradient-to-b from-amber-500/25 via-[#caa02f]/15 to-black/80 border-amber-400 shadow-[0_0_40px_rgba(202,160,47,0.3)] md:-translate-y-2'
                      : isSecond
                      ? 'bg-slate-900/60 border-slate-400/40 shadow-lg'
                      : 'bg-amber-950/40 border-amber-800/40 shadow-lg'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-6 right-6 px-3 py-1 bg-[#caa02f] text-black font-black text-[10px] uppercase tracking-widest rounded-b-lg shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Leading
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span 
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-xl ${
                          isFirst 
                            ? 'bg-[#caa02f] text-black shadow-lg ring-2 ring-amber-300' 
                            : isSecond 
                            ? 'bg-slate-300 text-black shadow-md' 
                            : 'bg-amber-800 text-white shadow-md'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span 
                        className="w-4 h-4 rounded-full inline-block shadow-md ring-2 ring-white/30"
                        style={{ backgroundColor: team.color_hex || team.color || '#caa02f' }}
                      />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight drop-shadow-sm">
                      {team.name}
                    </h3>
                    
                    <div className="font-mono font-black text-4xl md:text-5xl text-amber-300 mb-6 drop-shadow-sm">
                      {team.points || team.stats?.total || 0}
                      <span className="text-xs font-bold text-amber-200/70 uppercase ml-2 tracking-widest">PTS</span>
                    </div>
                  </div>

                  {/* Section Breakdown Mini Bars */}
                  <div className="space-y-2 bg-black/50 p-4 rounded-2xl border border-white/10 text-xs font-mono">
                    <div className="flex justify-between items-center text-amber-100/80">
                      <span>Aliya Section</span>
                      <span className="font-extrabold text-white text-sm">{team.sections?.aliya || team.stats?.aliya || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-100/80">
                      <span>Foundation Section</span>
                      <span className="font-extrabold text-white text-sm">{team.sections?.foundation || team.stats?.foundation || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-100/80">
                      <span>General Events</span>
                      <span className="font-extrabold text-white text-sm">{team.sections?.general || team.stats?.general || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-amber-200/80 font-mono">
            <span className="font-bold">AAWA CENTRAL JURY TABULATION</span>
            <span className="text-[#caa02f] font-black tracking-wider">
              UPDATED IN REAL-TIME
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================================
// 🚀 MAIN TV ARENA COMPONENT
// ==========================================
export default function TvScreenPage() {
  const [events, setEvents] = useState<any[]>(SAMPLE_EVENTS);
  const [leaderboard, setLeaderboard] = useState<any[]>([
    { id: '1', name: 'Hormuz', color_hex: '#2563eb', points: 342, sections: { aliya: 140, foundation: 112, general: 90 } },
    { id: '2', name: 'Aden', color_hex: '#10b981', points: 328, sections: { aliya: 130, foundation: 108, general: 90 } },
    { id: '3', name: 'Zanzibar', color_hex: '#ef4444', points: 295, sections: { aliya: 110, foundation: 95, general: 90 } }
  ]);

  // Broadcast Controller States
  const [broadcastState, setBroadcastState] = useState<BroadcastPayload | null>(null);
  const [broadcastPhase, setBroadcastPhase] = useState<'IDLE' | 'COUNTDOWN' | 'STANDINGS'>('IDLE');
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [durationRemaining, setDurationRemaining] = useState<number>(10);

  // References to handle timers and deduplication
  const lastProcessedTriggerIdRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch live data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();

      if (json.success) {
        if (json.events && json.events.length > 0) {
          setEvents(json.events);
        }
        if (json.teams && json.teams.length > 0) {
          setLeaderboard(json.teams);
        } else if (json.leaderboard && json.leaderboard.length > 0) {
          setLeaderboard(json.leaderboard);
        } else if (json.breakdown && json.breakdown.length > 0) {
          setLeaderboard(json.breakdown);
        }

        if (json.broadcast) {
          handleIncomingBroadcast(json.broadcast);
        }
      }
    } catch (error) {
      console.error('TV Page Data Fetch Error:', error);
    }
  };

  // 2. Clear all active broadcast timers
  const clearAllBroadcastTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  // 3. Process incoming broadcast commands
  const handleIncomingBroadcast = (data: BroadcastPayload) => {
    setBroadcastState(data);

    if (data.status === 'HIDE' || data.status === 'IDLE') {
      clearAllBroadcastTimers();
      setBroadcastPhase('IDLE');
      return;
    }

    if (data.status === 'SHOW_STANDINGS') {
      const triggerId = data.trigger_id || String(data.triggered_at || '');

      if (triggerId && triggerId === lastProcessedTriggerIdRef.current) {
        return;
      }
      lastProcessedTriggerIdRef.current = triggerId;

      clearAllBroadcastTimers();

      const countdownSecs = data.countdown_seconds ?? 3;
      const durationSecs = data.duration_seconds ?? 10;
      const enableCountdownSound = data.countdown_sound !== false;
      const enableRevealSound = data.reveal_sound !== false;

      if (countdownSecs > 0) {
        setBroadcastPhase('COUNTDOWN');
        setCountdownNumber(countdownSecs);

        if (enableCountdownSound) {
          playTvSound('beep');
        }

        let currentCount = countdownSecs;
        countdownIntervalRef.current = setInterval(() => {
          currentCount -= 1;
          if (currentCount > 0) {
            setCountdownNumber(currentCount);
            if (enableCountdownSound) {
              playTvSound('beep');
            }
          } else {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }

            if (enableRevealSound) {
              playTvSound('reveal');
            }

            setBroadcastPhase('STANDINGS');
            startDurationTimer(durationSecs);
          }
        }, 1000);
      } else {
        if (enableRevealSound) {
          playTvSound('reveal');
        }
        setBroadcastPhase('STANDINGS');
        startDurationTimer(durationSecs);
      }
    }
  };

  // 4. Timer for standings display duration
  const startDurationTimer = (durationSecs: number) => {
    setDurationRemaining(durationSecs);
    let remaining = durationSecs;

    durationIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setDurationRemaining(remaining);

      if (remaining <= 0) {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setBroadcastPhase('IDLE');
      }
    }, 1000);
  };

  // 5. Setup Supabase Realtime Listener + Polling Fallback
  useEffect(() => {
    supabase
      .from('site_assets')
      .select('value')
      .eq('key', 'tv_broadcast_control')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            handleIncomingBroadcast(val);
          } catch (e) {}
        }
      });

    const channel = supabase
      .channel('tv_screen_broadcast_listener')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_assets',
          filter: 'key=eq.tv_broadcast_control'
        },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            try {
              const rawVal = (payload.new as any).value;
              const val = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
              handleIncomingBroadcast(val);
            } catch (e) {
              console.error('Realtime broadcast parse error:', e);
            }
          }
        }
      )
      .subscribe();

    fetchData();
    const interval = setInterval(fetchData, 12000);

    return () => {
      clearAllBroadcastTimers();
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden font-sans flex flex-col justify-between relative select-none bg-[radial-gradient(ellipse_at_top,#fffcf2_0%,#faedc8_40%,#caa02f_100%)] text-slate-900">
      
      {/* Subtle Background Geometric Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(#b38617 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Lighting Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-400/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. TOP BAR */}
      <header className="h-[12vh] min-h-[75px] max-h-[100px] flex items-center justify-between px-8 border-b border-black/10 bg-white/40 backdrop-blur-md z-40 shadow-sm relative">
        <div className="flex items-center gap-6">
          <img
            src="/Logo_White.png"
            alt="AAWA Fest Logo"
            className="h-16 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />
          <div className="h-10 w-px bg-black/15"></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-3">
              AAWA LIVE ARENA
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black text-[#caa02f] font-black uppercase flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" /> Live
              </span>
            </h1>
            <p className="text-[#8c670b] font-extrabold tracking-widest text-xs uppercase mt-0.5">
              AAWA PMSA Arts Fest 26-27 • When Values Speak
            </p>
          </div>
        </div>

        {/* Top Scores HUD (3 Teams) + Live Clock */}
        <div className="flex items-center gap-4">
          <TopScoresHUD 
            leaderboard={leaderboard} 
            isLiveBroadcastActive={broadcastPhase === 'STANDINGS' || broadcastPhase === 'COUNTDOWN'}
          />
          <LiveClock />
        </div>
      </header>

      {/* 2. MAIN HARDWARE-ACCELERATED TV RUNWAY */}
      <main className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-0 overflow-hidden">
        <TvRunway events={events} />
      </main>

      {/* 3. BOTTOM NOTIFICATION MARQUEE */}
      <footer className="h-[6vh] min-h-[40px] max-h-[50px] bg-black text-[#fce8a6] flex items-center overflow-hidden relative z-40 border-t-2 border-[#caa02f] shadow-2xl">
        <div className="bg-[#caa02f] text-black h-full px-6 flex items-center gap-2 z-20 skew-x-[-12deg] -ml-4 shadow-lg">
          <Zap className="w-4 h-4 text-black animate-pulse skew-x-[12deg]" />
          <span className="font-black uppercase tracking-widest text-xs skew-x-[12deg]">
            Live Feed
          </span>
        </div>

        <motion.div
          className="flex whitespace-nowrap gap-12 items-center pl-10"
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...LIVE_UPDATES, ...LIVE_UPDATES, ...LIVE_UPDATES].map((txt, i) => (
            <span key={i} className="text-[#fce8a6] font-bold text-xs uppercase flex items-center gap-4 tracking-wider">
              {txt}
              <span className="w-2 h-2 bg-[#caa02f] rounded-full shadow-[0_0_8px_#caa02f]"></span>
            </span>
          ))}
        </motion.div>
      </footer>

      {/* 4. BROADCAST COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {broadcastPhase === 'COUNTDOWN' && (
          <BroadcastCountdownOverlay 
            count={countdownNumber}
            bannerText={broadcastState?.banner_text || 'OFFICIAL HOUSE STANDINGS'}
          />
        )}
      </AnimatePresence>

      {/* 5. BROADCAST STANDINGS OVERLAY */}
      <BroadcastStandingsOverlay 
        isOpen={broadcastPhase === 'STANDINGS'} 
        onClose={() => {
          clearAllBroadcastTimers();
          setBroadcastPhase('IDLE');
        }} 
        leaderboard={leaderboard}
        bannerText={broadcastState?.banner_text || 'OFFICIAL HOUSE STANDINGS'}
        durationRemaining={durationRemaining}
        totalDuration={broadcastState?.duration_seconds || 10}
      />
    </div>
  );
}
