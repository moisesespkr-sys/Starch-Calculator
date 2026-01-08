
import React from 'react';
import { Calculator, History } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calc' | 'history';
  setActiveTab: (tab: 'calc' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-[#0A2A66] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Contenedor del Logo con fondo blanco para contraste corporativo */}
          <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center shadow-sm">
             <img 
               src="logo.png" 
               alt="Smurfit Westrock Logo" 
               className="h-10 w-auto object-contain"
               onError={(e) => {
                 // Fallback en caso de que la imagen no cargue
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = '<div class="text-[#0A2A66] font-black text-xl">SW</div>';
               }}
             />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-lg font-bold leading-none tracking-tight">PM7 SPEED SIZER</h1>
            <p className="text-[#00AEEF] text-[10px] font-bold uppercase mt-0.5">Starch Application</p>
          </div>
        </div>

        <nav className="flex gap-2">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
              activeTab === 'calc'
                ? 'bg-[#00AEEF] text-white shadow-md'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <Calculator size={18} />
            <span className="hidden sm:inline uppercase">Calculadora</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
              activeTab === 'history'
                ? 'bg-[#00AEEF] text-white shadow-md'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <History size={18} />
            <span className="hidden sm:inline uppercase">Historial</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
