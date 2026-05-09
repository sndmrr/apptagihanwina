import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPermissions {
  canEditData: boolean;
  canDeleteData: boolean;
  canLunasData: boolean;
  loading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const [canEditData, setCanEditData] = useState(true);
  const [canDeleteData, setCanDeleteData] = useState(true);
  const [canLunasData, setCanLunasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('can_edit_data, can_delete_data, can_lunas_data')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching permissions:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setCanEditData(data.can_edit_data ?? true);
          setCanDeleteData(data.can_delete_data ?? true);
          setCanLunasData(data.can_lunas_data ?? true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();

    // Subscribe to profile changes
    const channel = supabase
      .channel('user_permissions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setCanEditData(newData.can_edit_data ?? true);
          setCanDeleteData(newData.can_delete_data ?? true);
          setCanLunasData(newData.can_lunas_data ?? true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    canEditData,
    canDeleteData,
    canLunasData,
    loading,
  };
};
