import React from 'react';
import { DailyLog, TransactionType, Driver } from '../types';

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

  const dateStr = new Date(log.date).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="hidden print-only bg-white text-black w-full h-full absolute top-0 left-0 z-[9999]" dir="rtl">
      <div className="max-w-[210mm] mx-auto p-8 min-h-screen relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
             <h1 className="text-4xl font-black mb-2 tracking-tight">شركة القبسي</h1>
             <p className="text-gray-600 text-lg">تقرير يومية سائق</p>
          </div>
          <div className="text-left">
             <div className="text-sm text-gray-500 mb-1">تاريخ اليومية</div>
             <div className="font-bold text-xl">{dateStr}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
           <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <span className="block text-gray-500 text-sm mb-1">اسم السائق</span>
              <span className="block font-bold text-xl">{driver.name}</span>
           </div>
           <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <span className="block text-gray-500 text-sm mb-1">رقم الموبايل</span>
              <span className="block font-bold text-xl" dir="ltr">{driver.mobile}</span>
           </div>
        </div>

        {/* Summary Box */}
        <div className="mb-10 border-2 border-black rounded-xl overflow-hidden">
          <div className="bg-black text-white p-2 text-center font-bold">ملخص الحساب</div>
          <div className="flex divide-x divide-x-reverse divide-black">
            <div className="flex-1 p-4 text-center">
              <span className="block text-gray-600 text-sm mb-1">إجمالي الوارد</span>
              <span className="font-bold text-2xl text-black">{totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex-1 p-4 text-center bg-gray-50">
              <span className="block text-gray-600 text-sm mb-1">صافي اليومية</span>
              <span className="font-bold text-3xl text-black">{net.toLocaleString()}</span>
            </div>
            <div className="flex-1 p-4 text-center">
              <span className="block text-gray-600 text-sm mb-1">إجمالي المصروف</span>
              <span className="font-bold text-2xl text-black">{totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Income Table */}
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
               📥 تفاصيل الوارد
            </h3>
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="bg-gray-100 border-y border-black">
                  <th className="p-3 font-bold w-12 text-center">#</th>
                  <th className="p-3 font-bold">البيان / العميل</th>
                  <th className="p-3 font-bold w-32">الوقت</th>
                  <th className="p-3 font-bold w-32 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {incomeTransactions.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">لا يوجد حركات</td></tr>
                )}
                {incomeTransactions.map((t, index) => (
                  <tr key={t.id}>
                    <td className="p-3 text-center text-gray-500">{index + 1}</td>
                    <td className="p-3 font-medium">{t.clientName}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(t.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-3 font-bold text-left">{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expense Table */}
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
               📤 تفاصيل المصروفات
            </h3>
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="bg-gray-100 border-y border-black">
                  <th className="p-3 font-bold w-12 text-center">#</th>
                  <th className="p-3 font-bold">البيان / السبب</th>
                  <th className="p-3 font-bold w-32">الوقت</th>
                  <th className="p-3 font-bold w-32 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenseTransactions.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">لا يوجد مصروفات</td></tr>
                )}
                {expenseTransactions.map((t, index) => (
                  <tr key={t.id}>
                    <td className="p-3 text-center text-gray-500">{index + 1}</td>
                    <td className="p-3 font-medium">{t.clientName}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(t.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-3 font-bold text-left">{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
           <div className="flex justify-between items-end mb-8">
              <div className="text-center w-40">
                <p className="mb-6 font-bold text-sm text-gray-500">توقيع السائق</p>
                <div className="border-b border-black h-1"></div>
              </div>
              <div className="text-center w-40">
                <p className="mb-6 font-bold text-sm text-gray-500">اعتماد الإدارة</p>
                <div className="border-b border-black h-1"></div>
              </div>
           </div>
           <div className="text-center text-xs text-gray-400 border-t pt-2">
             تم استخراج هذا المستند إلكترونياً من نظام القباسي - {new Date().toLocaleString('ar-EG')}
           </div>
        </div>
      </div>
    </div>
  );
};