import React from 'react';
import { DailyLog, TransactionType, Driver, DayStatus } from '../../../types';

interface PrintViewProps {
  log: DailyLog;
  driver: Driver;
}

export const PrintView: React.FC<PrintViewProps> = ({ log, driver }) => {
  const incomeTransactions = log.transactions.filter(t => t.type === TransactionType.INCOME);
  const expenseTransactions = log.transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const net = totalIncome - totalExpense;

  const dateObj = new Date(log.date);
  const dateStr = dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create a pseudo-ID for the document
  const docId = `DOC-${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}-${driver.mobile.substring(7)}`;

  return (
    <div className="hidden print-only bg-white text-slate-900 w-full h-full absolute top-0 left-0 z-[9999]" dir="rtl">
      <style>
        {`
          @media print {
            @page { margin: 5mm; size: A4; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .print-color-exact { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}
      </style>
      
      <div className="max-w-[210mm] mx-auto min-h-screen relative flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
           <div className="flex flex-col">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">شركة القبسي للنقل</h1>
              <span className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-1">Alqabasi Transport & Logistics</span>
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-md w-fit mt-2 print-color-exact">كشف حساب يومي</span>
           </div>
           
           <div className="text-left flex flex-col items-end">
              <div className="mb-2">
                 <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Ref</span>
                 <span className="font-mono font-bold text-lg text-slate-800">{docId}</span>
              </div>
              <div className="text-right">
                 <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</span>
                 <span className="font-bold text-slate-800">{dateStr}</span>
              </div>
           </div>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 grid grid-cols-2 gap-8 print-color-exact">
           <div>
              <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">بيانات السائق (Driver Info)</p>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    {driver.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="font-black text-lg text-slate-800 leading-none mb-1">{driver.name}</h3>
                    <p className="font-mono text-slate-600 dir-ltr text-sm">{driver.mobile}</p>
                 </div>
              </div>
           </div>
           <div className="flex items-center justify-end">
              <div className="text-center px-6 border-r border-slate-200">
                 <span className="block text-xs font-bold text-slate-500 mb-1">الحالة</span>
                 <span className={`font-bold ${log.status === DayStatus.CLOSED ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {log.status === DayStatus.CLOSED ? 'مغلقة (Finalized)' : 'مفتوحة (Open)'}
                 </span>
              </div>
              <div className="text-center px-6">
                  <span className="block text-xs font-bold text-slate-500 mb-1">وقت الطباعة</span>
                  <span className="font-mono text-sm font-bold dir-ltr">
                     {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
              </div>
           </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="border-2 border-slate-100 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">إجمالي الوارد</span>
                <span className="block text-2xl font-black text-emerald-600 tracking-tight">{totalIncome.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-bold">EGP</span>
            </div>
            <div className="border-2 border-slate-100 rounded-xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">إجمالي المصروف</span>
                <span className="block text-2xl font-black text-red-600 tracking-tight">{totalExpense.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-bold">EGP</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-center text-white print-color-exact">
                <span className="block text-xs font-bold text-slate-400 mb-2 uppercase">صافي اليومية</span>
                <span className="block text-3xl font-black tracking-tight">{net.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-bold">EGP NET</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-8">
            {/* Income Section */}
            <div className="break-inside-avoid">
               <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <span className="font-bold text-lg text-slate-800">تفاصيل الوارد (Income)</span>
               </div>
               <table className="w-full text-right text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-bold print-color-exact">
                     <tr>
                        <th className="py-2 px-3 rounded-r-md w-12 text-center">#</th>
                        <th className="py-2 px-3">البيان / العميل</th>
                        <th className="py-2 px-3 w-32 text-center">الوقت</th>
                        <th className="py-2 px-3 rounded-l-md w-32 text-left">المبلغ</th>
                     </tr>
                  </thead>
                  <tbody className="font-medium text-slate-700">
                     {incomeTransactions.map((t, i) => (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0">
                           <td className="py-2 px-3 text-center text-slate-400">{i + 1}</td>
                           <td className="py-2 px-3">{t.clientName}</td>
                           <td className="py-2 px-3 text-center font-mono text-xs text-slate-500">
                              {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                           </td>
                           <td className="py-2 px-3 text-left font-mono font-bold text-slate-900">{t.amount.toLocaleString()}</td>
                        </tr>
                     ))}
                     {incomeTransactions.length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-slate-400 italic">لا توجد حركات</td></tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Expense Section */}
            <div className="break-inside-avoid">
               <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <span className="font-bold text-lg text-slate-800">تفاصيل المصروفات (Expenses)</span>
               </div>
               <table className="w-full text-right text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-bold print-color-exact">
                     <tr>
                        <th className="py-2 px-3 rounded-r-md w-12 text-center">#</th>
                        <th className="py-2 px-3">بند المصروف</th>
                        <th className="py-2 px-3 w-32 text-center">الوقت</th>
                        <th className="py-2 px-3 rounded-l-md w-32 text-left">المبلغ</th>
                     </tr>
                  </thead>
                  <tbody className="font-medium text-slate-700">
                     {expenseTransactions.map((t, i) => (
                        <tr key={t.id} className="border-b border-slate-50 last:border-0">
                           <td className="py-2 px-3 text-center text-slate-400">{i + 1}</td>
                           <td className="py-2 px-3">{t.clientName}</td>
                           <td className="py-2 px-3 text-center font-mono text-xs text-slate-500">
                              {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                           </td>
                           <td className="py-2 px-3 text-left font-mono font-bold text-slate-900">{t.amount.toLocaleString()}</td>
                        </tr>
                     ))}
                     {expenseTransactions.length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-slate-400 italic">لا توجد مصروفات</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 break-inside-avoid">
            <div className="flex justify-between items-end mb-6 px-8">
               <div className="text-center">
                  <p className="font-bold text-slate-900 mb-8">توقيع السائق</p>
                  <div className="w-48 border-b-2 border-slate-300 border-dashed"></div>
               </div>
               <div className="text-center">
                  <p className="font-bold text-slate-900 mb-8">اعتماد المحاسب</p>
                  <div className="w-48 border-b-2 border-slate-300 border-dashed"></div>
               </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 text-center">
               <p className="text-[10px] text-slate-400">
                  تم استخراج هذا المستند إلكترونياً عبر نظام القبسي لإدارة السائقين | {docId}
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};