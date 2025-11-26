import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImpulseCategory } from '@/types/impulse';
import { Database, Cloud, Check, X } from 'lucide-react';

const defaultCategories: Array<{ id: ImpulseCategory; label: string; icon: string }> = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'shopping', label: 'Swiggy/Zomato', icon: '🍕' },
  { id: 'shopping', label: 'Amazon', icon: '📦' },
  { id: 'shopping', label: 'Flipkart', icon: '🛒' },
  { id: 'subscription', label: 'Courses', icon: '📚' },
  { id: 'gadget', label: 'Gadgets', icon: '📱' },
  { id: 'shopping', label: 'Trading', icon: '📈' },
  { id: 'subscription', label: 'Subscriptions', icon: '🎬' },
];

const presetGoals = [
  { id: 'food-delivery', label: 'Spend less on food delivery', icon: '🍕' },
  { id: 'amazon', label: 'Stop random Amazon orders', icon: '📦' },
  { id: 'late-night', label: 'Reduce late-night purchases', icon: '🌙' },
];

export function Setup() {
  const navigate = useNavigate();
  const { updateSettings } = useImpulseStore();
  const [storageMode, setStorageMode] = useState<'local' | 'sync'>('local');
  const [selectedCategories, setSelectedCategories] = useState<Set<ImpulseCategory>>(
    new Set(['food', 'shopping', 'entertainment', 'subscription', 'gadget'])
  );
  const [impulseBudget, setImpulseBudget] = useState(5000);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const handleCategoryToggle = (category: ImpulseCategory) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedCategories(newSet);
  };

  const handleFinish = async () => {
    // Validate: at least one category selected
    if (selectedCategories.size === 0) {
      return;
    }

    // Validate: either preset goal or custom goal must be provided
    if (!selectedGoal && !customGoal.trim()) {
      return;
    }

    setIsFinishing(true);
    
    // Save settings
    await updateSettings({
      cloudSyncEnabled: storageMode === 'sync',
    });

    // Save selected categories (could be stored in settings or localStorage)
    localStorage.setItem('selectedCategories', JSON.stringify(Array.from(selectedCategories)));
    localStorage.setItem('impulseBudget', impulseBudget.toString());
    localStorage.setItem('userGoal', selectedGoal || customGoal.trim());
    localStorage.setItem('hasCompletedSetup', 'true');

    // Navigate to home
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const allCategories: ImpulseCategory[] = ['food', 'shopping', 'entertainment', 'subscription', 'gadget', 'clothing', 'other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            Quick Setup
          </h1>
          <p className="text-base-content/70">Let's personalize your ImpulseVault experience</p>
        </motion.div>

        {/* Storage Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-4">Storage Mode</h2>
            <div className="space-y-3">
              <button
                onClick={() => setStorageMode('local')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  storageMode === 'local'
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-base-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className={`w-6 h-6 ${storageMode === 'local' ? 'text-primary' : 'text-base-content/70'}`} />
                  <div className="flex-1">
                    <div className="font-semibold">Local-only (no account)</div>
                    <div className="text-sm text-base-content/70">Your data stays on this device</div>
                  </div>
                  {storageMode === 'local' && <Check className="w-5 h-5 text-primary" />}
                </div>
              </button>

              <button
                onClick={() => setStorageMode('sync')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  storageMode === 'sync'
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-base-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cloud className={`w-6 h-6 ${storageMode === 'sync' ? 'text-primary' : 'text-base-content/70'}`} />
                  <div className="flex-1">
                    <div className="font-semibold">Sign in (sync later)</div>
                    <div className="text-sm text-base-content/70">Optional: Sync across devices</div>
                  </div>
                  {storageMode === 'sync' && <Check className="w-5 h-5 text-primary" />}
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <p className="text-sm text-base-content/70 mb-4">Select categories you want to track</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const isSelected = selectedCategories.has(category);
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-base-300 hover:border-base-400'
                    }`}
                  >
                    <span className="capitalize">{category}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4 text-base-content/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Impulse Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-4">Monthly Impulse Budget</h2>
            <p className="text-sm text-base-content/70 mb-4">Set a soft limit for impulse spending (₹2,000–₹20,000)</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={impulseBudget}
                  onChange={(e) => setImpulseBudget(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="text-2xl font-bold tabular-nums min-w-[100px] text-right">
                  ₹{impulseBudget.toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between text-xs text-base-content/60">
                <span>₹2,000</span>
                <span>₹20,000</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h2 className="text-xl font-semibold mb-4">Your Goal</h2>
            <p className="text-sm text-base-content/70 mb-4">Choose a goal to focus on</p>
            <div className="space-y-3">
              {presetGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal.id);
                    setCustomGoal('');
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedGoal === goal.id
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-base-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1 font-medium">{goal.label}</div>
                    {selectedGoal === goal.id && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              ))}

              <div className="pt-3 border-t border-base-300">
                <label className="label">
                  <span className="label-text">Or write your own goal</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Save for vacation"
                  value={customGoal}
                  onChange={(e) => {
                    setCustomGoal(e.target.value);
                    setSelectedGoal(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customGoal.trim() && selectedCategories.size > 0) {
                      handleFinish();
                    }
                  }}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Finish Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(99, 102, 241, 0.3)',
                '0 0 30px rgba(99, 102, 241, 0.5)',
                '0 0 20px rgba(99, 102, 241, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Button
              fullWidth
              variant="primary"
              onClick={handleFinish}
              disabled={isFinishing || selectedCategories.size === 0 || (!selectedGoal && !customGoal.trim())}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg shadow-primary-500/20 text-lg py-4"
            >
              {isFinishing ? 'Setting up...' : 'Finish Setup'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

