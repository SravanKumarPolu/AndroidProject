import { ImpulseCategory } from '@/types/impulse';
import { motion } from 'framer-motion';

interface CategoryPillProps {
  category: ImpulseCategory;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const categoryLabels: Record<ImpulseCategory, string> = {
  food: '🍔 Food',
  shopping: '🛍️ Shopping',
  entertainment: '🎬 Entertainment',
  subscription: '📱 Subscription',
  gadget: '💻 Gadget',
  clothing: '👕 Clothing',
  other: '📦 Other',
};

const categoryColors: Record<ImpulseCategory, string> = {
  food: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  shopping: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
  entertainment: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  subscription: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  gadget: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
  clothing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
  other: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
};

export function CategoryPill({ category, selected = false, onClick, size = 'md' }: CategoryPillProps) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClasses = `backdrop-blur-xl border rounded-full font-medium transition-all ${
    categoryColors[category]
  } ${sizeClasses[size]}`;

  const selectedClasses = selected
    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-base-100 scale-105'
    : '';

  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-105' : '';

  const content = (
    <span className={`${baseClasses} ${selectedClasses} ${interactiveClasses}`}>
      {categoryLabels[category]}
    </span>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

