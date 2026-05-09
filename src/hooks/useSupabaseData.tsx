import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: 'belum_lunas' | 'lunas';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  nama_input?: string;
  nama_lunas?: string;
}

interface Settings {
  id: string;
  saldo_awal: number;
  created_at: string;
  updated_at: string;
}

export const useSupabaseData = () => {
  const [tagihans, setTagihans] = useState<Tagihan[]>([]);
  const [deletedTagihans, setDeletedTagihans] = useState<Tagihan[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, userName } = useAuth();
  const { toast } = useToast();

  // Fetch data
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch active tagihans (not deleted) - filtered by user_id
      const { data: tagihanData, error: tagihanError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (tagihanError) throw tagihanError;

      // Fetch deleted tagihans - filtered by user_id
      const { data: deletedData, error: deletedError } = await supabase
        .from('tagihan')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (deletedError) throw deletedError;

      // Fetch settings - filtered by user_id
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setTagihans((tagihanData as Tagihan[]) || []);
      setDeletedTagihans((deletedData as Tagihan[]) || []);
      setSettings(settingsData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchData();

    // Create unique channel with random ID to prevent subscription conflicts
    const channelId = `user_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Subscribe to both tagihan and settings changes in a single channel
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tagihan',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Add tagihan
  const addTagihan = async (nama: string, jumlah: number) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('tagihan')
      .insert({
        user_id: user.id,
        nama,
        jumlah,
        status: 'belum_lunas',
        nama_input: userName || 'Unknown'
      });

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Add tagihan langsung lunas (Bayar Langsung)
  const addTagihanLunas = async (nama: string, jumlah: number) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('tagihan')
      .insert({
        user_id: user.id,
        nama,
        jumlah,
        status: 'lunas',
        nama_input: userName || 'Unknown',
        nama_lunas: userName || 'Unknown'
      });

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Update tagihan status to lunas
  const markAsLunas = async (id: string) => {
    // Get tagihan info for notification
    const tagihan = tagihans.find(t => t.id === id);
    
    const { error } = await supabase
      .from('tagihan')
      .update({ 
        status: 'lunas',
        nama_lunas: userName || 'Unknown'
      })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Soft delete tagihan (set deleted_at timestamp)
  const deleteTagihan = async (id: string) => {
    // Get tagihan info for notification
    const tagihan = tagihans.find(t => t.id === id);
    
    const { error } = await supabase
      .from('tagihan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Restore deleted tagihan (set deleted_at to null)
  const restoreTagihan = async (id: string) => {
    const { error } = await supabase
      .from('tagihan')
      .update({ deleted_at: null })
      .eq('id', id);

    if (!error) {
      await fetchData(); // Auto refresh after restoring
    }

    return { error };
  };

  // Permanent delete tagihan (actually remove from database)
  const permanentDeleteTagihan = async (id: string) => {
    const { error } = await supabase
      .from('tagihan')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData(); // Auto refresh after permanent deleting
    }

    return { error };
  };

  // Update settings
  const updateSaldoAwal = async (saldoAwal: number) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    if (settings) {
      const { error } = await supabase
        .from('settings')
        .update({ saldo_awal: saldoAwal })
        .eq('id', settings.id);
      
      if (!error) {
        await fetchData(); // Auto refresh after updating
      }
      
      return { error };
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({
          user_id: user.id,
          saldo_awal: saldoAwal
        });
      
      if (!error) {
        await fetchData(); // Auto refresh after creating
      }
      
      return { error };
    }
  };

  // Update tagihan
  const updateTagihan = async (id: string, newNama: string, newJumlah: number, newStatus?: string) => {
    const updateData: any = { 
      nama: newNama,
      jumlah: newJumlah 
    };
    
    // Add status if provided
    if (newStatus !== undefined) {
      updateData.status = newStatus;
    }
    
    const { error } = await supabase
      .from('tagihan')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Delete all lunas tagihan
  const deleteAllLunas = async () => {
    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('tagihan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'lunas');

    if (!error) {
      await fetchData(); // Auto refresh after deleting all lunas
    }

    return { error };
  };

  return {
    tagihans,
    deletedTagihans,
    settings,
    loading,
    addTagihan,
    addTagihanLunas,
    markAsLunas,
    deleteTagihan,
    restoreTagihan,
    permanentDeleteTagihan,
    updateSaldoAwal,
    updateTagihan,
    deleteAllLunas,
  };
};
