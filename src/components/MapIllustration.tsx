'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

interface MapIllustrationProps {
  className?: string;
  pins?: { x: number; y: number; type: 'lost' | 'found' | 'user'; name: string }[];
  riderPosition?: { x: number; y: number };
  routePath?: string;
}

export const MapIllustration: React.FC<MapIllustrationProps> = ({
  className = '',
  pins = [],
  riderPosition,
  routePath,
}) => {
  // Default pins if none provided
  const displayPins = pins.length > 0 ? pins : [
    { x: 30, y: 40, type: 'found', name: 'AirPods Pro' },
    { x: 70, y: 35, type: 'lost', name: 'Black Wallet' },
    { x: 55, y: 75, type: 'found', name: 'Keys Bunch' },
    { x: 45, y: 45, type: 'user', name: 'You' },
  ];

  return (
    <div className={`relative w-full h-full bg-[#f8fafc] overflow-hidden rounded-2xl border border-slate-100 shadow-inner ${className}`}>
      {/* Map Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'radial-gradient(circle, #4f46e5 2px, transparent 2px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Map Rivers & Parks (Stylized SVG shapes) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="none">
        {/* River */}
        <path
          d="M -20,220 C 100,210 120,380 420,350 L 420,390 L -20,390 Z"
          fill="#e0f2fe"
          opacity="0.7"
        />
        {/* Park */}
        <rect x="230" y="80" width="100" height="90" rx="16" fill="#f0fdf4" opacity="0.8" />
        <text x="280" y="130" fill="#b91c1c" className="text-[10px] font-extrabold fill-emerald-700/60 text-center select-none" textAnchor="middle">
          Swarna Park
        </text>

        {/* Major Roads */}
        <g stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
          <line x1="-20" y1="180" x2="420" y2="180" />
          <line x1="180" y1="-20" x2="180" y2="420" />
          <line x1="-20" y1="60" x2="420" y2="60" />
          <line x1="300" y1="-20" x2="300" y2="420" />
          {/* Diagonal Link */}
          <path d="M 60,60 C 100,100 120,130 180,180" />
        </g>

        {/* Road Markings (Inner dashes) */}
        <g stroke="#ffffff" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8">
          <line x1="-20" y1="180" x2="420" y2="180" />
          <line x1="180" y1="-20" x2="180" y2="420" />
          <line x1="-20" y1="60" x2="420" y2="60" />
          <line x1="300" y1="-20" x2="300" y2="420" />
        </g>

        {/* Route Line if provided (for tracking) */}
        {routePath && (
          <>
            <path
              d={routePath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.4"
            />
            <motion.path
              d={routePath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 6"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -100 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
      </svg>

      {/* Render Location Pins */}
      {displayPins.map((pin, i) => (
        <motion.div
          key={i}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          whileHover={{ scale: 1.1 }}
        >
          {pin.type === 'user' ? (
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand flex items-center justify-center text-brand shadow-sm map-pulse">
                <Navigation className="w-3.5 h-3.5 fill-current rotate-[45deg] -mt-0.5" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md bg-white ${
                pin.type === 'lost' ? 'border-indigo-500 text-brand' : 'border-emerald-500 text-emerald-600'
              }`}>
                <MapPin className="w-4 h-4 fill-current" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-20 pointer-events-none">
                {pin.name} ({pin.type === 'lost' ? 'Lost' : 'Found'})
              </div>
            </div>
          )}
        </motion.div>
      ))}

      {/* Render Rider (for tracking) */}
      {riderPosition && (
        <motion.div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 border-2 border-white rounded-full shadow-lg"
          style={{ left: `${riderPosition.x}%`, top: `${riderPosition.y}%` }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 12h-2c0-.55-.45-1-1-1h-1.5c-.55 0-1-.45-1-1V8.5c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1V10c0 .55-.45 1-1 1H9c-.55 0-1 .45-1 1H6c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1c.07 0 .13-.01.2-.02c.42 1.15 1.52 1.98 2.8 1.98s2.38-.83 2.8-1.98c.14.02.27.02.4 0c.42 1.15 1.52 1.98 2.8 1.98s2.38-.83 2.8-1.98c.07.01.13.02.2.02h1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zM9 19c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
