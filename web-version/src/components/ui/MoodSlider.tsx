import { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionAtImpulse } from '@/types/impulse';

interface MoodSliderProps {
  value: EmotionAtImpulse | null;
  onChange: (emotion: EmotionAtImpulse) => void;
  className?: string;
}

const emotions: { value: EmotionAtImpulse; label: string; emoji: string; color: string }[] = [
  { value: 'bored', label: 'Bored', emoji: '😴', color: 'from-slate-400 to-slate-600' },
  { value: 'stressed', label: 'Stressed', emoji: '😫', color: 'from-red-400 to-red-600' },
  { value: 'hungry', label: 'Hungry', emoji: '🤤', color: 'from-orange-400 to-orange-600' },
  { value: 'excited', label: 'Excited', emoji: '🤩', color: 'from-yellow-400 to-yellow-600' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-400 to-blue-600' },
  { value: 'tired', label: 'Tired', emoji: '😵', color: 'from-purple-400 to-purple-600' },
  { value: 'fomo', label: 'FOMO', emoji: '😰', color: 'from-pink-400 to-pink-600' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'from-gray-400 to-gray-600' },
];

export function MoodSlider({ value, onChange, className = '' }: MoodSliderProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="label">
        <span className="label-text text-base-content/70">How are you feeling?</span>
      </label>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {emotions.map((emotion, index) => {
          const isSelected = value === emotion.value;
          const isHovered = hoveredIndex === index;

          return (
            <motion.button
              key={emotion.value}
              type="button"
              onClick={() => onChange(emotion.value)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl
                backdrop-blur-xl border transition-all duration-300
                ${isSelected 
                  ? `bg-gradient-to-br ${emotion.color} border-${emotion.color.split('-')[1]}-400/70 shadow-lg` 
                  : 'bg-base-200/30 border-base-300/50 hover:bg-base-200/50'
                }
                ${isHovered && !isSelected ? 'shadow-md' : ''}
              `}
              style={{
                boxShadow: isSelected
                  ? `0 4px 20px rgba(${emotion.color.includes('red') ? '239, 68, 68' : emotion.color.includes('orange') ? '251, 146, 60' : '99, 102, 241'}, 0.4)`
                  : undefined,
              }}
            >
              <motion.span
                className="text-3xl"
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {emotion.emoji}
              </motion.span>
              <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-base-content/70'}`}>
                {emotion.label}
              </span>
              {isSelected && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

