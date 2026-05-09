import React from 'react';
import { FilePlus2, Wallet, UserPlus2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onTambahTagihan: () => void;
  onBayarLangsung: () => void;
  onTambahUser: () => void;
  showTambahUser?: boolean;
  role?: 'admin' | 'mitra' | 'staff';
}

export const BottomNav = ({
  onTambahTagihan,
  onBayarLangsung,
  onTambahUser,
  showTambahUser = true,
  role = 'admin',
}: BottomNavProps) => {
  const isMitraOrStaff = role === 'mitra' || role === 'staff';

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-[9999] pointer-events-none bg-gradient-to-t from-green-900 via-green-800 to-transparent"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Bottom navigation"
    >
      <div className={`mx-auto max-w-md px-2 pb-2 ${isMitraOrStaff ? 'pt-2' : 'pt-6'} pointer-events-none`}>
        <div className="relative pointer-events-auto">
          {isMitraOrStaff ? (
            /* Layout for mitra/staff: 2 buttons without floating center */
            <div className="bg-gradient-to-t from-green-700 via-green-600 to-green-500 rounded-t-xl shadow-[0_-2px_8px_rgba(0,0,0,0.2)] border-t border-green-400 h-14 flex items-center justify-between px-3">
              <button
                onClick={onTambahTagihan}
                className="flex flex-col items-center justify-center gap-0.5 text-white active:bg-green-400 transition-colors flex-1"
              >
                <FilePlus2 className="h-4.5 w-4.5" strokeWidth={2} />
                <span className="text-[9px] font-semibold leading-tight">Tambah Tagihan</span>
              </button>

              <button
                onClick={onBayarLangsung}
                className="flex flex-col items-center justify-center gap-0.5 text-white active:bg-green-400 transition-colors flex-1"
              >
                <Wallet className="h-4.5 w-4.5" strokeWidth={2} />
                <span className="text-[9px] font-semibold leading-tight">Bayar Langsung</span>
              </button>
            </div>
          ) : (
            /* Layout for admin: floating center button */
            <>
              {/* Floating center button */}
              <button
                onClick={onBayarLangsung}
                aria-label="Bayar Langsung"
                className="absolute left-1/2 -translate-x-1/2 -top-6 z-10 h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[0_4px_12px_-2px_rgba(34,197,94,0.6)] ring-4 ring-green-300 flex items-center justify-center active:bg-green-600 transition-colors"
              >
                <Wallet className="h-5 w-5" strokeWidth={2} />
              </button>

              {/* Bar with rounded top */}
              <div className="bg-gradient-to-t from-green-700 via-green-600 to-green-500 rounded-t-xl shadow-[0_-2px_8px_rgba(0,0,0,0.2)] border-t border-green-400 h-14 flex items-center justify-between px-3">
                <button
                  onClick={onTambahTagihan}
                  className="flex flex-col items-center justify-center gap-0.5 text-white active:bg-green-400 transition-colors flex-1"
                >
                  <FilePlus2 className="h-4.5 w-4.5" strokeWidth={2} />
                  <span className="text-[9px] font-semibold leading-tight">Tambah Tagihan</span>
                </button>

                {/* spacer for floating button - centered */}
                <div className="w-12 flex justify-center" aria-hidden="true" />

                {showTambahUser ? (
                  <button
                    onClick={onTambahUser}
                    className="flex flex-col items-center justify-center gap-0.5 text-white active:bg-green-400 transition-colors flex-1"
                  >
                    <UserPlus2 className="h-4.5 w-4.5" strokeWidth={2} />
                    <span className="text-[9px] font-semibold leading-tight text-center">Tambah User</span>
                  </button>
                ) : (
                  <div className="flex-1" aria-hidden="true" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
