'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Trophy, Clock, Zap, MapPin } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client'; 

// ==========================================
// 🎨 THEME & CONFIG
// ==========================================
const COLORS = {
  primary: "#0033A0", // QUL Blue
  accent: "#FACC15",  // Yellow
  dark: "#020617",    // Slate 950
  card: "#1e293b"     // Slate 800
};

const BATCH_SIZE = 6; // Number of images to show at once
const SLIDE_INTERVAL = 8000; // Time in ms before swapping images

const LIVE_UPDATES = [
  "📢 Welcome to QUL '26 - PMSA Arts Fest",
  "🏆 Check out the Live Leaderboard!",
  "📍 Senior Debate Prelims at Auditorium A",
  "⚡ Registration closes in 30 mins for Off-stage events",
];

// ==========================================
// 🧩 COMPONENTS
// ==========================================

// 1. Result Card (TV Style - High Contrast, Larger Text)
const TVResultCard = ({ event, teams }: { event: any, teams: any[] }) => {
  return (
    <div className="w-[400px] bg-white rounded-xl overflow-hidden shadow-2xl border-l-8 border-[#0033A0] flex flex-col h-full mx-4 shrink-0">
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">{event.category}</span>
          <h3 className="text-xl font-black text-slate-800 leading-none mt-1 line-clamp-1">{event.eventName}</h3>
        </div>
        <div className="bg-[#0033A0] text-white text-xs font-mono py-1 px-2 rounded">
          {event.event_id}
        </div>
      </div>
      <div className="p-4 space-y-3">
        {event.winners.slice(0, 3).map((w: any, i: number) => {
           const team = teams.find(t => t.id === w.teamId);
           return (
             <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${w.pos === 1 ? 'bg-yellow-400 text-black' : 'bg-slate-200 text-slate-600'}`}>
                     {w.pos}
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{w.name}</p>
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

// 2. Infinite Marquee for Results
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
    const speed = -0.15; // Speed of the ticker
    let newX = x.get() + (speed * delta);
    if (newX <= -contentWidth) newX = 0;
    x.set(newX);
  });

  return (
    <div className="overflow-hidden w-full bg-slate-200 py-6 border-t-4 border-[#0033A0]">
      <motion.div ref={containerRef} className="flex w-max" style={{ x }}>
        {[...events, ...events].map((e, i) => (
          <TVResultCard key={`${e.id}-${i}`} event={e} teams={teams} />
        ))}
      </motion.div>
    </div>
  );
};

// 3. Live Clock
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
      <Clock className="w-6 h-6 text-yellow-400" />
      <span className="text-2xl font-mono font-bold text-white tracking-widest">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

// ==========================================
// 🚀 MAIN PAGE
// ==========================================
export default function TVDisplayPage() {
  const supabase = createClient();
  
  // Data State
  const [images, setImages] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Images
      const { data: files } = await supabase.storage.from('fest-highlights').list();
      if (files) {
        const urls = files
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => supabase.storage.from('fest-highlights').getPublicUrl(f.name).data.publicUrl);
        setImages(urls);
      }

      // 2. Fetch Results (Same logic as ResultsPage)
      const [teamsRes, eventsRes, studentsRes, resultsRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('events').select('*'),
        supabase.from('students').select('id, name'),
        supabase.from('results').select('*').eq('published', true).order('created_at', { ascending: false })
      ]);

      if (teamsRes.data) setTeams(teamsRes.data);

      // Process Results Logic (Simplified for brevity)
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
          else if (r.team_id) name = teamsRes.data?.find((t: any) => t.id === r.team_id)?.name || 'Team';

          grouped[ev.id].winners.push({ ...r, name, teamId: r.team_id, pos: r.position });
        });

        // Convert to array and sort winners
        const finalEvents = Object.values(grouped).map((e: any) => {
          e.winners.sort((a: any, b: any) => a.pos - b.pos);
          return e;
        });
        setEvents(finalEvents);
      }
    };

    fetchData();
    // Refresh data every 2 minutes
    const interval = setInterval(fetchData, 120000); 
    return () => clearInterval(interval);
  }, []);

  // Cycle Image Batches
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setBatchIndex((prev) => (prev + 1) * BATCH_SIZE >= images.length ? 0 : prev + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images]);

  // Current Batch of Images
  const currentImages = images.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

  return (
    <div className="bg-slate-950 w-screen h-screen overflow-hidden text-white font-sans flex flex-col relative">
      
      {/* 1. TOP BAR */}
      <header className="h-[12vh] flex items-center justify-between px-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="flex items-center gap-6">
           {/* Logo Placeholders */}
           <img src="/Logo_White.png" alt="Logo" className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
           <div className="h-12 w-px bg-white/20"></div>
           <div>
             <h1 className="text-3xl font-black tracking-tight text-white">RESULTS CENTER</h1>
             <p className="text-blue-300 font-medium tracking-widest text-sm uppercase">PMSA Arts Fest 2026</p>
           </div>
        </div>
        <LiveClock />
      </header>

      {/* 2. MAIN CONTENT (GALLERY) */}
      <main className="flex-1 p-10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0033A0_0%,transparent_70%)] opacity-20 pointer-events-none"></div>
        
        {/* Animated Grid */}
        <div className="grid grid-cols-3 gap-6 h-full w-full">
          <AnimatePresence mode="wait">
            {currentImages.length > 0 ? (
              currentImages.map((src, i) => (
                <motion.div
                  key={`${batchIndex}-${i}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
                >
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img src={src} alt="Highlight" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[10s]" />
                  
                  {/* Image Badge (Optional) */}
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Highlight #{batchIndex * BATCH_SIZE + i + 1}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center text-slate-600 animate-pulse">
                Loading Gallery...
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. FOOTER AREA (RESULTS + NOTIFICATIONS) */}
      <div className="h-[28vh] flex flex-col bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 relative">
         
         {/* RESULT MARQUEE */}
         <div className="flex-1 relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
            
            {events.length > 0 ? (
               <ResultTicker events={events} teams={teams} />
            ) : (
               <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xl uppercase tracking-widest">
                 Awaiting Results...
               </div>
            )}
         </div>

         {/* NOTIFICATION TICKER (BOTTOM STRIP) */}
         <div className="h-[6vh] bg-yellow-400 flex items-center overflow-hidden relative">
            <div className="bg-black/90 h-full px-8 flex items-center gap-2 z-20 skew-x-[-12deg] -ml-4">
               <Zap className="w-6 h-6 text-yellow-400 animate-pulse skew-x-[12deg]" />
               <span className="text-white font-black uppercase tracking-widest text-lg skew-x-[12deg]">Updates</span>
            </div>
            
            <motion.div 
              className="flex whitespace-nowrap gap-16 items-center pl-10"
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
               {[...LIVE_UPDATES, ...LIVE_UPDATES, ...LIVE_UPDATES].map((txt, i) => (
                 <span key={i} className="text-black font-bold text-xl uppercase flex items-center gap-4">
                    {txt}
                    <span className="w-2 h-2 bg-black rounded-full opacity-50"></span>
                 </span>
               ))}
            </motion.div>
         </div>
      </div>

    </div>
  );
}