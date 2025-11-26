import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { GlassButton } from '@/components/ui/GlassButton';
import { Input } from '@/components/ui/Input';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { MoodSlider } from '@/components/ui/MoodSlider';
import { ImpulseCategory, UrgencyLevel, EmotionAtImpulse } from '@/types/impulse';
import { predictRegret } from '@/utils/regretPrediction';
import { getContextualAlert } from '@/services/smartAlerts';
import { ArrowLeft, Lock, Sparkles, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

const categories: ImpulseCategory[] = ['food', 'shopping', 'entertainment', 'subscription', 'gadget', 'clothing', 'other'];
const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high'];

export function NewImpulse() {
  const navigate = useNavigate();
  const { addImpulse, impulses, settings } = useImpulseStore();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ImpulseCategory | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState<EmotionAtImpulse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category || !price) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addImpulse({
        title: title.trim(),
        price: parseFloat(price),
        category,
        urgency,
        reason: reason.trim() || undefined,
        emotionAtImpulse: emotion || undefined,
      });

      // Small delay for better UX
      setTimeout(() => {
        navigate('/');
      }, 300);
    } catch (error) {
      console.error('Failed to add impulse:', error);
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && category && price && parseFloat(price) > 0;

  // Calculate regret prediction
  const regretPrediction = useMemo(() => {
    if (!isFormValid || !category || !price) return null;

    const tempImpulse = {
      title: title.trim(),
      price: parseFloat(price),
      category,
      urgency,
      reason: reason.trim() || undefined,
      emotionAtImpulse: emotion || undefined,
      createdAt: Date.now(), // Add for timeOfDay calculation
    };

    return predictRegret(tempImpulse, impulses);
  }, [title, price, category, urgency, emotion, reason, isFormValid, impulses]);

  // Smart contextual alert based on current emotion
  const contextualAlert = useMemo(() => {
    if (!settings.smartAlertsEnabled || !emotion) return null;
    return getContextualAlert(impulses, emotion);
  }, [emotion, impulses, settings.smartAlertsEnabled]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-6"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              New Impulse
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              Lock it away and think it over
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <Input
                label="What do you want to buy?"
                placeholder="e.g., New iPhone 15 Pro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <Input
                label="Price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
              {price && parseFloat(price) > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-base-content/60 mt-2"
                >
                  💰 You'll save this amount if you skip it
                </motion.p>
              )}
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <label className="label">
                <span className="label-text text-base-content/70">Category</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {categories.map((cat) => (
                  <CategoryPill
                    key={cat}
                    category={cat}
                    selected={category === cat}
                    onClick={() => setCategory(cat)}
                  />
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <label className="label">
                <span className="label-text text-base-content/70">Urgency Level</span>
              </label>
              <div className="flex gap-4 mt-2">
                {urgencyLevels.map((level) => (
                  <motion.label
                    key={level}
                    className="flex items-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={urgency === level}
                      onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                      className="radio radio-primary"
                    />
                    <span className="capitalize font-medium">{level}</span>
                  </motion.label>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="2"
                value={urgencyLevels.indexOf(urgency)}
                onChange={(e) => setUrgency(urgencyLevels[parseInt(e.target.value)])}
                className="range range-primary mt-4"
              />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <MoodSlider
                value={emotion}
                onChange={setEmotion}
              />
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <label className="label">
                <span className="label-text text-base-content/70">Reason (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full backdrop-blur-xl bg-base-200/30 border-base-300/50 mt-2 focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400/20 transition-all"
                placeholder="Why do you want this?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </Card>
          </motion.div>

          {/* Smart Contextual Alert */}
          {contextualAlert && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-warning/10 border-warning/30">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{contextualAlert.title}</h3>
                    <p className="text-xs text-base-content/70">{contextualAlert.message}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Regret Prediction */}
          {regretPrediction && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
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
                  {regretPrediction.recommendation === 'high-risk' ? (
                    <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
                  ) : regretPrediction.recommendation === 'medium-risk' ? (
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                  )}
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
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <GlassButton
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              glow={!!isFormValid}
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}
              className="relative overflow-hidden"
            >
              {!isSubmitting && (
                <motion.span
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Lock className="w-5 h-5" />
                  Lock This Impulse
                  <Sparkles className="w-4 h-4" />
                </motion.span>
              )}
            </GlassButton>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

