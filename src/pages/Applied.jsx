import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingState from '../components/common/LoadingState';
import { supabaseDB } from '../services/supabaseDB';
import { useAuth } from '../hooks/useAuth';

const Applied = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      setLoading(true);
      const data = await supabaseDB.getApplications(user.id);
      setApplications(data);
      setLoading(false);
    };

    fetchApplications();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'generating': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'failed': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-white/5 border-white/10';
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
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                Applied Jobs
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Track your applications and access your generated materials.
              </p>
            </div>
            {!loading && applications.length > 0 && (
              <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-mono text-zinc-400">
                {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
              </span>
            )}
          </div>

          {loading && (
            <LoadingState message="Retrieving your application history..." />
          )}

          {/* Empty State */}
          {!loading && applications.length === 0 && (
            <div className="py-32 flex flex-col items-center gap-6 text-center border border-dashed border-white/10 rounded-3xl bg-surface-container-low/30 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-zinc-600">work_history</span>
              </div>
              <div className="max-w-md">
                <p className="text-white font-headline font-bold text-xl mb-2">No applications yet</p>
                <p className="text-on-surface-variant text-sm mb-8">
                  You haven't applied to any jobs using JobMatcher AI yet. Start your journey by finding a role that fits you.
                </p>
                <Link to="/search" className="px-6 py-3 bg-primary text-black font-bold rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                  <span className="material-symbols-outlined text-sm">search</span>
                  Find Jobs
                </Link>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {applications.map(app => (
                <div 
                  key={app.id} 
                  className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 transition-all bg-surface-container-low/80 backdrop-blur-md group relative"
                >
                  <div className="absolute top-6 right-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex gap-4 mb-4 pr-16">
                      {app.job?.logo_url ? (
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                           <img src={app.job.logo_url} alt={app.job.company} className="w-8 h-8 object-contain mix-blend-screen" />
                         </div>
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-zinc-500">work</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-headline font-bold text-base text-white leading-tight mb-1 group-hover:text-primary transition-colors">{app.job?.title || 'Unknown Position'}</h3>
                        <p className="text-sm font-body text-zinc-400">{app.job?.company || 'Unknown Company'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-mono text-zinc-300">
                        {app.job?.location || 'Remote'}
                      </span>
                      {app.job?.salary_range && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 rounded-md text-[10px] font-mono text-emerald-400">
                          {app.job.salary_range}
                        </span>
                      )}
                    </div>

                    {app.status === 'ready' && (
                      <div className="flex flex-col gap-2 mb-6">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Generated Documents</p>
                        <div className="grid grid-cols-2 gap-2">
                          {app.cv_url && (
                            <a href={app.cv_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-[10px] text-zinc-300 hover:bg-primary/20 hover:text-white transition-all border border-white/5">
                              <span className="material-symbols-outlined text-sm">badge</span> CV
                            </a>
                          )}
                          {app.cover_letter_url && (
                            <a href={app.cover_letter_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-[10px] text-zinc-300 hover:bg-primary/20 hover:text-white transition-all border border-white/5">
                              <span className="material-symbols-outlined text-sm">article</span> Letter
                            </a>
                          )}
                          {app.email_url && (
                            <a href={app.email_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-[10px] text-zinc-300 hover:bg-primary/20 hover:text-white transition-all border border-white/5">
                              <span className="material-symbols-outlined text-sm">alternate_email</span> Email
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {app.status === 'failed' && app.error_message && (
                      <div className="mb-6 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <p className="text-[10px] text-rose-400 font-medium">
                          Error: {app.error_message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                      APPLIED • {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/job-details/${app.job_id}`}
                      className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-black border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white transition-all rounded-lg"
                    >
                      View Job
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

export default Applied;
