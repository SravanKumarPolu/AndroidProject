import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, List, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { TopBar } from './TopBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: List, label: 'Impulses' },
    { path: '/insights', icon: BarChart3, label: 'Insights' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Check if current path matches any tab (including /impulses)
  const isActiveTab = (path: string) => {
    if (path === '/history') {
      return location.pathname === '/history' || location.pathname === '/impulses';
    }
    return location.pathname === path;
  };

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

      {/* Top Bar (Web only) */}
      {!isMobile && <TopBar />}

      {/* Sidebar (Web only) */}
      {!isMobile && (
        <div className="fixed left-0 top-0 bottom-0 w-20 z-30 backdrop-blur-xl bg-base-200/80 border-r border-base-300/50 pt-20">
          <div className="flex flex-col items-center gap-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isActiveTab(tab.path);
              
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                      layoutId="activeSidebarTab"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${!isMobile ? 'ml-20 pt-16' : ''}`}>
        {children}
      </div>

      {/* Bottom Tab Navigation (Mobile only) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-base-200/80 border-t border-base-300/50 safe-area-bottom">
          <div className="max-w-2xl mx-auto px-2 py-2">
            <div className="flex items-center justify-evenly">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = isActiveTab(tab.path);
                
                return (
                  <motion.button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 rounded-xl transition-all relative ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[10px] font-medium leading-tight whitespace-nowrap truncate w-full text-center">{tab.label}</span>
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
      )}
    </div>
  );
}

