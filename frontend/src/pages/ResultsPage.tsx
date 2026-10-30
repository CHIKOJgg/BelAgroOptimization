import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Printer,
  RefreshCw,
  Image as ImageIcon,
  ZoomIn,
  FileSpreadsheet,
  Layers,
  Sprout,
  Beef,
  DollarSign,
  Cpu,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WaterfallMarginChart } from '../components/charts/WaterfallMarginChart';
import { CropCalendarGantt } from '../components/charts/CropCalendarGantt';
import { FeedBalanceChart } from '../components/charts/FeedBalanceChart';
import { M3Card } from '../components/m3/M3Card';
import { M3Badge } from '../components/m3/M3Badge';
import { M3Button } from '../components/m3/M3Button';
import { M3Tabs, type M3TabItem } from '../components/m3/M3Tabs';
import { M3Dialog } from '../components/m3/M3Dialog';
import { CadastralMap } from '../components/map/CadastralMap';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { OptimizationResult, FieldData } from '../types';

type ResultsTab = 'rotation' | 'feed' | 'livestock' | 'finance' | 'plots';

export const ResultsPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ResultsTab>('rotation');
  const [selectedPlot, setSelectedPlot] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    async function loadResults() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const [data, fieldsData] = await Promise.all([
          api.getOptimizationResults(activeScenario.scenario_id),
          api.getFields(activeScenario.scenario_id).catch(() => []),
        ]);
        setResults(data);
        setFields(fieldsData);
      } catch (err) {
        console.error('Ошибка загрузки результатов:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [activeScenario]);

  const cropColors: Record<string, { bg: string; text: string; border: string; name: string }> = {
    winter_wheat: { bg: 'bg-[var(--md-sys-color-primary-container)]/40', text: 'text-[var(--md-sys-color-primary)]', border: 'border-[var(--md-sys-color-primary)]/20', name: 'Озимая пшеница' },
    spring_wheat: { bg: 'bg-[var(--md-sys-color-tertiary-container)]/40', text: 'text-[var(--md-sys-color-tertiary)]', border: 'border-[var(--md-sys-color-tertiary)]/20', name: 'Яровая пшеница' },
    barley: { bg: 'bg-amber-500/15', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-500/30', name: 'Ячмень' },
    rapeseed: { bg: 'bg-yellow-500/15', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500/30', name: 'Рапс' },
    potato: { bg: 'bg-orange-500/15', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-500/30', name: 'Картофель' },
    sugar_beet: { bg: 'bg-pink-500/15', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-500/30', name: 'Сахарная свёкла' },
    corn_silage: { bg: 'bg-lime-500/15', text: 'text-lime-800 dark:text-lime-300', border: 'border-lime-500/30', name: 'Кукуруза на силос' },
    grass: { bg: 'bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-500/30', name: 'Многолетние травы' },
    fallow: { bg: 'bg-[var(--md-sys-color-surface-container-high)]', text: 'text-[var(--md-sys-color-on-surface-variant)]', border: 'border-[var(--md-sys-color-outline-variant)]', name: 'Чистый пар' },
  };

  const handleExportXlsx = () => {
    if (!results) {
      error('Данные результатов оптимизации ещё не сформированы.');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      const rotationRows = results.crop_allocations.map((a) => ({
        'Поле': a.field_code.toUpperCase(),
        'Год': a.year,
        'Культура': cropColors[a.crop_code]?.name || a.crop_code,
        'Площадь (га)': a.area_ha,
        'Валовый сбор (ц)': a.yield_ts,
        'Внесение NPK (кг/га)': a.fert_kg,
      }));
      const wsRotation = XLSX.utils.json_to_sheet(rotationRows);
      XLSX.utils.book_append_sheet(wb, wsRotation, 'DAOS_Севооборот');

      const feedRows = results.feed_allocations.map((f) => ({
        'Год': f.year,
        'Вид корма': f.feed_type,
        'Произведено (ц)': f.produced,
        'Потреблено (ц)': f.consumed,
        'Баланс / Излишек (ц)': f.surplus,
      }));
      const wsFeed = XLSX.utils.json_to_sheet(feedRows);
      XLSX.utils.book_append_sheet(wb, wsFeed, 'DAOS_Баланс_кормов');

      const livestockRows = results.livestock_allocations.map((l) => ({
        'Год': l.year,
        'Вид животных': l.animal_type,
        'Поголовье (голов)': l.heads,
        'Удой лето (кг/гол)': l.milk_yield_summer_kg ?? 0,
        'Удой зима (кг/гол)': l.milk_yield_winter_kg ?? 0,
      }));
      const wsLivestock = XLSX.utils.json_to_sheet(livestockRows);
      XLSX.utils.book_append_sheet(wb, wsLivestock, 'DAOS_Животноводство');

      const financeRows: any[] = results.years.map((y) => ({
        'Год': `${y.year} год`,
        'Выручка растениеводства (BYN)': y.crop_profit,
        'Выручка животноводства (BYN)': y.livestock_profit,
        'Чистая прибыль (BYN)': y.total_profit,
      }));
      financeRows.push({
        'Год': 'ИТОГО ЗА 3 ГОДА',
        'Выручка растениеводства (BYN)': results.years.reduce((acc, y) => acc + y.crop_profit, 0),
        'Выручка животноводства (BYN)': results.years.reduce((acc, y) => acc + y.livestock_profit, 0),
        'Чистая прибыль (BYN)': results.total_profit_byn,
      });
      const wsFinance = XLSX.utils.json_to_sheet(financeRows);
      XLSX.utils.book_append_sheet(wb, wsFinance, 'DAOS_Финансовый_план');

      const fileName = `daos_производственный_план_${activeScenario?.name || 'сценарий'}.xlsx`.replace(/[\\/*?:[\]]/g, '_');
      XLSX.writeFile(wb, fileName);

      success('Многостраничный отчёт DAOS Excel (.xlsx) успешно сформирован');
    } catch (err) {
      error(`Ошибка экспорта в Excel: ${err}`);
    }
  };

  const handleExportCsv = () => {
    if (!results) {
      error('Данные результатов оптимизации ещё не сформированы.');
      return;
    }

    try {
      let csv = '\uFEFF';
      csv += '--- DAOS: МАТРИЦА СЕВООБОРОТА (ПОЛЕ × ГОД) ---\r\n';
      csv += 'Поле;Год;Культура;Площадь (га);Валовый сбор (ц);Внесение NPK (кг/га)\r\n';
      results.crop_allocations.forEach((a) => {
        const cropName = cropColors[a.crop_code]?.name || a.crop_code;
        csv += `"${a.field_code.toUpperCase()}";${a.year};"${cropName}";${a.area_ha};${a.yield_ts};${a.fert_kg}\r\n`;
      });
      csv += '\r\n';

      csv += '--- DAOS: БАЛАНС КОРМОВОЙ БАЗЫ ---\r\n';
      csv += 'Год;Вид корма;Произведено (ц);Потреблено (ц);Излишек/Баланс (ц)\r\n';
      results.feed_allocations.forEach((f) => {
        csv += `${f.year};"${f.feed_type}";${f.produced};${f.consumed};${f.surplus}\r\n`;
      });
      csv += '\r\n';

      csv += '--- DAOS: СТРУКТУРА ЖИВОТНОВОДСТВА ---\r\n';
      csv += 'Год;Вид животных;Поголовье (голов);Удой лето (кг/гол);Удой зима (кг/гол)\r\n';
      results.livestock_allocations.forEach((l) => {
        csv += `${l.year};"${l.animal_type}";${l.heads};${l.milk_yield_summer_kg ?? '—'};${l.milk_yield_winter_kg ?? '—'}\r\n`;
      });
      csv += '\r\n';

      csv += '--- DAOS: ФИНАНСОВЫЕ РЕЗУЛЬТАТЫ ---\r\n';
      csv += 'Год;Прибыль растениеводства (BYN);Прибыль животноводства (BYN);Итоговая прибыль (BYN)\r\n';
      results.years.forEach((y) => {
        csv += `${y.year};${y.crop_profit};${y.livestock_profit};${y.total_profit}\r\n`;
      });
      csv += `ИТОГО ЗА ПЕРИОД;;;${results.total_profit_byn}\r\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan_daos_${activeScenario?.scenario_id || 'opt'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('Файл производственного плана DAOS (.CSV) успешно сформирован');
    } catch (err) {
      error(`Ошибка экспорта: ${err}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fieldsList = ['field1', 'field2', 'field3', 'field4', 'field5'];
  const yearsList = [2024, 2025, 2026];

  const getAllocation = (fieldCode: string, year: number) => {
    if (!results) return null;
    return results.crop_allocations.find((a) => a.field_code === fieldCode && a.year === year);
  };

  const renderEmptyState = () => (
    <M3Card variant="outlined" className="p-10 text-center flex flex-col items-center justify-center">
      <div
        className="p-4 rounded-full mb-3 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
        }}
      >
        <Cpu className="w-8 h-8" />
      </div>
      <h3 className="m3-title-medium font-bold mb-1" style={{ color: 'var(--md-sys-color-on-surface)' }}>
        Результаты расчета еще не сформированы
      </h3>
      <p className="m3-body-small max-w-md mb-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
        Для сценария «{activeScenario?.name || 'Текущий'}» еще не проводился расчет математической модели севооборота и баланса кормов.
      </p>
      <M3Button
        variant="filled"
        icon={<Cpu className="w-4 h-4" />}
        onClick={() => navigate('/optimization')}
      >
        Запустить расчет DAOS (GLPK)
      </M3Button>
    </M3Card>
  );

  const tabItems: M3TabItem<ResultsTab>[] = [
    { id: 'rotation', label: 'Матрица севооборота', icon: <Layers className="w-4 h-4" /> },
    { id: 'feed', label: 'Баланс кормов', icon: <Sprout className="w-4 h-4" /> },
    { id: 'livestock', label: 'Животноводство', icon: <Beef className="w-4 h-4" /> },
    { id: 'finance', label: 'Финансовая сводка', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'plots', label: 'Графики модели', icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Print-only DAOS Official Report Header */}
      <div className="hidden print:flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img src="/daos_logo.png" alt="DAOS" className="h-10 w-auto object-contain" />
          <div className="border-l border-[var(--md-sys-color-outline-variant)] pl-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Digital Agro Optimization System
            </div>
            <div className="text-[10px] text-slate-500">
              Цифровая система оптимизации сельскохозяйственного производства (M3 Edition)
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-600">
          <div>Сценарий: <b className="text-slate-900">{activeScenario?.name}</b></div>
          <div>Дата формирования: {new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
            <span>Производственная программа DAOS</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Результаты оптимизации DAOS: оптимальная матрица севооборота, баланс кормов и финансы
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <M3Button
            variant="filled"
            size="sm"
            onClick={handleExportXlsx}
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Excel (.xlsx)
          </M3Button>
          <M3Button
            variant="tonal"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            CSV
          </M3Button>
          <M3Button
            variant="outlined"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Печать
          </M3Button>
        </div>
      </div>

      {/* M3 Tabs Navigation */}
      <M3Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
      />

      {/* TABS CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[var(--md-sys-color-on-surface-variant)] gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--md-sys-color-primary)]" />
          <span className="text-sm">Загрузка аналитических данных...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: CROP ROTATION MATRIX */}
          {activeTab === 'rotation' && (
            <div className="space-y-6">
              <CadastralMap
                fields={fields}
                allocations={results?.crop_allocations}
                initialLayer="crops"
              />

              <M3Card
                title="Матрица севооборота (Поле × Год)"
                subtitle="Оптимальное распределение культур, валовый сбор и норма внесения NPK"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs uppercase text-[var(--md-sys-color-on-surface-variant)]">
                        <th className="py-3 px-4 w-36">Поле</th>
                        {yearsList.map((y) => (
                          <th key={y} className="py-3 px-4 text-center">
                            {y} Год
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20 text-sm">
                      {fieldsList.map((fieldCode) => (
                        <tr key={fieldCode} className="hover:bg-[var(--md-sys-color-surface-container)]/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container)]/30">
                            {fieldCode.toUpperCase()}
                          </td>
                          {yearsList.map((year) => {
                            const alloc = getAllocation(fieldCode, year);
                            if (!alloc)
                              return (
                                <td key={year} className="py-4 px-4 text-center text-[var(--md-sys-color-outline)] font-mono">
                                  —
                                </td>
                              );

                            const style = cropColors[alloc.crop_code] || {
                              bg: 'bg-[var(--md-sys-color-surface-container)]',
                              text: 'text-[var(--md-sys-color-on-surface)]',
                              border: 'border-[var(--md-sys-color-outline-variant)]',
                              name: alloc.crop_code,
                            };

                            return (
                              <td key={year} className="py-3 px-3">
                                <div className={`p-3.5 rounded-[14px] border ${style.bg} ${style.border} space-y-1.5 shadow-2xs`}>
                                  <div className={`font-bold text-xs ${style.text} flex items-center justify-between`}>
                                    <span>{style.name}</span>
                                  </div>
                                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex justify-between">
                                    <span>Площадь:</span>
                                    <span className="font-bold text-[var(--md-sys-color-on-surface)]">{alloc.area_ha} га</span>
                                  </div>
                                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex justify-between">
                                    <span>Сбор:</span>
                                    <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                                      {alloc.yield_ts ? `${alloc.yield_ts.toLocaleString()} ц` : '—'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex justify-between">
                                    <span>Удобрения (NPK):</span>
                                    <span className="font-bold text-[var(--md-sys-color-primary)]">{alloc.fert_kg} кг/га</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </M3Card>

              <CropCalendarGantt />
            </div>
          )}

          {/* TAB 2: FEED BALANCE */}
          {activeTab === 'feed' && (results ? (
            <div className="space-y-6">
              <FeedBalanceChart results={results} />
              <M3Card
                title="Баланс производства и потребления кормов"
                subtitle="Показатели по видам кормов в центнерах (произведено vs потреблено vs дефицит)"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
                      <tr>
                        <th className="py-3 px-4">Год</th>
                        <th className="py-3 px-4">Вид корма</th>
                        <th className="py-3 px-4 text-right">Произведено (ц)</th>
                        <th className="py-3 px-4 text-right">Потреблено (ц)</th>
                        <th className="py-3 px-4 text-right">Сальдо / Баланс (ц)</th>
                        <th className="py-3 px-4 text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
                      {results.feed_allocations.map((fa, i) => {
                        const isSurplus = fa.surplus >= 0;
                        return (
                          <tr key={i} className="hover:bg-[var(--md-sys-color-surface-container)]/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-[var(--md-sys-color-on-surface)]">{fa.year}</td>
                            <td className="py-3 px-4 font-medium text-[var(--md-sys-color-on-surface)] capitalize">{fa.feed_type}</td>
                            <td className="py-3 px-4 text-right font-semibold text-[var(--md-sys-color-primary)] font-mono">
                              {fa.produced.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-[var(--md-sys-color-on-surface-variant)] font-mono">
                              {fa.consumed.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-bold font-mono">
                              <span className={isSurplus ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-error)]'}>
                                {isSurplus ? `+${fa.surplus.toLocaleString()}` : fa.surplus.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isSurplus ? (
                                <M3Badge tone="primary" size="sm">Профицит (излишек)</M3Badge>
                              ) : (
                                <M3Badge tone="error" size="sm">Рыночная закупка</M3Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </M3Card>
            </div>
          ) : renderEmptyState())}

          {/* TAB 3: LIVESTOCK ALLOCATION */}
          {activeTab === 'livestock' && (results ? (
            <div className="space-y-6">
              <M3Card
                title="Численность стада и продуктивность скота по годам"
                subtitle="Результаты оптимизации поголовья"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
                      <tr>
                        <th className="py-3 px-4">Год</th>
                        <th className="py-3 px-4">Отрасль животноводства</th>
                        <th className="py-3 px-4 text-right">Поголовье (голов)</th>
                        <th className="py-3 px-4 text-right">Надой лето (кг)</th>
                        <th className="py-3 px-4 text-right">Надой зима (кг)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
                      {results.livestock_allocations.map((la, i) => (
                        <tr key={i} className="hover:bg-[var(--md-sys-color-surface-container)]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[var(--md-sys-color-on-surface)]">{la.year}</td>
                          <td className="py-3.5 px-4 font-semibold text-[var(--md-sys-color-on-surface)] capitalize">
                            {la.animal_type === 'cow'
                              ? 'Дойное стадо (Коровы)'
                              : la.animal_type === 'cattle'
                              ? 'КРС (Мясной откорм)'
                              : 'Свинопоголовье'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[var(--md-sys-color-primary)] font-mono">
                            {Math.round(la.heads)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[var(--md-sys-color-on-surface-variant)] font-mono">
                            {la.milk_yield_summer_kg ? `${la.milk_yield_summer_kg} кг` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right text-[var(--md-sys-color-on-surface-variant)] font-mono">
                            {la.milk_yield_winter_kg ? `${la.milk_yield_winter_kg} кг` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </M3Card>
            </div>
          ) : renderEmptyState())}

          {/* TAB 4: FINANCIAL SUMMARY */}
          {activeTab === 'finance' && (results ? (
            <div className="space-y-6">
              <WaterfallMarginChart results={results} />
              <M3Card
                title="Сводная ведомость финансовых результатов (BYN)"
                subtitle="Показатели выручки и прибыли"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
                      <tr>
                        <th className="py-3 px-4">Год</th>
                        <th className="py-3 px-4 text-right">Прибыль: Растениеводство</th>
                        <th className="py-3 px-4 text-right">Прибыль: Животноводство</th>
                        <th className="py-3 px-4 text-right">Итоговая чистая прибыль</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
                      {results.years.map((y) => (
                        <tr key={y.year} className="hover:bg-[var(--md-sys-color-surface-container)]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[var(--md-sys-color-on-surface)]">{y.year} год</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-[var(--md-sys-color-primary)] font-mono">
                            {y.crop_profit.toLocaleString()} BYN
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-[var(--md-sys-color-tertiary)] font-mono">
                            {y.livestock_profit.toLocaleString()} BYN
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400 font-mono text-base">
                            {y.total_profit.toLocaleString()} BYN
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-[var(--md-sys-color-surface-container)] font-bold border-t-2 border-[var(--md-sys-color-outline-variant)]">
                        <td className="py-4 px-4 text-[var(--md-sys-color-on-surface)]">ИТОГО ЗА 3 ГОДА</td>
                        <td className="py-4 px-4 text-right text-[var(--md-sys-color-primary)] font-mono">
                          {results.years.reduce((a, y) => a + y.crop_profit, 0).toLocaleString()} BYN
                        </td>
                        <td className="py-4 px-4 text-right text-[var(--md-sys-color-tertiary)] font-mono">
                          {results.years.reduce((a, y) => a + y.livestock_profit, 0).toLocaleString()} BYN
                        </td>
                        <td className="py-4 px-4 text-right text-[var(--md-sys-color-primary)] font-mono text-lg font-extrabold">
                          {results.total_profit_byn.toLocaleString()} BYN
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </M3Card>
            </div>
          ) : renderEmptyState())}

          {/* TAB 5: MODEL PLOTS */}
          {activeTab === 'plots' && (results ? (
            <div className="space-y-6">
              <M3Card
                title="Графические отчеты и диаграммы модели"
                subtitle="Визуализация результатов расчета модели, сгенерированная аналитическим модулем"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      src: '/plots/profit_by_year.png',
                      title: 'Динамика чистой прибыли (2024–2026)',
                      desc: 'Сравнение доходов растениеводства, животноводства и суммарного финансового результата с учетом погодных рисков.',
                    },
                    {
                      src: '/plots/crop_distribution.png',
                      title: 'Структура посевных площадей',
                      desc: 'Распределение культур по 5 полям (900 га) с соблюдением требований предшественников и картофельного лимита.',
                    },
                    {
                      src: '/plots/crop_profit_breakdown.png',
                      title: 'Рентабельность и выручка по культурам',
                      desc: 'Анализ доходности товарных культур с учетом цен реализации и норм внесения минеральных удобрений.',
                    },
                    {
                      src: '/plots/livestock_profit_breakdown.png',
                      title: 'Экономика животноводства',
                      desc: 'Вклад молочного скотоводства, откорма КРС и свиноводства в операционную прибыль хозяйства.',
                    },
                    {
                      src: '/plots/profit_summary_table.png',
                      title: 'Сводная ведомость ключевых метрик',
                      desc: 'Официальная отчетная таблица оптимизатора со сводными балансами и маржинальностью.',
                    },
                  ].map((plot, idx) => (
                    <div
                      key={idx}
                      className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[20px] overflow-hidden hover:border-[var(--md-sys-color-outline)] transition-all group flex flex-col justify-between shadow-xs"
                    >
                      <div
                        className="relative overflow-hidden cursor-pointer bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-center p-3"
                        onClick={() => setSelectedPlot({ src: plot.src, title: plot.title })}
                      >
                        <img
                          src={plot.src}
                          alt={plot.title}
                          className="w-full h-56 object-contain rounded-[12px] transition-transform duration-300 group-hover:scale-102"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                          <span className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-[var(--md-sys-color-outline-variant)]">
                            <ZoomIn className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                            Увеличить график
                          </span>
                        </div>
                      </div>
                      <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]/30">
                        <h3 className="font-bold text-[var(--md-sys-color-on-surface)] text-sm">{plot.title}</h3>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
                          {plot.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </M3Card>
            </div>
          ) : renderEmptyState())}
        </>
      )}

      {/* Lightbox Image Dialog */}
      {selectedPlot && (
        <M3Dialog
          isOpen={!!selectedPlot}
          onClose={() => setSelectedPlot(null)}
          title={selectedPlot.title}
          maxWidth="4xl"
        >
          <div className="flex items-center justify-center p-2">
            <img
              src={selectedPlot.src}
              alt={selectedPlot.title}
              className="w-full h-auto object-contain max-h-[70vh] rounded-[16px]"
            />
          </div>
        </M3Dialog>
      )}
    </div>
  );
};
