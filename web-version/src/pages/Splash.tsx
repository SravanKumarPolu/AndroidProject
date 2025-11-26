import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';

export function Splash() {
  const navigate = useNavigate();
  const { settings, loadFromDB } = useImpulseStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data and check if onboarding is needed
    const init = async () => {
      await loadFromDB();
      setIsLoading(false);
      
      // Check if user has completed onboarding and setup
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
      const hasCompletedSetup = localStorage.getItem('hasCompletedSetup') === 'true';
      
      if (!hasCompletedOnboarding) {
        // Navigate to onboarding after splash
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      } else if (!hasCompletedSetup) {
        // Navigate to setup after splash
        setTimeout(() => {
          navigate('/setup');
        }, 2000);
      } else {
        // Navigate to home after splash
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    };
    
    init();
  }, [loadFromDB, navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #6366f1 0%, #d946ef 50%, #22d3ee 100%)',
            'linear-gradient(135deg, #d946ef 0%, #22d3ee 50%, #6366f1 100%)',
            'linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #d946ef 100%)',
            'linear-gradient(135deg, #6366f1 0%, #d946ef 50%, #22d3ee 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            className="mb-6"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="text-7xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent mb-4">
              ImpulseVault
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-white/90 font-medium"
          >
            Catch impulses before they become regrets.
          </motion.p>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

