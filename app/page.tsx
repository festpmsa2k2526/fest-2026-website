"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effect
  const logoY = useTransform(scrollYProgress, [0, 0.5], ["0%", "50%"]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <main ref={containerRef} className="relative w-full bg-pmsa-blue text-white overflow-hidden">
      
      {/* Background Noise & Stars */}
      <div className="bg-noise fixed inset-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vh] h-[150vh] opacity-10 pointer-events-none animate-spin-slow z-0">
         <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <polygon points="50,0 63,38 100,50 63,62 50,100 37,62 0,50 37,38" />
         </svg>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 z-10">
        
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-0 left-0 w-full p-8 flex justify-between items-center text-xs tracking-[0.2em] uppercase opacity-70"
        >
           <span>PMSA Arts Fest</span>
           <span>2025-26</span>
        </motion.nav>

        {/* LOGO SIZE INCREASED HERE */}
        <motion.div 
          style={{ y: logoY, opacity: logoOpacity }}
          className="relative w-full max-w-xl aspect-square md:max-w-3xl"
        >
          <Image 
            src="/Logo_White.png" 
            alt="PMSA Arts Fest Logo"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-xs uppercase tracking-widest opacity-60"
        >
          <span className="animate-pulse">Scroll to Explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="relative min-h-screen py-24 px-6 md:px-12 z-20 bg-gradient-to-b from-transparent via-pmsa-blue/90 to-pmsa-dark/90 backdrop-blur-sm">
        
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16"
          >
            
            {/* Main Theme */}
            <motion.div variants={fadeInUp} className="md:col-span-2 mb-12 text-center">
              <span className="text-pmsa-accent/60 text-sm tracking-widest uppercase mb-4 block">The Philosophy</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                Understanding Divine Blessings
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                The theme of the fest is to understand Allah better and realize how grateful we should be for His blessings. The logo is designed in a minimal and meaningful way to reflect simplicity, clarity, and spiritual growth.
              </p>
            </motion.div>

            {/* Geometry */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 md:p-10 hover:bg-white/10 transition-colors duration-500">
              <div className="w-12 h-12 mb-6 border border-white/30 flex items-center justify-center rounded-full">
                <div className="w-2 h-2 bg-white rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-kufi">Geometric Guidance</h3>
              <p className="text-white/70 leading-relaxed">
                The Arabic-inspired, clean geometric form represents the ease and simplicity of Allah’s guidance. The upward slant of the shape symbolizes progress, elevation of thought, and moving closer to higher understanding.
              </p>
            </motion.div>

            {/* Colors */}
            <motion.div variants={fadeInUp} className="bg-white/5 border border-white/10 p-8 md:p-10 hover:bg-white/10 transition-colors duration-500">
              <div className="w-12 h-12 mb-6 flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-pmsa-blue border border-white"></div>
                <div className="w-4 h-4 rounded-full bg-white"></div>
              </div>
              <h3 className="text-xl font-bold mb-4 font-kufi">Colors of Peace</h3>
              <p className="text-white/70 leading-relaxed">
                The blue color represents peace, calmness, and divine light, while white stands for purity, sincerity, and authenticity. It reflects a balance between the heavens and the heart.
              </p>
            </motion.div>

            {/* Conclusion */}
            <motion.div variants={fadeInUp} className="md:col-span-2 mt-12 text-center">
              <div className="inline-block border-t border-white/20 pt-8">
                <p className="text-2xl md:text-3xl font-light italic opacity-90">
                  &quot;Reflecting not just the event, but the values behind it.&quot;
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* CTA */}
        <div className="mt-32 pb-20 text-center">
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="px-10 py-4 bg-white text-pmsa-blue font-bold rounded-none hover:bg-gray-100 hover:scale-105 transition-all uppercase tracking-wider text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
          >
            Download Handbook
          </motion.button>
        </div>

      </section>
    </main>
  );
}