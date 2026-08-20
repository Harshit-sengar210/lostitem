'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const getShapeClass = () => {
    switch (variant) {
      case 'text':
        return 'rounded h-3 w-3/4';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-2xl';
    }
  };

  const customStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`shimmer bg-slate-200 ${getShapeClass()} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
      <Skeleton variant="rectangular" className="w-full h-40" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="text" className="w-3/4 h-6" />
        <Skeleton variant="text" className="w-1/2 h-4" />
      </div>
      <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-4">
        <div className="flex gap-2 items-center">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={80} className="h-3" />
        </div>
        <Skeleton variant="rectangular" width={70} height={28} className="rounded-lg" />
      </div>
    </div>
  );
};
