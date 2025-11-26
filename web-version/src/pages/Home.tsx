import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GlassButton } from '@/components/ui/GlassButton';
import { EnhancedCooldownTimer } from '@/components/ui/EnhancedCooldownTimer';
import { formatCurrency } from '@/utils/format';
import { formatTimeAgo } from '@/utils/timeAgo';
import { getUserStats } from '@/utils/gamification';
import { Impulse, ImpulseCategory } from '@/types/impulse';
import { Flame, Plus, ShoppingBag, Utensils, Film, BookOpen, Smartphone, Shirt, Package } from 'lucide-react';
import { useImpulseStore } from '@/store/impulseStore';

const categoryIcons: Record<ImpulseCategory, React.ReactNode> = {
  food: <Utensils className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  entertainment: <Film className="w-5 h-5" />,
  subscription: <BookOpen className="w-5 h-5" />,
  gadget: <Smartphone className="w-5 h-5" />,
  clothing: <Shirt className="w-5 h-5" />,
  other: <Package className="w-5 h-5" />,
};


function getStatusLabel(impulse: Impulse): string {
  if (impulse.status === 'skipped' || impulse.decisionAtEnd === 'skipped') return 'Resisted';
  if (impulse.status === 'bought' || impulse.decisionAtEnd === 'bought') return 'Bought';
  if (impulse.status === 'cooldown') return 'Cooling down';
  if (impulse.status === 'decision') return 'Ready to decide';
  if (impulse.decisionAtEnd === 'saved_for_later') return 'Saved for later';
  return 'Pending';
}

