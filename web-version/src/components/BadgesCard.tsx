import { useMemo, useState } from 'react';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from './ui/Card';
import { BadgeCard } from './ui/BadgeCard';
import { calculateBadges } from '@/utils/badges';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Confetti } from '@/components/Confetti';

export function BadgesCard() {
  const { impulses } = useImpulseStore();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const badges = useMemo(() => calculateBadges(impulses), [impulses]);
  const unlockedBadges = badges.filter((b) => b.unlockedAt !== null);
  const lockedBadges = badges.filter((b) => b.unlockedAt === null);

  if (badges.length === 0) return null;

  const handleBadgeUnlock = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-warning" />
          <h2 className="text-xl font-bold">Badges</h2>
          <span className="badge badge-primary badge-sm">
            {unlockedBadges.length}/{badges.length}
          </span>
        </div>

        {/* Duolingo-style grid for all badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <BadgeCard badge={badge} onUnlock={handleBadgeUnlock} />
            </motion.div>
          ))}
        </div>
      </Card>
    </>
  );
}

