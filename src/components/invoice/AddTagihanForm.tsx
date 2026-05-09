
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface AddTagihanFormProps {
  onAddTagihan: (nama: string, jumlah: number) => void;
  onCancel: () => void;
}

export const AddTagihanForm = ({ onAddTagihan, onCancel }: AddTagihanFormProps) => {
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nama.trim() || !jumlah.trim()) {
      return;
    }

    const jumlahNumber = parseFloat(jumlah);
    if (isNaN(jumlahNumber) || jumlahNumber <= 0) {
      return;
    }

    onAddTagihan(nama.trim(), jumlahNumber);
    setNama('');
    setJumlah('');
  };

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Tagihan Baru
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="add-nama" className="text-xs">Nama</Label>
            <Input
              id="add-nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama"
              className="text-sm"
              required
            />
          </div>
          <div>
            <Label htmlFor="add-jumlah" className="text-xs">Jumlah</Label>
            <Input
              id="add-jumlah"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              className="text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Tambah
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
