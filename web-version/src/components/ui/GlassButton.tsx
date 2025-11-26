import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  glow?: boolean;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  glow = false,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border-primary-400/50 text-primary-100',
    secondary: 'bg-gradient-to-r from-secondary-500/20 to-secondary-600/20 border-secondary-400/50 text-secondary-100',
    accent: 'bg-gradient-to-r from-accent-500/20 to-accent-600/20 border-accent-400/50 text-accent-100',
    ghost: 'bg-base-200/10 border-base-300/30 text-base-content',
    outline: 'bg-transparent border-2 border-primary-400/50 text-primary-300',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl border';
  const widthClass = fullWidth ? 'w-full' : '';
  const glowClass = glow ? 'neon-glow' : '';

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.05, y: -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${glowClass} ${className}`}
      disabled={disabled || loading}
      style={{
        boxShadow: glow 
          ? '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)'
          : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="loading loading-spinner loading-sm"></span>
          Loading...
        </span>
      ) : (
        <span className="relative z-10">{children}</span>
      )}
    </motion.button>
  );
}

