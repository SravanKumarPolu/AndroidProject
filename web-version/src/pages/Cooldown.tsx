import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { GlassButton } from '@/components/ui/GlassButton';
import { EnhancedCooldownTimer } from '@/components/ui/EnhancedCooldownTimer';
import { formatCurrency } from '@/utils/format';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { useCooldownLock } from '@/hooks/useCooldownLock';
import { ArrowLeft, Clock, Lock as LockIcon } from 'lucide-react';

export function Cooldown() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { impulses, updateImpulse } = useImpulseStore();

  const impulse = impulses.find((i) => i.id === id);

  useEffect(() => {
    if (!impulse) {
      navigate('/');
      return;
    }

    // Periodic check if cooldown is complete
    const checkCooldown = () => {
      if (impulse.status === 'cooldown' && Date.now() >= impulse.cooldownEndsAt) {
        updateImpulse(impulse.id, { status: 'decision' });
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);

    return () => clearInterval(interval);
  }, [impulse, navigate, updateImpulse]);

  if (!impulse) {
    return (
      <div className="min-h-screen p-4 pb-24 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Impulse not found</h3>
          <p className="text-base-content/70 mb-4">
            This impulse doesn't exist or has already been processed.
          </p>
          <GlassButton onClick={() => navigate('/')} fullWidth>
            Go Home
          </GlassButton>
        </Card>
      </div>
    );
  }

  if (impulse.status !== 'cooldown') {
    // Redirect to decision if cooldown is complete
    if (impulse.status === 'decision') {
      navigate(`/decision/${impulse.id}`);
      return null;
    }
    // Otherwise go home
    navigate('/');
    return null;
  }

  const isComplete = Date.now() >= impulse.cooldownEndsAt;
  const { isLocked, formattedTime } = useCooldownLock(
    !isComplete && impulse.status === 'cooldown',
    impulse.cooldownEndsAt
  );

  return (
    <div className="min-h-screen p-4 pb-24">
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              Cooldown Period
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              Take your time to think
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{impulse.title}</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <CategoryPill category={impulse.category} />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {formatCurrency(impulse.price)}
                </span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <EnhancedCooldownTimer 
                  endTime={impulse.cooldownEndsAt} 
                  startTime={impulse.createdAt}
                  size={280}
                  onComplete={() => {
                    if (impulse.status === 'cooldown' && Date.now() >= impulse.cooldownEndsAt) {
                      updateImpulse(impulse.id, { status: 'decision' });
                    }
                  }}
                />
              </motion.div>
            </div>

            {isComplete ? (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-lg text-base-content/70">
                  ✨ Cooldown complete! Time to make your decision.
                </p>
                <GlassButton
                  onClick={() => navigate(`/decision/${impulse.id}`)}
                  variant="primary"
                  size="lg"
                  glow
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Make Decision
                </GlassButton>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <p className="text-base-content/70">
                  💭 Take a deep breath. The cooldown period helps you make better decisions.
                </p>
                {isLocked && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <LockIcon className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary">WAIT</div>
                      <div className="text-xs text-base-content/70">Screen locked for {formattedTime}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>

        {impulse.reason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>💭</span>
                Your Reason
              </h3>
              <p className="text-base-content/70">{impulse.reason}</p>
            </Card>
          </motion.div>
        )}

        {impulse.emotionAtImpulse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {impulse.emotionAtImpulse === 'bored' && '😴'}
                  {impulse.emotionAtImpulse === 'stressed' && '😫'}
                  {impulse.emotionAtImpulse === 'hungry' && '🤤'}
                  {impulse.emotionAtImpulse === 'excited' && '🤩'}
                  {impulse.emotionAtImpulse === 'sad' && '😢'}
                  {impulse.emotionAtImpulse === 'tired' && '😵'}
                  {impulse.emotionAtImpulse === 'fomo' && '😰'}
                  {impulse.emotionAtImpulse === 'neutral' && '😐'}
                </span>
                <div>
                  <p className="text-sm text-base-content/70">You were feeling</p>
                  <p className="font-semibold capitalize">{impulse.emotionAtImpulse}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

