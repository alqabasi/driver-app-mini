import React from 'react';
import { Button } from './Button';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  showCancel?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'نعم، تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  showCancel = true
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger': return <AlertTriangle size={32} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={32} className="text-amber-600" />;
      case 'success': return <CheckCircle2 size={32} className="text-emerald-600" />;
      case 'info': return <Info size={32} className="text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (variant) {
      case 'danger': return 'bg-red-50';
      case 'warning': return 'bg-amber-50';
      case 'success': return 'bg-emerald-50';
      case 'info': return 'bg-blue-50';
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger': return 'danger';
      case 'warning': return 'primary'; // Warning usually implies proceed with caution
      case 'success': return 'success';
      case 'info': return 'primary';
    }
  };
  
  const titleId = "confirm-modal-title";
  const descId = "confirm-modal-desc";

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
      style={{ zIndex: 100 }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>
      
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative z-10">
        <div className={`w-20 h-20 rounded-full ${getBgColor()} flex items-center justify-center mx-auto mb-6 ring-8 ring-white shadow-sm`} aria-hidden="true">
          {getIcon()}
        </div>
        
        <h3 id={titleId} className="text-2xl font-black text-center text-slate-900 mb-3 tracking-tight">{title}</h3>
        <p id={descId} className="text-center text-slate-500 font-medium mb-8 leading-relaxed px-2">
          {message}
        </p>

        <div className={`flex gap-3 ${!showCancel ? 'justify-center' : ''}`}>
          {showCancel && (
            <Button 
              onClick={onClose} 
              variant="secondary" 
              fullWidth 
              className="rounded-xl border-slate-200 py-4"
            >
              {cancelText}
            </Button>
          )}
          <Button 
            onClick={() => { onConfirm(); onClose(); }} 
            variant={getConfirmVariant()} 
            fullWidth={showCancel}
            className={`rounded-xl py-4 shadow-lg shadow-opacity-20 ${!showCancel ? 'w-full' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};