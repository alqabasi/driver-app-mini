import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface TransactionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TransactionActionModal: React.FC<TransactionActionModalProps> = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[60] flex items-end justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="خيارات الحركة"
        >
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
            <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-200 relative z-10 p-6 pb-10">
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" aria-hidden="true" />
                 
                 <h3 className="text-center text-lg font-bold text-slate-800 mb-6">خيارات الحركة</h3>

                 <div className="space-y-3">
                     <button 
                        onClick={() => { onEdit(); onClose(); }} 
                        className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-slate-800 font-bold active:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100"
                     >
                        <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm border border-slate-100">
                            <Edit2 size={20} />
                        </div>
                        تعديل البيانات
                     </button>
                     <button 
                        onClick={() => { onDelete(); onClose(); }} 
                        className="w-full flex items-center gap-4 p-4 bg-red-50 rounded-2xl text-red-600 font-bold active:bg-red-100 transition-colors focus:outline-none focus:ring-4 focus:ring-red-100"
                     >
                        <div className="bg-white p-2 rounded-xl text-red-500 shadow-sm border border-red-100">
                            <Trash2 size={20} />
                        </div>
                        حذف الحركة
                     </button>
                     <button 
                        onClick={onClose} 
                        className="w-full p-4 text-slate-400 font-bold hover:text-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-100 rounded-xl"
                     >
                        إلغاء
                     </button>
                 </div>
            </div>
        </div>
    );
};