import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DailyLog, DayStatus, TransactionType } from '../../types';
import { LogOut, Plus, ArrowRight, Download, FileSpreadsheet, AlertTriangle, Bell } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { driver, logs, logout, createDay, selectDay, exportData } = useApp();

  const reminder = useMemo(() => {
    if (!logs.length) return null;
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // 1. Check for ANY past day that is still OPEN
    // logs are typically sorted descending (newest first)
    const pastOpenLog = logs.find(log => {
      const logDate = new Date(log.date);
      const logDayStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
      return log.status === DayStatus.OPEN && logDayStart < todayStart;
    });

    if (pastOpenLog) {
      return {
        type: 'urgent',
        title: 'يومية سابقة مفتوحة',
        message: `نسيت تقفيل يومية ${new Date(pastOpenLog.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'numeric' })}. اضغط لتقفيلها الآن.`,
        log: pastOpenLog,
        className: 'bg-red-50 border-red-100 text-red-900',
        icon: <AlertTriangle size={24} className="text-red-600" />,
        iconBg: 'bg-red-100'
      };
    }

    // 2. Check if TODAY is OPEN and it is late (e.g. after 9 PM / 21:00)
    if (now.getHours() >= 21) {
       const todayLog = logs.find(log => {
         const logDate = new Date(log.date);
         const logDayStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
         return log.status === DayStatus.OPEN && logDayStart === todayStart;
       });

       if (todayLog) {
         return {
           type: 'warning',
           title: 'تذكير مسائي',
           message: 'يوشك اليوم على الانتهاء. لا تنس مراجعة وتقفيل اليومية.',
           log: todayLog,
           className: 'bg-amber-50 border-amber-100 text-amber-900',
           icon: <Bell size={24} className="text-amber-600" />,
           iconBg: 'bg-amber-100'
         };
       }
    }

    return null;
  }, [logs]);

  if (!driver) return null;

  const handleLogout = () => {
    if(window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  const getDaySummary = (log: DailyLog) => {
    const income = log.transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = log.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income - expense };
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    // CSV Logic remains same
    let csv = '\uFEFFالتاريخ,نوع الحركة,البيان/العميل,المبلغ,الوقت\n';
    logs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString('ar-EG');
      log.transactions.forEach(t => {
        const type = t.type === TransactionType.INCOME ? 'وارد' : 'مصروف';
        const time = new Date(t.timestamp).toLocaleTimeString('ar-EG');
        const client = `"${t.clientName.replace(/"/g, '""')}"`;
        csv += `${date},${type},${client},${t.amount},${time}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alqabasi_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-white pt-8 pb-6 px-6 rounded-b-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
             <span className="text-slate-400 font-bold text-sm mb-1 block">مرحباً بك</span>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">كابتن {driver.name.split(' ')[0]} 👋</h1>
          </div>
          <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
            <LogOut size={22} />
          </button>
        </div>

        <button 
          onClick={createDay}
          className="w-full bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
                <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <Plus size={32} />
                </div>
                <div className="text-right">
                    <span className="block font-bold text-xl mb-1">وردية فتح</span>
                    <span className="text-slate-400 text-sm font-medium">ابدأ تسجيل حسابات اليوم</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                 <ArrowRight className="text-white rotate-180" size={20} />
            </div>
          </div>
        </button>
      </div>

      {/* Reminder Banner */}
      {reminder && (
        <div className="px-6 mb-6 animate-in slide-in-from-top-4 duration-500">
           <button 
             onClick={() => selectDay(reminder.log)}
             className={`w-full p-4 rounded-[1.5rem] border flex items-center gap-4 text-right shadow-sm active:scale-95 transition-all ${reminder.className}`}
           >
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${reminder.iconBg}`}>
                {reminder.icon}
             </div>
             <div>
                <h3 className="font-bold text-base mb-0.5">{reminder.title}</h3>
                <p className="text-xs opacity-80 font-medium leading-relaxed">{reminder.message}</p>
             </div>
           </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 mb-8">
         <h2 className="text-slate-800 font-bold text-lg mb-4">أدوات سريعة</h2>
         <div className="grid grid-cols-2 gap-4">
             <button onClick={exportData} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Download size={20} />
                </div>
                <span className="font-bold text-sm text-slate-700">نسخ البيانات</span>
             </button>
             <button onClick={handleExportCSV} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-3 active:scale-95 transition-all">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                    <FileSpreadsheet size={20} />
                </div>
                <span className="font-bold text-sm text-slate-700">تقرير Excel</span>
             </button>
         </div>
      </div>

      {/* History */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl text-slate-800">سجل الورديات</h2>
            <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-full border border-gray-100">
                {logs.length} يوم
            </span>
        </div>

        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">لا يوجد أيام مسجلة بعد</p>
            </div>
          ) : (
            logs.map(log => {
               const { net } = getDaySummary(log);
               const isClosed = log.status === DayStatus.CLOSED;
               
               return (
                <button 
                  key={log.id}
                  onClick={() => selectDay(log)}
                  className="w-full bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 active:scale-[0.98] transition-all text-right group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="block font-black text-slate-800 text-lg mb-1">
                            {new Date(log.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {new Date(log.date).toLocaleDateString('en-US')}
                        </span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${isClosed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isClosed ? 'مغلق' : 'جاري'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <div className="text-gray-400 text-xs font-bold">
                       {log.transactions.length} حركة مسجلة
                    </div>
                    <div>
                       <span className="text-gray-400 text-xs font-bold ml-2">الصافي</span>
                       <span className={`font-black text-xl dir-ltr ${net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                         {net.toLocaleString()} <span className="text-xs">ج.م</span>
                       </span>
                    </div>
                  </div>
                </button>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
};