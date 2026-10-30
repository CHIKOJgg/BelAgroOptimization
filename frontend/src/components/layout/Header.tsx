import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Layers, Menu, Database, Sun, Moon, Sparkles } from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';
import { useTheme } from '../../context/ThemeContext';
import { DatasetManagerModal } from '../datasets/DatasetManagerModal';
import { M3Button, M3IconButton } from '../m3/M3Button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { scenarios, selectedScenarioId, setSelectedScenarioId } = useScenario();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);

  return (
    <header className="h-16 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border-b border-[var(--md-sys-color-outline-variant)]/40 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 shadow-[var(--md-sys-elevation-0)] backdrop-blur-md">
      {/* Left side: Mobile menu & Context & Scenario switcher */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <M3IconButton
            onClick={onMenuToggle}
            variant="standard"
            className="lg:hidden"
            aria-label="Открыть навигацию"
          >
            <Menu className="w-5 h-5" />
          </M3IconButton>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--md-sys-color-outline)] uppercase tracking-wider">
            Хозяйство:
          </span>
          <span className="text-xs font-bold text-[var(--md-sys-color-on-secondary-container)] bg-[var(--md-sys-color-secondary-container)] px-2.5 py-1 rounded-full border border-[var(--md-sys-color-secondary)]/20 shadow-xs">
            СПК «Оптимум-Агро»
          </span>
        </div>

        {/* Scenario Switcher Outlined Pill */}
        <div className="flex items-center gap-2 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-full px-3 py-1.5 shadow-xs">
          <Layers className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium hidden md:inline">
            Сценарий:
          </span>
          <select
            value={selectedScenarioId || ''}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none cursor-pointer pr-1"
          >
            {scenarios.map((s) => (
              <option
                key={s.scenario_id}
                value={s.scenario_id}
                className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]"
              >
                {s.name} {s.is_active ? '★' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Actions, Theme Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dataset Importer */}
        <M3Button
          variant="tonal"
          size="sm"
          onClick={() => setIsDatasetModalOpen(true)}
          icon={<Database className="w-4 h-4" />}
          className="hidden md:inline-flex"
        >
          Датасеты
        </M3Button>

        {/* Quick Launch Solver Button */}
        <M3Button
          variant="filled"
          size="sm"
          onClick={() => navigate('/optimization')}
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
          trailingIcon={<Sparkles className="w-3.5 h-3.5 opacity-80" />}
        >
          <span className="hidden sm:inline">Запуск</span> DAOS
        </M3Button>

        {/* Theme Toggle (M3 Light/Dark) */}
        <M3IconButton
          onClick={toggleTheme}
          variant="tonal"
          size="sm"
          title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          aria-label="Переключить тему оформления"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          )}
        </M3IconButton>

        <div className="h-6 w-px bg-[var(--md-sys-color-outline-variant)]/40 mx-1 hidden sm:block" />

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-xs flex items-center justify-center shadow-xs">
            DA
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)] leading-tight">
              Аналитик DAOS
            </div>
            <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] leading-tight">
              Администратор
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Modal */}
      <DatasetManagerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
      />
    </header>
  );
};
