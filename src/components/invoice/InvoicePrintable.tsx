
import React, { useState } from 'react';
import { GroupedTagihan } from './types';
import { AlertTriangle, Plus, X, Building2, Calendar, Hash, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdditionalTagihan {
  id: string;
  nama: string;
  jumlah: number;
}

interface InvoicePrintableProps {
  group: GroupedTagihan;
  formatCurrency: (amount: number) => string;
  editableKeterangan: {
    [key: string]: string;
  };
  trustScore: number;
  additionalTagihan?: AdditionalTagihan[];
  onAddAdditionalTagihan?: (nama: string, jumlah: number) => void;
  onRemoveAdditionalTagihan?: (id: string) => void;
  onCancelAdd?: () => void;
  showAddForm?: boolean;
  totalWithAdditional?: number;
}

export const InvoicePrintable = React.forwardRef<HTMLDivElement, InvoicePrintableProps>(({
  group,
  formatCurrency,
  editableKeterangan,
  trustScore,
  additionalTagihan = [],
  onAddAdditionalTagihan,
  onRemoveAdditionalTagihan,
  onCancelAdd,
  showAddForm = false,
  totalWithAdditional
}, ref) => {
  const [tempNama, setTempNama] = useState('');
  const [tempJumlah, setTempJumlah] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getDueDate = (): Date | null => {
    if (group.items.length === 0) return null;
    const firstItem = [...group.items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
    const due = new Date(firstItem.created_at);
    due.setDate(due.getDate() + 7);
    return due;
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 0 && score <= 50) return 'bg-red-500 text-white';
    if (score >= 51 && score <= 75) return 'bg-yellow-400 text-black';
    if (score >= 76 && score <= 90) return 'bg-blue-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getTrustScoreText = (score: number) => {
    if (score >= 90) return `⭐ Skor Kepercayaan: ${score}`;
    return `Skor Kepercayaan: ${score}`;
  };

  const isApproaching7Days = () => {
    if (group.items.length === 0) return false;
    const firstItem = group.items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    const daysDiff = Math.floor((new Date().getTime() - new Date(firstItem.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 5;
  };

  const getDaysOverdue = (): number => {
    const dueDate = getDueDate();
    if (!dueDate) return 0;
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNama.trim() || !tempJumlah.trim()) return;
    
    const jumlahNumber = parseFloat(tempJumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) return;

    if (onAddAdditionalTagihan) {
      onAddAdditionalTagihan(tempNama.trim(), jumlahNumber);
    }
    setTempNama('');
    setTempJumlah('');
  };

  const displayTotal = totalWithAdditional || group.totalJumlah;

  return (
    <div ref={ref} className="bg-white mx-auto max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-gray-100 print:max-w-none print:w-[210mm] print:min-h-[297mm]">
      {/* Elegant Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-white/30 shadow-lg">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SYAKIR DIGITAL</h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Layanan Kebutuhan Digital</p>
            </div>
          </div>
          <div className="text-left sm:text-right space-y-1 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 text-blue-100">
              <Hash className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm font-medium">{invoiceNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm font-medium">{currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Title & Status */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50 px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5">TAGIHAN PEMBAYARAN</h2>
            <div className="flex items-center space-x-2 text-gray-500">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Sukasari, Gununghalu, Kab. Bandung Barat</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md ${getTrustScoreColor(trustScore)}`}>
            {getTrustScoreText(trustScore)}
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="px-4 sm:px-8 py-5 sm:py-6 bg-white">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">Tagihan Untuk</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{group.nama}</p>
              {getDueDate() && (
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Jatuh tempo: {getDueDate()!.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              )}
            </div>
            {getDaysOverdue() > 0 ? (
              <div className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-md self-start sm:self-auto">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-bold">Sudah Lewat {getDaysOverdue()} Hari</span>
                </div>
                <p className="text-xs mt-0.5 text-red-100">Segera lakukan Pembayaran</p>
              </div>
            ) : isApproaching7Days() && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-600 px-2.5 py-1 rounded-full shadow-sm self-start sm:self-auto">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Mendekati 7 Hari</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="px-4 sm:px-8 py-4 sm:py-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">
              <div className="col-span-6 sm:col-span-7">Deskripsi</div>
              <div className="col-span-3 sm:col-span-3 text-center">Tanggal</div>
              <div className="col-span-3 sm:col-span-2 text-right">Jumlah</div>
            </div>
          </div>

          {/* Original Items */}
          <div className="divide-y divide-gray-100 bg-white">
            {group.items.map((item, index) => (
              <div key={item.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-blue-50/30 transition-all duration-200">
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-6 sm:col-span-7">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {editableKeterangan[item.id] || `Layanan Digital ${String.fromCharCode(65 + index)}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">#{item.id.slice(0, 8)}</p>
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(item.jumlah)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Additional Items */}
            {additionalTagihan.map((item) => (
              <div key={item.id} className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 border-l-4 border-orange-400">
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-6 sm:col-span-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.nama}</p>
                        <p className="text-xs text-orange-600 mt-0.5 font-medium">+ Tambahan</p>
                      </div>
                      {onRemoveAdditionalTagihan && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveAdditionalTagihan(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">Hari ini</span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(item.jumlah)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Form */}
            {showAddForm && onAddAdditionalTagihan && (
              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                <form onSubmit={handleAddSubmit} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-end">
                  <div className="sm:col-span-5">
                    <Label className="text-xs font-semibold text-gray-700">Nama Tagihan</Label>
                    <Input
                      type="text"
                      value={tempNama}
                      onChange={(e) => setTempNama(e.target.value)}
                      placeholder="Masukkan nama"
                      className="mt-1 text-sm bg-white border-gray-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label className="text-xs font-semibold text-gray-700">Jumlah (Rp)</Label>
                    <Input
                      type="number"
                      value={tempJumlah}
                      onChange={(e) => setTempJumlah(e.target.value)}
                      placeholder="0"
                      className="mt-1 text-sm bg-white border-gray-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-4 flex gap-2">
                    <Button type="submit" size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Tambah
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onCancelAdd}
                      className="flex-1 border-gray-300"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 sm:px-8 py-5 sm:py-6 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-sm ml-auto space-y-2">
          <div className="flex justify-between items-center py-2 text-gray-600">
            <span className="font-medium text-sm sm:text-base">Subtotal</span>
            <span className="font-semibold text-sm sm:text-base">{formatCurrency(group.totalJumlah)}</span>
          </div>
          {additionalTagihan.length > 0 && (
            <div className="flex justify-between items-center py-2 text-orange-600">
              <span className="font-medium text-sm sm:text-base">Tagihan Tambahan</span>
              <span className="font-semibold text-sm sm:text-base">
                {formatCurrency(additionalTagihan.reduce((sum, item) => sum + item.jumlah, 0))}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 text-gray-600">
            <span className="font-medium text-sm sm:text-base">Pajak</span>
            <span className="font-semibold text-sm sm:text-base">Rp 0</span>
          </div>
          <div className="border-t-2 border-gray-300 pt-3 mt-2">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg">
              <span className="text-base sm:text-lg font-bold">TOTAL</span>
              <span className="text-lg sm:text-2xl font-bold">{formatCurrency(displayTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white px-4 sm:px-8 py-5 sm:py-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="text-center space-y-2 sm:space-y-3 relative z-10">
          <h3 className="text-base sm:text-lg font-bold">Terima Kasih Atas Kepercayaan Anda</h3>
          <p className="text-blue-100 text-xs sm:text-sm">Invoice ini dibuat secara otomatis oleh sistem Syakir Digital</p>
          <div className="pt-2">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg ${getTrustScoreColor(trustScore)}`}>
              ⭐ Skor Kepercayaan: {trustScore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePrintable.displayName = 'InvoicePrintable';
