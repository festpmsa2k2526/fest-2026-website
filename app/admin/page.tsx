'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Save, Lock, Home, User, Users, Star, 
  Check, X, Copy, RefreshCw, LayoutTemplate
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA FOR AUTOCOMPLETE ---
const TEAMS = [
    { id: 'GR1', name: "Hormuz", color: "blue", hex: "#3b82f6" },
    { id: 'GR2', name: "Aden", color: "emerald", hex: "#10b981" },
    { id: 'GR3', name: "Zanzibar", color: "red", hex: "#ef4444" },
    { id: 'GR4', name: "Malacca", color: "amber", hex: "#f59e0b" }
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [generatedJSON, setGeneratedJSON] = useState("");

  // CARD STATE
  const [event, setEvent] = useState("");
  const [section, setSection] = useState("Sub-Junior");
  const [winnerName, setWinnerName] = useState("");
  const [teamId, setTeamId] = useState("GR1");
  const [position, setPosition] = useState("1");
  const [grade, setGrade] = useState("A");
  const [points, setPoints] = useState(12);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "2026") setIsAuthenticated(true);
    else alert("Invalid PIN");
  };

  const generateResult = () => {
      const newResult = {
          id: Date.now(),
          event: event.toUpperCase(),
          section,
          winner: winnerName,
          teamId,
          position: parseInt(position),
          grade,
          points,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const jsonString = JSON.stringify(newResult, null, 4);
      setGeneratedJSON(prev => prev ? prev + ",\n" + jsonString : jsonString);
  };

  const clearCard = () => {
      setEvent("");
      setWinnerName("");
      setPoints(0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute top-4 left-4">
            <Link href="/" className="text-white/50 hover:text-white flex items-center gap-2">
                <Home className="w-4 h-4" /> Back Home
            </Link>
        </div>
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-sm">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
               <Lock className="text-white w-8 h-8" />
             </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-6">Result Admin</h2>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 text-center tracking-widest text-xl" autoFocus />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Unlock</button>
        </form>
      </div>
    );
  }

  const selectedTeam = TEAMS.find(t => t.id === teamId);

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: THE EDITOR CARD */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="w-6 h-6 text-blue-600" /> Result Card Editor
                </h1>
                <button onClick={clearCard} className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset
                </button>
            </div>

            {/* LIVE PREVIEW CARD */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative mb-8">
                <div className="h-32 bg-gradient-to-r from-[#0033A0] to-blue-600 relative p-6 flex justify-between items-start">
                    <div>
                        <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                            {section}
                        </div>
                        <input 
                            type="text" 
                            placeholder="EVENT NAME" 
                            className="bg-transparent text-white text-3xl font-black uppercase placeholder:text-white/40 outline-none w-full"
                            value={event}
                            onChange={e => setEvent(e.target.value)}
                        />
                    </div>
                    <Trophy className="w-12 h-12 text-yellow-400 opacity-80" />
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg -mt-16 relative z-10">
                            <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Winner Name</label>
                            <input 
                                type="text" 
                                placeholder="Student Name / Team Name" 
                                className="w-full text-xl font-bold text-slate-900 border-b-2 border-transparent focus:border-blue-500 outline-none bg-transparent"
                                value={winnerName}
                                onChange={e => setWinnerName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Group</label>
                            <div className="flex flex-wrap gap-2">
                                {TEAMS.map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setTeamId(t.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${teamId === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-500 border-gray-200'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Position</label>
                            <div className="flex gap-2">
                                {['1', '2', '3'].map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => setPosition(p)}
                                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${position === p ? 'bg-yellow-400 text-yellow-900 shadow-md transform scale-110' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Grade</label>
                            <div className="flex gap-2">
                                {['A', 'B', 'C'].map(g => (
                                    <button 
                                        key={g}
                                        onClick={() => setGrade(g)}
                                        className={`w-10 h-10 rounded-lg font-bold border flex items-center justify-center transition-all ${grade === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Points</label>
                            <input 
                                type="number" 
                                className="w-full text-3xl font-black text-slate-900 outline-none"
                                value={points}
                                onChange={e => setPoints(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Section Selector Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                     {['Sub-Junior', 'Junior', 'Senior', 'General', 'Foundation'].map(s => (
                         <button 
                            key={s} 
                            onClick={() => setSection(s)}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${section === s ? 'bg-white text-blue-600' : 'bg-black/20 text-white/60 hover:bg-black/40'}`}
                         >
                             {s}
                         </button>
                     ))}
                </div>
            </div>

            <button 
                onClick={generateResult}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
                <Save className="w-5 h-5" /> Generate Result JSON
            </button>
        </div>

        {/* RIGHT: JSON OUTPUT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Generated Data (Copy to Results Page)</h3>
                <button 
                    onClick={() => { navigator.clipboard.writeText(generatedJSON); alert("Copied!"); }}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <Copy className="w-4 h-4" /> Copy All
                </button>
            </div>
            <textarea 
                readOnly
                className="flex-1 w-full bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl resize-none outline-none"
                value={`[\n${generatedJSON}\n]`}
            />
            <p className="text-xs text-gray-400 mt-4">
                Instructions: Copy this JSON block and paste it into the `MANUAL_RESULTS` array in `app/results/page.tsx`.
            </p>
        </div>

      </div>
    </div>
  );
}