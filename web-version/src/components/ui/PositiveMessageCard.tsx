import { motion } from 'framer-motion';
import { PositiveMessage } from '@/utils/positiveMessages';
import { Sparkles, Heart, Trophy, Bell } from 'lucide-react';

interface PositiveMessageCardProps {
  message: PositiveMessage;
  onDismiss?: () => void;
  className?: string;
}

const typeIcons = {
  achievement: Trophy,
  encouragement: Heart,
  milestone: Sparkles,
  reminder: Bell,
};

export function PositiveMessageCard({ message, onDismiss, className = '' }: PositiveMessageCardProps) {
  const Icon = typeIcons[message.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        backdrop-blur-xl bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/10
        border border-accent/30 rounded-xl p-4 shadow-lg
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{message.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm">{message.title}</h3>
          </div>
          <p className="text-sm text-base-content/80 leading-relaxed">{message.message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-base-content/40 hover:text-base-content/70 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
}

