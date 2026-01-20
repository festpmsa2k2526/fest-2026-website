'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  motion, 
  useMotionValue, 
  useAnimationFrame 
} from 'framer-motion';
import { 
  Trophy, ChevronLeft, Table, Zap, RefreshCw, Loader2, Grid, List, Search, X, Filter
} from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client'; 

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================

const TEAM_STYLES: Record<string, { color: string, hex: string }> = {
  'GR1': { color: "blue", hex: "#3b82f6" },    
  'GR2': { color: "emerald", hex: "#10b981" },  
  'GR3': { color: "red", hex: "#ef4444" },      
  'GR4': { color: "amber", hex: "#f59e0b" }     
};

const CATEGORIES = ["Sub-Junior", "Junior", "Senior", "General"];

type Winner = { pos: number; name: string; teamId: string; grade: string; points: number; };
type EventCard = { id: string; eventName: string; category: string; event_id: string; winners: Winner[]; };

// ==========================================
// 🃏 REUSABLE CARD COMPONENT
// ==========================================
const ResultCard = ({ event, teams, className = "" }: { event: EventCard, teams: any[], className?: string }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
        <div className="bg-[#0033A0] p-4 text-white">
            <div className="flex justify-between items-start">
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">{event.category}</div>
                <div className="text-[10px] bg-blue-800/50 px-2 py-0.5 rounded text-blue-100 font-mono">{event.event_id}</div>
            </div>
            <h3 className="font-black text-lg leading-tight mt-1">{event.eventName}</h3>
        </div>
        <div className="p-4 flex-1 space-y-3">
            {event.winners.map((winner, idx) => {
                const team = teams.find(t => t.id === winner.teamId);
                const teamHex = team ? (TEAM_STYLES[team.slug]?.hex || "#9ca3af") : "#9ca3af";
                return (
                    <div key={idx} className="flex items-center justify-between border-b last:border-0 border-gray-100 pb-2 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${winner.pos === 1 ? 'bg-yellow-100 text-yellow-700' : winner.pos === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700'}`}>{winner.pos}</div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 line-clamp-1">{winner.name}</div>
                                <div className="text-xs text-gray-500 font-medium" style={{ color: teamHex }}>{team?.name || 'Individual'}</div>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-lg font-black text-slate-800">+{winner.points}</div>
                            <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 rounded inline-block">{winner.grade} Grade</div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

// ==========================================
// 🌊 NEW: DRAGGABLE MARQUEE COMPONENT
// ==========================================
const DraggableMarquee = ({ events, teams }: { events: EventCard[], teams: any[] }) => {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Calculate the width of the content to know when to loop
  useEffect(() => {
    if (containerRef.current) {
      // We divide by 2 because we are rendering the list TWICE for the loop
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [events]);

  // 2. The Animation Loop (Runs every frame)
  useAnimationFrame((t, delta) => {
    if (isDragging || contentWidth === 0) return;

    // --- SPEED CONTROL ---
    // Increase this number to make it faster (e.g., -0.2 is faster than -0.05)
    const speed = -0.07; 
    
    const moveBy = speed * delta; 
    let newX = x.get() + moveBy;

    // 3. The Infinite Loop Logic (Teleport back to 0)
    if (newX <= -contentWidth) {
      newX = 0;
    }

    x.set(newX);
  });

  return (
    <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing">
      <motion.div 
        ref={containerRef}
        className="flex gap-6 py-4 w-max"
        style={{ x }}
        drag="x"
        dragConstraints={{ right: 0, left: -contentWidth }} // Limits dragging
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {/* Render List TWICE for infinite illusion */}
        {[...events, ...events].map((event, i) => (
           <div key={`${event.id}-${i}`} className="w-96 shrink-0 pointer-events-none"> 
              {/* pointer-events-none prevents text selection while dragging */}
              <ResultCard event={event} teams={teams} className="h-full" />
           </div>
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================
export default function ResultsPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<any[]>([]);
  const [eventResults, setEventResults] = useState<EventCard[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  function setColourCode(teamName: string) {
    const team = teams.find(t => t.name === teamName);
    return team ? (TEAM_STYLES[team.slug]?.hex || "#9ca3af") : "#9ca3af";
  }

  const filteredEvents = useMemo(() => {
    return eventResults.filter(event => {
      const categoryMatch = selectedCategory === 'All' || event.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = event.eventName.toLowerCase().includes(searchLower) || 
                          event.event_id.toLowerCase().includes(searchLower);
      return categoryMatch && searchMatch;
    });
  }, [eventResults, selectedCategory, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, eventsRes, studentsRes, resultsRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('events').select('*'),
        supabase.from('students').select('id, name'),
        supabase.from('results').select('*').eq('published', true).order('created_at', { ascending: false })
      ]);

      if (teamsRes.error) throw teamsRes.error;
      
      // ... (Existing Data Processing Logic) ...
      const teamMap: Record<string, any> = {};
      const formattedTeams = teamsRes.data!.map((t: any) => {
        const style = TEAM_STYLES[t.slug] || { color: "gray", hex: "#9ca3af" };
        const teamObj = { ...t, ...style };
        teamMap[t.id] = teamObj; 
        return teamObj;
      });
      setTeams(formattedTeams);

      const eventMap: Record<string, any> = {};
      eventsRes.data!.forEach((e: any) => { eventMap[e.id] = e; });

      const studentMap: Record<string, string> = {};
      studentsRes.data!.forEach((s: any) => { studentMap[s.id] = s.name; });

      const groupedMap: Record<string, EventCard> = {};
      resultsRes.data!.forEach((r: any) => {
        const event = eventMap[r.event_id];
        if (!event) return;
        let finalCategory = event.level || 'General';
        if (finalCategory.toLowerCase() === 'subjunior') finalCategory = 'Sub-Junior';

        if (!groupedMap[event.id]) {
          groupedMap[event.id] = {
            id: event.id, eventName: event.name, category: finalCategory, event_id: event.event_code, winners: []
          };
        }
        let displayName = 'Unknown';
        if (r.student_id && studentMap[r.student_id]) displayName = studentMap[r.student_id];
        else if (r.team_id && teamMap[r.team_id]) displayName = teamMap[r.team_id].name;

        groupedMap[event.id].winners.push({
          pos: r.position, name: displayName, teamId: r.team_id, grade: r.grade, points: r.points
        });
      });

      Object.values(groupedMap).forEach(card => card.winners.sort((a, b) => (a.pos || 99) - (b.pos || 99)));
      const processedEvents = Object.values(groupedMap);
      setEventResults(processedEvents);
      calculateStats(formattedTeams, processedEvents);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (currentTeams: any[], currentEvents: EventCard[]) => {
    const stats: Record<string, Record<string, number>> = {};
    currentTeams.forEach(team => {
      stats[team.id] = { total: 0 };
      CATEGORIES.forEach(cat => stats[team.id][cat] = 0);
    });
    currentEvents.forEach(event => {
      const cat = event.category || 'General';
      event.winners.forEach(winner => {
        const tid = winner.teamId;
        if (tid && stats[tid]) {
           if (stats[tid].hasOwnProperty(cat)) stats[tid][cat] = (stats[tid][cat] || 0) + winner.points;
           stats[tid].total += winner.points;
        }
      });
    });
    const tableData = currentTeams.map(team => ({
      ...team, stats: stats[team.id] || { total: 0 }
    })).sort((a, b) => b.stats.total - a.stats.total);
    setBreakdown(tableData);
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && eventResults.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-[#0033A0] text-white pt-8 pb-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
         <div className="container mx-auto px-6 relative z-10">
             <a href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 text-sm font-bold uppercase tracking-widest"><ChevronLeft className="w-4 h-4" /> Back to Home</a>
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 flex items-center gap-3"><Trophy className="w-12 h-12 text-yellow-400" /> Results Center</h1>
                    <p className="text-blue-200 max-w-lg text-lg">Official Scoreboard & Live Feed</p>
                </div>
                <div className="text-right text-xs text-blue-300">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    <button onClick={fetchData} className="ml-2 p-1 hover:text-white"><RefreshCw className="w-3 h-3" /></button>
                </div>
             </div>
         </div>
      </header>

      <div className=" px-6 py-12 space-y-16">
          <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#0033A0]"><Table className="w-6 h-6" /> Category Breakdown</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                              <tr>
                                  <th className="px-6 py-4">Team</th>
                                  {CATEGORIES.map(cat => <th key={cat} className="px-6 py-4 text-center">{cat}</th>)}
                                  <th className="px-6 py-4 text-right text-[#0033A0]">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {breakdown.map((row) => (
                                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: setColourCode(row.name) }}></span>{row.name}</td>
                                      {CATEGORIES.map(cat => <td key={cat} className="px-6 py-4 text-center text-gray-600 font-mono">{row.stats[cat] || 0}</td>)}
                                      <td className="px-6 py-4 text-right font-black text-lg text-[#0033A0]">{row.stats.total}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </section>

          <section className="pb-20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                 <h2 className="text-2xl font-bold flex items-center gap-2 text-[#0033A0]"><Zap className="w-6 h-6 text-yellow-500" /> Live Results Feed</h2>
                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                       <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64 transition-all"/>
                       {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>}
                    </div>
                    <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors border border-gray-200 bg-white">
                      {showAll ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />} <span className="hidden sm:inline">{showAll ? "Grid View" : "Scroll View"}</span>
                    </button>
                 </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                  <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === 'All' ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-white text-slate-600 border-gray-200 hover:border-blue-300'}`}>All Categories</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-white text-slate-600 border-gray-200 hover:border-blue-300'}`}>{cat}</button>
                  ))}
              </div>
              
              <div className="w-full relative min-h-[300px]">
                   {filteredEvents.length > 0 ? (
                     <>
                       {showAll || searchQuery !== '' || selectedCategory !== 'All' ? (
                         // MODE A: GRID VIEW
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEvents.map((event, i) => <ResultCard key={`${event.id}-${i}`} event={event} teams={teams} className="w-full" />)}
                         </motion.div>
                       ) : (
                         // MODE B: DRAGGABLE MARQUEE VIEW
                         <DraggableMarquee events={filteredEvents} teams={teams} />
                       )}
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <Filter className="w-10 h-10 mb-3 opacity-20 text-blue-500" />
                        <p className="font-medium text-gray-500">No results found.</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                        {(searchQuery || selectedCategory !== 'All') && (
                          <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-xs font-bold text-blue-600 hover:underline">Clear Filters</button>
                        )}
                     </div>
                   )}
              </div>
          </section>
      </div>
    </main>
  );
}