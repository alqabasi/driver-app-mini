import React from 'react';
import { X, Mail, Phone, Code, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface DeveloperInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleWhatsApp = () => {
    // Open WhatsApp with the specific number
    window.open('https://wa.me/201015888272', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:mahros.elqabasy@gmail.com', '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="معلومات المطور"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative z-10">
        
        {/* Header / Cover */}
        <div className="bg-slate-900 h-24 relative overflow-hidden">
           <div className="absolute -right-4 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
           <div className="absolute -left-4 top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
           <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 text-center -mt-12 relative">
           {/* Profile Image */}
           <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mb-4 relative z-10">
              <img 
                src="https://avatars.githubusercontent.com/u/149203319?s=400&v=4" 
                alt="Mahros AL-Qabasy"
                className="w-full h-full object-cover"
              />
           </div>

           <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Mahros AL-Qabasy</h3>
              <p className="text-sm font-bold text-slate-400 flex items-center justify-center gap-1">
                 <Code size={14} />
                 Full Stack Developer
              </p>
           </div>

           <div className="space-y-3">
              <Button 
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1dbf57] text-white rounded-xl py-4 shadow-lg shadow-emerald-100"
              >
                 <Phone size={20} className="ml-2" />
                 <span className="font-bold">تواصل واتساب (+201015888272)</span>
                 <ExternalLink size={14} className="mr-auto opacity-70" />
              </Button>

              <Button 
                onClick={handleEmail}
                variant="secondary"
                className="w-full border-slate-200 hover:bg-slate-50 rounded-xl py-4"
              >
                 <Mail size={20} className="ml-2 text-slate-600" />
                 <span className="font-bold text-slate-700">مراسلة عبر البريد</span>
              </Button>
           </div>

           <div className="mt-6 pt-6 border-t border-gray-50">
              <p className="text-xs text-gray-400 font-medium">
                 تصميم وتطوير بواسطة م. محروس القبسي
                 <br />
                 جميع الحقوق محفوظة © {new Date().getFullYear()}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};