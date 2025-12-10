import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { TransactionType, DayStatus, Transaction } from '../../types';
import { Button } from '../../components/ui/Button';
import { TransactionModal } from './components/TransactionModal';
import { DaySettingsModal } from './components/DaySettingsModal';
import { ReportModal } from './components/ReportModal';
import { PrintView } from './components/PrintView';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { IncomeExpenseChart } from '../../components/ui/IncomeExpenseChart';
import { 
  ChevronLeft, Lock, Settings, FileText, ArrowUp, ArrowDown, Share2, Wallet,
  ArrowUpDown, Filter, Search, X, Clock, Timer
} from 'lucide-react';

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  variant: 'danger' | 'warning' | 'success' | 'info';
}

export const DailyLogScreen: React.FC = () => {
  const { currentLog, driver, selectDay, addTransaction, closeDay } = useApp();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });
  
  const [txType, setTxType] = useState(TransactionType.INCOME);
  
  // Filter & Sort State
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [sortBy, setSortBy] = useState<'TIME' | 'AMOUNT'>('TIME');
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Time tracking
  const [now, setNow] = useState(Date.now());

  // Derive start/end times from the Log ID (Format: YYYY-MM-DD)
  // Day starts at 04:00 AM of that ID's date and ends at 04:00 AM the next day.
  const { dayStart, dayEnd, progressPercent, remainingHours } = useMemo(() => {
    if (!currentLog) return { dayStart: new Date(), dayEnd: new Date(), progressPercent: 0, remainingHours: 0 };
    
    // Parse ID YYYY-MM-DD
    const [year, month, day] = currentLog.id.split('-').map(Number);
    // Construct start date at 4:00 AM
    const start = new Date(year, month - 1, day, 4, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
    
    let percent = 0;
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now - start.getTime();
    
    if (now < start.getTime()) {
      percent = 0;
    } else if (now > end.getTime()) {
      percent = 100;
    } else {
      percent = (elapsed / totalDuration) * 100;
    }
    
    const remainingMs = end.getTime() - now;
    const remainingHrs = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));

    return { 
      dayStart: start, 
      dayEnd: end, 
      progressPercent: percent,
      remainingHours: remainingHrs
    };
  }, [currentLog, now]);

  const isClosed = currentLog?.status === DayStatus.CLOSED;

  // Auto-close logic check
  useEffect(() => {
    if (!currentLog || isClosed) return;

    const checkAutoClose = async () => {
      // If current time is past the day end (Next day 4 AM), close it.
      if (now > dayEnd.getTime()) {
        await closeDay();
        setConfirmConfig({
          isOpen: true,
          title: 'انتهاء اليومية',
          message: 'تم إغلاق اليومية تلقائياً لانتهاء الوقت المحدد (4:00 ص). يمكنك الآن فتح وردية جديدة.',
          variant: 'info',
          confirmText: 'حسناً',
          onConfirm: () => {}
        });
      }
    };

    checkAutoClose();
    
    // Update timer every minute
    const interval = setInterval(() => {
      setNow(Date.now());
      checkAutoClose();
    }, 60000); 

    return () => clearInterval(interval);
  }, [currentLog, isClosed, dayEnd, now, closeDay]);

  const displayedTransactions = useMemo(() => {
    if (!currentLog) return [];
    
    let data = [...currentLog.transactions];

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(t => t.clientName.toLowerCase().includes(query));
    }

    // Type Filter
    if (filterType !== 'ALL') {
      data = data.filter(t => t.type === filterType);
    }

    // Sort
    data.sort((a, b) => {
      if (sortBy === 'AMOUNT') {
        return b.amount - a.amount; // Highest amount first
      }
      return b.timestamp - a.timestamp; // Newest first
    });

    return data;
  }, [currentLog?.transactions, filterType, sortBy, searchQuery]);

  if (!currentLog || !driver) return null;

  const summary = (() => {
    const income = currentLog.transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = currentLog.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  })();

  const handleCloseDayConfirm = async () => {
    setConfirmConfig({
      isOpen: true,
      title: 'تقفيل اليومية',
      message: 'تحذير: بمجرد إغلاق اليومية لا يمكن تعديلها أو إضافة حركات مرة أخرى. هل أنت متأكد؟',
      variant: 'warning',
      confirmText: 'نعم، إغلاق اليومية',
      onConfirm: async () => {
        await closeDay();
      }
    });
  };

  // Transaction Actions
  const handleTxSubmit = async (clientName: string, amount: number, type: TransactionType) => {
    await addTransaction(clientName, amount, type);
  };

  const openAddModal = (type: TransactionType) => {
    setTxType(type);
    setIsTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-28 no-print" dir="rtl">
      {/* Print Layout (Hidden on screen) */}
      <PrintView log={currentLog} driver={driver} />

      {/* Header Area */}
      <div className="bg-slate-900 text-white pt-6 pb-24 px-6 rounded-b-[2.5rem] shadow-xl shadow-slate-900/10 relative z-0">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => selectDay(null)} 
            className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            aria-label="رجوع للرئيسية"
          >
            <ChevronLeft size={24} className="rotate-180" />
          </button>
          
          <div className="flex gap-3">
             <button 
              onClick={() => setIsReportOpen(true)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              aria-label="خيارات التقرير"
            >
              <FileText size={22} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 active:scale-95 transition-all backdrop-blur-md focus:outline-none focus-visible:ring-4 focus:ring-white/30"
              aria-label="إعدادات اليومية"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mb-3 backdrop-blur-md ${isClosed ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'}`}>
                {isClosed ? <Lock size={10} /> : <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {isClosed ? 'اليومية مغلقة' : 'اليومية جارية'}
            </span>
            <h1 className="text-2xl font-bold mb-1">
                {new Date(currentLog.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h1>
            <p className="text-slate-400 text-sm">{driver.name}</p>
        </div>

        {/* Day Period Indicator */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm mb-2">
           <div className="flex justify-between items-end mb-2 text-xs font-medium text-slate-400">
               <span>البداية 04:00 ص</span>
               <span>النهاية 04:00 ص</span>
           </div>
           
           {/* Progress Bar */}
           <div className="h-2.5 bg-slate-800 rounded-full w-full overflow-hidden mb-2 relative">
               <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isClosed ? 'bg-slate-600' : (progressPercent > 90 ? 'bg-amber-500' : 'bg-blue-500')
                  }`}
                  style={{ width: `${progressPercent}%` }}
               >
                 {/* Shimmer effect */}
                 {!isClosed && (
                   <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                 )}
               </div>
           </div>

           <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                 <Clock size={14} className="text-blue-400" />
                 <span>
                    {now < dayStart.getTime() ? 'لم تبدأ بعد' : (
                      isClosed ? 'انتهت الوردية' : 'الوردية سارية'
                    )}
                 </span>
              </div>
              {!isClosed && (
                <div className="flex items-center gap-1.5 font-bold">
                   <Timer size={14} className={remainingHours < 3 ? "text-amber-400 animate-pulse" : "text-slate-400"} />
                   <span className={remainingHours < 3 ? "text-amber-400" : "text-slate-400"}>
                      متبقي {remainingHours} ساعة
                   </span>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Summary Floating Card */}
      <div className="px-4 -mt-16 relative z-10 mb-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <div className="flex justify-between items-end divide-x divide-x-reverse divide-gray-100">
                <div className="flex-1 text-center pl-2">
                    <span className="block text-gray-500 text-xs font-bold mb-2">الوارد</span>
                    <span className="text-emerald-600 font-bold text-xl block tracking-tight">
                        {summary.income.toLocaleString()}
                    </span>
                </div>
                <div className="flex-1 text-center pr-2 px-2 flex flex-col items-center">
                    <div className="h-10 mb-2 w-full flex justify-center">
                        <IncomeExpenseChart income={summary.income} expense={summary.expense} height={40} barWidth="w-3" />
                    </div>
                    <span className="block text-gray-500 text-xs font-bold mb-1">الصافي</span>
                    <span className={`font-black text-2xl block tracking-tight leading-none ${summary.net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                        {summary.net.toLocaleString()}
                    </span>
                </div>
                <div className="flex-1 text-center px-2">
                    <span className="block text-gray-500 text-xs font-bold mb-2">المصروف</span>
                    <span className="text-red-500 font-bold text-xl block tracking-tight">
                        {summary.expense.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between px-2">
            <h2 className="font-bold text-lg text-slate-800">سجل الحركات</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                {displayedTransactions.length} حركة
            </span>
        </div>

        {/* Search Input */}
        <div className="relative">
             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                 <Search size={20} />
             </div>
             <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="بحث في الحركات..."
                 aria-label="بحث في الحركات"
                 className="w-full pr-12 pl-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
             />
             {searchQuery && (
                 <button 
                     onClick={() => setSearchQuery('')}
                     className="absolute inset-y-0 left-0 pl-3 flex items-center"
                     aria-label="مسح البحث"
                 >
                     <div className="bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1 transition-colors">
                         <X size={14} />
                     </div>
                 </button>
             )}
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1" role="region" aria-label="أدوات الفلترة">
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-100">
                <button 
                  onClick={() => setFilterType('ALL')} 
                  aria-pressed={filterType === 'ALL'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${filterType === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  الكل
                </button>
                <button 
                  onClick={() => setFilterType(TransactionType.INCOME)} 
                  aria-pressed={filterType === TransactionType.INCOME}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${filterType === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  وارد
                </button>
                <button 
                  onClick={() => setFilterType(TransactionType.EXPENSE)} 
                  aria-pressed={filterType === TransactionType.EXPENSE}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 ${filterType === TransactionType.EXPENSE ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  مصروف
                </button>
            </div>

            <button 
                onClick={() => setSortBy(prev => prev === 'TIME' ? 'AMOUNT' : 'TIME')} 
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${sortBy === 'AMOUNT' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-white text-slate-500 border-slate-100'}`}
            >
                <ArrowUpDown size={14} />
                {sortBy === 'TIME' ? 'الوقت' : 'المبلغ'}
            </button>
        </div>

        {currentLog.transactions.length === 0 ? (
          <div className="text-center py-12 px-8 bg-white rounded-[2rem] shadow-sm border border-gray-100/50">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="text-slate-300 w-10 h-10" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-1">لا توجد حركات</h3>
            <p className="text-slate-400 text-sm">ابدأ بتسجيل الوارد والمصروفات لهذا اليوم</p>
          </div>
        ) : displayedTransactions.length === 0 ? (
           <div className="text-center py-12 px-8">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Filter className="text-gray-400 w-8 h-8" />
              </div>
              <p className="text-gray-500 font-medium">لا توجد نتائج تطابق بحثك</p>
           </div>
        ) : (
          <div className="space-y-3 pb-8">
            {displayedTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className={`w-full bg-white p-4 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between transition-all relative overflow-hidden text-right`}
              >
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                        tx.type === TransactionType.INCOME 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                        {tx.type === TransactionType.INCOME ? <ArrowUp size={24} /> : <ArrowDown size={24} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-base mb-0.5">{tx.clientName}</h4>
                        <span className="text-xs text-gray-500 font-medium font-sans">
                        {new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                <div className={`font-bold text-lg relative z-10 ${
                    tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'
                }`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}
                    {tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-40">
        {!isClosed ? (
          <div className="flex gap-3 bg-slate-900 p-2 rounded-[1.8rem] shadow-2xl shadow-slate-900/30 backdrop-blur-xl">
            <button 
              onClick={() => openAddModal(TransactionType.INCOME)}
              aria-label="إضافة وارد جديد"
              className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-[1.4rem] py-4 font-bold flex flex-col items-center justify-center gap-1 transition-all group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <span className="bg-emerald-500 text-white p-1.5 rounded-full mb-1 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/40">
                  <ArrowUp size={20} />
              </span>
              <span className="text-xs opacity-90">وارد</span>
            </button>
            
            <div className="w-px bg-white/10 my-3"></div>

            <button 
              onClick={() => openAddModal(TransactionType.EXPENSE)}
              aria-label="إضافة مصروف جديد"
              className="flex-1 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-[1.4rem] py-4 font-bold flex flex-col items-center justify-center gap-1 transition-all group focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <span className="bg-red-500 text-white p-1.5 rounded-full mb-1 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/40">
                  <ArrowDown size={20} />
              </span>
              <span className="text-xs opacity-90">مصروف</span>
            </button>
          </div>
        ) : (
            <Button 
            onClick={() => setIsReportOpen(true)}
            fullWidth
            size="lg"
            className="rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-900/30"
          >
            <Share2 size={24} />
            خيارات التقرير
          </Button>
        )}
      </div>

      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        onSubmit={handleTxSubmit}
        initialType={txType}
        initialData={null}
      />

      <DaySettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onCloseDay={handleCloseDayConfirm}
        driver={driver}
        isDayClosed={isClosed}
      />

      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        log={currentLog}
        driver={driver}
      />
      
      {/* Universal Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
};