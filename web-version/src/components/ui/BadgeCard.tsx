import { motion } from 'framer-motion';
import { Badge } from '@/utils/badges';
import { Trophy, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

function getRequirementText(badgeId: string): string {
  const requirements: Record<string, string> = {
    '30min-hold': 'Complete a 30-minute cooldown',
    '1hour-hold': 'Complete a 1-hour cooldown',
    '24hour-hold': 'Complete a 24-hour cooldown',
    '3day-streak': 'Skip impulses for 3 consecutive days',
    '7day-streak': 'Skip impulses for 7 consecutive days',
    '30day-streak': 'Skip impulses for 30 consecutive days',
    'first-skip': 'Skip your first impulse',
    '10-skips': 'Skip 10 impulses',
    '50-skips': 'Skip 50 impulses',
    '100-skips': 'Skip 100 impulses',
    'save-100': 'Save ₹100 by skipping',
    'save-1000': 'Save ₹1,000 by skipping',
    'save-5000': 'Save ₹5,000 by skipping',
  };
  return requirements[badgeId] || 'Complete the requirement';
}

interface BadgeCardProps {
  badge: Badge;
  className?: string;
  onUnlock?: () => void;
}

export function BadgeCard({ badge, className = '', onUnlock }: BadgeCardProps) {
  const isUnlocked = badge.unlockedAt !== null;
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked && badge.unlockedAt) {
      // Check if badge was just unlocked (within last 5 seconds)
      const timeSinceUnlock = Date.now() - badge.unlockedAt;
      if (timeSinceUnlock < 5000) {
        setJustUnlocked(true);
        if (onUnlock) onUnlock();
        setTimeout(() => setJustUnlocked(false), 2000);
      }
    }
  }, [isUnlocked, badge.unlockedAt, onUnlock]);

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05, y: -2 } : {}}
      initial={isUnlocked ? { scale: 0, opacity: 0 } : {}}
      animate={isUnlocked ? { 
        scale: justUnlocked ? [0, 1.2, 1] : 1, 
        opacity: 1 
      } : {}}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 25,
        delay: isUnlocked ? 0.1 : 0
      }}
      className={`
        relative backdrop-blur-xl border rounded-xl p-4 transition-all
        ${isUnlocked
          ? 'bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 border-primary/30 shadow-lg'
          : 'bg-base-200/20 border-base-300/30 opacity-60'
        }
        ${className}
      `}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Lock className="w-6 h-6 text-base-content/40" />
        </div>
      )}
      
      <div className={`flex items-center gap-3 ${isUnlocked ? '' : 'blur-sm'}`}>
        <div className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>
          {badge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm ${isUnlocked ? 'text-base-content' : 'text-base-content/50'}`}>
            {badge.name}
          </h3>
          <p className={`text-xs mt-1 ${isUnlocked ? 'text-base-content/70' : 'text-base-content/40'}`}>
            {badge.description}
          </p>
          {!isUnlocked && (
            <p className="text-xs text-base-content/50 mt-1 italic">
              {getRequirementText(badge.id)}
            </p>
          )}
          {isUnlocked && badge.unlockedAt && (
            <p className="text-xs text-base-content/50 mt-1">
              Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {isUnlocked && (
          <Trophy className="w-5 h-5 text-warning flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}

