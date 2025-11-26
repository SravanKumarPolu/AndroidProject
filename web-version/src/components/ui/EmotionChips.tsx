import { EmotionAtImpulse } from '@/types/impulse';
import { motion } from 'framer-motion';

interface EmotionChipsProps {
  emotion: EmotionAtImpulse | null;
  onChange?: (emotion: EmotionAtImpulse) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const emotionConfig: Record<EmotionAtImpulse, { 
  emoji: string; 
  label: string; 
  color: string;
  bgColor: string;
  borderColor: string;
  borderColorDisplay: string;
}> = {
  bored: { emoji: '😴', label: 'Bored', color: 'text-slate-400', bgColor: 'bg-slate-400/20', borderColor: 'border-slate-400/70', borderColorDisplay: 'border-slate-400/30' },
  stressed: { emoji: '😫', label: 'Stressed', color: 'text-red-400', bgColor: 'bg-red-400/20', borderColor: 'border-red-400/70', borderColorDisplay: 'border-red-400/30' },
  hungry: { emoji: '🤤', label: 'Hungry', color: 'text-orange-400', bgColor: 'bg-orange-400/20', borderColor: 'border-orange-400/70', borderColorDisplay: 'border-orange-400/30' },
  excited: { emoji: '🤩', label: 'Excited', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/70', borderColorDisplay: 'border-yellow-400/30' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-blue-400', bgColor: 'bg-blue-400/20', borderColor: 'border-blue-400/70', borderColorDisplay: 'border-blue-400/30' },
  tired: { emoji: '😵', label: 'Tired', color: 'text-purple-400', bgColor: 'bg-purple-400/20', borderColor: 'border-purple-400/70', borderColorDisplay: 'border-purple-400/30' },
  fomo: { emoji: '😰', label: 'FOMO', color: 'text-pink-400', bgColor: 'bg-pink-400/20', borderColor: 'border-pink-400/70', borderColorDisplay: 'border-pink-400/30' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-gray-400', bgColor: 'bg-gray-400/20', borderColor: 'border-gray-400/70', borderColorDisplay: 'border-gray-400/30' },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function EmotionChips({ 
  emotion, 
  onChange, 
  showLabel = true,
  size = 'md',
  className = '' 
}: EmotionChipsProps) {
  const emotions = Object.keys(emotionConfig) as EmotionAtImpulse[];

  if (onChange) {
    // Interactive mode - show all emotions
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {emotions.map((em) => {
          const config = emotionConfig[em];
          const isSelected = emotion === em;
          
          return (
            <motion.button
              key={em}
              type="button"
              onClick={() => onChange(em)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                ${sizeClasses[size]}
                rounded-full
                backdrop-blur-xl border transition-all
                ${isSelected
                  ? `${config.bgColor} ${config.borderColor} shadow-lg`
                  : 'bg-base-200/30 border-base-300/50 hover:bg-base-200/50'
                }
              `}
            >
              <span className="mr-1">{config.emoji}</span>
              {showLabel && <span className={isSelected ? config.color : 'text-base-content/70'}>
                {config.label}
              </span>}
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Display mode - show only selected emotion
  if (!emotion) return null;

  const config = emotionConfig[emotion];
  
  return (
    <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full ${config.bgColor} border ${config.borderColorDisplay} ${className}`}>
      <span>{config.emoji}</span>
      {showLabel && <span className={config.color}>{config.label}</span>}
    </div>
  );
}

