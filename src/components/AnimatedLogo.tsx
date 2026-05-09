import React from 'react';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AnimatedLogo = ({ size = 'md', className = '' }: AnimatedLogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#tg1)" strokeWidth="2" strokeDasharray="10 5" className="animate-spin" style={{ animationDuration: '8s' }} />
        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#tg2)" strokeWidth="3" className="animate-pulse" />
        <circle cx="50" cy="50" r="25" fill="url(#tg3)" className="animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
        <g className="animate-pulse" style={{ animationDuration: '2s' }}>
          <line x1="25" y1="50" x2="35" y2="50" stroke="url(#tg4)" strokeWidth="2" />
          <line x1="65" y1="50" x2="75" y2="50" stroke="url(#tg4)" strokeWidth="2" />
          <line x1="50" y1="25" x2="50" y2="35" stroke="url(#tg4)" strokeWidth="2" />
          <line x1="50" y1="65" x2="50" y2="75" stroke="url(#tg4)" strokeWidth="2" />
        </g>
        <text x="50" y="58" textAnchor="middle" className="text-xl font-bold fill-white animate-pulse" style={{ fontFamily: 'Orbitron, sans-serif' }}>S</text>
        <circle cx="30" cy="30" r="2" fill="url(#tg5)" className="animate-bounce" />
        <circle cx="70" cy="30" r="2" fill="url(#tg5)" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
        <circle cx="30" cy="70" r="2" fill="url(#tg5)" className="animate-bounce" style={{ animationDelay: '1s' }} />
        <circle cx="70" cy="70" r="2" fill="url(#tg5)" className="animate-bounce" style={{ animationDelay: '1.5s' }} />
        <defs>
          <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="tg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <radialGradient id="tg3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>
          <linearGradient id="tg4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="tg5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
