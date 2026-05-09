import React, { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, Calculator, Edit2, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Coins, Gift } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { useModernNotification } from '@/hooks/useModernNotification';

interface DashboardCardsProps {
  saldoAwal: number;
  totalTagihanAktif?: number;
  totalPembayaran?: number;
  sisaSaldo: number;
  komisi?: number;
  setor?: number;
  bonus?: number;
  onUpdateSaldoAwal: (newAmount: number) => Promise<void>;
  formatCurrency: (amount: number) => string;
  showKomisiSetorBonus?: boolean;
  totalTagihan?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1] as const
    }
  })
};

// Reusable styled card with white bg + green border + green icon
const StyledCard = ({
  children,
  borderColors,
  iconBg,
  iconColor,
  icon: Icon,
  label,
  shortLabel,
  index,
}: {
  children: React.ReactNode;
  borderColors: string;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType;
  label: string;
  shortLabel?: string;
  index: number;
}) => (
  <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants}>
    <Card className={`relative overflow-hidden bg-white border ${borderColors} rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] group hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-all duration-150 h-16 flex flex-col justify-center`}>
      <CardHeader className="pb-1 pt-1 px-2.5">
        <CardTitle className="text-[9px] font-semibold text-gray-600 flex items-center gap-1">
          <div className={`p-0.5 rounded-md ${iconBg}`}>
            <Icon className={`h-2.5 w-2.5 ${iconColor}`} strokeWidth={2} />
          </div>
          {shortLabel ? (
            <>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2.5 pb-1">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

export const DashboardCards = ({ 
  saldoAwal, 
  totalTagihanAktif, 
  totalPembayaran, 
  sisaSaldo,
  komisi,
  setor,
  bonus,
  onUpdateSaldoAwal, 
  formatCurrency,
  showKomisiSetorBonus = false,
  totalTagihan
}: DashboardCardsProps) => {
  const [editingSaldoAwal, setEditingSaldoAwal] = useState(false);
  const [newSaldoAwal, setNewSaldoAwal] = useState('');
  const { showLoading, showSuccess } = useModernNotification();

  const handleUpdateSaldoAwal = async () => {
    const newAmount = parseFloat(newSaldoAwal);
    if (isNaN(newAmount)) return;
    
    // Show loading notification
    showLoading();
    
    try {
      await onUpdateSaldoAwal(newAmount);
      setEditingSaldoAwal(false);
      setNewSaldoAwal('');
      
      // Simulate 2 second loading then show success
      setTimeout(() => {
        showSuccess('Saldo awal berhasil diperbarui');
      }, 2000);
    } catch (error) {
      // Hide loading and show error (using old toast for errors)
      setEditingSaldoAwal(false);
      setNewSaldoAwal('');
      // You can add error handling here if needed
    }
  };

  return (
    <div className={`grid ${showKomisiSetorBonus ? 'grid-cols-2 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'} gap-2 mb-3`}>
      {/* Total Saldo Card - Purple */}
      {!showKomisiSetorBonus && (
        <StyledCard
          index={0}
          borderColors="border-purple-400"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          icon={Wallet}
          label="Total Saldo"
          shortLabel="Saldo"
        >
          {editingSaldoAwal ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={newSaldoAwal}
                  onChange={(e) => setNewSaldoAwal(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-slate-800 text-xs sm:text-sm rounded-lg"
                  placeholder="Saldo awal"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                      const current = parseFloat(newSaldoAwal) || 0;
                      setNewSaldoAwal((current + 1000).toString());
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white h-8 w-8 p-0 rounded-lg shadow-md"
                  >
                    <ChevronUp className="h-5 w-5 text-green-500 stroke-[3]" />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                      const current = parseFloat(newSaldoAwal) || 0;
                      setNewSaldoAwal(Math.max(0, current - 1000).toString());
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white h-8 w-8 p-0 rounded-lg shadow-md"
                  >
                    <ChevronDown className="h-5 w-5 text-green-500 stroke-[3]" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={handleUpdateSaldoAwal}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-lg"
                >
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingSaldoAwal(false)}
                  className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs px-2 py-1 rounded-lg"
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="w-full pr-1">
                <div className="text-[10px] font-bold text-purple-700 mb-0.5 break-words leading-tight">{formatCurrency(saldoAwal)}</div>
                <div className="text-[8px] text-slate-400 hidden sm:block">Saldo tersedia</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingSaldoAwal(true);
                  setNewSaldoAwal(saldoAwal.toString());
                }}
                className="text-purple-500 hover:bg-purple-50 p-1.5 rounded-lg"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </StyledCard>
      )}

      {/* Conditional Cards Based on View Type */}
      {showKomisiSetorBonus ? (
        <>
          {/* Total Tagihan Card - Red */}
          {totalTagihan !== undefined && (
            <StyledCard
              index={0}
              borderColors="border-red-400"
              iconBg="bg-red-100"
              iconColor="text-red-600"
              icon={TrendingDown}
              label="Total Tagihan"
              shortLabel="Tagihan"
            >
              <div className="text-[10px] font-bold text-red-600 mb-0.5 break-words leading-tight">{formatCurrency(totalTagihan)}</div>
              <div className="text-[7px] text-slate-400 hidden sm:block">Total rupiah</div>
            </StyledCard>
          )}

          {/* Komisi Card - Blue */}
          <StyledCard
            index={1}
            borderColors="border-blue-400"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            icon={Coins}
            label="Komisi"
          >
            <div className="text-[10px] font-bold text-blue-600 mb-0.5 break-words leading-tight">{formatCurrency(komisi || 0)}</div>
            <div className="text-[7px] text-slate-400 hidden sm:block">Total komisi</div>
          </StyledCard>

          {/* Setor Card - Green */}
          <StyledCard
            index={2}
            borderColors="border-green-400"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            icon={TrendingUp}
            label="Setor"
          >
            <div className="text-[10px] font-bold text-green-600 mb-0.5 break-words leading-tight">{formatCurrency(setor || 0)}</div>
            <div className="text-[7px] text-slate-400 hidden sm:block">Total setor</div>
          </StyledCard>

          {/* Bonus Card - Orange */}
          <StyledCard
            index={3}
            borderColors="border-orange-400"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            icon={Gift}
            label="Bonus"
          >
            <div className="text-[10px] font-bold text-orange-600 mb-0.5 break-words leading-tight">{formatCurrency(bonus || 0)}</div>
            <div className="text-[7px] text-slate-400 hidden sm:block">Total bonus</div>
          </StyledCard>

          {/* Total Bayar Card - Green */}
          {totalPembayaran !== undefined && (
            <StyledCard
              index={4}
              borderColors="border-green-400"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              icon={CheckCircle}
              label="Total Bayar"
            >
              <div className="text-[10px] font-bold text-green-600 mb-0.5 break-words leading-tight">{formatCurrency(totalPembayaran)}</div>
              <div className="text-[7px] text-slate-400 hidden sm:block">Sudah terbayar</div>
            </StyledCard>
          )}
        </>
      ) : (
        <>
          {/* Tagihan Aktif Card - Red */}
          <StyledCard
            index={1}
            borderColors="border-red-400"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            icon={AlertCircle}
            label="Tagihan Aktif"
            shortLabel="Tagihan"
          >
            <div className="text-[10px] font-bold text-red-600 mb-0.5 break-words leading-tight">{formatCurrency(totalTagihanAktif || 0)}</div>
            <div className="text-[7px] text-slate-400 hidden sm:block">Belum terbayar</div>
          </StyledCard>

          {/* Total Bayar Card - Green */}
          <StyledCard
            index={2}
            borderColors="border-green-400"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            icon={CheckCircle}
            label="Total Bayar"
            shortLabel="Bayar"
          >
            <div className="text-[10px] font-bold text-green-600 mb-0.5 break-words leading-tight">{formatCurrency(totalPembayaran || 0)}</div>
            <div className="text-[7px] text-slate-400 hidden sm:block">Sudah terbayar</div>
          </StyledCard>
        </>
      )}

      {/* Sisa Saldo Card - Yellow */}
      {!showKomisiSetorBonus && (
        <StyledCard
          index={3}
          borderColors="border-yellow-400"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          icon={Calculator}
          label="Sisa Saldo"
        >
          <div className={`text-[10px] font-bold mb-0.5 break-words leading-tight ${sisaSaldo >= 0 ? 'text-yellow-600' : 'text-red-500'}`}>
            {formatCurrency(sisaSaldo)}
          </div>
          <div className="text-[7px] text-slate-400 hidden sm:block">
            {sisaSaldo >= 0 ? 'Tersisa' : 'Kekurangan'}
          </div>
        </StyledCard>
      )}
    </div>
  );
};
