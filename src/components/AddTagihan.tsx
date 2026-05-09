
import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModernNotification } from '@/hooks/useModernNotification';

interface AddTagihanProps {
  onAddTagihan: (nama: string, jumlah: number) => Promise<void>;
}

export const AddTagihan = ({ onAddTagihan }: AddTagihanProps) => {
  const [inputNama, setInputNama] = useState('');
  const [inputJumlah, setInputJumlah] = useState('');
  const namaInputRef = useRef<HTMLInputElement>(null);
  const jumlahInputRef = useRef<HTMLInputElement>(null);
  const { showLoading, showSuccess } = useModernNotification();

  const handleAddTagihan = async () => {
    if (!inputNama.trim() || !inputJumlah.trim()) return;
    const jumlah = parseFloat(inputJumlah);
    if (isNaN(jumlah) || jumlah <= 0) return;
    
    // Show loading notification
    showLoading();
    
    try {
      await onAddTagihan(inputNama.trim(), jumlah);
      setInputNama('');
      setInputJumlah('');
      
      // Simulate 2 second loading then show success
      setTimeout(() => {
        showSuccess('Tagihan berhasil ditambahkan');
      }, 2000);
    } catch (error) {
      // Hide loading and show error (using old toast for errors)
      setInputNama('');
      setInputJumlah('');
      // You can add error handling here if needed
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header dekoratif di posisi paling atas */}
      <div className="text-center mb-4 relative flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="text-4xl">🌙</div>
        </div>
        <h3 className="text-gray-800 text-sm font-bold relative z-10 mb-1.5">
          ✨ Tambah Tagihan Baru ✨
        </h3>
        <div className="w-16 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
      </div>

      {/* Form content - flex untuk layout stabil */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden">
        <div className="grid grid-cols-1 gap-3 flex-shrink-0">
          <div>
            <Label htmlFor="nama" className="text-gray-700 font-medium text-xs">Nama</Label>
            <Input
              ref={namaInputRef}
              id="nama"
              value={inputNama}
              onChange={(e) => setInputNama(e.target.value)}
              placeholder="Masukkan nama"
              className="border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white h-9 rounded-lg text-sm"
            />
          </div>
          <div>
            <Label htmlFor="jumlah" className="text-gray-700 font-medium text-xs">Jumlah Tagihan</Label>
            <Input
              ref={jumlahInputRef}
              id="jumlah"
              type="number"
              value={inputJumlah}
              onChange={(e) => setInputJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              className="border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white h-9 rounded-lg text-sm"
            />
          </div>
          <Button
            onClick={handleAddTagihan}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium shadow-sm transition-all duration-200 hover:shadow-md border border-green-400 flex-shrink-0 h-9 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tagihan
          </Button>
        </div>
      </div>

      {/* Ornamen bawah - fixed position */}
      <div className="flex justify-center mt-3 opacity-20 flex-shrink-0">
        <div className="text-xl">🕌</div>
      </div>
    </div>
  );
};
