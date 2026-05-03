import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { edgeFunctions } from '../services/edgeFunctions';

const UploadResume = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (selectedFile) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF or Image (JPEG, PNG, WEBP).');
      setFile(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const processResume = () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      // Remove 'data:application/pdf;base64,' prefix which often causes 422 errors!
      const base64Raw = reader.result.split(',')[1];

      try {
        const data = await edgeFunctions.invokeCvOcr({
          fileBase64: base64Raw,
          filename: file.name,
          mimeType: file.type
        });

        // Non-blocking fire and forget
        edgeFunctions.invokeEmbedCv().catch(err => console.warn('Embedding delayed', err));

        setLoading(false);
        console.log('OCR Result received:', data);
        
        // Safety check: ensure we have candidate data
        const extractedCandidate = data?.candidate || { fullName: 'Unknown Candidate', skills: [], experience: [] };
        
        // Since the user must be authenticated to upload, skip straight to review
        const destination = '/review';
        console.log('Navigating to:', destination, 'with candidate:', extractedCandidate);
        
        navigate(destination, { state: { candidate: extractedCandidate } });
      } catch (err) {
        console.error('OCR Error Logic:', err);
        setError(err.message || 'Failed to process CV. Please try again.');
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
      setLoading(false);
    };
  };

  return (
    <div className="min-h-screen bg-[#020d12] text-white flex flex-col items-center pt-10 pb-8 px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 grid-mesh opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1000px] hero-glow opacity-20 pointer-events-none"></div>

      {/* Progress Stepper */}
      <div className="relative z-10 flex flex-col items-center mb-10">
        <div className="flex gap-3 mb-6">
          <div className="w-12 h-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(29,142,255,0.6)]"></div>
          <div className="w-12 h-1.5 rounded-full bg-white/10"></div>
        </div>
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-primary font-bold">Step 1 of 2: Intelligence Mapping</span>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-10 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight leading-tight">
          Upload your <span className="bg-gradient-to-r from-primary via-[#be76ff] to-[#4ade80] bg-clip-text text-transparent">Career Blueprint</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-body leading-relaxed opacity-80">
          Our AI engine will parse your experience to find high-precision job matches in seconds.
        </p>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`
            relative p-10 md:p-16 rounded-[32px] border-2 border-dashed transition-all duration-500 flex flex-col items-center text-center group cursor-pointer overflow-hidden
            ${isDragging ? 'border-primary bg-primary/5 shadow-[0_0_80px_rgba(29,142,255,0.3)]' : 'border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.05] hover:shadow-[0_0_60px_rgba(29,142,255,0.15)]'}
          `}
        >
          {/* Decorative Corner Lights */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#be76ff]/10 blur-[80px] rounded-full pointer-events-none"></div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 z-20 text-red-400 bg-red-400/10 px-6 py-3 rounded-2xl border border-red-400/20 text-sm font-mono text-center flex items-center gap-3 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-sm">warning</span>
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center"
              >
                {/* Upload Icon Box */}
                <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-3xl text-primary group-hover:animate-bounce">cloud_upload</span>
                </div>

                <h3 className="text-2xl font-headline font-bold text-white mb-3">Drop your CV here</h3>
                <p className="text-slate-500 font-mono text-xs tracking-widest uppercase mb-10">PDF or IMAGE · Max 10MB</p>

                <div className="relative mb-12 w-full max-w-xs text-center">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5"></div>
                  <span className="relative z-10 px-4 bg-[#04151e] text-[10px] uppercase tracking-[0.3em] text-slate-500 font-mono">Or</span>
                </div>

                <div className="flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-all group/btn">
                  <span className="material-symbols-outlined text-xl text-slate-400 group-hover/btn:text-white">folder_open</span>
                  <span className="font-headline font-bold text-slate-300 group-hover/btn:text-white">Browse Files</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-4"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(29,142,255,0.4)]">
                  <span className="material-symbols-outlined text-4xl text-primary">description</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-white mb-2">{file.name}</h3>
                <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Ready for Neural Parsing
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setError(''); }}
                    disabled={loading}
                    className="px-6 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors font-mono text-[10px] uppercase tracking-widest disabled:opacity-50"
                  >
                    Remove
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); processResume(); }}
                    disabled={loading}
                    className="px-8 py-3 bg-primary text-black rounded-xl hover:shadow-[0_0_30px_rgba(29,142,255,0.4)] transition-all font-headline font-bold disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin"></span>
                        Extracting...
                      </>
                    ) : (
                      'Process Intelligence'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="glass-card p-5 rounded-[24px] border border-white/5 flex items-center gap-4 group hover:border-primary/30 transition-all">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">database</span>
          </div>
          <div>
            <p className="text-xl font-mono font-bold text-white tracking-tight">2.4M+</p>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5 opacity-60">Jobs Indexed</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-[24px] border border-white/5 flex items-center gap-4 group hover:border-[#4ade80]/30 transition-all">
          <div className="w-12 h-12 bg-[#4ade80]/10 rounded-xl flex items-center justify-center border border-[#4ade80]/20 group-hover:bg-[#4ade80]/20 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[#4ade80] text-xl">verified</span>
          </div>
          <div>
            <p className="text-xl font-mono font-bold text-white tracking-tight">98%</p>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5 opacity-60">Parsing Accuracy</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-[24px] border border-white/5 flex items-center gap-4 group hover:border-[#be76ff]/30 transition-all">
          <div className="w-12 h-12 bg-[#be76ff]/10 rounded-xl flex items-center justify-center border border-[#be76ff]/20 group-hover:bg-[#be76ff]/20 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[#be76ff] text-xl">lock</span>
          </div>
          <div>
            <p className="text-xl font-mono font-bold text-white tracking-tight">GDPR</p>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5 opacity-60">Compliant</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 w-full max-w-7xl pt-8 border-t border-white/5 flex flex-col md:row flex-row justify-between items-center gap-8 opacity-40 text-[10px] font-mono tracking-widest uppercase">
        <div className="flex gap-8">
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Security</Link>
        </div>
        <div className="text-slate-500">
          © 2024 JobMatcher AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
