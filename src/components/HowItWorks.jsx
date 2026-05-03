import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  return (
    <section className="w-full max-w-7xl px-8 py-24 relative" id="how-it-works">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="font-headline text-4xl font-bold text-white mb-4">Neural Matching Process</h2>
        <p className="text-slate-400 max-w-xl mx-auto">Our algorithmic pipeline maps your expertise to the global job market.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
      >
        {/* Connection Lines (Hidden on Mobile) */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[1px] step-connector z-0 origin-left"
        ></motion.div>

        {/* Steps */}
        {[
          { num: "1", title: "Upload", desc: "Drop your CV and let our engine map your professional DNA." },
          { num: "2", title: "Match", desc: "AI scans 2M+ listings to find high-precision matches in seconds." },
          { num: "3", title: "Apply", desc: "One-click tailored applications powered by neural text generation." }
        ].map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.2, type: "spring", bounce: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mb-8 border-primary/20 hover:border-primary/50 transition-colors duration-300">
              <span className="text-4xl font-mono font-bold text-primary">{step.num}</span>
            </div>
            <div className="glass-card p-8 rounded-2xl text-center w-full group hover:-translate-y-2 transition-transform duration-300 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
