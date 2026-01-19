'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Table, Zap, RefreshCw, Crown
} from 'lucide-react';
import Link from 'next/link';

// ==========================================
// 📝 MANUAL DATA ENTRY AREA
// ==========================================

const TEAMS = [
    { id: 'GR1', name: "Hormuz", color: "blue", hex: "#3b82f6" },
    { id: 'GR2', name: "Aden", color: "emerald", hex: "#10b981" },
    { id: 'GR3', name: "Zanzibar", color: "red", hex: "#ef4444" },
    { id: 'GR4', name: "Malacca", color: "amber", hex: "#f59e0b" }
];

const CATEGORIES = ["Sub-Junior", "Junior", "Senior", "General"];

// NEW DATA STRUCTURE: Grouped by Event
const EVENT_RESULTS = [
    {
        id: 1,
        eventName: "ESSAY MALAYALAM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Althaf", teamId: "GR3", grade: "A", points: 17 },
            { pos: 2, name: "Sanah", teamId: "GR1", grade: "B", points: 11 },
            { pos: 3, name: "Rabeeh Ismayil", teamId: "GR1", grade: "B", points: 7 }
        ]
    },
    {
        id: 2,
        eventName: "REPORT MALAYALAM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Rabeeh Ismayil", teamId: "GR1", grade: "B", points: 13 },
            { pos: 2, name: "Harshad", teamId: "GR2", grade: "B", points: 9 },
            { pos: 3, name: "Shameem EC", teamId: "GR3", grade: "B", points: 6 }
        ]
    },
    {
        id: 3,
        eventName: "SHORT STORY MALAYALAM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Faheem", teamId: "GR4", grade: "A", points: 15 },
            { pos: 2, name: "Badurudheen", teamId: "GR3", grade: "B", points: 9 },
            { pos: 3, name: "Rabeeh Ismayil", teamId: "GR1", grade: "B", points: 6 }
        ]
    },
    {
        id: 4,
        eventName: "STORY MALAYALAM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Rabeeh Ismayil", teamId: "GR1", grade: "B", points: 13 },
            { pos: 2, name: "Midlaj A", teamId: "GR3", grade: "B", points: 11 },
            { pos: 3, name: "Adil Jawad", teamId: "GR4", grade: "C", points: 4 }
        ]
    },
    {
        id: 5,
        eventName: "HAIKU POEM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Shahad", teamId: "GR2", grade: "A", points: 15 },
            { pos: 2, name: "Rashid", teamId: "GR3", grade: "A", points: 11 },
            { pos: 3, name: "Althaf", teamId: "GR3", grade: "B", points: 7 }
        ]
    },
        {
        id: 6,
        eventName: "POEM MALAYALAM",
        category: "Junior",
        winners: [
            { pos: 1, name: "Shahad", teamId: "GR2", grade: "A", points: 15 },
            { pos: 2, name: "Althaf", teamId: "GR3", grade: "A", points: 11 },
            { pos: 3, name: "Sabith Ali", teamId: "GR2", grade: "A", points: 7 },
            { pos: 3, name: "Sadiq", teamId: "GR3", grade: "A", points: 7 }
        ]
    },
];

export default function ResultsPage() {
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const calculateStats = () => {
      // Structure: { GR1: { Sub-Junior: 10, Junior: 20... }, GR2: ... }
      const stats: Record<string, Record<string, number>> = {};

      // Initialize
      TEAMS.forEach(team => {
          stats[team.id] = { total: 0 };
          CATEGORIES.forEach(cat => {
              stats[team.id][cat] = 0;
          });
      });

      // Sum Points from nested structure
      EVENT_RESULTS.forEach(event => {
          const cat = event.category || 'General';
          event.winners.forEach(winner => {
              const tid = winner.teamId;
              if (stats[tid]) {
                  stats[tid][cat] = (stats[tid][cat] || 0) + winner.points;
                  stats[tid].total += winner.points;
              }
          });
      });

      // Convert to Array for Table
      const tableData = TEAMS.map(team => ({
          ...team,
          stats: stats[team.id]
      })).sort((a, b) => b.stats.total - a.stats.total);

      setBreakdown(tableData);
      setLastUpdated(new Date());
  };

  useEffect(() => {
      calculateStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-[#0033A0] text-white pt-24 pb-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100 mix-blend-overlay"></div>
         <div className="container mx-auto px-6 relative z-10">
             {/* Using 'a' tag for stability */}
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
                    <button onClick={calculateStats} className="ml-2 p-1 hover:text-white"><RefreshCw className="w-3 h-3" /></button>
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
                                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.hex }}></span>
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

          {/* 2. INFINITE RESULT CARDS MARQUEE */}
          <section className="overflow-hidden">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#0033A0]">
                  <Zap className="w-6 h-6 text-yellow-500" /> Live Results Feed
              </h2>
              
              <div className="w-full overflow-hidden relative">
                   <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                   <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
                   
                   <motion.div 
                      className="flex gap-6 py-4"
                      animate={{ x: ["0%", "-100%"] }}
                      transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                   >
                       {/* Duplicated list for seamless loop */}
                       {[...EVENT_RESULTS, ...EVENT_RESULTS, ...EVENT_RESULTS].reverse().map((event, i) => (
                           <div key={i} className="flex-shrink-0 w-96 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                               {/* Card Header */}
                               <div className="bg-[#0033A0] p-4 text-white">
                                   <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                                       {event.category}
                                   </div>
                                   <h3 className="font-black text-lg leading-tight">{event.eventName}</h3>
                               </div>
                               
                               {/* Winners List */}
                               <div className="p-4 flex-1 space-y-3">
                                   {event.winners.map((winner, idx) => {
                                       const team = TEAMS.find(t => t.id === winner.teamId);
                                       return (
                                           <div key={idx} className="flex items-center justify-between border-b last:border-0 border-gray-100 pb-2 last:pb-0">
                                               <div className="flex items-center gap-3">
                                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${winner.pos === 1 ? 'bg-yellow-100 text-yellow-700' : winner.pos === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-700'}`}>
                                                       {winner.pos}
                                                   </div>
                                                   <div>
                                                       <div className="text-sm font-bold text-gray-900">{winner.name}</div>
                                                       <div className="text-xs text-gray-500 font-medium" style={{ color: team?.hex }}>
                                                           {team?.name}
                                                       </div>
                                                   </div>
                                               </div>
                                               <div className="text-right">
                                                   <div className="text-lg font-black text-slate-800">+{winner.points}</div>
                                                   <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 rounded inline-block">{winner.grade} Grade</div>
                                               </div>
                                           </div>
                                       );
                                   })}
                               </div>
                           </div>
                       ))}
                   </motion.div>
              </div>
          </section>

      </div>
    </main>
  );
}