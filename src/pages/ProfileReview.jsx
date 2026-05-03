import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabaseDB } from '../services/supabaseDB';
import { edgeFunctions } from '../services/edgeFunctions';

const ProfileReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Use data from upload flow if available, else fallback to JSON
    const initialData = location.state?.candidate;
    const [candidate, setCandidate] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    if (!candidate) {
        return (
            <div className="min-h-screen bg-[#020609] text-white flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-headline font-bold mb-4">No Profile Data Found</h2>
                <p className="text-slate-400 mb-8">Please upload your CV first so the AI can extract your profile.</p>
                <Link to="/upload" className="px-6 py-3 bg-primary text-black rounded-xl font-bold">Go to Upload</Link>
            </div>
        );
    }

    const handleSave = async () => {
        if (!user) {
            setError("You must be logged in to save your profile.");
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await supabaseDB.saveProfile(candidate, user.id);
            // Trigger embedding generation in the background
            try {
                await edgeFunctions.invokeEmbedCv();
            } catch (embedErr) {
                console.warn("Embedding generation failed, but profile was saved:", embedErr);
            }
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to save profile", err);
            setError(`Failed to save: ${err.message || 'Unknown database error'}. Please check your connection or data format.`);
            setIsSaving(false);
        }
    };

    const updateField = (field, value) => {
        setCandidate(prev => ({ ...prev, [field]: value }));
    };

    const updateItemInList = (listName, index, field, value) => {
        const newList = [...candidate[listName]];
        if (field === null) {
            newList[index] = value;
        } else {
            newList[index] = { ...newList[index], [field]: value };
        }
        updateField(listName, newList);
    };

    const addItemToList = (listName, defaultValue) => {
        updateField(listName, [...candidate[listName], defaultValue]);
    };

    const removeItemFromList = (listName, index) => {
        updateField(listName, candidate[listName].filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-[#020609] text-white flex flex-col items-center pt-8 pb-20 px-6 relative font-body overflow-x-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 grid-mesh opacity-10"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

            {/* Progress Stepper */}
            <div className="relative z-10 flex flex-col items-center mb-12">
                <div className="flex gap-3 mb-6">
                    <div className="w-12 h-1.5 rounded-full bg-primary/30"></div>
                    <div className="w-12 h-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(29,142,255,0.6)]"></div>
                </div>
                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-primary font-bold">Step 2 of 2: Final Review</span>
            </div>

            <div className="relative z-10 w-full max-w-4xl text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4ade80] font-bold">AI ENGINE PROCESSING COMPLETE</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-white mb-6 tracking-tight">Complete Your Profile</h1>
                <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed opacity-80">
                    We've extracted your professional details. Please verify the information below to ensure the best matches for your career goals.
                </p>
                {error && (
                    <div className="mt-4 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-xl inline-block">
                        {error}
                    </div>
                )}
            </div>

            {/* Profile Sections Container */}
            <div className="relative z-10 w-full max-w-4xl space-y-8">

                {/* Basic Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[32px] p-8 md:p-10 border border-white/5 bg-[#051117]/80 backdrop-blur-xl"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl">person</span>
                            </div>
                            <h2 className="text-xl font-headline font-bold text-white">Basic Information</h2>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 animate-pulse">Auto-saving...</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={candidate.full_name}
                                onChange={(e) => updateField('full_name', e.target.value)}
                                className="w-full bg-[#081821] border border-white/10 rounded-2xl px-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={candidate.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                className="w-full bg-[#081821] border border-white/10 rounded-2xl px-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Location</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">location_on</span>
                                <input
                                    type="text"
                                    value={candidate.location}
                                    onChange={(e) => updateField('location', e.target.value)}
                                    className="w-full bg-[#081821] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-xl">phone</span>
                                <input
                                    type="text"
                                    value={candidate.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className="w-full bg-[#081821] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Professional Summary</label>
                        <textarea
                            rows={4}
                            value={candidate.professional_summary}
                            onChange={(e) => updateField('professional_summary', e.target.value)}
                            className="w-full bg-[#081821] border border-white/10 rounded-2xl px-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all resize-none"
                        />
                    </div>
                </motion.div>

                {/* Experience & Career */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-[32px] p-8 md:p-10 border border-white/5 bg-[#051117]/80 backdrop-blur-xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Seniority Level</label>
                            <select
                                value={candidate.seniority_level}
                                onChange={(e) => updateField('seniority_level', e.target.value)}
                                className="w-full bg-[#081821] border border-white/10 rounded-2xl px-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all appearance-none"
                            >
                                <option value="junior">Junior</option>
                                <option value="mid">Mid-Level</option>
                                <option value="senior">Senior</option>
                                <option value="lead">Lead</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 ml-1">Total Years Experience</label>
                            <input
                                type="number"
                                value={candidate.years_experience}
                                onChange={(e) => updateField('years_experience', parseInt(e.target.value) || 0)}
                                className="w-full bg-[#081821] border border-white/10 rounded-2xl px-6 py-4 text-white font-body focus:border-primary/50 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">work</span>
                        </div>
                        <h2 className="text-xl font-headline font-bold text-white">Work Experience</h2>
                    </div>

                    <div className="space-y-4">
                        {candidate.experience.map((exp, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mr-4">
                                        <input
                                            type="text"
                                            value={exp.company}
                                            placeholder="Company"
                                            onChange={(e) => updateItemInList('experience', index, 'company', e.target.value)}
                                            className="bg-transparent border-b border-white/10 py-2 focus:border-primary focus:outline-none text-white font-headline font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={exp.job_title}
                                            placeholder="Role"
                                            onChange={(e) => updateItemInList('experience', index, 'job_title', e.target.value)}
                                            className="bg-transparent border-b border-white/10 py-2 focus:border-primary focus:outline-none text-white text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeItemFromList('experience', index)}
                                        className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={exp.start_date}
                                        onChange={(e) => updateItemInList('experience', index, 'start_date', e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-primary focus:border-primary focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={exp.end_date}
                                        onChange={(e) => updateItemInList('experience', index, 'end_date', e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-primary focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addItemToList('experience', { company: '', job_title: '', start_date: '', end_date: '', responsibilities: [] })}
                            className="w-full py-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-2 text-slate-500 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all group"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span className="text-xs font-headline font-bold uppercase tracking-widest">Add Experience</span>
                        </button>
                    </div>
                </motion.div>

                {/* Technical Stack & Meta */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[32px] p-8 md:p-10 border border-white/5 bg-[#051117]/80 backdrop-blur-xl"
                >
                    <div className="space-y-10">
                        {/* Skills */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                                </div>
                                <h2 className="text-xl font-headline font-bold text-white">Technical Stack</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-sm group">
                                        <input
                                            value={skill}
                                            onChange={(e) => updateItemInList('skills', index, null, e.target.value)}
                                            className="bg-transparent text-slate-300 focus:text-white focus:outline-none w-24 sm:w-auto"
                                        />
                                        <button
                                            onClick={() => removeItemFromList('skills', index)}
                                            className="material-symbols-outlined text-xs text-slate-500 hover:text-red-400"
                                        >close</button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItemToList('skills', 'New Skill')}
                                    className="px-4 py-2 border border-dashed border-white/10 rounded-xl text-sm text-slate-500 hover:border-primary/40 hover:text-primary transition-all"
                                >+ Add</button>
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-[#be76ff]/10 border border-[#be76ff]/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#be76ff] text-xl">school</span>
                                </div>
                                <h2 className="text-xl font-headline font-bold text-white">Education</h2>
                            </div>
                            <div className="space-y-4">
                                {candidate.education.map((edu, index) => (
                                    <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group">
                                        <div className="flex-1 mr-4">
                                            <input
                                                value={edu.institution}
                                                onChange={(e) => updateItemInList('education', index, 'institution', e.target.value)}
                                                className="block w-full bg-transparent text-white font-headline font-bold mb-1 focus:outline-none focus:text-primary"
                                            />
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => updateItemInList('education', index, 'degree', e.target.value)}
                                                className="block w-full bg-transparent text-sm text-slate-400 focus:outline-none focus:text-white"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeItemFromList('education', index)}
                                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItemToList('education', { institution: 'University Name', degree: 'Degree Name' })}
                                    className="w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-primary transition-all text-xs uppercase font-bold tracking-widest"
                                >Add Education</button>
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary text-xl">translate</span>
                                </div>
                                <h2 className="text-xl font-headline font-bold text-white">Languages</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {candidate.languages.map((lang, index) => (
                                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-secondary/5 border border-secondary/20 rounded-xl text-sm group">
                                        <input
                                            value={lang}
                                            onChange={(e) => updateItemInList('languages', index, null, e.target.value)}
                                            className="bg-transparent text-slate-300 focus:text-white focus:outline-none w-20"
                                        />
                                        <button
                                            onClick={() => removeItemFromList('languages', index)}
                                            className="material-symbols-outlined text-xs text-slate-500 hover:text-red-400"
                                        >close</button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItemToList('languages', 'Language')}
                                    className="px-4 py-2 border border-dashed border-white/10 rounded-xl text-sm text-slate-500 hover:border-secondary/40 hover:text-secondary transition-all"
                                >+ Add</button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Global CTA */}
                <div className="pt-8 pb-12 flex flex-col items-center gap-8">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary-container font-headline font-bold text-xl rounded-2xl hover:shadow-[0_0_60px_rgba(29,142,255,0.4)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? 'Saving & Directing...' : 'Looks good — Find My Jobs'}
                        {!isSaving && <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>}
                    </button>

                    <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-slate-500 opacity-60 text-center leading-relaxed">
                        By proceeding, you agree to JobMatcher's AI processing of your professional data.
                    </p>

                    <Link
                        to="/upload"
                        className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to Upload
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfileReview;
