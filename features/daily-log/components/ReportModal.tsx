import React, { useMemo, useState } from 'react';
import { DailyLog, Driver, TransactionType } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { X, Copy, Printer, Check, Share2, FileText, Download } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: DailyLog;
  driver: Driver;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  log,
  driver
}) => {
  const [copied, setCopied] = useState(false);

  // Generate the detailed text report
  const reportText = useMemo(() => {
    const income = log.transactions.filter(t => t.type === TransactionType.INCOME);
    const expense = log.transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const net = totalIncome - totalExpense;
    
    const dateStr = new Date(log.date).toLocaleDateString('ar-EG', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    let text = `📄 *تقرير يومية - شركة القبسي*\n`;
    text += `👤 السائق: ${driver.name}\n`;
    text += `📱 موبايل: ${driver.mobile}\n`;
    text += `📅 التاريخ: ${dateStr}\n`;
    text += `------------------------\n`;
    
    text += `🟢 *أولاً: الوارد (الدخل)*\n`;
    if (income.length === 0) text += `(لا يوجد)\n`;
    income.forEach((t, i) => {
      text += `${i+1}. ${t.clientName}: ${t.amount.toLocaleString()} ج.م\n`;
    });
    text += `💰 *إجمالي الوارد: ${totalIncome.toLocaleString()} ج.م*\n`;
    text += `------------------------\n`;
    
    text += `🔴 *ثانياً: المصروفات*\n`;
    if (expense.length === 0) text += `(لا يوجد)\n`;
    expense.forEach((t, i) => {
      text += `${i+1}. ${t.clientName}: ${t.amount.toLocaleString()} ج.م\n`;
    });
    text += `💸 *إجمالي المصروف: ${totalExpense.toLocaleString()} ج.م*\n`;
    text += `------------------------\n`;
    
    text += `📊 *الخلاصة*\n`;
    text += `صافي اليومية: ${net.toLocaleString()} ج.م\n`;
    text += `------------------------\n`;
    text += `تم الاستخراج بواسطة تطبيق القبسي`;
    
    return text;
  }, [log, driver]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `daily_report_${new Date(log.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="تصدير التقرير"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" aria-hidden="true" />
            تصدير التقرير
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 mb-2 font-bold">معاينة النص (للرسائل):</p>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-blue-100 shadow-sm" tabIndex={0}>
              {reportText}
            </pre>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <Button onClick={handleCopy} variant="secondary" fullWidth className="justify-between group">
                <span className="flex items-center gap-2">
                   {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                   {copied ? 'تم النسخ بنجاح' : 'نسخ النص'}
                </span>
             </Button>
             
             <Button onClick={handleWhatsApp} variant="success" fullWidth className="justify-between">
                <span className="flex items-center gap-2">
                  <Share2 size={20} />
                  إرسال واتساب
                </span>
             </Button>
             
             <Button onClick={handleDownload} variant="outline" fullWidth className="justify-between">
                <span className="flex items-center gap-2">
                   <Download size={20} />
                   حفظ كملف نصي
                </span>
             </Button>

             <hr className="my-2" />

             <Button onClick={handlePrint} variant="primary" fullWidth className="justify-between py-4">
                <span className="flex items-center gap-2">
                   <Printer size={20} />
                   تصدير ملف PDF رسمي
                </span>
                <span className="text-xs font-normal opacity-70 bg-white/10 px-2 py-1 rounded">للطباعة والحفظ</span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};