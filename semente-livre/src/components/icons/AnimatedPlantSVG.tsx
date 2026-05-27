import React from 'react';

export function AnimatedPlantSVG() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <style>
        {`
          @keyframes sprout {
            0% { transform: scaleY(0); }
            100% { transform: scaleY(1); }
          }
          @keyframes unfoldLeft {
            0% { transform: scale(0) rotate(-45deg); }
            70% { transform: scale(0) rotate(-45deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes unfoldRight {
            0% { transform: scale(0) rotate(45deg); }
            80% { transform: scale(0) rotate(45deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes pulseMound {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.05); }
          }
          @keyframes particleUp {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-30px) scale(0); opacity: 0; }
          }
          .stem {
            transform-origin: 100px 170px;
            animation: sprout 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .leaf-left {
            transform-origin: 100px 110px;
            animation: unfoldLeft 2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .leaf-right {
            transform-origin: 100px 80px;
            animation: unfoldRight 2.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .mound {
            transform-origin: 100px 180px;
            animation: pulseMound 3s infinite ease-in-out;
          }
          .particle {
            animation: particleUp 2s infinite ease-out;
          }
          .p1 { animation-delay: 0.5s; }
          .p2 { animation-delay: 1.2s; }
          .p3 { animation-delay: 1.8s; }
        `}
      </style>
      
      {/* Terra (Mound) */}
      <g className="mound">
        <path d="M 40 180 Q 100 150 160 180 Z" fill="#78350f" />
        <path d="M 60 180 Q 100 160 140 180 Z" fill="#92400e" />
      </g>

      {/* Magic particles representing growth */}
      <circle cx="80" cy="160" r="3" fill="#bef264" className="particle p1" />
      <circle cx="120" cy="155" r="2.5" fill="#bef264" className="particle p2" />
      <circle cx="95" cy="165" r="4" fill="#a3e635" className="particle p3" />

      {/* Caule (Stem) */}
      <path className="stem" d="M 100 170 Q 95 120 100 70" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
      
      {/* Folha Esquerda */}
      <g className="leaf-left">
        <path d="M 98 110 Q 50 80 40 110 Q 60 140 98 115 Z" fill="#4ade80" />
        <path d="M 98 110 Q 60 95 40 110 Q 60 125 98 115 Z" fill="#22c55e" />
      </g>

      {/* Folha Direita */}
      <g className="leaf-right">
        <path d="M 102 80 Q 150 50 160 80 Q 140 110 102 85 Z" fill="#22c55e" />
        <path d="M 102 80 Q 140 65 160 80 Q 140 95 102 85 Z" fill="#16a34a" />
      </g>
    </svg>
  );
}
