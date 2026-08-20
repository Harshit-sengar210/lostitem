'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hoverLift?: boolean;
  glass?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = true,
  glass = false,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -4, boxShadow: '0 12px 30px -10px rgba(0,0,0,0.08)' } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-colors
        ${glass ? 'bg-white/85 backdrop-blur-md border-white/40' : ''}
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
