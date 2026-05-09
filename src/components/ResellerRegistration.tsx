import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, UserPlus, CheckCircle, ArrowLeft, Star, Clock, Loader2, Signal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResellerRegistrationProps {
  onBack: () => void;
}

export const ResellerRegistration = ({ onBack }: ResellerRegistrationProps) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password.trim()) { toast({ title: "Error", description: "Semua field harus diisi!", variant: "destructive" }); return; }
    if (password !== confirmPassword) { toast({ title: "Error", description: "Password dan konfirmasi password tidak sama!", variant: "destructive" }); return; }
    if (password.length < 6) { toast({ title: "Error", description: "Password minimal 6 karakter!", variant: "destructive" }); return; }
    if (!agreedToTerms) { toast({ title: "Error", description: "Anda harus menyetujui syarat dan ketentuan!", variant: "destructive" }); return; }
    setIsLoading(true);
    try {
      const { data: existingReg } = await supabase.from('pending_registrations').select('id').eq('username', username.toLowerCase()).maybeSingle();
      if (existingReg) { toast({ title: "Error", description: "Username sudah terdaftar atau sedang menunggu konfirmasi!", variant: "destructive" }); setIsLoading(false); return; }
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('username', username.toLowerCase()).maybeSingle();
      if (existingProfile) { toast({ title: "Error", description: "Username sudah digunakan!", variant: "destructive" }); setIsLoading(false); return; }
      const { error } = await supabase.from('pending_registrations').insert({ full_name: fullName.trim(), username: username.toLowerCase().trim(), password_hash: password, status: 'pending' });
      if (error) throw error;
      setShowSuccess(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal mendaftar. Silakan coba lagi.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  if (showSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md mx-auto shadow-2xl border-0 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-teal-400/20 to-green-500/20 rounded-full blur-2xl" />
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🎉 Pendaftaran Berhasil!</h2>
            <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-700 text-sm">Pendaftaran Anda sedang menunggu konfirmasi dari Admin.</p>
              <p className="text-gray-500 text-xs mt-2">Anda akan dapat login setelah pendaftaran disetujui.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
              <Signal className="w-4 h-4" />
              <span>Terima kasih telah bergabung!</span>
              <Star className="w-4 h-4" />
            </div>
            <Button onClick={onBack} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Halaman Utama
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md mx-auto shadow-2xl border-0 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-teal-400/20 to-green-500/20 rounded-full blur-2xl" />
      <div className="relative z-10">
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">✨ Daftar Jadi Reseller</h2>
          <p className="text-gray-500 text-sm">Bergabung bersama Syakir Digital</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center gap-2"><User className="w-4 h-4" />Nama Lengkap</label>
            <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Masukkan nama lengkap" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center gap-2"><User className="w-4 h-4" />Username</label>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center gap-2"><Lock className="w-4 h-4" />Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-medium flex items-center gap-2"><Lock className="w-4 h-4" />Konfirmasi Password</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 rounded-xl" />
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} className="mt-1 border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
              <label htmlFor="terms" className="text-gray-700 text-sm leading-relaxed cursor-pointer">
                Saya <span className="text-green-600 font-semibold">bersedia</span> dan <span className="text-green-600 font-semibold">memahami</span> ketentuan yang telah ditetapkan oleh Syakir Digital 📋
              </label>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50">
            {isLoading ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Mendaftar...</span>) : (<span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />🚀 Daftar Sekarang</span>)}
          </Button>
          <Button type="button" onClick={onBack} variant="ghost" className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />Kembali
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
