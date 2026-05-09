import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { CekTagihan } from '@/components/CekTagihan';
import { LogIn, UserPlus, Shield, Zap, Signal } from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { ResellerRegistration } from '@/components/ResellerRegistration';
import { motion } from 'framer-motion';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: "Username dan password harus diisi", variant: "destructive" });
      return;
    }
    setLoading(true);
    const email = `${username}@syakirdigital.local`;
    const { error } = await signIn(email, password, username);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const bgClasses = "min-h-screen bg-white relative overflow-hidden";
  const bgEffects = (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </>
  );

  if (showRegister) {
    return (
      <div className={`${bgClasses} flex items-center justify-center p-4`}>
        {bgEffects}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 w-full">
          <ResellerRegistration onBack={() => setShowRegister(false)} />
        </motion.div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className={`${bgClasses} flex items-center justify-center p-4`}>
        {bgEffects}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl relative z-10 overflow-hidden rounded-3xl">
            <CardHeader className="text-center pb-4 pt-8 px-8 relative z-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <LogIn className="h-10 w-10 text-white" />
                  </div>
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Selamat Datang
              </CardTitle>
              <p className="text-gray-500 mt-2 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
            </CardHeader>
            <CardContent className="relative z-10 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 text-sm font-medium">Username</Label>
                  <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20 h-12 rounded-xl transition-all duration-300" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" className="bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/20 h-12 rounded-xl transition-all duration-300" required />
                </div>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0 font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-[1.02]" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Memuat...</span></div>
                  ) : (
                    <div className="flex items-center gap-2"><LogIn className="h-5 w-5" /><span>Masuk</span></div>
                  )}
                </Button>
              </form>
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setShowLogin(false)} className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">← Kembali ke Cek Tagihan</Button>
              </div>
              {/* Social Login */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <p className="text-gray-500 text-sm">Atau masuk dengan</p>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border border-gray-200">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border border-gray-200">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border border-gray-200">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DA1F2">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${bgClasses} flex flex-col items-center justify-start p-4`}>
      {bgEffects}
      {/* Wave-shaped header */}
      <div className="w-full relative z-10">
        <svg className="w-full h-40 sm:h-32" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#065f46', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="url(#waveGradient)" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,176C672,160,768,160,864,176C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <div className="absolute top-6 sm:top-4 left-0 right-0 text-center z-20 px-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Syakir Digital</h1>
            <p className="text-white/90 text-xs sm:text-sm mb-1 sm:mb-2 drop-shadow-md">Solusi Kebutuhan Digital Anda</p>
            <p className="text-green-600 font-bold text-sm sm:text-lg tracking-wider drop-shadow-lg bg-white/90 rounded-full px-4 py-1 inline-block">AHLAN WA SAHLAN</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-6 relative z-10 -mt-8">
        {/* Tags */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-green-300">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Aman & Terpercaya</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-green-300">
            <Zap className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Cepat & Mudah</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-green-300">
            <Signal className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Professional</span>
          </div>
        </motion.div>

        {/* Cek Tagihan Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <CekTagihan />
        </motion.div>
        
        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => setShowLogin(true)} className="group relative h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 font-semibold text-lg rounded-full shadow-lg transition-all duration-300 hover:shadow-green-500/40 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <LogIn className="h-5 w-5 mr-3" />
            Login Aplikasi
          </Button>
          <Button onClick={() => setShowRegister(true)} className="group relative h-14 px-8 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 border-0 font-semibold text-lg rounded-full shadow-lg transition-all duration-300 hover:shadow-teal-500/40 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <UserPlus className="h-5 w-5 mr-3" />
            Daftar Jadi Reseller
          </Button>
        </motion.div>

        {/* Wave-shaped footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="w-full relative z-10 mt-8">
          <svg className="w-full h-24" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#065f46', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path fill="url(#waveGradientBottom)" fillOpacity="1" d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
