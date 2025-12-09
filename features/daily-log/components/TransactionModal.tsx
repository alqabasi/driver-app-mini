import React, { useState, useEffect, useRef } from 'react';
import { TransactionType } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { X, Check, ArrowDownCircle, ArrowUpCircle, Save } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientName: string, amount: number, type: TransactionType) => void;
  initialType?: TransactionType;
  initialData?: {
    clientName: string;
    amount: number;
    type: TransactionType;
  } | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialType = TransactionType.INCOME,
  initialData
}) => {
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setClientName(initialData.clientName);
        setAmount(initialData.amount.toString());
        setType(initialData.type);
      } else {
        setType(initialType);
        setClientName('');
        setAmount('');
      }
      // Focus amount after a small delay for animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialType, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount) return;
    
    onSubmit(clientName, Number(amount), type);
    onClose();
  };

  const isIncome = type === TransactionType.INCOME;
  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative z-10 flex flex-col max-h-[90vh]">
        
        {/* Handle bar for bottom sheet look */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {isEditing ? 'تعديل الحركة' : (isIncome ? 'إضافة وارد' : 'إضافة مصروف')}
            </h3>
            <p className="text-slate-500 text-sm font-medium">
               {isEditing ? 'تعديل بيانات الحركة المسجلة' : (isIncome ? 'تسجيل مبلغ تم تحصيله' : 'تسجيل مبلغ تم صرفه')}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                isIncome 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArrowUpCircle size={18} />
              وارد
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                !isIncome 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ArrowDownCircle size={18} />
              مصروف
            </button>
          </div>

          <div className="space-y-4">
             {/* Amount Input */}
             <div className="relative">
                <div className="absolute top-4 right-4 pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">المبلغ</span>
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 pt-8 pb-3 rounded-2xl border-2 outline-none text-4xl font-bold tracking-tight text-left pl-12 transition-all ${
                      isIncome 
                      ? 'border-emerald-100 focus:border-emerald-500 bg-emerald-50/30 text-emerald-900' 
                      : 'border-red-100 focus:border-red-500 bg-red-50/30 text-red-900'
                  }`}
                />
                <span className={`absolute left-4 bottom-5 font-bold text-lg ${isIncome ? 'text-emerald-300' : 'text-red-300'}`}>ج.م</span>
             </div>

             {/* Client Name Input */}
             <div className="relative">
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 rounded-2xl border-2 border-slate-200 focus:border-slate-800 outline-none text-lg font-bold bg-white text-slate-800 transition-all"
                />
                <label className="absolute top-4 right-4 text-slate-400 text-sm font-bold transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-slate-500 peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-slate-500 pointer-events-none">
                   وصف الحركة / اسم العميل
                </label>
             </div>
          </div>

          <div className="pt-2">
            <Button 
                type="submit" 
                fullWidth 
                size="xl" 
                className={`rounded-2xl py-5 shadow-lg active:scale-[0.98] ${
                    isIncome ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                }`}
            >
                {isEditing ? <Save size={24} /> : <Check size={24} />}
                <span className="text-lg">
                    {isEditing ? 'حفظ التعديلات' : (isIncome ? 'تأكيد عملية الوارد' : 'تأكيد عملية الصرف')}
                </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};