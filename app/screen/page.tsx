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

// --- MAIN STAGE PAGE ---

export default function StagePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0033A0] selection:bg-transparent">
      {/* 1. Background Layers */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e40af_0%,#0033A0_100%)]"></div> */}

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 2. Animated Elements (Asterisks) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-between pointer-events-none z-10">
        <div className="absolute left-[-10vh] top-1/2 -translate-y-1/2">
          <SpinningAsterisk className="w-[100vh] h-[100vh] text-blue-300/10" />
        </div>
        <div className="absolute right-[5vw] top-[10vh]">
          <SpinningAsterisk className="w-[30vh] h-[30vh] text-blue-300/10" />
        </div>
      </div>

      {/* 3. Floating Orbs (Slowed down for stage elegance) */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-blue-400 rounded-full mix-blend-screen filter blur-[150px] opacity-30"
      />
      <motion.div
        animate={{
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-indigo-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20"
      />

      {/* 4. Center Content (Logo & Text) */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
        {/* Breathing Logo Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[60vw] md:w-[60vw] drop-shadow-[0_0_80px_rgba(255,255,255,0.3)]"
          >
            {/* Ensure this image exists in your public folder */}
            <img
              src="/Logo_White.png"
              alt="QUL Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Text Layer - Bigger for Stage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center z-20 fixed bottom-[10dvh] text-white px-4"
        >
          <h1 className="text-4xl font-stapel tracking-[0.5em] uppercase mb-4 text-blue-100/90">
            SPEECH MALAYALAM
          </h1>
          <p className="text-4xl font-stapell tracking-widest uppercase text-blue-200/60">
            JUNIOR
          </p>
        </motion.div>
      </div>
    </main>
  );
}
