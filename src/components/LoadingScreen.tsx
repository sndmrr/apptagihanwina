import React, { useEffect, useState } from 'react';
import syakirLogo from '@/assets/syakir-logo.png';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 6.67;
      });
    }, 100);
    const loadingTimer = setTimeout(() => onLoadingComplete(), 1500);
    return () => { clearInterval(progressInterval); clearTimeout(loadingTimer); };
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 animate-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-3/4 w-40 h-40 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      
      <div className="text-center relative z-10 glass rounded-3xl p-12 max-w-md mx-4">
        <div className="mb-8">
          <div className="relative flex justify-center">
            <div className="relative">
              <img src={syakirLogo} alt="Syakir Digital Logo" className="h-24 w-auto animate-pulse" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-2xl animate-pulse" style={{ animationDuration: '2s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="text-responsive-lg font-orbitron font-black bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent animate-bounce-in">
          Syakir Digital
        </div>
        
        <div className="mt-4 text-white/80 text-sm font-medium animate-slide-up">
          📡 Memuat sistem manajemen...
        </div>
        
        <div className="mt-8 w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/10">
          <div className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        <div className="mt-3 text-white/60 text-xs font-mono">{Math.round(progress)}%</div>
        
        <div className="mt-6 flex justify-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg shadow-green-400/50"></div>
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce shadow-lg shadow-teal-400/50" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};
