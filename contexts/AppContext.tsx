import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Driver, DailyLog, Transaction, TransactionType, DayStatus } from '../types';
import { authApi, driverApi, transactionApi, ApiTransaction, ApiDay } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AppContextType {
  driver: Driver | null;
  logs: DailyLog[];
  currentLog: DailyLog | null;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<boolean>;
  register: (name: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  createDay: () => Promise<void>;
  selectDay: (log: DailyLog | null) => void;
  addTransaction: (clientName: string, amount: number, type: TransactionType) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, clientName: string, amount: number, type: TransactionType) => Promise<void>;
  closeDay: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TOKEN_KEY = 'alqabasi_token';
const DRIVER_INFO_KEY = 'alqabasi_driver_info';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLog, setCurrentLog] = useState<DailyLog | null>(null);

  // Helper to process raw API transactions into DailyLogs
  const processData = useCallback((transactions: ApiTransaction[], currentDay: ApiDay | null) => {
    const logsMap = new Map<string, DailyLog>();

    // Sort transactions newest first
    const sortedTx = [...transactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sortedTx.forEach(tx => {
      const dateObj = new Date(tx.timestamp);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!logsMap.has(dateKey)) {
        logsMap.set(dateKey, {
          id: dateKey,
          driverId: String(tx.driver_id),
          date: dateObj.getTime(), // Approximate day timestamp from first tx
          status: DayStatus.CLOSED, // Default to closed, update if matches current
          transactions: []
        });
      }

      const log = logsMap.get(dateKey)!;
      log.transactions.push({
        id: String(tx.id),
        clientName: tx.description,
        amount: tx.amount,
        type: tx.type as TransactionType,
        timestamp: dateObj.getTime()
      });
    });

    // Handle Current Day Status
    if (currentDay) {
      const currentKey = currentDay.date; // YYYY-MM-DD from API
      
      // If we have transactions for today, update its status
      if (logsMap.has(currentKey)) {
        const log = logsMap.get(currentKey)!;
        log.status = currentDay.status === 'open' ? DayStatus.OPEN : DayStatus.CLOSED;
      } else if (currentDay.status === 'open') {
        // If no transactions yet but day is open, create empty log
        logsMap.set(currentKey, {
          id: currentKey,
          driverId: String(currentDay.driver_id),
          date: new Date(currentDay.opened_at).getTime(),
          status: DayStatus.OPEN,
          transactions: []
        });
      }
    }

    const processedLogs = Array.from(logsMap.values()).sort((a, b) => b.date - a.date);
    setLogs(processedLogs);
    
    // Update currentLog selection if it exists
    setCurrentLog(prev => {
       if (!prev) return null;
       return processedLogs.find(l => l.id === prev.id) || null;
    });
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // Parallel fetch
      const [txRes, dayRes] = await Promise.allSettled([
        transactionApi.getAll(),
        driverApi.getCurrentDay()
      ]);

      const transactions = txRes.status === 'fulfilled' ? txRes.value.data : [];
      
      let currentDay: ApiDay | null = null;
      if (dayRes.status === 'fulfilled') {
        currentDay = dayRes.value.data;
      } else {
        // 404 typically means no active day, which is fine
      }

      processData(transactions, currentDay);
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  }, [processData]);

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedDriver = localStorage.getItem(DRIVER_INFO_KEY);
      
      if (token) {
        if (savedDriver) {
          setDriver(JSON.parse(savedDriver));
        } else {
          // Attempt to decode token for basic info if possible
          try {
            const decoded: any = jwtDecode(token);
            // Assuming token might have some info, otherwise generic
            setDriver({ name: decoded.name || 'السائق', mobile: decoded.mobile || '' });
          } catch (e) {
            setDriver({ name: 'السائق', mobile: '' });
          }
        }
        await refreshData();
      }
      setIsLoading(false);
    };

    initApp();
  }, [refreshData]);

  const login = async (mobile: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.login(mobile, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      
      // We don't have a user profile endpoint, so we simulate driver info
      // In a real app, we'd fetch profile here or decode token
      const drv: Driver = { name: 'السائق', mobile }; 
      setDriver(drv);
      localStorage.setItem(DRIVER_INFO_KEY, JSON.stringify(drv));
      
      await refreshData();
      return true;
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.response?.status === 403) {
        alert('الحساب غير مفعل بعد. يرجى انتظار موافقة الإدارة.');
      } else {
        alert('فشل تسجيل الدخول. تأكد من صحة البيانات.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, mobile: string, password: string) => {
    setIsLoading(true);
    try {
      // Hardcoded license for now as per minimal UI changes request, or add to UI
      await authApi.register(name, mobile, password, "PENDING_LICENSE");
      alert('تم التسجيل بنجاح! يرجى الانتظار لتفعيل الحساب من الإدارة ثم تسجيل الدخول.');
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      alert('فشل التسجيل. ربما الرقم مسجل بالفعل.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DRIVER_INFO_KEY);
    setDriver(null);
    setLogs([]);
    setCurrentLog(null);
  };

  const createDay = async () => {
    try {
      await driverApi.openDay();
      await refreshData();
    } catch (error: any) {
      console.error("Failed to open day", error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage && (errorMessage.includes("already have an open day") || errorMessage.includes("closed first"))) {
        await refreshData(); // Ensure UI is in sync
        throw { code: 'ALREADY_OPEN', message: errorMessage };
      } else {
        throw error;
      }
    }
  };

  const selectDay = (log: DailyLog | null) => {
    setCurrentLog(log);
  };

  const addTransaction = async (clientName: string, amount: number, type: TransactionType) => {
    try {
      await transactionApi.create(amount, type, clientName);
      await refreshData();
    } catch (error) {
      console.error("Failed to add transaction", error);
      alert('حدث خطأ أثناء إضافة الحركة.');
    }
  };

  // Not supported by provided API
  const deleteTransaction = async (id: string) => {
    console.warn("Delete not supported by API");
    alert("حذف الحركات غير مدعوم في النظام السحابي");
  };

  // Not supported by provided API
  const updateTransaction = async (id: string, clientName: string, amount: number, type: TransactionType) => {
    console.warn("Update not supported by API");
    alert("تعديل الحركات غير مدعوم في النظام السحابي");
  };

  const closeDay = async () => {
    try {
      await driverApi.closeDay();
      await refreshData();
    } catch (error) {
      console.error("Failed to close day", error);
      alert('حدث خطأ أثناء إغلاق الوردية.');
    }
  };

  const exportData = async () => {
     if (!logs.length) return;
     const data = JSON.stringify(logs, null, 2);
     navigator.clipboard.writeText(data).then(() => {
        alert('تم نسخ البيانات للحافظة.');
     });
  };

  const importData = async () => {
    alert('استيراد البيانات غير متاح مع النظام السحابي.');
  };

  return (
    <AppContext.Provider value={{
      driver,
      logs,
      currentLog,
      isLoading,
      login,
      register,
      logout,
      createDay,
      selectDay,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      closeDay,
      exportData,
      importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};