import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useDepositDate = () => {
  const { user } = useAuth();
  const [depositDate, setDepositDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDepositDate();

    const channel = supabase
      .channel('my_profile_tanggal_setor')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, () => {
        fetchDepositDate();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchDepositDate = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('tanggal_setor')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching deposit date:', error);
        return;
      }
      setDepositDate(data?.tanggal_setor || null);
    } catch (error) {
      console.error('Error fetching deposit date:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Belum diatur';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return { depositDate, loading, formatDate, refetch: fetchDepositDate };
};
