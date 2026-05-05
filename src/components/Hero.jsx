import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const SKILL_TAGS = [
  { label: 'Python', angle: 0, radius: 148 },
  { label: 'React', angle: 55, radius: 152 },
  { label: 'ML/AI', angle: 110, radius: 145 },
  { label: 'Node.js', angle: 165, radius: 150 },
  { label: 'SQL', angle: 220, radius: 148 },
  { label: 'Docker', angle: 275, radius: 152 },
  { label: 'TypeScript', angle: 325, radius: 146 },
];

const MATCH_NODES = [
  { angle: 30, pct: '98%', color: '#1d8eff' },
  { angle: 130, pct: '94%', color: '#00e5b4' },
  { angle: 230, pct: '97%', color: '#1d8eff' },
  { angle: 310, pct: '91%', color: '#00e5b4' },
];

function toXY(angleDeg, radius, cx = 0, cy = 0) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
}

const MatchingCore = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const sweepAngle = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const rings = [55, 95, 135, 175];

    const pulsePhase = { current: 0 };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Rings
      rings.forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(29,142,255,${0.08 + i * 0.03})`;
        ctx.lineWidth = 1;
        if (i % 2 === 1) {
          ctx.setLineDash([6, 10]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Radar sweep
      const sweep = sweepAngle.current;
      const gradient = ctx.createConicalGradient
        ? ctx.createConicalGradient(cx, cy, 0)
        : null;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((sweep * Math.PI) / 180);
      const sweepGrad = ctx.createLinearGradient(0, 0, 175, 0);
      sweepGrad.addColorStop(0, 'rgba(29,142,255,0.5)');
      sweepGrad.addColorStop(1, 'rgba(29,142,255,0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 175, 0, (65 * Math.PI) / 180);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sweep leading edge
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((sweep * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(175, 0);
      ctx.strokeStyle = 'rgba(29,142,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Match nodes on rings
      MATCH_NODES.forEach(({ angle, pct, color }) => {
        const pos = toXY(angle + sweepAngle.current * 0.1, 135, cx, cy);
        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 14);
        grd.addColorStop(0, color + 'cc');
        grd.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // Dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        // Line to center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Centre core pulse
      pulsePhase.current += 0.04;
      const pulseMag = Math.sin(pulsePhase.current) * 0.5 + 0.5;
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 + pulseMag * 10);
      coreGrd.addColorStop(0, 'rgba(29,142,255,0.9)');
      coreGrd.addColorStop(0.4, 'rgba(29,142,255,0.3)');
      coreGrd.addColorStop(1, 'rgba(29,142,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + pulseMag * 10, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10,15,35,0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(29,142,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // AI text in core
      ctx.fillStyle = '#1d8eff';
      ctx.font = '700 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AI', cx, cy - 4);
      ctx.font = '500 7px monospace';
      ctx.fillStyle = 'rgba(29,142,255,0.7)';
      ctx.fillText('CORE', cx, cy + 5);

      sweepAngle.current = (sweepAngle.current + 1.2) % 360;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
    />
  );
};

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const getStartedPath = '/upload';

  const floatStyle = (delay, duration = 6) => ({
    animation: `heroFloat ${duration}s ease-in-out ${delay}s infinite`,
  });

  const skillOrbStyle = (angleDeg, radius, delay) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return {
      position: 'absolute',
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
      animation: `skillPulse 3s ease-in-out ${delay}s infinite`,
      zIndex: 20,
    };
  };

  return (
    <>
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
        }
        @keyframes skillPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(100%); }
        }
        @keyframes matchPing {
          0% { box-shadow: 0 0 0 0 rgba(29,229,180,0.6); }
          70% { box-shadow: 0 0 0 12px rgba(29,229,180,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,229,180,0); }
        }
        @keyframes tickUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-job-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hero-job-card:hover {
          transform: translateY(-6px) rotate(0deg) !important;
          box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 24px rgba(29,142,255,0.15) !important;
        }
        .skill-pill {
          background: rgba(29,142,255,0.08);
          border: 1px solid rgba(29,142,255,0.3);
          color: rgba(29,142,255,0.9);
          font-family: monospace;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          white-space: nowrap;
          letter-spacing: 0.05em;
          backdrop-filter: blur(4px);
        }
        .stat-ticker {
          font-size: 11px;
          font-family: monospace;
          color: rgba(29,229,180,0.9);
          animation: tickUp 0.5s ease both;
        }
        .center-viz {
          position: relative;
          width: 380px;
          height: 380px;
        }
        .viz-ring-outer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px dashed rgba(29,142,255,0.12);
          animation: radarSpin 20s linear infinite;
        }
        .viz-ring-inner {
          position: absolute;
          inset: 40px;
          border-radius: 50%;
          border: 1px dashed rgba(29,142,255,0.08);
          animation: radarSpin 14s linear infinite reverse;
        }
      `}</style>

      <section className="relative w-full flex flex-col items-center pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1000px] hero-glow pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative w-full max-w-7xl mt-10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.15 }}
        >
          {/* ── Central Matching Engine ── */}
          <div className="relative flex items-center justify-center" style={{ width: 480, height: 480 }}>

            {/* Canvas radar */}
            <div className="center-viz">
              <div className="viz-ring-outer" />
              <div className="viz-ring-inner" />
              <MatchingCore />

              {/* Orbiting skill tags */}
              {SKILL_TAGS.map(({ label, angle, radius }, i) => (
                <div key={label} style={skillOrbStyle(angle, radius, i * 0.4)}>
                  <span className="skill-pill">{label}</span>
                </div>
              ))}

              {/* CV Upload indicator — top left of viz */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                style={{
                  position: 'absolute',
                  top: 28,
                  left: -28,
                  background: 'rgba(10,15,35,0.85)',
                  border: '1px solid rgba(29,142,255,0.25)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  backdropFilter: 'blur(8px)',
                  zIndex: 30,
                }}
              >
                <p style={{ fontSize: 9, color: 'rgba(29,142,255,0.7)', fontFamily: 'monospace', margin: 0, letterSpacing: '0.1em' }}>CV PARSED</p>
                <p style={{ fontSize: 12, color: '#fff', fontWeight: 700, margin: '2px 0 0', fontFamily: 'monospace' }}>7 Skills Found</p>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {[...Array(7)].map((_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#1d8eff', opacity: 0.6 + i * 0.06 }} />
                  ))}
                </div>
              </motion.div>

              {/* Live match counter — bottom right of viz */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{
                  position: 'absolute',
                  bottom: 24,
                  right: -32,
                  background: 'rgba(10,15,35,0.85)',
                  border: '1px solid rgba(0,229,180,0.25)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  backdropFilter: 'blur(8px)',
                  zIndex: 30,
                  textAlign: 'right',
                }}
              >
                <p style={{ fontSize: 9, color: 'rgba(0,229,180,0.7)', fontFamily: 'monospace', margin: 0, letterSpacing: '0.1em' }}>SCANNING</p>
                <p style={{ fontSize: 22, color: '#fff', fontWeight: 700, margin: '1px 0', fontFamily: 'monospace', lineHeight: 1 }}>2.4M<span style={{ fontSize: 11, opacity: 0.6 }}>+</span></p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0, fontFamily: 'monospace' }}>LIVE LISTINGS</p>
              </motion.div>

              {/* Accuracy badge — top right */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  top: 55,
                  right: -20,
                  background: 'rgba(29,142,255,0.12)',
                  border: '1px solid rgba(29,142,255,0.3)',
                  borderRadius: 999,
                  padding: '5px 12px',
                  backdropFilter: 'blur(8px)',
                  zIndex: 30,
                  animation: 'matchPing 2s 1.5s ease infinite',
                }}
              >
                <p style={{ fontSize: 11, color: '#1d8eff', fontFamily: 'monospace', fontWeight: 700, margin: 0 }}>⬤ 97% Accuracy</p>
              </motion.div>
            </div>
          </div>

          {/* ── Floating Job Cards ── */}
          <motion.div
            className="hero-job-card glass-card p-5 rounded-2xl absolute"
            style={{ top: 20, left: '4%', width: 248, '--rot': '-5deg', ...floatStyle(0) }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">SpaceX</p>
                <p className="text-sm font-bold text-white tracking-tight">Full Stack Engineer</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">98% Match</span>
              <span className="text-xs text-slate-400 font-mono font-bold">$180k+</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-job-card glass-card p-5 rounded-2xl absolute"
            style={{ top: 18, right: '2%', width: 248, '--rot': '10deg', ...floatStyle(1.2) }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">neurology</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">Neuralink</p>
                <p className="text-sm font-bold text-white tracking-tight">AI Researcher</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">94% Match</span>
              <span className="text-xs text-slate-400 font-mono font-bold">$220k+</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-job-card glass-card p-5 rounded-2xl absolute"
            style={{ bottom: 32, left: '1%', width: 248, '--rot': '3deg', ...floatStyle(0.8, 7), zIndex: 20 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">cloud</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">Stripe</p>
                <p className="text-sm font-bold text-white tracking-tight">Lead Architect</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">97% Match</span>
              <span className="text-xs text-slate-400 font-mono font-bold">$210k+</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-job-card glass-card p-5 rounded-2xl absolute"
            style={{ bottom: 0, right: '8%', width: 248, '--rot': '-10deg', ...floatStyle(1.6, 8), zIndex: 20 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75, duration: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">token</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">OpenAI</p>
                <p className="text-sm font-bold text-white tracking-tight">Product Designer</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-mono border border-tertiary/30 font-bold">91% Match</span>
              <span className="text-xs text-slate-400 font-mono font-bold">$195k+</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Hero Copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
          className="relative z-20 text-center px-6 max-w-4xl mt-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-slate-300 tracking-wider">NEURAL MATCH ENGINE v2.4 — LIVE</span>
          </motion.div>

          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Find Your Dream Job{' '}
            <span className="text-primary italic">With AI</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your CV once. Our neural engine scans 2M+ live listings and ranks them by your exact skill DNA — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
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
            {[
              { dot: 'bg-primary', label: '2.4M+ Live Listings' },
              { dot: 'bg-tertiary', label: '97% Match Accuracy' },
              { dot: 'bg-secondary', label: '12s Avg Scan' },
              { dot: 'bg-tertiary-fixed', label: '50K+ Hired This Month' },
            ].map(({ dot, label }) => (
              <div key={label} className="glass-card px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
                <span className="text-xs font-mono text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-20 mb-12 flex flex-col items-center gap-1 animate-bounce cursor-pointer hover:opacity-100 transition-opacity"
        >
          <span className="text-sm font-mono tracking-widest uppercase font-bold">The Engine</span>
          <div className="w-[2px] h-24 bg-gradient-to-b from-primary to-transparent rounded-full" />
        </motion.div>
      </section>
    </>
  );
};

export default Hero;