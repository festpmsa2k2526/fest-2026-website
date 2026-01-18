'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
  Download, Calendar, MapPin, Users, BookOpen,
  Megaphone, ShieldCheck, Instagram, Globe, Mail,
  ArrowRight, Sparkles, Zap, Asterisk, ArrowDown
} from 'lucide-react';

// --- CONFIGURATION ---
const LIVE_UPDATES = [
  "📢 Registration closes in 2 hours for Off-stage events.",
  "🏆 Junior Essay Writing Results Published - Check Leaderboard.",
  "📍 Senior Debate (Prelims) starting at Auditorium A at 2:00 PM.",
  "✨ 'Huwa Allah' - Recognition to Expression.",
  "⚡️ Stage 2 Schedule Released."
];

// Updated Committee List from Handbook Page 3
const COMMITTEE = [
  { role: "Controller", name: "Ustad Sayyid Adil Hassan Wafy", image: "" },
  { role: "Asst. Controller", name: "Ustad Sajid Wafy", image: "" },
  { role: "Chairman", name: "Ziyad Hussain", image: "" },
  { role: "General Convenor", name: "Nabeel Muhammed", image: "" },
  { role: "Deputy Convenor", name: "Ishaq PC", image: "" },
  { role: "Asst. Chairman", name: "Waseem", image: "" },
  { role: "Asst. Convenor", name: "Swalih", image: "" },
  { role: "Media Convenor", name: "Muhammed Faheem PV", image: "" },
  { role: "Asst. Media Convenor", name: "Shemeem EC", image: "" },
  { role: "Asst. Media Convenor", name: "Muhammed Hanoon", image: "" },
  { role: "Asst. Media Convenor", name: "Muhammed Minhaj", image: "" },
  { role: "Technical Convenor", name: "Muhammed Shuhaib", image: "" },
  { role: "Asst. Tech Convenor", name: "Adil Muhammed", image: "" },
  { role: "Financial Convenor", name: "Swalih M", image: "" },
  { role: "Financial Convenor", name: "Muhammed Raees", image: "" },
  { role: "Event Manager", name: "Muhammed Ajmal", image: "" },
  { role: "Event Manager", name: "Muhammed Sinan TP", image: "" },
];

const CATEGORIES = [
  { title: "Sub Junior", classes: "Foundation A, B", color: "bg-blue-400" },
  { title: "Junior", classes: "Thamheediyya 2, Aliya 1, 2", color: "bg-blue-500" },
  { title: "Senior", classes: "Aliya 3, 4", color: "bg-blue-600" },
];

// --- UTILITY COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1536 1472"
      fill="currentColor"
      className="w-full h-full"
    >
      <path
        d="M1386 922q46 26 59.5 77.5T1433 1097l-64 110q-26 46-77.5 59.5T1194 1254l-266-153v307q0 52-38 90t-90 38H672q-52 0-90-38t-38-90v-307l-266 153q-46 26-97.5 12.5T103 1207l-64-110q-26-46-12.5-97.5T86 922l266-154L86 614q-46-26-59.5-77.5T39 439l64-110q26-46 77.5-59.5T278 282l266 153V128q0-52 38-90t90-38h128q52 0 90 38t38 90v307l266-153q46-26 97.5-12.5T1369 329l64 110q26 46 12.5 97.5T1386 614l-266 154z"
      />
    </svg>
  </motion.div>
);

