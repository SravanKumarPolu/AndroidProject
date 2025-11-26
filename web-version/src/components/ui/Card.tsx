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
        whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

