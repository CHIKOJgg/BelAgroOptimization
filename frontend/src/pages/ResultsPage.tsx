import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Printer, RefreshCw, Image as ImageIcon, ZoomIn, X, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { WaterfallMarginChart } from '../components/charts/WaterfallMarginChart';
import { CropCalendarGantt } from '../components/charts/CropCalendarGantt';
import { FeedBalanceChart } from '../components/charts/FeedBalanceChart';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CadastralMap } from '../components/map/CadastralMap';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { OptimizationResult, FieldData } from '../types';

export const ResultsPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rotation' | 'feed' | 'livestock' | 'finance' | 'plots'>('rotation');
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
    winter_wheat: { bg: 'bg-emerald-50/90', text: 'text-emerald-900', border: 'border-emerald-200', name: 'Озимая пшеница' },
    spring_wheat: { bg: 'bg-teal-50/90', text: 'text-teal-900', border: 'border-teal-200', name: 'Яровая пшеница' },
    barley: { bg: 'bg-amber-50/90', text: 'text-amber-950', border: 'border-amber-200', name: 'Ячмень' },
    rapeseed: { bg: 'bg-yellow-50/90', text: 'text-yellow-950', border: 'border-yellow-200', name: 'Рапс' },
    potato: { bg: 'bg-orange-50/90', text: 'text-orange-950', border: 'border-orange-200', name: 'Картофель' },
    sugar_beet: { bg: 'bg-pink-50/90', text: 'text-pink-950', border: 'border-pink-200', name: 'Сахарная свёкла' },
    corn_silage: { bg: 'bg-lime-50/90', text: 'text-lime-950', border: 'border-lime-200', name: 'Кукуруза на силос' },
    grass: { bg: 'bg-green-50/90', text: 'text-green-950', border: 'border-green-200', name: 'Многолетние травы' },
    fallow: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', name: 'Чистый пар' },
  };

  const handleExportXlsx = () => {
    if (!results) {
      error('Данные результатов оптимизации ещё не сформированы.');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Севооборот
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

      // Sheet 2: Баланс кормов
      const feedRows = results.feed_allocations.map((f) => ({
        'Год': f.year,
        'Вид корма': f.feed_type,
        'Произведено (ц)': f.produced,
        'Потреблено (ц)': f.consumed,
        'Баланс / Излишек (ц)': f.surplus,
      }));
      const wsFeed = XLSX.utils.json_to_sheet(feedRows);
      XLSX.utils.book_append_sheet(wb, wsFeed, 'DAOS_Баланс_кормов');

      // Sheet 3: Животноводство
      const livestockRows = results.livestock_allocations.map((l) => ({
        'Год': l.year,
        'Вид животных': l.animal_type,
        'Поголовье (голов)': l.heads,
        'Удой лето (кг/гол)': l.milk_yield_summer_kg ?? 0,
        'Удой зима (кг/гол)': l.milk_yield_winter_kg ?? 0,
      }));
      const wsLivestock = XLSX.utils.json_to_sheet(livestockRows);
      XLSX.utils.book_append_sheet(wb, wsLivestock, 'DAOS_Животноводство');

      // Sheet 4: Финансовый план
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
      let csv = '\uFEFF'; // UTF-8 BOM for Excel Cyrillic
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

  // Matrix: Rows = Fields, Columns = Years
  const fieldsList = ['field1', 'field2', 'field3', 'field4', 'field5'];
  const yearsList = [2024, 2025, 2026];

  const getAllocation = (fieldCode: string, year: number) => {
    if (!results) return null;
    return results.crop_allocations.find((a) => a.field_code === fieldCode && a.year === year);
  };

  return (
    <div className="space-y-6">
      {/* Print-only DAOS Official Report Header */}
      <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img src="/daos_logo.png" alt="DAOS" className="h-10 w-auto object-contain" />
          <div className="border-l border-slate-300 pl-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Digital Agro Optimization System</div>
            <div className="text-[10px] text-slate-500">Цифровая система оптимизации сельскохозяйственного производства</div>
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            <span>Производственная программа DAOS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Результаты оптимизации DAOS (Digital Agro Optimization System): оптимальная матрица севооборота, баланс кормов и финансы
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportXlsx}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать / PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('rotation')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'rotation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Матрица севооборота
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'feed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Баланс кормов
        </button>
        <button
          onClick={() => setActiveTab('livestock')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'livestock'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Животноводство
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'finance'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Финансовая сводка
        </button>
        <button
          onClick={() => setActiveTab('plots')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'plots'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Графики модели</span>
        </button>
      </div>

      {/* TABS CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-500 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
          <span>Загрузка аналитических данных...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: CROP ROTATION MATRIX */}
          {activeTab === 'rotation' && (
            <div className="space-y-6">
              {/* Spatial Vector Map of Rotations */}
              <CadastralMap
                fields={fields}
                allocations={results?.crop_allocations}
                initialLayer="crops"
              />

              <Card
                title="Матрица севооборота (Поле × Год)"
                subtitle="Оптимальное распределение культур, валовый сбор и норма внесения NPK"
              >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-3 px-4 w-36">Поле</th>
                    {yearsList.map((y) => (
                      <th key={y} className="py-3 px-4 text-center">
                        {y} Год
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {fieldsList.map((fieldCode) => (
                    <tr key={fieldCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800 bg-slate-50/50">
                        {fieldCode.toUpperCase()}
                      </td>
                      {yearsList.map((year) => {
                        const alloc = getAllocation(fieldCode, year);
                        if (!alloc) return <td key={year} className="py-4 px-4 text-center text-slate-400 font-mono">—</td>;

                        const style = cropColors[alloc.crop_code] || {
                          bg: 'bg-slate-50',
                          text: 'text-slate-800',
                          border: 'border-slate-200',
                          name: alloc.crop_code,
                        };

                        return (
                          <td key={year} className="py-3 px-3">
                            <div className={`p-3 rounded-xl border ${style.bg} ${style.border} space-y-1.5 shadow-2xs`}>
                              <div className={`font-bold text-xs ${style.text} flex items-center justify-between`}>
                                <span>{style.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Площадь:</span>
                                <span className="font-bold text-slate-900">{alloc.area_ha} га</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Сбор:</span>
                                <span className="font-semibold text-slate-800">{alloc.yield_ts ? `${alloc.yield_ts.toLocaleString()} ц` : '—'}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Удобрения (NPK):</span>
                                <span className="font-bold text-emerald-800">{alloc.fert_kg} кг/га</span>
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
          </Card>

          {/* Operational Gantt Calendar */}
          <CropCalendarGantt />
        </div>
      )}

      {/* TAB 2: FEED BALANCE */}
      {activeTab === 'feed' && results && (
        <div className="space-y-6">
          <FeedBalanceChart results={results} />
          <Card
            title="Баланс производства и потребления кормов"
            subtitle="Показатели по видам кормов в центнерах (произведено vs потреблено vs дефицит)"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Год</th>
                    <th className="py-3 px-4">Вид корма</th>
                    <th className="py-3 px-4 text-right">Произведено (ц)</th>
                    <th className="py-3 px-4 text-right">Потреблено (ц)</th>
                    <th className="py-3 px-4 text-right">Сальдо / Баланс (ц)</th>
                    <th className="py-3 px-4 text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.feed_allocations.map((fa, i) => {
                    const isSurplus = fa.surplus >= 0;
                    return (
                      <tr key={i} className="hover:bg-slate-100/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{fa.year}</td>
                        <td className="py-3 px-4 font-medium text-slate-700 capitalize">{fa.feed_type}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {fa.produced.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {fa.consumed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          <span className={isSurplus ? 'text-emerald-700' : 'text-rose-700'}>
                            {isSurplus ? `+${fa.surplus.toLocaleString()}` : fa.surplus.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isSurplus ? (
                            <Badge variant="emerald">Профицит (излишек)</Badge>
                          ) : (
                            <Badge variant="rose">Рыночная закупка</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: LIVESTOCK ALLOCATION */}
      {activeTab === 'livestock' && results && (
        <div className="space-y-6">
          <Card title="Численность стада и продуктивность скота по годам" subtitle="Результаты оптимизации поголовья">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Год</th>
                    <th className="py-3 px-4">Отрасль животноводства</th>
                    <th className="py-3 px-4 text-right">Поголовье (голов)</th>
                    <th className="py-3 px-4 text-right">Надой лето (кг)</th>
                    <th className="py-3 px-4 text-right">Надой зима (кг)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.livestock_allocations.map((la, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{la.year}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize">
                        {la.animal_type === 'cow' ? 'Дойное стадо (Коровы)' : la.animal_type === 'cattle' ? 'КРС (Мясной откорм)' : 'Свинопоголовье'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {Math.round(la.heads)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700">
                        {la.milk_yield_summer_kg ? `${la.milk_yield_summer_kg} кг` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700">
                        {la.milk_yield_winter_kg ? `${la.milk_yield_winter_kg} кг` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: FINANCIAL SUMMARY */}
      {activeTab === 'finance' && results && (
        <div className="space-y-6">
          <WaterfallMarginChart results={results} />
          <Card title="Сводная ведомость финансовых результатов (BYN)" subtitle="Показатели выручки и прибыли">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Год</th>
                    <th className="py-3 px-4 text-right">Прибыль: Растениеводство</th>
                    <th className="py-3 px-4 text-right">Прибыль: Животноводство</th>
                    <th className="py-3 px-4 text-right">Итоговая чистая прибыль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.years.map((y) => (
                    <tr key={y.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{y.year} год</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        {y.crop_profit.toLocaleString()} BYN
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-sky-700">
                        {y.livestock_profit.toLocaleString()} BYN
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-700 text-base">
                        {y.total_profit.toLocaleString()} BYN
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-4 px-4 text-slate-900">ИТОГО ЗА 3 ГОДА</td>
                    <td className="py-4 px-4 text-right text-emerald-700">
                      {results.years.reduce((a, y) => a + y.crop_profit, 0).toLocaleString()} BYN
                    </td>
                    <td className="py-4 px-4 text-right text-sky-700">
                      {results.years.reduce((a, y) => a + y.livestock_profit, 0).toLocaleString()} BYN
                    </td>
                    <td className="py-4 px-4 text-right text-amber-800 text-lg">
                      {results.total_profit_byn.toLocaleString()} BYN
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: MODEL PLOTS */}
      {activeTab === 'plots' && results && (
        <div className="space-y-6">
          <Card
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
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <div
                    className="relative overflow-hidden cursor-pointer bg-slate-50/80 flex items-center justify-center p-2"
                    onClick={() => setSelectedPlot({ src: plot.src, title: plot.title })}
                  >
                    <img
                      src={plot.src}
                      alt={plot.title}
                      className="w-full h-56 object-contain rounded-lg transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                      <span className="bg-white text-slate-900 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xl border border-slate-200">
                        <ZoomIn className="w-4 h-4 text-emerald-700" />
                        Увеличить график
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-sm">{plot.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plot.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
      </>
      )}

      {/* Lightbox Image Modal */}
      {selectedPlot && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPlot(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 relative shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-base font-bold text-slate-900">{selectedPlot.title}</h3>
              <button
                onClick={() => setSelectedPlot(null)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white rounded-xl p-2 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={selectedPlot.src}
                alt={selectedPlot.title}
                className="w-full h-auto object-contain max-h-[75vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
