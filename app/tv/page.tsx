'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Clock, Zap, Table, Loader2 } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client'; 

// ==========================================
// ⚙️ CONFIGURATION & CONSTANTS
// ==========================================
const CATEGORIES = ["Sub-Junior", "Junior", "Senior", "General"];

const TEAM_STYLES: Record<string, { color: string, hex: string }> = {
  'GR1': { color: "blue", hex: "#3b82f6" },    
  'GR2': { color: "emerald", hex: "#10b981" },  
  'GR3': { color: "red", hex: "#ef4444" },      
  'GR4': { color: "amber", hex: "#f59e0b" }     
};

const BATCH_SIZE = 2; // Reduced to 2 for better fit
const SLIDE_INTERVAL = 10000;

const LIVE_UPDATES = [
  "📢 Welcome to QUL '26 - PMSA Arts Fest",
  "🏆 Check out the Live Leaderboard!",
  "📍 Senior Debate Prelims at Auditorium A",
  "⚡ Registration closes in 30 mins for Off-stage events",
];

// ==========================================
// 🧩 SUB-COMPONENTS
// ==========================================

// 1. Score Table Component (Internal)
const ScoreTable = ({ data, loading }: { data: any[], loading: boolean }) => {
  const getTeamColor = (slug: string) => TEAM_STYLES[slug]?.hex || "#9ca3af";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Table className="w-5 h-5 text-[#0033A0]" />
        <h2 className="text-xl font-bold text-[#0033A0]">Category Breakdown</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 relative">
        <div className="absolute inset-0 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 bg-gray-50">Team</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className="px-2 py-3 text-center bg-gray-50">{cat.split('-')[0]}</th>
                ))}
                <th className="px-4 py-3 text-right text-[#0033A0] bg-gray-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900 flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: getTeamColor(row.slug) }}
                    ></span>
                    <span className="truncate max-w-[80px]">{row.name}</span>
                  </td>
                  {CATEGORIES.map(cat => (
                    <td key={cat} className="px-2 py-3 text-center text-gray-600 font-mono">
                      {row.stats[cat] || 0}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-black text-sm text-[#0033A0]">
                    {row.stats.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. Result Card (TV Style)
const TVResultCard = ({ event, teams }: { event: any, teams: any[] }) => {
  return (
    <div className="w-[350px] bg-white rounded-xl overflow-hidden shadow-2xl border-l-8 border-[#0033A0] flex flex-col h-full mx-4 shrink-0">
      <div className="bg-slate-100 p-2 border-b border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{event.category}</span>
          <h3 className="text-[14px] font-black text-slate-800 leading-none mt-1 line-clamp-1">{event.eventName}</h3>
        </div>
      </div>
      <div className="p-2 space-y-3">
        {event.winners.slice(0, 3).map((w: any, i: number) => {
           const team = teams.find(t => t.id === w.teamId);
           return (
             <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${w.pos === 1 ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-600'}`}>
                     {w.pos}
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-1">{w.name}</p>
                     <p className="text-xs font-bold text-slate-500 uppercase">{team?.name || 'Individual'}</p>
                   </div>
                </div>
                <span className="text-lg font-black text-[#0033A0]">+{w.points}</span>
             </div>
           )
        })}
      </div>
    </div>
  );
};

// 3. Infinite Marquee
const ResultTicker = ({ events, teams }: { events: any[], teams: any[] }) => {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [events]);

  useAnimationFrame((t, delta) => {
    if (contentWidth === 0) return;
    const speed = -0.05; 
    let newX = x.get() + (speed * delta);
    if (newX <= -contentWidth) newX = 0;
    x.set(newX);
  });

  return (
    <div className="overflow-hidden w-full bg-slate-200 py-4 border-t-4 border-[#0033A0]">
      <motion.div ref={containerRef} className="flex w-max" style={{ x }}>
        {[...events, ...events].map((e, i) => (
          <TVResultCard key={`${e.id}-${i}`} event={e} teams={teams} />
        ))}
      </motion.div>
    </div>
  );
};

// 4. Live Clock
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg">
      <Clock className="w-6 h-6 text-yellow-400" />
      <span className="text-2xl font-mono font-bold text-white tracking-widest">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

// ==========================================
// 🚀 MAIN PAGE COMPONENT
// ==========================================
export default function TVDisplayPage() {
  const supabase = createClient();
  
  // -- State --
  const [images, setImages] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchIndex, setBatchIndex] = useState(0);

  // -- Data Fetching & Logic --
  const fetchData = async () => {
    try {
      // 1. Fetch all raw data in parallel
      const [teamsRes, eventsRes, studentsRes, resultsRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('events').select('*'),
        supabase.from('students').select('id, name'),
        supabase.from('results').select('*').eq('published', true).order('created_at', { ascending: false })
      ]);

      // 2. Process Teams
      const rawTeams = teamsRes.data || [];
      setTeams(rawTeams);

      // 3. Process Results for Ticker
      if (resultsRes.data && eventsRes.data) {
        const eventMap = new Map(eventsRes.data.map((e: any) => [e.id, e]));
        const studentMap = new Map(studentsRes.data?.map((s: any) => [s.id, s.name]));
        const grouped: any = {};

        resultsRes.data.forEach((r: any) => {
          const ev = eventMap.get(r.event_id);
          if (!ev) return;
          if (!grouped[ev.id]) {
            grouped[ev.id] = { ...ev, eventName: ev.name, winners: [] };
          }
          let name = 'Unknown';
          if (r.student_id) name = studentMap.get(r.student_id) || 'Unknown';
          else if (r.team_id) name = rawTeams.find((t: any) => t.id === r.team_id)?.name || 'Team';

          grouped[ev.id].winners.push({ ...r, name, teamId: r.team_id, pos: r.position });
        });

        const finalEvents = Object.values(grouped).map((e: any) => {
          e.winners.sort((a: any, b: any) => a.pos - b.pos);
          return e;
        });
        setEvents(finalEvents);

        // 4. Process Stats for Table
        const stats: Record<string, Record<string, number>> = {};
        rawTeams.forEach(team => {
          stats[team.id] = { total: 0 };
          CATEGORIES.forEach(cat => stats[team.id][cat] = 0);
        });

        resultsRes.data.forEach((r: any) => {
          if (!r.team_id || !stats[r.team_id]) return;
          const event = eventMap.get(r.event_id);
          if (!event) return;

          let cat = event.level || 'General';
          if (cat.toLowerCase() === 'subjunior') cat = 'Sub-Junior';
          
          if (stats[r.team_id].hasOwnProperty(cat)) {
            stats[r.team_id][cat] = (stats[r.team_id][cat] || 0) + r.points;
          }
          stats[r.team_id].total += r.points;
        });

        const tableData = rawTeams.map(team => ({
          ...team,
          stats: stats[team.id] || { total: 0 }
        })).sort((a, b) => b.stats.total - a.stats.total);

        setBreakdown(tableData);
      }

      // 5. Fetch Images (Only if empty)
      if (images.length === 0) {
        const { data: files } = await supabase.storage.from('fest-highlights').list();
        if (files) {
          const urls = files
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => supabase.storage.from('fest-highlights').getPublicUrl(f.name).data.publicUrl);
          setImages(urls);
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every 1 min
    return () => clearInterval(interval);
  }, []);

  // -- Image Cycling Logic --
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setBatchIndex((prev) => (prev + 1) * BATCH_SIZE >= images.length ? 0 : prev + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images]);

  const currentImages = images.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

  // ==========================================
  // 📺 RENDER
  // ==========================================
  return (
    <div className="bg-slate-950 h-screen w-screen overflow-hidden text-white font-sans flex flex-col relative">
      {/* 1. TOP BAR */}
      <header className="h-[10vh] flex items-center justify-between px-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-6">
          {/* Replace with your actual logo path */}
          <img
            src="/Logo_White.png"
            alt="Logo"
            className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
          <div className="h-12 w-px bg-white/20"></div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              RESULTS CENTER
            </h1>
            <p className="text-blue-300 font-medium tracking-widest text-sm uppercase">
              PMSA Arts Fest 2026
            </p>
          </div>
        </div>
        <LiveClock />
      </header>

      {/* 2. MAIN CONTENT AREA (Flex Row) */}
      <main className="flex-1 flex gap-6 px-8 py-2 relative z-10 h-[58vh] box-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0033A0_0%,transparent_70%)] opacity-20 pointer-events-none"></div>

        {/* LEFT COL: IMAGE GALLERY (Dynamic Width - 70% approx) */}
        <div className="flex-1 h-full">
          <div className="grid grid-cols-2 gap-2 h-full w-[90%]">
            <AnimatePresence mode="wait">
              {currentImages.length > 0 ? (
                currentImages.map((src, i) => (
                  <motion.div
                    key={`${batchIndex}-${i}`}
                    // Start blurry and transparent
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    // Become clear
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    // Blur out again
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group h-full"
                  >
                    {/* Content remains the same */}
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={src}
                      alt="Highlight"
                      className="w-full h-full object-cover"
                    />
                    
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 flex items-center justify-center text-slate-600 animate-pulse border border-white/5 rounded-2xl bg-white/5">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
                    <p>Loading Highlights...</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COL: SCORE TABLE (Fixed Width - 30% approx) */}
        <div className="w-[38%] max-w-[500px] shrink-0 h-full flex flex-col">
          <div className="bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden h-full border border-white/10 relative p-2">
            {/* Scale the content slightly to fit nicely */}
            <div className="w-full h-full origin-top">
              <ScoreTable data={breakdown} loading={loading} />
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER AREA */}
      <div className="bottom-0 flex flex-col bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 relative">
        {/* RESULT MARQUEE */}
        <div className="flex-1 relative border-t border-white/10">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

          {events.length > 0 ? (
            <ResultTicker events={events} teams={teams} />
          ) : (
            <div className="h-full py-8 flex items-center justify-center text-slate-500 font-bold text-xl uppercase tracking-widest">
              <span className="animate-pulse">Waiting for Results...</span>
            </div>
          )}
        </div>

        {/* NOTIFICATION TICKER */}
        <div className="bottom-0 h-[4vh] bg-yellow-400 flex items-center overflow-hidden relative">
          <div className="bg-black/90 h-full px-8 flex items-center gap-2 z-20 skew-x-[-12deg] -ml-4 shadow-lg border-r-4 border-white">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse skew-x-[12deg]" />
            <span className="text-white font-black uppercase tracking-widest text-lg skew-x-[12deg]">
              Updates
            </span>
          </div>

          <motion.div
            className="flex whitespace-nowrap gap-8 items-center pl-10"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {[...LIVE_UPDATES, ...LIVE_UPDATES, ...LIVE_UPDATES].map(
              (txt, i) => (
                <span
                  key={i}
                  className="text-black font-bold text-sm uppercase flex items-center gap-4"
                >
                  {txt}
                  <span className="w-1.5 h-1.5 bg-black rounded-full opacity-50"></span>
                </span>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}