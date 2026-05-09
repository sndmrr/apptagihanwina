import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share, Download, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import html2canvas from 'html2canvas';
import { InvoiceProps } from './types';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePrintable } from './InvoicePrintable';

// Type declaration for Kodular Android interface
declare global {
  interface Window {
    Android?: {
      shareToWhatsApp: (message: string, base64Image: string) => void;
    };
    AppInventor?: {
      setWebViewString: (url: string) => void;
    };
  }
}

interface AdditionalTagihan {
  id: string;
  nama: string;
  jumlah: number;
}

export const InvoiceDialog = ({
  group,
  formatCurrency,
  children
}: InvoiceProps & { children: React.ReactNode }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [editableKeterangan, setEditableKeterangan] = useState<{
    [key: string]: string;
  }>({});
  const [trustScore, setTrustScore] = useState<number>(85);
  const [additionalTagihan, setAdditionalTagihan] = useState<AdditionalTagihan[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Add JavaScript function for Kodular WebView
    const script = document.createElement('script');
    script.innerHTML = `
      function openWhatsAppFromApp(whatsappUrl) {
        if (typeof window.AppInventor !== 'undefined' && typeof window.AppInventor.setWebViewString !== 'undefined') {
          window.AppInventor.setWebViewString(whatsappUrl);
          return false;
        } else {
          window.location.href = whatsappUrl;
          return true;
        }
      }
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Detect if running in webview
  const isWebview = () => {
    return window.navigator.userAgent.includes('wv') || 
           window.navigator.userAgent.includes('WebView') ||
           !window.navigator.share;
  };

  const generateInvoiceImage = async (): Promise<Blob | null> => {
    if (invoiceRef.current) {
      try {
        // Wait for any pending renders
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(invoiceRef.current, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          logging: false,
          removeContainer: false,
          imageTimeout: 0,
          onclone: (clonedDoc) => {
            // Ensure all styles are applied to cloned document
            const clonedElement = clonedDoc.querySelector('[data-html2canvas-clone]') as HTMLElement;
            if (clonedElement) {
              clonedElement.style.transform = 'none';
              clonedElement.style.position = 'relative';
            }
          }
        });
        
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/png', 1.0);
        });
      } catch (error) {
        console.error('Error generating image:', error);
        return null;
      }
    }
    return null;
  };

  const handleAddAdditionalTagihan = (nama: string, jumlah: number) => {
    const newTagihan: AdditionalTagihan = {
      id: `temp-${Date.now()}`,
      nama,
      jumlah
    };
    setAdditionalTagihan(prev => [...prev, newTagihan]);
    setShowAddForm(false);
  };

  const handleRemoveAdditionalTagihan = (id: string) => {
    setAdditionalTagihan(prev => prev.filter(item => item.id !== id));
  };

  const getTotalWithAdditional = () => {
    const additionalTotal = additionalTagihan.reduce((sum, item) => sum + item.jumlah, 0);
    return group.totalJumlah + additionalTotal;
  };

  const handleShareInvoice = async () => {
    const blob = await generateInvoiceImage();
    if (!blob) return;

    const fileName = `invoice-${group.nama.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.jpg`;
    const message = `Invoice untuk ${group.nama} - Total: ${formatCurrency(group.totalJumlah)}`;
    
    // For webview, try Kodular AppInventor interface first
    if (isWebview()) {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      // Try Kodular AppInventor interface
      if (window.AppInventor && window.AppInventor.setWebViewString) {
        window.AppInventor.setWebViewString(whatsappUrl);
        return;
      }
      
      // Try Android interface
      if (window.Android && window.Android.shareToWhatsApp) {
        const reader = new FileReader();
        reader.onload = function() {
          const base64 = reader.result as string;
          window.Android!.shareToWhatsApp(message, base64);
        };
        reader.readAsDataURL(blob);
        return;
      }
      
      // Fallback: create a data URL for download
      const reader = new FileReader();
      reader.onload = function() {
        const base64 = reader.result as string;
        const link = document.createElement('a');
        link.href = base64;
        link.download = fileName;
        link.click();
        
        // Show alert with WhatsApp message to copy
        alert(`Silakan copy pesan ini ke WhatsApp:\n\n${message}`);
      };
      reader.readAsDataURL(blob);
      return;
    }

    // For regular browsers, try Web Share API first
    const file = new File([blob], fileName, {
      type: 'image/jpeg'
    });

    if (navigator.share && navigator.canShare && navigator.canShare({
      files: [file]
    })) {
      try {
        await navigator.share({
          title: `Invoice ${group.nama}`,
          text: message,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleDownloadFallback(blob, fileName);
      }
    } else {
      handleDownloadFallback(blob, fileName);
    }
  };

  const handleDownloadFallback = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = async () => {
    const blob = await generateInvoiceImage();
    if (!blob) return;

    const fileName = `invoice-${group.nama.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.jpg`;
    
    // For webview, use data URL approach
    if (isWebview()) {
      const reader = new FileReader();
      reader.onload = function() {
        const link = document.createElement('a');
        link.href = reader.result as string;
        link.download = fileName;
        link.click();
      };
      reader.readAsDataURL(blob);
    } else {
      // Regular browser approach
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleKeteranganChange = (itemId: string, value: string) => {
    setEditableKeterangan(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6 rounded-xl">
        <DialogHeader className="px-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            Invoice - {group.nama}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 px-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Skor Kepercayaan (0-100)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={trustScore}
              onChange={(e) => setTrustScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
              className="mt-1"
              placeholder="Masukkan skor kepercayaan"
            />
          </div>

          <InvoiceForm 
            editableKeterangan={editableKeterangan} 
            handleKeteranganChange={handleKeteranganChange} 
            group={group} 
            formatCurrency={formatCurrency} 
          />

          <div className="flex gap-2 justify-end mb-4">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tagihan Lain
            </Button>
            <Button 
              onClick={handleShareInvoice} 
              className="bg-green-600 hover:bg-green-700 text-sm"
            >
              <Share className="h-4 w-4 mr-1" />
              Bagikan
            </Button>
            <Button 
              onClick={handleDownloadInvoice} 
              variant="outline" 
              className="text-sm bg-blue-800 hover:bg-blue-700 text-zinc-100"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>

          <InvoicePrintable 
            ref={invoiceRef} 
            group={group} 
            formatCurrency={formatCurrency} 
            editableKeterangan={editableKeterangan}
            trustScore={trustScore}
            additionalTagihan={additionalTagihan}
            onAddAdditionalTagihan={showAddForm ? handleAddAdditionalTagihan : undefined}
            onRemoveAdditionalTagihan={handleRemoveAdditionalTagihan}
            onCancelAdd={() => setShowAddForm(false)}
            showAddForm={showAddForm}
            totalWithAdditional={getTotalWithAdditional()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
