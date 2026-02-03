import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '1000px 100%' }} />
    </div>
  );
};
