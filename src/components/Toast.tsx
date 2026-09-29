import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { CheckmarkCircle02Icon as CheckIcon } from 'hugeicons-react';

export const Toast = () => {
  useEffect(() => {
    const handleToast = (e: any) => {
      const text = typeof e.detail === 'string' ? e.detail : e.detail?.text || 'Action confirmed';
      toast.custom((_id) => (
        <div className="liquid-dock rounded-full px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-semibold text-white shadow-[0_24px_60px_rgba(0,0,0,0.85)] border border-white/15 ring-1 ring-inset ring-white/10 flex items-center gap-3 backdrop-blur-3xl">
          <div className="w-6 h-6 rounded-full glass-debossed flex items-center justify-center shrink-0">
            <CheckIcon className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="truncate">{text}</span>
        </div>
      ), { duration: 3200 });
    };

    window.addEventListener('showToast', handleToast as EventListener);
    return () => window.removeEventListener('showToast', handleToast as EventListener);
  }, []);

  return (
    <Toaster
      position="top-center"
      offset="24px"
      mobileOffset={{ top: '16px' }}
      swipeDirections={['top', 'left', 'right']}
    />
  );
};
