import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GlobalSisaSaldoData {
  totalSaldoInduk: number;
  totalTagihanAktif: number;
  totalBayar: number;
  sisaSaldoGlobal: number;
  loading: boolean;
}

export const useGlobalSisaSaldo = (): GlobalSisaSaldoData => {
  const [totalSaldoInduk, setTotalSaldoInduk] = useState(0);
  const [totalTagihanAktif, setTotalTagihanAktif] = useState(0);
  const [totalBayar, setTotalBayar] = useState(0);
  const [sisaSaldoGlobal, setSisaSaldoGlobal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGlobalData = async () => {
    if (!user) return;

    try {
      // Use the secure database function to get global sisa saldo
      const { data, error } = await supabase.rpc('get_global_sisa_saldo');

      if (error) {
        console.error('Error fetching global sisa saldo:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setTotalSaldoInduk(result.total_saldo_induk || 0);
        setTotalTagihanAktif(result.total_tagihan_aktif || 0);
        setTotalBayar(result.total_bayar || 0);
        setSisaSaldoGlobal(result.sisa_saldo_global || 0);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching global sisa saldo:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchGlobalData();

    // Create unique channel for global updates - listen to ALL changes without user filter
    const channelId = `global_sisa_saldo_${Math.random().toString(36).substr(2, 9)}`;
    
    // Subscribe to ALL tagihan and settings changes (no user filter)
    // This ensures real-time sync when any user makes changes
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tagihan',
        },
        () => {
          fetchGlobalData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
        },
        () => {
          fetchGlobalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    totalSaldoInduk,
    totalTagihanAktif,
    totalBayar,
    sisaSaldoGlobal,
    loading,
  };
};
