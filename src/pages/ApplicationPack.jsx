import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabaseDB } from '../services/supabaseDB';
import { edgeFunctions } from '../services/edgeFunctions';
import { useAuth } from '../hooks/useAuth';

const ApplicationPack = () => {
  const { jobId } = useParams();
  const { state: routeState } = useLocation();
  const routeMatchScore = routeState?.match_score ?? null;
  const { session } = useAuth();

  // Data States
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);

  // Configuration States
  const [templateId, setTemplateId] = useState('template1.tex');
  const [socials, setSocials] = useState({
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });

  // Generation States
  const [status, setStatus] = useState('idle'); // idle, loading, generating-data, generating-pdf, ready, error
  const [appData, setAppData] = useState(null); // { data_cv, data_letter, data_email }
  const [appPdfs, setAppPdfs] = useState(null); // { files: { cv, email, cover_letter? } }
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !session?.user?.id) return;

      setStatus('loading');
      setError(null);
      try {
        const [jobData, profileData] = await Promise.all([
          supabaseDB.getJobById(jobId),
          supabaseDB.getCandidateProfile(session.user.id)
        ]);

        setJob(jobData);
        setProfile(profileData);

        // Pre-fill socials from the user's last application
        const lastAppSocials = await supabaseDB.getLastApplicationSocials(session.user.id);
        if (lastAppSocials) {
          setSocials({
            linkedin_url: lastAppSocials.linkedin_url || '',
            github_url: lastAppSocials.github_url || '',
            portfolio_url: lastAppSocials.portfolio_url || ''
          });
        }

        setStatus('idle');
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load job or profile data. Please check your connection.');
        setStatus('error');
      }
    };

    fetchData();
  }, [jobId, session?.user?.id]);

  const handleDownloadAll = async () => {
    if (!appPdfs?.files) return;
    await supabaseDB.downloadApplicationFiles(appPdfs.files);
  };

  const handleGenerate = async () => {
    if (!job || !profile) return;
    setError(null);

    try {
      // Step A: Generate Content Data
      setStatus('generating-data');
      const dataPayload = {
        user_id: session.user.id,
        job_id: jobId,
        ...socials
      };

      const content = await edgeFunctions.invokeGenerateCv(dataPayload);
      setAppData(content);

      // Step B: Generate PDFs
      setStatus('generating-pdf');
      const pdfPayload = {
        user_id: session.user.id,
        job_id: jobId,
        template_id: templateId,
        data_cv: content.data_cv,
        data_letter: content.data_letter,
        data_email: content.data_email
      };

      const files = await edgeFunctions.invokeGeneratePdf(pdfPayload);
      setAppPdfs(files);

      // Step C: Save to DB
      await supabaseDB.saveJobApplication({
        user_id: session.user.id,
        job_id: jobId,
        candidate_id: profile.id,
        template_id: templateId,
        linkedin_url: socials.linkedin_url,
        github_url: socials.github_url,
        portfolio_url: socials.portfolio_url,
        cv_url: files.files.cv,
        cover_letter_url: files.files.cover_letter,
        email_url: files.files.email,
        data_cv: content.data_cv,
        data_letter: content.data_letter,
        data_email: content.data_email,
        status: 'ready'
      });

      setStatus('ready');

    } catch (err) {
      console.error('Generation flow error:', err);
      setError(err.message || 'AI Generation failed. This might be due to a rate limit or service interruption.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-background text-[#d3e5f1] font-body selection:bg-primary/30 min-h-screen relative overflow-x-hidden flex antialiased">
      <div className="noise-overlay fixed inset-0 z-0 opacity-20 pointer-events-none"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Canvas */}
      <main className="relative z-10 flex-1 px-8 py-12 ml-60 bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-red-200 text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-500/50 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
          {/* Header Section */}
          <header className="mb-12 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs font-bold tracking-wide border border-secondary/20">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                ✦ Generated by JobMatcher AI
              </span>
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tight text-white max-w-4xl leading-tight">
              Application Pack for <span className="text-primary">{job?.title || 'Senior Role'}</span> at {job?.company?.name || job?.company || 'Top Company'}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="surface-container-low p-6 rounded-xl glass-card flex items-center gap-4 group hover:translate-y-[-4px] transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">description</span>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-white leading-none">3 AI Docs</div>
                  <div className="text-on-surface-variant text-sm mt-1">Ready for submission</div>
                </div>
              </div>
              <div className="surface-container-low p-6 rounded-xl glass-card flex items-center gap-4 group hover:translate-y-[-4px] transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-3xl">analytics</span>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-white leading-none">
                    {routeMatchScore != null ? `${routeMatchScore}%` : (job?.match_score ? `${job.match_score}%` : 'N/A')} Match
                  </div>
                  <div className="text-on-surface-variant text-sm mt-1">Optimized relevance</div>
                </div>
              </div>
              <div className="surface-container-low p-6 rounded-xl glass-card flex items-center gap-4 group hover:translate-y-[-4px] transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-3xl">speed</span>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-white leading-none">
                    {status === 'ready' ? 'Ready!' : status !== 'idle' ? 'Processing...' : 'Ready in 1s'}
                  </div>
                  <div className="text-on-surface-variant text-sm mt-1">AI instant workflow</div>
                </div>
              </div>
            </div>
          </header>

          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Template Selector */}
            <div className="surface-container-low p-8 rounded-2xl glass-card border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">palette</span>
                </div>
                <h3 className="font-headline font-bold text-white uppercase tracking-wider text-sm">Design Template</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {['template1.tex', 'template2.tex', 'template3.tex', 'template4.tex', 'template5.tex'].map((t, idx) => (
                  <button
                    key={t}
                    onClick={() => setTemplateId(t)}
                    className={`aspect-square rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${templateId === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20'
                      }`}
                  >
                    <span className="font-mono text-xs font-bold leading-none">{idx + 1}</span>
                    {templateId === t && (
                      <span className="absolute top-1 right-1 material-symbols-outlined text-[10px] animate-in zoom-in">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest text-center">
                Selected: <span className="text-primary">{templateId}</span> — Professional LaTeX Engine
              </p>
            </div>

            {/* Social Links Form */}
            <div className="surface-container-low p-8 rounded-2xl glass-card border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-xl">link</span>
                </div>
                <h3 className="font-headline font-bold text-white uppercase tracking-wider text-sm">Professional Links</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-mono text-xs">LinkedIn</span>
                  <input
                    type="url"
                    value={socials.linkedin_url}
                    onChange={(e) => setSocials({ ...socials, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#081821] border border-white/5 rounded-xl pl-20 pr-4 py-2 text-xs text-zinc-600 focus:border-primary/50 focus:outline-none transition-all placeholder:opacity-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-mono text-[10px]">GitHub</span>
                    <input
                      type="url"
                      value={socials.github_url}
                      onChange={(e) => setSocials({ ...socials, github_url: e.target.value })}
                      placeholder="github.com/..."
                      className="w-full bg-[#081821] border border-white/5 rounded-xl pl-16 pr-4 py-2 text-xs text-zinc-600 focus:border-primary/50 focus:outline-none transition-all placeholder:opacity-20"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white font-mono text-[10px]">Portfolio </span>
                    <input
                      type="url"
                      value={socials.portfolio_url}
                      onChange={(e) => setSocials({ ...socials, portfolio_url: e.target.value })}
                      placeholder="   portfolio.io"
                      className="w-full bg-[#081821] border border-white/5 rounded-xl pl-20 pr-4 py-2  text-xs text-zinc-600 focus:border-primary/50 focus:outline-none transition-all placeholder:opacity-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Document Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* CV Column */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-headline text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  Curriculum Vitae
                </h3>
                <div className="flex gap-2">
                  {status === 'ready' && (
                    <a
                      href={appPdfs?.files?.cv}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">download</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="surface-container-low rounded-xl glass-card p-8 aspect-[3/4] overflow-hidden relative group">
                {status === 'generating-data' || status === 'generating-pdf' ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                      <div className="h-2 w-4/5 bg-white/5 rounded"></div>
                    </div>
                    <div className="p-4 bg-primary/5 border-l-2 border-primary/20 rounded-r-lg space-y-3">
                      <div className="h-3 w-1/2 bg-primary/20 rounded"></div>
                      <div className="h-2 w-full bg-primary/10 rounded"></div>
                    </div>
                  </div>
                ) : appData?.data_cv ? (
                  <div className="prose prose-invert prose-sm max-w-none text-[10px] leading-relaxed font-body opacity-80 select-none pointer-events-none">
                    <div className="text-primary font-headline font-bold text-sm mb-4">{profile?.full_name}</div>
                    <div className="whitespace-pre-wrap">{typeof appData.data_cv === 'string'
                      ? appData.data_cv.substring(0, 1000)
                      : JSON.stringify(appData.data_cv, null, 2).substring(0, 1000)}...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <span className="material-symbols-outlined text-4xl text-white/5">description</span>
                    <p className="text-xs text-white/20 font-mono uppercase tracking-widest">Awaiting AI Generation</p>
                  </div>
                )}

                {/* Overlay qbel generation */}
                {(status === 'idle' || status === 'loading') && !appData?.data_cv && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm bg-surface-container-high/40 rounded-xl">
                    <button className="px-6 py-2.5 bg-primary text-on-primary-fixed font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">zoom_in</span>
                      Full Preview
                    </button>
                  </div>
                )}

                {status === 'ready' && (
                  <div className="absolute inset-0 bg-surface-container-high/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a
                      href={appPdfs?.files?.cv}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-primary text-on-primary-fixed font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined">zoom_in</span>
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Cover Letter Column */}
            <section className={`flex flex-col gap-6 transition-opacity duration-500 ${!appData?.data_letter && status === 'ready' ? 'opacity-30' : 'opacity-100'}`}>
              <div className="flex items-center justify-between px-2">
                <h3 className="font-headline text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">article</span>
                  Cover Letter
                </h3>
                <div className="flex gap-2">
                  {status === 'ready' && appPdfs?.files?.cover_letter && (
                    <a
                      href={appPdfs.files.cover_letter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-on-surface-variant hover:text-tertiary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">download</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="surface-container-low rounded-xl glass-card p-8 aspect-[3/4] overflow-hidden relative group">
                {status === 'generating-data' || status === 'generating-pdf' ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-4 w-1/4 bg-white/10 rounded"></div>
                    <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                    <div className="space-y-2 mt-8">
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                    </div>
                  </div>
                ) : appData?.data_letter ? (
                  <div className="prose prose-invert prose-sm max-w-none text-[10px] leading-relaxed font-body opacity-80 select-none pointer-events-none">
                    <div className="whitespace-pre-wrap">{typeof appData.data_letter === 'string'
                      ? appData.data_letter.substring(0, 1000)
                      : JSON.stringify(appData.data_letter, null, 2).substring(0, 1000)}...
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <span className="material-symbols-outlined text-4xl text-white/5">article</span>
                    <p className="text-xs text-white/20 font-mono uppercase tracking-widest">
                      {status === 'ready' ? 'No Letter Generated' : 'Awaiting AI Generation'}
                    </p>
                  </div>
                )}

                {(status === 'idle' || status === 'loading') && !appData?.data_letter && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm bg-surface-container-high/40 rounded-xl">
                    <button className="px-6 py-2.5 bg-tertiary text-on-tertiary font-bold rounded-lg shadow-lg shadow-tertiary/20 flex items-center gap-2 hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">zoom_in</span>
                      Full Preview
                    </button>
                  </div>
                )}

                {status === 'ready' && appPdfs?.files?.cover_letter && (
                  <div className="absolute inset-0 bg-surface-container-high/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a
                      href={appPdfs.files.cover_letter}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-tertiary text-on-tertiary font-bold rounded-lg shadow-lg shadow-tertiary/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined">zoom_in</span>
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Cold Email Column */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-headline text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">alternate_email</span>
                  Cold Email
                </h3>
                <div className="flex gap-2">
                  {status === 'ready' && appPdfs?.files?.email && (
                    <a
                      href={appPdfs.files.email}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-on-surface-variant hover:text-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">download</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="surface-container-low rounded-xl glass-card p-8 aspect-[3/4] overflow-hidden relative group">
                {status === 'generating-data' || status === 'generating-pdf' ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-3 w-3/4 bg-white/10 rounded mb-8"></div>
                    <div className="space-y-2">
                      <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                    </div>
                  </div>
                ) : appData?.data_email ? (
                  <div className="prose prose-invert prose-sm max-w-none text-[10px] leading-relaxed font-body opacity-80 select-none pointer-events-none">
                    <div className="whitespace-pre-wrap">{typeof appData.data_email === 'string'
                      ? appData.data_email.substring(0, 1000)
                      : JSON.stringify(appData.data_email, null, 2).substring(0, 1000)}...</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <span className="material-symbols-outlined text-4xl text-white/5">alternate_email</span>
                    <p className="text-xs text-white/20 font-mono uppercase tracking-widest">Awaiting AI Generation</p>
                  </div>
                )}

                {(status === 'idle' || status === 'loading') && !appData?.data_email && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm bg-surface-container-high/40 rounded-xl">
                    <button className="px-6 py-2.5 bg-secondary text-on-secondary-fixed font-bold rounded-lg shadow-lg shadow-secondary/20 flex items-center gap-2 hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">zoom_in</span>
                      Full Preview
                    </button>
                  </div>
                )}

                {status === 'ready' && appPdfs?.files?.email && (
                  <div className="absolute inset-0 bg-surface-container-high/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a
                      href={appPdfs.files.email}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-secondary text-on-secondary-fixed font-bold rounded-lg shadow-lg shadow-secondary/20 flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined">zoom_in</span>
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Master Action Section */}
          <div className="mt-20">
            <button
              onClick={status === 'ready' ? handleDownloadAll : handleGenerate}
              disabled={status !== 'idle' && status !== 'ready'}
              className="w-full relative overflow-hidden group rounded-2xl p-[1px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary to-primary-container transition-transform duration-500 group-hover:scale-110 opacity-50"></div>
              <div className="relative bg-surface-container-low/90 backdrop-blur-xl rounded-[15px] px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-surface-container-high transition-colors duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/20 transition-colors">
                    <div className="absolute inset-0 bg-primary/20 animate-ping opacity-20"></div>
                    <span className="material-symbols-outlined text-4xl text-primary relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {status === 'generating-data' || status === 'generating-pdf' ? 'sync' : 'bolt'}
                    </span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-headline text-2xl font-black text-white tracking-tighter">
                      {status === 'generating-data' ? 'Analyzing Job & Profile...' :
                        status === 'generating-pdf' ? 'Rendering Premium PDFs...' :
                          status === 'ready' ? 'Pack Generated Successfully' :
                            'Apply Now — Send All 3 Docs'}
                    </h4>
                    <p className="text-on-surface-variant mt-1">
                      {status === 'ready' ? 'Your AI-optimized documents are ready for download.' :
                        'JobMatcher\'s recruitment engine will prioritize this AI-optimized pack.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-primary/10 rounded-xl px-8 py-2 border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-300">
                  <span className="text-white font-bold text-xl font-headline">
                    {status === 'generating-data' || status === 'generating-pdf' ? 'Processing...' :
                      status === 'ready' ? 'Download All' : 'Apply with AI Intelligence'}
                  </span>
                  <span className={`material-symbols-outlined text-2xl transition-transform text-primary ${status === 'ready' ? 'translate-y-1' : 'group-hover:translate-x-2'}`}>
                    {status === 'ready' ? 'download' : 'arrow_forward'}
                  </span>
                </div>
              </div>
            </button>
            <footer className="mt-8 text-center">
              <div className="inline-flex items-center gap-4 py-2 px-6 rounded-full border border-white/5 bg-surface-container-lowest/50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-sm font-mono text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Uses 3 AI credits
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="text-sm font-mono text-white font-medium">
                  127 remaining on <span className="text-primary">Pro Plan</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Visual Background Accents */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary-container/5 blur-[150px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default ApplicationPack;
