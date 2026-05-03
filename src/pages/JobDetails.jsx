import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabaseDB } from '../services/supabaseDB';
import { useAuth } from '../hooks/useAuth';
import LoadingState from '../components/common/LoadingState';


const JobDetails = () => {
  const { jobId } = useParams();
  const { state: routeState } = useLocation();
  const matchScore = routeState?.match_score ?? null;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobAndSavedStatus = async () => {
      setLoading(true);
      const data = await supabaseDB.getJobById(jobId);
      setJob(data);

      if (user && data) {
        const saved = await supabaseDB.checkIfJobSaved(user.id, jobId);
        setIsSaved(saved);
      }

      setLoading(false);
    };
    fetchJobAndSavedStatus();
  }, [jobId, user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const handleToggleSave = async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    const previousSavedState = isSaved;
    try {
      // Optimistic update
      setIsSaved(!previousSavedState);
      await supabaseDB.toggleSavedJob(user.id, jobId, previousSavedState);
    } catch (err) {
      console.error('Failed to toggle save:', err);
      // Revert if it fails
      setIsSaved(previousSavedState);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-background min-h-screen text-white">
        <Sidebar />
        <LoadingState message="Syncing Intelligence..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex bg-background min-h-screen text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <span className="material-symbols-outlined text-6xl text-slate-700 mb-6">error</span>
          <h2 className="text-3xl font-headline font-bold mb-2">Role Not Found</h2>
          <p className="text-slate-400 mb-8 max-w-md text-center">We couldn't find the details for this specific role. It might have been filled or removed.</p>
          <Link to="/dashboard" className="px-8 py-3 bg-primary text-black font-bold rounded-lg group flex items-center gap-3">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body selection:bg-primary-container selection:text-on-primary-container bg-background antialiased min-h-screen text-[#d3e5f1]">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 md:pl-60 pr-0 min-h-screen bg-surface-container-lowest">
          <div className="p-12 w-full">
            {/* Hero Section */}
            <div className="relative mb-10 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-surface-container-low p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-8 backdrop-blur-xl">
                <div className="flex gap-6 items-start">
                  <div className="h-20 w-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-4">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt={job.company} className="w-full h-full object-contain mix-blend-screen" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-primary">work</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-primary/20">
                        {job.location || 'Location TBD'}
                      </span>
                      <span className="text-zinc-500 font-mono text-xs uppercase">{job.posted_at || 'Recently Posted'}</span>
                    </div>
                    <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-white mb-2 leading-tight">{job.title}</h1>
                    <p className="font-body text-lg text-zinc-400 flex items-center gap-2">
                      <span className="text-primary font-bold">{job.company}</span>
                      {job.location && (
                        <>
                          <span className="h-1.5 w-1.5 bg-zinc-700 rounded-full"></span>
                          <span>{job.location}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleToggleSave}
                    className={`px-6 py-3 border text-[11px] font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2
                      ${isSaved
                        ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/10'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                      bookmark
                    </span>
                    {isSaved ? 'Saved' : 'Save for later'}
                  </button>
                  <Link
                    to={`/apply/${job.id}`}
                    state={{ match_score: matchScore }}
                    className="px-8 py-3 bg-primary text-black text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_30px_rgba(29,142,255,0.4)] active:scale-[0.98] transition-all rounded-xl"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Apply with AI
                  </Link>
                </div>
              </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Main Body (8 cols) */}
              <div className="md:col-span-8 space-y-6">
                {/* Stats Bento Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36 group hover:border-primary/30 transition-all">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Salary</span>
                    <div>
                      <span className="font-mono text-2xl font-bold text-primary">{job.salary_range || 'Competitive'}</span>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">+ Equity & Bonus</p>
                    </div>
                  </div>
                  {/* Applications */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36 group hover:border-primary/30 transition-all">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Applications</span>
                    <div>
                      <span className="font-mono text-2xl font-bold text-zinc-200">
                        {job.num_application ? job.num_application.toLocaleString() : '—'}
                      </span>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">Total applicants</p>
                    </div>
                  </div>
                  {/* Experience */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-36 group hover:border-primary/30 transition-all">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Experience</span>
                    <div>
                      <span className="font-mono text-2xl font-bold text-zinc-200">
                        {job.experience_level || '—'}
                      </span>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1">Seniority level</p>
                    </div>
                  </div>
                </div>

                {/* Role Overview */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                  <h3 className="font-headline text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                    <span className="h-5 w-1 bg-primary rounded-full"></span>
                    Role Overview
                  </h3>
                  <div className="max-w-none text-zinc-400 space-y-6 leading-relaxed text-sm font-body whitespace-pre-line">
                    {job.description || "No detailed description provided for this role yet."}
                  </div>
                </section>

                {/* Required Skills */}
                <section className="glass-card p-8 rounded-2xl border border-white/5">
                  <h3 className="font-headline text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                    <span className="h-5 w-1 bg-primary rounded-full"></span>
                    Neural Alignment (Skills)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(job.skills || []).length === 0 ? (
                      <p className="text-zinc-500 text-sm">Skills extracted from job description coming soon.</p>
                    ) : (
                      job.skills.map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-zinc-300">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Info (4 cols) */}
              <div className="md:col-span-4 space-y-6">
                <div className="glass-card p-8 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Company Insight</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    {job.company_bio || `${job.company} is leading the charge in modern software infrastructure and innovation.`}
                  </p>
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Size</span>
                      <span className="text-zinc-200 font-mono">{job.company_size || '500-1000'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Founded</span>
                      <span className="text-zinc-200 font-mono">{job.founded_in || '2018'}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest">AI Matching Analysis</h4>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">
                    Your profile has a high <strong>85%+ alignment</strong> with this role's core technical requirements and culture pillars.
                  </p>
                  <button className="w-full mt-6 py-3 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all">
                    View Compatibility Report
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetails;
