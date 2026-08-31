import { useState, useEffect, useRef } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
  const { rootMargin = '400px', triggerOnce = true } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (triggerOnce) {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); 
        }
      } else {
        setInView(entry.isIntersecting);
      }
    }, { rootMargin });

    observer.observe(element);
    return () => observer.disconnect();
  
  }, [rootMargin, triggerOnce]);

  return { ref, inView };
}
