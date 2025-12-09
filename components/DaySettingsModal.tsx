import React from 'react';
import { Button } from './Button';
import { X, Lock, User, Phone } from 'lucide-react';
import { Driver } from '../types';

interface DaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseDay: () => void;
  driver: Driver;
  isDayClosed: boolean;
}

export const DaySettingsModal: React.FC<DaySettingsModalProps> = ({
  isOpen,
  onClose,
  onCloseDay,
  driver,
  isDayClosed
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">الإعدادات والملف الشخصي</h3>
          <button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Driver Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <User size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold">السائق الحالي</p>
                <h4 className="text-lg font-bold text-slate-800">{driver.name}</h4>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mr-2">
               <Phone size={16} />
               <span className="font-medium dir-ltr">{driver.mobile}</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Actions */}
          <div>
            <h4 className="text-gray-500 font-bold mb-3 text-sm">إجراءات الوردية</h4>
            
            {!isDayClosed ? (
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => {
                  onClose();
                  // Small timeout to allow modal to close before confirm dialog (smoother UI)
                  setTimeout(() => onCloseDay(), 100);
                }}
                className="bg-slate-800 hover:bg-slate-900"
              >
                <Lock size={20} />
                تقفيل اليومية نهائياً
              </Button>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2">
                <Lock size={16} />
                هذه اليومية مغلقة
              </div>
            )}
            
            {!isDayClosed && (
              <p className="text-xs text-red-500 mt-2 text-center font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                تنبيه: لا يمكن تعديل أو إضافة حركات بعد التقفيل
              </p>
            )}
          </div>

        </div>
      </div>
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};