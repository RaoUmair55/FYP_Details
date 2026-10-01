import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-lg transition-colors duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle ambient glass reflection highlight */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -inset-px opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/5 rounded-2xl" 
      />
      {children}
    </motion.div>
  );
};
