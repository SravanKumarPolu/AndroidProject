import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GlassButton } from '@/components/ui/GlassButton';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { UrgeStrengthSlider } from '@/components/ui/UrgeStrengthSlider';
import { Confetti } from '@/components/Confetti';
import { formatCurrency } from '@/utils/format';
import { predictRegret } from '@/utils/regretPrediction';
import { hapticSuccess, hapticWarning } from '@/utils/haptics';
import { getUserStats } from '@/utils/gamification';
import { CheckCircle, XCircle, Clock, ArrowLeft, AlertTriangle, Trophy, Sparkles } from 'lucide-react';

export function Decision() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { impulses, makeDecision, updateImpulse } = useImpulseStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSkipMessage, setShowSkipMessage] = useState(false);
  const [showBuyMessage, setShowBuyMessage] = useState(false);
  const [urgeStrengthNow, setUrgeStrengthNow] = useState<number | null>(null);

  // Get impulse from URL param, query param, or find first pending decision
  const impulseId = id || searchParams.get('id');
  const impulse = impulseId
    ? impulses.find((i) => i.id === impulseId)
    : impulses.find((i) => i.status === 'decision');

  // Calculate regret prediction
  const regretPrediction = useMemo(() => {
    if (!impulse) return null;
    return predictRegret(impulse, impulses.filter((i) => i.id !== impulse.id));
  }, [impulse, impulses]);

  const handleDecision = async (decision: 'skip' | 'buy' | 'save-later') => {
    if (!impulse) return;

    try {
      // Always save the after-cooldown urge strength (even if unchanged, to have a record)
      if (urgeStrengthNow !== null) {
        await updateImpulse(impulse.id, {
          urgeStrengthAfterCooldown: urgeStrengthNow,
        });
      }
      
      // Make the decision (this will update status, decisionAtEnd, etc.)
      await makeDecision(impulse.id, decision);
    } catch (error) {
      console.error('Failed to make decision:', error);
      return;
    }

    // Show confetti and gamification if skipping
    if (decision === 'skip') {
      hapticSuccess();
      setShowConfetti(true);
      setShowSkipMessage(true);
      
      // Calculate XP and savings
      const userStats = getUserStats(impulses);
      const xpGained = 20; // Base XP for resisting
      
      // Trigger XP bar animation by updating stats
      // The XP bar will animate when user navigates to Progress page
      
      setTimeout(() => {
        setShowConfetti(false);
        setTimeout(() => {
          setShowSkipMessage(false);
          navigate('/progress'); // Navigate to progress to see XP bar animation
        }, 3000);
      }, 2000);
    } else if (decision === 'buy') {
      hapticWarning();
      setShowBuyMessage(true);
      setTimeout(() => {
        setShowBuyMessage(false);
        navigate('/');
      }, 2000);
    } else {
      navigate('/');
    }
  };

  if (!impulse) {
    return (
      <div className="min-h-screen p-4 pb-24 flex items-center justify-center">
        <Card className="text-center py-12 max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold mb-2">No pending decisions</h3>
          <p className="text-base-content/70 mb-4">
            All your impulses have been decided. Great job!
          </p>
          <Button onClick={() => navigate('/')} className="mt-4" fullWidth>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="min-h-screen p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Make Your Decision</h1>
        </div>

        <Card>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4">{impulse.title}</h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <CategoryPill category={impulse.category} size="lg" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {formatCurrency(impulse.price)}
              </span>
            </div>
            {impulse.urgeStrength && (
              <div className="mb-4">
                <p className="text-sm text-base-content/70 mb-1">Urge BEFORE</p>
                <div className="text-lg font-bold">{impulse.urgeStrength}/10</div>
              </div>
            )}
            {impulse.reason && (
              <p className="text-base-content/70 italic">"{impulse.reason}"</p>
            )}
          </div>

          {/* Ask again: How strong now? */}
          <div className="mb-6">
            <UrgeStrengthSlider
              value={urgeStrengthNow ?? impulse.urgeStrength ?? 5}
              onChange={setUrgeStrengthNow}
            />
            <p className="text-xs text-base-content/60 mt-2 text-center">
              Ask AGAIN: "How strong now?"
            </p>
          </div>

          <p className="text-center text-base-content/70 mb-6">
            Now that you've paused, what do you want to do?
          </p>

          <div className="space-y-3">
            <GlassButton
              fullWidth
              variant="primary"
              size="lg"
              glow
              onClick={() => handleDecision('skip')}
              className="flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              I'll Skip It
            </GlassButton>

            <GlassButton
              fullWidth
              variant="outline"
              size="lg"
              onClick={() => handleDecision('buy')}
              className="flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              I'll Buy It Anyway
            </GlassButton>

            <GlassButton
              fullWidth
              variant="ghost"
              size="lg"
              onClick={() => handleDecision('save-later')}
              className="flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Decide Later
            </GlassButton>
          </div>
        </Card>

        {/* Regret Prediction */}
        {regretPrediction && (
          <Card
            className={`${
              regretPrediction.recommendation === 'high-risk'
                ? 'bg-error/10 border-error/30'
                : regretPrediction.recommendation === 'medium-risk'
                ? 'bg-warning/10 border-warning/30'
                : 'bg-success/10 border-success/30'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  regretPrediction.recommendation === 'high-risk'
                    ? 'text-error'
                    : regretPrediction.recommendation === 'medium-risk'
                    ? 'text-warning'
                    : 'text-success'
                }`}
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Regret Prediction</h3>
                <p className="text-sm text-base-content/70 mb-3">
                  {regretPrediction.message}
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Predicted Regret Score</span>
                      <span className="font-semibold">{regretPrediction.predictedScore}/100</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          regretPrediction.predictedScore >= 70
                            ? 'bg-error'
                            : regretPrediction.predictedScore >= 40
                            ? 'bg-warning'
                            : 'bg-success'
                        }`}
                        style={{ width: `${regretPrediction.predictedScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-base-content/60">
                    Confidence: {(regretPrediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold mb-2">Think About It</h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li>• Do you really need this right now?</li>
            <li>• Can you afford it without affecting your savings?</li>
            <li>• Will you still want it in a week?</li>
            <li>• Is there a cheaper alternative?</li>
          </ul>
        </Card>
        </div>
      </div>

      {/* Gamification Messages */}
      <AnimatePresence>
        {showSkipMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSkipMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-base-100 rounded-2xl p-8 max-w-md text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-4"
              >
                <Trophy className="w-16 h-16 mx-auto text-warning" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-success-400 to-warning-400 bg-clip-text text-transparent">
                +20 XP for resisting
              </h3>
              <p className="text-base-content/70 mb-4">
                You just avoided regret worth approx {formatCurrency(impulse.price)}.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="w-8 h-8 mx-auto text-primary animate-pulse" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {showBuyMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBuyMessage(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-base-100 rounded-2xl p-8 max-w-md text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-base-content/70">
                Okay. Just make sure it still feels right tomorrow.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