const InfiniteMarquee = () => {
  return (
    <div className="relative flex overflow-hidden bg-white/5 backdrop-blur-md border-y border-white/10 py-4">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0033A0] via-transparent to-[#0033A0] z-10 pointer-events-none"></div>
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...LIVE_UPDATES, ...LIVE_UPDATES, ...LIVE_UPDATES].map((text, i) => (
          <div key={i} className="flex items-center gap-3 text-blue-100/90 text-sm md:text-base font-medium uppercase tracking-wider">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
            {text}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- SECTIONS ---

const ZoomHero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.3], ["0px", "10px"]);
  const yText = useTransform(scrollYProgress, [0, 0.4], [0, 200]);

  return (
    <section ref={containerRef} className="relative h-[100vh] bg-[#0033A0]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">

        {/* Dynamic Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e40af_0%,#0033A0_100%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100"></div>

        {/* Spinning Asterisks at Page Edges */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-between pointer-events-none z-10 overflow-visible">
          {/* Left Massive Asterisk - Half off-screen */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
             <SpinningAsterisk className="w-[80vh] h-[80vh] md:w-[150vh] md:h-[150vh] text-blue-300/10" />
          </div>
          
          {/* Right Normal Asterisk */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <SpinningAsterisk className="w-12 h-12 md:w-24 md:h-24 text-blue-300/20" />
          </div>
        </div>

        {/* Floating Orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-30"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"
        />

        {/* Zooming Logo Container */}
        <div className="relative z-20 flex flex-col items-center mb-12">

          <div className="relative w-48 h-48 md:w-180 md:h-180 mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">

            <img

              src="/Logo_White.png"

              alt="QUL Logo"

              className="w-full h-full object-contain"

            />

          </div>

        </div>


        {/* Text Layer (Moves slower) */}
        <motion.div style={{ y: yText, opacity }} className="absolute z-10 text-center text-white px-4 bottom-[15%] md:bottom-[20%]">
          <h2 className="text-sm md:text-lg font-medium tracking-[0.5em] uppercase mb-4 text-blue-200">
            2026 &#8226; jan 19,20,21   <br />
            PMSA Wafy College Kattilangadi
          </h2>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-xs uppercase tracking-widest opacity-60 text-white"
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
    className="group relative p-8 border-l border-white/10 hover:border-blue-500/50 bg-white/5 backdrop-blur-sm transition-colors duration-500"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
      <span className="text-4xl font-serif">{arabic}</span>
    </div>
    <span className="text-xs font-mono text-blue-400 mb-2 block">{number}</span>
    <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-200 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
  </motion.div>
);


const ThemeManifesto = () => {
  return (
    <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[#0033A0] opacity-5"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Large Vertical Typography */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <h2 className="text-[10rem] md:text-[15rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none">
                اللّٰهُ
              </h2>
            </motion.div>
          </div>

          {/* Narrative Cards */}
          <div className="lg:col-span-7 space-y-8">
            <ManifestoCard
              number="01"
              title="Recognition"
              arabic="هُوَ اللّٰهُ"
              desc="The phrase 'Huwa Allah' forms the foundation. Before speaking, one must first recognize who Allah is. Every expression begins here."
            />
            <ManifestoCard
              number="02"
              title="Expression"
              arabic="قُل"
              desc="The command Qul follows recognition. Faith is not just knowing, but communicating truth with clarity and confidence."
              delay={0.2}
            />
            <ManifestoCard
              number="03"
              title="Responsibility"
              arabic="أمانة"
              desc="Art becomes a form of sincere conveyance. A platform to carry meaningful messages to society."
              delay={0.4}
            />
          </div>
        </div>
      </div>
    </section>
  );
};


const LiveDashboard = () => {
  return (
    <section className="relative py-24 bg-[#0033A0] text-white overflow-hidden">
      {/* Marquee at Top of Section */}
      <div className="absolute top-0 w-full z-20">
        <InfiniteMarquee />
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium tracking-widest uppercase">Live Arena</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">TEAM STANDINGS</h2>
          <p className="text-blue-200 max-w-xl mx-auto">The stage is set. Four groups compete for the ultimate championship title.</p>
        </div>

        {/* Group Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -10 }}
              className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-white/5 border border-white/10 group"
            >
              <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-6xl font-bold opacity-20 group-hover:opacity-100 transition-opacity duration-300">{item < 10 ? `0${item}` : item}</h3>
                <p className="text-lg font-medium mt-2">Group {String.fromCharCode(64 + item)}</p>
                <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full w-3/4"></div>
                </div>
                <p className="text-xs text-right mt-2 font-mono text-yellow-400">1,240 Pts</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Schedule Teaser */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Schedule Info - Takes 2 columns */}
          <div className="md:col-span-2 bg-white rounded-2xl p-8 text-[#0033A0] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div>
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6" /> Live Schedule
              </h3>
              <p className="text-gray-600">Off-stage events concluding. On-stage preparations underway.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-6 py-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold">19</div>
                <div className="text-xs uppercase font-bold text-gray-400">Jan</div>
              </div>
              <div className="text-center px-6 py-4 bg-blue-50 rounded-xl border-l-4 border-yellow-400">
                <div className="text-3xl font-bold">22</div>
                <div className="text-xs uppercase font-bold text-gray-400">Jan</div>
              </div>
            </div>
          </div>

          {/* Download Manual Button - Takes 1 column */}
          <a href="https://drive.google.com/file/d/187ryFN8itlvL0bY4ULJwGHFh1-4colLZ/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="bg-yellow-400 hover:bg-yellow-300 transition-colors rounded-2xl p-6 text-[#0033A0] flex flex-col justify-center items-center gap-3 shadow-xl text-center group">
            <Download className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg leading-tight">Download Manual</span>
          </a>

          {/* New Download Schedule Button - Takes 1 column */}
          <a href="#" className="bg-white hover:bg-gray-50 transition-colors rounded-2xl p-6 text-[#0033A0] flex flex-col justify-center items-center gap-3 shadow-xl text-center group">
            <Calendar className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg leading-tight">Download Schedule</span>
          </a>
        </div>
      </div>
    </section>
  );
};

const CommitteeGrid = () => {
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-[#0033A0]">Organizers</h2>
          <div className="h-px bg-gray-200 flex-1 ml-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {COMMITTEE.map((member, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-colors">
                {/* Image logic: Displays real image if provided, otherwise generates a nice initial avatar */}
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=eff6ff&color=0033A0&bold=true`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 leading-tight">{member.name}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              <span className="text-2xl font-bold">QUL '26</span>
            </div>
            <h3 className="text-4xl font-bold leading-tight mb-6 text-gray-200">
              From the heart,<br />to the world.
            </h3>
            <p className="text-gray-400">
              PMSA Arts Fest 2025-26. A celebration of faith, art, and expression hosted by MASA Students' Union.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm text-gray-400">
            <ul className="space-y-4">
              <li><span className="text-white font-bold mb-4 block">Events</span></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Schedule</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Results</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Leaderboard</a></li>
            </ul>
            <ul className="space-y-4">
              <li><span className="text-white font-bold mb-4 block">Connect</span></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">YouTube</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-gray-600">
          <p>© 2026 PMSA Wafy College. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span>Designed with</span>
            <span className="text-red-500">❤</span>
            <span>by SINAN AK</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE ---

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-[#0033A0] selection:text-white overflow-x-hidden">
      <NoiseOverlay />

      {/* Navigation (Transparent) */}
      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
        <span className="font-bold text-xl tracking-widest">QUL.</span>
        <div className="pointer-events-auto flex gap-4">
          <button className="px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-[#0033A0] transition-all text-sm font-medium">
            Login
          </button>
        </div>
      </nav>

      <ZoomHero />
      <ThemeManifesto />
      <LiveDashboard />
      <CommitteeGrid />
      <Footer />
    </main>
  );
}