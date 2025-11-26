import { motion } from 'framer-motion';
import { ImpulseCategory } from '@/types/impulse';
import { formatCurrency } from '@/utils/format';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CategoryCardProps {
  category: ImpulseCategory;
  totalSpent: number;
  totalSaved: number;
  impulseCount: number;
  skipRate: number;
  trend?: number; // Percentage change from previous period
  onClick?: () => void;
  className?: string;
}

const categoryConfig: Record<ImpulseCategory, {
  emoji: string;
  label: string;
  gradient: string;
  bgGradient: string;
}> = {
  food: {
    emoji: '🍔',
    label: 'Food',
    gradient: 'from-orange-400 to-orange-600',
    bgGradient: 'from-orange-500/20 to-orange-600/10',
  },
  shopping: {
    emoji: '🛍️',
    label: 'Shopping',
    gradient: 'from-pink-400 to-pink-600',
    bgGradient: 'from-pink-500/20 to-pink-600/10',
  },
  entertainment: {
    emoji: '🎬',
    label: 'Entertainment',
    gradient: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-500/20 to-purple-600/10',
  },
  subscription: {
    emoji: '📱',
    label: 'Subscription',
    gradient: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-500/20 to-blue-600/10',
  },
  gadget: {
    emoji: '💻',
    label: 'Gadget',
    gradient: 'from-cyan-400 to-cyan-600',
    bgGradient: 'from-cyan-500/20 to-cyan-600/10',
  },
  clothing: {
    emoji: '👕',
    label: 'Clothing',
    gradient: 'from-indigo-400 to-indigo-600',
    bgGradient: 'from-indigo-500/20 to-indigo-600/10',
  },
  other: {
    emoji: '📦',
    label: 'Other',
    gradient: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-500/20 to-gray-600/10',
  },
};

export function CategoryCard({
  category,
  totalSpent,
  totalSaved,
  impulseCount,
  skipRate,
  trend,
  onClick,
  className = '',
}: CategoryCardProps) {
  const config = categoryConfig[category];
  const netAmount = totalSaved - totalSpent;
  const isPositive = netAmount > 0;

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1, y: onClick ? -2 : 0 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${config.bgGradient}
        backdrop-blur-xl border border-base-300/30
        p-5 cursor-pointer transition-all
        ${onClick ? 'hover:border-primary-400/50 hover:shadow-lg' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 pointer-events-none`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`text-3xl bg-gradient-to-br ${config.gradient} bg-clip-text`}>
              {config.emoji}
            </div>
            <div>
              <h3 className="font-bold text-lg">{config.label}</h3>
              <p className="text-xs text-base-content/60">{impulseCount} impulses</p>
            </div>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              trend > 0 ? 'text-error' : trend < 0 ? 'text-success' : 'text-base-content/70'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span>{Math.abs(trend).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-base-200/30 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-base-content/60 mb-1">Spent</p>
            <p className="text-lg font-bold text-error">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-base-200/30 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-base-content/60 mb-1">Saved</p>
            <p className="text-lg font-bold text-success">{formatCurrency(totalSaved)}</p>
          </div>
        </div>

        {/* Net Amount & Skip Rate */}
        <div className="flex items-center justify-between pt-3 border-t border-base-300/20">
          <div>
            <p className="text-xs text-base-content/60 mb-1">Net</p>
            <p className={`text-xl font-bold ${
              isPositive ? 'text-success' : 'text-error'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(netAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-base-content/60 mb-1">Skip Rate</p>
            <p className="text-xl font-bold text-primary">
              {(skipRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-base-300/30 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${skipRate * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

