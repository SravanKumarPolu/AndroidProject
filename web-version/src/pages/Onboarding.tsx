import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Slide {
  title: string;
  message: string;
  visual: React.ReactNode;
  emoji?: string;
}

const slides: Slide[] = [
  {
    title: 'Impulses, not expenses',
    message: 'This is a pre-spend shield, not a normal expense tracker. Catch your impulses before they become purchases.',
    emoji: '🛡️',
    visual: (
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl" />
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-8xl">🛡️</div>
        </div>
      </div>
    ),
  },
  {
    title: 'Cool-down before buying',
    message: 'Take a moment to pause and reflect. The cooldown period gives you time to think before making a purchase.',
    emoji: '⏱️',
    visual: (
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-3xl" />
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative">
            <Clock className="w-32 h-32 text-accent-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-accent-400 border-dashed rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'See how much regret you avoided',
    message: 'Track your savings and see the regret you avoided by skipping impulsive purchases.',
    emoji: '📊',
    visual: (
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-success-500/20 to-accent-500/20 rounded-full blur-3xl" />
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
          <TrendingUp className="w-24 h-24 text-success-400" />
          <div className="text-center">
            <div className="text-3xl font-bold text-success-400">₹0</div>
            <div className="text-sm text-base-content/70">Saved</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Gamify your control',
    message: 'Earn XP, unlock badges, and build streaks as you develop better impulse control habits.',
    emoji: '🎮',
    visual: (
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-full blur-3xl" />
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
          <Trophy className="w-24 h-24 text-warning-400" />
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-warning-400/20 rounded-full flex items-center justify-center text-2xl">🏆</div>
            <div className="w-12 h-12 bg-primary-400/20 rounded-full flex items-center justify-center text-2xl">⭐</div>
            <div className="w-12 h-12 bg-accent-400/20 rounded-full flex items-center justify-center text-2xl">🔥</div>
          </div>
        </div>
      </div>
    ),
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    navigate('/setup');
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          onClick={handleSkip}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl backdrop-blur-xl bg-base-200/30 border border-base-300/50 hover:bg-base-200/50 transition-all"
        >
          <X className="w-5 h-5 text-base-content/70" />
        </motion.button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                {slides[currentSlide].visual}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent"
              >
                {slides[currentSlide].title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-base-content/70 mb-8 max-w-md mx-auto"
              >
                {slides[currentSlide].message}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-4">
        {/* Page dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-primary w-8'
                  : 'bg-base-300/50 hover:bg-base-300'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className={currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Previous
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            className="min-w-[120px] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

