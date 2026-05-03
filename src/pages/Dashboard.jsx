import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useJobMatch } from '../hooks/useJobMatch';
import { supabaseDB } from '../services/supabaseDB';

const Dashboard = () => {
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState(undefined);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch the candidate profile so we can pass it to the hook for scoring
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        console.log('Dashboard: Loading profile for user:', user.email);
        setProfileLoading(true);
        try {
          // Use our standardized method with email fallback
          const profileData = await supabaseDB.getCandidateProfile(user.id, user.email);
          console.log('Dashboard: Profile Data received:', profileData ? 'YES' : 'NONE');
          setCandidateProfile(profileData);
        } catch (err) {
          console.error('Dashboard: Failed to load profile for matching', err);
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log('Dashboard: No authenticated user found.');
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const { 
    jobs, 
    loading: jobsLoading, 
    searchQuery, 
    setSearchQuery, 
    filters, 
    setFilters, 
    loadMore, 
    hasMore, 
    totalCount 
  } = useJobMatch(candidateProfile);

  // Combine loading states
  const loading = profileLoading || jobsLoading;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-[#d3e5f1] selection:bg-primary/30 antialiased">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:pl-60 pr-0 min-h-screen bg-surface-container-lowest relative z-10">
        <div className="p-12 max-w-8xl mx-auto">
          {/* Hero Title Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-6xl font-headline font-bold text-white tracking-tighter mb-4">Precision Pipeline</h2>
              <p className="text-on-surface-variant text-lg leading-relaxed font-body">
                Analyzing <strong>{totalCount}</strong> roles for your stack. We've identified <span className="text-primary font-bold">high-fidelity matches</span> for your current profile.
              </p>
            </div>
            <div className="relative w-full lg:w-80 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role or tech stack..."
                className="w-full bg-surface border border-outline px-12 py-3 rounded-3xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40 font-body"
              />
            </div>
          </div>

          {/* Filters Area */}
          <div className="glass-card p-8 rounded-2xl mb-12 flex flex-wrap items-center justify-between gap-8 border border-white/5">
            <div className="flex flex-wrap items-center gap-8">
              <div className="space-y-1.5 min-w-[140px]">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold ml-1 font-space">Role Type</label>
                <div className="flex gap-2">
                  {['All', 'Full-time', 'Contract'].map(type => (
                    <button 
                      key={type}
                      onClick={() => handleFilterChange('roleType', type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.roleType === type ? 'bg-primary text-black' : 'bg-white/5 border border-white/5 text-on-surface-variant hover:bg-white/10'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 min-w-[140px]">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold ml-1 font-space">Min. Salary</label>
                <select 
                  value={filters.minSalary}
                  onChange={(e) => handleFilterChange('minSalary', Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="0" className="bg-surface">Any Salary</option>
                  <option value="120000" className="bg-surface">$120k+</option>
                  <option value="150000" className="bg-surface">$150k+</option>
                  <option value="180000" className="bg-surface">$180k+</option>
                </select>
              </div>
              <div className="space-y-1.5 min-w-[140px]">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-bold ml-1 font-space">Experience</label>
                <select 
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="w-full bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="All" className="bg-surface">All Levels</option>
                  <option value="Junior" className="bg-surface">Junior</option>
                  <option value="Mid" className="bg-surface">Mid-Level</option>
                  <option value="Senior" className="bg-surface">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => setFilters({ roleType: 'All', minSalary: 0, experienceLevel: 'All' })}
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 font-space"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list_off</span> Clear All
            </button>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
               // (Loading Skeleton is already implemented)
               Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col h-64 animate-pulse">
                   <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-5">
                          <div className="w-14 h-14 bg-white/5 rounded-xl flex-shrink-0"></div>
                          <div className="space-y-3 pt-2">
                             <div className="h-4 w-32 bg-white/10 rounded"></div>
                             <div className="h-3 w-24 bg-white/5 rounded"></div>
                          </div>
                      </div>
                      <div className="h-8 w-12 bg-white/10 rounded"></div>
                   </div>
                   <div className="flex gap-2 mt-auto pt-6 border-t border-white/5">
                      <div className="h-8 w-24 bg-white/5 rounded-lg"></div>
                      <div className="h-8 w-20 bg-white/5 rounded-lg"></div>
                   </div>
                </div>
              ))
            ) : jobs.length === 0 ? (
               <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl mx-auto mb-6">
                     <span className="material-symbols-outlined text-4xl text-slate-500">search_off</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-white mb-2">No roles found</h3>
                  <p className="text-slate-500">Try adjusting your search criteria or broadening your filters.</p>
               </div>
            ) : (
                jobs.map(job => (
                    <div key={job.id} className="glass-card p-8 rounded-2xl hover:bg-white/[0.04] transition-all group cursor-pointer border border-white/10 flex flex-col relative overflow-hidden">
                      {/* Decorative match score background highlight */}
                      {job.match_score >= 90 && (
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none -z-10"></div>
                      )}
    
                      <div className="flex justify-between items-start mb-8 z-10">
                        <div className="flex gap-5">
                          <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                            {job.logo_url ? (
                              <img src={job.logo_url} alt={job.company} className="w-10 h-10 object-contain mix-blend-screen" />
                            ) : (
                              <span className="material-symbols-outlined text-2xl text-primary">work</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-headline font-bold text-white leading-none mb-2">{job.title}</h3>
                            <p className="text-on-surface-variant font-medium font-body">{job.company} {job.location && `• ${job.location}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl match-score text-tertiary-fixed-dim leading-none">{job.match_score || 0}%</div>
                          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-space mt-1 leading-none">Match</div>
                        </div>
                      </div>
    
                      <div className="flex flex-wrap gap-2 mb-8 flex-1 z-10">
                        {(job.skills || []).slice(0, 4).map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[11px] font-bold text-on-surface-variant font-mono">
                            {tag}
                          </span>
                        ))}
                        {job.salary_range && (
                          <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-[11px] font-bold text-green-400 font-mono">
                             {job.salary_range}
                          </span>
                        )}
                      </div>
    
                      <div className="flex items-center justify-between border-t border-outline pt-6 mt-auto z-10">
                        <p className="text-xs text-on-surface-variant/60 italic font-body">{job.posted_at || 'Recently posted'}</p>
                        <Link
                          to={`/job-details/${job.id}`}
                          state={{ match_score: job.match_score ?? null }}
                          className="px-6 py-2.5 bg-white/5 border border-white/5 hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(29,142,255,0.4)] rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 font-space"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
            )}
          </div>
          
          {/* Load More */}
          {!loading && hasMore && (
             <div className="mt-16 text-center">
               <button 
                 onClick={loadMore}
                 className="group inline-flex flex-col items-center"
               >
                 <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors mb-4 font-space">Load More Matches</span>
                 <div className="w-10 h-10 flex items-center justify-center border border-outline rounded-round-full group-hover:border-primary group-hover:bg-primary/10 transition-all">
                   <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform group-hover:text-primary">expand_more</span>
                 </div>
               </button>
             </div>
          )}
        </div>

        {/* Global Background Glow */}
        <div className="fixed inset-0 pointer-events-none -z-20" style={{ background: 'radial-gradient(circle at 60% 0%, rgba(29, 142, 255, 0.03) 0%, transparent 60%)' }}></div>
      </main>
    </div>
  );
};

export default Dashboard;
