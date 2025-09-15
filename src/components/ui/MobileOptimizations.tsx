import React from 'react';
import { cn } from '../../lib/utils';

// Composant pour améliorer les interactions tactiles
interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function TouchOptimizedButton({ 
  children, 
  onClick, 
  className, 
  variant = 'primary',
  size = 'md' 
}: TouchOptimizedButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-95 touch-manipulation';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
    ghost: 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
  };

  // Tailles optimisées pour mobile (minimum 44px)
  const sizes = {
    sm: 'px-4 py-3 text-sm min-h-[44px]',
    md: 'px-6 py-4 text-base min-h-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px]'
  };

  return (
    <button
      onClick={onClick}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}

// Composant pour cartes optimisées mobile
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
}

export function MobileCard({ children, className, onTap }: MobileCardProps) {
  const baseClasses = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200';
  const interactiveClasses = onTap ? 'active:scale-[0.98] cursor-pointer touch-manipulation' : '';
  
  return (
    <div
      onClick={onTap}
      className={cn(baseClasses, interactiveClasses, className)}
    >
      {children}
    </div>
  );
}

// Composant pour input optimisé mobile
interface MobileInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function MobileInput({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className 
}: MobileInputProps) {
  const baseClasses = 'w-full px-4 py-4 text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[48px] touch-manipulation';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(baseClasses, className)}
    />
  );
}

// Hook pour détecter les appareils tactiles
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  return isTouchDevice;
}

// Composant pour navigation mobile améliorée
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileNav({ isOpen, onClose, children }: MobileNavProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour bottom sheet mobile
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-xl shadow-xl transform transition-transform duration-300 ease-out max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
