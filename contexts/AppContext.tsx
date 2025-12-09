import React, { createContext, useContext, useState, useEffect } from 'react';
import { Driver, DailyLog, Transaction, TransactionType, DayStatus } from '../types';
import * as Storage from '../services/storageService';

interface AppContextType {
  driver: Driver | null;
  logs: DailyLog[];
  currentLog: DailyLog | null;
  isLoading: boolean;
  login: (name: string, mobile: string) => Promise<void>;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLog, setCurrentLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await Storage.initStorage();
        const savedDriver = await Storage.getDriver();
        if (savedDriver) {
          setDriver(savedDriver);
          await loadLogs(savedDriver.mobile);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const loadLogs = async (driverId: string) => {
    const loadedLogs = await Storage.getDailyLogs(driverId);
    setLogs(loadedLogs);
  };

  const login = async (name: string, mobile: string) => {
    setIsLoading(true);
    const newDriver: Driver = { name, mobile };
    await Storage.saveDriver(newDriver);
    setDriver(newDriver);
    await loadLogs(newDriver.mobile);
    setIsLoading(false);
  };

  const logout = () => {
    Storage.logoutDriver();
    setDriver(null);
    setCurrentLog(null);
    setLogs([]);
  };

  const createDay = async () => {
    if (!driver) return;
    const todayLog = await Storage.createNewDay(driver.mobile);
    await loadLogs(driver.mobile);
    setCurrentLog(todayLog);
  };

  const selectDay = (log: DailyLog | null) => {
    setCurrentLog(log);
  };

  const addTransaction = async (clientName: string, amount: number, type: TransactionType) => {
    if (!currentLog || !driver) return;

    const newTx: Transaction = {
      id: Storage.generateId(),
      clientName,
      amount,
      type,
      timestamp: Date.now()
    };

    const updatedLog = {
      ...currentLog,
      transactions: [newTx, ...currentLog.transactions]
    };

    // Optimistic UI update
    setCurrentLog(updatedLog);
    
    // Save to DB
    await Storage.saveDailyLog(driver.mobile, updatedLog);
    
    // Reload logs in background to ensure sync
    loadLogs(driver.mobile);
  };

  const deleteTransaction = async (id: string) => {
    if (!currentLog || !driver) return;
    const updatedTransactions = currentLog.transactions.filter(t => t.id !== id);
    const updatedLog = { ...currentLog, transactions: updatedTransactions };
    
    setCurrentLog(updatedLog);
    await Storage.saveDailyLog(driver.mobile, updatedLog);
    loadLogs(driver.mobile);
  };

  const updateTransaction = async (id: string, clientName: string, amount: number, type: TransactionType) => {
    if (!currentLog || !driver) return;
    const updatedTransactions = currentLog.transactions.map(t =>
      t.id === id ? { ...t, clientName, amount, type } : t
    );
    const updatedLog = { ...currentLog, transactions: updatedTransactions };
    
    setCurrentLog(updatedLog);
    await Storage.saveDailyLog(driver.mobile, updatedLog);
    loadLogs(driver.mobile);
  };

  const closeDay = async () => {
    if (!currentLog || !driver) return;
    
    const updatedLog: DailyLog = {
      ...currentLog,
      status: DayStatus.CLOSED,
      closedAt: Date.now()
    };

    setCurrentLog(updatedLog);
    await Storage.saveDailyLog(driver.mobile, updatedLog);
    loadLogs(driver.mobile);
  };

  const exportData = async () => {
    if (!driver) return;
    const data = await Storage.exportData(driver.mobile);
    navigator.clipboard.writeText(data).then(() => {
      alert('تم نسخ البيانات للحافظة. يمكنك حفظها في ملف خارجي.');
    });
  };

  const importData = async () => {
    const data = prompt('الصق كود البيانات هنا لاسترجاعها:');
    if (data) {
      setIsLoading(true);
      const success = await Storage.importData(data);
      if (success) {
        alert('تم استرجاع البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } else {
        alert('حدث خطأ في استرجاع البيانات. تأكد من صحة الكود.');
        setIsLoading(false);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      driver,
      logs,
      currentLog,
      isLoading,
      login,
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