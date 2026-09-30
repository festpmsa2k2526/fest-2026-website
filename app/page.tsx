'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  AnimatePresence
} from 'framer-motion';
import {
  Download, Calendar, Users,
  ArrowDown, Loader2, ExternalLink,
  ChevronUp, Mic2
} from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client'; 

// --- CONFIGURATION ---
const LIVE_UPDATES = [
  "📍 Results Updated - Check Leaderboard.",
  "⚡️ 'AAWA '26' Is in full swing — When Values Speak!"
];

// Curated High-Performance Default Highlights (Instant 0ms Load)
const DEFAULT_HIGHLIGHTS = [
  "https://res.cloudinary.com/x5ocehba/image/upload/v1790772243/NJHH_dohpap.jpg",
  "https://res.cloudinary.com/x5ocehba/image/upload/v1790772242/dfgfcht_k9oz7z.jpg",
  "https://res.cloudinary.com/x5ocehba/image/upload/v1790772242/sfsdgdhdf_rx9aaa.jpg"
];

// Committee List
const COMMITTEE = [
  { role: "Controller", name: "Ustad shiyas ali Wafy", image: "" },
  { role: "Chairman", name: "Muhammed Ansaf", image: "" },
  { role: "General Convenor", name: "Muhammed Althaf", image: "" },
  { role: "Deputy Convenor", name: "Ahmad Yaseen", image: "" },
  { role: "Vice Chairman", name: "Harshad H", image: "" },
  { role: "Asst. Convenor", name: "Muhammed hisan P", image: "" },
  { role: "Media Convenor", name: "Muhammed Shanif", image: "" },
  { role: "Asst. Media Convenor", name: "Muhammed Faheem", image: "" },
  { role: "Asst. Media Convenor", name: "Midlaj Rahman", image: "" },
  { role: "Asst. Media Convenor", name: "Muhammed Minhaj", image: "" },
  { role: "Technical Convenor", name: "Razeek Fariz", image: "" },
  { role: "Asst. Tech Convenor", name: "Adil Muhammed", image: "" },
  { role: "Financial Convenor", name: "Muhammed Sinan", image: "" },
  { role: "Event Manager", name: "Badhrudheen", image: "" },
  { role: "Event Manager", name: "Muhammed Shanil", image: "" },
];

// Map Database Slugs (GRA, GR2, GR3) to UI Gradients
const TEAM_GRADIENTS: Record<string, string> = {
  'GRA': "from-emerald-500 to-teal-700",      // FUSTAT (#10b981)
  'GR2': "from-amber-500 to-yellow-600",      // GULBARGA (#f59e0b)
  'GR3': "from-rose-500 to-red-700",          // ISHBILIYA (#ef4444)
};

// --- UTILITY COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const SpinningAsterisk = ({ className }: { className: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    className={className}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1536 1472" fill="currentColor" className="w-full h-full">
      <path d="M1386 922q46 26 59.5 77.5T1433 1097l-64 110q-26 46-77.5 59.5T1194 1254l-266-153v307q0 52-38 90t-90 38H672q-52 0-90-38t-38-90v-307l-266 153q-46 26-97.5 12.5T103 1207l-64-110q-26-46-12.5-97.5T86 922l266-154L86 614q-46-26-59.5-77.5T39 439l64-110q26-46 77.5-59.5T278 282l266 153V128q0-52 38-90t90-38h128q52 0 90 38t38 90v307l266-153q46-26 97.5-12.5T1369 329l64 110q26 46 12.5 97.5T1386 614l-266 154z"/>
    </svg>
  </motion.div>
);

