import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, History, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/new-impulse', icon: Plus, label: 'New' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 relative overflow-hidden">
      {/* Glassmorphism Background with Neon Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs with neon glow */}
        <div 
          className="absolute top-0 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"
          style={{
            boxShadow: '0 0 100px rgba(99, 102, 241, 0.3), 0 0 200px rgba(99, 102, 241, 0.2)',
          }}
        ></div>
        <div 
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" 
          style={{ 
            animationDelay: '1s',
            boxShadow: '0 0 100px rgba(217, 70, 239, 0.3), 0 0 200px rgba(217, 70, 239, 0.2)',
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" 
          style={{ 
            animationDelay: '2s',
            boxShadow: '0 0 100px rgba(34, 211, 238, 0.3), 0 0 200px rgba(34, 211, 238, 0.2)',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-base-200/80 border-t border-base-300/50">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

