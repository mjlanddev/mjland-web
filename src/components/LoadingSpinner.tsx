import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="48" 
        height="48" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="text-white"
      >
        <rect width="6" height="14" x="1" y="4" fill="currentColor">
          <animate id="svgSpinnersBarsFade0" fill="freeze" attributeName="opacity" begin="0;svgSpinnersBarsFade1.end-0.25s" dur="0.75s" values="1;.2"/>
        </rect>
        <rect width="6" height="14" x="9" y="4" fill="currentColor" opacity=".4">
          <animate fill="freeze" attributeName="opacity" begin="svgSpinnersBarsFade0.begin+0.15s" dur="0.75s" values="1;.2"/>
        </rect>
        <rect width="6" height="14" x="17" y="4" fill="currentColor" opacity=".3">
          <animate id="svgSpinnersBarsFade1" fill="freeze" attributeName="opacity" begin="svgSpinnersBarsFade0.begin+0.3s" dur="0.75s" values="1;.2"/>
        </rect>
      </svg>
    </div>
  );
};
