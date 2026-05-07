import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // The user_profile triggered by Supabase Auth doesn't take fullName directly via standard auth email, 
    // but the trigger handles user_account creation. Update happen later in /verify.
    const { error } = await signUp(fullName, email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const destination = location.state?.from?.pathname || '/upload';
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#020d12] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grids & Glows */}
      <div className="absolute inset-0 grid-mesh opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] hero-glow opacity-30 pointer-events-none"></div>

      {/* Top Logo */}
      <div className="relative z-10 mb-12">
        <Link to="/" className="text-2xl font-headline font-bold text-white tracking-tight flex items-center gap-2">
          <img src="/logo.png" alt="JobMatcher AI" className="w-8 h-8 object-contain" />
          JobMatcher <span className="text-primary italic">AI</span>
        </Link>
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-6xl rounded-[40px] border border-white/5 bg-[#05161e]/60 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row"
      >
        {/* Left Panel: Autonomous Matching */}
        <div className="lg:w-[48%] p-12 lg:p-20 border-r border-white/5 flex flex-col items-center justify-center text-center relative bg-[#04151e]/40">
            <div className="absolute inset-0 grid-mesh opacity-30"></div>
            
            {/* Holographic Globe Visual */}
            <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
                {/* Dotted Border Square */}
                <div className="absolute inset-0 border border-dashed border-white/10 rounded-3xl scale-110"></div>
                
                {/* Globe Container */}
                <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-[0_0_100px_rgba(29,142,255,0.3)]">
                    <img 
                        src="/assets/signup_new.png" 
                        alt="Intelligent Job Search" 
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Pulsing Dots */}
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#1d8eff]"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-tertiary rounded-full animate-pulse delay-700 shadow-[0_0_10px_#be76ff]"></div>
                </div>

                {/* Pedestal */}
                <div className="absolute -bottom-4 w-48 h-8 bg-gradient-to-t from-primary/20 to-transparent blur-xl rounded-full"></div>
                <div className="absolute -bottom-1 w-32 h-2 bg-primary/40 rounded-full"></div>
            </div>

            <h2 className="text-4xl font-headline font-bold text-white mb-6">Autonomous Matching</h2>
            <p className="text-on-surface-variant text-base leading-relaxed mb-12 max-w-sm">
                Experience the <span className="text-white font-bold opacity-80 tracking-widest uppercase text-xs">Obsidian Depth</span> protocol. 
                Our neural engine maps your career trajectory across the global talent graph.
            </p>

            <div className="flex gap-16 justify-center">
                <div className="text-center">
                    <p className="text-tertiary-fixed font-mono text-2xl font-bold">99.4%</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase mt-1">Match Accuracy</p>
                </div>
                <div className="text-center">
                    <p className="text-white font-mono text-2xl font-bold">12.5ms</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase mt-1">Latency Peak</p>
                </div>
            </div>
        </div>

        {/* Right Panel: Join the Frontier */}
        <div className="lg:w-[55%] p-12 lg:p-16 flex flex-col justify-center bg-[#05161e]/20">
            <div className="max-w-md mx-auto w-full">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary font-bold">System Access</span>
                </div>
                
                <h1 className="text-5xl font-headline font-bold text-white mb-10">Join the Frontier</h1>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-3 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-3 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-3 ml-1">Work Email</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-3 ml-1">Password</label>
                        <div className="relative group">
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all font-mono"
                            />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-primary text-background font-headline font-bold rounded-xl hover:shadow-[0_0_40px_rgba(29,142,255,0.5)] transition-all flex items-center justify-center gap-2 group mt-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Sequence...' : 'Create AI Account'}
                    </button>
                </form>

                <p className="mt-10 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/signin" state={{ from: location.state?.from }} className="text-white hover:text-primary transition-colors font-bold ml-1 border-b border-white/20 hover:border-primary">Sign in</Link>
                </p>

                
            </div>
        </div>
      </motion.div>

       <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs"></span> Neural Policy
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs"></span> Terminal Terms
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs"></span> System Security
        </div>
      </div>
    </div>
  );
};

export default SignUp;
