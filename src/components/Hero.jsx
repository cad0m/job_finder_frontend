import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  const { scrollYProgress } = useScroll();

  // Parallax transformations for the circular frames
  const rotate1 = useTransform(scrollYProgress, [0, 1], [12, 372]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [-45, -405]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 2]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.5, 1]);
  const borderWidth = useTransform(scrollYProgress, [0, 0.4], [0.5, 5]);

  const getStartedPath = '/upload';

  return (
    <section className="relative w-full flex flex-col items-center pt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1000px] hero-glow pointer-events-none"></div>

      <div className="relative w-full max-w-7xl h-[500px] mt-12 flex items-center justify-center">
        {/* Central Globe Hologram */}
        <div className="relative z-10 w-80 h-80 rounded-full border border-primary/30 shadow-[0_0_80px_rgba(29,142,255,0.2)] flex items-center justify-center group">
          <motion.div
            style={{ rotate: rotate1, scale, opacity, borderWidth }}
            className="absolute inset-0 rounded-full border-primary/40"
          ></motion.div>
          <motion.div
            style={{ rotate: rotate2, scale, opacity, borderWidth }}
            className="absolute inset-0 rounded-full border-primary/30"
          ></motion.div>
          <div className="absolute w-full h-full rounded-full border border-primary/10 animate-ping opacity-30"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-primary/5 opacity-10"></div>
          <span className="material-symbols-outlined text-primary text-7xl" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
        </div>

        {/* Orbiting Floating Glass Cards */}
        <div className="absolute top-10 left-[10%] glass-card p-6 rounded-2xl w-72 -rotate-6 transition-transform hover:-translate-y-2 cursor-pointer group shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">SpaceX</p>
              <p className="text-base font-bold text-white tracking-tight">Full Stack Engineer</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">98% Match</span>
            <span className="text-xs text-slate-400 font-mono font-bold">$180k+</span>
          </div>
        </div>

        <div className="absolute top-32 right-[5%] glass-card p-6 rounded-2xl w-72 rotate-12 transition-transform hover:-translate-y-2 cursor-pointer shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">neurology</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">Neuralink</p>
              <p className="text-base font-bold text-white tracking-tight">AI Researcher</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">94% Match</span>
            <span className="text-xs text-slate-400 font-mono font-bold">$220k+</span>
          </div>
        </div>

        <div className="absolute bottom-10 left-[5%] glass-card p-6 rounded-2xl w-72 rotate-3 transition-transform hover:-translate-y-2 cursor-pointer shadow-2xl z-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">cloud</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">Stripe</p>
              <p className="text-base font-bold text-white tracking-tight">Lead Architect</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">97% Match</span>
            <span className="text-xs text-slate-400 font-mono font-bold">$210k+</span>
          </div>
        </div>

        <div className="absolute bottom-0 right-[15%] glass-card p-6 rounded-2xl w-72 -rotate-12 transition-transform hover:-translate-y-2 cursor-pointer shadow-2xl z-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">token</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">OpenAI</p>
              <p className="text-base font-bold text-white tracking-tight">Product Designer</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">91% Match</span>
            <span className="text-xs text-slate-400 font-mono font-bold">$195k+</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
        className="relative z-20 text-center px-6 max-w-4xl -mt-4"
      >
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Find Your Dream Job <span className="text-primary italic">With AI</span>
        </h1>
        <p className="font-body text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
          Upload your CV once. Our neural engine scans 2M+ live listings and ranks them by your exact skill DNA — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link
            to={getStartedPath}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(29,142,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-xl">🚀</span>
            Upload Your CV — It's Free
          </Link>

          <button className="group w-full sm:w-auto px-8 py-4 text-white font-headline font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg backdrop-blur-md">
            Watch Demo
            <span className="material-symbols-outlined text-lg text-primary transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">north_east</span>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="glass-card px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">2.4M+ Live Listings</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">97% Match Accuracy</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">12s Avg Scan</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
            <span className="text-xs font-mono text-slate-300">50K+ Hired This Month</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.7 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-24 mb-12 flex flex-col items-center gap-1 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
      >
        <span className="text-sm font-mono tracking-widest uppercase font-bold ">The Engine</span>
        <div className="w-[2px] h-24 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
