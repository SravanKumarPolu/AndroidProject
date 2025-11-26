import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GlassButton } from '@/components/ui/GlassButton';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Confetti } from '@/components/Confetti';
import { formatCurrency } from '@/utils/format';
import { predictRegret } from '@/utils/regretPrediction';
import { CheckCircle, XCircle, Clock, ArrowLeft, AlertTriangle } from 'lucide-react';

export function Decision() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { impulses, makeDecision } = useImpulseStore();
  const [showConfetti, setShowConfetti] = useState(false);

  // Get impulse from URL param or find first pending decision
  const impulse = id
    ? impulses.find((i) => i.id === id)
    : impulses.find((i) => i.status === 'decision');

  // Calculate regret prediction
  const regretPrediction = useMemo(() => {
    if (!impulse) return null;
    return predictRegret(impulse, impulses.filter((i) => i.id !== impulse.id));
  }, [impulse, impulses]);

  const handleDecision = async (decision: 'skip' | 'buy' | 'save-later') => {
    if (!impulse) return;

    try {
      await makeDecision(impulse.id, decision);
    } catch (error) {
      console.error('Failed to make decision:', error);
      return;
    }

    // Show confetti if skipping
    if (decision === 'skip') {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
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
            {impulse.reason && (
              <p className="text-base-content/70 italic">"{impulse.reason}"</p>
            )}
          </div>

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
              Skip It - Save {formatCurrency(impulse.price)}
            </GlassButton>

            <GlassButton
              fullWidth
              variant="accent"
              size="lg"
              onClick={() => handleDecision('buy')}
              className="flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Buy It Anyway
            </GlassButton>

            <GlassButton
              fullWidth
              variant="outline"
              size="lg"
              onClick={() => handleDecision('save-later')}
              className="flex items-center justify-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Save for Later
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
    </>
  );
}

