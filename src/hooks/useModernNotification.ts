import { useModernNotification as useModernNotificationContext } from '@/components/ModernNotification';

export const useModernNotification = () => {
  const { showLoading, showSuccess, hideNotification } = useModernNotificationContext();
  
  return {
    showLoading,
    showSuccess,
    hideNotification
  };
};
