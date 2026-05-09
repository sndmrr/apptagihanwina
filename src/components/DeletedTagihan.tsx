
import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: 'belum_lunas' | 'lunas';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface DeletedTagihanProps {
  deletedTagihans: Tagihan[];
  onRestoreTagihan: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

export const DeletedTagihan = ({ deletedTagihans, onRestoreTagihan, onPermanentDelete, formatCurrency }: DeletedTagihanProps) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilAutoDelete = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const autoDeleteTime = new Date(deletedDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const timeLeft = autoDeleteTime.getTime() - now.getTime();
    if (timeLeft <= 0) return 'Akan dihapus otomatis';
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursLeft}j ${minutesLeft}m lagi`;
  };

  const handlePermanentDelete = async (id: string) => {
    await onPermanentDelete(id);
    setConfirmDeleteId(null);
  };

  if (deletedTagihans.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/[0.04] backdrop-blur-sm border-white/[0.06]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400/80">
            <Trash2 className="h-5 w-5" />
            Tagihan Terhapus
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-center text-white/30 py-8">Tidak ada tagihan yang terhapus</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/[0.04] backdrop-blur-sm border-white/[0.06]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400/80">
          <Trash2 className="h-5 w-5" />
          Tagihan Terhapus ({deletedTagihans.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="rounded-b-lg p-6">
        <Alert className="mb-4 bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300/80">
            <strong>Perhatian:</strong> Data tagihan terhapus akan dihapus permanen otomatis setelah 24 jam. 
            Gunakan "Kembalikan" untuk memulihkan data atau "Hapus Permanen" untuk menghapus sekarang.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          {deletedTagihans.map((tagihan) => (
            <div key={tagihan.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="flex-1">
                <div className="font-medium text-white/70">{tagihan.nama}</div>
                <div className="text-sm text-white/40">{formatCurrency(tagihan.jumlah)}</div>
                <div className="text-xs text-white/30 mt-1">Dihapus: {formatDate(tagihan.deleted_at!)}</div>
                <div className="text-xs text-white/30">Status: {tagihan.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}</div>
                <div className="flex items-center gap-1 text-xs text-red-400/60 mt-1">
                  <Clock className="h-3 w-3" />
                  Auto-hapus: {getTimeUntilAutoDelete(tagihan.deleted_at!)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => onRestoreTagihan(tagihan.id)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Kembalikan
                </Button>
                <Dialog open={confirmDeleteId === tagihan.id} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setConfirmDeleteId(tagihan.id)} variant="outline" className="text-red-400 hover:bg-red-500/10 border-red-500/30 shadow-lg">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus Permanen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white">Konfirmasi Hapus Permanen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert className="bg-red-500/10 border-red-500/20">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300/80">
                          <strong>PERINGATAN:</strong> Tindakan ini tidak dapat dibatalkan! 
                          Data tagihan "{tagihan.nama}" akan dihapus selamanya.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="border-white/10 text-white/70 hover:bg-white/5">Batal</Button>
                        <Button variant="destructive" onClick={() => handlePermanentDelete(tagihan.id)} className="bg-red-600 hover:bg-red-700">Ya, Hapus Permanen</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
