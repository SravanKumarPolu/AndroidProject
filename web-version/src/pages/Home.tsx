import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalsCard } from '@/components/GoalsCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { HeatmapChart } from '@/components/ui/HeatmapChart';
import { XPLevelCard } from '@/components/ui/XPLevelCard';
import { PositiveMessageCard } from '@/components/ui/PositiveMessageCard';
import { TrendingUp, DollarSign, XCircle, Clock, BarChart3, Plus, Target } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getUserStats } from '@/utils/gamification';
import { getPositiveMessages, getFriendlyNudge } from '@/utils/positiveMessages';
import { Impulse } from '@/types/impulse';

export function Home() {
  const navigate = useNavigate();
  const { impulses, goals, loadFromDB } = useImpulseStore();
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  // Calculate gamification stats
  const userStats = useMemo(() => getUserStats(impulses), [impulses]);
  
  // Get positive messages
  const positiveMessages = useMemo(() => {
    const messages = getPositiveMessages(userStats);
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
    const nudge = getFriendlyNudge(userStats, timeOfDay);
    return [nudge, ...messages].filter((msg, idx) => !dismissedMessages.has(`${msg.type}-${idx}`));
  }, [userStats, dismissedMessages]);

  const handleDismissMessage = (index: number, type: string) => {
    setDismissedMessages((prev) => new Set([...prev, `${type}-${index}`]));
  };

  const stats = {
    totalSaved: impulses
      .filter((i: Impulse) => i.status === 'skipped' || i.decisionAtEnd === 'skipped')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0),
    totalBought: impulses
      .filter((i: Impulse) => i.status === 'bought' || i.decisionAtEnd === 'bought')
      .reduce((sum: number, i: Impulse) => sum + i.price, 0),
    activeCooldowns: impulses.filter((i: Impulse) => i.status === 'cooldown').length,
    pendingDecisions: impulses.filter((i: Impulse) => i.status === 'decision').length,
    savedForLater: impulses.filter((i: Impulse) => i.decisionAtEnd === 'saved_for_later' || (i.status === 'pending' && i.finalDecision === 'save-later')).length,
  };

  const recentImpulses = impulses
    .sort((a: Impulse, b: Impulse) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="min-h-screen p-4 pb-24 bg-gradient-to-b from-base-100 via-base-100 to-base-200/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - Linear-style minimal */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-3 tracking-tight">
            ImpulseVault
          </h1>
          <p className="text-base-content/60 text-sm font-medium">Lock your impulses. Free your future.</p>
        </motion.div>

        {/* XP & Level Card (Duolingo-style) */}
        {impulses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <XPLevelCard stats={userStats} />
          </motion.div>
        )}

        {/* Positive Messages (Headspace-style) */}
        <AnimatePresence>
          {positiveMessages.slice(0, 2).map((message, index) => (
            <motion.div
              key={`${message.type}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <PositiveMessageCard
                message={message}
                onDismiss={() => handleDismissMessage(index, message.type)}
                className="mb-4"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Stats Grid - Linear-style minimal with gradients */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:border-success/40 transition-all">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">{formatCurrency(stats.totalSaved)}</div>
              <div className="text-xs text-base-content/60 font-medium mt-1">Money Saved</div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="text-center bg-gradient-to-br from-error/10 to-error/5 border-error/20 hover:border-error/40 transition-all">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-error" />
              <div className="text-2xl font-bold text-error">{formatCurrency(stats.totalBought)}</div>
              <div className="text-xs text-base-content/60 font-medium mt-1">Money Spent</div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:border-warning/40 transition-all">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-warning">{stats.activeCooldowns}</div>
              <div className="text-xs text-base-content/60 font-medium mt-1">In Cooldown</div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-all">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">{stats.pendingDecisions}</div>
              <div className="text-xs text-base-content/60 font-medium mt-1">Ready to Decide</div>
            </Card>
          </motion.div>
        </div>

        {/* Saved for Later */}
        {stats.savedForLater > 0 && (
          <Card className="bg-warning/10 border-warning/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Saved for Later</h3>
                <p className="text-sm text-base-content/70">
                  {stats.savedForLater} impulse{stats.savedForLater !== 1 ? 's' : ''} waiting for review
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/history')}
              >
                View
              </Button>
            </div>
          </Card>
        )}

        {/* Goals Card */}
        <GoalsCard goals={goals} totalSaved={stats.totalSaved} />

        {/* Quick Actions - Linear-style minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-base-200/20 backdrop-blur-xl border-base-300/30">
            <h2 className="text-lg font-semibold mb-4 text-base-content/90">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                fullWidth
                variant="primary"
                onClick={() => navigate('/new-impulse')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg shadow-primary-500/20"
              >
                + Add New Impulse
              </Button>
              {stats.pendingDecisions > 0 && (
                <Button
                  fullWidth
                  variant="accent"
                  onClick={() => navigate('/decision')}
                  className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 border-0 shadow-lg shadow-accent-500/20"
                >
                  Review Decisions ({stats.pendingDecisions})
                </Button>
              )}
              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate('/reports')}
                className="flex items-center justify-center gap-2 border-base-300/50 hover:border-primary-400/50 hover:bg-base-200/30"
              >
                <BarChart3 className="w-4 h-4" />
                View Reports
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Impulses */}
        {recentImpulses.length > 0 ? (
          <Card>
            <h2 className="text-xl font-bold mb-4">Recent Impulses</h2>
            <div className="space-y-3">
              {recentImpulses.map((impulse: Impulse) => (
                <div
                  key={impulse.id}
                  className="flex items-center justify-between p-3 backdrop-blur-xl bg-base-200/20 rounded-xl border border-base-300/30 cursor-pointer hover:bg-base-200/30 transition-all"
                  onClick={() => {
                    if (impulse.status === 'cooldown') {
                      navigate(`/cooldown/${impulse.id}`);
                    } else if (impulse.status === 'decision') {
                      navigate(`/decision/${impulse.id}`);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{impulse.title}</div>
                    <div className="text-sm text-base-content/70">
                      {formatCurrency(impulse.price)} • {impulse.category}
                    </div>
                  </div>
                  <div className="badge badge-primary badge-sm">{impulse.status}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">No impulses yet</h3>
            <p className="text-base-content/70 mb-4">
              Start tracking your impulses to build better spending habits
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/new-impulse')}
            >
              Add Your First Impulse
            </Button>
          </Card>
        )}

        {/* Activity Heatmap */}
        {impulses.length > 0 && (
          <Card>
            <HeatmapChart impulses={impulses} days={90} />
          </Card>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        mainIcon={<Plus className="w-6 h-6" />}
        actions={[
          {
            icon: <Plus className="w-5 h-5" />,
            label: 'New Impulse',
            onClick: () => navigate('/new-impulse'),
            color: 'bg-gradient-to-r from-primary-500/80 to-primary-600/80',
          },
          {
            icon: <Target className="w-5 h-5" />,
            label: 'View Goals',
            onClick: () => navigate('/settings?tab=goals'),
            color: 'bg-gradient-to-r from-accent-500/80 to-accent-600/80',
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            label: 'Reports',
            onClick: () => navigate('/reports'),
            color: 'bg-gradient-to-r from-secondary-500/80 to-secondary-600/80',
          },
        ]}
      />
    </div>
  );
}

