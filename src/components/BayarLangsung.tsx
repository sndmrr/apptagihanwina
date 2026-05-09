import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Banknote, Plus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BayarLangsungProps {
  onBayarLangsung: (nama: string, jumlah: number) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export const BayarLangsung = ({ onBayarLangsung, open: controlledOpen, onOpenChange, hideTrigger }: BayarLangsungProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => { onOpenChange ? onOpenChange(v) : setInternalOpen(v); };
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formatNumber = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (value: string) => parseInt(value.replace(/\./g, ''), 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) { toast({ title: "Error", description: "Nama harus diisi", variant: "destructive" }); return; }
    const jumlahNumber = parseNumber(jumlah);
    if (!jumlahNumber || jumlahNumber <= 0) { toast({ title: "Error", description: "Jumlah harus berupa angka positif", variant: "destructive" }); return; }
    setIsSubmitting(true);
    try {
      await onBayarLangsung(nama.trim(), jumlahNumber);
      toast({ title: "Berhasil", description: `Pembayaran ${nama} sebesar Rp ${formatNumber(jumlahNumber.toString())} berhasil dicatat` });
      setNama(''); setJumlah(''); setOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Gagal mencatat pembayaran", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 text-white rounded-xl font-semibold hover:scale-[1.02]">
            <Banknote className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
            Bayar Langsung
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px] w-[95vw] max-h-[85vh] top-4 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-xl">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header dengan jarak stabil */}
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-gray-800 text-sm font-semibold">
              <Banknote className="h-4 w-4" />
              Bayar Langsung
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-xs">
              Catat pembayaran langsung. Data akan otomatis masuk ke kategori Lunas.
            </DialogDescription>
          </DialogHeader>
          
          {/* Form content dengan flex layout stabil */}
          <div className="flex-1 flex flex-col justify-start overflow-hidden mt-3">
            <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-3">
              <div className="space-y-1.5 flex-shrink-0">
                <Label htmlFor="nama" className="text-gray-700 font-medium text-xs">Nama</Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama pembayaran"
                  className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-200 h-9 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5 flex-shrink-0">
                <Label htmlFor="jumlah" className="text-gray-700 font-medium text-xs">Jumlah (Rp)</Label>
                <Input
                  id="jumlah"
                  value={jumlah}
                  onChange={(e) => setJumlah(formatNumber(e.target.value))}
                  placeholder="Masukkan jumlah pembayaran"
                  className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-200 h-9 rounded-lg text-sm"
                />
              </div>
              
              {/* Button di bagian bawah dengan flex-shrink-0 */}
              <div className="flex-shrink-0 mt-auto">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm hover:shadow-md transition-all duration-200 h-9 rounded-lg text-sm"
                >
                  {isSubmitting ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Simpan Pembayaran
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
