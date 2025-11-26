import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { GlassButton } from '@/components/ui/GlassButton';
import { EnhancedCooldownTimer } from '@/components/ui/EnhancedCooldownTimer';
import { formatCurrency } from '@/utils/format';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { useCooldownLock } from '@/hooks/useCooldownLock';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { ArrowLeft, Clock, Lock as LockIcon } from 'lucide-react';

export function Cooldown() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { impulses, updateImpulse } = useImpulseStore();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [hasTriggeredHalfway, setHasTriggeredHalfway] = useState(false);

  const impulse = impulses.find((i) => i.id === id);

  // Update current time every second for halfway haptic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const isComplete = impulse ? Date.now() >= impulse.cooldownEndsAt : false;
  const { isLocked, formattedTime: lockFormattedTime } = useCooldownLock(
    impulse ? !isComplete && impulse.status === 'cooldown' : false,
    impulse?.cooldownEndsAt || Date.now()
  );

  // Haptic feedback on cooldown start
  useEffect(() => {
    if (impulse && impulse.status === 'cooldown' && !isComplete) {
      hapticLight();
    }
  }, [impulse?.id, isComplete]);

  // Haptic feedback at halfway mark
  useEffect(() => {
    if (!impulse || isComplete || hasTriggeredHalfway) return;
    
    const totalDuration = impulse.cooldownEndsAt - impulse.createdAt;
    const halfwayTime = impulse.createdAt + totalDuration / 2;
    
    if (currentTime >= halfwayTime) {
      hapticLight();
      setHasTriggeredHalfway(true);
    }
  }, [impulse, isComplete, hasTriggeredHalfway, currentTime]);

  // Haptic feedback on cooldown complete
  useEffect(() => {
    if (isComplete) {
      hapticSuccess();
    }
  }, [isComplete]);

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

  // Calculate time remaining for display
  const timeRemaining = Math.max(0, impulse.cooldownEndsAt - currentTime);
  const totalSeconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen p-0 pb-24 bg-gradient-to-br from-primary-900/20 via-secondary-900/20 to-accent-900/20 relative overflow-hidden">
      {/* Full-screen gradient background (Calm-style) */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 pointer-events-none" />
      
      {/* Back button - top left */}
      <motion.button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Central breathing element - Calm/Tide style */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            Pause before you buy
          </h1>
          <p className="text-base-content/70 text-sm max-w-md mx-auto">
            Breathe for a few minutes. Ask: Will I regret this tomorrow?
          </p>
        </motion.div>

        {/* Central breathing circle with timer ring */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer breathing glow rings */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 320,
              height: 320,
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              background: 'radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 0.5,
            }}
          />

          {/* Timer ring (outer) */}
          <div className="relative z-10">
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
          </div>

          {/* Inner breathing circle */}
          <motion.div
            className="absolute rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-sm border border-primary-300/30"
            style={{
              width: 180,
              height: 180,
            }}
            animate={{
              scale: [0.9, 1.05, 0.9],
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />

          {/* Timer text in center */}
          <motion.div
            className="absolute z-20 text-center"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            <div className="text-5xl font-bold tabular-nums bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
              {timeDisplay}
            </div>
            <div className="text-sm text-base-content/70">Time remaining</div>
          </motion.div>
        </div>

        {/* Item info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="text-center p-6">
            <h2 className="text-2xl font-bold mb-2">{impulse.title}</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <CategoryPill category={impulse.category} />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {formatCurrency(impulse.price)}
              </span>
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
                <p className="text-base-content/70 text-sm">
                  💭 Take a deep breath. The cooldown period helps you make better decisions.
                </p>
                {isLocked && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <LockIcon className="w-5 h-5 text-primary" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary">WAIT</div>
                      <div className="text-xs text-base-content/70">Screen locked for {lockFormattedTime}</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  <GlassButton
                    fullWidth
                    variant="outline"
                    onClick={() => navigate(`/decision/${impulse.id}`)}
                    className="text-sm"
                  >
                    End early & decide now
                  </GlassButton>
                  <GlassButton
                    fullWidth
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-sm"
                  >
                    I'll leave it running
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Additional info cards (if reason or emotion exists) */}
        {(impulse.reason || impulse.emotionAtImpulse) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md space-y-3"
          >
            {impulse.reason && (
              <Card>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span>💭</span>
                  Your Reason
                </h3>
                <p className="text-base-content/70 text-sm">{impulse.reason}</p>
              </Card>
            )}

            {impulse.emotionAtImpulse && (
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
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

