import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuth();
  const getStartedPath = '/upload';
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Monitor scroll to trigger glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Solutions', href: '#how-it-works' },
    { name: 'Enterprise', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Resources', href: '/' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out flex justify-center py-4 ${scrolled ? 'pt-4' : 'pt-6'}`}
    >
      <div className={`flex justify-between items-center px-6 h-16 w-[calc(100%-150px)] mx-auto transition-all duration-500 ${scrolled
          ? 'bg-[#04151e]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          : 'bg-transparent border border-transparent'
        }`}>

        {/* Logo */}
        <Link className="flex items-center gap-3 group" to="/">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(29,142,255,0.4)] group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
            <span className="material-symbols-outlined text-white text-lg">blur_on</span>
          </div>
          <span className="text-xl font-black text-white tracking-tighter font-headline group-hover:text-primary transition-colors">
            JobMatcher <span className="text-primary italic font-medium">AI</span>
          </span>
        </Link>

        {/* Desktop Links (Animated Sliding Pill) */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative px-4 py-2 text-sm font-headl text-slate-300 hover:text-white transition-colors tracking-wide"
            >
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg -z-10 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {link.name}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/signin" className="hidden md:flex relative px-6 py-2 rounded-xl text-sm font-headline text-slate-300 hover:text-white transition-all duration-300 group overflow-hidden border border-white/5 hover:border-white/20 hover:bg-white/[0.02] shadow-sm hover:shadow-lg">
                <div className="flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] absolute left-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out text-primary">fingerprint</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-3 font-semibold tracking-wide">Sign In</span>
                </div>
              </Link>
              <Link to={getStartedPath} className="relative group overflow-hidden px-6 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary font-headline text-sm hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(29,142,255,0.15)] hover:shadow-[0_0_30px_rgba(29,142,255,0.3)] flex items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                Get Started
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="relative group overflow-hidden px-6 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary font-headline text-sm hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(29,142,255,0.15)] hover:shadow-[0_0_30px_rgba(29,142,255,0.3)] flex items-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              Dashboard
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
