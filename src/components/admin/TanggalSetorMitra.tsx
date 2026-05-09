import React, { useState, useEffect } from 'react';
import { Calendar, Save, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MitraProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  tanggal_setor: string | null;
}

export const TanggalSetorMitra = () => {
  const [mitraList, setMitraList] = useState<MitraProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMitraProfiles();

    const channel = supabase
      .channel('profiles_tanggal_setor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchMitraProfiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMitraProfiles = async () => {
    try {
      // Get all mitra user_ids
      const { data: roles, error: rolesErr } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'mitra');

      if (rolesErr || !roles?.length) {
        setMitraList([]);
        setLoading(false);
        return;
      }

      const mitraUserIds = roles.map(r => r.user_id);

      const { data: profiles, error: profErr } = await (supabase as any)
        .from('profiles')
        .select('id, user_id, full_name, username, tanggal_setor')
        .in('user_id', mitraUserIds);

      if (profErr) {
        console.error('Error fetching mitra profiles:', profErr);
      } else {
        setMitraList(profiles || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (profileId: string) => {
    if (!editDate) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ tanggal_setor: editDate })
        .eq('id', profileId);

      if (error) throw error;

      toast({ title: 'Berhasil', description: 'Tanggal setor berhasil diperbarui' });
      setEditingId(null);
      setEditDate('');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Gagal menyimpan tanggal setor', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (d: string | null) => {
    if (!d) return 'Belum diatur';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Tanggal Setor Mitra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mitraList.length === 0 ? (
            <p className="text-sm text-white/60">Belum ada mitra terdaftar.</p>
          ) : (
            mitraList.map((mitra) => (
              <div
                key={mitra.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-700/40 border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{mitra.full_name}</p>
                  <p className="text-xs text-white/50">@{mitra.username}</p>
                  <p className="text-xs text-white/70 mt-1">
                    Tanggal Setor: <span className="font-medium text-white">{formatDateDisplay(mitra.tanggal_setor)}</span>
                  </p>
                </div>

                {editingId === mitra.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-40 bg-slate-600/50 border-white/20 text-white text-xs h-8"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(mitra.id)}
                      disabled={saving}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditingId(null); setEditDate(''); }}
                      className="h-8 text-xs text-white/60"
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => { setEditingId(mitra.id); setEditDate(mitra.tanggal_setor || ''); }}
                    className="h-8 text-xs bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border border-emerald-500"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
