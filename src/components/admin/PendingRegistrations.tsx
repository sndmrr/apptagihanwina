import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Check, 
  X, 
  Loader2, 
  Clock, 
  User, 
  RefreshCw, 
  Inbox,
  Bell,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingRegistration {
  id: string;
  full_name: string;
  username: string;
  password_hash: string;
  status: string;
  created_at: string;
}

export const PendingRegistrations = () => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pendaftaran",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pending_registrations_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pending_registrations' 
      }, () => {
        fetchRegistrations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (registration: PendingRegistration) => {
    setProcessingId(registration.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Tidak ada sesi aktif');
      }

      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email: `${registration.username}@syakirdigital.local`,
          password: registration.password_hash,
          username: registration.username,
          fullName: registration.full_name,
          role: 'mitra'
        }
      });

      if (response.error) throw response.error;

      // Update registration status to approved
      const { error: updateError } = await supabase
        .from('pending_registrations')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', registration.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Berhasil!",
        description: `${registration.full_name} telah disetujui sebagai Mitra`,
      });

      fetchRegistrations();
    } catch (error: any) {
      console.error('Error approving registration:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyetujui pendaftaran",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (registration: PendingRegistration) => {
    setProcessingId(registration.id);
    try {
      const { error } = await supabase
        .from('pending_registrations')
        .delete()
        .eq('id', registration.id);

      if (error) throw error;

      toast({
        title: "❌ Ditolak",
        description: `Pendaftaran ${registration.full_name} telah ditolak dan dihapus`,
      });

      fetchRegistrations();
    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      toast({
        title: "Error",
        description: "Gagal menolak pendaftaran",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  return (
    <Card className="bg-slate-900/95 border-slate-700 shadow-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <div className="relative">
              <UserPlus className="w-5 h-5 text-purple-400" />
              {registrations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <span>🎯 Pendaftaran Reseller</span>
            {registrations.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
              >
                <Bell className="w-3 h-3" />
                {registrations.length} baru
              </motion.span>
            )}
          </CardTitle>
          <Button
            onClick={fetchRegistrations}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-slate-400 text-sm">Memuat data...</p>
          </div>
        ) : registrations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">Tidak ada pendaftaran baru</p>
            <p className="text-slate-500 text-xs mt-1">Pendaftaran akan muncul di sini</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {registrations.map((reg, index) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 rounded-xl p-4 border border-purple-600/50 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold truncate">{reg.full_name}</span>
                          <span className="bg-purple-600 text-purple-100 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Baru
                          </span>
                        </div>
                        <p className="text-cyan-300 text-sm mt-0.5">
                          @{reg.username}
                        </p>
                        <div className="flex items-center gap-3 text-slate-400 text-xs mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(reg.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(reg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleApprove(reg)}
                        disabled={processingId === reg.id}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all hover:scale-105"
                      >
                        {processingId === reg.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Terima
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(reg)}
                        disabled={processingId === reg.id}
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all hover:scale-105"
                      >
                        {processingId === reg.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Tolak
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
