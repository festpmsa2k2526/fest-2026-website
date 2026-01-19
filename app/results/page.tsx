'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ChevronLeft, BarChart3, Filter, Zap, RefreshCw, Crown, Star
} from 'lucide-react';
import Link from 'next/link';

// ==========================================
// 📝 MANUAL DATA ENTRY AREA (EDIT THIS DURING THE FEST)
// ==========================================

// 1. TEAMS (Static)
const TEAMS = [
    { id: 'GR1', name: "Hormuz", color: "blue", hex: "#3b82f6" },
    { id: 'GR2', name: "Aden", color: "emerald", hex: "#10b981" },
    { id: 'GR3', name: "Zanzibar", color: "red", hex: "#ef4444" },
    { id: 'GR4', name: "Malacca", color: "amber", hex: "#f59e0b" }
];

// 2. RESULTS (Add new winners here!)
// Format: { id: number, event: "Name", section: "Junior", winner: "Name", teamId: "GR1", position: 1/2/3, grade: "A/B", points: 12, time: "10:30 AM" }
const MANUAL_RESULTS = [
    // EXAMPLE DATA (Replace with real results tomorrow)
    { id: 1, event: "MASHUP", section: "Sub-Junior", winner: "Hormuz Team", teamId: "GR1", position: 1, grade: "A", points: 17, time: "10:30 AM" },
    { id: 2, event: "SPEECH MALAYALAM", section: "Sub-Junior", winner: "Nibras Ahmmed", teamId: "GR2", position: 2, grade: "A", points: 13, time: "11:00 AM" },
    { id: 3, event: "QIRA'ATH", section: "Sub-Junior", winner: "Fouzan", teamId: "GR3", position: 1, grade: "A", points: 17, time: "11:15 AM" },
    { id: 4, event: "ESSAY WRITING", section: "Senior", winner: "Shuhaib", teamId: "GR1", position: 3, grade: "B", points: 7, time: "12:00 PM" },
    { id: 5, event: "WATER COLOR", section: "Junior", winner: "Adhil", teamId: "GR4", position: 1, grade: "A", points: 15, time: "12:30 PM" }
];

// ==========================================
// ⚙️ LOGIC (DO NOT TOUCH BELOW THIS LINE)
// ==========================================

