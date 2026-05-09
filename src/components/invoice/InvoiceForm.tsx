
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GroupedTagihan } from './types';

interface InvoiceFormProps {
  editableKeterangan: { [key: string]: string };
  handleKeteranganChange: (itemId: string, value: string) => void;
  group: GroupedTagihan;
  formatCurrency: (amount: number) => string;
}

export const InvoiceForm = ({
  editableKeterangan,
  handleKeteranganChange,
  group,
  formatCurrency
}: InvoiceFormProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm">Keterangan per Item</Label>
        {group.items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-medium text-gray-600 sm:min-w-0 sm:flex-1">
              {formatCurrency(item.jumlah)} - {formatDateTime(item.created_at)}
            </span>
            <Textarea
              value={editableKeterangan[item.id] || ''}
              onChange={(e) => handleKeteranganChange(item.id, e.target.value)}
              placeholder="Keterangan..."
              className="flex-1 min-h-[50px] text-sm"
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
