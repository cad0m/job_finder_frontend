import React from 'react';

const LoadingState = ({ message = "Syncing with Intelligence Engine..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[800px] w-full py-20">
      <div className="relative mb-8">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
        {/* Spinner */}
        <div className="relative w-16 h-16 rounded-full border-2 border-primary/10 border-t-primary animate-spin"></div>
        {/* Inner static point */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-xs font-mono text-outline uppercase tracking-[0.3em] animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
