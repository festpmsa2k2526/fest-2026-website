// 'use client'
// import { useRef } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useMotionValue,       // <--- ADDED
//   useAnimationFrame,    // <--- ADDED
//   AnimatePresence
// } from 'framer-motion';


// export default async function Page() {
  
//   const NoiseOverlay = () => (
//     <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
//       <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//         <filter id="noiseFilter">
//           <feTurbulence
//             type="fractalNoise"
//             baseFrequency="0.6"
//             stitchTiles="stitch"
//           />
//         </filter>
//         <rect width="100%" height="100%" filter="url(#noiseFilter)" />
//       </svg>
//     </div>
//   );
//   const SpinningAsterisk = ({ className }: { className: string }) => (
//     <motion.div
//       animate={{ rotate: 360 }}
//       transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
//       className={className}
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 1536 1472"
//         fill="currentColor"
//         className="w-full h-full"
//       >
//         <path d="M1386 922q46 26 59.5 77.5T1433 1097l-64 110q-26 46-77.5 59.5T1194 1254l-266-153v307q0 52-38 90t-90 38H672q-52 0-90-38t-38-90v-307l-266 153q-46 26-97.5 12.5T103 1207l-64-110q-26-46-12.5-97.5T86 922l266-154L86 614q-46-26-59.5-77.5T39 439l64-110q26-46 77.5-59.5T278 282l266 153V128q0-52 38-90t90-38h128q52 0 90 38t38 90v307l266-153q46-26 97.5-12.5T1369 329l64 110q26 46 12.5 97.5T1386 614l-266 154z" />
//       </svg>
//     </motion.div>
//   );
//   const ZoomHero = () => {
//     const containerRef = useRef(null);
//     const { scrollYProgress } = useScroll({
//       target: containerRef,
//       offset: ["start start", "end start"]
//     });
  
//     const scale = useTransform(scrollYProgress, [0, 0.4], [1, 20]);
//     const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
//     const yText = useTransform(scrollYProgress, [0, 0.4], [0, 200]);
  
//     return (
//       <section ref={containerRef} className="relative h-[100vh] bg-[#0033A0]">
//         <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
//           {/* Background Gradient */}
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e40af_0%,#0033A0_100%)]"></div>
//           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-100"></div>
  
//           {/* Spinning Asterisks */}
//           <div className="absolute inset-0 w-full h-full flex items-center justify-between pointer-events-none z-10 overflow-visible">
//             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
//               <SpinningAsterisk className="w-[80vh] h-[80vh] md:w-[150vh] md:h-[150vh] text-blue-300/10" />
//             </div>
//             <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2">
//               <SpinningAsterisk className="w-12 h-12 md:w-24 md:h-24 text-blue-300/20" />
//             </div>
//           </div>
  
//           {/* Floating Orbs */}
//           <motion.div
//             animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
//             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-30"
//           />
//           <motion.div
//             animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
//             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//             className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"
//           />
  
//           {/* Zooming Logo Container */}
//           <div className="relative z-20 flex flex-col items-center mb-12">
//             <div className="relative w-100 h-100 md:w-180 md:h-180 mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
//               <img src="/Logo_White.png" alt="QUL Logo" className="w-full h-full object-contain" />
//             </div>
//           </div>
  
//           {/* Text Layer */}
//           <motion.div style={{ y: yText, opacity }} className="absolute z-10 text-center text-white px-4 bottom-[15%] md:bottom-[20%]">
//             <h2 className="text-sm md:text-lg font-medium tracking-[0.5em] uppercase mb-4 text-blue-200">
//               2026 &#8226; jan 19,20,21   <br />
//               PMSA Wafy College Kattilangadi
//             </h2>
//           </motion.div>
  
          
//         </div>
//       </section>
//     );
//   };
//   return (
//     <main className="min-h-screen bg-slate-50 font-sans selection:bg-[#0033A0] selection:text-white overflow-x-hidden">
//       <NoiseOverlay />
//       <ZoomHero />
//     </main>
//   );
// }
