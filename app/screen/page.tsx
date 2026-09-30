"use client";

import React from "react";
import { motion } from "framer-motion";

// --- UTILITY COMPONENTS ---

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
      <path d="M1386 922q46 26 59.5 77.5T1433 1097l-64 110q-26 46-77.5 59.5T1194 1254l-266-153v307q0 52-38 90t-90 38H672q-52 0-90-38t-38-90v-307l-266 153q-46 26-97.5 12.5T103 1207l-64-110q-26-46-12.5-97.5T86 922l266-154L86 614q-46-26-59.5-77.5T39 439l64-110q26-46 77.5-59.5T278 282l266 153V128q0-52 38-90t90-38h128q52 0 90 38t38 90v307l266-153q46-26 97.5-12.5T1369 329l64 110q26 46 12.5 97.5T1386 614l-266 154z" />
    </svg>
  </motion.div>
);

// --- MAIN STAGE SCREEN PAGE ---

export default function StagePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#ffffff_0%,#fcf6e2_35%,#e9c54e_75%,#caa02f_100%)] selection:bg-transparent">
      {/* 1. Background Layers */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay"></div>

      {/* 2. Animated Elements (Asterisks) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-between pointer-events-none z-10">
        <div className="absolute left-[-50vh] top-1/2 -translate-y-1/2">
          <SpinningAsterisk className="w-[140vh] h-[140vh] text-[#caa02f]/10" />
        </div>
        <div className="absolute right-[5vw] top-[10vh]">
          <SpinningAsterisk className="w-[30vh] h-[30vh] text-[#caa02f]/10" />
        </div>
      </div>

      {/* 3. Floating Orbs */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] bg-[#caa02f] rounded-full mix-blend-screen filter blur-[160px] opacity-30 pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-amber-600 rounded-full mix-blend-screen filter blur-[160px] opacity-20 pointer-events-none"
      />

      {/* 4. Center Content (Logo & Text) */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
        {/* Breathing Logo Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[50vw] max-w-[700px] drop-shadow-[0_0_80px_rgba(202,160,47,0.4)]"
          >
            <img
              src="/Logo_White.png"
              alt="AAWA Fest Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Text Layer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center z-20 fixed bottom-[8dvh] px-4"
        >
          <div className="inline-block px-5 py-1.5 rounded-full bg-white/90 border-2 border-[#caa02f] shadow-lg mb-3">
            <span className="text-sm md:text-base font-black tracking-[0.35em] uppercase text-[#9b781b]">
              AAWA PMSA ARTS FEST 26-27 • 29 SEP, 30 SEP & 01 OCT 2026
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-montserat font-black uppercase text-slate-900 tracking-tight drop-shadow-sm">
            STAGE ARENA
          </h1>
          <p className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-[#caa02f] mt-1">
            "WHEN VALUES SPEAK"
          </p>
        </motion.div>
      </div>
    </main>
  );
}
