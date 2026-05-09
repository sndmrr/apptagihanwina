import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ModernNotificationContextType {
  showLoading: () => void;
  showSuccess: (message?: string) => void;
  hideNotification: () => void;
}

const ModernNotificationContext = createContext<ModernNotificationContextType | null>(null);

export const useModernNotification = () => {
  const context = useContext(ModernNotificationContext);
  if (!context) {
    throw new Error('useModernNotification must be used within ModernNotificationProvider');
  }
  return context;
};

export const ModernNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Data berhasil disimpan');

  const showLoading = useCallback(() => {
    setMessage('Data berhasil disimpan');
    setIsLoading(true);
    setIsVisible(true);
  }, []);

  const showSuccess = useCallback((customMessage?: string) => {
    setMessage(customMessage || 'Data berhasil disimpan');
    setIsLoading(false);
    setIsVisible(true);
    
    // Auto close after 2.5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 2500);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    setIsLoading(false);
  }, []);

  return (
    <ModernNotificationContext.Provider value={{ showLoading, showSuccess, hideNotification }}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1] as const 
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={hideNotification}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0, 0.2, 1] as const 
              }}
              className="relative z-10 mx-4 max-w-sm w-full"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 mx-auto max-w-xs sm:max-w-sm">
                {isLoading ? (
                  /* Loading State */
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <Loader2 className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-gray-700 font-medium text-sm">Menyimpan data...</p>
                      <p className="text-gray-500 text-xs mt-1">Mohon tunggu sebentar</p>
                    </div>
                  </div>
                ) : (
                  /* Success State */
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.1,
                        ease: [0.68, -0.55, 0.265, 1.55] as const
                      }}
                      className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-gray-800 font-semibold text-base">{message}</p>
                      <p className="text-gray-500 text-xs mt-1">Perubahan telah tersimpan</p>
                    </div>
                    
                    {/* Close Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.2 }}
                      onClick={hideNotification}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm"
                    >
                      Tutup
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModernNotificationContext.Provider>
  );
};
