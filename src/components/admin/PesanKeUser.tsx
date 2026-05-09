import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  user_id: string;
  full_name: string;
  username: string;
}

interface Notifikasi {
  id: string;
  title: string;
  message: string;
  target_type: string;
  target_user_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export const PesanKeUser = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<string>('all');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchNotifikasi();
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name, username');
    if (data) {
      setProfiles(data.filter(p => p.user_id !== user?.id));
    }
  };

  const fetchNotifikasi = async () => {
    // Auto-delete read notifications older than 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    await supabase
      .from('notifikasi_user')
      .delete()
      .eq('is_read', true)
      .not('read_at', 'is', null)
      .lt('read_at', twentyFourHoursAgo.toISOString());

    const { data } = await supabase
      .from('notifikasi_user')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setNotifikasi(data as Notifikasi[]);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Error', description: 'Judul dan pesan wajib diisi', variant: 'destructive' });
      return;
    }
    if (targetType === 'specific' && !targetUserId) {
      toast({ title: 'Error', description: 'Pilih user tujuan', variant: 'destructive' });
      return;
    }

    setSending(true);
    const { error } = await supabase.from('notifikasi_user').insert({
      title: title.trim(),
      message: message.trim(),
      target_type: targetType,
      target_user_id: targetType === 'specific' ? targetUserId : null,
    });

    if (error) {
      toast({ title: 'Gagal', description: 'Gagal mengirim pesan', variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Pesan berhasil dikirim' });
      setTitle('');
      setMessage('');
      setTargetType('all');
      setTargetUserId('');
      fetchNotifikasi();
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label className="text-white/80">Judul</Label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Judul pesan"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div>
          <Label className="text-white/80">Pesan</Label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Isi pesan..."
            className="bg-white/5 border-white/10 text-white min-h-[100px]"
          />
        </div>
        <div>
          <Label className="text-white/80">Kirim ke</Label>
          <Select value={targetType} onValueChange={v => { setTargetType(v); setTargetUserId(''); }}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 z-[99999]">
              <SelectItem value="all" className="text-white focus:bg-white/10">Semua User</SelectItem>
              <SelectItem value="specific" className="text-white focus:bg-white/10">User Tertentu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {targetType === 'specific' && (
          <div>
            <Label className="text-white/80">Pilih User</Label>
            <Select value={targetUserId} onValueChange={setTargetUserId}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Pilih user..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 z-[99999]">
                {profiles.map(p => (
                  <SelectItem key={p.user_id} value={p.user_id} className="text-white focus:bg-white/10">
                    {p.full_name} ({p.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? 'Mengirim...' : 'Kirim Pesan'}
        </Button>
      </div>

      {/* Sent messages list */}
      {notifikasi.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white/80 text-sm font-medium">Riwayat Pesan</h3>
          {notifikasi.map(n => {
            const targetName = n.target_type === 'all'
              ? 'Semua User'
              : profiles.find(p => p.user_id === n.target_user_id)?.full_name || 'User';
            return (
              <div key={n.id} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">{n.title}</span>
                  {n.is_read ? (
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Terbaca
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Belum Dibaca
                    </Badge>
                  )}
                </div>
                <p className="text-white/60 text-xs">{n.message}</p>
                <div className="flex justify-between text-white/40 text-xs">
                  <span>Ke: {targetName}</span>
                  <span>{new Date(n.created_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
