import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Trash2, 
  UserPlus, 
  Pencil, 
  Settings, 
  Users, 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  Crown,
  Star,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  role: string;
  can_edit_data: boolean;
  can_delete_data: boolean;
  can_lunas_data: boolean;
}

export const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'mitra'>('mitra');

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'mitra'>('mitra');
  const [editCanEditData, setEditCanEditData] = useState(true);
  const [editCanDeleteData, setEditCanDeleteData] = useState(true);
  const [editCanLunasData, setEditCanLunasData] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const combined = profilesData.map((profile) => ({
        ...profile,
        role: rolesData.find((r) => r.user_id === profile.user_id)?.role || 'unknown',
        can_edit_data: profile.can_edit_data ?? true,
        can_delete_data: profile.can_delete_data ?? true,
        can_lunas_data: profile.can_lunas_data ?? true,
      }));

      setUsers(combined);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          fullName,
          username,
          password,
          role,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'User creation failed');

      toast({
        title: '✅ Berhasil',
        description: 'User berhasil dibuat',
      });

      setFullName('');
      setUsername('');
      setPassword('');
      setRole('mitra');
      setIsFormOpen(false);

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'User deletion failed');

      toast({
        title: '✅ Berhasil',
        description: 'User berhasil dihapus',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditUsername(user.username);
    setEditPassword('');
    setEditRole(user.role as 'admin' | 'mitra');
    setEditCanEditData(user.can_edit_data);
    setEditCanDeleteData(user.can_delete_data);
    setEditCanLunasData(user.can_lunas_data);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'update',
          userId: editingUser.user_id,
          fullName: editFullName,
          username: editUsername,
          password: editPassword || undefined,
          role: editRole,
          canEditData: editCanEditData,
          canDeleteData: editCanDeleteData,
          canLunasData: editCanLunasData,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'User update failed');

      toast({
        title: '✅ Berhasil',
        description: 'User berhasil diupdate',
      });

      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin');
  const mitraUsers = users.filter(u => u.role === 'mitra');

  return (
    <Card className="bg-slate-900/95 border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Daftar User Aktif
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-2">
            {users.length} user
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New User - Collapsible */}
        <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20 text-white hover:bg-white/10 justify-between"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                ➕ Tambah User Baru
              </span>
              {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <form onSubmit={handleCreateUser} className="space-y-4 p-4 bg-slate-800 rounded-xl border border-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-200 flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Nama Lengkap
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-700 border-slate-500 text-white placeholder:text-slate-400"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-200 flex items-center gap-2">
                      <span className="text-cyan-400">@</span>
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-slate-700 border-slate-500 text-white placeholder:text-slate-400"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200 flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-700 border-slate-500 text-white placeholder:text-slate-400 pr-10"
                        placeholder="Masukkan password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-200 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Role
                    </Label>
                    <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'mitra')}>
                      <SelectTrigger className="bg-slate-700 border-slate-500 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="admin" className="text-white hover:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            Admin
                          </span>
                        </SelectItem>
                        <SelectItem value="mitra" className="text-white hover:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-blue-400" />
                            Mitra
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Membuat...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Buat User
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* Admin Users Section */}
        {adminUsers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium px-1">
              <Crown className="w-4 h-4 text-yellow-400" />
              Admin ({adminUsers.length})
            </div>
            <AnimatePresence>
              {adminUsers.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 rounded-xl p-3 border border-yellow-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{u.full_name}</p>
                        <p className="text-yellow-300/70 text-sm">@{u.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(u)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>🗑️ Hapus User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin menghapus <strong>{u.full_name}</strong>? Semua data user ini akan terhapus dan tidak dapat dikembalikan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(u.user_id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Mitra Users Section */}
        {mitraUsers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300 text-sm font-medium px-1">
              <Star className="w-4 h-4 text-blue-400" />
              Mitra ({mitraUsers.length})
            </div>
            <AnimatePresence>
              {mitraUsers.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800 rounded-xl p-3 border border-slate-600 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{u.full_name}</p>
                        <p className="text-cyan-400/70 text-sm">@{u.username}</p>
                        {/* Permission badges */}
                        <div className="flex gap-1 mt-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${u.can_edit_data ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <Pencil className="w-2.5 h-2.5" />
                            Edit
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${u.can_delete_data ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <Trash2 className="w-2.5 h-2.5" />
                            Hapus
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${u.can_lunas_data ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            ✓ Lunas
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(u)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>🗑️ Hapus User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Yakin ingin menghapus <strong>{u.full_name}</strong>? Semua data user ini akan terhapus dan tidak dapat dikembalikan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(u.user_id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">Belum ada user terdaftar</p>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-500" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update informasi user. Kosongkan password jika tidak ingin mengubahnya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFullName">Nama Lengkap</Label>
                <Input
                  id="editFullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editUsername">Username</Label>
                <Input
                  id="editUsername"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="editPassword"
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ubah"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as 'admin' | 'mitra')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Admin
                      </span>
                    </SelectItem>
                    <SelectItem value="mitra">
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-400" />
                        Mitra
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permission toggles - only show for mitra users */}
            {editRole === 'mitra' && (
              <div className="space-y-3 p-4 border rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Settings className="h-4 w-4 text-purple-500" />
                  ⚙️ Pengaturan Hak Akses
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border">
                    <Pencil className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">Edit Data</span>
                    <Switch
                      id="canEditData"
                      checked={editCanEditData}
                      onCheckedChange={setEditCanEditData}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-xs">Hapus Data</span>
                    <Switch
                      id="canDeleteData"
                      checked={editCanDeleteData}
                      onCheckedChange={setEditCanDeleteData}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border">
                    <span className="text-green-500">✓</span>
                    <span className="text-xs">Lunas Data</span>
                    <Switch
                      id="canLunasData"
                      checked={editCanLunasData}
                      onCheckedChange={setEditCanLunasData}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
