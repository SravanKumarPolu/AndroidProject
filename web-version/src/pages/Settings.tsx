import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Moon, Sun, Monitor, Bell, BellOff, Target, Plus, Trash2, Check, 
  Download, Upload, Database, Shield, Info, Mail, Github, Palette, Clock,
  X, AlertTriangle, User, Cloud, CloudOff, Terminal
} from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { ImpulseCategory } from '@/types/impulse';
import { useTheme } from '@/hooks/useTheme';

const ACCENT_COLORS = [
  { name: 'Blue', value: 'blue', class: 'primary' },
  { name: 'Purple', value: 'purple', class: 'secondary' },
  { name: 'Teal', value: 'teal', class: 'accent' },
];

const CATEGORIES: ImpulseCategory[] = ['food', 'shopping', 'entertainment', 'subscription', 'gadget', 'clothing', 'other'];

export function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const { settings, goals, impulses, updateSettings, addGoal, updateGoal, deleteGoal, loadFromDB } = useImpulseStore();
  const { theme, toggleTheme } = useTheme();
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Category limits state
  const [categoryLimits, setCategoryLimits] = useState<Record<ImpulseCategory, { weekly?: number; monthly?: number }>>(() => {
    return CATEGORIES.reduce((acc, cat) => {
      acc[cat] = settings.categoryLimits?.[cat] || {};
      return acc;
    }, {} as Record<ImpulseCategory, { weekly?: number; monthly?: number }>);
  });

  // Update category limits when settings change
  useEffect(() => {
    const newLimits = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = settings.categoryLimits?.[cat] || {};
      return acc;
    }, {} as Record<ImpulseCategory, { weekly?: number; monthly?: number }>);
    setCategoryLimits(newLimits);
  }, [settings.categoryLimits]);

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

  const handleExportData = () => {
    const data = {
      impulses,
      goals,
      settings,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impulsevault-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (data.impulses && Array.isArray(data.impulses)) {
        // Import logic would go here - for now just show alert
        alert('Import functionality will be available soon. This will restore your impulses, goals, and settings.');
      }
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleClearData = async () => {
    if (!showClearDataConfirm) {
      setShowClearDataConfirm(true);
      return;
    }

    // Clear all data
    localStorage.clear();
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('impulsevault');
    }
    
    // Reload page to reset app
    window.location.reload();
  };

  const handleCategoryLimitChange = (category: ImpulseCategory, type: 'weekly' | 'monthly', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setCategoryLimits(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: numValue,
      },
    }));
    
    // Save to settings
    updateSettings({
      categoryLimits: {
        ...settings.categoryLimits,
        [category]: {
          ...(settings.categoryLimits?.[category] || {}),
          [type]: numValue,
        },
      },
    });
  };

  const activeGoals = goals.filter((g) => !g.achievedAt);
  const achievedGoals = goals.filter((g) => g.achievedAt);
  const isLoggedIn = settings.cloudSyncEnabled && settings.cloudSyncUrl && settings.cloudSyncKey;

  return (
    <motion.div
      className="min-h-screen p-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="title-xl mb-2">Settings</h1>
              <p className="body-md text-base-content/70">Customize your experience</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setSearchParams({ tab: 'general' })}
              className={`btn btn-sm whitespace-nowrap ${activeTab === 'general' ? 'btn-primary' : 'btn-ghost'}`}
            >
              General
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'profile' })}
              className={`btn btn-sm whitespace-nowrap ${activeTab === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'categories' })}
              className={`btn btn-sm whitespace-nowrap ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Categories
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'goals' })}
              className={`btn btn-sm whitespace-nowrap ${activeTab === 'goals' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Goals
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'privacy' })}
              className={`btn btn-sm whitespace-nowrap ${activeTab === 'privacy' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Privacy
            </button>
          </div>

          {/* Profile & Mode */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="title-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile & Mode
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-base-200/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Storage Mode</span>
                    <div className="flex items-center gap-2">
                      {isLoggedIn ? (
                        <>
                          <Cloud className="w-5 h-5 text-primary" />
                          <span className="text-sm text-primary">Logged In</span>
                        </>
                      ) : (
                        <>
                          <CloudOff className="w-5 h-5 text-base-content/60" />
                          <span className="text-sm text-base-content/60">Local-only</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-base-content/60 mt-1">
                    {isLoggedIn 
                      ? 'Your data is synced to the cloud and accessible across devices.'
                      : 'Your data is stored locally on this device only. No account required.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  
                  <label className="btn btn-outline w-full cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import / Restore
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <>
              <Card>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Moon className="w-5 h-5 text-primary" />
                    <h2 className="title-lg">Appearance</h2>
                  </div>
                  <p className="text-sm text-base-content/70">
                    {settings.theme === 'system' 
                      ? 'Following system preference' 
                      : settings.theme === 'dark' 
                      ? 'Dark mode enabled' 
                      : settings.theme === 'light'
                      ? 'Light mode enabled'
                      : 'Terminal mode enabled'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* Theme Selection Buttons */}
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                        { value: 'terminal', label: 'Terminal', icon: Terminal },
                      ].map(({ value, label, icon: Icon }) => {
                        const isActive = settings.theme === value || (value === 'terminal' && settings.theme === 'dark');
                        return (
                          <motion.button
                            key={value}
                            onClick={() => {
                              const newTheme = value === 'terminal' ? 'dark' : value as 'light' | 'dark' | 'system';
                              updateSettings({ theme: newTheme });
                              if (newTheme !== 'system') {
                                const root = document.documentElement;
                                root.setAttribute('data-theme', newTheme);
                              } else {
                                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                const root = document.documentElement;
                                root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                              }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl border-2 transition-all min-h-[52px] w-full ${
                              isActive
                                ? 'bg-primary/20 border-primary text-primary shadow-sm shadow-primary/20'
                                : 'bg-base-200/50 border-base-300/50 text-base-content/70 hover:bg-base-200/70 hover:border-base-300'
                            }`}
                          >
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-base-content/60'}`} />
                            <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-primary' : 'text-base-content/70'}`}>
                              {label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Accent Color</span>
                    </label>
                    <div className="flex gap-3 mt-2">
                      {ACCENT_COLORS.map((color) => {
                        const isSelected = (settings.accentColor || 'blue') === color.value;
                        const colorClasses: Record<string, string> = {
                          blue: 'bg-blue-500',
                          purple: 'bg-purple-500',
                          teal: 'bg-teal-500',
                        };
                        return (
                          <motion.button
                            key={color.value}
                            onClick={() => updateSettings({ accentColor: color.value as 'blue' | 'purple' | 'teal' })}
                            className={`w-12 h-12 rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-primary scale-110'
                                : 'border-base-300'
                            } ${colorClasses[color.value]}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="title-lg mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications / Nudges
                </h2>
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
                    <motion.input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.notifications}
                      onChange={(e) => updateSettings({ notifications: e.target.checked })}
                      whileTap={{ scale: 0.95 }}
                    />
                  </div>
                  
                  {settings.notifications && (
                    <div className="space-y-3 pl-8 border-l-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Nightly reminder</span>
                          <p className="text-xs text-base-content/60">If you had impulses today</p>
                        </div>
                        <motion.input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={settings.nightlyReminder || false}
                          onChange={(e) => updateSettings({ nightlyReminder: e.target.checked })}
                          whileTap={{ scale: 0.95 }}
                        />
                      </div>
                      
                      {settings.nightlyReminder && (
                        <div className="ml-4">
                          <label className="label">
                            <span className="label-text text-xs">Reminder Time</span>
                          </label>
                          <input
                            type="time"
                            className="input input-bordered input-sm w-full"
                            value={settings.reminderTime || '21:00'}
                            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Shopping app prompt</span>
                          <p className="text-xs text-base-content/60">Future: Prompt if you open shopping links</p>
                        </div>
                        <motion.input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={settings.shoppingAppPrompt || false}
                          onChange={(e) => updateSettings({ shoppingAppPrompt: e.target.checked })}
                          whileTap={{ scale: 0.95 }}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reminder to log impulses</span>
                        <motion.input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={settings.reminderToLog}
                          onChange={(e) => updateSettings({ reminderToLog: e.target.checked })}
                          whileTap={{ scale: 0.95 }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly report summary</span>
                        <motion.input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={settings.weeklyReportSummary}
                          onChange={(e) => updateSettings({ weeklyReportSummary: e.target.checked })}
                          whileTap={{ scale: 0.95 }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Regret check reminders</span>
                        <motion.input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={settings.regretCheckReminders}
                          onChange={(e) => updateSettings({ regretCheckReminders: e.target.checked })}
                          whileTap={{ scale: 0.95 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="title-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cooldown Period
                </h2>
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
                <h2 className="title-lg mb-4 flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud Sync
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Enable Cloud Sync</span>
                      <p className="text-xs text-base-content/70 mt-1">
                        Sync your data across devices (optional)
                      </p>
                    </div>
                    <motion.input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.cloudSyncEnabled}
                      onChange={(e) => updateSettings({ cloudSyncEnabled: e.target.checked })}
                      whileTap={{ scale: 0.95 }}
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
                <h2 className="title-lg mb-4">Smart Alerts</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Enable Smart Alerts</span>
                      <p className="text-xs text-base-content/70 mt-1">
                        Context-aware and predictive notifications
                      </p>
                    </div>
                    <motion.input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={settings.smartAlertsEnabled}
                      onChange={(e) => updateSettings({ smartAlertsEnabled: e.target.checked })}
                      whileTap={{ scale: 0.95 }}
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

          {/* Categories & Limits */}
          {activeTab === 'categories' && (
            <Card>
              <h2 className="title-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Categories & Limits
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Available Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        className="p-3 bg-base-200/30 rounded-lg text-center capitalize"
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider">
                  <span className="text-sm font-medium">Soft Limits</span>
                </div>
                <p className="text-xs text-base-content/60 mb-4">
                  Set spending limits per category. You'll be notified when approaching these limits.
                </p>

                <div className="space-y-4">
                  {CATEGORIES.map((category) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-base-200/30 rounded-xl"
                    >
                      <h4 className="font-semibold capitalize mb-3">{category}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">
                            <span className="label-text text-xs">Weekly Limit (₹)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            className="input input-bordered input-sm w-full"
                            placeholder="No limit"
                            value={categoryLimits[category]?.weekly || ''}
                            onChange={(e) => handleCategoryLimitChange(category, 'weekly', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text text-xs">Monthly Limit (₹)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            className="input input-bordered input-sm w-full"
                            placeholder="No limit"
                            value={categoryLimits[category]?.monthly || ''}
                            onChange={(e) => handleCategoryLimitChange(category, 'monthly', e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Goals Settings */}
          {activeTab === 'goals' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="title-lg flex items-center gap-2">
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

          {/* Privacy & Data */}
          {activeTab === 'privacy' && (
            <>
              <Card>
                <h2 className="title-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Data
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-base-200/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-primary" />
                      <span className="font-medium">Local-only Storage</span>
                    </div>
                    <p className="text-sm text-base-content/70 mb-2">
                      Your data is stored locally on this device using IndexedDB. No data is sent to external servers unless you explicitly enable cloud sync.
                    </p>
                    <ul className="text-xs text-base-content/60 space-y-1 list-disc list-inside">
                      <li>All impulses, goals, and settings are stored locally</li>
                      <li>No account required for basic usage</li>
                      <li>Cloud sync is completely optional</li>
                      <li>You can export your data at any time</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-error" />
                      <span className="font-medium text-error">Clear All Data</span>
                    </div>
                    <p className="text-sm text-base-content/70 mb-3">
                      This will permanently delete all your impulses, goals, and settings. This action cannot be undone.
                    </p>
                    {!showClearDataConfirm ? (
                      <Button
                        variant="outline"
                        onClick={handleClearData}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-error">Are you absolutely sure?</p>
                        <div className="flex gap-2">
                          <Button
                            variant="error"
                            onClick={handleClearData}
                            className="flex-1"
                          >
                            Yes, Delete Everything
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowClearDataConfirm(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="title-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">ImpulseVault</p>
                    <p className="text-sm text-base-content/70 mb-2">
                      Lock your impulses. Free your future.
                    </p>
                    <p className="text-xs text-base-content/60">
                      Version 2.0.0
                    </p>
                  </div>

                  <div className="divider">Credits</div>

                  <div className="space-y-2">
                    <p className="text-sm text-base-content/70">
                      Built with React, TypeScript, Tailwind CSS, and DaisyUI.
                    </p>
                    <p className="text-sm text-base-content/70">
                      Icons by Lucide React.
                    </p>
                    <p className="text-sm text-base-content/70">
                      Charts by Recharts.
                    </p>
                  </div>

                  <div className="divider">Feedback</div>

                  <div className="space-y-2">
                    <a
                      href="mailto:feedback@impulsevault.app"
                      className="btn btn-outline w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Feedback
                    </a>
                    <a
                      href="https://github.com/impulsevault/impulsevault"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline w-full"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View on GitHub
                    </a>
                  </div>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
