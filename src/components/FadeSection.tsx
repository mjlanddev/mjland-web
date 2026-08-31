import React from 'react';
import { motion } from 'motion/react';

interface FadeSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'none';
  once?: boolean;
  key?: React.Key;
}

export const FadeSection: React.FC<FadeSectionProps> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  once = true,
}) => {
  const initial = {
    opacity: 0,
    x: direction === 'left' ? -24 : 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerGridProps {
  children: React.ReactNode[];
  className?: string;
  itemDelay?: number;
  startDelay?: number;
}

export const StaggerGrid = ({
  children,
  className,
  itemDelay = 0.04,
  startDelay = 0,
}: StaggerGridProps) => (
  <div className={className}>
    {React.Children.map(children, (child, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{
          duration: 0.35,
          delay: startDelay + Math.min(i * itemDelay, 0.6),
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {child}
      </motion.div>
    ))}
  </div>
);

export const PageEntrance = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);
