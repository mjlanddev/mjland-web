import React, { useState, useEffect, useRef } from 'react';
import { Image01Icon } from 'hugeicons-react';

interface PosterImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export const PosterImage: React.FC<PosterImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  referrerPolicy = "no-referrer" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoading(false);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-[#141414] border border-white/5 ${className}`}>
      {(isLoading || !src || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
          <div className="absolute inset-0 animate-pulse bg-white/5" />
          <Image01Icon className="w-8 h-8 text-white/20" />
        </div>
      )}

      {src && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`w-full h-full object-cover transition-all duration-300 ease-out ${isLoading ? 'opacity-0 blur-md' : 'opacity-100 blur-0'}`}
          referrerPolicy={referrerPolicy}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};
