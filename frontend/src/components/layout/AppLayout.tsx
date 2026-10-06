import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200/70 bg-white/50 py-3.5 px-4 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
            <div className="flex items-center gap-2.5">
              <img src="/daos_logo.png" alt="DAOS" className="h-5 w-auto object-contain opacity-90" />
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium">Digital Agro Optimization System</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Цифровая система оптимизации сельскохозяйственного производства • Pyomo & GLPK MILP Engine
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
