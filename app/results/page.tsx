'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  motion, 
  useMotionValue, 
  useAnimationFrame 
} from 'framer-motion';
import { 
  Trophy, ChevronLeft, Table, Zap, RefreshCw, Loader2, Grid, List, Search, X, Filter, Medal, Award
} from 'lucide-react';

const CATEGORIES = ["All", "Aliya", "Foundation", "General", "On Stage", "Off Stage"];

type Winner = {
  pos: number;
  posLabel: string;
  name: string;
  chest_no?: string | null;
  teamId: string;
  teamName: string;
  teamColor: string;
  grade: string | null;
  points: number;
};

type EventCard = {
  id: string;
  eventName: string;
  event_code: string;
  category: string;
  section: string;
  grade_type: string;
  winners: Winner[];
};

// ==========================================
// RESULT CARD COMPONENT
// ==========================================
const ResultCard = ({ event, className = "" }: { event: EventCard, className?: string }) => {
  return (
    <div className={`bg-white rounded-2xl border-2 border-amber-100 shadow-md overflow-hidden flex flex-col h-full hover:shadow-xl hover:border-[#caa02f] transition-all duration-300 ${className}`}>
        <div className="bg-gradient-to-r from-[#b88e22] via-[#caa02f] to-[#dfb73e] p-4 text-white">
            <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded text-amber-100 uppercase tracking-widest">
                    {event.section}
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white uppercase">
                    {event.category}
                  </span>
                </div>
                <div className="text-[10px] bg-white/25 px-2 py-0.5 rounded text-white font-mono font-bold shrink-0">
                  {event.event_code || 'EVENT'}
                </div>
            </div>
            <h3 className="font-black text-lg leading-tight mt-2 text-white drop-shadow-xs">{event.eventName}</h3>
        </div>

        <div className="p-4 flex-1 space-y-3 bg-white">
            {event.winners.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                Awaiting results adjudication...
              </div>
            ) : (
              event.winners.map((winner, idx) => {
                const teamHex = winner.teamColor || "#caa02f";
                const isFirst = winner.pos === 1;
                const isSecond = winner.pos === 2;
                const isThird = winner.pos === 3;

                return (
                    <div key={idx} className="flex items-center justify-between border-b last:border-0 border-slate-100 pb-2.5 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                              isFirst ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300' :
                              isSecond ? 'bg-slate-200 text-slate-800 ring-2 ring-slate-300' :
                              isThird ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {winner.pos}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-slate-900 truncate">
                                  {winner.name}
                                </div>
                                <div className="text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                                  {winner.chest_no && (
                                    <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                                      #{winner.chest_no}
                                    </span>
                                  )}
                                  <span className="truncate" style={{ color: teamHex }}>
                                    {winner.teamName}
                                  </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                            <div className="text-base font-black text-slate-900">
                              +{winner.points} <span className="text-[10px] font-normal text-slate-400">pts</span>
                            </div>
                            {winner.grade ? (
                              <div className={`text-[10px] font-black px-1.5 py-0.5 rounded inline-block uppercase ${
                                winner.grade === 'A+' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                winner.grade === 'A' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                winner.grade === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                Grade {winner.grade}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">Rank Only</div>
                            )}
                        </div>
                    </div>
                );
              })
            )}
        </div>
    </div>
  );
};

// ==========================================
// DRAGGABLE MARQUEE COMPONENT
// ==========================================
const DraggableMarquee = ({ events }: { events: EventCard[] }) => {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [events]);

  useAnimationFrame((t, delta) => {
    if (isDragging || contentWidth === 0) return;
    const speed = -0.07; 
    const moveBy = speed * delta; 
    let newX = x.get() + moveBy;

    if (newX <= -contentWidth) {
      newX = 0;
    }

    x.set(newX);
  });

  return (
    <div className="overflow-hidden w-full py-4 cursor-grab active:cursor-grabbing select-none relative">
      <motion.div
        ref={containerRef}
        className="flex gap-6 w-max"
        style={{ x }}
        drag="x"
        dragConstraints={{ right: 0, left: -contentWidth }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {[...events, ...events].map((event, index) => (
          <div key={`${event.id}-${index}`} className="w-[320px] md:w-[360px] shrink-0">
            <ResultCard event={event} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN RESULTS PAGE
// ==========================================
export default function ResultsPage() {
  const [eventResults, setEventResults] = useState<EventCard[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAll, setShowAll] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      const json = await res.json();

      if (json.success) {
        setTeams(json.teams || []);
        setEventResults(json.events || []);
        setBreakdown(json.breakdown || []);
        setLastUpdated(new Date(json.lastUpdated || Date.now()));
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventResults.filter(e => {
      // 1. Category / Section Filter
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const secLower = (e.section || '').toLowerCase();
        const catLower = (e.category || '').toLowerCase();
        const selLower = selectedCategory.toLowerCase();

        if (selLower === 'on stage') matchesCategory = catLower.includes('on');
        else if (selLower === 'off stage') matchesCategory = catLower.includes('off');
        else matchesCategory = secLower.includes(selLower);
      }

      // 2. Search Query
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const inEvent = e.eventName.toLowerCase().includes(q) || (e.event_code || '').toLowerCase().includes(q);
        const inWinners = e.winners.some(w => 
          w.name.toLowerCase().includes(q) || 
          (w.chest_no && w.chest_no.toLowerCase().includes(q)) ||
          w.teamName.toLowerCase().includes(q)
        );
        matchesSearch = inEvent || inWinners;
      }

      return matchesCategory && matchesSearch;
    });
  }, [eventResults, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-white text-slate-800 font-sans selection:bg-[#caa02f] selection:text-white">
      {/* HEADER */}
      <header className="relative bg-[#caa02f] text-white py-12 px-6 border-b border-[#b88e22] shadow-lg">
         <div className="container mx-auto">
             <div className="flex items-center justify-between gap-4 mb-6">
                 <a href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-black uppercase tracking-wider bg-black/10 px-4 py-2 rounded-full border border-white/20">
                   <ChevronLeft className="w-4 h-4" /> Back to Fest Home
                 </a>
                 <div className="flex items-center gap-2 bg-black/15 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                   <span>LIVE SYSTEM</span>
                 </div>
             </div>

             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest text-amber-100 uppercase mb-3 border border-white/30">
                      AAWA 26-27 • 29 Sep, 30 Sep & 01 Oct 2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 text-white drop-shadow-sm tracking-tight">
                      AAWA '26 Results
                    </h1>
                    <p className="text-white/90 max-w-lg text-lg font-medium">Official Scoreboard & Live Results Feed • When Values Speak</p>
                </div>
                <div className="text-right text-xs text-white bg-white/15 px-4 py-2 rounded-xl border border-white/30 shadow-md">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    <button onClick={fetchData} title="Refresh" className="ml-2 p-1 hover:text-amber-200 transition-colors">
                      <RefreshCw className={`w-3.5 h-3.5 inline ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
             </div>
         </div>
      </header>

      {/* BODY */}
      <div className="container mx-auto px-6 py-12 space-y-16">
          {/* CATEGORY BREAKDOWN TABLE */}
          <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-900">
                <Table className="w-6 h-6 text-[#caa02f]" /> House Standings & Category Breakdown
              </h2>
              <div className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-amber-50/70 text-slate-700 font-black uppercase tracking-wider border-b border-amber-200/60">
                              <tr>
                                  <th className="px-6 py-4">House / Team</th>
                                  <th className="px-6 py-4 text-center">Aliya</th>
                                  <th className="px-6 py-4 text-center">Foundation</th>
                                  <th className="px-6 py-4 text-center">General</th>
                                  <th className="px-6 py-4 text-center text-blue-700">On Stage</th>
                                  <th className="px-6 py-4 text-center text-emerald-700">Off Stage</th>
                                  <th className="px-6 py-4 text-right text-[#caa02f] font-black">Total Score</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {breakdown.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                    Loading team breakdown...
                                  </td>
                                </tr>
                              ) : (
                                breakdown.map((row, idx) => (
                                  <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                        <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: row.color || "#caa02f" }}></span>
                                        <div className="flex flex-col">
                                          <span>{row.name}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">RANK #{idx+1}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center text-slate-700 font-mono font-bold">{row.stats.aliya || 0}</td>
                                      <td className="px-6 py-4 text-center text-slate-700 font-mono font-bold">{row.stats.foundation || 0}</td>
                                      <td className="px-6 py-4 text-center text-slate-700 font-mono font-bold">{row.stats.general || 0}</td>
                                      <td className="px-6 py-4 text-center text-blue-700 font-mono font-bold bg-blue-50/30">{row.stats.onStage || 0}</td>
                                      <td className="px-6 py-4 text-center text-emerald-700 font-mono font-bold bg-emerald-50/30">{row.stats.offStage || 0}</td>
                                      <td className="px-6 py-4 text-right font-black text-xl text-[#caa02f]">{row.stats.total}</td>
                                  </tr>
                                ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </section>

          {/* LIVE RESULTS FEED */}
          <section className="pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                 <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900">
                   <Zap className="w-6 h-6 text-[#caa02f]" /> Published Results Feed ({filteredEvents.length})
                 </h2>
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#caa02f]" />
                       <input 
                         type="text" 
                         placeholder="Search events, chest no, or winners..." 
                         value={searchQuery} 
                         onChange={(e) => setSearchQuery(e.target.value)} 
                         className="pl-10 pr-4 py-2 bg-white border border-amber-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#caa02f] w-64 md:w-80 transition-all shadow-sm"
                       />
                       {searchQuery && (
                         <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                           <X className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                    <button 
                      onClick={() => setShowAll(!showAll)} 
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors border border-amber-200 bg-white shadow-sm"
                    >
                      {showAll ? <List className="w-4 h-4 text-[#caa02f]" /> : <Grid className="w-4 h-4 text-[#caa02f]" />} 
                      <span className="hidden sm:inline">{showAll ? "Grid View" : "Scroll View"}</span>
                    </button>
                 </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)} 
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${selectedCategory === cat ? 'bg-[#caa02f] text-white border-[#caa02f] shadow-md' : 'bg-white text-slate-700 border-amber-200 hover:border-[#caa02f]'}`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
              
              <div className="w-full relative min-h-[300px]">
                   {filteredEvents.length > 0 ? (
                     <>
                       {showAll || searchQuery !== '' || selectedCategory !== 'All' ? (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEvents.map((event, i) => <ResultCard key={`${event.id}-${i}`} event={event} className="w-full" />)}
                         </motion.div>
                       ) : (
                         <DraggableMarquee events={filteredEvents} />
                       )}
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-amber-200 rounded-2xl bg-white/80 shadow-sm">
                        <Filter className="w-10 h-10 mb-3 opacity-30 text-[#caa02f]" />
                        <p className="font-bold text-slate-700">No results found.</p>
                        <p className="text-xs mt-1 text-slate-500">Results will appear here as soon as they are published by the jury.</p>
                        {(searchQuery || selectedCategory !== 'All') && (
                          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-xs font-bold text-[#caa02f] hover:underline">Clear Filters</button>
                        )}
                     </div>
                   )}
              </div>
          </section>
      </div>
    </main>
  );
}
