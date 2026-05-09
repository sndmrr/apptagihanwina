
import { InvoiceDialog } from './invoice/InvoiceDialog';
import { InvoiceProps } from './invoice/types';
import { Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const Invoice = (props: InvoiceProps) => {
  return (
    <InvoiceDialog {...props}>
      <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50 px-2">
        <Printer className="h-3 w-3" />
      </Button>
    </InvoiceDialog>
  );
};

export type { InvoiceProps, GroupedTagihan, Tagihan } from './invoice/types';
