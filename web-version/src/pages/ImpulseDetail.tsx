import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { EmotionChips } from '@/components/ui/EmotionChips';
import { GlassButton } from '@/components/ui/GlassButton';
import { formatCurrency } from '@/utils/format';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

export function ImpulseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { impulses, updateImpulse } = useImpulseStore();
  const [reflection, setReflection] = useState<'regret' | 'satisfied' | 'neutral' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const impulse = impulses.find((i) => i.id === id);

  useEffect(() => {
    if (!impulse) return;
    
    // Set initial reflection based on regret score
    if (impulse.regretScore !== null && impulse.regretScore !== undefined) {
      if (impulse.regretScore >= 70) {
        setReflection('regret');
      } else if (impulse.regretScore <= 30) {
        setReflection('satisfied');
      } else {
        setReflection('neutral');
      }
    }
  }, [impulse]);

  const handleReflection = async (value: 'regret' | 'satisfied' | 'neutral') => {
    if (!impulse || isUpdating) return;
    
    setIsUpdating(true);
    setReflection(value);
    
    // Map reflection to regret score
    const regretScore = value === 'regret' ? 80 : value === 'satisfied' ? 20 : 50;
    
    try {
      await updateImpulse(impulse.id, {
        regretScore,
        notesAfterPurchase: impulse.notesAfterPurchase || undefined,
      });
    } catch (error) {
      console.error('Failed to update reflection:', error);
      setReflection(null);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!impulse) {
    return (
      <div className="min-h-screen p-4 pb-24 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Impulse not found</h3>
          <p className="text-base-content/70 mb-4">
            This impulse doesn't exist or has been deleted.
          </p>
          <GlassButton onClick={() => navigate('/history')} fullWidth>
            Go Back
          </GlassButton>
        </Card>
      </div>
    );
  }

  const status = impulse.decisionAtEnd || impulse.status;
  const isBought = status === 'bought';
  const isSkipped = status === 'skipped';
  const isPending = status === 'pending' || status === 'cooldown' || status === 'decision';

  // Extract merchant name (first word of title)
  const merchantName = impulse.title.split(' ')[0];
  const itemName = impulse.title.split(' ').slice(1).join(' ') || impulse.title;

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => navigate('/history')}
            className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              Impulse Details
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              View and reflect on your impulse
            </p>
          </div>
        </motion.div>

        {/* Top Summary */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <div className="flex items-start gap-4 mb-4">
              <CategoryPill category={impulse.category} size="lg" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{itemName}</h2>
                <p className="text-sm text-base-content/60 mb-3">{merchantName}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                      {formatCurrency(impulse.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(impulse.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(impulse.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Urge Details */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Urge Details
            </h3>
            <div className="space-y-4">
              {/* Before vs After */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-base-200/30 border border-base-300/50">
                  <p className="text-xs text-base-content/60 mb-1">Before Cooldown</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{impulse.urgeStrength || 'N/A'}</span>
                    <span className="text-sm text-base-content/60">/ 10</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-base-200/30 border border-base-300/50">
                  <p className="text-xs text-base-content/60 mb-1">After Cooldown</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {impulse.urgeStrengthAfterCooldown ?? impulse.urgeStrength ?? 'N/A'}
                    </span>
                    <span className="text-sm text-base-content/60">/ 10</span>
                  </div>
                </div>
              </div>
              
              {/* Change indicator */}
              {impulse.urgeStrength && impulse.urgeStrengthAfterCooldown !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  {impulse.urgeStrengthAfterCooldown < impulse.urgeStrength ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="text-success">
                        Urge decreased by {impulse.urgeStrength - impulse.urgeStrengthAfterCooldown} points
                      </span>
                    </>
                  ) : impulse.urgeStrengthAfterCooldown > impulse.urgeStrength ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-warning" />
                      <span className="text-warning">
                        Urge increased by {impulse.urgeStrengthAfterCooldown - impulse.urgeStrength} points
                      </span>
                    </>
                  ) : (
                    <>
                      <Meh className="w-4 h-4 text-base-content/60" />
                      <span className="text-base-content/60">Urge stayed the same</span>
                    </>
                  )}
                </div>
              )}

              {/* Reason */}
              {impulse.reason && (
                <div className="pt-4 border-t border-base-300/30">
                  <p className="text-xs text-base-content/60 mb-2">Why you wanted this:</p>
                  <p className="text-sm text-base-content/80 italic">"{impulse.reason}"</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Outcome */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Outcome
            </h3>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <p className="text-xs text-base-content/60 mb-2">Status</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={status}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className={`badge badge-lg capitalize ${
                      status === 'skipped' ? 'badge-success' :
                      status === 'bought' ? 'badge-error' :
                      status === 'saved_for_later' ? 'badge-accent' :
                      status === 'cooldown' ? 'badge-warning' :
                      status === 'decision' ? 'badge-primary' :
                      'badge-ghost'
                    }`}>
                      {status === 'skipped' ? 'Resisted' : 
                       status === 'bought' ? 'Bought' :
                       status === 'saved_for_later' ? 'Saved for Later' :
                       status === 'cooldown' ? 'In Cooldown' :
                       status === 'decision' ? 'Ready to Decide' :
                       'Pending'}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Check-in for bought items */}
              {isBought && (
                <div className="pt-4 border-t border-base-300/30">
                  <p className="text-sm text-base-content/70 mb-3">
                    How did it feel after 1 day?
                  </p>
                  {impulse.regretScore !== null && impulse.regretScore !== undefined ? (
                    <div className="p-3 rounded-lg bg-base-200/30 border border-base-300/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className={`w-5 h-5 ${
                          impulse.regretScore < 30 ? 'text-success' :
                          impulse.regretScore < 60 ? 'text-warning' :
                          'text-error'
                        }`} />
                        <span className="font-semibold">
                          Regret Score: {impulse.regretScore}/100
                        </span>
                      </div>
                      {impulse.notesAfterPurchase && (
                        <p className="text-sm text-base-content/70 italic mt-2">
                          "{impulse.notesAfterPurchase}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/60 italic">
                      Check-in pending (3 days after purchase)
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Reflection */}
        {!isPending && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Reflection
              </h3>
              <p className="text-sm text-base-content/70 mb-4">
                How do you feel about this decision now?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  onClick={() => handleReflection('regret')}
                  disabled={isUpdating}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${reflection === 'regret' 
                      ? 'border-error bg-error/10' 
                      : 'border-base-300/50 bg-base-200/30 hover:border-error/50'}
                  `}
                >
                  <Frown className={`w-6 h-6 mx-auto mb-2 ${
                    reflection === 'regret' ? 'text-error' : 'text-base-content/60'
                  }`} />
                  <p className={`text-sm font-medium ${
                    reflection === 'regret' ? 'text-error' : 'text-base-content/70'
                  }`}>
                    I regret this
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => handleReflection('neutral')}
                  disabled={isUpdating}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${reflection === 'neutral' 
                      ? 'border-warning bg-warning/10' 
                      : 'border-base-300/50 bg-base-200/30 hover:border-warning/50'}
                  `}
                >
                  <Meh className={`w-6 h-6 mx-auto mb-2 ${
                    reflection === 'neutral' ? 'text-warning' : 'text-base-content/60'
                  }`} />
                  <p className={`text-sm font-medium ${
                    reflection === 'neutral' ? 'text-warning' : 'text-base-content/70'
                  }`}>
                    Neutral
                  </p>
                </motion.button>

                <motion.button
                  onClick={() => handleReflection('satisfied')}
                  disabled={isUpdating}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${reflection === 'satisfied' 
                      ? 'border-success bg-success/10' 
                      : 'border-base-300/50 bg-base-200/30 hover:border-success/50'}
                  `}
                >
                  <Smile className={`w-6 h-6 mx-auto mb-2 ${
                    reflection === 'satisfied' ? 'text-success' : 'text-base-content/60'
                  }`} />
                  <p className={`text-sm font-medium ${
                    reflection === 'satisfied' ? 'text-success' : 'text-base-content/70'
                  }`}>
                    Satisfied
                  </p>
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tags - Emotional Triggers */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="font-semibold text-lg mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {impulse.emotionAtImpulse && (
                <EmotionChips emotion={impulse.emotionAtImpulse} size="md" />
              )}
              {impulse.isInfluenced && (
                <span className="badge badge-warning badge-outline">
                  👥 Peer pressure
                </span>
              )}
              {impulse.urgency && (
                <span className="badge badge-outline capitalize">
                  {impulse.urgency} urgency
                </span>
              )}
              {impulse.category && (
                <CategoryPill category={impulse.category} size="sm" />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Notes After Purchase */}
        {impulse.notesAfterPurchase && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <Card>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-sm text-base-content/70 italic">
                "{impulse.notesAfterPurchase}"
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

