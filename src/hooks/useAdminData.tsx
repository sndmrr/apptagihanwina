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
  user_id: string;
}

interface Settings {
  id: string;
  saldo_awal: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
}

export const useAdminData = () => {
  const [tagihans, setTagihans] = useState<Tagihan[]>([]);
  const [deletedTagihans, setDeletedTagihans] = useState<Tagihan[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userName } = useAuth();
  const { toast } = useToast();

  // Fetch all data (admin sees everything)
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch ALL active tagihans (not filtered by user_id)
      const { data: tagihanData, error: tagihanError } = await supabase
        .from('tagihan')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (tagihanError) throw tagihanError;

      // Fetch ALL deleted tagihans
      const { data: deletedData, error: deletedError } = await supabase
        .from('tagihan')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (deletedError) throw deletedError;

      // Fetch ALL settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*');

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // Fetch ALL profiles for user list
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      setTagihans((tagihanData as Tagihan[]) || []);
      setDeletedTagihans((deletedData as Tagihan[]) || []);
      setSettings((settingsData as Settings[]) || []);
      setProfiles((profilesData as UserProfile[]) || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchData();

    // Create unique channel with random ID to prevent conflicts
    const channelId = `admin_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Subscribe to tagihan changes
    const tagihanChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tagihan',
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
          table: 'profiles',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tagihanChannel);
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

  // Add tagihan for a specific user (admin feature)
  const addTagihanForUser = async (nama: string, jumlah: number, targetUserId: string, targetUserName: string) => {
    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
      .from('tagihan')
      .insert({
        user_id: targetUserId,
        nama,
        jumlah,
        status: 'belum_lunas',
        nama_input: userName || 'Admin' // Admin yang menambahkan
      });

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Update tagihan status to lunas
  const markAsLunas = async (id: string) => {
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

  // Soft delete tagihan
  const deleteTagihan = async (id: string) => {
    const { error } = await supabase
      .from('tagihan')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Restore deleted tagihan
  const restoreTagihan = async (id: string) => {
    const { error } = await supabase
      .from('tagihan')
      .update({ deleted_at: null })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Permanent delete tagihan
  const permanentDeleteTagihan = async (id: string) => {
    const { error } = await supabase
      .from('tagihan')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  // Update settings
  const updateSaldoAwal = async (saldoAwal: number, userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return { error: { message: 'User ID required' } };

    const userSettings = settings.find(s => s.user_id === targetUserId);

    if (userSettings) {
      const { error } = await supabase
        .from('settings')
        .update({ saldo_awal: saldoAwal })
        .eq('id', userSettings.id);
      
      if (!error) {
        await fetchData();
      }
      
      return { error };
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({
          user_id: targetUserId,
          saldo_awal: saldoAwal
        });
      
      if (!error) {
        await fetchData();
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
      .eq('status', 'lunas');

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  return {
    tagihans,
    deletedTagihans,
    settings,
    profiles,
    loading,
    addTagihan,
    addTagihanLunas,
    addTagihanForUser,
    markAsLunas,
    deleteTagihan,
    restoreTagihan,
    permanentDeleteTagihan,
    updateSaldoAwal,
    updateTagihan,
    deleteAllLunas,
  };
};
