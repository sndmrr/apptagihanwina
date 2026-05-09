import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useTagihanOperations } from '@/hooks/useTagihanOperations';
import { useAutoCleanup } from '@/hooks/useAutoCleanup';
import { useGlobalSisaSaldo } from '@/hooks/useGlobalSisaSaldo';
import { useProfit } from '@/hooks/useProfit';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useDepositDate } from '@/hooks/useDepositDate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { AddTagihan } from '@/components/AddTagihan';
import { TagihanAktif } from '@/components/TagihanAktif';
import { TagihanLunas } from '@/components/TagihanLunas';
import { BayarLangsung } from '@/components/BayarLangsung';
import { BottomNav } from '@/components/BottomNav';
import { DepositDateCard } from '@/components/DepositDateCard';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, TrendingUp, Coins, Gift, CheckCircle, Wallet } from 'lucide-react';
import WelcomeGreeting from '@/components/WelcomeGreeting';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { NotifikasiPopup } from '@/components/NotifikasiPopup';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const
    }
  })
};

export const MitraDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { depositDate, formatDate } = useDepositDate();
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canEditData, canDeleteData, canLunasData } = useUserPermissions();


  const userName = profile?.full_name || localStorage.getItem('userName') || 'Mitra';

  const {
    tagihans,
    settings,
    loading,
    addTagihan,
    addTagihanLunas,
    markAsLunas,
    deleteTagihan,
    updateTagihan,
    updateSaldoAwal,
  } = useSupabaseData();
 
  const {
    handleAddTagihan,
    handleMarkAsLunas,
    handleDeleteTagihan,
    handleUpdateTagihan,
    handleUpdateSaldoAwal,
  } = useTagihanOperations({
    addTagihan,
    markAsLunas,
    deleteTagihan,
    restoreTagihan: async () => ({ error: null }),
    permanentDeleteTagihan: async () => ({ error: null }),
    updateSaldoAwal,
    updateTagihan,
    deleteAllLunas: async () => ({ error: null }),
  });

  useAutoCleanup();

  const { sisaSaldoGlobal } = useGlobalSisaSaldo();
  const { profit } = useProfit();
  const sisaSaldoAdmin = sisaSaldoGlobal + profit;

  const tagihanAktif = tagihans.filter(t => t.status === 'belum_lunas');
  const tagihanLunas = tagihans.filter(t => t.status === 'lunas');

  const totalTagihanAktif = tagihanAktif.reduce((sum, t) => sum + t.jumlah, 0);
  const totalPembayaran = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0);

  const jumlahDataLunas = tagihanLunas.length;
  const jumlahDataTagihan = tagihanAktif.length;
  const totalJumlahLunas = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0);
  
  const komisi = jumlahDataLunas * 1000;
  const bonus = jumlahDataTagihan > 30 ? 5000 : 0;
  const setor = jumlahDataLunas > 0 ? totalJumlahLunas - komisi : 0;
  const totalRupiahTagihan = tagihanAktif.reduce((sum, t) => sum + t.jumlah, 0);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/auth', { replace: true });
  };

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

  groupedTagihanAktif.forEach(group => {
    group.items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleRestoreFromLunas = async (id: string) => {
    const tagihan = tagihanLunas.find(t => t.id === id);
    if (tagihan) {
      await handleUpdateTagihan(id, tagihan.nama, tagihan.jumlah, 'belum_lunas');
    }
  };

  const statsCards = [
    { title: 'Jumlah Tagihan', value: formatCurrency(totalRupiahTagihan), icon: TrendingDown, borderColor: 'border-red-500', iconColor: 'text-red-500', iconBg: 'bg-red-100' },
    { title: 'Jumlah Setor', value: formatCurrency(setor), icon: TrendingUp, borderColor: 'border-green-500', iconColor: 'text-green-500', iconBg: 'bg-green-100' },
    { title: 'Jumlah Komisi', value: formatCurrency(komisi), icon: Coins, borderColor: 'border-blue-500', iconColor: 'text-blue-500', iconBg: 'bg-blue-100' },
    { title: 'Jumlah Bonus', value: formatCurrency(bonus), icon: Gift, borderColor: 'border-orange-500', iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
    { title: 'Jumlah Lunas', value: formatCurrency(totalPembayaran), icon: CheckCircle, borderColor: 'border-purple-500', iconColor: 'text-purple-500', iconBg: 'bg-purple-100' },
    { title: 'Sisa Saldo Mitra', value: formatCurrency(sisaSaldoAdmin), icon: Wallet, borderColor: 'border-yellow-500', iconColor: 'text-yellow-500', iconBg: 'bg-yellow-100' }
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <NotifikasiPopup />
      
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 pb-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.07] animate-pulse"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-4 p-3 sm:p-4 lg:p-6">
          <Header onSignOut={handleSignOut} />

          <WelcomeGreeting userName={userName} />

          {/* Deposit Date Card */}
          <div className="w-full">
            <DepositDateCard depositDate={depositDate} formatDate={formatDate} jumlahNamaTagihan={groupedTagihanAktif.length} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {statsCards.map((card, index) => (
              <motion.div
                key={card.title}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className={`relative overflow-hidden bg-white border-2 ${card.borderColor} shadow-md group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                  <CardHeader className="pb-1 sm:pb-1.5 relative z-10">
                    <CardTitle className="text-[9px] sm:text-xs flex items-center gap-1 sm:gap-1.5">
                      <div className={`p-1 sm:p-1.5 rounded-lg ${card.iconBg}`}>
                        <card.icon className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${card.iconColor}`} />
                      </div>
                      <span className="font-medium text-xs sm:text-sm text-slate-700">{card.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 relative z-10">
                    <p className="text-[10px] sm:text-sm lg:text-lg font-bold text-slate-900 break-words leading-tight">
                      {card.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 p-3 sm:p-4 lg:p-6">

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-800">
                <Plus className="h-5 w-5" />
                Tambah Tagihan Baru
              </DialogTitle>
              <DialogDescription className="text-gray-500">
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

        {/* Tagihan Lists */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TagihanAktif 
            groupedTagihanAktif={groupedTagihanAktif} 
            onMarkAsLunas={canLunasData ? handleMarkAsLunas : undefined} 
            onDeleteTagihan={canDeleteData ? handleDeleteTagihan : undefined}
            onUpdateTagihan={canEditData ? handleUpdateTagihan : undefined} 
            formatCurrency={formatCurrency}
            isMitra={true}
            canEdit={canEditData}
            canDelete={canDeleteData}
            canLunas={canLunasData}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <TagihanLunas 
            tagihanLunas={tagihanLunas} 
            onDeleteTagihan={canDeleteData ? handleDeleteTagihan : undefined} 
            onRestoreTagihan={canEditData ? handleRestoreFromLunas : undefined}
            onDeleteAllLunas={async () => {}} 
            formatCurrency={formatCurrency}
            isMitra={true}
            canDelete={canDeleteData}
            canRestore={canEditData}
          />
        </motion.div>
      </div>

      <BottomNav
        onTambahTagihan={() => setDialogOpen(true)}
        onBayarLangsung={() => setBayarOpen(true)}
        onTambahUser={() => setDialogOpen(true)}
        showTambahUser={false}
        role="mitra"
      />
    </div>
  );
};
