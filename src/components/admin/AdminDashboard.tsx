import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminData } from '@/hooks/useAdminData';
import { useTagihanOperations } from '@/hooks/useTagihanOperations';
import { useAutoCleanup } from '@/hooks/useAutoCleanup';
import { useGlobalSisaSaldo } from '@/hooks/useGlobalSisaSaldo';
import { useProfit } from '@/hooks/useProfit';
import { Plus, Filter, Users, UserPlus, Home, Calendar, FileText, Trash2, ArrowLeft, ArrowLeftToLine, MessageSquare, ChevronUp, ChevronDown, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { DashboardCards } from '@/components/DashboardCards';
import { AddTagihan } from '@/components/AddTagihan';
import { TagihanAktif } from '@/components/TagihanAktif';
import { TagihanLunas } from '@/components/TagihanLunas';
import { DeletedTagihan } from '@/components/DeletedTagihan';
import { AddTagihanUser } from '@/components/AddTagihanUser';
import { BayarLangsung } from '@/components/BayarLangsung';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WelcomeGreeting from '@/components/WelcomeGreeting';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { UserManagement } from './UserManagement';
import { PendingRegistrations } from './PendingRegistrations';
import { TanggalSetorMitra } from './TanggalSetorMitra';
import { RekapLaporan } from './RekapLaporan';
import { HapusData } from './HapusData';
import { PesanKeUser } from './PesanKeUser';

export const AdminDashboard = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [bayarOpen, setBayarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut, user } = useAuth();
  const { profile } = useUserRole();
  const { toast } = useToast();


  const userName = profile?.full_name || localStorage.getItem('userName') || 'Admin';

  const {
    tagihans: allTagihans,
    deletedTagihans: allDeletedTagihans,
    settings: allSettings,
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
  } = useAdminData();

  const {
    handleAddTagihan,
    handleMarkAsLunas,
    handleDeleteTagihan,
    handleRestoreTagihan,
    handlePermanentDeleteTagihan,
    handleUpdateSaldoAwal,
    handleUpdateTagihan,
    handleDeleteAllLunas,
  } = useTagihanOperations({
    addTagihan,
    markAsLunas,
    deleteTagihan,
    restoreTagihan,
    permanentDeleteTagihan,
    updateSaldoAwal,
    updateTagihan,
    deleteAllLunas,
  });

  useAutoCleanup();

  const { sisaSaldoGlobal } = useGlobalSisaSaldo();
  const { profit, updateProfit } = useProfit();
  const [profitInput, setProfitInput] = useState('');
  const [editingProfit, setEditingProfit] = useState(false);

  useEffect(() => {
    if (!editingProfit) {
      setProfitInput(profit.toString());
    }
  }, [profit, editingProfit]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    queryClient.clear();
    await signOut();
    navigate('/auth', { replace: true });
  };

  const handleOpenAdminMenu = () => {
    setAdminMenuOpen(true);
  };

  const handleCloseAdminMenu = () => {
    setAdminMenuOpen(false);
    setActiveSection(null);
  };

  const handleBackToDashboard = () => {
    // Tutup popup admin terlebih dahulu
    handleCloseAdminMenu();
    // Navigasi ke dashboard
    navigate('/');
  };

  const tagihans = useMemo(() => {
    if (selectedUserId === 'all') return allTagihans;
    return allTagihans.filter(t => t.user_id === selectedUserId);
  }, [allTagihans, selectedUserId]);

  const deletedTagihans = useMemo(() => {
    if (selectedUserId === 'all') return allDeletedTagihans;
    return allDeletedTagihans.filter(t => t.user_id === selectedUserId);
  }, [allDeletedTagihans, selectedUserId]);

  const unfilteredSaldoAwal = useMemo(() => {
    return allSettings.reduce((sum, s) => sum + s.saldo_awal, 0);
  }, [allSettings]);

  const unfilteredTagihans = allTagihans.filter(t => t.status === 'belum_lunas');
  const unfilteredLunas = allTagihans.filter(t => t.status === 'lunas');
  const unfilteredTotalTagihan = unfilteredTagihans.reduce((sum, t) => sum + t.jumlah, 0);
  const unfilteredTotalLunas = unfilteredLunas.reduce((sum, t) => sum + t.jumlah, 0);
  const unfilteredSisaSaldo = unfilteredSaldoAwal - unfilteredTotalTagihan - unfilteredTotalLunas;

  const settings = useMemo(() => {
    if (selectedUserId === 'all') {
      return { saldo_awal: unfilteredSaldoAwal };
    }
    const userSettings = allSettings.find(s => s.user_id === selectedUserId);
    return userSettings || { saldo_awal: 0 };
  }, [allSettings, selectedUserId, unfilteredSaldoAwal]);

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
        totalJumlah: tagihan.jumlah,
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

  const totalTagihanAktif = tagihanAktif.reduce((sum, t) => sum + t.jumlah, 0);
  const totalPembayaran = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0);
  
  const jumlahDataLunas = tagihanLunas.length;
  const jumlahDataTagihan = tagihanAktif.length;
  const totalJumlahLunas = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0);

  const komisi = jumlahDataLunas * 1000;
  const bonus = jumlahDataTagihan > 30 ? 5000 : 0;
  const setor = jumlahDataLunas > 0 ? totalJumlahLunas - komisi : 0;

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


  const renderAdminMenuContent = () => {
    if (activeSection === null) {
      return (
        <>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              Menu Admin
            </SheetTitle>
            <SheetDescription>
              Pilih menu yang ingin diakses
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Button
              onClick={handleBackToDashboard}
              className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500"
            >
              <ArrowLeftToLine className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setActiveSection('tanggal_setor')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Tanggal Setor Mitra
            </Button>
            <Button
              onClick={() => setActiveSection('management_user')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Users className="h-4 w-4" />
              Management User
            </Button>
            <Button
              onClick={() => setActiveSection('rekap')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              Rekap Laporan
            </Button>
            <Button
              onClick={() => setActiveSection('hapus')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Data
            </Button>
            <Button
              onClick={() => setActiveSection('pesan_user')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Pesan ke User
            </Button>
          </div>
        </>
      );
    }

    const getSectionTitle = () => {
      switch (activeSection) {
        case 'tanggal_setor': return 'Tanggal Setor Mitra';
        case 'management_user': return 'Management User';
        case 'rekap': return 'Rekap Laporan';
        case 'hapus': return 'Hapus Data';
        case 'pesan_user': return 'Pesan ke User';
        default: return 'Menu Admin';
      }
    };

    return (
      <>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(null)}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              {getSectionTitle()}
            </SheetTitle>
          </div>
          <SheetDescription>
            {activeSection === 'management_user' && 'Kelola user dan pendaftaran reseller'}
            {activeSection === 'tanggal_setor' && 'Kelola tanggal setor mitra'}
            {activeSection === 'rekap' && 'Lihat rekap laporan'}
            {activeSection === 'hapus' && 'Hapus data'}
            {activeSection === 'pesan_user' && 'Kirim pesan ke user'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {activeSection === 'tanggal_setor' && <TanggalSetorMitra />}
          {activeSection === 'management_user' && (
            <>
              <PendingRegistrations />
              <UserManagement />
            </>
          )}
          {activeSection === 'rekap' && <RekapLaporan />}
          {activeSection === 'hapus' && <HapusData />}
          {activeSection === 'pesan_user' && <PesanKeUser />}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 pb-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.07] animate-pulse"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
          <Header onSignOut={handleSignOut} showAdminMenu onAdminMenuClick={handleOpenAdminMenu} />

          <WelcomeGreeting userName={userName} />

          {/* Kartu Kalkulator Khusus Admin - Hasil saja */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-4 shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-green-400">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                {editingProfit ? (
                  <Input
                    type="number"
                    value={profitInput}
                    onChange={(e) => setProfitInput(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(profitInput) || 0;
                      updateProfit(val);
                      setEditingProfit(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(profitInput) || 0;
                        updateProfit(val);
                        setEditingProfit(false);
                      }
                    }}
                    autoFocus
                    className="w-36 h-8 text-right text-sm bg-white/10 border-white/20 text-white"
                  />
                ) : (
                  <span
                    onClick={() => setEditingProfit(true)}
                    className={`text-lg font-bold cursor-pointer hover:underline text-green-400`}
                  >
                    {formatCurrency(profit)}
                  </span>
                )}
                <div className="flex flex-col">
                  <button
                    onClick={() => updateProfit(profit + 1000)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <ChevronUp className="h-5 w-5 text-green-400 hover:text-green-300" />
                  </button>
                  <button
                    onClick={() => updateProfit(profit - 1000)}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <ChevronDown className="h-5 w-5 text-green-400 hover:text-green-300" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <DashboardCards
            saldoAwal={unfilteredSaldoAwal}
            totalTagihanAktif={selectedUserId === 'all' ? totalTagihanAktif : undefined}
            totalPembayaran={totalPembayaran}
            sisaSaldo={unfilteredSaldoAwal + profit - unfilteredTotalTagihan - unfilteredTotalLunas}
            komisi={selectedUserId !== 'all' ? komisi : undefined}
            setor={selectedUserId !== 'all' ? setor : undefined}
            bonus={selectedUserId !== 'all' ? bonus : undefined}
            totalTagihan={selectedUserId !== 'all' ? totalTagihanAktif : undefined}
            onUpdateSaldoAwal={handleUpdateSaldoAwal}
            formatCurrency={formatCurrency}
            showKomisiSetorBonus={selectedUserId !== 'all'}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] top-[10%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] overflow-y-auto bg-white border-gray-200">
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

          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] top-[10%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] overflow-y-auto bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-800">
                  <UserPlus className="h-5 w-5" />
                  Tambah Tagihan ke User
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Pilih user dan masukkan detail tagihan
                </DialogDescription>
              </DialogHeader>
              <AddTagihanUser
                profiles={profiles.filter(p => {
                  const isAdmin = p.user_id === user?.id;
                  return !isAdmin;
                })}
                onAddTagihan={async (nama, jumlah, targetUserId, targetUserName) => {
                  await addTagihanForUser(nama, jumlah, targetUserId, targetUserName);
                  setUserDialogOpen(false);
                }}
                onClose={() => setUserDialogOpen(false)}
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full sm:w-[250px] h-10 sm:h-11 text-xs sm:text-sm bg-white/90 backdrop-blur-sm border-green-300 text-gray-800 rounded-xl hover:bg-white focus:ring-2 focus:ring-green-400">
                <SelectValue placeholder="Filter berdasarkan user" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-green-300 shadow-2xl z-[100]">
                <SelectItem value="all" className="text-gray-900 font-medium hover:bg-green-50 focus:bg-green-50 focus:text-green-700 py-2.5">Semua User</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id} className="text-gray-900 font-medium hover:bg-green-50 focus:bg-green-50 focus:text-green-700 py-2.5">
                    {profile.full_name} ({profile.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TagihanAktif
            groupedTagihanAktif={groupedTagihanAktif}
            profiles={profiles}
            onMarkAsLunas={handleMarkAsLunas}
            onDeleteTagihan={handleDeleteTagihan}
            onUpdateTagihan={handleUpdateTagihan}
            formatCurrency={formatCurrency}
            isFiltered={selectedUserId !== 'all'}
            onDeleteAllTagihan={async () => {
              for (const tagihan of tagihanAktif) {
                await handleDeleteTagihan(tagihan.id);
              }
            }}
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
            onDeleteAllLunas={async () => {
              for (const tagihan of tagihanLunas) {
                await handleDeleteTagihan(tagihan.id);
              }
            }}
            formatCurrency={formatCurrency}
            isFiltered={selectedUserId !== 'all'}
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

        {/* Admin Menu Sheet */}
        <Sheet open={adminMenuOpen} onOpenChange={handleCloseAdminMenu}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/10">
            {renderAdminMenuContent()}
          </SheetContent>
        </Sheet>
      </div>

      <BottomNav
        onTambahTagihan={() => setDialogOpen(true)}
        onBayarLangsung={() => setBayarOpen(true)}
        onTambahUser={() => setUserDialogOpen(true)}
        showTambahUser={true}
        role="admin"
      />
    </div>
  );
};
