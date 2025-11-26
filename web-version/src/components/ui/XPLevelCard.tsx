import { motion } from 'framer-motion';
import { UserStats } from '@/utils/gamification';
import { Flame, Trophy, Star, TrendingUp } from 'lucide-react';

interface XPLevelCardProps {
  stats: UserStats;
  className?: string;
}

export function XPLevelCard({ stats, className = '' }: XPLevelCardProps) {
  const progress = stats.nextLevelXP > stats.currentLevelXP
    ? ((stats.xp - stats.currentLevelXP) / (stats.nextLevelXP - stats.currentLevelXP)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 border border-primary/30 rounded-2xl p-6 shadow-xl ${className}`}
    >
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {stats.level}
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">Level {stats.level}</h3>
            <p className="text-sm text-base-content/70">Impulse Master</p>
          </div>
        </div>
        
        {/* Streak */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-warning mb-1">
            <Flame className="w-5 h-5 fill-warning" />
            <span className="text-xl font-bold">{stats.streak}</span>
          </div>
          <p className="text-xs text-base-content/60">Day Streak</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-base-content/70 mb-2">
          <span>{stats.xp - stats.currentLevelXP} XP</span>
          <span>{stats.nextLevelXP - stats.currentLevelXP} XP to next level</span>
        </div>
        <div className="w-full bg-base-300/30 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-base-300/30">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-lg font-bold">{stats.totalSkipped}</span>
          </div>
          <p className="text-xs text-base-content/60">Skipped</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-success mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-lg font-bold">{stats.longestStreak}</span>
          </div>
          <p className="text-xs text-base-content/60">Best Streak</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent mb-1">
            {stats.xp.toLocaleString()}
          </div>
          <p className="text-xs text-base-content/60">Total XP</p>
        </div>
      </div>
    </motion.div>
  );
}

