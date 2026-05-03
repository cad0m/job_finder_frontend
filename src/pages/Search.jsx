import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabaseDB } from '../services/supabaseDB';
import { edgeFunctions } from '../services/edgeFunctions';

// ─── Score color helper ──────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score === null) return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-primary bg-primary/10 border-primary/20';
};

// ─── Skeleton Card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col h-64 animate-pulse">
    <div className="flex justify-between items-start mb-8">
      <div className="flex gap-5">
        <div className="w-14 h-14 bg-white/5 rounded-xl flex-shrink-0" />
        <div className="space-y-3 pt-2">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="h-3 w-24 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-8 w-14 bg-white/10 rounded" />
    </div>
    <div className="flex gap-2 mb-6">
      {[80, 60, 70].map(w => (
        <div key={w} className="h-7 bg-white/5 rounded-lg" style={{ width: w }} />
      ))}
    </div>
    <div className="flex gap-2 mt-auto pt-6 border-t border-white/5">
      <div className="h-8 w-24 bg-white/5 rounded-lg" />
      <div className="h-8 w-20 bg-white/5 rounded-lg ml-auto" />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Search = () => {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | results | empty | error
  const [error, setError] = useState(null);
  const [isSemantic, setIsSemantic] = useState(true); // did the AI embedding succeed?
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setStatus('loading');
    setError(null);
    setIsSemantic(true);

    // ── Tier 1: Semantic (AI embedding + vector RPC) ──────────────────
    try {
      const embedResult = await edgeFunctions.invokeEmbedText(trimmed);
      const embedding = embedResult?.embedding ?? embedResult;

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding returned');
      }

      const results = await supabaseDB.searchJobsByEmbedding(embedding, trimmed);

      if (results.length > 0 && results[0].match_score === null) {
        setIsSemantic(false); // RPC fallback was used inside supabaseDB
      }

      setJobs(results);
      setStatus(results.length > 0 ? 'results' : 'empty');
      return; // success — stop here
    } catch (embedErr) {
      console.warn('Semantic search failed, falling back to keyword:', embedErr.message);
      // Don't throw — fall through to keyword fallback
    }

    // ── Tier 2: Keyword fallback ──────────────────────────────────────
    try {
      setIsSemantic(false);
      const results = await supabaseDB.getJobs(trimmed);
      const mapped = results.map(job => ({ ...job, match_score: null }));
      setJobs(mapped);
      setStatus(mapped.length > 0 ? 'results' : 'empty');
    } catch (kwErr) {
      console.error('Keyword fallback also failed:', kwErr);
      setError('Search failed. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="bg-background text-[#d3e5f1] font-body min-h-screen flex antialiased relative overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[70%] h-[40%] bg-primary/3 blur-[160px] rounded-full pointer-events-none -z-0" />
      <div className="fixed bottom-0 right-0 w-[40%] h-[40%] bg-secondary/3 blur-[160px] rounded-full pointer-events-none -z-0" />

      <Sidebar />

      <main className="relative z-10 flex-1 px-8 py-12 ml-60 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs font-bold tracking-wide border border-secondary/20 mb-4">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              AI Semantic Search
            </span>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-white leading-tight mb-3">
              Find Your Next <span className="text-primary">Opportunity</span>
            </h1>
            <p className="text-on-surface-variant text-base max-w-xl mx-auto">
              Describe the role you're looking for in plain English — our AI finds semantically matched positions from your profile.
            </p>
          </div>

          {/* ── Search Bar ──────────────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="relative mb-10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/40 transition-colors">
              <span className="material-symbols-outlined text-2xl text-primary ml-5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Senior React engineer with TypeScript experience in fintech..."
                className="flex-1 bg-transparent px-5 py-5 text-white placeholder:text-zinc-600 focus:outline-none text-base font-body"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !query.trim()}
                className="mr-3 px-6 py-2.5 bg-primary text-black font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Searching…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">search</span>
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Context banner (keyword fallback / result count) ─────────── */}
          {status === 'results' && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-on-surface-variant">
                <span className="text-white font-bold">{jobs.length}</span> roles matched for &ldquo;<span className="text-primary">{query}</span>&rdquo;
              </p>
              {!isSemantic && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  Keyword mode — semantic index unavailable
                </span>
              )}
              {isSemantic && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  AI Semantic Match
                </span>
              )}
            </div>
          )}

          {/* ── Error Banner ─────────────────────────────────────────────── */}
          {status === 'error' && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-red-200 text-sm font-medium">{error}</p>
              <button onClick={() => setStatus('idle')} className="ml-auto text-red-500/50 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* ── Idle State ───────────────────────────────────────────────── */}
          {status === 'idle' && (
            <div className="py-24 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>
                  manage_search
                </span>
              </div>
              <div>
                <p className="text-white font-headline font-bold text-xl mb-2">Describe your ideal role</p>
                <p className="text-on-surface-variant text-sm max-w-sm">
                  Type a job description, skill set, or role type above. Our AI will find the best matches from the job database.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  'Senior React developer fintech',
                  'ML engineer Python remote',
                  'DevOps AWS Kubernetes',
                  'Product manager SaaS B2B',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="px-4 py-2 text-xs font-mono text-on-surface-variant border border-white/10 rounded-full hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Loading Skeletons ────────────────────────────────────────── */}
          {status === 'loading' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Empty State ──────────────────────────────────────────────── */}
          {status === 'empty' && (
            <div className="py-24 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-zinc-600">search_off</span>
              </div>
              <div>
                <p className="text-white font-headline font-bold text-xl mb-2">No matches found</p>
                <p className="text-on-surface-variant text-sm">
                  Try different keywords or a broader description.
                </p>
              </div>
            </div>
          )}

          {/* ── Results Grid ─────────────────────────────────────────────── */}
          {status === 'results' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="glass-card p-8 rounded-2xl border border-white/10 flex flex-col relative overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
                >
                  {/* High-score glow */}
                  {job.match_score >= 80 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none -z-10" />
                  )}

                  {/* Top row */}
                  <div className="flex justify-between items-start mb-6 z-10">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.logo_url ? (
                          <img src={job.logo_url} alt={job.company} className="w-10 h-10 object-contain mix-blend-screen" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-primary">work</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-headline font-bold text-white leading-tight mb-1">{job.title}</h3>
                        <p className="text-on-surface-variant text-sm">
                          {job.company}
                          {job.location && <span className="text-zinc-600"> · {job.location}</span>}
                        </p>
                      </div>
                    </div>
                    {/* Match Score badge */}
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full border font-mono flex-shrink-0 ${scoreColor(job.match_score)}`}>
                      {job.match_score !== null ? `${job.match_score}%` : '—'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6 flex-1 z-10">
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

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-outline pt-5 mt-auto z-10">
                    <p className="text-xs text-on-surface-variant/60 italic font-body">{job.posted_at || 'Recently posted'}</p>
                    <Link
                      to={`/job-details/${job.id}`}
                      state={{ match_score: job.match_score }}
                      className="px-5 py-2 bg-white/5 border border-white/5 hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(29,142,255,0.4)] rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-all duration-300"
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

export default Search;
