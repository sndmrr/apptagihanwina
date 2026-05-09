import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useTagihanOperations } from "@/hooks/useTagihanOperations";
import { useAutoCleanup } from "@/hooks/useAutoCleanup";
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from 'lucide-react';
import { Header } from "@/components/Header";
import { DashboardCards } from "@/components/DashboardCards";
import { AddTagihan } from "@/components/AddTagihan";
import { BottomNav } from "@/components/BottomNav";
import { TagihanAktif } from "@/components/TagihanAktif";
import { TagihanLunas } from "@/components/TagihanLunas";
import { DeletedTagihan } from "@/components/DeletedTagihan";
import { BayarLangsung } from "@/components/BayarLangsung";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MitraDashboard } from "@/components/mitra/MitraDashboard";
import WelcomeGreeting from "@/components/WelcomeGreeting";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const { role, profile, loading: roleLoading } = useUserRole();
  const {
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
    deleteAllLunas
  } = useSupabaseData();
  const {
    handleAddTagihan,
    handleMarkAsLunas,
    handleDeleteTagihan,
    handleRestoreTagihan,
    handlePermanentDeleteTagihan,
    handleUpdateSaldoAwal,
    handleUpdateTagihan,
    handleDeleteAllLunas
  } = useTagihanOperations({
    addTagihan,
    markAsLunas,
    deleteTagihan,
    restoreTagihan,
    permanentDeleteTagihan,
    updateSaldoAwal,
    updateTagihan,
    deleteAllLunas
  });

  useAutoCleanup();

  useEffect(() => {
    if (!loading && !roleLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, roleLoading]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || roleLoading || showLoading || loggingOut) {
    return <LoadingScreen onLoadingComplete={() => setShowLoading(false)} />;
  }

  if (role === 'mitra') {
    return <MitraDashboard />;
  }

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (!loading && !roleLoading && !role) {
    return <Navigate to="/auth" replace />;
  }

  const tagihanAktif = tagihans.filter(t => t.status === 'belum_lunas');
  const tagihanLunas = tagihans.filter(t => t.status === 'lunas');

  const groupedTagihanAktif = tagihanAktif.reduce((acc, tagihan) => {
    const normalizedNama = tagihan.nama.toLowerCase().trim();
    const existing = acc.find(group => group.nama.toLowerCase().trim() === normalizedNama);
    if (existing) {
      existing.items.push(tagihan);
      existing.totalJumlah += tagihan.jumlah;
    } else {
      acc.push({
        nama: tagihan.nama,
        items: [tagihan],
        totalJumlah: tagihan.jumlah
      });
    }
    return acc;
  }, [] as Array<{
    nama: string;
    items: typeof tagihanAktif;
    totalJumlah: number;
  }>);

  // Sort items in each group: newest (by updated_at) first
  groupedTagihanAktif.forEach(group => {
    group.items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  });

  const totalTagihanAktif = tagihanAktif.reduce((sum, t) => sum + t.jumlah, 0);
  const totalPembayaran = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0);
  const saldoAwal = settings?.saldo_awal || 0;
  const sisaSaldo = saldoAwal - totalTagihanAktif - totalPembayaran;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    queryClient.clear();
    await signOut();
    navigate('/auth', { replace: true });
  };

  const handleRestoreFromLunas = async (id: string) => {
    const tagihan = tagihanLunas.find(t => t.id === id);
    if (tagihan) {
      await handleUpdateTagihan(id, tagihan.nama, tagihan.jumlah, 'belum_lunas');
    }
  };

  const userName = profile?.full_name || localStorage.getItem('userName') || 'User';

  const currentUserProfiles = profile
    ? [{ user_id: user.id, full_name: profile.full_name, username: profile.username }]
    : [{ user_id: user.id, full_name: userName, username: '' }];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>
      
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 pb-4">
        <div className="max-w-7xl mx-auto space-y-3 p-2.5 sm:p-3 lg:p-4">
          <Header onSignOut={handleSignOut} />

          <WelcomeGreeting userName={userName} />

          <DashboardCards
            saldoAwal={saldoAwal} 
            totalTagihanAktif={totalTagihanAktif} 
            totalPembayaran={totalPembayaran} 
            sisaSaldo={sisaSaldo} 
            onUpdateSaldoAwal={handleUpdateSaldoAwal} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-3 p-2.5 sm:p-3 lg:p-4">

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] top-[10%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] overflow-y-auto bg-white border-gray-200 rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-800 text-sm font-semibold">
                <Plus className="h-4 w-4" />
                Tambah Tagihan Baru
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs">
                Masukkan nama dan jumlah tagihan baru
              </DialogDescription>
            </DialogHeader>
            <AddTagihan
              onAddTagihan={async (nama, jumlah) => {
                await handleAddTagihan(nama, jumlah);
                setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <BayarLangsung
          hideTrigger
          open={bayarOpen}
          onOpenChange={setBayarOpen}
          onBayarLangsung={async (nama, jumlah) => {
            const { error } = await addTagihanLunas(nama, jumlah);
            if (error) throw error;
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TagihanAktif 
            groupedTagihanAktif={groupedTagihanAktif}
            profiles={currentUserProfiles}
            onMarkAsLunas={handleMarkAsLunas} 
            onDeleteTagihan={handleDeleteTagihan} 
            onUpdateTagihan={handleUpdateTagihan} 
            formatCurrency={formatCurrency} 
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TagihanLunas 
            tagihanLunas={tagihanLunas} 
            onDeleteTagihan={handleDeleteTagihan} 
            onRestoreTagihan={handleRestoreFromLunas} 
            onDeleteAllLunas={handleDeleteAllLunas} 
            formatCurrency={formatCurrency} 
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DeletedTagihan 
            deletedTagihans={deletedTagihans} 
            onRestoreTagihan={handleRestoreTagihan} 
            onPermanentDelete={handlePermanentDeleteTagihan} 
            formatCurrency={formatCurrency} 
          />
        </motion.div>
      </div>

      <BottomNav
        onTambahTagihan={() => setDialogOpen(true)}
        onBayarLangsung={() => setBayarOpen(true)}
        onTambahUser={() => setDialogOpen(true)}
        showTambahUser={false}
        role={role as 'admin' | 'mitra' | 'staff'}
      />
    </div>
  );
};

export default Index;
