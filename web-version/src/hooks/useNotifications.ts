import { useEffect, useRef } from 'react';
import { useImpulseStore } from '@/store/impulseStore';
import { generateSmartAlerts, getContextualAlert } from '@/services/smartAlerts';
import { calculateStreak } from '@/utils/gamification';
import { formatCurrency } from '@/utils/format';

// Notification data structure for deep linking
interface NotificationData {
  type: 'cooldown-done' | 'reminder' | 'streak' | 'regret-check' | 'contextual' | 'weekly-report';
  impulseId?: string;
  url?: string;
}

// Track sent notifications to avoid duplicates
const sentNotifications = new Set<string>();

// Global navigation handler (will be set by App component)
let globalNavigate: ((path: string) => void) | null = null;

export function setGlobalNavigate(navigate: (path: string) => void) {
  globalNavigate = navigate;
}

export function useNotifications() {
  const { settings, impulses } = useImpulseStore();
  const lastReminderTime = useRef<number>(0);
  const lastWeeklyReportTime = useRef<number>(0);
  const lastStreakNotification = useRef<number>(0);
  const lastContextualNotification = useRef<number>(0);

  // Helper function to create notification with deep link
  const createNotification = (
    title: string,
    body: string,
    data: NotificationData,
    tag?: string
  ) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      tag: tag || `notification-${Date.now()}`,
      badge: '/vite.svg',
      data: data as any,
    });

    // Set up click handler for deep linking
    notification.onclick = () => {
      window.focus();
      notification.close();

      // Navigate based on notification type
      if (globalNavigate) {
        if (data.type === 'cooldown-done' && data.impulseId) {
          // Navigate to decision screen
          globalNavigate(`/decision?id=${data.impulseId}`);
        } else if (data.type === 'reminder') {
          // Navigate to home and trigger new impulse sheet
          globalNavigate('/?openNewImpulse=true');
        } else if (data.type === 'streak') {
          // Navigate to progress page
          globalNavigate('/progress');
        } else if (data.type === 'regret-check' && data.impulseId) {
          // Navigate to impulse detail
          globalNavigate(`/impulses/${data.impulseId}`);
        } else if (data.url) {
          globalNavigate(data.url);
        } else {
          // Default to home
          globalNavigate('/');
        }
      } else {
        // Fallback to window.location if navigate not available
        if (data.type === 'cooldown-done' && data.impulseId) {
          window.location.href = `/decision?id=${data.impulseId}`;
        } else if (data.type === 'reminder') {
          window.location.href = '/?openNewImpulse=true';
        } else if (data.type === 'streak') {
          window.location.href = '/progress';
        } else if (data.type === 'regret-check' && data.impulseId) {
          window.location.href = `/impulses/${data.impulseId}`;
        } else if (data.url) {
          window.location.href = data.url;
        } else {
          window.location.href = '/';
        }
      }
    };

    return notification;
  };

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
          // Check if we already notified for this impulse
          const notificationKey = `cooldown-${impulse.id}`;
          if (sentNotifications.has(notificationKey)) return;

          const merchantName = impulse.title.split(' – ')[0] || impulse.title;
          createNotification(
            'Cool-down Complete!',
            `Your cool-down for ${merchantName} is done. Decide now.`,
            {
              type: 'cooldown-done',
              impulseId: impulse.id,
            },
            notificationKey
          );
          sentNotifications.add(notificationKey);
        });
      }
    };

    // Reminder to log impulses (nightly if had impulses today)
    const checkReminderToLog = () => {
      if (!settings.nightlyReminder) return;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Parse reminder time from settings (default 21:00)
      const [hours, minutes] = (settings.reminderTime || '21:00').split(':').map(Number);
      const reminderTime = new Date(today);
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // Check if it's past reminder time and we haven't sent a reminder today
      if (now >= reminderTime && lastReminderTime.current < today.getTime()) {
        const todayImpulses = impulses.filter(
          (imp) => imp.createdAt >= today.getTime()
        );
        
        // Only send if user had impulses today
        if (todayImpulses.length > 0 && Notification.permission === 'granted') {
          createNotification(
            'Daily Reminder',
            "Don't forget to log your impulses today!",
            {
              type: 'reminder',
              url: '/?openNewImpulse=true',
            },
            'daily-reminder'
          );
          lastReminderTime.current = today.getTime();
        }
      }
    };

    // Streak notifications
    const checkStreakNotifications = () => {
      const streak = calculateStreak(impulses);
      
      // Notify on streak milestones (3, 4, 5, 7, 10, etc.)
      if (streak >= 3 && streak !== lastStreakNotification.current) {
        // Only notify once per streak value
        if (Notification.permission === 'granted') {
          createNotification(
            '🔥 Streak Alert!',
            `${streak}-day streak! Don't break it tonight.`,
            {
              type: 'streak',
              url: '/progress',
            },
            `streak-${streak}`
          );
          lastStreakNotification.current = streak;
        }
      }
    };

    // Contextual shopping app notifications (future feature - detect app usage)
    const checkContextualNotifications = () => {
      // This would require app detection (future feature)
      // For now, we can check if user is likely to order based on patterns
      const now = new Date();
      const hour = now.getHours();
      
      // Check if it's a high-risk time (e.g., 10 PM - 11 PM for food delivery)
      if (hour >= 22 && hour < 23) {
        const recentFoodImpulses = impulses
          .filter((imp) => {
            const impDate = new Date(imp.createdAt);
            const impHour = impDate.getHours();
            return imp.category === 'food' && 
                   impHour >= 22 && 
                   imp.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days
          });

        if (recentFoodImpulses.length >= 2) {
          // Check if we already sent this notification today
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (lastContextualNotification.current < today.getTime() && Notification.permission === 'granted') {
            const commonMerchants = ['Swiggy', 'Zomato', 'Uber Eats'];
            const merchant = commonMerchants[Math.floor(Math.random() * commonMerchants.length)];
            
            createNotification(
              'Impulse Alert',
              `Are you about to order ${merchant}? Log the impulse first.`,
              {
                type: 'contextual',
                url: '/?openNewImpulse=true',
              },
              'contextual-shopping'
            );
            lastContextualNotification.current = today.getTime();
          }
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
            createNotification(
              'Weekly Report',
              `You saved ${formatCurrency(saved)} this week by skipping ${skipped.length} impulses!`,
              {
                type: 'weekly-report',
                url: '/reports',
              },
              'weekly-report'
            );
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
          const notificationKey = `regret-${impulse.id}`;
          if (sentNotifications.has(notificationKey)) return;

          createNotification(
            'Regret Check',
            `3 days ago you bought: ${impulse.title}. Do you regret it?`,
            {
              type: 'regret-check',
              impulseId: impulse.id,
            },
            notificationKey
          );
          sentNotifications.add(notificationKey);
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
        const notificationKey = `smart-alert-${alert.type}-${Date.now()}`;
        
        createNotification(alert.title, alert.message, {
          type: 'contextual',
          url: alert.actionUrl || '/',
        }, notificationKey);
      }
    };

    // Check every minute
    const interval = setInterval(() => {
      checkReadyImpulses();
      checkReminderToLog();
      checkStreakNotifications();
      checkContextualNotifications();
      checkWeeklyReport();
      checkRegretReminders();
      checkSmartAlerts();
    }, 60000);
    
    // Initial checks
    checkReadyImpulses();
    checkReminderToLog();
    checkStreakNotifications();
    checkContextualNotifications();
    checkWeeklyReport();
    checkRegretReminders();
    checkSmartAlerts();

    return () => {
      clearInterval(interval);
      // Clean up sent notifications tracking (keep last 100)
      if (sentNotifications.size > 100) {
        const entries = Array.from(sentNotifications);
        sentNotifications.clear();
        entries.slice(-50).forEach(key => sentNotifications.add(key));
      }
    };
  }, [settings, impulses]);
}
