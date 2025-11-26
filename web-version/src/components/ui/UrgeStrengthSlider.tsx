import { motion } from 'framer-motion';
import { useState } from 'react';

interface UrgeStrengthSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function UrgeStrengthSlider({ value, onChange, className = '' }: UrgeStrengthSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getColor = (val: number) => {
    if (val <= 3) return 'from-success-400 to-success-600';
    if (val <= 6) return 'from-warning-400 to-warning-600';
    return 'from-error-400 to-error-600';
  };

  const getLabel = (val: number) => {
    if (val <= 3) return 'Mild';
    if (val <= 7) return 'Strong';
    return '🔥 Very strong';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="label">
          <span className="label-text text-base-content/70 font-medium">How strong is the urge?</span>
        </label>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold bg-gradient-to-r ${getColor(value)} bg-clip-text text-transparent`}>
            {value}
          </span>
          <span className="text-xs text-base-content/60">/ 10</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="range range-primary w-full h-3"
          style={{
            background: `linear-gradient(to right, 
              rgb(16, 185, 129) 0%, 
              rgb(16, 185, 129) ${(value / 10) * 30}%,
              rgb(245, 158, 11) ${(value / 10) * 30}%,
              rgb(245, 158, 11) ${(value / 10) * 70}%,
              rgb(239, 68, 68) ${(value / 10) * 70}%,
              rgb(239, 68, 68) 100%)`
          }}
        />
        
        {/* Value indicator */}
        <motion.div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            left: `${((value - 1) / 9) * 100}%`,
            transform: 'translateX(-50%)',
          }}
          animate={{
            scale: isDragging ? 1.2 : 1,
            boxShadow: value >= 8 ? [
              '0 0 10px rgba(239, 68, 68, 0.5)',
              '0 0 20px rgba(239, 68, 68, 0.7)',
              '0 0 10px rgba(239, 68, 68, 0.5)',
            ] : 'none',
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: value >= 8 ? Infinity : 0,
              ease: 'easeInOut',
            },
          }}
        >
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getColor(value)} border-2 border-white shadow-lg flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{value}</span>
          </div>
        </motion.div>
      </div>

      {/* Label below slider */}
      <div className="flex justify-between text-xs text-base-content/60">
        <span>Low</span>
        <span className="font-medium text-base-content/80">{getLabel(value)}</span>
        <span>High</span>
      </div>
    </div>
  );
}