export default function ResultsPage() {
  const [teamScores, setTeamScores] = useState<any[]>([]);
  const [latestResults, setLatestResults] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const calculateScores = () => {
      // 1. Calculate Totals
      const scoresMap: Record<string, number> = {};
      const catMap: Record<string, Record<string, number>> = {};

      // Initialize
      TEAMS.forEach(t => {
          scoresMap[t.id] = 0;
      });

      // Sum Points
      MANUAL_RESULTS.forEach(r => {
          // Total Score
          scoresMap[r.teamId] = (scoresMap[r.teamId] || 0) + r.points;

          // Category Score
          const cat = r.section || 'General';
          if (!catMap[cat]) catMap[cat] = {};
          if (!catMap[cat][r.teamId]) catMap[cat][r.teamId] = 0;
          catMap[cat][r.teamId] += r.points;
      });

      // Sort Teams
      const sortedTeams = TEAMS.map(t => ({
          ...t,
          score: scoresMap[t.id] || 0
      })).sort((a, b) => b.score - a.score);

      setTeamScores(sortedTeams);

      // Category Stats
      const stats = Object.entries(catMap).map(([cat, scores]) => ({
          category: cat,
          scores
      }));
      setCategoryStats(stats);

      // Latest Feed (Reverse order of manual entry)
      setLatestResults([...MANUAL_RESULTS].reverse());
      setLastUpdated(new Date());
  };

  useEffect(() => {
      calculateScores();
  }, []);

  const maxScore = Math.max(...teamScores.map(t => t.score), 10);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-[#0033A0] text-white pt-24 pb-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100 mix-blend-overlay"></div>
         <div className="container mx-auto px-6 relative z-10">
             {/* Using 'a' tag instead of Link to avoid build errors in preview if next/link is tricky */}
             <a href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Back to Home
             </a>
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black mb-2 flex items-center gap-3">
                        <Trophy className="w-12 h-12 text-yellow-400" />
                        Scoreboard
                    </h1>
                    <p className="text-blue-200 max-w-lg text-lg flex items-center gap-2">
                        Official Results
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Live
                        </span>
                    </p>
                </div>
                <div className="text-right text-xs text-blue-300">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                    <button onClick={calculateScores} className="ml-2 p-1 hover:text-white"><RefreshCw className="w-3 h-3" /></button>
                </div>
             </div>
         </div>
      </header>

      {/* Ticker */}
      <div className="w-full bg-slate-900 border-y border-white/10 overflow-hidden py-3 mb-8 relative">
         <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
         <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
         
         <motion.div 
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-100%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
         >
             {[...latestResults, ...latestResults].map((res, i) => {
                 const team = TEAMS.find(t => t.id === res.teamId);
                 return (
                     <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                         <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{res.event}</span>
                         <span className="text-white font-bold">
                            {res.winner} <span className="text-yellow-400 text-xs ml-1">({res.grade})</span>
                         </span>
                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.hex }}></span>
                     </div>
                 );
             })}
         </motion.div>
      </div>

      <div className="container mx-auto px-6 py-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* MAIN SCOREBOARD */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-[#0033A0]" />
                      Team Standings
                  </h3>
                  
                  <div className="space-y-6">
                      {teamScores.map((team, index) => (
                          <div key={team.id}>
                              <div className="flex justify-between items-end mb-2">
                                  <div className="flex items-center gap-3">
                                      <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                          {index + 1}
                                      </span>
                                      <span className="font-bold text-lg">{team.name}</span>
                                  </div>
                                  <span className="font-mono font-bold text-xl">{team.score}</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(team.score / maxScore) * 100}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                      className="h-full"
                                      style={{ backgroundColor: team.hex }}
                                  ></motion.div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* LATEST FEED */}
              <div className="bg-slate-50 p-8 rounded-3xl border border-gray-200 h-[600px] flex flex-col">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-500 uppercase tracking-widest text-sm">
                      <Zap className="w-4 h-4" /> Latest Updates
                  </h3>
                  
                  <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin flex-1">
                      <AnimatePresence>
                          {latestResults.map((res) => {
                              const team = TEAMS.find(t => t.id === res.teamId);
                              return (
                                  <motion.div 
                                      key={res.id}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
                                  >
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{res.section}</span>
                                              <span className="text-[10px] font-bold text-gray-400 uppercase truncate max-w-[150px]">{res.event}</span>
                                          </div>
                                          <div className="font-bold text-gray-900">{res.winner}</div>
                                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team?.hex }}></span>
                                              {team?.name}
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="font-black text-lg text-[#0033A0]">+{res.points}</div>
                                          <div className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 inline-block mt-1">
                                              {res.position ? `${res.position === 1 ? '1st' : res.position === 2 ? '2nd' : '3rd'}` : ''} {res.grade}
                                          </div>
                                          <div className="text-[10px] text-gray-300 mt-1">{res.time}</div>
                                      </div>
                                  </motion.div>
                              );
                          })}
                      </AnimatePresence>
                  </div>
              </div>
          </div>

          {/* DETAILED BREAKDOWN TABLE */}
          {categoryStats.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Filter className="w-5 h-5 text-[#0033A0]" />
                          Category-wise Performance
                      </h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                              <tr>
                                  <th className="px-6 py-4">Section</th>
                                  {teamScores.map(t => (
                                      <th key={t.id} className="px-6 py-4" style={{ color: t.hex }}>{t.name}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {categoryStats.map((row, i) => (
                                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                      <td className="px-6 py-4 font-medium text-gray-900">{row.category}</td>
                                      {teamScores.map(t => (
                                          <td key={t.id} className="px-6 py-4 text-gray-600 font-mono">
                                              {row.scores[t.id] || 0}
                                          </td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

      </div>
    </main>
  );
}