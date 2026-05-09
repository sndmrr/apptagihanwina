import { useState } from 'react';
import { Menu, Users, FileText, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserManagement } from './UserManagement';
import { RekapLaporan } from './RekapLaporan';
import { HapusData } from './HapusData';
import { TanggalSetorMitra } from './TanggalSetorMitra';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

type MenuSection = 'management-user' | 'rekap-laporan' | 'hapus-data' | 'tanggal-setor' | null;

export const AdminMenu = () => {
  const [activeSection, setActiveSection] = useState<MenuSection>(null);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { profile, role, loading } = useUserRole();
  const isAdmin = role === 'admin';

  const renderContent = () => {
    switch (activeSection) {
      case 'tanggal-setor':
        return <TanggalSetorMitra />;
      case 'management-user':
        return <UserManagement />;
      case 'rekap-laporan':
        return <RekapLaporan />;
      case 'hapus-data':
        return <HapusData />;
      default:
        return (
          <div className="space-y-4">
            {isAdmin && (
              <Button
                onClick={() => setActiveSection('tanggal-setor')}
                className="w-full justify-start gap-2"
                variant="outline"
              >
                <Calendar className="h-4 w-4" />
                Tanggal Setor Mitra
              </Button>
            )}
            <Button
              onClick={() => setActiveSection('management-user')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Users className="h-4 w-4" />
              Management User
            </Button>
            <Button
              onClick={() => setActiveSection('rekap-laporan')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <FileText className="h-4 w-4" />
              Rekap Laporan
            </Button>
            <Button
              onClick={() => setActiveSection('hapus-data')}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Data
            </Button>
          </div>
        );
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'tanggal-setor': return 'Tanggal Setor Mitra';
      case 'management-user': return 'Management User';
      case 'rekap-laporan': return 'Rekap Laporan';
      case 'hapus-data': return 'Hapus Data';
      default: return 'Menu Admin';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {activeSection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(null)}
                className="text-white/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            )}
            <SheetTitle>{getSectionTitle()}</SheetTitle>
          </div>
        </SheetHeader>
        <div className="mt-6">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  );
};
