import { useState, useCallback } from 'react';
import { ToastType } from '@/components/ui/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({
      message,
      type,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

