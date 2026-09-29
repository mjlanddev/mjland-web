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
}) => {
  return (
    <div className={className}>
      {children}
    </div>
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
}: StaggerGridProps) => (
  <div className={className}>
    {children}
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
