import { useToast } from "@/hooks/use-toast";

interface UseTagihanOperationsProps {
  addTagihan: (nama: string, jumlah: number) => Promise<{ error: any }>;
  markAsLunas: (id: string) => Promise<{ error: any }>;
  deleteTagihan: (id: string) => Promise<{ error: any }>;
  restoreTagihan: (id: string) => Promise<{ error: any }>;
  permanentDeleteTagihan: (id: string) => Promise<{ error: any }>;
  updateSaldoAwal: (amount: number) => Promise<{ error: any }>;
  updateTagihan: (id: string, nama: string, jumlah: number, status?: string) => Promise<{ error: any }>;
  deleteAllLunas: () => Promise<{ error: any }>;
}

export const useTagihanOperations = ({
  addTagihan,
  markAsLunas,
  deleteTagihan,
  restoreTagihan,
  permanentDeleteTagihan,
  updateSaldoAwal,
  updateTagihan,
  deleteAllLunas
}: UseTagihanOperationsProps) => {
  const { toast } = useToast();

  const handleAddTagihan = async (nama: string, jumlah: number) => {
    if (!nama.trim() || !jumlah) {
      toast({
        title: "Error",
        description: "Nama dan jumlah tagihan harus diisi",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(jumlah) || jumlah <= 0) {
      toast({
        title: "Error",
        description: "Jumlah tagihan harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addTagihan(nama, jumlah);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil ditambahkan"
      });
    }
  };

  const handleMarkAsLunas = async (id: string, nama: string) => {
    const { error } = await markAsLunas(id);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: `Tagihan ${nama} telah dilunasi`
      });
    }
  };

  const handleDeleteTagihan = async (id: string) => {
    const { error } = await deleteTagihan(id);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil dihapus dan dipindahkan ke menu hapus"
      });
    }
  };

  const handleRestoreTagihan = async (id: string) => {
    const { error } = await restoreTagihan(id);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil dikembalikan"
      });
    }
  };

  const handlePermanentDeleteTagihan = async (id: string) => {
    const { error } = await permanentDeleteTagihan(id);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil dihapus permanen"
      });
    }
  };

  const handleUpdateSaldoAwal = async (newAmount: number) => {
    if (isNaN(newAmount)) {
      toast({
        title: "Error",
        description: "Saldo awal harus berupa angka",
        variant: "destructive"
      });
      return;
    }

    const { error } = await updateSaldoAwal(newAmount);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Saldo awal berhasil diperbarui"
      });
    }
  };

  const handleUpdateTagihan = async (id: string, newNama: string, newJumlah: number, newStatus?: string) => {
    if (!newNama.trim() || !newJumlah) {
      toast({
        title: "Error",
        description: "Nama dan jumlah tagihan harus diisi",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(newJumlah) || newJumlah <= 0) {
      toast({
        title: "Error",
        description: "Jumlah tagihan harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }

    const { error } = await updateTagihan(id, newNama, newJumlah, newStatus);
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Tagihan berhasil diperbarui"
      });
    }
  };

  const handleDeleteAllLunas = async () => {
    const { error } = await deleteAllLunas();
    if (error && error.message) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Semua tagihan lunas berhasil dihapus"
      });
    }
  };

  return {
    handleAddTagihan,
    handleMarkAsLunas,
    handleDeleteTagihan,
    handleRestoreTagihan,
    handlePermanentDeleteTagihan,
    handleUpdateSaldoAwal,
    handleUpdateTagihan,
    handleDeleteAllLunas
  };
};
