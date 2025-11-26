import { useState } from 'react';
import { Impulse } from '@/types/impulse';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatCurrency } from '@/utils/format';
import { X } from 'lucide-react';

interface RegretCheckModalProps {
  impulse: Impulse;
  onClose: () => void;
  onSave: (regretScore: number, notes: string) => void;
}

export function RegretCheckModal({ impulse, onClose, onSave }: RegretCheckModalProps) {
  const [regretScore, setRegretScore] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(regretScore, notes);
    onClose();
  };

  const getRegretLabel = (score: number) => {
    if (score === 0) return 'No regret';
    if (score < 30) return 'A little regret';
    if (score < 60) return 'Some regret';
    if (score < 80) return 'Regretful';
    return 'Very regretful';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Regret Check</h2>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-base-content/70 mb-2">
            3 days ago you bought:
          </p>
          <div className="bg-base-200/50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg">{impulse.title}</h3>
            <p className="text-primary text-xl font-bold mt-1">
              {formatCurrency(impulse.price)}
            </p>
          </div>
          <p className="text-base-content/70 mb-4">
            Do you regret it?
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/70">Regret Level</span>
            <span className="text-sm font-semibold">{getRegretLabel(regretScore)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={regretScore}
            onChange={(e) => setRegretScore(parseInt(e.target.value))}
            className="range range-primary w-full"
          />
          <div className="flex justify-between text-xs text-base-content/50 mt-1">
            <span>No regret</span>
            <span>High regret</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="label">
            <span className="label-text">Why? (Optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full backdrop-blur-xl bg-base-200/30 border-base-300/50"
            placeholder="Tell us why you regret or don't regret this purchase..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Skip
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}

