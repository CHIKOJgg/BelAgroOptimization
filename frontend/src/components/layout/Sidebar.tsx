import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  Wheat,
  Beef,
  Sprout,
  CloudSun,
  Cpu,
  BarChart3,
  GitCompare,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { activeScenario } = useScenario();

  const mainNav: NavItem[] = [
    { title: 'Главный дашборд', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { title: 'Сценарии', path: '/scenarios', icon: <Layers className="w-4 h-4" /> },
  ];

  const paramsNav: NavItem[] = [
    { title: 'Поля и угодья', path: '/fields', icon: <MapPin className="w-4 h-4" /> },
    { title: 'Культуры', path: '/crops', icon: <Wheat className="w-4 h-4" /> },
    { title: 'Животноводство', path: '/livestock', icon: <Beef className="w-4 h-4" /> },
    { title: 'Кормовая база', path: '/feeds', icon: <Sprout className="w-4 h-4" /> },
    { title: 'Погода и климат', path: '/weather', icon: <CloudSun className="w-4 h-4" /> },
  ];

  const analyticsNav: NavItem[] = [
    { title: 'Запуск решателя', path: '/optimization', icon: <Cpu className="w-4 h-4" /> },
    { title: 'Анализ результатов', path: '/results', icon: <BarChart3 className="w-4 h-4" /> },
    { title: 'Сравнение сценариев', path: '/comparison', icon: <GitCompare className="w-4 h-4" /> },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shadow-xs">
      {/* Brand / Logo */}
      <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-emerald-50/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/10 border border-emerald-500/30">
            <svg className="w-6 h-6 text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">DAOS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">Agro</span>
            </div>
            <div className="text-[10.5px] text-emerald-700 font-semibold leading-tight">Digital Agro Optimization</div>
            <div className="text-[9px] text-slate-400 font-medium leading-tight">Цифровая агросистема</div>
          </div>
        </div>

        {/* Close button for mobile */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Обзор</div>
          <div className="space-y-0.5">
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Параметры модели
          </div>
          <div className="space-y-0.5">
            {paramsNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Оптимизация & Анализ
          </div>
          <div className="space-y-0.5">
            {analyticsNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-r-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2 mb-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-semibold text-slate-700">Активный сценарий DAOS:</span>
        </div>
        <div className="text-xs font-semibold text-emerald-700 truncate" title={activeScenario?.name}>
          {activeScenario?.name || 'Загрузка...'}
        </div>
        <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between pt-1 border-t border-slate-200/60">
          <span>Платформа DAOS</span>
          <span className="text-emerald-700 font-semibold">Pyomo + GLPK</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 z-30">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
          {/* Drawer content */}
          <div className="relative z-10 shadow-2xl">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
