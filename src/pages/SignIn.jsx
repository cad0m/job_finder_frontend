import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grids & Glows */}
      <div className="absolute inset-0 grid-mesh opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] hero-glow opacity-30 pointer-events-none"></div>

      {/* Top Logo */}
      <div className="relative z-10 mb-12">
        <Link to="/" className="text-2xl font-headline font-bold text-white tracking-tight flex items-center gap-2">
          JobMatcher <span className="text-primary italic">AI</span>
        </Link>
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border border-white/5 bg-surface/40 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row"
      >
        {/* Left Panel: Global Intelligence */}
        <div className="lg:w-[45%] p-12 lg:p-16 border-r border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white/[0.01]">
            <div className="absolute inset-0 grid-mesh opacity-30"></div>
            
            {/* Holographic Globe Container */}
            <div className="relative w-64 h-64 mb-10 group">
                <div className="absolute inset-0 rounded-full border border-primary/20 shadow-[0_0_60px_rgba(29,142,255,0.2)]"></div>
                <div className="absolute inset-4 rounded-full overflow-hidden">
                    <img 
                        src="/assets/signin.png" 
                        alt="Intelligent Job Search" 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3000ms]"
                    />
                </div>
                {/* Orbital Arches (Animated) */}
                <div className="absolute inset-[-20px] border border-primary/20 rounded-full" ></div>
                <div className="absolute inset-[-40px] border border-primary/10 rounded-full scale-110 "></div>
            </div>

            <h2 className="text-3xl font-headline font-bold text-white mb-6">Global Intelligence</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-12 max-w-xs">
                Connecting technical talent with deep-tech opportunities across the digital frontier.
            </p>

            <div className="flex gap-8 justify-center">
                <div className="text-center">
                    <p className="text-primary font-mono text-lg font-bold">14.2K+</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Nodes</p>
                </div>
                <div className="text-center">
                    <p className="text-tertiary font-mono text-lg font-bold uppercase tracking-tighter">Realtime</p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Matching</p>
                </div>
            </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="lg:w-[55%] p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
                <h1 className="text-4xl font-headline font-bold text-white mb-3">Welcome back 👋</h1>
                <p className="text-on-surface-variant text-base mb-10">Access your intelligent matching dashboard.</p>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all font-body font-medium text-white text-sm group">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Google
                    </button>
                    <button className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all font-body font-medium text-white text-sm group">
                        <img src="https://www.svgrepo.com/show/475661/linkedin-color.svg" alt="LinkedIn" className="w-5 h-5 transition-transform group-hover:scale-110" />
                        LinkedIn
                    </button>
                </div>

                <div className="relative mb-8 text-center">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5"></div>
                    <span className="relative z-10 px-4 bg-[#081821] text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">Or</span>
                </div>

                {/* Main Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl p-3 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 mb-3 ml-1">Work Email</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-primary transition-colors">mail</span>
                            <input 
                                type="email" 
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-xs font-mono tracking-wider uppercase text-slate-400 ml-1">Password</label>
                            <Link to="#" className="text-[11px] text-primary/70 hover:text-primary transition-colors">Forgot password?</Link>
                        </div>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-primary transition-colors">lock</span>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background" />
                        <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">Remember this device</label>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-primary text-background font-headline font-bold rounded-xl hover:shadow-[0_0_30px_rgba(29,142,255,0.4)] transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </form>

                <p className="mt-10 text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/signup" state={{ from: location.state?.from }} className="text-white hover:text-primary transition-colors font-bold ml-1">Sign up free</Link>
                </p>
            </div>
        </div>
      </motion.div>

      {/* Footer Badges */}
      <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs">verified</span> Enterprise Secure
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs">lock</span> End-to-end Encrypted
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white">
            <span className="material-symbols-outlined text-xs">policy</span> GDPR Compliant
        </div>
      </div>
    </div>
  );
};

export default SignIn;
