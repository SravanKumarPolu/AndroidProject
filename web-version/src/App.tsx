import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NewImpulse } from './pages/NewImpulse';
import { Cooldown } from './pages/Cooldown';
import { Decision } from './pages/Decision';
import { History } from './pages/History';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { useImpulseStore } from './store/impulseStore';
import { RegretCheckModal } from './components/RegretCheckModal';

function AppContent() {
  useTheme(); // Initialize theme
  useNotifications(); // Initialize notifications
  const { loadFromDB, impulses, updateImpulse } = useImpulseStore();
  const location = useLocation();
  const [regretCheckImpulse, setRegretCheckImpulse] = useState<typeof impulses[0] | null>(null);

  useEffect(() => {
    // Load data on app start
    loadFromDB();
    
    // Periodic status update for cooldowns
    const interval = setInterval(() => {
      const { impulses, updateImpulse } = useImpulseStore.getState();
      const now = Date.now();
      
      impulses.forEach((impulse) => {
        if (impulse.status === 'cooldown' && impulse.cooldownEndsAt <= now) {
          updateImpulse(impulse.id, { status: 'decision' });
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [loadFromDB]);

  // Check for regret check prompts
  useEffect(() => {
    const now = Date.now();
    const { impulses } = useImpulseStore.getState();
    
    // Find impulses that need regret check
    const needsCheck = impulses.find(
      (imp) =>
        imp.decisionAtEnd === 'bought' &&
        imp.regretCheckAt &&
        imp.regretCheckAt <= now &&
        imp.regretScore === null
    );

    if (needsCheck && !regretCheckImpulse) {
      setRegretCheckImpulse(needsCheck);
    }
  }, [location.pathname, impulses, regretCheckImpulse]);

  const handleRegretSave = async (regretScore: number, notes: string) => {
    if (!regretCheckImpulse) return;
    
    await updateImpulse(regretCheckImpulse.id, {
      regretScore,
      notesAfterPurchase: notes || null,
      regretCheckAt: null, // Mark as done
    });
    
    setRegretCheckImpulse(null);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-impulse" element={<NewImpulse />} />
        <Route path="/cooldown/:id" element={<Cooldown />} />
        <Route path="/decision/:id?" element={<Decision />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {regretCheckImpulse && (
        <RegretCheckModal
          impulse={regretCheckImpulse}
          onClose={() => setRegretCheckImpulse(null)}
          onSave={handleRegretSave}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppContent />
      </Layout>
    </BrowserRouter>
  );
}

export default App;

