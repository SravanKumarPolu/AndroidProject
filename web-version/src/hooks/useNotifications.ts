import { useEffect, useRef } from 'react';
import { useImpulseStore } from '@/store/impulseStore';
import { generateSmartAlerts, getContextualAlert } from '@/services/smartAlerts';

export function useNotifications() {
  const { settings, impulses } = useImpulseStore();
  const lastReminderTime = useRef<number>(0);
  const lastWeeklyReportTime = useRef<number>(0);

  useEffect(() => {
    if (!settings.notifications) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for impulses ready for decision
    const checkReadyImpulses = () => {
      const now = Date.now();
      const readyImpulses = impulses.filter(
        (imp) => imp.status === 'cooldown' && imp.cooldownEndsAt <= now
      );

      if (readyImpulses.length > 0 && Notification.permission === 'granted') {
        readyImpulses.forEach((impulse) => {
          new Notification('Cooldown Complete!', {
            body: `Time to decide: ${impulse.title}`,
            icon: '/vite.svg',
            tag: impulse.id,
          });
        });
      }
    };

    // Reminder to log impulses (daily at 8 PM)
    const checkReminderToLog = () => {
      if (!settings.reminderToLog) return;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const reminderTime = new Date(today);
      reminderTime.setHours(20, 0, 0, 0); // 8 PM
      
      // Check if it's past 8 PM and we haven't sent a reminder today
      if (now >= reminderTime && lastReminderTime.current < today.getTime()) {
        const todayImpulses = impulses.filter(
          (imp) => imp.createdAt >= today.getTime()
        );
        
        if (todayImpulses.length === 0 && Notification.permission === 'granted') {
          new Notification('Daily Reminder', {
            body: "Don't forget to log your impulses today!",
            icon: '/vite.svg',
            tag: 'daily-reminder',
          });
          lastReminderTime.current = today.getTime();
        }
      }
    };

    // Weekly report summary (every Monday at 9 AM)
    const checkWeeklyReport = () => {
      if (!settings.weeklyReportSummary) return;
      
      const now = new Date();
      const dayOfWeek = now.getDay();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Monday = 1
      if (dayOfWeek === 1) {
        const reportTime = new Date(today);
        reportTime.setHours(9, 0, 0, 0);
        
        if (now >= reportTime && lastWeeklyReportTime.current < today.getTime()) {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          
          const weekImpulses = impulses.filter(
            (imp) => imp.createdAt >= lastWeek.getTime() && imp.createdAt < today.getTime()
          );
          
          const skipped = weekImpulses.filter(
            (imp) => imp.decisionAtEnd === 'skipped' || imp.status === 'skipped'
          );
          const saved = skipped.reduce((sum, imp) => sum + imp.price, 0);
          
          if (Notification.permission === 'granted') {
            new Notification('Weekly Report', {
              body: `You saved $${saved.toFixed(2)} this week by skipping ${skipped.length} impulses!`,
              icon: '/vite.svg',
              tag: 'weekly-report',
            });
            lastWeeklyReportTime.current = today.getTime();
          }
        }
      }
    };

    // Regret check reminders
    const checkRegretReminders = () => {
      if (!settings.regretCheckReminders) return;
      
      const now = Date.now();
      const needsCheck = impulses.filter(
        (imp) =>
          imp.decisionAtEnd === 'bought' &&
          imp.regretCheckAt &&
          imp.regretCheckAt <= now &&
          imp.regretScore === null
      );

      if (needsCheck.length > 0 && Notification.permission === 'granted') {
        needsCheck.forEach((impulse) => {
          new Notification('Regret Check', {
            body: `3 days ago you bought: ${impulse.title}. Do you regret it?`,
            icon: '/vite.svg',
            tag: `regret-${impulse.id}`,
          });
        });
      }
    };

    // Smart Alerts
    const checkSmartAlerts = () => {
      if (!settings.smartAlertsEnabled) return;
      
      const alerts = generateSmartAlerts(impulses);
      const highPriorityAlerts = alerts.filter((a) => a.priority === 'high');
      
      if (highPriorityAlerts.length > 0 && Notification.permission === 'granted') {
        const alert = highPriorityAlerts[0]; // Show most important
        new Notification(alert.title, {
          body: alert.message,
          icon: '/vite.svg',
          tag: `smart-alert-${alert.type}`,
        });
      }
    };

    // Check every minute
    const interval = setInterval(() => {
      checkReadyImpulses();
      checkReminderToLog();
      checkWeeklyReport();
      checkRegretReminders();
      checkSmartAlerts();
    }, 60000);
    
    // Initial checks
    checkReadyImpulses();
    checkReminderToLog();
    checkWeeklyReport();
    checkRegretReminders();
    checkSmartAlerts();

    return () => clearInterval(interval);
  }, [settings, impulses]);
}

