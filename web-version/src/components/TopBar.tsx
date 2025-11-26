import { useMemo } from 'react';
import { useImpulseStore } from '@/store/impulseStore';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/format';
import { Sun, Moon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Impulse } from '@/types/impulse';

export function TopBar() {
  const { impulses } = useImpulseStore();
  const { theme, toggleTheme } = useTheme();

  // Today's summary
  const todaySummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todayImpulses = impulses.filter(
      (imp: Impulse) => imp.createdAt >= todayStart && imp.createdAt < todayEnd
    );

    const todaySaved = todayImpulses
      .filter((i: Impulse) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0);

    const todayBought = todayImpulses
      .filter((i: Impulse) => i.status === 'bought' || i.decisionAtEnd === 'bought')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0);

    const activeCooldowns = todayImpulses.filter((i: Impulse) => i.status === 'cooldown').length;

    return {
      saved: todaySaved,
      bought: todayBought,
      cooldowns: activeCooldowns,
      total: todayImpulses.length,
    };
  }, [impulses]);

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-base-200/80 border-b border-base-300/50">
      <div className="w-full max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Today Summary */}
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <div className="text-xs text-base-content/60 mb-1">Today</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-success font-semibold tabular-nums">
                    {formatCurrency(todaySummary.saved)}
                  </span>
                  <span className="text-xs text-base-content/60">saved</span>
                </div>
                {todaySummary.bought > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-error font-semibold tabular-nums">
                      {formatCurrency(todaySummary.bought)}
                    </span>
                    <span className="text-xs text-base-content/60">spent</span>
                  </div>
                )}
                {todaySummary.cooldowns > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-warning font-semibold tabular-nums">
                      {todaySummary.cooldowns}
                    </span>
                    <span className="text-xs text-base-content/60">cooldown{todaySummary.cooldowns !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl backdrop-blur-xl bg-base-200/30 border border-base-300/50 hover:bg-base-200/50 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-base-content/70" />
              ) : (
                <Moon className="w-5 h-5 text-base-content/70" />
              )}
            </motion.button>

            {/* Profile (Placeholder) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-xl backdrop-blur-xl bg-base-200/30 border border-base-300/50 hover:bg-base-200/50 transition-all"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-base-content/70" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

