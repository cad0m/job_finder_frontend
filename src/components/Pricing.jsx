import React from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
  return (
    <section className="w-full max-w-7xl px-8 py-32 overflow-hidden" id="pricing">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="font-headline text-4xl font-bold text-white mb-4">Pricing for Success</h2>
        <p className="text-slate-400">Choose the engine that powers your career trajectory.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Free Tier */}
        <motion.div 
          initial={{ opacity: 0, x: -30, rotate: -5 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="glass-card p-10 rounded-3xl flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-12 flex-grow">
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> 3 matches per day</li>
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Standard parsing</li>
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Community support</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-white">Get Started</button>
        </motion.div>

        {/* Pro Tier */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1.05 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.4 }}
          className="glass-card pro-card-glow p-10 rounded-3xl flex flex-col relative z-20 bg-white/[0.06]"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-on-secondary-fixed shadow-[0_0_15px_rgba(29,142,255,0.4)]">Most Popular</div>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-slate-400">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-12 flex-grow">
            <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Unlimited matches</li>
            <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> AI application packs</li>
            <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Priority ranking</li>
            <li className="flex items-center gap-3 text-sm text-slate-200"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Verified expert badge</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold hover:shadow-[0_0_20px_rgba(29,142,255,0.4)] transition-all">Start Your Pro Trial</button>
        </motion.div>

        {/* Enterprise Tier */}
        <motion.div 
          initial={{ opacity: 0, x: 30, rotate: 5 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
          className="glass-card p-10 rounded-3xl flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
          </div>
          <ul className="space-y-4 mb-12 flex-grow">
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Recruitment team seats</li>
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> High-volume screening</li>
            <li className="flex items-center gap-3 text-sm text-slate-400"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> API access &amp; Webhooks</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-white">Contact Sales</button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
