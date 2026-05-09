
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceDialog } from '@/components/invoice/InvoiceDialog';

interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: 'belum_lunas' | 'lunas';
  created_at: string;
}

export const CekTagihan = () => {
  const [searchName, setSearchName] = useState('');
  const [tagihans, setTagihans] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) { toast({ title: "Error", description: "Masukkan nama untuk mencari tagihan", variant: "destructive" }); return; }
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase.from('tagihan').select('id, nama, jumlah, status, created_at').ilike('nama', `%${searchName.trim()}%`).is('deleted_at', null).order('created_at', { ascending: false });
      if (error) throw error;
      const typedData = (data || []).map(item => ({ ...item, status: item.status as 'belum_lunas' | 'lunas' }));
      setTagihans(typedData);
      if (typedData.length === 0) { toast({ title: "Info", description: `Tidak ada tagihan ditemukan untuk nama "${searchName.trim()}"` }); }
    } catch (error: any) {
      toast({ title: "Error", description: `Gagal mencari tagihan: ${error.message}`, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const computeDueDate = (items: Tagihan[]) => {
    if (items.length === 0) return null;
    const first = [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    const due = new Date(first.created_at);
    due.setDate(due.getDate() + 7);
    return due;
  };

  const groupedTagihans = tagihans.reduce((acc, tagihan) => {
    const normalizedNama = tagihan.nama.toLowerCase().trim();
    const existing = acc.find(group => group.nama.toLowerCase().trim() === normalizedNama);
    if (existing) {
      existing.items.push(tagihan);
      existing.totalJumlah += tagihan.jumlah;
      existing.totalBelumLunas += tagihan.status === 'belum_lunas' ? tagihan.jumlah : 0;
      existing.totalLunas += tagihan.status === 'lunas' ? tagihan.jumlah : 0;
    } else {
      acc.push({ nama: tagihan.nama, items: [tagihan], totalJumlah: tagihan.jumlah, totalBelumLunas: tagihan.status === 'belum_lunas' ? tagihan.jumlah : 0, totalLunas: tagihan.status === 'lunas' ? tagihan.jumlah : 0 });
    }
    return acc;
  }, [] as Array<{ nama: string; items: Tagihan[]; totalJumlah: number; totalBelumLunas: number; totalLunas: number; }>);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-xl rounded-3xl">
        <CardHeader className="text-center pb-4 pt-8 px-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Cek Tagihan
            </CardTitle>
          </div>
          <p className="text-gray-500">Masukkan nama untuk melihat tagihan</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSearch} className="space-y-6 mb-6">
            <div className="relative">
              <input
                id="searchName"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder=""
                className="w-full h-14 px-4 pt-4 pb-2 bg-transparent border-2 border-green-300 text-gray-800 placeholder:text-gray-400 rounded-full focus:outline-none focus:border-green-500 transition-all duration-300"
                required
              />
              <label
                htmlFor="searchName"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  searchName
                    ? '-top-3 left-4 text-xs bg-white px-2 text-green-600 font-semibold'
                    : 'top-4 text-gray-400'
                }`}
              >
                NAMA PELANGGAN
              </label>
            </div>
            <Button type="submit" className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-lg rounded-full shadow-lg transition-all duration-300 hover:shadow-green-500/40 hover:scale-105" disabled={loading}>
              {loading ? (<><Search className="h-5 w-5 mr-2 animate-spin" />Mencari...</>) : (<><Search className="h-5 w-5 mr-2" />Cek Tagihan</>)}
            </Button>
          </form>

          {hasSearched && (
            <div className="space-y-4">
              {groupedTagihans.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ada tagihan ditemukan untuk nama "{searchName}"</p>
                  <p className="text-gray-400 text-sm mt-2">Coba masukkan nama yang berbeda atau hubungi admin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Hasil Pencarian ({groupedTagihans.length} nama ditemukan)</h3>
                  {groupedTagihans.map((group, index) => {
                    const unpaidItems = group.items.filter(item => item.status === 'belum_lunas');
                    const invoiceGroup = { nama: group.nama, items: unpaidItems.map(item => ({ ...item, updated_at: item.created_at })), totalJumlah: group.totalBelumLunas };
                    const hasUnpaidBills = unpaidItems.length > 0;
                    return (
                      <Card key={index} className="border border-gray-200 bg-gray-50 rounded-2xl">
                        <CardContent className="p-4">
                          {hasUnpaidBills && (
                            <div className="flex justify-end mb-3">
                              <InvoiceDialog group={invoiceGroup} formatCurrency={formatCurrency}>
                                <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl">
                                  <FileText className="h-4 w-4 mr-1" />Cetak Invoice
                                </Button>
                              </InvoiceDialog>
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800 text-lg">{group.nama}</h4>
                                {group.totalBelumLunas > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                {group.totalBelumLunas === 0 && group.totalLunas > 0 && <CheckCircle className="h-5 w-5 text-green-500" />}
                              </div>
                              {computeDueDate(group.items) && (
                                <p className="text-xs text-gray-400">Jatuh tempo: {computeDueDate(group.items)!.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total Tagihan</p>
                              <p className="font-bold text-lg text-gray-800">{formatCurrency(group.totalJumlah)}</p>
                              {group.totalBelumLunas > 0 && <p className="text-sm text-red-500 font-medium">Belum Lunas: {formatCurrency(group.totalBelumLunas)}</p>}
                              {group.totalLunas > 0 && <p className="text-sm text-green-500 font-medium">Sudah Lunas: {formatCurrency(group.totalLunas)}</p>}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {group.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                                <div className="flex items-center gap-2">
                                  {item.status === 'lunas' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                                  <span className={item.status === 'lunas' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-800">{formatCurrency(item.jumlah)}</p>
                                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
