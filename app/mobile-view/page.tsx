'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  Radio, 
  RotateCw, 
  Trophy, 
  Filter, 
  CheckCircle2, 
  Medal, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  Calendar,
  Grid,
  List,
  X,
  Loader2
} from 'lucide-react';

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
  teamColor?: string;
  grade?: string | null;
  points: number;
}

interface EventItem {
  id: string;
  eventName: string;
  event_code: string;
  category: string;
  section: string;
  grade_type?: string;
  winners: Winner[];
}

const SECTIONS = ['All', 'Aliya', 'Foundation', 'Foundation General', 'General', 'On Stage', 'Off Stage'];
const HOUSES = [
  { name: 'All Houses', color: '#caa02f' },
  { name: 'FUSTAT', color: '#10b981' },
  { name: 'GULBARGA', color: '#f59e0b' },
  { name: 'ISHBILIYA', color: '#ef4444' }
];

export default function MobileViewPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState('All Houses');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // 1. Fetch live published event results directly from database API
  const fetchResults = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json.success && json.events) {
        setEvents(json.events);
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Mobile view live fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults(false);
    const timer = setInterval(() => fetchResults(false), 12000); // Auto-refresh every 12 seconds
    return () => clearInterval(timer);
  }, []);

  // 2. Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ev.eventName.toLowerCase().includes(q) ||
        (ev.event_code && ev.event_code.toLowerCase().includes(q)) ||
        ev.winners.some(
          (w) =>
            w.name.toLowerCase().includes(q) ||
            (w.chest_no && w.chest_no.toLowerCase().includes(q)) ||
            w.teamName.toLowerCase().includes(q)
        );

      // Section filter
      let matchSection = true;
      if (selectedSection !== 'All') {
        if (selectedSection === 'On Stage') {
          matchSection = ev.category?.toUpperCase().includes('ON') ?? false;
        } else if (selectedSection === 'Off Stage') {
          matchSection = ev.category?.toUpperCase().includes('OFF') ?? false;
        } else {
          matchSection =
            ev.section?.toLowerCase().includes(selectedSection.toLowerCase()) ?? false;
        }
      }

      // House filter
      let matchHouse = true;
      if (selectedHouse !== 'All Houses') {
        matchHouse = ev.winners.some(
          (w) => w.teamName.toLowerCase() === selectedHouse.toLowerCase()
        );
      }

      return matchSearch && matchSection && matchHouse;
    });
  }, [events, searchQuery, selectedSection, selectedHouse]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#fffcf0_0%,#faedd0_40%,#caa02f_120%)] text-slate-900 flex flex-col font-sans pb-16">
      
      {/* 1. COMPACT MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-[#caa02f]/30 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Logo_White.png"
              alt="AAWA '26"
              className="h-10 w-auto object-contain filter drop-shadow-xs"
              onError={(e: any) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-950">
                  AAWA '26
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-[10px] font-extrabold text-[#997314] uppercase tracking-wider">
                Official Event Results
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchResults(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#caa02f]/15 hover:bg-[#caa02f]/25 text-[#997314] active:scale-95 transition-all border border-[#caa02f]/40"
              title="Refresh results"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'compact' : 'cards')}
              className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-slate-800 active:scale-95 transition-all border border-black/10"
              title="Toggle View Mode"
            >
              {viewMode === 'cards' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, student, chest #, house..."
            className="w-full bg-white/95 border border-[#caa02f]/40 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#caa02f] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide whitespace-nowrap transition-all shadow-2xs ${
                selectedSection === sec
                  ? 'bg-[#caa02f] text-slate-950 font-black ring-1 ring-amber-300'
                  : 'bg-white/85 text-slate-700 border border-slate-200 hover:bg-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* House Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
          {HOUSES.map((h) => (
            <button
              key={h.name}
              onClick={() => setSelectedHouse(h.name)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all border ${
                selectedHouse === h.name
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white/75 text-slate-600 border-slate-200'
              }`}
            >
              {h.name !== 'All Houses' && (
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: h.color }}
                />
              )}
              <span>{h.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* 2. MAIN RESULTS FEED */}
      <main className="flex-1 px-3.5 pt-3.5 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-[#8c670b] font-bold">
          <span>Published Events ({filteredEvents.length})</span>
          {lastRefreshed && (
            <span className="text-[10px] text-slate-500 font-mono">
              Live: {lastRefreshed}
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3.5 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/70 rounded-2xl p-4 border border-[#caa02f]/20 animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-12 bg-slate-200 rounded"></div>
                </div>
                <div className="h-5 w-3/4 bg-slate-300 rounded"></div>
                <div className="space-y-2 pt-1">
                  <div className="h-8 bg-slate-200/80 rounded-xl"></div>
                  <div className="h-8 bg-slate-200/80 rounded-xl"></div>
                  <div className="h-8 bg-slate-200/80 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 text-center border border-[#caa02f]/30 shadow-sm mt-4">
            <Trophy className="w-10 h-10 text-[#caa02f]/60 mx-auto mb-2" />
            <h3 className="text-sm font-black text-slate-900 uppercase">No Results Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or section filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredEvents.map((ev, idx) => (
              <motion.div
                key={ev.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                className="bg-gradient-to-br from-[#120e06] via-[#1a1408] to-[#0f0c05] border-2 border-[#caa02f]/70 rounded-2xl p-3.5 text-white shadow-md relative overflow-hidden"
              >
                {/* Header Tag + Code */}
                <div className="flex items-center justify-between border-b border-[#caa02f]/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-[#caa02f]/25 border border-[#caa02f]/40 text-[#fff7db] text-[10px] font-black uppercase tracking-wider">
                      {ev.section || 'General'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-amber-200/80 text-[10px] font-bold uppercase">
                      {ev.category || 'ON STAGE'}
                    </span>
                  </div>

                  {ev.event_code && (
                    <span className="font-mono text-[10px] font-black text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-white/15">
                      #{ev.event_code}
                    </span>
                  )}
                </div>

                {/* Event Name */}
                <h3 className="text-base font-black text-white tracking-tight leading-snug mb-3">
                  {ev.eventName}
                </h3>

                {/* Winners List */}
                <div className="space-y-1.5">
                  {ev.winners && ev.winners.length > 0 ? (
                    ev.winners.map((w, wIdx) => {
                      const isFirst = w.pos === 1;
                      const isSecond = w.pos === 2;
                      const isThird = w.pos === 3;

                      return (
                        <div
                          key={wIdx}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            isFirst
                              ? 'bg-gradient-to-r from-amber-950/80 via-[#181308] to-[#120e06] border-amber-400/80 shadow-xs'
                              : isSecond
                              ? 'bg-[#0f1115] border-slate-400/40'
                              : isThird
                              ? 'bg-[#140c07] border-amber-800/40'
                              : 'bg-black/50 border-white/10'
                          }`}
                        >
                          {/* Rank Crest & Name */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-xs ${
                                isFirst
                                  ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-slate-950 ring-1 ring-yellow-200 font-black'
                                  : isSecond
                                  ? 'bg-gradient-to-br from-white via-slate-200 to-slate-400 text-slate-950 font-black'
                                  : isThird
                                  ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 font-bold'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {w.pos}
                            </div>

                            <div className="min-w-0">
                              <div className="font-extrabold text-white text-xs truncate flex items-center gap-1.5">
                                <span className="truncate">{w.name}</span>
                                {w.chest_no && (
                                  <span className="text-[10px] font-mono font-bold text-yellow-200 bg-black/70 px-1 py-0.2 rounded border border-amber-400/40 shrink-0">
                                    #{w.chest_no}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs ring-1 ring-white/40"
                                  style={{ backgroundColor: w.teamColor || '#caa02f' }}
                                />
                                <span className="text-[11px] font-bold text-[#fde68a] truncate">
                                  {w.teamName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Points & Grade */}
                          <div className="text-right shrink-0 pl-2">
                            <div className="font-mono font-black text-sm text-yellow-300">
                              +{w.points}
                              <span className="text-[9px] font-bold text-amber-200/80 uppercase ml-0.5">
                                Pts
                              </span>
                            </div>
                            {w.grade && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 inline-block shadow-2xs">
                                {w.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-3 text-xs text-amber-200/60 font-mono italic">
                      Awaiting jury adjudication...
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-200/70 font-mono">
                  <span>AAWA OFFICIAL JURY</span>
                  <span className="text-[#caa02f] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* 3. BOTTOM TICKER FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 text-[#fce8a6] border-t border-[#caa02f]/50 py-2 px-4 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-[#caa02f] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AAWA '26 • When Values Speak</span>
        </div>
        <div className="text-amber-200/70 text-[10px]">
          Live Stream Mode
        </div>
      </footer>
    </div>
  );
}
