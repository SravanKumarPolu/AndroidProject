import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseClasses = 'backdrop-blur-xl bg-base-200/30 border border-base-300/50 rounded-2xl p-6 shadow-xl';
  const interactiveClasses = onClick ? 'cursor-pointer hover:bg-base-200/40 transition-all' : '';

  const content = (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`}>
      {children}
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

