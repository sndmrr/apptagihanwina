import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfile {
  user_id: string;
  full_name: string;
}

interface RekapData {
  jumlahTagihan: number;
  totalRupiah: number;
  komisi: number;
  setor: number;
  bonus: number;
}

export const RekapLaporan = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [rekapData, setRekapData] = useState<RekapData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchRekapData();
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchRekapData = async () => {
    try {
      let query = supabase
        .from('tagihan')
        .select('jumlah, status')
        .is('deleted_at', null);

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      const { data, error } = await query;

      if (error) throw error;

      const jumlahTagihan = data?.length || 0;
      const totalRupiah = data?.reduce((sum, t) => sum + Number(t.jumlah), 0) || 0;
      const komisi = jumlahTagihan * 1000;
      const bonus = jumlahTagihan > 30 ? 5000 : 0;
      const setor = totalRupiah - komisi - bonus;

      setRekapData({
        jumlahTagihan,
        totalRupiah,
        komisi,
        setor,
        bonus,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Filter User</Label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua User</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.user_id} value={u.user_id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rekapData && (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Jumlah Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{rekapData.jumlahTagihan} tagihan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Rupiah</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {rekapData.totalRupiah.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Komisi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {rekapData.komisi.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bonus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {rekapData.bonus.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {rekapData.setor.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
