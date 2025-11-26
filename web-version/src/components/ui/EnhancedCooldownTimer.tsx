import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedCooldownTimerProps {
  endTime: number;
  startTime?: number;
  size?: number;
  onComplete?: () => void;
}

export function EnhancedCooldownTimer({
  endTime,
  startTime,
  size = 280,
  onComplete,
}: EnhancedCooldownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  const calculatedStartTime = useMemo(() => {
    if (startTime) return startTime;
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    return endTime - (24 * 60 * 60 * 1000);
  }, [startTime, endTime]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, isComplete, onComplete]);

  // Breathing animation
  useEffect(() => {
    if (isComplete) return;
    
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.05) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [isComplete]);

  const totalDuration = endTime - calculatedStartTime;
  const now = Date.now();
  const elapsed = now - calculatedStartTime;
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, elapsed / totalDuration)) : 1;
  const remainingProgress = 1 - progress;

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const formatTime = () => {
    if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (minutes > 0) return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${seconds.toString().padStart(2, '0')}s`;
  };

  const breathScale = isComplete ? 1 : 1 + Math.sin(breathPhase) * 0.05;
  const breathOpacity = isComplete ? 1 : 0.7 + Math.sin(breathPhase) * 0.15;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: breathScale,
          opacity: breathOpacity * 0.5,
        }}
        transition={{
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Main circle */}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="cooldown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 24) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-base-300/20"
        />

        {/* Progress circle with glow */}
        {!isComplete && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 24) / 2}
            fill="none"
            stroke="url(#cooldown-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * ((size - 24) / 2)}
            strokeDashoffset={2 * Math.PI * ((size - 24) / 2) * remainingProgress}
            filter="url(#glow)"
            initial={{ strokeDashoffset: 2 * Math.PI * ((size - 24) / 2) }}
            animate={{
              strokeDashoffset: 2 * Math.PI * ((size - 24) / 2) * remainingProgress,
            }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        )}

        {/* Completion circle */}
        {isComplete && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 24) / 2}
            fill="none"
            stroke="url(#cooldown-gradient)"
            strokeWidth="4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="text-5xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                ✨
              </motion.div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
                Ready!
              </div>
              <div className="text-sm text-base-content/70 mt-1">Time to decide</div>
            </motion.div>
          ) : (
            <motion.div
              key="timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent mb-2"
                animate={{
                  scale: breathScale,
                }}
                transition={{
                  duration: 4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              >
                {formatTime()}
              </motion.div>
              <div className="text-sm text-base-content/70">Remaining</div>
              <motion.div
                className="mt-3 text-xs text-base-content/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Breathe. Think. Decide.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating particles effect */}
      {!isComplete && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: -2,
                y: -2,
              }}
              animate={{
                x: [
                  Math.cos((i * Math.PI * 2) / 6) * (size / 2 - 20),
                  Math.cos((i * Math.PI * 2) / 6) * (size / 2 - 10),
                  Math.cos((i * Math.PI * 2) / 6) * (size / 2 - 20),
                ],
                y: [
                  Math.sin((i * Math.PI * 2) / 6) * (size / 2 - 20),
                  Math.sin((i * Math.PI * 2) / 6) * (size / 2 - 10),
                  Math.sin((i * Math.PI * 2) / 6) * (size / 2 - 20),
                ],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

