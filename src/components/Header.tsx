import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { motion } from 'framer-motion';

interface HeaderProps {
  onSignOut: () => void;
  showAdminMenu?: boolean;
  onAdminMenuClick?: () => void;
}

export const Header = ({ onSignOut, showAdminMenu, onAdminMenuClick }: HeaderProps) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white rounded-xl p-2 mb-3 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <AnimatedLogo size="sm" />
          </div>
          <div>
            <h1 className="text-sm font-orbitron font-bold text-green-600 leading-tight">
              Syakir Digital
            </h1>
            <p className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">
              Solusi Digital
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showAdminMenu && onAdminMenuClick && (
            <Button
              onClick={onAdminMenuClick}
              variant="ghost"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-150 hover:scale-105 p-1.5 h-8 w-8"
            >
              <Menu className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className="bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-150 hover:scale-105 p-1.5 h-8 w-8"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};
