import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface CooldownRingProps {
  endTime: number;
  startTime?: number;
  size?: number;
  strokeWidth?: number;
}

export function CooldownRing({ endTime, startTime, size = 200, strokeWidth = 12 }: CooldownRingProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate start time if not provided (fallback to estimate)
  const calculatedStartTime = useMemo(() => {
    if (startTime) return startTime;
    // If no startTime provided, estimate from current remaining time
    // This is a fallback - should always pass startTime from parent
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    // Estimate 24h default duration if we can't calculate
    return endTime - (24 * 60 * 60 * 1000);
  }, [startTime, endTime]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      setIsComplete(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress: how much time has passed vs total duration
  const totalDuration = endTime - calculatedStartTime;
  const now = Date.now();
  const elapsed = now - calculatedStartTime;
  const progress = totalDuration > 0 ? Math.min(1, Math.max(0, elapsed / totalDuration)) : 1;
  const offset = circumference - progress * circumference;

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const formatTime = () => {
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-base-300/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-primary-400">Ready!</div>
            <div className="text-sm text-base-content/70">Make your decision</div>
          </motion.div>
        ) : (
          <>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              {formatTime()}
            </div>
            <div className="text-sm text-base-content/70 mt-1">Remaining</div>
          </>
        )}
      </div>
    </div>
  );
}

