import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Wallet, UserPlus, LogIn, KeyRound, User, CreditCard } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const LoginScreen: React.FC = () => {
  const { login, register } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  // Assuming license number logic is needed but kept simple for now or handled internally as placeholder if not requested explicitly in UI
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 5 || !password) return;

    if (isRegistering) {
        if (!name) return;
        const success = await register(name, mobile, password);
        if (success) {
            setIsRegistering(false);
            setPassword('');
        }
    } else {
        await login(mobile, password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-20 h-20 rounded-[1.5rem] mx-auto flex items-center justify-center mb-4 shadow-xl shadow-slate-900/20 transform -rotate-6">
            <Wallet className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">القبسي - درايف</h1>
          <p className="text-slate-500 font-medium text-sm">
            {isRegistering ? 'إنشاء حساب سائق جديد' : 'تسجيل الدخول لمتابعة يومياتك'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
                   <User size={12} />
                   الاسم بالكامل
                </label>
                <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-800 focus:bg-white transition-all outline-none font-bold"
                placeholder="الاسم ثلاثي"
                required={isRegistering}
                />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 mr-2">رقم الموبايل</label>
            <input 
              type="tel" 
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-800 focus:bg-white transition-all outline-none font-bold text-right tracking-widest"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 mr-2">كلمة المرور</label>
            <div className="relative">
                <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-slate-800 focus:bg-white transition-all outline-none font-bold"
                placeholder="******"
                required
                />
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <Button type="submit" fullWidth size="xl" className="shadow-xl shadow-slate-900/20 rounded-2xl py-4 text-base mt-2">
            {isRegistering ? 'تسجيل حساب جديد' : 'دخول'}
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? (
                <>
                    <LogIn size={16} />
                    لديك حساب بالفعل؟ تسجيل الدخول
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    ليس لديك حساب؟ سجل الآن
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};