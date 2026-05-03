import React from 'react';

const InitialLoader = () => {
    return (
        <div className="fixed inset-0 bg-[#04151e] z-[100] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background geometric grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#1D8EFF 1px, transparent 1px), linear-gradient(90deg, #1D8EFF 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            
            <div className="relative">
                {/* Logo or Main Visual */}
                <div className="w-24 h-24 mb-12 relative flex items-center justify-center">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                    {/* Ring 2 */}
                    <div className="absolute inset-2 border-2 border-t-primary border-transparent rounded-full animate-spin"></div>
                    {/* Core */}
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_#1D8EFF]"></div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-space text-white tracking-widest uppercase">JobMatcher AI</h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-8 bg-primary/30"></div>
                        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] animate-pulse">
                            Initializing Systems
                        </p>
                        <div className="h-[1px] w-8 bg-primary/30"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Version Info */}
            <div className="absolute bottom-10 left-0 right-0">
                <p className="text-[9px] font-mono text-outline/40 uppercase tracking-[0.2em]">Engine v4.1.0-STABLE • Neural Path Verified</p>
            </div>

            {/* Aesthetic Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
    );
};

export default InitialLoader;
