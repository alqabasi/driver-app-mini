import React from 'react';
import { useApp } from './contexts/AppContext';
import { LoginScreen } from './features/auth/LoginScreen';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { DailyLogScreen } from './features/daily-log/DailyLogScreen';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isLoading, driver, currentLog } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!driver) {
    return <LoginScreen />;
  }

  if (currentLog) {
    return <DailyLogScreen />;
  }

  return <DashboardScreen />;
};

export default AppContent;