const InfiniteMarquee = () => {
  return (
    <div className="relative flex overflow-hidden bg-white/20 backdrop-blur-md border-y border-white/30 py-4">
      <div className="absolute inset-0 bg-gradient-to-r from-[#caa02f] via-transparent to-[#caa02f] z-10 pointer-events-none opacity-40"></div>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...LIVE_UPDATES, ...LIVE_UPDATES, ...LIVE_UPDATES].map((text, i) => (
          <div key={i} className="flex items-center gap-3 text-white font-bold text-sm md:text-base uppercase tracking-wider drop-shadow-sm">
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_#ffffff]"></span>
            {text}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- DYNAMIC SECTIONS ---

// 1. Highlights Gallery (White center with golden gradient edges)
const HighlightsGallery = ({ images }: { images: string[] }) => {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (containerRef.current && images.length > 0) {
      setContentWidth(containerRef.current.scrollWidth / 4);
    }
  }, [images]);

  useAnimationFrame((t, delta) => {
    if (isDragging || contentWidth === 0) return;
    const moveBy = -0.05 * delta; 
    let newX = x.get() + moveBy;
    if (newX <= -contentWidth) {
      newX = 0;
    }
    x.set(newX);
  });

  return (
    <section className="py-24 bg-[radial-gradient(ellipse_at_top,#ffffff_0%,#fdf9ee_50%,#f3df9b_100%)] overflow-hidden relative text-slate-900 border-t border-amber-200/60">
      {/* Title Section */}
      <div className="container mx-auto px-6 mb-12 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#caa02f]/40 bg-white shadow-sm text-[#caa02f] text-xs font-black tracking-widest uppercase mb-3">
          Moments in Motion
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">Fest Highlights</h2>
        <div className="h-1.5 w-24 bg-[#caa02f] rounded-full shadow-sm"></div>
      </div>

      {/* Content Area */}
      <div className="flex overflow-hidden relative z-10">
        {images.length > 0 ? (
          <motion.div
            ref={containerRef}
            className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
            style={{ x }} 
            drag="x"      
            dragConstraints={{ right: 0 }} 
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            {[...images, ...images, ...images, ...images].map((src, i) => (
              <div 
                key={i} 
                className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] shrink-0 rounded-2xl overflow-hidden group pointer-events-none select-none border-2 border-white shadow-xl bg-white"
              >
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-30 transition-opacity"></div>
                 <img 
                   src={src} 
                   alt="Highlight" 
                   loading="lazy" 
                   decoding="async" 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                 />
                 <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
                   <span className="text-xs font-mono px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[#caa02f] font-black shadow-md">
                     Day {(i % 3) + 1}
                   </span>
                 </div>
              </div>
            ))}
          </motion.div>
        ) : (
           <div className="flex gap-6 px-6 overflow-hidden w-full">
             {[...Array(5)].map((_, i) => (
               <div 
                 key={i}
                 className="w-[300px] h-[400px] md:w-[400px] md:h-[500px] shrink-0 rounded-2xl bg-white/60 border border-amber-200/50 animate-pulse relative overflow-hidden shadow-sm"
               >
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-100/30 to-transparent skew-x-12 opacity-50"></div>
                 <div className="absolute bottom-6 left-6 right-6">
                   <div className="h-2 w-16 bg-[#caa02f]/40 rounded mb-2"></div>
                   <div className="h-2 w-full bg-amber-100 rounded"></div>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </section>
  );
};

// 2. Live Dashboard (Rich #caa02f Royal Gold with White Cards)
const LiveDashboard = ({ teamData, loading }: { teamData: any[], loading: boolean }) => {
  return (
    <section id='leaderboard' className="relative py-24 bg-[#caa02f] text-white overflow-hidden shadow-inner">
      <div className="absolute top-0 w-full z-20">
        <InfiniteMarquee />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#dfb73e_0%,#caa02f_70%,#b88e22_100%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 pt-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-md mb-6 shadow-sm"
          >
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_#ffffff]"></span>
            <span className="text-xs font-black tracking-widest uppercase text-white">Official Scoreboard</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-sm">Team Standings</h2>
          <p className="text-amber-100 font-medium max-w-xl mx-auto drop-shadow-sm">Live scores updated in real-time from festival adjudication.</p>
        </div>

        {/* Group Cards (Clean Crisp White Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading ? (
             <div className="col-span-full flex justify-center py-20">
               <Loader2 className="w-10 h-10 animate-spin text-white" />
             </div>
          ) : (
             teamData.map((team, i) => (
            <motion.div
              key={team.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative h-[460px] rounded-2xl overflow-hidden bg-white text-slate-900 border-2 border-white shadow-2xl group flex flex-col justify-end transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${team.color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>
              
              {/* Colored Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#caa02f] via-amber-400 to-[#caa02f]"></div>

              <div className="p-6 relative z-10 w-full">
                {/* ID with Zero Pad */}
                <h3 className="text-6xl font-black text-slate-200 group-hover:text-[#caa02f]/40 transition-colors duration-300">
                    {String(i+1).padStart(2, '0')}
                </h3>
                <p className="text-2xl font-black mt-2 text-slate-900">{team.name}</p>
                <p className="text-3xl font-black text-[#caa02f] mt-1 mb-6">{team.points} <span className="text-lg font-bold text-slate-400">Pts</span></p>

                {/* Category Breakdown Bars */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {/* Aliya Section */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-bold w-16">Aliya</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${team.points > 0 ? ((team.sections?.aliya || 0) / team.points) * 100 : 0}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                    <span className="text-slate-900 font-mono font-bold">{team.sections?.aliya || 0}</span>
                  </div>

                  {/* Foundation Section */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-bold w-16">Foundation</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${team.points > 0 ? ((team.sections?.foundation || 0) / team.points) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="h-full bg-emerald-600"
                      />
                    </div>
                    <span className="text-slate-900 font-mono font-bold">{team.sections?.foundation || 0}</span>
                  </div>

                  {/* General Section */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-bold w-16">General</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${team.points > 0 ? ((team.sections?.general || 0) / team.points) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-[#caa02f]"
                      />
                    </div>
                    <span className="text-slate-900 font-mono font-bold">{team.sections?.general || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )))}
        </div>

        {/* Schedule & Downloads Area (White Card + Radiant CTAs) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-8 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border-2 border-white">
            <div>
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2 text-slate-900">
                <Calendar className="w-6 h-6 text-[#caa02f]" /> Festival Dates
              </h3>
              <p className="text-slate-600 font-medium text-sm">AAWA PMSA Arts Fest 26-27</p>
            </div>
            <div className="flex gap-3">
              {/* 29 September */}
              <div className="text-center px-4 py-3 bg-amber-50/90 border border-amber-200 rounded-xl shadow-xs">
                <div className="text-2xl font-black text-slate-900">29</div>
                <div className="text-[10px] uppercase font-black text-[#caa02f] tracking-wider">Sep</div>
              </div>
              {/* 30 September */}
              <div className="text-center px-4 py-3 bg-amber-50/90 border border-amber-200 rounded-xl shadow-xs">
                <div className="text-2xl font-black text-slate-900">30</div>
                <div className="text-[10px] uppercase font-black text-[#caa02f] tracking-wider">Sep</div>
              </div>
              {/* 01 October */}
              <div className="text-center px-4 py-3 bg-[#caa02f]/15 border-2 border-[#caa02f] rounded-xl shadow-sm">
                <div className="text-2xl font-black text-[#caa02f]">01</div>
                <div className="text-[10px] uppercase font-black text-slate-900 tracking-wider">Oct</div>
              </div>
            </div>
          </div>

          <a 
            href="https://drive.google.com/file/d/1BDWc-Cu2eYdfodH6m6GRcO6NrlksG_AC/view?usp=drive_link" 
            target="_blank" 
            className="bg-white hover:bg-amber-50 text-[#9b781b] transition-all duration-300 rounded-2xl p-6 flex flex-col justify-center items-center gap-3 shadow-2xl text-center group font-black hover:scale-[1.02]"
          >
            <Download className="w-10 h-10 group-hover:scale-110 transition-transform text-[#caa02f]" />
            <span className="font-black text-lg leading-tight">Download Schedule</span>
          </a>

          <a 
            href="/results" 
            className="bg-white/15 border-2 border-white hover:bg-white hover:text-[#9b781b] transition-all duration-300 rounded-2xl p-6 text-white flex flex-col justify-center items-center gap-3 shadow-2xl text-center group font-black hover:scale-[1.02]"
          >
            <ExternalLink className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-black text-lg leading-tight">Explore Live Results</span>
          </a>
        </div>
      </div>
    </section>
  );
};

// --- ABOUT SECTION (When Values Speak) ---
const AboutSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yCol1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  return (
    <section 
      ref={containerRef} 
      className="relative py-32 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#fffdfa_40%,#fbf2d3_80%,#e4bd43_100%)] text-slate-900 overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <motion.div style={{ rotate: bgRotate }} className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] bg-white/60 rounded-[3rem] -z-10 blur-3xl pointer-events-none" />
      <motion.div style={{ rotate: bgRotate, scale: 1.2 }} className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-amber-100/40 rounded-full -z-10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20 text-center"
        >
          <div className="inline-block mb-4">
             <SpinningAsterisk className="w-12 h-12 text-[#caa02f]" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#caa02f]/40 bg-white/90 shadow-sm text-[#caa02f] text-xs font-black tracking-widest uppercase mb-4">
            <Mic2 className="w-3.5 h-3.5" /> When Values Speak
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight text-slate-900">
            Where Talent Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#caa02f] via-amber-600 to-[#caa02f]">Purpose</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium">The Voice of Art, Conviction, and Expression</p>
          <div className="h-1.5 w-32 bg-[#caa02f] mx-auto mt-6 rounded-full shadow-sm"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
           {/* Column 1 */}
           <motion.div style={{ y: yCol1 }} className="relative">
             <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-l-4 border-[#caa02f] border-y border-r border-amber-200/60 shadow-xl"
             >
                <h3 className="text-2xl font-black mb-5 text-slate-900 flex items-center gap-3">
                  <span className="w-8 h-1 bg-[#caa02f] rounded-full"></span> The Heart of Campus
                </h3>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed text-justify font-normal">
                  "PMSA Wafy College Kattilangadi, a prestigious institution blending spiritual and secular education, presents <b className="text-[#caa02f] font-bold">AAWA '26 — PMSA Arts Fest 26-27</b>, hosted by the Munthajul Afnan Students' Association (MASA). More than just a student union, MASA serves as the vibrant heartbeat of campus life, empowering students to lead with moral integrity and creative vision. This annual arts festival is their flagship event, a testament to the community's dedication to nurturing holistic excellence and providing a stage where talent meets purpose."
                </p>
             </motion.div>
           </motion.div>

           {/* Column 2 */}
           <motion.div style={{ y: yCol2 }} className="relative pt-6 md:pt-0">
             <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border-r-4 border-[#caa02f] border-y border-l border-amber-200/60 shadow-xl"
             >
                <h3 className="text-2xl font-black mb-5 text-slate-900 flex items-center gap-3 md:justify-end">
                  When Values Speak <span className="w-8 h-1 bg-[#caa02f] rounded-full"></span>
                </h3>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed text-justify font-normal">
                  "This year's festival, themed <b className="text-[#caa02f] font-bold">'AAWA: When Values Speak,'</b> draws its essence from the Arabic word <i>AAWA</i>, meaning <b>'Voice'</b>. It represents the awakening of conscious expression — where art, speech, and creativity become the voice of truth, character, and spiritual excellence. Across four competing groups and over 80 events spanning three days (29 Sep, 30 Sep & 01 Oct 2026), AAWA '26 celebrates the harmonious convergence of faith, intellect, and creativity."
                </p>
             </motion.div>
           </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- HERO SECTION WITH ROYAL GOLD CANVAS & WHITE LOGO ---

const ZoomHero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 0.4], [0, 200]);

  return (
    <section ref={containerRef} className="relative h-[100vh] bg-[#caa02f]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        {/* Background Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#e4bc41_0%,#caa02f_70%,#b88e22_100%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-110"></div>

        {/* Spinning Asterisks */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-between pointer-events-none z-10 overflow-visible">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
            <SpinningAsterisk className="w-[80vh] h-[80vh] md:w-[150vh] md:h-[150vh] text-white/10" />
          </div>
          <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2">
            <SpinningAsterisk className="w-12 h-12 md:w-24 md:h-24 text-white/20" />
          </div>
        </div>

        {/* Floating Ambient Light Orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-30 pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-100 rounded-full mix-blend-overlay filter blur-[120px] opacity-25 pointer-events-none"
        />

        {/* Zooming Logo Container */}
        <motion.div style={{ scale }} className="relative z-20 flex flex-col items-center mb-12">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">
            <img src="/Logo_White.png" alt="AAWA Logo" className="w-full h-full object-contain" />
          </div>
        </motion.div>

        {/* Date & College Text Layer */}
        <motion.div style={{ y: yText, opacity }} className="absolute z-10 text-center text-white px-4 bottom-[12%] md:bottom-[15%]">
          <h2 className="text-xs sm:text-sm md:text-lg font-medium tracking-[0.35em] md:tracking-[0.5em] uppercase mb-2 text-white/95 drop-shadow-md">
            AAWA 26-27 &#8226; 29, 30 SEP & 01 OCT 2026
          </h2>
          <p className="text-[11px] sm:text-xs md:text-sm font-medium tracking-[0.25em] md:tracking-[0.3em] uppercase text-amber-100">
            PMSA WAFY COLLEGE KATTILANGADI
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-6 md:bottom-8 flex flex-col items-center gap-2 text-xs uppercase tracking-widest opacity-70 text-white font-medium"
        >
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

const ManifestoCard = ({ number, title, arabic, desc, delay = 0 }: { number: string; title: string; arabic: string; desc: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    viewport={{ once: true }}
    className="group relative p-8 border-l-4 border-white bg-white/15 backdrop-blur-md rounded-r-2xl border-y border-r border-white/25 transition-all duration-500 shadow-xl hover:bg-white/20"
  >
    <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-60 transition-opacity">
      <span className="text-4xl font-serif text-white">{arabic}</span>
    </div>
    <span className="text-xs font-mono text-white/80 mb-2 block font-black tracking-wider">{number}</span>
    <h3 className="text-2xl font-black mb-3 text-white">{title}</h3>
    <p className="text-white/90 leading-relaxed font-normal">{desc}</p>
  </motion.div>
);

// --- THEME MANIFESTO (AAWA: The Voice • When Values Speak) ---
const ThemeManifesto = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-[#caa02f] via-[#b88e22] to-[#caa02f] text-white overflow-hidden shadow-inner">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative text-center lg:text-left"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-black uppercase tracking-widest text-white mb-4">
                Theme Philosophy
              </div>
              <h2 className="text-[7rem] md:text-[11rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/40 to-transparent select-none">
                آوا
              </h2>
              <p className="text-2xl font-black text-white mt-2 tracking-wide">
                AAWA • The Voice
              </p>
              <p className="text-base text-amber-100 font-medium italic mt-1">
                "When Values Speak"
              </p>
            </motion.div>
          </div>
          <div className="lg:col-span-7 space-y-8">
            <ManifestoCard 
              number="01" 
              title="The Voice (AAWA)" 
              arabic="آوا" 
              desc="Rooted in the Arabic meaning of 'Voice', AAWA represents the awakening of conscious expression. Before words are spoken, they are born from genuine conviction, wisdom, and upright intention." 
            />
            <ManifestoCard 
              number="02" 
              title="When Values Speak" 
              arabic="قِيَم" 
              desc="True art finds its greatest power when values find their voice. AAWA transforms the stage into a sacred medium where moral values and creative talent speak with clarity, truth, and conviction." 
              delay={0.2} 
            />
            <ManifestoCard 
              number="03" 
              title="Resonant Legacy" 
              arabic="أَثَر" 
              desc="A voice carrying sincere principles resonates far beyond the performance, inspiring hearts, nurturing intellect, and leaving an enduring legacy of holistic cultural excellence." 
              delay={0.4} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// --- COMMITTEE SECTION (Luminous Center White Gradient) ---
const CommitteeGrid = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section className="py-24 bg-[radial-gradient(circle_at_center,#ffffff_0%,#fffcf4_50%,#f5e6b5_100%)] relative overflow-hidden border-t border-amber-200/60">
      <div className="container mx-auto px-6 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-[#caa02f]" />
            <h2 className="text-3xl font-black text-slate-900">Organizers & Committee</h2>
          </div>
          <div className="h-px bg-amber-200 flex-1 ml-8"></div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div key="marquee" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full">
            <div className="flex overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
              <motion.div className="flex gap-6 pl-6" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 120, ease: "linear", repeat: Infinity }}>
                {[...COMMITTEE, ...COMMITTEE].map((member, i) => (
                  <div key={i} className="flex-shrink-0 w-72 bg-white p-6 rounded-2xl border border-amber-200/70 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-[#caa02f] transition-all">
                    <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-[#caa02f] flex-shrink-0 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=caa02f&color=ffffff&bold=true`} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{member.name}</h4>
                      <p className="text-[10px] text-[#caa02f] uppercase tracking-wide mt-1 font-black">{member.role}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="flex justify-center mt-12">
              <button 
                onClick={() => setIsExpanded(true)} 
                className="flex items-center gap-2 px-6 py-3 bg-[#caa02f] text-white rounded-full text-sm font-black shadow-lg hover:bg-[#b88e22] transition-all transform hover:scale-105"
              >
                <Users className="w-4 h-4" /> Meet the Entire Committee
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {COMMITTEE.map((member, i) => (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-amber-200/70 shadow-sm hover:shadow-md hover:border-[#caa02f] transition-all group">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-[#caa02f] flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=caa02f&color=ffffff&bold=true`} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{member.name}</h4>
                    <p className="text-xs text-[#caa02f] uppercase tracking-wide mt-1 font-black">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <button 
                onClick={() => setIsExpanded(false)} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-slate-600 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
              >
                <ChevronUp className="w-4 h-4" /> Collapse List
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- FOOTER (AAWA '26) ---
const Footer = () => (
  <footer className="bg-[#9b7618] text-white pt-24 pb-12 border-t border-white/20">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-black text-[#9b7618] text-xl shadow-md">
              A
            </div>
            <span className="text-2xl font-black text-white">AAWA '26</span>
          </div>
          <h3 className="text-4xl font-black leading-tight mb-4 text-white">When Values<br />Speak.</h3>
          <p className="text-white/90 leading-relaxed font-normal">
            AAWA — PMSA Arts Fest 26-27. A grand celebration of faith, art, and expression hosted by MASA Students' Union on 29 September, 30 September & 01 October 2026.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 text-sm text-white/90">
          <ul className="space-y-4">
            <li><span className="text-white font-black mb-4 block tracking-wider uppercase text-xs">Navigation</span></li>
            <li><a href="https://drive.google.com/file/d/1BDWc-Cu2eYdfodH6m6GRcO6NrlksG_AC/view?usp=drive_link" target="_blank" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Schedule</a></li>
            <li><a href="/results" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Results</a></li>
            <li><a href="/#leaderboard" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Leaderboard</a></li>
            <li><a href="/tv" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Live TV Screen</a></li>
          </ul>
          <ul className="space-y-4">
            <li><span className="text-white font-black mb-4 block tracking-wider uppercase text-xs">Connect</span></li>
            <li><a href="https://www.instagram.com/wafypmsa_official" target="_blank" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Instagram</a></li>
            <li><a href="https://www.youtube.com/@munthajulafnanstudentsasso6980" target="_blank" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">YouTube</a></li>
            <li><a href="mailto:masapmsawafy@gmail.com" target="_blank" className="hover:text-amber-100 transition-colors underline-offset-4 hover:underline font-medium">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/20 text-xs text-white/80">
        <p>© 2026 PMSA Wafy College. All rights reserved.</p>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span>Designed with</span><span className="text-red-300">★</span><span>by Salih KC & SINAN AK</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- MAIN PAGE LOGIC ---

export default function App() {
  const supabase = createClient();
  const [highlightImages, setHighlightImages] = useState<string[]>(DEFAULT_HIGHLIGHTS);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Images from Storage if available
        try {
          const { data: files } = await supabase.storage.from('fest-highlights').list();
          if (files) {
            const urls = files
              .filter(f => f.name !== '.emptyFolderPlaceholder')
              .map(f => supabase.storage.from('fest-highlights').getPublicUrl(f.name).data.publicUrl);
            setHighlightImages(urls);
          }
        } catch (e) {}

        // 2. Fetch Live Scores from /api/data
        const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
        const json = await res.json();

        if (json.success && json.teams) {
           const calculatedTeams = json.teams.map((team: any) => ({
              id: team.id,
              name: team.name,
              points: team.points || 0,
              color: team.color_hex ? `from-[${team.color_hex}] to-slate-900` : "from-[#caa02f] to-amber-700",
              colorHex: team.color_hex,
              sections: team.sections || { aliya: 0, foundation: 0, general: 0 },
              categories: team.categories || { onStage: 0, offStage: 0 }
           }));
           setTeamData(calculatedTeams);
        }

      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <main className="min-h-screen bg-[#caa02f] font-sans selection:bg-[#caa02f] selection:text-white overflow-x-hidden">
      <NoiseOverlay />
      <ZoomHero />
      <AboutSection />
      <ThemeManifesto />
      <HighlightsGallery images={highlightImages} />
      <LiveDashboard teamData={teamData} loading={loading} />
      <CommitteeGrid />
      <Footer />
    </main>
  );
}