'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Search, 
  X, 
  Sparkles, 
  Radio, 
  Shield, 
  RefreshCw, 
  Filter, 
  ChevronUp,
  Award,
  Layers,
  Zap,
  CheckCircle2,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

// ==========================================
// ⚙️ TYPES & INTERFACES
// ==========================================

interface Winner {
  pos: number;
  posLabel?: string;
  name: string;
  chest_no?: string | null;
  teamId?: string;
  teamName: string;
  teamColor: string;
  grade?: string | null;
  points: number;
}

interface EventCard {
  id: string;
  eventName: string;
  event_code: string;
  category: string;
  section: string;
  grade_type?: string;
  winners: Winner[];
}

const SECTION_TABS = ["All", "Aliya", "Foundation", "General", "On Stage", "Off Stage"];

const SAMPLE_EVENTS: EventCard[] = [
  {
    id: "sample-1",
    eventName: "Elocution English",
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

// ==========================================
// 📱 MOBILE RESULT CARD COMPONENT
// ==========================================
const MobileResultCard = ({ event }: { event: EventCard }) => {
  const winners = event.winners || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="relative rounded-3xl overflow-hidden border-2 border-[#caa02f]/60 shadow-[0_8px_25px_rgba(0,0,0,0.4)] text-white"
      style={{
        background: 'linear-gradient(135deg, #161208 0%, #0d0a04 60%, #171207 100%)',
      }}
    >
      {/* Subtle Top Golden Specular Light */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#caa02f]/20 rounded-full blur-xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 px-4 pt-4 pb-3 border-b border-[#caa02f]/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#caa02f]/25 border border-[#caa02f]/50 text-[#fff4d1] text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5 text-[#fce8a6]" />
              {event.section || 'General'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold uppercase tracking-wider">
              {event.category || 'Event'}
            </span>
          </div>

          {event.event_code && (
            <span className="font-mono text-[11px] font-black text-amber-300 bg-black/80 px-2.5 py-0.5 rounded-md border border-white/15 shadow-inner">
              #{event.event_code}
            </span>
          )}
        </div>

        <h3 className="text-lg font-black text-white leading-snug tracking-tight drop-shadow-sm">
          {event.eventName}
        </h3>
      </div>

      {/* Winners List */}
      <div className="p-3 space-y-2 relative z-10">
        {winners.length === 0 ? (
          <div className="text-center py-6 text-amber-200/50 text-xs font-medium italic">
            Adjudication in progress...
          </div>
        ) : (
          winners.map((w, idx) => {
            const isFirst = w.pos === 1;
            const isSecond = w.pos === 2;
            const isThird = w.pos === 3;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-950/90 via-[#181308] to-[#120e06] border-amber-400/90 shadow-[0_0_15px_rgba(202,160,47,0.25)]'
                    : isSecond
                    ? 'bg-[#0f1115] border-slate-400/50 shadow-sm'
                    : isThird
                    ? 'bg-[#140c07] border-amber-800/50 shadow-sm'
                    : 'bg-black/60 border-white/10'
                }`}
              >
                {/* Left: Rank Badge + Name & Team */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-md ${
                      isFirst
                        ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-slate-950 ring-2 ring-yellow-200'
                        : isSecond
                        ? 'bg-gradient-to-br from-white via-slate-200 to-slate-400 text-slate-950 ring-1 ring-white/70'
                        : isThird
                        ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 ring-1 ring-amber-400/50'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {w.pos}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-white text-[14px] truncate flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
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
                      <span className="text-xs font-bold text-[#fde68a] truncate tracking-wide">
                        {w.teamName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Points + Grade */}
                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-base text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    +{w.points}
                    <span className="text-[10px] font-bold text-amber-200/80 uppercase ml-0.5">Pts</span>
                  </div>
                  {w.grade && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 inline-block mt-0.5 shadow-sm">
                      {w.grade}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-200/60 font-mono">
        <span>AAWA ADJUDICATION</span>
        <span className="text-[#caa02f] font-bold flex items-center gap-1">
          <Shield className="w-3 h-3" /> OFFICIAL
        </span>
      </div>
    </motion.div>
  );
};

// ==========================================
// 🚀 MAIN MOBILE VIEW PAGE
// ==========================================
export default function MobileViewPage() {
  const [events, setEvents] = useState<EventCard[]>(SAMPLE_EVENTS);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // 1. Fetch Real-Time Data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();

      if (json.success && json.events && json.events.length > 0) {
        setEvents(json.events);
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (error) {
      console.error('Error fetching mobile results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15s live refresh

    // Scroll listener for top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    // Supabase Realtime Listener for instant result updates
    const channel = supabase
      .channel('mobile_results_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participations' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Filter & Search Logic
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Tab matching
      if (activeTab !== "All") {
        const sec = (ev.section || "").toLowerCase();
        const cat = (ev.category || "").toLowerCase();
        const target = activeTab.toLowerCase();

        if (target === "on stage" || target === "off stage") {
          if (!cat.includes(target)) return false;
        } else {
          if (!sec.includes(target)) return false;
        }
      }

      // Search matching (Event name, event code, student name, chest number, team)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = ev.eventName.toLowerCase().includes(q);
        const matchCode = ev.event_code.toLowerCase().includes(q);
        const matchWinner = ev.winners?.some(
          (w) =>
            w.name.toLowerCase().includes(q) ||
            (w.chest_no && w.chest_no.toLowerCase().includes(q)) ||
            w.teamName.toLowerCase().includes(q)
        );

        if (!matchTitle && !matchCode && !matchWinner) return false;
      }

      return true;
    });
  }, [events, activeTab, searchQuery]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,#fffcf2_0%,#faedc8_40%,#caa02f_100%)] text-slate-900 flex flex-col font-sans select-none pb-20">
      
      {/* Background Dots */}
      <div
        className="fixed inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(#b38617 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* 1. STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-black/10 shadow-sm px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <img
              src="/Logo_White.png"
              alt="AAWA '26"
              className="h-10 w-auto object-contain filter drop-shadow-sm"
              onError={(e: any) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-tight text-slate-950">
                  AAWA RESULTS
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-[#8c670b] uppercase tracking-wider">
                Published Event Stream
              </p>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 active:bg-black text-[#fce8a6] text-xs font-black uppercase tracking-wider border border-white/20 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#caa02f]' : ''}`} />
            <span>{isLoading ? 'Syncing' : 'Live'}</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, student, chest #, team..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl bg-white/90 border-2 border-black/10 text-slate-950 placeholder-slate-400 font-bold text-xs focus:outline-none focus:border-[#caa02f] focus:bg-white shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-3 pt-0.5 pb-1">
          {SECTION_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-slate-950 text-[#caa02f] shadow-md ring-2 ring-[#caa02f]'
                    : 'bg-white/80 text-slate-800 hover:bg-white border border-black/10'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. STATS & INFO BAR */}
      <div className="px-4 py-2 flex items-center justify-between text-xs font-bold text-[#8c670b] relative z-10">
        <div className="flex items-center gap-1.5 font-mono">
          <Award className="w-3.5 h-3.5 text-[#caa02f]" />
          <span>{filteredEvents.length} Events Displayed</span>
        </div>
        {lastRefreshed && (
          <span className="text-[10px] text-slate-600 font-mono">
            Updated {lastRefreshed}
          </span>
        )}
      </div>

      {/* 3. EVENT RESULTS STREAM */}
      <main className="flex-1 px-4 space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <MobileResultCard key={event.id} event={event} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 bg-white/50 backdrop-blur-md rounded-3xl border border-black/10 my-8 shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-[#caa02f]/20 text-[#8c670b] flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900">No Results Found</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Try searching with a different keyword or section filter.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-1.5 rounded-full bg-slate-950 text-[#caa02f] text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. FLOATING SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-slate-950 text-[#caa02f] border-2 border-[#caa02f] shadow-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
