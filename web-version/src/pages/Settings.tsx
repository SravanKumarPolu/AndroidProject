import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Moon, Sun, Bell, BellOff, Target, Plus, Trash2, Check } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const { settings, goals, updateSettings, addGoal, updateGoal, deleteGoal } = useImpulseStore();
  
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (editingGoalId) {
      const goal = goals.find((g) => g.id === editingGoalId);
      if (goal) {
        setGoalTitle(goal.title);
        setGoalAmount(goal.targetAmount.toString());
        setGoalDescription(goal.description || '');
      }
    } else {
      setGoalTitle('');
      setGoalAmount('');
      setGoalDescription('');
    }
  }, [editingGoalId, goals]);

  const handleSaveGoal = async () => {
    if (!goalTitle.trim() || !goalAmount) return;

    if (editingGoalId) {
      await updateGoal(editingGoalId, {
        title: goalTitle.trim(),
        targetAmount: parseFloat(goalAmount),
        description: goalDescription.trim() || undefined,
      });
      setEditingGoalId(null);
    } else {
      await addGoal({
        title: goalTitle.trim(),
        targetAmount: parseFloat(goalAmount),
        description: goalDescription.trim() || undefined,
      });
    }
    setGoalTitle('');
    setGoalAmount('');
    setGoalDescription('');
  };

  const activeGoals = goals.filter((g) => !g.achievedAt);
  const achievedGoals = goals.filter((g) => g.achievedAt);

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              Customize your experience
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchParams({ tab: 'general' })}
            className={`btn btn-sm ${activeTab === 'general' ? 'btn-primary' : 'btn-ghost'}`}
          >
            General
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'goals' })}
            className={`btn btn-sm ${activeTab === 'goals' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Goals
          </button>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <>
            <Card>
              <h2 className="text-xl font-bold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <span>Theme</span>
              </div>
              <select
                className="select select-bordered"
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.notifications ? (
                  <Bell className="w-5 h-5" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
                <span>Enable Notifications</span>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.notifications}
                onChange={(e) => updateSettings({ notifications: e.target.checked })}
              />
            </div>
            {settings.notifications && (
              <div className="space-y-3 pl-8 border-l-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reminder to log impulses</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={settings.reminderToLog}
                    onChange={(e) => updateSettings({ reminderToLog: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly report summary</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={settings.weeklyReportSummary}
                    onChange={(e) => updateSettings({ weeklyReportSummary: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regret check reminders</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={settings.regretCheckReminders}
                    onChange={(e) => updateSettings({ regretCheckReminders: e.target.checked })}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Cooldown Period</h2>
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Default Cooldown (hours)</span>
                <span className="label-text-alt">{settings.defaultCooldownHours} hours</span>
              </label>
              <input
                type="range"
                min="1"
                max="72"
                value={settings.defaultCooldownHours}
                onChange={(e) => updateSettings({ defaultCooldownHours: parseInt(e.target.value) })}
                className="range range-primary"
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>1h</span>
                <span>24h</span>
                <span>72h</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Cloud Sync Settings */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Cloud Sync</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Enable Cloud Sync</span>
                <p className="text-xs text-base-content/70 mt-1">
                  Sync your data across devices (optional)
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.cloudSyncEnabled}
                onChange={(e) => updateSettings({ cloudSyncEnabled: e.target.checked })}
              />
            </div>
            {settings.cloudSyncEnabled && (
              <div className="space-y-3 pl-8 border-l-2 border-primary/20">
                <div>
                  <label className="label">
                    <span className="label-text text-sm">Supabase URL (Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    placeholder="https://your-project.supabase.co"
                    value={settings.cloudSyncUrl || ''}
                    onChange={(e) => updateSettings({ cloudSyncUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-sm">Supabase Key (Optional)</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full input-sm"
                    placeholder="Your Supabase anon key"
                    value={settings.cloudSyncKey || ''}
                    onChange={(e) => updateSettings({ cloudSyncKey: e.target.value })}
                  />
                </div>
                <p className="text-xs text-base-content/60">
                  💡 Cloud sync is optional. Your data is stored locally by default.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Smart Alerts Settings */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Smart Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Enable Smart Alerts</span>
                <p className="text-xs text-base-content/70 mt-1">
                  Context-aware and predictive notifications
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.smartAlertsEnabled}
                onChange={(e) => updateSettings({ smartAlertsEnabled: e.target.checked })}
              />
            </div>
            {settings.smartAlertsEnabled && (
              <div className="pl-8 border-l-2 border-primary/20">
                <p className="text-xs text-base-content/60">
                  ✨ Smart alerts include:
                </p>
                <ul className="text-xs text-base-content/60 mt-2 space-y-1 list-disc list-inside">
                  <li>Time-based pattern warnings</li>
                  <li>Emotional trigger alerts</li>
                  <li>Spending trend notifications</li>
                  <li>Achievement celebrations</li>
                  <li>Category risk warnings</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
          </>
        )}

        {/* Goals Settings */}
        {activeTab === 'goals' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5" />
                Savings Goals
              </h2>
              <span className="badge badge-primary">{activeGoals.length} active</span>
            </div>

          {/* Add/Edit Goal Form */}
          <div className="space-y-3 mb-6 p-4 bg-base-200/50 rounded-lg">
            <Input
              label="Goal Title"
              placeholder="e.g., MacBook Air"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
            />
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
            <div>
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full backdrop-blur-xl bg-base-200/30 border-base-300/50"
                placeholder="Why is this goal important?"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSaveGoal}
                disabled={!goalTitle.trim() || !goalAmount}
                className="flex-1"
              >
                {editingGoalId ? 'Update Goal' : 'Add Goal'}
              </Button>
              {editingGoalId && (
                <Button
                  variant="outline"
                  onClick={() => setEditingGoalId(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-3 mb-4">
              <h3 className="font-semibold text-sm text-base-content/70">Active Goals</h3>
              {activeGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 bg-base-200/50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{goal.title}</div>
                    <div className="text-sm text-base-content/70">
                      {formatCurrency(goal.targetAmount)}
                      {goal.description && ` • ${goal.description}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingGoalId(goal.id)}
                      className="btn btn-sm btn-ghost"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => updateGoal(goal.id, { achievedAt: Date.now() })}
                      className="btn btn-sm btn-success"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="btn btn-sm btn-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achieved Goals */}
          {achievedGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-base-content/70">Achieved Goals</h3>
              {achievedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 bg-success/10 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      {goal.title}
                    </div>
                    <div className="text-sm text-base-content/70">
                      {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="btn btn-sm btn-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

            {goals.length === 0 && (
              <p className="text-center text-base-content/70 py-4">
                No goals yet. Add your first savings goal above!
              </p>
            )}
          </Card>
        )}

        <Card>
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-base-content/70 mb-2">
            <strong>ImpulseVault</strong> - Lock your impulses. Free your future.
          </p>
          <p className="text-sm text-base-content/50">
            Version 2.0.0
          </p>
        </Card>
      </div>
    </div>
  );
}

