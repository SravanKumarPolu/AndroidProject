import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageTransition } from './components/PageTransition';
import { Splash } from './pages/Splash';
import { Onboarding } from './pages/Onboarding';
import { Setup } from './pages/Setup';
import { Home } from './pages/Home';
import { NewImpulse } from './pages/NewImpulse';
import { Cooldown } from './pages/Cooldown';
import { Decision } from './pages/Decision';
import { History } from './pages/History';
import { ImpulseDetail } from './pages/ImpulseDetail';
import { Insights } from './pages/Insights';
import { Progress } from './pages/Progress';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { useTheme } from './hooks/useTheme';
import { useNotifications, setGlobalNavigate } from './hooks/useNotifications';
import { useOffline } from './hooks/useOffline';
import { useImpulseStore } from './store/impulseStore';
import { RegretCheckModal } from './components/RegretCheckModal';
import { ToastContainer } from './components/ui/Toast';
import { useNavigate } from 'react-router-dom';

function AppContent() {
  const navigate = useNavigate();
  useTheme(); // Initialize theme
  useOffline(); // Initialize offline detection
  
  // Set up global navigation for notifications
  useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);
  
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
      <ToastContainer />
      <PageTransition>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-impulse"
            element={
              <ProtectedRoute>
                <NewImpulse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cooldown/:id"
            element={
              <ProtectedRoute>
                <Cooldown />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decision/:id?"
            element={
              <ProtectedRoute>
                <Decision />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/impulses"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/impulses/:id"
            element={
              <ProtectedRoute>
                <ImpulseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PageTransition>

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

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
  const hasCompletedSetup = localStorage.getItem('hasCompletedSetup') === 'true';

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!hasCompletedSetup) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/setup" element={<Setup />} />
        <Route
          path="/*"
          element={
            <Layout>
              <AppContent />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

