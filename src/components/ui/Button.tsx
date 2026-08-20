'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isSuccess?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    if (disabled || isLoading) {
      return 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed';
    }
    if (isSuccess) {
      return 'bg-emerald-600 text-white hover:bg-emerald-700';
    }

    switch (variant) {
      case 'primary':
        return 'bg-brand text-white hover:bg-brand-hover shadow-sm shadow-indigo-200/50 hover:shadow-md';
      case 'secondary':
        return 'bg-brand-light text-brand hover:bg-brand/10';
      case 'outline':
        return 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200';
      case 'ghost':
        return 'text-slate-600 hover:bg-slate-50 hover:text-slate-950';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-semibold rounded-lg';
      case 'md':
        return 'px-4.5 py-2.5 text-sm font-semibold rounded-xl';
      case 'lg':
        return 'px-6 py-3.5 text-base font-semibold rounded-2xl';
    }
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {isSuccess && !isLoading && <Check className="w-4 h-4 text-white" />}
      <span className={isLoading ? 'opacity-80' : ''}>
        {isSuccess && !isLoading ? 'Done' : children}
      </span>
    </motion.button>
  );
};
