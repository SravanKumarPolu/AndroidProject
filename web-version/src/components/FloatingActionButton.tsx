import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface FloatingActionButtonProps {
  mainIcon: ReactNode;
  actions: Array<{
    icon: ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
  }>;
  className?: string;
}

export function FloatingActionButton({ mainIcon, actions, className = '' }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-24 right-4 z-40 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  backdrop-blur-xl border border-base-300/50
                  ${action.color || 'bg-base-200/30'}
                  shadow-lg hover:shadow-xl transition-all
                `}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white">{action.icon}</span>
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full
          bg-gradient-to-r from-primary-500 to-accent-500
          backdrop-blur-xl border border-primary-400/50
          shadow-lg flex items-center justify-center
          text-white
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        style={{
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
            >
              {mainIcon}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

