'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { Trophy, Zap, Clock, Award, Sparkles, Radio, Flame, Shield } from 'lucide-react';
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
    eventName: "BOOK REVIEW",
    event_code: "ALN059",
    category: "OFF STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "AMJAD MK", chest_no: "111", teamName: "ISHBILIYA", teamColor: "#ef4444", grade: "A", points: 17 },
      { pos: 2, name: "ADHIL SALI", chest_no: "102", teamName: "FUSTAT", teamColor: "#10b981", grade: "B", points: 11 },
      { pos: 3, name: "MOHAMMED SHAMNAD P", chest_no: "202", teamName: "GULBARGA", teamColor: "#f59e0b", grade: "C", points: 4 },
      { pos: 3, name: "VASEEM KM", chest_no: "323", teamName: "GULBARGA", teamColor: "#f59e0b", grade: "C", points: 4 },
    ]
  },
  {
    id: "sample-2",
    eventName: "CALLIGRAPHY",
    event_code: "ALF076",
    category: "OFF STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "MOHAMMED SUFIYAN PM", chest_no: "205", teamName: "GULBARGA", teamColor: "#f59e0b", grade: "B", points: 13 },
      { pos: 2, name: "MUHANMED FEZBIN P", chest_no: "311", teamName: "ISHBILIYA", teamColor: "#ef4444", grade: "B", points: 9 },
      { pos: 3, name: "MUHAMMED SINAN TP", chest_no: "308", teamName: "ISHBILIYA", teamColor: "#ef4444", grade: null, points: 3 },
    ]
  },
  {
    id: "sample-3",
    eventName: "ESSAY URD",
    event_code: "GEF091",
    category: "OFF STAGE",
    section: "General",
    winners: [
      { pos: 1, name: "AHMAD SHAMEEM V", chest_no: "107", teamName: "GULBARGA", teamColor: "#f59e0b", grade: "A", points: 17 },
      { pos: 2, name: "MUHAMMAD SHAHAD KP", chest_no: "208", teamName: "FUSTAT", teamColor: "#10b981", grade: "B", points: 11 },
      { pos: 3, name: "MUHAMMED SADIQ", chest_no: "220", teamName: "FUSTAT", teamColor: "#10b981", grade: "B", points: 6 },
    ]
  },
  {
    id: "sample-4",
    eventName: "HAIKU POEM",
    event_code: "ALF082",
    category: "OFF STAGE",
    section: "Aliya",
    winners: [
      { pos: 1, name: "MUHAMMAD SHAHAD KP", chest_no: "208", teamName: "FUSTAT", teamColor: "#10b981", grade: "A+", points: 17 },
      { pos: 2, name: "MUHAMMED RASHID", chest_no: "218", teamName: "ISHBILIYA", teamColor: "#ef4444", grade: "A", points: 11 },
      { pos: 3, name: "MOHAMMED FAHEEM PV", chest_no: "121", teamName: "GULBARGA", teamColor: "#f59e0b", grade: "A", points: 8 },
    ]
  }
];

const LIVE_UPDATES = [
  "AAWA '26 • PMSA ARTS FEST 2026-27 • WHEN VALUES SPEAK",
  "REAL-TIME OFFICIAL RESULTS STREAM • 3 HOUSES COMPETING",
  "GRAND FINALE HIGHLIGHTS: MASHUP, DEBATE, SKIT & CALLIGRAPHY",
  "29 SEP, 30 SEP & 01 OCT 2026 • PMSA WAFY COLLEGE KATTILANGADI"
];

// ==========================================
// 🔊 SYNTHESIZED WEB AUDIO ENGINE
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
    <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20 shadow-md">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <div className="font-mono font-black text-lg md:text-xl text-white tracking-wider drop-shadow-sm">
        {time || '--:--:--'}
      </div>
    </div>
  );
};

