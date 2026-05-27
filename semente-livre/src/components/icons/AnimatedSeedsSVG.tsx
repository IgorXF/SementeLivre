import React from 'react';

export function AnimatedSeedsSVG() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <style>
        {`
          @keyframes floatMain {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(4deg); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.15); }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes seedScatter1 {
            0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 0; }
            15% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translate(-60px, -80px) scale(0) rotate(-120deg); opacity: 0; }
          }
          @keyframes seedScatter2 {
            0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0; }
            15% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translate(70px, -70px) scale(0) rotate(150deg); opacity: 0; }
          }
          @keyframes seedScatter3 {
            0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
            15% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translate(-30px, -110px) scale(0) rotate(-180deg); opacity: 0; }
          }
          @keyframes seedScatter4 {
            0% { transform: translate(0, 0) scale(0.55) rotate(0deg); opacity: 0; }
            15% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translate(40px, -120px) scale(0) rotate(90deg); opacity: 0; }
          }
          
          .main-seed {
            transform-origin: 100px 100px;
            animation: floatMain 5s ease-in-out infinite;
          }
          .glow {
            transform-origin: 100px 100px;
            animation: glowPulse 4s ease-in-out infinite;
          }
          .orbit-ring {
            transform-origin: 100px 100px;
            animation: orbit 12s linear infinite;
          }
          .orbit-ring-reverse {
            transform-origin: 100px 100px;
            animation: orbit 18s linear infinite reverse;
          }
          
          .scatter-1 { transform-origin: 100px 100px; animation: seedScatter1 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
          .scatter-2 { transform-origin: 100px 100px; animation: seedScatter2 4.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 1.2s; }
          .scatter-3 { transform-origin: 100px 100px; animation: seedScatter3 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 2.5s; }
          .scatter-4 { transform-origin: 100px 100px; animation: seedScatter4 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite 0.7s; }
        `}
      </style>
      
      <defs>
        <linearGradient id="seedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="1" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura background */}
      <circle className="glow" cx="100" cy="110" r="70" fill="url(#glowGrad)" />

      {/* Magical orbiting rings (representing wind/energy) */}
      <g className="orbit-ring">
        <path d="M 40 110 A 60 60 0 1 1 160 110" fill="none" stroke="#dcfce7" strokeWidth="2" strokeDasharray="8 16" strokeLinecap="round" opacity="0.7" />
        <circle cx="160" cy="110" r="3" fill="#bef264" />
      </g>
      <g className="orbit-ring-reverse">
        <path d="M 100 170 A 60 60 0 1 1 100 50" fill="none" stroke="#dcfce7" strokeWidth="1.5" strokeDasharray="12 24" strokeLinecap="round" opacity="0.5" />
        <circle cx="100" cy="50" r="2.5" fill="#86efac" />
      </g>

      {/* Main Central Seed (Teardrop shape) */}
      <g className="main-seed">
        <path d="M 100 150 C 130 150, 130 90, 100 45 C 70 90, 70 150, 100 150 Z" fill="url(#seedGrad)" />
        <path d="M 100 150 C 115 150, 115 90, 100 45 C 100 45, 100 150, 100 150 Z" fill="#22c55e" opacity="0.4" />
      </g>

      {/* Small scattering seeds */}
      <g className="scatter-1">
        <path d="M 100 110 C 110 110, 110 90, 100 70 C 90 90, 90 110, 100 110 Z" fill="#4ade80" />
      </g>
      <g className="scatter-2">
        <path d="M 100 110 C 108 110, 108 94, 100 78 C 92 94, 92 110, 100 110 Z" fill="#86efac" />
      </g>
      <g className="scatter-3">
        <path d="M 100 110 C 106 110, 106 96, 100 82 C 94 96, 94 110, 100 110 Z" fill="#22c55e" />
      </g>
      <g className="scatter-4">
        <path d="M 100 110 C 107 110, 107 92, 100 75 C 93 92, 93 110, 100 110 Z" fill="#bef264" />
      </g>
    </svg>
  );
}
