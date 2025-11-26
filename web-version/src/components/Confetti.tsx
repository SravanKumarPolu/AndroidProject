import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate 50 confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#6366f1', '#d946ef', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'][
          Math.floor(Math.random() * 6)
        ],
      }));
      setParticles(newParticles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                boxShadow: `0 0 10px ${particle.color}`,
              }}
              initial={{
                y: -20,
                x: 0,
                rotate: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                y: window.innerHeight + 100,
                x: (Math.random() - 0.5) * 200,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0],
                scale: [1, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