// ==========================================
// 🃏 CONVEX 3D CURVED RESULT CARD CONTENT
// Geometric dot background with 100% solid, ultra-clear student rows
// ==========================================
const Convex3DCardContent = ({ event }: { event: any }) => {
  const winners = event.winners ? event.winners.slice(0, 4) : [];
  const isCompact = winners.length > 3;

  return (
    <div 
      className="relative select-none w-full"
      style={{
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      }}
    >
      {/* Outer Golden Halo Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#caa02f]/45 via-amber-400/35 to-[#caa02f]/45 rounded-[2rem] opacity-70 pointer-events-none"></div>

      {/* Main 3D Card Shell with Outward Convex Illusion */}
      <div 
        className="relative rounded-[1.8rem] p-4 md:p-5 text-white overflow-hidden border-2 border-[#caa02f]/80"
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
        <div className="relative z-10 border-b border-[#caa02f]/40 pb-2.5 mb-2.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#caa02f]/30 border border-[#caa02f]/60 text-[#fff7db] text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-[#fce8a6]" />
              {event.section || 'General Section'}
            </div>

            {event.event_code && (
              <span className="font-mono text-xs font-black text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-md border border-white/20 shadow-inner">
                #{event.event_code}
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {event.eventName}
          </h3>
        </div>

        {/* Winners List (100% Solid Opaque Rows) */}
        <div className={`relative z-10 my-1 ${isCompact ? 'space-y-1.5' : 'space-y-2'}`}>
          {winners.map((w: any, idx: number) => {
            const isFirst = w.pos === 1;
            const isSecond = w.pos === 2;
            const isThird = w.pos === 3;

            return (
              <div 
                key={idx}
                className={`flex items-center justify-between rounded-xl border transition-all ${
                  isCompact ? 'p-1.5 md:p-2' : 'p-2 md:p-2.5'
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
                    <div className="font-extrabold text-white text-[13px] md:text-[14px] truncate flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <span className="truncate">{w.name}</span>
                      {w.chest_no && (
                        <span className="text-[10px] font-mono font-bold text-yellow-200 bg-black/80 px-1.5 py-0.2 rounded border border-amber-400/40 shrink-0">
                          #{w.chest_no}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm ring-1 ring-white/50"
                        style={{ backgroundColor: w.teamColor || '#caa02f' }}
                      />
                      <span className="text-[11px] font-bold text-[#fde68a] truncate tracking-wide drop-shadow-sm">
                        {w.teamName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Points + Grade */}
                <div className="text-right shrink-0 pl-2.5">
                  <div className="font-mono font-black text-sm md:text-base text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    +{w.points}
                    <span className="text-[9px] font-bold text-amber-200/80 uppercase ml-1">Pts</span>
                  </div>
                  {w.grade && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 inline-block mt-0.5 shadow-sm">
                      {w.grade}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Card Footer Accent */}
        <div className="relative z-10 pt-2 mt-2 border-t border-white/15 flex items-center justify-between text-[10px] md:text-[11px] text-amber-200/80 font-mono">
          <span className="font-bold tracking-wider">AAWA ARTS FEST</span>
          <span className="text-[#caa02f] font-black flex items-center gap-1 tracking-wider">
            <Shield className="w-3 h-3" /> OFFICIAL
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🌊 INDIVIDUAL DYNAMIC 3D CURVE CARD
// Transforms in 3D arc based on continuous horizontal scroll position
// ==========================================
const Dynamic3DCurveCard = ({ 
  event, 
  index, 
  scrollX, 
  cardTotalWidth,
  viewportWidth
}: { 
  event: any; 
  index: number; 
  scrollX: MotionValue<number>; 
  cardTotalWidth: number;
  viewportWidth: number;
}) => {
  const initialX = index * cardTotalWidth;

  // Relative distance from center of screen
  const relativeX = useTransform(scrollX, (val) => {
    const center = (viewportWidth / 2) - (cardTotalWidth / 2);
    return val + initialX - center;
  });

  // Parabolic Arc Trajectory: center card is pushed forward (+85px translateZ), edges pulled backward (-120px)
  const z = useTransform(relativeX, [-1200, -750, -350, 0, 350, 750, 1200], [-180, -110, -20, 85, -20, -110, -180]);
  const rotateY = useTransform(relativeX, [-1200, -750, -350, 0, 350, 750, 1200], [25, 18, 10, 0, -10, -18, -25]);
  const scale = useTransform(relativeX, [-1200, -750, -350, 0, 350, 750, 1200], [0.85, 0.92, 0.98, 1.05, 0.98, 0.92, 0.85]);
  const opacity = useTransform(relativeX, [-1300, -850, -450, 0, 450, 850, 1300], [0.05, 0.70, 0.95, 1, 0.95, 0.70, 0.05]);
  const zIndex = useTransform(relativeX, (val) => Math.max(1, Math.round(60 - Math.abs(val) / 25)));

  return (
    <motion.div
      className="shrink-0 w-[360px] sm:w-[380px] md:w-[400px]"
      style={{
        z,
        rotateY,
        scale,
        opacity,
        zIndex,
        transformStyle: 'preserve-3d',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      <Convex3DCardContent event={event} />
    </motion.div>
  );
};

// ==========================================
// 🌊 CONTINUOUS 3D CURVED RUNWAY
// Fully unobstructed, spacious vertical room
// ==========================================
const Continuous3DCurvedRunway = ({ events }: { events: any[] }) => {
  const displayList = events.length > 0 ? events : SAMPLE_EVENTS;
  // Repeat 4x for smooth infinite loop
  const items = [...displayList, ...displayList, ...displayList, ...displayList];

  const scrollX = useMotionValue(0);
  const cardWidth = 400;
  const gap = 32;
  const cardTotalWidth = cardWidth + gap;
  const singleSetWidth = displayList.length * cardTotalWidth;

  const [viewportWidth, setViewportWidth] = useState(1400);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (singleSetWidth === 0) return;
    // Continuous smooth glide speed (0.055 px per millisecond)
    const speed = 0.055;
    let nextX = scrollX.get() - speed * delta;
    if (nextX <= -singleSetWidth) {
      nextX += singleSetWidth;
    }
    scrollX.set(nextX);
  });

  return (
    <div 
      className="relative w-full h-[480px] flex items-center justify-center overflow-hidden select-none my-auto"
      style={{
        perspective: '1300px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 3D Track extending edge-to-edge */}
      <motion.div 
        className="flex gap-8 items-center h-full absolute left-0"
        style={{
          x: scrollX,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {items.map((event, i) => (
          <Dynamic3DCurveCard 
            key={`${event.id}-${i}`} 
            event={event} 
            index={i} 
            scrollX={scrollX}
            cardTotalWidth={cardTotalWidth}
            viewportWidth={viewportWidth}
          />
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// 🏆 COMPACT TOP SCORES HUD (3 TEAMS: Hormuz, Aden, Zanzibar)
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
      <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20 shadow-md">
        <Trophy className="w-4 h-4 text-[#f5d77f]" />
        <div className="flex items-center gap-3.5 divide-x divide-white/15">
          {leaderboard.slice(0, 3).map((team, idx) => (
            <div key={team.id || idx} className={`flex items-center gap-2 ${idx !== 0 ? 'pl-3.5' : ''}`}>
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm ring-1 ring-white/30"
                style={{ backgroundColor: team.color_hex || team.color || '#caa02f' }}
              />
              <span className="font-extrabold text-white text-xs md:text-sm tracking-wide">{team.name}</span>
              <span className="font-mono font-black text-xs md:text-sm text-[#fce8a6] drop-shadow-sm">
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
            initial={{ scale: 2.2, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.4, opacity: 0, filter: 'blur(15px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
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
// 📊 BROADCAST HOUSE STANDINGS OVERLAY (HIGH CLEAR VISIBILITY)
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
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 md:p-10 select-none overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.86, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.86, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl bg-gradient-to-br from-[#1c1404] via-[#0a0701] to-[#140e02] border-2 border-[#caa02f] rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-[0_0_100px_rgba(202,160,47,0.45)] relative overflow-hidden text-white flex flex-col justify-between"
        >
          {/* Top Live Timer Progress Bar */}
          {progressPercent !== null && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-black/80">
              <motion.div 
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-[#caa02f] shadow-[0_0_15px_#f59e0b]"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: 'linear', duration: 0.2 }}
              />
            </div>
          )}

          {/* Ambient Gold Glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#caa02f]/25 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-32 right-1/4 w-[450px] h-[250px] bg-amber-600/20 rounded-full blur-[90px] pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-white/10 pb-6 mb-8 relative z-10">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-yellow-300 via-[#caa02f] to-amber-600 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(202,160,47,0.6)] font-black text-3xl shrink-0">
                <Trophy className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    LIVE OFFICIAL STANDINGS
                  </span>
                  {durationRemaining !== undefined && (
                    <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                      Auto-close in {durationRemaining}s
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {bannerText || 'HOUSE STANDINGS'}
                </h2>
                <p className="text-xs sm:text-sm text-amber-300 font-bold tracking-wide mt-0.5">
                  AAWA '26 PMSA ARTS FESTIVAL • WHEN VALUES SPEAK
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-black text-white border border-white/20 transition-all active:scale-95 shadow-md shrink-0"
            >
              ✕ Close
            </button>
          </div>

          {/* 3 Teams High-Visibility Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10 mb-6">
            {leaderboard.slice(0, 3).map((team, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={team.id || idx}
                  className={`rounded-3xl p-6 sm:p-8 border-2 flex flex-col justify-between relative overflow-hidden transition-all ${
                    isFirst
                      ? 'bg-gradient-to-b from-[#2a1e05] via-[#150f02] to-black border-amber-400 shadow-[0_0_50px_rgba(202,160,47,0.4)] md:-translate-y-3'
                      : isSecond
                      ? 'bg-gradient-to-b from-[#141820] via-[#0c0e14] to-black border-slate-300 shadow-[0_0_30px_rgba(203,213,225,0.25)]'
                      : 'bg-gradient-to-b from-[#1f1007] via-[#100703] to-black border-amber-700/80 shadow-[0_0_30px_rgba(180,83,9,0.25)]'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute top-0 right-8 px-4 py-1 bg-gradient-to-r from-yellow-400 to-[#caa02f] text-slate-950 font-black text-xs uppercase tracking-widest rounded-b-xl shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-current" /> CHAMPION
                    </div>
                  )}

                  <div>
                    {/* Rank Badge & Team Dot */}
                    <div className="flex items-center justify-between mb-5">
                      <span 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl shadow-xl ${
                          isFirst 
                            ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-[#caa02f] text-slate-950 ring-4 ring-amber-300/40' 
                            : isSecond 
                            ? 'bg-gradient-to-br from-white via-slate-200 to-slate-400 text-slate-950 ring-2 ring-white/40' 
                            : 'bg-gradient-to-br from-amber-600 to-amber-900 text-amber-100 ring-2 ring-amber-500/30'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        <span 
                          className="w-3.5 h-3.5 rounded-full inline-block shadow-md ring-2 ring-white/40"
                          style={{ backgroundColor: team.color_hex || team.color || '#caa02f' }}
                        />
                        <span className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                          {team.slug || team.name}
                        </span>
                      </div>
                    </div>

                    {/* Team Name */}
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {team.name}
                    </h3>
                    
                    {/* Grand Total Score (Massive & Ultra Clear) */}
                    <div className="bg-black/60 rounded-2xl p-4 border border-white/10 mb-6 flex items-baseline justify-between shadow-inner">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">TOTAL POINTS</span>
                      <div className="font-mono font-black text-5xl sm:text-6xl text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]">
                        {team.points || team.stats?.total || 0}
                        <span className="text-xs font-extrabold text-amber-200/80 ml-1.5 uppercase font-sans">PTS</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Breakdown Mini Table */}
                  <div className="space-y-2 bg-black/80 p-4 rounded-2xl border border-white/10 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-300 pb-1.5 border-b border-white/5">
                      <span className="font-semibold text-amber-200">Aliya Section</span>
                      <span className="font-black text-white text-base bg-white/10 px-2.5 py-0.5 rounded-lg">
                        {team.sections?.aliya || team.stats?.aliya || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 pb-1.5 border-b border-white/5">
                      <span className="font-semibold text-amber-200">Foundation Section</span>
                      <span className="font-black text-white text-base bg-white/10 px-2.5 py-0.5 rounded-lg">
                        {team.sections?.foundation || team.stats?.foundation || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-semibold text-amber-200">General Events</span>
                      <span className="font-black text-white text-base bg-white/10 px-2.5 py-0.5 rounded-lg">
                        {team.sections?.general || team.stats?.general || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex items-center justify-between border-t-2 border-white/10 pt-5 text-xs text-slate-400 font-mono">
            <span className="font-black text-amber-300 tracking-wider">AAWA CENTRAL JURY TABULATION</span>
            <span className="text-slate-300 font-bold">
              REAL-TIME BROADCAST SYNC
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
    { id: '1', name: 'FUSTAT', color_hex: '#10b981', points: 235, sections: { aliya: 130, foundation: 64, general: 41 } },
    { id: '2', name: 'GULBARGA', color_hex: '#f59e0b', points: 188, sections: { aliya: 128, foundation: 43, general: 17 } },
    { id: '3', name: 'ISHBILIYA', color_hex: '#ef4444', points: 177, sections: { aliya: 114, foundation: 57, general: 6 } }
  ]);

  // Broadcast Controller States
  const [broadcastState, setBroadcastState] = useState<BroadcastPayload | null>(null);
  const [broadcastPhase, setBroadcastPhase] = useState<'IDLE' | 'COUNTDOWN' | 'STANDINGS'>('IDLE');
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [durationRemaining, setDurationRemaining] = useState<number>(10);

  // References to handle timers and deduplication
  const isInitialMountRef = useRef<boolean>(true);
  const lastProcessedTriggerIdRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch live data
  const fetchData = async (isInitial = false) => {
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
          handleIncomingBroadcast(json.broadcast, isInitial);
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
  const handleIncomingBroadcast = (data: BroadcastPayload, isInitialLoad = false) => {
    setBroadcastState(data);

    if (!data || data.status === 'HIDE' || data.status === 'IDLE') {
      clearAllBroadcastTimers();
      setBroadcastPhase('IDLE');
      return;
    }

    if (data.status === 'SHOW_STANDINGS') {
      const triggerId = data.trigger_id || String(data.triggered_at || '');

      // On initial page load / reload: NEVER trigger standings. Mark as already processed.
      if (isInitialLoad || isInitialMountRef.current) {
        if (triggerId) {
          lastProcessedTriggerIdRef.current = triggerId;
        }
        setBroadcastPhase('IDLE');
        return;
      }

      // If already processed on this client, ignore
      if (triggerId && triggerId === lastProcessedTriggerIdRef.current) {
        return;
      }

      const now = Date.now();
      const triggeredAtMs = data.triggered_at ? new Date(data.triggered_at).getTime() : 0;
      
      // If trigger is older than 8 seconds, it is not a fresh live action from the dashboard
      if (triggeredAtMs > 0 && (now - triggeredAtMs > 8000)) {
        lastProcessedTriggerIdRef.current = triggerId;
        setBroadcastPhase('IDLE');
        return;
      }

      lastProcessedTriggerIdRef.current = triggerId;
      clearAllBroadcastTimers();

      const countdownSecs = Number(data.countdown_seconds) ?? 3;
      const durationSecs = Number(data.duration_seconds) ?? 10;
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
            handleIncomingBroadcast(val, true);
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
              handleIncomingBroadcast(val, false);
            } catch (e) {
              console.error('Realtime broadcast parse error:', e);
            }
          }
        }
      )
      .subscribe();

    fetchData(true).finally(() => {
      setTimeout(() => {
        isInitialMountRef.current = false;
      }, 1200);
    });

    const interval = setInterval(() => fetchData(false), 12000);

    return () => {
      clearAllBroadcastTimers();
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden font-sans flex flex-col justify-between relative select-none bg-[radial-gradient(ellipse_at_top,#fffcf2_0%,#faedc8_40%,#caa02f_100%)] text-slate-900">
      
      {/* Subtle Background Geometric Dots on Canvas */}
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
      <header className="h-[10vh] min-h-[65px] max-h-[85px] flex items-center justify-between px-6 md:px-8 border-b border-black/10 bg-white/40 backdrop-blur-md z-40 shadow-xs relative shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <img
            src="/Logo_White.png"
            alt="AAWA Fest Logo"
            className="h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            onError={(e: any) => { e.target.style.display = 'none'; }}
          />
          <div className="h-8 w-px bg-black/15"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 flex items-center gap-2.5">
              AAWA LIVE 
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black text-[#caa02f] font-black uppercase flex items-center gap-1 shadow-xs">
                <Radio className="w-2.5 h-2.5 text-red-500 animate-pulse" /> Live
              </span>
            </h1>
            <p className="text-[#8c670b] font-extrabold tracking-widest text-[10px] md:text-xs uppercase mt-0.5">
              AAWA PMSA Arts Fest 26-27 • When Values Speak
            </p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3 md:gap-4">
          <LiveClock />
        </div>
      </header>

      {/* 2. MAIN 3D CONTINUOUS CURVED RUNWAY (Unobstructed full visibility) */}
      <main className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-0 overflow-hidden my-auto">
        <Continuous3DCurvedRunway events={events} />
      </main>

      {/* 3. BOTTOM NOTIFICATION MARQUEE (Compact, cleanly decoupled from cards) */}
      <footer className="h-[5vh] min-h-[36px] max-h-[44px] bg-black text-[#fce8a6] flex items-center overflow-hidden relative z-40 border-t-2 border-[#caa02f] shadow-2xl shrink-0">
        <div className="bg-[#caa02f] text-black h-full px-5 flex items-center gap-1.5 z-20 skew-x-[-12deg] -ml-4 shadow-lg">
          <Zap className="w-3.5 h-3.5 text-black animate-pulse skew-x-[12deg]" />
          <span className="font-black uppercase tracking-widest text-[11px] skew-x-[12deg]">
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

      {/* 4. BROADCAST COUNTDOWN OVERLAY (Admin Dashboard Triggered) */}
      <AnimatePresence>
        {broadcastPhase === 'COUNTDOWN' && (
          <BroadcastCountdownOverlay 
            count={countdownNumber}
            bannerText={broadcastState?.banner_text || 'OFFICIAL HOUSE STANDINGS'}
          />
        )}
      </AnimatePresence>

      {/* 5. BROADCAST STANDINGS OVERLAY (Admin Dashboard Triggered) */}
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
