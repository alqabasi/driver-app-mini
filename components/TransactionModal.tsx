import React, { useState } from 'react';
import { TransactionType } from '../types';
import { Button } from './Button';
import { X, Check } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientName: string, amount: number, type: TransactionType) => void;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialType = TransactionType.INCOME
}) => {
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount) return;
    
    onSubmit(clientName, Number(amount), type);
    setClientName('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {type === TransactionType.INCOME ? 'تسجيل وارد (فلوس داخلة)' : 'تسجيل مصروف (فلوس خارجة)'}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                type === TransactionType.INCOME 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              وارد
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all ${
                type === TransactionType.EXPENSE 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              مصروف
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 font-semibold block text-lg">اسم العميل / وصف الحركة</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="مثال: توصيل الحاج محمد"
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-xl bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 font-semibold block text-lg">المبلغ (جنيه)</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-3xl font-bold tracking-wider text-center bg-gray-50"
            />
          </div>

          <Button type="submit" fullWidth size="xl" variant={type === TransactionType.INCOME ? 'success' : 'danger'}>
            <Check size={24} />
            {type === TransactionType.INCOME ? 'حفظ الوارد' : 'حفظ المصروف'}
          </Button>
        </form>
      </div>
    </div>
  );
};