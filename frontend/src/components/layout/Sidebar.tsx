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
  X,
  Sparkles,
} from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';
import { useTheme } from '../../context/ThemeContext';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { activeScenario, scenarios } = useScenario();
  const { theme } = useTheme();

  const mainNav: NavItem[] = [
    { title: 'Главный дашборд', path: '/', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    {
      title: 'Сценарии',
      path: '/scenarios',
      icon: <Layers className="w-5 h-5 shrink-0" />,
      badge: scenarios.length > 0 ? String(scenarios.length) : undefined,
    },
  ];

  const paramsNav: NavItem[] = [
    { title: 'Поля и угодья', path: '/fields', icon: <MapPin className="w-5 h-5 shrink-0" /> },
    { title: 'Культуры (севооборот)', path: '/crops', icon: <Wheat className="w-5 h-5 shrink-0" /> },
    { title: 'Животноводство', path: '/livestock', icon: <Beef className="w-5 h-5 shrink-0" /> },
    { title: 'Кормовая база', path: '/feeds', icon: <Sprout className="w-5 h-5 shrink-0" /> },
    { title: 'Погода и климат', path: '/weather', icon: <CloudSun className="w-5 h-5 shrink-0" /> },
  ];

  const analyticsNav: NavItem[] = [
    {
      title: 'Запуск решателя',
      path: '/optimization',
      icon: <Cpu className="w-5 h-5 shrink-0" />,
      badge: 'GLPK',
    },
    { title: 'Анализ результатов', path: '/results', icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
    { title: 'Сравнение сценариев', path: '/comparison', icon: <GitCompare className="w-5 h-5 shrink-0" /> },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      <div className="px-5 py-2 text-[11px] font-bold text-[var(--md-sys-color-outline)] uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `group relative flex items-center justify-between h-12 px-4 rounded-full text-sm font-medium tracking-tight transition-all duration-200 select-none m3-state-layer ${
                isActive
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
              }`
            }
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="transition-transform group-hover:scale-110 duration-200">
                {item.icon}
              </span>
              <span className="truncate">{item.title}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/40 shrink-0">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );

  const sidebarContent = (
    <aside className="w-72 bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline-variant)]/40 flex flex-col h-screen select-none shadow-[var(--md-sys-elevation-0)]">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary-container)] flex items-center justify-center p-1.5 shadow-xs shrink-0">
            <img
              src={theme === 'dark' ? '/daos_emblem_white.png' : '/daos_emblem.png'}
              alt="DAOS Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[var(--md-sys-color-on-surface)] font-['Plus_Jakarta_Sans']">
                DAOS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] leading-none">
                M3
              </span>
            </div>
            <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-medium truncate">
              Digital Agro Optimization
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
            aria-label="Закрыть меню"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Scrollable */}
      <div className="flex-1 overflow-y-auto py-3">
        {renderNavGroup('Обзор', mainNav)}
        {renderNavGroup('Параметры агромодели', paramsNav)}
        {renderNavGroup('Оптимизация & Аналитика', analyticsNav)}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]/30 bg-[var(--md-sys-color-surface-container)]">
        <div className="p-3 rounded-[16px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">
                Активный сценарий
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
          </div>
          <div
            className="text-xs font-semibold text-[var(--md-sys-color-primary)] truncate"
            title={activeScenario?.name}
          >
            {activeScenario?.name || 'Загрузка...'}
          </div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-1.5 flex justify-between items-center pt-1.5 border-t border-[var(--md-sys-color-outline-variant)]/20">
            <span>Математическое ядро</span>
            <span className="font-bold text-[var(--md-sys-color-on-surface)]">Pyomo • GLPK</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Drawer */}
      <div className="hidden lg:block fixed left-0 top-0 z-30">{sidebarContent}</div>

      {/* Mobile Drawer Modal */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={onClose}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-[var(--md-sys-elevation-4)]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