function getStatusColor(status: string): string {
  if (status === 'Resisted') return 'badge-success';
  if (status === 'Bought') return 'badge-error';
  if (status === 'Cooling down') return 'badge-warning';
  if (status === 'Ready to decide') return 'badge-primary';
  if (status === 'Saved for later') return 'badge-info';
  return 'badge-ghost';
}

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { impulses, loadFromDB } = useImpulseStore();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [prevStreak, setPrevStreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if we should open new impulse sheet from notification
  const shouldOpenNewImpulse = searchParams.get('openNewImpulse') === 'true';
  
  useEffect(() => {
    if (shouldOpenNewImpulse) {
      // Remove the parameter and navigate to new impulse
      setSearchParams({});
      navigate('/new-impulse');
    }
  }, [shouldOpenNewImpulse, navigate, setSearchParams]);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update current time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate gamification stats
  const userStats = useMemo(() => getUserStats(impulses), [impulses]);

  // Track streak changes for bounce animation
  useEffect(() => {
    if (userStats.streak > prevStreak) {
      setPrevStreak(userStats.streak);
    }
  }, [userStats.streak, prevStreak]);

  // Get user name (from localStorage or default)
  const userName = useMemo(() => {
    const name = localStorage.getItem('userName') || 'there';
    return name;
  }, []);

  // Get today's date range
  const todayRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    return { todayStart, todayEnd };
  }, []);

  // Today's impulses
  const todayImpulses = useMemo(() => {
    return impulses.filter(
      (imp: Impulse) => imp.createdAt >= todayRange.todayStart && imp.createdAt < todayRange.todayEnd
    );
  }, [impulses, todayRange]);

  // Today's stats
  const todayStats = useMemo(() => {
    const resisted = todayImpulses.filter(
      (i: Impulse) => i.status === 'skipped' || i.decisionAtEnd === 'skipped'
    ).length;
    const spent = todayImpulses
      .filter((i: Impulse) => i.status === 'bought' || i.decisionAtEnd === 'bought')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0);
    const saved = todayImpulses
      .filter((i: Impulse) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0);

    return {
      total: todayImpulses.length,
      resisted,
      spent,
      saved,
    };
  }, [todayImpulses]);

  // Active cooldown (first one)
  const activeCooldown = useMemo(() => {
    return impulses.find((i: Impulse) => i.status === 'cooldown');
  }, [impulses]);

  // Recent impulses (today only, 2-5)
  const recentTodayImpulses = useMemo(() => {
    return todayImpulses
      .sort((a: Impulse, b: Impulse) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [todayImpulses]);

  // Pull-to-refresh handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && startY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      loadFromDB().then(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      });
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  // Format time remaining (uses currentTime state for live updates)
  const formatTimeRemaining = (endTime: number): string => {
    const timeLeft = Math.max(0, endTime - currentTime);
    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWait = async () => {
    if (activeCooldown) {
      // Just navigate to cooldown page
      navigate(`/cooldown/${activeCooldown.id}`);
    }
  };

  const handleReallyNeed = async () => {
    if (activeCooldown) {
      // Navigate to decision page to buy immediately
      navigate(`/decision/${activeCooldown.id}`);
    }
  };

  // Streak bounce animation
  const streakScale = useSpring(1, { stiffness: 300, damping: 20 });
  useEffect(() => {
    if (userStats.streak > prevStreak) {
      streakScale.set(1.3);
      setTimeout(() => streakScale.set(1), 300);
    }
  }, [userStats.streak, prevStreak, streakScale]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen pb-24 bg-gradient-to-b from-base-100 via-base-100 to-base-200/50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 backdrop-blur-xl bg-base-200/80"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Pull-to-refresh gradient ripple */}
      {pullDistance > 0 && !isRefreshing && (
        <motion.div
          style={{ height: `${pullDistance}px` }}
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent"
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Top Bar (Mobile) */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Hi, {userName} 👋</span>
            </div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/20"
              style={{ scale: streakScale }}
            >
              <Flame className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold text-warning tabular-nums">
                Streak: {userStats.streak} {userStats.streak === 1 ? 'day' : 'days'}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Section 1 – Active Cool-Down */}
        {activeCooldown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30 shadow-lg shadow-warning/10 p-6">
              <h3 className="text-2xl font-semibold mb-4 text-center">You're cooling down…</h3>
              
              <div className="text-center mb-6">
                <div className="text-xl font-bold mb-1">{activeCooldown.title}</div>
                <div className="text-lg text-base-content/70">{formatCurrency(activeCooldown.price)}</div>
              </div>

              {/* Timer Ring */}
              <div className="flex justify-center mb-6">
                <EnhancedCooldownTimer
                  endTime={activeCooldown.cooldownEndsAt}
                  startTime={activeCooldown.createdAt}
                  size={200}
                />
              </div>

              {/* Time Left */}
              <div className="text-center mb-6">
                <div className="text-sm text-base-content/70 mb-1">Time left</div>
                <div className="text-2xl font-bold tabular-nums text-warning">
                  {formatTimeRemaining(activeCooldown.cooldownEndsAt)}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <GlassButton
                  fullWidth
                  onClick={handleWait}
                  className="bg-success/20 border-success/30 hover:bg-success/30"
                >
                  I'll Wait
                </GlassButton>
                <GlassButton
                  fullWidth
                  onClick={handleReallyNeed}
                  className="bg-error/20 border-error/30 hover:bg-error/30"
                >
                  I Really Need This
                </GlassButton>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Section 2 – Quick Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: activeCooldown ? 0.2 : 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 p-6 text-center">
            <Button
              fullWidth
              variant="primary"
              size="lg"
              onClick={() => navigate('/new-impulse')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg shadow-primary-500/20 text-lg py-4 mb-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log a new impulse
            </Button>
            <p className="text-sm text-base-content/70">Tap this the moment you feel like buying.</p>
          </Card>
        </motion.div>

        {/* Section 3 – Today's Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: activeCooldown ? 0.3 : 0.2 }}
        >
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 rounded-xl bg-base-200/50 border border-base-300/50">
                <span className="text-sm font-medium">Impulses today: </span>
                <span className="text-sm font-bold tabular-nums">{todayStats.total}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20">
                <span className="text-sm font-medium text-success">Resisted: </span>
                <span className="text-sm font-bold text-success tabular-nums">{todayStats.resisted}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-error/10 border border-error/20">
                <span className="text-sm font-medium text-error">Spent: </span>
                <span className="text-sm font-bold text-error tabular-nums">{formatCurrency(todayStats.spent)}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20">
                <span className="text-sm font-medium text-success">Saved: </span>
                <span className="text-sm font-bold text-success tabular-nums">
                  {formatCurrency(todayStats.saved)} <span className="text-xs opacity-70">(est.)</span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 4 – Recent Impulses (Today) */}
        {recentTodayImpulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: activeCooldown ? 0.4 : 0.3 }}
          >
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Impulses</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {recentTodayImpulses.map((impulse: Impulse, index: number) => {
                    const statusLabel = getStatusLabel(impulse);
                    return (
                      <motion.div
                        key={impulse.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 backdrop-blur-xl bg-base-200/20 rounded-xl border border-base-300/30 cursor-pointer hover:bg-base-200/30 transition-all"
                        onClick={() => {
                          if (impulse.status === 'cooldown') {
                            navigate(`/cooldown/${impulse.id}`);
                          } else if (impulse.status === 'decision') {
                            navigate(`/decision/${impulse.id}`);
                          } else {
                            navigate(`/impulses/${impulse.id}`);
                          }
                        }}
                      >
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          {categoryIcons[impulse.category]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{impulse.title}</div>
                          <div className="text-xs text-base-content/70">{formatTimeAgo(impulse.createdAt)}</div>
                        </div>

                        {/* Status Chip */}
                        <div className={`badge ${getStatusColor(statusLabel)} badge-sm`}>
                          {statusLabel}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State - No data at all */}
        {impulses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex items-center justify-center min-h-[60vh]"
          >
            <Card className="text-center py-16 max-w-md mx-auto">
              <div className="text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold mb-3">This vault is empty.</h3>
              <p className="text-base-content/70 mb-6 text-lg">
                The next time you feel an urge to spend, capture it here before you buy.
              </p>
              <motion.button
                onClick={() => navigate('/new-impulse')}
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log Your First Impulse
              </motion.button>
            </Card>
          </motion.div>
        )}

        {/* Empty State - No impulses today (but has data) */}
        {impulses.length > 0 && todayImpulses.length === 0 && !activeCooldown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No impulses today</h3>
              <p className="text-base-content/70 mb-4">
                Start tracking your impulses to build better spending habits
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
