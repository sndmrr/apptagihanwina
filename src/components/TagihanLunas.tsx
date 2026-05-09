
import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserColor } from "@/lib/userColors";

interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: 'belum_lunas' | 'lunas';
  created_at: string;
  updated_at: string;
  nama_input?: string;
  nama_lunas?: string;
}

interface TagihanLunasProps {
  tagihanLunas: Tagihan[];
  onDeleteTagihan?: (id: string) => Promise<void>;
  onRestoreTagihan?: (id: string) => Promise<void>;
  onDeleteAllLunas: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  isMitra?: boolean;
  isFiltered?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
}

export const TagihanLunas = ({ 
  tagihanLunas, onDeleteTagihan, onRestoreTagihan, onDeleteAllLunas, formatCurrency, isMitra = false, isFiltered = false, canDelete = true, canRestore = true
}: TagihanLunasProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (tagihanLunas.length === 0) return null;

  return (
    <Card className="shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-sm font-semibold">✅ Tagihan Sudah Lunas</CardTitle>
          {tagihanLunas.length > 0 && !isMitra && (
            <Button onClick={onDeleteAllLunas} variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200 text-[10px] px-2 py-1 h-7 rounded-lg">
              <Trash2 className="h-3 w-3 mr-1" />
              {isFiltered ? 'Hapus Semua' : 'Hapus Semua'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="rounded-lg px-3 pb-3">
        <div className="space-y-2">
          {tagihanLunas.map((tagihan) => (
            <div key={tagihan.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex-1">
                <div className="font-semibold text-[10px] sm:text-xs text-gray-800 truncate mb-1">{tagihan.nama}</div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-md font-semibold text-[10px] sm:text-xs inline-block mb-1">
                  {formatCurrency(tagihan.jumlah)}
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="text-[9px] text-gray-500 font-medium">Diinput: {formatDate(tagihan.created_at)}</div>
                  {tagihan.nama_input && (
                    <span className={`${getUserColor(tagihan.nama_input)} text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm`}>{tagihan.nama_input}</span>
                  )}
                </div>
                {tagihan.nama_lunas && (
                  <div className="flex items-center gap-1.5">
                    <div className="text-[9px] text-gray-500 font-medium">Lunas oleh:</div>
                    <span className={`${getUserColor(tagihan.nama_lunas)} text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium shadow-sm`}>{tagihan.nama_lunas}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-md font-semibold text-[9px] sm:text-[10px] shadow-sm">
                  ✓ Lunas
                </div>
                {(!isMitra || canRestore) && onRestoreTagihan && (
                  <Button size="sm" onClick={() => onRestoreTagihan(tagihan.id)} variant="outline" className="text-blue-600 hover:bg-blue-50 px-1.5 border-gray-300 rounded-md h-6 w-6" title="Kembalikan ke tagihan aktif">
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
                {(!isMitra || canDelete) && onDeleteTagihan && (
                  <Button size="sm" onClick={() => onDeleteTagihan(tagihan.id)} variant="outline" className="text-red-600 hover:bg-red-50 px-1.5 border-gray-300 rounded-md h-6 w-6">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
