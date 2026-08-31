import React, { useState, useEffect, useRef } from 'react';

import { twMerge } from 'tailwind-merge';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  className = '', 
  src,
  fallbackSrc,
  loading = 'lazy',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={error && fallbackSrc ? fallbackSrc : src}
      onLoad={(e) => {
        setLoaded(true);
        if (props.onLoad) props.onLoad(e);
      }}
      onError={(e) => {
        setError(true);
        if (props.onError) props.onError(e);
      }}
      className={twMerge(
        'transition-opacity duration-300 ease-out',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
};
