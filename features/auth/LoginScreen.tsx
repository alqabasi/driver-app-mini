import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Wallet, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, importData } = useApp();
  const [loginMobile, setLoginMobile] = useState('');
  const [loginName, setLoginName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMobile.length < 5 || !loginName) return;
    await login(loginName, loginMobile);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-24 h-24 rounded-[1.5rem] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-slate-900/20 transform -rotate-6">
            <Wallet className="text-white w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">القبسي - درايف</h1>
          <p className="text-slate-500 font-medium">سجل يومياتك بسهولة وأمان</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 mr-2">الاسم بالكامل</label>
            <input 
              type="text" 
              value={loginName}
              onChange={e => setLoginName(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-slate-800 focus:bg-white transition-all outline-none font-bold text-lg"
              placeholder="اسمك هنا"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 mr-2">رقم الموبايل</label>
            <input 
              type="tel" 
              value={loginMobile}
              onChange={e => setLoginMobile(e.target.value)}
              className="w-full px-6 py-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-slate-800 focus:bg-white transition-all outline-none font-bold text-lg text-right tracking-widest"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          <Button type="submit" fullWidth size="xl" className="shadow-xl shadow-slate-900/20 rounded-[1.5rem] py-5 text-lg mt-4">
            تسجيل الدخول
          </Button>
        </form>

        <div className="mt-10 text-center">
          <button 
            type="button" 
            onClick={importData}
            className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors flex items-center justify-center gap-2 mx-auto bg-slate-50 px-4 py-2 rounded-full"
          >
            <Upload size={16} />
            استرجاع بيانات سابقة
          </button>
        </div>
      </div>
    </div>
  );
};