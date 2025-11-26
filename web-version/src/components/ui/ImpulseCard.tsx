import { motion } from 'framer-motion';
import { Impulse } from '@/types/impulse';
import { CategoryPill } from './CategoryPill';
import { EmotionChips } from './EmotionChips';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertCircle, Heart, Bookmark } from 'lucide-react';

interface ImpulseCardProps {
  impulse: Impulse;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  skipped: { icon: CheckCircle, color: 'text-success', label: 'Skipped' },
  bought: { icon: XCircle, color: 'text-error', label: 'Bought' },
  saved_for_later: { icon: Bookmark, color: 'text-accent', label: 'Saved for Later' },
  cooldown: { icon: Clock, color: 'text-warning', label: 'In Cooldown' },
  decision: { icon: AlertCircle, color: 'text-primary', label: 'Ready' },
  pending: { icon: Clock, color: 'text-base-content/50', label: 'Pending' },
};

export function ImpulseCard({ impulse, onClick, className = '' }: ImpulseCardProps) {
  const status = impulse.decisionAtEnd || impulse.status;
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-xl bg-base-200/30 border border-base-300/50 rounded-xl p-4
        transition-all cursor-pointer
        ${onClick ? 'hover:bg-base-200/40 hover:border-primary/30 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{impulse.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryPill category={impulse.category} size="sm" />
            <span className="font-bold text-primary text-lg">{formatCurrency(impulse.price)}</span>
            {impulse.urgeStrength && (
              <span className="badge badge-sm badge-warning">
                Urge: {impulse.urgeStrength}/10
              </span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 ${config.color} ml-2`}>
          <StatusIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {impulse.emotionAtImpulse && (
          <EmotionChips emotion={impulse.emotionAtImpulse} size="sm" showLabel={false} />
        )}
        <span className="text-xs text-base-content/60">
          {format(new Date(impulse.createdAt), 'MMM d, yyyy')}
        </span>
        {impulse.regretScore !== null && impulse.regretScore !== undefined && (
          <div className="flex items-center gap-1">
            <Heart className={`w-3 h-3 ${
              impulse.regretScore < 30 ? 'text-success' :
              impulse.regretScore < 60 ? 'text-warning' :
              'text-error'
            }`} />
            <span className={`text-xs ${
              impulse.regretScore < 30 ? 'text-success' :
              impulse.regretScore < 60 ? 'text-warning' :
              'text-error'
            }`}>
              Regret: {impulse.regretScore}
            </span>
          </div>
        )}
      </div>

      {/* Reason */}
      {impulse.reason && (
        <div className="pt-3 border-t border-base-300/30">
          <p className="text-xs text-base-content/60 mb-1">Why you wanted this:</p>
          <p className="text-sm text-base-content/80 italic line-clamp-2">
            "{impulse.reason}"
          </p>
        </div>
      )}

      {/* Notes */}
      {impulse.notesAfterPurchase && (
        <div className="pt-3 border-t border-base-300/30">
          <p className="text-xs text-base-content/60 mb-1">After purchase:</p>
          <p className="text-sm text-base-content/70 italic line-clamp-2">
            "{impulse.notesAfterPurchase}"
          </p>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-base-300/30">
        <span className={`badge badge-sm capitalize ${
          status === 'skipped' ? 'badge-success' :
          status === 'bought' ? 'badge-error' :
          status === 'saved_for_later' ? 'badge-accent' :
          status === 'cooldown' ? 'badge-warning' :
          status === 'decision' ? 'badge-primary' :
          'badge-ghost'
        }`}>
          {config.label}
        </span>
      </div>
    </motion.div>
  );
}

