'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Table, Zap, RefreshCw, Loader2, Grid, List 
} from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client'; 

// ==========================================
// 🎨 UI CONFIGURATION
// ==========================================

const TEAM_STYLES: Record<string, { color: string, hex: string }> = {
  'GR1': { color: "blue", hex: "#3b82f6" },     // Hormuz
  'GR2': { color: "emerald", hex: "#10b981" },  // Aden
  'GR3': { color: "red", hex: "#ef4444" },      // Zanzibar
  'GR4': { color: "amber", hex: "#f59e0b" }     // Malacca
};

// These must match the "normalized" values we create in fetchData
const CATEGORIES = ["Sub-Junior", "Junior", "Senior", "General"];

// Types
type Winner = {
  pos: number;
  name: string;
  teamId: string;
  grade: string;
  points: number;
};

type EventCard = {
  id: string;
  eventName: string;
  category: string; // This will now hold 'Junior', 'Senior', etc.
  event_id: string;
  winners: Winner[];
};

// ==========================================
// 🃏 REUSABLE CARD COMPONENT
// ==========================================
const ResultCard = ({ event, teams, className = "" }: { event: EventCard, teams: any[], className?: string }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full ${className}`}>
        {/* Card Header */}
        <div className="bg-[#0033A0] p-4 text-white">
            <div className="flex justify-between items-start">
                <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                    {event.category}
                </div>
                <div className="text-[10px] bg-blue-800/50 px-2 py-0.5 rounded text-blue-100 font-mono">
                    {event.event_id}
                </div>
            </div>
            <h3 className="font-black text-lg leading-tight mt-1">{event.eventName}</h3>
        </div>
        
        {/* Winners List */}
        <div className="p-4 flex-1 space-y-3">
            {event.winners.map((winner, idx) => {
                const team = teams.find(t => t.id === winner.teamId);
                const teamHex = team ? (TEAM_STYLES[team.slug]?.hex || "#9ca3af") : "#9ca3af";
                const teamName = team?.name || 'Individual';

                return (
                    <div key={idx} className="flex items-center justify-between border-b last:border-0 border-gray-100 pb-2 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${winner.pos === 1 ? 'bg-yellow-100 text-yellow-700' : winner.pos === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700'}`}>
                                {winner.pos}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 line-clamp-1">{winner.name}</div>
                                <div className="text-xs text-gray-500 font-medium" style={{ color: teamHex }}>
                                    {teamName}
                                </div>
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
// 🚀 MAIN PAGE COMPONENT
// ==========================================
export default function ResultsPage() {
  const supabase = createClient();
  
  // State
  const [teams, setTeams] = useState<any[]>([]);
  const [eventResults, setEventResults] = useState<EventCard[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  function setColourCode(teamName: string) {
    const team = teams.find(t => t.name === teamName);
    return team ? (TEAM_STYLES[team.slug]?.hex || "#9ca3af") : "#9ca3af";
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch All Data (including 'level' from events)
      const [teamsRes, eventsRes, studentsRes, resultsRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('events').select('*'), // This fetches 'level' automatically
        supabase.from('students').select('id, name'),
        supabase.from('results').select('*').eq('published', true).order('created_at', { ascending: false })
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (resultsRes.error) throw resultsRes.error;

      // 2. Lookups
      const teamMap: Record<string, any> = {};
      const formattedTeams = teamsRes.data.map((t: any) => {
        const style = TEAM_STYLES[t.slug] || { color: "gray", hex: "#9ca3af" };
        const teamObj = { ...t, ...style };
        teamMap[t.id] = teamObj; 
        return teamObj;
      });
      setTeams(formattedTeams);

      const eventMap: Record<string, any> = {};
      eventsRes.data.forEach((e: any) => { eventMap[e.id] = e; });

      const studentMap: Record<string, string> = {};
      studentsRes.data.forEach((s: any) => { studentMap[s.id] = s.name; });

      // 3. Process Results
      const groupedMap: Record<string, EventCard> = {};

      resultsRes.data.forEach((r: any) => {
        const event = eventMap[r.event_id];
        if (!event) return;

        // -------------------------------------------------------------
        // ⚡ FIX: Use 'level' column and Normalize "Subjunior" -> "Sub-Junior"
        // -------------------------------------------------------------
        let finalCategory = event.level || 'General';
        
        // Normalize specific mismatch if DB has "Subjunior" but UI needs "Sub-Junior"
        if (finalCategory.toLowerCase() === 'subjunior') {
            finalCategory = 'Sub-Junior';
        }

        if (!groupedMap[event.id]) {
          groupedMap[event.id] = {
            id: event.id,
            eventName: event.name,
            category: finalCategory, // Using the normalized level here
            event_id: event.event_code,
            winners: []
          };
        }

        let displayName = 'Unknown';
        if (r.student_id && studentMap[r.student_id]) {
            displayName = studentMap[r.student_id];
        } else if (r.team_id && teamMap[r.team_id]) {
            displayName = teamMap[r.team_id].name;
        }

        groupedMap[event.id].winners.push({
          pos: r.position,
          name: displayName,
          teamId: r.team_id,
          grade: r.grade,
          points: r.points
        });
      });

      // Sort winners by position
      Object.values(groupedMap).forEach(card => {
        card.winners.sort((a, b) => (a.pos || 99) - (b.pos || 99));
      });

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
    
    // Initialize
    currentTeams.forEach(team => {
      stats[team.id] = { total: 0 };
      CATEGORIES.forEach(cat => stats[team.id][cat] = 0);
    });

    // Sum Points
    currentEvents.forEach(event => {
      // event.category now holds "Junior", "Senior", "Sub-Junior" etc.
      const cat = event.category || 'General';
      
      event.winners.forEach(winner => {
        const tid = winner.teamId;
        // Check if team exists AND if the category is valid in our stats object
        if (tid && stats[tid] && stats[tid].hasOwnProperty(cat)) {
           stats[tid][cat] = (stats[tid][cat] || 0) + winner.points;
           stats[tid].total += winner.points;
        } else if (tid && stats[tid]) {
           // Fallback: If category string doesn't match perfectly, add to total only
           // or dump into 'General' if you prefer
           stats[tid].total += winner.points;
           // console.warn(`Category mismatch: '${cat}' not found in stats keys.`);
        }
      });
    });

    const tableData = currentTeams.map(team => ({
      ...team,
      stats: stats[team.id] || { total: 0 }
    })).sort((a, b) => b.stats.total - a.stats.total);

    setBreakdown(tableData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && eventResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-slate-500 text-sm">Loading Live Results...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-[#0033A0] text-white pt-24 pb-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100 mix-blend-overlay"></div>
         <div className="container mx-auto px-6 relative z-10">
             <a href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Back to Home
             </a>
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 flex items-center gap-3">
                        <Trophy className="w-12 h-12 text-yellow-400" />
                        Results Center
                    </h1>
                    <p className="text-blue-200 max-w-lg text-lg">
                        Official Scoreboard & Live Feed
                    </p>
                </div>
                <div className="text-right text-xs text-blue-300">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    <button onClick={fetchData} className="ml-2 p-1 hover:text-white" title="Refresh Data">
                      <RefreshCw className="w-3 h-3" />
                    </button>
                </div>
             </div>
         </div>
      </header>

      <div className="container mx-auto px-6 py-12 space-y-16">
          
          {/* 1. MAIN POINTS TABLE */}
          <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#0033A0]">
                  <Table className="w-6 h-6" /> Category Breakdown
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                              <tr>
                                  <th className="px-6 py-4">Team</th>
                                  {CATEGORIES.map(cat => (
                                      <th key={cat} className="px-6 py-4 text-center">{cat}</th>
                                  ))}
                                  <th className="px-6 py-4 text-right text-[#0033A0]">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {breakdown.map((row) => (
                                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: setColourCode(row.name) }}></span>
                                          {row.name}
                                      </td>
                                      {CATEGORIES.map(cat => (
                                          <td key={cat} className="px-6 py-4 text-center text-gray-600 font-mono">
                                              {row.stats[cat] || 0}
                                          </td>
                                      ))}
                                      <td className="px-6 py-4 text-right font-black text-lg text-[#0033A0]">
                                          {row.stats.total}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </section>

          {/* 2. LIVE RESULTS FEED */}
          <section className="pb-20">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold flex items-center gap-2 text-[#0033A0]">
                     <Zap className="w-6 h-6 text-yellow-500" /> Live Results Feed
                 </h2>
                 
                 {/* VIEW TOGGLE BUTTON */}
                 {eventResults.length > 0 && (
                   <button 
                     onClick={() => setShowAll(!showAll)}
                     className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                   >
                     {showAll ? (
                        <>
                          <List className="w-4 h-4" /> Hide All Results
                        </>
                     ) : (
                        <>
                          <Grid className="w-4 h-4" /> Show All Results
                        </>
                     )}
                   </button>
                 )}
              </div>
              
              <div className="w-full relative">
                   {/* Gradient Edges (Only in Marquee Mode) */}
                   {!showAll && eventResults.length > 0 && (
                     <>
                       <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
                       <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
                     </>
                   )}
                   
                   {eventResults.length > 0 ? (
                     <>
                       {showAll ? (
                         // MODE A: GRID VIEW (STATIC, ALL CARDS)
                         <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3 }}
                           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                         >
                            {eventResults.map((event, i) => (
                               <ResultCard 
                                  key={`${event.id}-${i}`} 
                                  event={event} 
                                  teams={teams} 
                                  className="w-full"
                               />
                            ))}
                         </motion.div>
                       ) : (
                         // MODE B: MARQUEE VIEW (INFINITE SCROLL)
                         <div className="overflow-hidden">
                           <motion.div 
                             className="flex gap-6 py-4"
                             animate={{ x: ["0%", "-100%"] }}
                             transition={{ 
                               duration: Math.max(30, eventResults.length * 8), 
                               ease: "linear", 
                               repeat: Infinity 
                             }}
                             whileHover={{ animationPlayState: "paused" }}
                           >
                               {[...eventResults, ...eventResults, ...eventResults].map((event, i) => (
                                   <ResultCard 
                                      key={`${event.id}-${i}`} 
                                      event={event} 
                                      teams={teams} 
                                      className="flex-shrink-0 w-96" 
                                   />
                               ))}
                           </motion.div>
                         </div>
                       )}
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                        <Trophy className="w-8 h-8 mb-2 opacity-20" />
                        <p>No results have been published yet.</p>
                     </div>
                   )}
              </div>
          </section>

      </div>
    </main>
  );
}