import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  return (
    <section className="w-full max-w-7xl px-8 py-24 bg-white/[0.02] border-y border-white/5" id="features">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-16"
      >
        <div className="lg:col-span-1">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="font-headline text-4xl font-bold text-white mb-6"
          >
            Built for the <span className="text-primary italic">Technical Frontier</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="text-slate-400 mb-8 leading-relaxed"
          >
            We built JobMatcher for high-skilled engineers, designers, and researchers who are tired of basic keyword matching.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-6 py-3 border border-primary/30 text-primary rounded-lg font-bold hover:bg-primary/10 transition-colors"
          >
            Explore All Capabilities
          </motion.button>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: "analytics", title: "Neural Match Score", desc: "Go beyond keywords. We understand the context of your experience using transformer-based embeddings." },
            { icon: "auto_fix_high", title: "Auto-Apply Pro", desc: "We generate tailored CVs and cover letters for every single application, optimized for ATS systems." },
            { icon: "payments", title: "Salary Intelligence", desc: "Real-time market value insights based on your specific skill stack and current industry trends." },
            { icon: "verified_user", title: "Verified Identity", desc: "Fast-track your application with our 'Verified Expert' badge for top-tier candidates after technical screening." }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, type: "spring", bounce: 0.3 }}
              className="glass-card p-8 rounded-2xl group hover:border-primary/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(29,142,255,0.2)]">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-3">{item.title}</h4>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Features;
