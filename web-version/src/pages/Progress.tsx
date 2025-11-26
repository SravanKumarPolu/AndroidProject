import { useMemo, useState, useEffect } from 'react';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { XPLevelCard } from '@/components/ui/XPLevelCard';
import { BadgesCard } from '@/components/BadgesCard';
import { getUserStats } from '@/utils/gamification';
import { formatCurrency } from '@/utils/format';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target, Clock, Moon, Calendar } from 'lucide-react';
import { Confetti } from '@/components/Confetti';
import { Impulse } from '@/types/impulse';

// Get level name based on level number
function getLevelName(level: number): string {
  if (level <= 3) return 'Impulse Beginner';
  if (level <= 7) return 'Impulse Warrior';
  return 'Impulse Master';
}

// Calculate XP earned this week
function calculateXPThisWeek(impulses: Impulse[]): number {
  const now = Date.now();
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  const weekImpulses = impulses.filter(imp => imp.createdAt >= weekAgo);
  
  let xp = 0;
  const skippedCount = weekImpulses.filter(
    (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
  ).length;
  xp += skippedCount * 50; // XP_PER_SKIP
  
  // Calculate streak for the week
  const skippedImpulses = weekImpulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .map((imp) => imp.decisionAt || imp.createdAt)
    .sort((a, b) => b - a);
  
  if (skippedImpulses.length > 0) {
    const daysWithSkips = new Set<number>();
    skippedImpulses.forEach((timestamp) => {
      const date = new Date(timestamp);
      const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      daysWithSkips.add(dayKey);
    });
    
    const sortedDays = Array.from(daysWithSkips).sort((a, b) => b - a);
    if (sortedDays.length > 0) {
      let streak = 1;
      const today = new Date();
      const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      
      let currentDay = sortedDays[0];
      if (currentDay === todayKey) {
        for (let i = 1; i < sortedDays.length; i++) {
          const expectedDay = currentDay - (24 * 60 * 60 * 1000);
          if (sortedDays[i] === expectedDay) {
            streak++;
            currentDay = sortedDays[i];
          } else {
            break;
          }
        }
      }
      xp += streak * 25; // XP_PER_DAY_STREAK
    }
  }
  
  return xp;
}

// Get most controlled month
function getMostControlledMonth(impulses: Impulse[]): { month: string; year: number; skippedRate: number } | null {
  if (impulses.length === 0) return null;
  
  const monthMap = new Map<string, { total: number; skipped: number }>();
  
  impulses.forEach((imp) => {
    const date = new Date(imp.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const current = monthMap.get(monthKey) || { total: 0, skipped: 0 };
    current.total++;
    if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
      current.skipped++;
    }
    monthMap.set(monthKey, current);
  });
  
  let bestMonth: { month: string; year: number; skippedRate: number } | null = null;
  let bestRate = 0;
  
  monthMap.forEach((data, key) => {
    const rate = data.total > 0 ? data.skipped / data.total : 0;
    if (rate > bestRate) {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month);
      bestMonth = {
        month: date.toLocaleDateString('en-US', { month: 'long' }),
        year: year,
        skippedRate: rate,
      };
      bestRate = rate;
    }
  });
  
  return bestMonth;
}

