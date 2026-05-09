import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
}

interface AddTagihanUserProps {
  profiles: UserProfile[];
  onAddTagihan: (nama: string, jumlah: number, targetUserId: string, targetUserName: string) => Promise<void>;
  onClose?: () => void;
}

export const AddTagihanUser = ({ profiles, onAddTagihan, onClose }: AddTagihanUserProps) => {
  const [inputNama, setInputNama] = useState('');
  const [inputJumlah, setInputJumlah] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedProfile = profiles.find(p => p.user_id === selectedUserId);

  const handleAddTagihan = async () => {
    if (!inputNama.trim() || !inputJumlah.trim() || !selectedUserId) {
      return;
    }

    const jumlah = parseFloat(inputJumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onAddTagihan(inputNama.trim(), jumlah, selectedUserId, selectedProfile?.full_name || 'Unknown');
      setInputNama('');
      setInputJumlah('');
      setSelectedUserId('');
      onClose?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Form content dengan flex layout stabil */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden">
        <div className="grid grid-cols-1 gap-4 flex-shrink-0">
          <div>
            <Label htmlFor="target-user" className="text-gray-700 font-medium">Pilih User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-200">
                <SelectValue placeholder="Pilih user tujuan" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white border-gray-200 shadow-lg z-[9999999]" 
                position="item-aligned"
                avoidCollisions={false}
              >
                {profiles.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">Tidak ada user tersedia</div>
                ) : (
                  profiles.map((profile) => (
                    <SelectItem 
                      key={profile.user_id} 
                      value={profile.user_id} 
                      className="text-gray-800 focus:bg-blue-50 hover:bg-blue-50"
                    >
                      {profile.full_name} ({profile.username})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nama-user" className="text-gray-700 font-medium">Nama Tagihan</Label>
            <Input
              id="nama-user"
              value={inputNama}
              onChange={(e) => setInputNama(e.target.value)}
              placeholder="Masukkan nama tagihan"
              className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <div>
            <Label htmlFor="jumlah-user" className="text-gray-700 font-medium">Jumlah Tagihan</Label>
            <Input
              id="jumlah-user"
              type="number"
              value={inputJumlah}
              onChange={(e) => setInputJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          
          {/* Info user yang dipilih */}
          {selectedProfile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex-shrink-0">
              <p className="text-blue-700 text-sm font-medium">
                Tagihan akan ditambahkan ke akun: <strong>{selectedProfile.full_name}</strong>
              </p>
            </div>
          )}
        </div>
        
        {/* Button di bagian bawah dengan flex-shrink-0 */}
        <div className="flex-shrink-0 mt-auto pt-4">
          <Button
            onClick={handleAddTagihan}
            disabled={!inputNama.trim() || !inputJumlah.trim() || !selectedUserId || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {isLoading ? 'Menambahkan...' : 'Tambah Tagihan ke User'}
          </Button>
        </div>
      </div>
    </div>
  );
};
