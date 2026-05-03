import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingState from '../components/common/LoadingState';
import { supabaseDB } from '../services/supabaseDB';
import { useAuth } from '../hooks/useAuth';


// ─── Main Component ──────────────────────────────────────────────────────────
const Saved = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) return;
      setLoading(true);
      const jobs = await supabaseDB.getSavedJobs(user.id);
      setSavedJobs(jobs);
      setLoading(false);
    };

    fetchSavedJobs();
  }, [user]);

  const handleUnsave = async (jobId) => {
    if (!user) return;
    // Optimistically remove from UI
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    try {
      // Toggle saved status to false
      await supabaseDB.toggleSavedJob(user.id, jobId, true);
    } catch (err) {
      console.error('Failed to unsave job:', err);
      // If it fails, reload the list
      const jobs = await supabaseDB.getSavedJobs(user.id);
      setSavedJobs(jobs);
    }
  };

  return (
    <div className="bg-background text-[#d3e5f1] font-body min-h-screen flex antialiased relative overflow-x-hidden">
      {/* Background glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[70%] h-[40%] bg-primary/5 blur-[160px] rounded-full pointer-events-none -z-0" />
      
      <Sidebar />

      <main className="relative z-10 flex-1 px-8 py-12 ml-60 bg-surface-container-lowest min-h-screen">
        <div className="max-w-8xl mx-auto">
          
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                Saved Opportunities
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Roles you have bookmarked for later review.
              </p>
            </div>
            {!loading && savedJobs.length > 0 && (
              <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-mono text-zinc-400">
                {savedJobs.length} {savedJobs.length === 1 ? 'Role' : 'Roles'}
              </span>
            )}
          </div>

          {loading && (
            <LoadingState message="Scanning your bookmarked opportunities..." />
          )}

          {/* Empty State */}
          {!loading && savedJobs.length === 0 && (
            <div className="py-32 flex flex-col items-center gap-6 text-center border border-dashed border-white/10 rounded-3xl bg-surface-container-low/30 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-zinc-600">bookmark_add</span>
              </div>
              <div className="max-w-md">
                <p className="text-white font-headline font-bold text-xl mb-2">No saved jobs yet</p>
                <p className="text-on-surface-variant text-sm mb-8">
                  When you see a role that interests you, click the bookmark icon to save it here for quick access later.
                </p>
                <Link to="/dashboard" className="px-6 py-3 bg-primary text-black font-bold rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                  <span className="material-symbols-outlined text-sm">explore</span>
                  Browse Jobs
                </Link>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && savedJobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedJobs.map(job => (
                <div 
                  key={job.id} 
                  className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 transition-all bg-surface-container-low/80 backdrop-blur-md group relative"
                >
                   {/* Unsave Button */}
                   <button 
                     onClick={() => handleUnsave(job.id)}
                     className="absolute top-6 right-6 text-zinc-500 hover:text-primary transition-colors flex items-center justify-center bg-white/5 hover:bg-primary/10 rounded-full w-8 h-8"
                     title="Remove from saved"
                   >
                     <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark_remove</span>
                   </button>

                  <div>
                    <div className="flex gap-4 mb-4 pr-10">
                      {job.logo_url ? (
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                           <img src={job.logo_url} alt={job.company} className="w-8 h-8 object-contain mix-blend-screen" />
                         </div>
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-zinc-500">work</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-headline font-bold text-base text-white leading-tight mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-sm font-body text-zinc-400">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-mono text-zinc-300">
                        {job.location || 'Remote'}
                      </span>
                      {job.salary_range && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 rounded-md text-[10px] font-mono text-emerald-400">
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                      SAVED • {new Date(job.saved_at || job.posted_at || Date.now()).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/job-details/${job.id}`}
                      className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-black border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white transition-all rounded-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Saved;