// Calculate specific achievements
function calculateAchievements(impulses: Impulse[]) {
  const achievements = {
    cooldown30min: 0,
    lateNightSkips: 0,
    consecutiveDays: 0,
  };
  
  // Count 30-min cooldowns completed
  impulses.forEach((imp) => {
    if (imp.status === 'skipped' || imp.decisionAtEnd === 'skipped') {
      const cooldownDuration = imp.cooldownEndsAt - imp.createdAt;
      const minutes = cooldownDuration / (1000 * 60);
      if (minutes >= 30) {
        achievements.cooldown30min++;
      }
    }
  });
  
  // Count late-night skips (10 PM - 2 AM)
  impulses.forEach((imp) => {
    if (imp.decisionAtEnd === 'skipped' || imp.status === 'skipped') {
      const hour = new Date(imp.createdAt).getHours();
      if (hour >= 22 || hour < 2) {
        achievements.lateNightSkips++;
      }
    }
  });
  
  // Calculate consecutive days with skips
  const skippedImpulses = impulses
    .filter((imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped')
    .map((imp) => imp.decisionAt || imp.createdAt)
    .sort((a, b) => b - a);
  
  if (skippedImpulses.length > 0) {
    const daysWithSkips = new Set<number>();
    skippedImpulses.forEach((timestamp) => {
      const date = new Date(timestamp);
      const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      daysWithSkips.add(dayKey);
    });
    
    const sortedDays = Array.from(daysWithSkips).sort((a, b) => b - a);
    if (sortedDays.length > 0) {
      let streak = 1;
      const today = new Date();
      const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      
      let currentDay = sortedDays[0];
      if (currentDay === todayKey) {
        for (let i = 1; i < sortedDays.length; i++) {
          const expectedDay = currentDay - (24 * 60 * 60 * 1000);
          if (sortedDays[i] === expectedDay) {
            streak++;
            currentDay = sortedDays[i];
          } else {
            break;
          }
        }
      }
      achievements.consecutiveDays = streak;
    }
  }
  
  return achievements;
}

export function Progress() {
  const { impulses, goals } = useImpulseStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [levelChanged, setLevelChanged] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const userStats = useMemo(() => getUserStats(impulses), [impulses]);
  const xpThisWeek = useMemo(() => calculateXPThisWeek(impulses), [impulses]);
  const mostControlledMonth = useMemo(() => getMostControlledMonth(impulses), [impulses]);
  const achievements = useMemo(() => calculateAchievements(impulses), [impulses]);

  const totalSaved = impulses
    .filter((i) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
    .reduce((sum, i) => sum + i.price, 0);

  // Detect XP gain for animation
  const [previousXP, setPreviousXP] = useState<number | null>(null);
  useEffect(() => {
    if (previousXP === null) {
      // Initialize on first render
      setPreviousXP(userStats.xp);
      return;
    }
    
    if (userStats.xp > previousXP) {
      const gained = userStats.xp - previousXP;
      setXpGained(gained);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setXpGained(0);
      }, 3000);
    }
    setPreviousXP(userStats.xp);
  }, [userStats.xp, previousXP]);

  // Detect level change
  useEffect(() => {
    if (previousLevel !== null && userStats.level > previousLevel) {
      setLevelChanged(true);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setTimeout(() => setLevelChanged(false), 1000);
      }, 3000);
    }
    setPreviousLevel(userStats.level);
  }, [userStats.level, previousLevel]);

  const levelName = getLevelName(userStats.level);

  return (
    <div className="min-h-screen p-4 pb-24 md:pb-4">
      <Confetti trigger={showConfetti} />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="title-xl mb-2">Progress</h1>
          <p className="body-md text-base-content/70">Streaks, XP, levels, and badges</p>
        </motion.div>

        {/* Streak Section - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-warning/20 via-warning/10 to-error/10 border-warning/30">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      filter: ['drop-shadow(0 0 0px rgba(251, 146, 60, 0))', 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.8))', 'drop-shadow(0 0 0px rgba(251, 146, 60, 0))'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Flame className="w-12 h-12 text-warning fill-warning" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-base-content/70 mb-1">Current streak</p>
                    <p className="text-5xl font-bold tabular-nums text-warning">{userStats.streak}</p>
                    <p className="text-base text-base-content/70 mt-1">days</p>
                  </div>
                </div>
                <p className="text-sm text-base-content/60 mt-2">
                  Days without random unplanned impulse buying.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* XP & Level Card with Level Name */}
        {impulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={levelChanged ? {
                boxShadow: ['0 0 0px rgba(99, 102, 241, 0)', '0 0 30px rgba(99, 102, 241, 0.6)', '0 0 0px rgba(99, 102, 241, 0)'],
              } : {}}
              transition={{ duration: 1.5 }}
            >
            <XPLevelCard
              stats={userStats}
              levelName={levelName}
              xpThisWeek={xpThisWeek}
              xpGained={xpGained}
            />
            </motion.div>
          </motion.div>
        )}

        {/* Specific Achievement Cards */}
        {impulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-base-200/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">30-Min Cooldown</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">{achievements.cooldown30min}x</p>
                  <p className="text-xs text-base-content/60 mt-1">Completed</p>
                </div>
                
                <div className="p-4 bg-base-200/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-secondary" />
                    <h3 className="font-semibold">Late-Night Skips</h3>
                  </div>
                  <p className="text-2xl font-bold text-secondary">{achievements.lateNightSkips}</p>
                  <p className="text-xs text-base-content/60 mt-1">Times</p>
                </div>
                
                <div className="p-4 bg-base-200/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold">Consecutive Days</h3>
                  </div>
                  <p className="text-2xl font-bold text-warning">{achievements.consecutiveDays}</p>
                  <p className="text-xs text-base-content/60 mt-1">Days in a row</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <Flame className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold tabular-nums">{userStats.streak}</div>
              <div className="text-xs text-base-content/70">Day Streak</div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold tabular-nums">{userStats.longestStreak}</div>
              <div className="text-xs text-base-content/70">Best Streak</div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold tabular-nums">{userStats.totalSkipped}</div>
              <div className="text-xs text-base-content/70">Skipped</div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <Target className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalSaved)}</div>
              <div className="text-xs text-base-content/70">Saved</div>
            </Card>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h2 className="title-lg mb-4">Milestones</h2>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-success" />
                  <h3 className="font-semibold">Total Saved</h3>
                </div>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalSaved)}</p>
                <p className="text-xs text-base-content/60 mt-1">(estimated)</p>
              </div>
              
              {mostControlledMonth && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Most Controlled Month</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {mostControlledMonth.month} {mostControlledMonth.year}
                  </p>
                  <p className="text-xs text-base-content/60 mt-1">
                    {(mostControlledMonth.skippedRate * 100).toFixed(0)}% skip rate
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Badges */}
        {impulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BadgesCard />
          </motion.div>
        )}

        {/* Goals Progress */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <h2 className="title-lg mb-4">Savings Goals</h2>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = Math.min(100, (totalSaved / goal.targetAmount) * 100);
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-base-content/70">{goal.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold tabular-nums">
                            {formatCurrency(totalSaved)} / {formatCurrency(goal.targetAmount)}
                          </div>
                          <div className="text-xs text-base-content/70">
                            {progress.toFixed(0)}% complete
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-base-300/30 rounded-full h-2">
                        <motion.div
                          className="h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {impulses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="title-lg mb-2">Start Your Journey</h3>
              <p className="body-md text-base-content/70 mb-4">
                Track your impulses to unlock achievements and level up!
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
