
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Invoice } from "./Invoice";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getUserColor } from "@/lib/userColors";

interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
}

interface TagihanAktifProps {
  groupedTagihanAktif: Array<{
    nama: string;
    items: Array<{
      id: string;
      nama: string;
      jumlah: number;
      status: 'belum_lunas' | 'lunas';
      created_at: string;
      updated_at: string;
      user_id?: string;
      nama_input?: string;
      nama_lunas?: string;
    }>;
    totalJumlah: number;
  }>;
  profiles?: UserProfile[];
  onMarkAsLunas?: (id: string, nama: string) => Promise<void>;
  onDeleteTagihan?: (id: string) => Promise<void>;
  onUpdateTagihan?: (id: string, nama: string, jumlah: number) => Promise<void>;
  formatCurrency: (amount: number) => string;
  isMitra?: boolean;
  isFiltered?: boolean;
  onDeleteAllTagihan?: () => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  canLunas?: boolean;
}

export const TagihanAktif = ({
  groupedTagihanAktif,
  profiles = [],
  onMarkAsLunas,
  onDeleteTagihan,
  onUpdateTagihan,
  formatCurrency,
  isMitra = false,
  isFiltered = false,
  onDeleteAllTagihan,
  canEdit = true,
  canDelete = true,
  canLunas = true
}: TagihanAktifProps) => {
  const getUserName = (userId?: string): string | null => {
    if (!userId || profiles.length === 0) return null;
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || null;
  };
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editJumlah, setEditJumlah] = useState('');
  const [confirmLunasId, setConfirmLunasId] = useState<string | null>(null);
  const [confirmLunasNama, setConfirmLunasNama] = useState<string>('');

  const handleEdit = (item: any) => {
    setEditingItem(item.id);
    setEditNama(item.nama);
    setEditJumlah(item.jumlah.toString());
  };

  const handleSaveEdit = async () => {
    if (editingItem && editNama.trim() && editJumlah && onUpdateTagihan) {
      await onUpdateTagihan(editingItem, editNama, parseFloat(editJumlah));
      setEditingItem(null);
      setEditNama('');
      setEditJumlah('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditNama('');
    setEditJumlah('');
  };

  const handleConfirmLunas = (id: string, nama: string) => {
    setConfirmLunasId(id);
    setConfirmLunasNama(nama);
  };

  const handleMarkAsLunas = async () => {
    if (confirmLunasId && confirmLunasNama && onMarkAsLunas) {
      await onMarkAsLunas(confirmLunasId, confirmLunasNama);
      setConfirmLunasId(null);
      setConfirmLunasNama('');
    }
  };

  const isApproaching7Days = (items: any[]) => {
    if (items.length === 0) return false;
    const firstItem = [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    const daysDiff = Math.floor((new Date().getTime() - new Date(firstItem.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 5;
  };

  if (groupedTagihanAktif.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-gray-800 text-sm font-semibold">📋 Tagihan Aktif</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className="text-gray-500 text-center py-2 text-xs">Tidak ada tagihan aktif</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-sm font-semibold">📋 Tagihan Aktif</CardTitle>
          {isFiltered && onDeleteAllTagihan && !isMitra && (
            <Button onClick={onDeleteAllTagihan} variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200 text-[10px] px-2 py-1 h-7 rounded-lg">
              <Trash2 className="h-3 w-3 mr-1" />
              Hapus Semua
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3">
        {groupedTagihanAktif.map((group) => {
          const hasWarning = isApproaching7Days(group.items);
          return (
            <div key={group.nama} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-shadow">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className={`px-1.5 py-0.5 rounded-md ${hasWarning ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'}`}>
                    <h3 className="font-semibold text-[10px] sm:text-xs truncate">
                      {group.nama}
                    </h3>
                  </div>
                  {hasWarning && (
                    <div title="Tagihan mendekati 7 hari" className="bg-red-100 p-0.5 rounded flex-shrink-0">
                      <AlertTriangle className="h-2.5 w-2.5 text-red-600" />
                    </div>
                  )}
                  <Badge variant="secondary" className="text-[9px] bg-green-100 text-green-700 border-green-200 font-medium flex-shrink-0 px-1.5 py-0">
                    {group.items.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1.5 py-0.5 rounded-md font-bold text-[10px] sm:text-xs shadow-sm">
                    {formatCurrency(group.totalJumlah)}
                  </div>
                  <Invoice group={group} formatCurrency={formatCurrency} />
                </div>
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-2 rounded-md border border-gray-200 hover:border-green-300 transition-colors">
                    {editingItem === item.id ? (
                      <div className="space-y-1.5">
                        <Input value={editNama} onChange={(e) => setEditNama(e.target.value)} placeholder="Nama tagihan" className="text-xs bg-white border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-200 h-7 rounded-md" />
                        <Input type="number" value={editJumlah} onChange={(e) => setEditJumlah(e.target.value)} placeholder="Jumlah" className="text-xs bg-white border-gray-300 text-gray-800 focus:border-green-500 focus:ring-green-200 h-7 rounded-md" />
                        <div className="flex gap-1">
                          <Button onClick={handleSaveEdit} size="sm" className="text-[10px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm h-6 rounded-md">Simpan</Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="outline" className="text-[10px] border-gray-300 text-gray-600 hover:bg-gray-50 h-6 rounded-md">Batal</Button>
                        </div>
                      </div>
                     ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[10px] text-gray-500 font-medium">
                              {new Date(item.created_at).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {(() => {
                              const ownerName = getUserName(item.user_id);
                              const displayName = ownerName || item.nama_input;
                              if (displayName) {
                                return (
                                  <span className={`${getUserColor(displayName)} text-white text-[9px] px-1 py-0 rounded-full font-medium shadow-sm`}>
                                    {displayName}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-1.5 py-0.5 rounded font-semibold text-[10px] inline-block">
                            {formatCurrency(item.jumlah)}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          {canLunas && onMarkAsLunas && (
                            <div title="Tandai sebagai lunas">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button onClick={() => handleConfirmLunas(item.id, item.nama)} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-5 w-5 p-0 rounded-md shadow-sm">
                                    <Check className="h-2.5 w-2.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-xl">
                                  <AlertDialogHeader>
                                    <div className="text-center mb-3">
                                      <div className="text-3xl mb-1">✅</div>
                                      <AlertDialogTitle className="text-gray-800 text-sm font-semibold">Konfirmasi Pelunasan</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="text-gray-600 text-center text-xs">
                                      Apakah Anda yakin ingin menandai tagihan ini sebagai Lunas?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-1.5">
                                    <AlertDialogCancel className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs h-7 rounded-md">Batalkan</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleMarkAsLunas} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md text-xs h-7 rounded-md">
                                      Ya, Tandai Lunas
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                          {(!isMitra || canEdit) && onUpdateTagihan && (
                            <div title="Edit tagihan">
                              <Button onClick={() => handleEdit(item)} size="sm" variant="outline" className="h-5 w-5 p-0 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md">
                                <Edit className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          )}
                          {(!isMitra || canDelete) && onDeleteTagihan && (
                            <div title="Hapus tagihan">
                              <Button onClick={() => onDeleteTagihan(item.id)} size="sm" variant="outline" className="text-red-600 hover:bg-red-50 h-5 w-5 p-0 border-gray-300 rounded-md">
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
