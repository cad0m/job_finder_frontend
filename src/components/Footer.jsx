import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-white/5 py-4 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
            <a className="flex items-center gap-2 text-2xl font-black text-[#1D8EFF] tracking-tighter font-headline" href="/">
              <img src="/logo.png" alt="JobMatcher AI" className="w-7 h-7 object-contain" />
              JobMatcher AI
            </a>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Intelligence Engine v2.4.0
            </p>
          </div>
        <div className="flex gap-8">
          <a className="text-sm text-slate-400 hover:text-white transition-colors" href="/">Privacy</a>
          <a className="text-sm text-slate-400 hover:text-white transition-colors" href="/">Terms</a>
          <a className="text-sm text-slate-400 hover:text-white transition-colors" href="/">Security</a>
        </div>
        <div className="text-xs text-slate-600 font-mono">
          © {new Date().getFullYear()} Neural Systems Corp.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
