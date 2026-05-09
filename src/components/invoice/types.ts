
export interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: 'belum_lunas' | 'lunas';
  created_at: string;
  updated_at: string;
}

export interface GroupedTagihan {
  nama: string;
  items: Tagihan[];
  totalJumlah: number;
}

export interface InvoiceProps {
  group: GroupedTagihan;
  formatCurrency: (amount: number) => string;
  onAddTagihan?: (nama: string, jumlah: number) => void;
}
