import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { ImpulseCategory, Impulse } from '@/types/impulse';
import { ArrowLeft, Filter, Calendar, ChevronDown, X } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';

type TimeRange = 'today' | 'week' | 'month' | 'all' | 'custom';
type Outcome = 'all' | 'resisted' | 'bought';

// Category icons mapping
const categoryIcons: Record<ImpulseCategory, string> = {
  food: '🍔',
  shopping: '🛍️',
  entertainment: '🎬',
  subscription: '📱',
  gadget: '💻',
  clothing: '👕',
  other: '📦',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  skipped: { label: 'Resisted', color: 'badge-success' },
  bought: { label: 'Bought', color: 'badge-error' },
  saved_for_later: { label: 'Saved for Later', color: 'badge-accent' },
  cooldown: { label: 'In Cooldown', color: 'badge-warning' },
  decision: { label: 'Ready', color: 'badge-primary' },
  pending: { label: 'Pending', color: 'badge-ghost' },
};

export function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { impulses } = useImpulseStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [outcome, setOutcome] = useState<Outcome>('all');
  const [filterCategory, setFilterCategory] = useState<ImpulseCategory | 'all'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const customDatePickerRef = useRef<HTMLDivElement>(null);

  const categories: ImpulseCategory[] = ['food', 'shopping', 'entertainment', 'subscription', 'gadget', 'clothing', 'other'];

  // Handle category filter from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam as ImpulseCategory)) {
      setFilterCategory(categoryParam as ImpulseCategory);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, categories]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      // Custom date picker stays open when clicking outside (user needs to select dates)
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate time range boundaries
  const getTimeRange = useMemo(() => {
    const now = Date.now();
    switch (timeRange) {
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return { start: todayStart.getTime(), end: now };
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        return { start: weekStart.getTime(), end: now };
      case 'month':
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - 1);
        monthStart.setHours(0, 0, 0, 0);
        return { start: monthStart.getTime(), end: now };
      case 'custom':
        if (customDateStart && customDateEnd) {
          const start = new Date(customDateStart);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customDateEnd);
          end.setHours(23, 59, 59, 999);
          return { start: start.getTime(), end: end.getTime() };
        }
        return { start: 0, end: now };
      default:
        return { start: 0, end: now };
    }
  }, [timeRange, customDateStart, customDateEnd]);

  // Filter impulses
  const filteredImpulses = useMemo(() => {
    return impulses
      .filter((imp: Impulse) => {
        // Time range filter
        if (timeRange !== 'all') {
          const { start, end } = getTimeRange;
          if (imp.createdAt < start || imp.createdAt > end) return false;
        }

        // Category filter
        if (filterCategory !== 'all' && imp.category !== filterCategory) return false;

        // Outcome filter
        if (outcome !== 'all') {
          const status = imp.decisionAtEnd || imp.status;
          if (outcome === 'resisted' && status !== 'skipped') return false;
          if (outcome === 'bought' && status !== 'bought') return false;
        }

        return true;
      })
      .sort((a: Impulse, b: Impulse) => b.createdAt - a.createdAt);
  }, [impulses, timeRange, getTimeRange, filterCategory, outcome]);

  const getCategoryLabel = (cat: ImpulseCategory | 'all') => {
    if (cat === 'all') return 'All Categories';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost backdrop-blur-xl bg-base-200/30 border border-base-300/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 bg-clip-text text-transparent">
            Impulses
          </h1>
        </div>

        {/* Filters Row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h2 className="font-semibold">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Time Range */}
              <div>
                <label className="label">
                  <span className="label-text">Time Range</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['today', 'week', 'month', 'all', 'custom'] as TimeRange[]).map((range) => (
                    <motion.button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`btn btn-sm capitalize ${
                        timeRange === range ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      {range === 'all' ? 'All Time' : range}
                    </motion.button>
                  ))}
                </div>
                {/* Custom Date Picker */}
                {timeRange === 'custom' && (
                  <motion.div
                    ref={customDatePickerRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 p-3 bg-base-200/30 rounded-lg border border-base-300/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Custom Range</span>
                      <button
                        onClick={() => {
                          setTimeRange('all');
                          setCustomDateStart('');
                          setCustomDateEnd('');
                        }}
                        className="btn btn-xs btn-ghost"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label label-text text-xs">Start Date</label>
                        <input
                          type="date"
                          value={customDateStart}
                          onChange={(e) => setCustomDateStart(e.target.value)}
                          max={customDateEnd || new Date().toISOString().split('T')[0]}
                          className="input input-sm input-bordered w-full"
                        />
                      </div>
                      <div>
                        <label className="label label-text text-xs">End Date</label>
                        <input
                          type="date"
                          value={customDateEnd}
                          onChange={(e) => setCustomDateEnd(e.target.value)}
                          min={customDateStart}
                          max={new Date().toISOString().split('T')[0]}
                          className="input input-sm input-bordered w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Outcome */}
              <div>
                <label className="label">
                  <span className="label-text">Outcome</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'resisted', 'bought'] as Outcome[]).map((out) => (
                    <motion.button
                      key={out}
                      onClick={() => setOutcome(out)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`btn btn-sm capitalize ${
                        outcome === out ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      {out === 'all' ? 'All' : out}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <div className="relative" ref={categoryDropdownRef}>
                  <motion.button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="btn btn-sm btn-ghost w-full justify-between"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{getCategoryLabel(filterCategory)}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showCategoryDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>
                  <AnimatePresence>
                    {showCategoryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-base-100 rounded-lg border border-base-300/50 shadow-lg z-10 backdrop-blur-xl"
                      >
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              setFilterCategory('all');
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              filterCategory === 'all'
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-base-200/50'
                            }`}
                          >
                            All Categories
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setFilterCategory(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                filterCategory === cat
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-base-200/50'
                              }`}
                            >
                              <span>{categoryIcons[cat]}</span>
                              <span className="capitalize">{cat}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Impulses List */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filteredImpulses.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="text-center py-16">
                  <div className="text-8xl mb-6">🎯</div>
                  <h3 className="text-2xl font-bold mb-3">This vault is empty.</h3>
                  <p className="text-base-content/70 mb-6 max-w-md mx-auto text-lg">
                    The next time you feel an urge to spend, capture it here before you buy.
                  </p>
                  <motion.button
                    onClick={() => navigate('/new-impulse')}
                    className="btn btn-primary btn-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Log Your First Impulse
                  </motion.button>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredImpulses.map((impulse: Impulse, index: number) => {
                  const status = impulse.decisionAtEnd || impulse.status;
                  const statusInfo = statusConfig[status] || statusConfig.pending;
                  return (
                    <motion.div
                      key={impulse.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="p-4 cursor-pointer hover:bg-base-200/40 hover:border-primary/30 transition-all"
                        onClick={() => {
                          if (impulse.status === 'cooldown') {
                            navigate(`/cooldown/${impulse.id}`);
                          } else if (impulse.status === 'decision') {
                            navigate(`/decision/${impulse.id}`);
                          } else {
                            navigate(`/impulses/${impulse.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Left: Category icon + title */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                              {categoryIcons[impulse.category]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg truncate mb-1">
                                {impulse.title}
                              </h3>
                              {/* Middle: Date + urge strength */}
                              <div className="flex items-center gap-3 text-sm text-base-content/60">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(impulse.createdAt), 'MMM d, yyyy')}
                                </span>
                                {impulse.urgeStrength && (
                                  <span className="badge badge-xs badge-warning">
                                    Urge: {impulse.urgeStrength}/10
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount + status pill */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                                {formatCurrency(impulse.price)}
                              </div>
                            </div>
                            <span className={`badge badge-sm ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
