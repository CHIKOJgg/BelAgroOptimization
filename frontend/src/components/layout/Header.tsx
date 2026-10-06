import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Layers, Bell, Menu, Database } from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';
import { DatasetManagerModal } from '../datasets/DatasetManagerModal';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { scenarios, selectedScenarioId, setSelectedScenarioId } = useScenario();
  const navigate = useNavigate();
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 shadow-xs">
      {/* Left side: Context & Scenario selector */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-slate-700">
          <img src="/daos_emblem.png" alt="DAOS" className="w-6 h-6 object-contain hidden sm:block" />
          <span className="font-bold text-sm hidden sm:inline text-slate-900 tracking-tight">DAOS</span>
          <span className="text-slate-300 hidden md:inline">/</span>
          <span className="text-xs text-slate-600 hidden md:inline font-medium">СПК «Оптимум-Агро»</span>
        </div>

        {/* Scenario Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span className="text-xs text-slate-500 font-medium">Сценарий:</span>
          <select
            value={selectedScenarioId || ''}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer pr-2"
          >
            {scenarios.map((s) => (
              <option key={s.scenario_id} value={s.scenario_id} className="bg-white text-slate-800">
                {s.name} {s.is_active ? '★' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side: Quick actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsDatasetModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
          title="Загрузка Excel/CSV датасетов или выбор эталонных хозяйств в систему DAOS"
        >
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span>Датасеты / Импорт</span>
        </button>

        <button
          onClick={() => navigate('/optimization')}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all hover:scale-102"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Запуск DAOS (GLPK)</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button
          title="Уведомления"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 p-0.5 flex items-center justify-center shadow-xs">
            <img src="/daos_emblem.png" alt="DAOS" className="w-full h-full object-contain" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-800">Аналитик DAOS</div>
            <div className="text-[10px] text-slate-500">Администратор системы</div>
          </div>
        </div>
      </div>

      {/* Dataset Importer & Preset Selector Modal */}
      <DatasetManagerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
      />
    </header>
  );
};
