import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../context/ThemeContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex transition-colors duration-200">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t border-[var(--md-sys-color-outline-variant)]/30 bg-[var(--md-sys-color-surface-container-low)] py-4 px-6 text-xs text-[var(--md-sys-color-on-surface-variant)] transition-colors">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-3">
            <div className="flex items-center gap-3">
              <img
                src={theme === 'dark' ? '/daos_logo_white.png' : '/daos_logo.png'}
                alt="DAOS"
                className="h-6 w-auto object-contain opacity-90"
              />
              <span className="text-[var(--md-sys-color-outline-variant)]">|</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                Digital Agro Optimization System (M3 Edition)
              </span>
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
              <span>Решатель: Pyomo & GLPK 5.x MILP</span>
              <span>•</span>
              <span>Стандарт интерфейса: Material Design 3</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
