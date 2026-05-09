import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfit = () => {
  const [profit, setProfit] = useState(0);
  const [profitId, setProfitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfit = async () => {
    const { data, error } = await supabase
      .from('profit_settings')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      setProfit(Number(data.profit_amount) || 0);
      setProfitId(data.id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchProfit();

    const channel = supabase
      .channel(`profit_${Math.random().toString(36).substr(2, 9)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profit_settings' }, () => {
        fetchProfit();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateProfit = async (newAmount: number) => {
    if (!profitId || !user) return;
    setProfit(newAmount);
    await supabase
      .from('profit_settings')
      .update({ profit_amount: newAmount, updated_at: new Date().toISOString(), updated_by: user.id })
      .eq('id', profitId);
  };

  return { profit, updateProfit, loading };
};
