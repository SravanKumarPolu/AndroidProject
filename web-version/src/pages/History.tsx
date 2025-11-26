import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useImpulseStore } from '@/store/impulseStore';
import { Card } from '@/components/ui/Card';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { ImpulseCard } from '@/components/ui/ImpulseCard';
import { ImpulseCategory, ImpulseStatus, Impulse } from '@/types/impulse';
import { ArrowLeft, Filter } from 'lucide-react';

export function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { impulses } = useImpulseStore();
  const [filterCategory, setFilterCategory] = useState<ImpulseCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ImpulseStatus | 'saved_for_later' | 'all'>('all');

  const categories: ImpulseCategory[] = ['food', 'shopping', 'entertainment', 'subscription', 'gadget', 'clothing', 'other'];

  // Handle category filter from URL (e.g., from CategoryCard click)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam as ImpulseCategory)) {
      setFilterCategory(categoryParam as ImpulseCategory);
      setSearchParams({}); // Clear the param after setting
    }
  }, [searchParams, setSearchParams, categories]);
  const statuses: ImpulseStatus[] = ['pending', 'cooldown', 'decision', 'skipped', 'bought'];

  const filteredImpulses = impulses
    .filter((imp: Impulse) => {
      if (filterCategory !== 'all' && imp.category !== filterCategory) return false;
      if (filterStatus === 'saved_for_later') {
        return imp.decisionAtEnd === 'saved_for_later' || (imp.status === 'pending' && imp.finalDecision === 'save-later');
      }
      if (filterStatus !== 'all' && imp.status !== filterStatus) return false;
      return true;
    })
    .sort((a: Impulse, b: Impulse) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">History</h1>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h2 className="font-semibold">Filters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <CategoryPill
                    key={cat}
                    category={cat}
                    selected={filterCategory === cat}
                    onClick={() => setFilterCategory(cat)}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  All
                </button>
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`btn btn-sm capitalize ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {status}
                  </button>
                ))}
                <button
                  onClick={() => setFilterStatus('saved_for_later')}
                  className={`btn btn-sm ${filterStatus === 'saved_for_later' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  Saved for Later
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Impulses List */}
        <div className="space-y-3">
          {filteredImpulses.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">No impulses found</h3>
              <p className="text-base-content/70 mb-4">
                {filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first impulse!'}
              </p>
              {filterCategory !== 'all' || filterStatus !== 'all' ? (
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterStatus('all');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate('/new-impulse')}
                  className="btn btn-primary btn-sm"
                >
                  Add Impulse
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredImpulses.map((impulse: Impulse, index: number) => (
                <motion.div
                  key={impulse.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ImpulseCard
                    impulse={impulse}
                    onClick={() => {
                      if (impulse.status === 'cooldown') {
                        navigate(`/cooldown/${impulse.id}`);
                      } else if (impulse.status === 'decision') {
                        navigate(`/decision/${impulse.id}`);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

