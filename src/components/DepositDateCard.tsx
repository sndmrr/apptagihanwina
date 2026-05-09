import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

interface DepositDateCardProps {
  depositDate: string | null;
  formatDate: (date: string | null) => string;
  jumlahNamaTagihan?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
  }
};

export const DepositDateCard = ({ depositDate, formatDate, jumlahNamaTagihan = 0 }: DepositDateCardProps) => {
  const hasWarning = jumlahNamaTagihan > 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants} className="w-full">
      <Card className="relative overflow-hidden bg-white border-[3px] border-indigo-400 shadow-lg rounded-2xl group hover:shadow-indigo-200/50 transition-all duration-300 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

        {/* Top: Tanggal Setor */}
        <CardHeader className="pb-1 sm:pb-1.5 relative z-10">
          <CardTitle className="text-[9px] sm:text-xs font-semibold text-gray-700 flex items-center gap-1 sm:gap-1.5">
            <div className="p-1 sm:p-1.5 rounded-lg bg-indigo-100">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-indigo-600" />
            </div>
            <span className="hidden sm:inline">Tanggal Waktu Setor</span>
            <span className="sm:hidden">Tgl Setor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 relative z-10 pb-2 sm:pb-3">
          <div className="text-[10px] sm:text-sm lg:text-lg font-bold text-gray-800 mb-0.5 break-words leading-tight">{formatDate(depositDate)}</div>
          <div className="text-[7px] sm:text-xs text-gray-400 hidden sm:block">Jadwal setor</div>
        </CardContent>

        {/* Divider */}
        <div className="relative z-10 px-3 sm:px-6">
          <Separator className="bg-gray-200" />
        </div>

        {/* Bottom: Warning / Status */}
        <CardContent className="pt-2 sm:pt-3 relative z-10">
          {hasWarning ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <div className="p-1 sm:p-1.5 rounded-lg bg-red-100">
                  <AlertTriangle className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-red-500" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
                </span>
              </div>
              <div>
                <p className="text-[8px] sm:text-xs text-red-500 font-medium leading-tight">Tagihan harus segera dibayar</p>
                <p className="text-[10px] sm:text-sm font-bold text-red-700 leading-tight">{jumlahNamaTagihan} nama</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-emerald-500" />
              </div>
              <p className="text-[9px] sm:text-xs text-emerald-600 font-medium">Semua lunas ✓</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
