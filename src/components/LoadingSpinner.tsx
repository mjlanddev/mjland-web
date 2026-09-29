import React from 'react';
import { Trace } from 'loading-dev';

export const LoadingSpinner = ({ size = 44, className = "" }: { size?: number; className?: string }) => {
  return (
    <div className={`min-h-[60vh] flex items-center justify-center text-white ${className}`}>
      <Trace size={size} easing="ease-in-out" />
    </div>
  );
};
