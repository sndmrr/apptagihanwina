
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoCleanup = () => {
  useEffect(() => {
    const cleanupDeletedTagihans = async () => {
      try {
        // Calculate 24 hours ago
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // Delete tagihans that were soft deleted more than 24 hours ago
        const { error } = await supabase
          .from('tagihan')
          .delete()
          .not('deleted_at', 'is', null)
          .lt('deleted_at', twentyFourHoursAgo.toISOString());

        if (error) {
          console.error('Error during auto cleanup:', error);
        } else {
          console.log('Auto cleanup completed successfully');
        }
      } catch (error) {
        console.error('Auto cleanup failed:', error);
      }
    };

    // Run cleanup immediately
    cleanupDeletedTagihans();

    // Set up interval to run every hour
    const interval = setInterval(cleanupDeletedTagihans, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
