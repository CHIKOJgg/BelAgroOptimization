import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { GitCompare, Scale, ArrowUpRight } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { M3Badge } from '../components/m3/M3Badge';
import { useScenario } from '../context/ScenarioContext';

export const ComparisonPage: React.FC = () => {
  const { scenarios } = useScenario();

  const [scenarioA, setScenarioA] = useState<string>(scenarios[0]?.scenario_id || '');
  const [scenarioB, setScenarioB] = useState<string>(scenarios[1]?.scenario_id || scenarios[0]?.scenario_id || '');

  const scA = scenarios.find((s) => s.scenario_id === scenarioA) || scenarios[0];
  const scB = scenarios.find((s) => s.scenario_id === scenarioB) || scenarios[0];

  const profitA = scA?.last_profit || 2854300;
  const profitB = scB?.last_profit || 2510000;
  const profitDelta = profitA - profitB;
  const profitDeltaPct = profitB ? ((profitDelta / profitB) * 100).toFixed(1) : '0';

  // Radar Spider Chart Option (Multicriteria Tradeoff)
  const getRadarChartOption = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(28, 33, 29, 0.95)',
        borderColor: 'rgba(113, 121, 116, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e1e3df', fontSize: 12 },
        extraCssText: 'border-radius: 12px; backdrop-filter: blur(8px); box-shadow: 0 8px 24px rgba(0,0,0,0.18);',
      },
      legend: {
        data: [scA?.name || 'Сценарий A', scB?.name || 'Сценарий B'],
        textStyle: { color: '#859388' },
        bottom: 0,
      },
      radar: {
        indicator: [
          { name: 'Рентабельность (ROI)', max: 100 },
          { name: 'Устойчивость к засухе', max: 100 },
          { name: 'Сохранение плодородия', max: 100 },
          { name: 'Кормовая автономность', max: 100 },
          { name: 'Диверсификация культур', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#859388',
          fontSize: 11,
          fontWeight: 600,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(113, 121, 116, 0.2)',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0, 109, 66, 0.03)', 'rgba(0, 109, 66, 0.08)'],
          },
        },
        axisLine: {
          lineStyle: { color: 'rgba(113, 121, 116, 0.25)' },
        },
      },
      series: [
        {
          name: 'Сравнение профилей устойчивости',
          type: 'radar',
          data: [
            {
              value: [88, 75, 92, 85, 80],
              name: scA?.name || 'Сценарий A',
              symbol: 'circle',
              symbolSize: 4,
              lineStyle: { width: 2.5, color: '#006d42' },
              areaStyle: { color: 'rgba(0, 109, 66, 0.25)' },
              itemStyle: { color: '#006d42' },
            },
            {
              value: [72, 88, 78, 90, 70],
              name: scB?.name || 'Сценарий B',
              symbol: 'rect',
              symbolSize: 4,
              lineStyle: { width: 2.5, color: '#0284c7' },
              areaStyle: { color: 'rgba(2, 132, 199, 0.25)' },
              itemStyle: { color: '#0284c7' },
            },
          ],
        },
      ],
    };
  };

  // Financial Bar Chart
  const getComparisonChartOption = () => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(28, 33, 29, 0.95)',
        borderColor: 'rgba(113, 121, 116, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e1e3df', fontSize: 12 },
        extraCssText: 'border-radius: 12px; backdrop-filter: blur(8px); box-shadow: 0 8px 24px rgba(0,0,0,0.18);',
      },
      legend: {
        data: [scA?.name || 'Сценарий A', scB?.name || 'Сценарий B'],
        textStyle: { color: '#859388' },
        top: 0,
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Общая прибыль', 'Растениеводство', 'Животноводство', 'Расход NPK (т)'],
        axisLine: { lineStyle: { color: 'rgba(113, 121, 116, 0.25)' } },
        axisLabel: { color: '#859388', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(113, 121, 116, 0.25)' } },
        splitLine: { lineStyle: { color: 'rgba(113, 121, 116, 0.12)' } },
        axisLabel: { color: '#859388' },
      },
      series: [
        {
          name: scA?.name || 'Сценарий A',
          type: 'bar',
          data: [2854, 1547, 1307, 135],
          itemStyle: { color: '#006d42', borderRadius: [6, 6, 0, 0] },
        },
        {
          name: scB?.name || 'Сценарий B',
          type: 'bar',
          data: [2510, 1320, 1190, 120],
          itemStyle: { color: '#0284c7', borderRadius: [6, 6, 0, 0] },
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="m3-headline-small flex items-center gap-2.5" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            <div
              className="p-2 rounded-[14px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
            >
              <GitCompare className="w-6 h-6" />
            </div>
            <span>Сравнительный анализ сценариев DAOS</span>
          </h1>
          <p className="m3-body-small mt-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Многокритериальная оценка сценариев развития DAOS: сопоставление маржинальности, климатических рисков и кормовой безопасности
          </p>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <M3Card variant="outlined" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--md-sys-color-primary)' }} />
              <span className="m3-label-medium font-bold uppercase tracking-wider" style={{ color: 'var(--md-sys-color-primary)' }}>
                Сценарий А (Базовый)
              </span>
            </div>
            <M3Badge variant="primary" size="md">
              {profitA.toLocaleString('ru-RU')} BYN
            </M3Badge>
          </div>
          <select
            value={scenarioA}
            onChange={(e) => setScenarioA(e.target.value)}
            className="w-full rounded-[12px] p-2.5 m3-body-medium outline-none border transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {scenarios.map((s) => (
              <option key={s.scenario_id} value={s.scenario_id}>
                {s.name}
              </option>
            ))}
          </select>
        </M3Card>

        <M3Card variant="outlined" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span className="m3-label-medium font-bold uppercase tracking-wider text-sky-600">
                Сценарий Б (Сравниваемый)
              </span>
            </div>
            <M3Badge variant="secondary" size="md">
              {profitB.toLocaleString('ru-RU')} BYN
            </M3Badge>
          </div>
          <select
            value={scenarioB}
            onChange={(e) => setScenarioB(e.target.value)}
            className="w-full rounded-[12px] p-2.5 m3-body-medium outline-none border transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {scenarios.map((s) => (
              <option key={s.scenario_id} value={s.scenario_id}>
                {s.name}
              </option>
            ))}
          </select>
        </M3Card>
      </div>

      {/* Delta Banner in M3 Primary Container */}
      <div
        className="p-5 rounded-[20px] border flex flex-wrap items-center justify-between gap-4 transition-all"
        style={{
          backgroundColor: 'var(--md-sys-color-primary-container)',
          borderColor: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary-container)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="p-3 rounded-[16px] flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-primary)',
            }}
          >
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="m3-label-small uppercase tracking-wider font-bold opacity-80">
              Чистая финансовая дельта (Сценарий А vs Б)
            </div>
            <div className="m3-headline-small font-mono font-bold flex items-center gap-2 mt-0.5">
              <span>+{profitDelta > 0 ? profitDelta.toLocaleString('ru-RU') : 0} BYN</span>
              <span className="m3-label-medium px-2 py-0.5 rounded-full bg-white/20">
                +{profitDeltaPct}%
              </span>
            </div>
          </div>
        </div>

        <div className="m3-body-small max-w-md sm:text-right opacity-90 leading-relaxed">
          Сценарий А обеспечивает экономическое преимущество за счет оптимизации доз NPK и сбалансированной структуры севооборота и рационов КРС.
        </div>
      </div>

      {/* Visual Charts (Radar + Bar Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Trade-off (5 cols) */}
        <div className="lg:col-span-5">
          <M3Card
            title="Многокритериальный агро-радар"
            subtitle="Сопоставление стратегических преимуществ и рисков"
            variant="elevated"
          >
            <div className="h-80 w-full">
              <ReactECharts option={getRadarChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </M3Card>
        </div>

        {/* Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <M3Card
            title="Сравнение ключевых показателей"
            subtitle="Выручка, затраты и ресурсные потребности"
            variant="elevated"
          >
            <div className="h-80 w-full">
              <ReactECharts option={getComparisonChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </M3Card>
        </div>
      </div>

      {/* Delta Table */}
      <M3Card
        title="Сравнительная ведомость показателей"
        subtitle="Построчный анализ различий между сценариями"
        variant="elevated"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left m3-body-medium">
            <thead
              className="border-b m3-label-small uppercase"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              <tr>
                <th className="py-3.5 px-4 font-semibold">Показатель эффективности</th>
                <th className="py-3.5 px-4 font-semibold" style={{ color: 'var(--md-sys-color-primary)' }}>Сценарий А</th>
                <th className="py-3.5 px-4 font-semibold text-sky-600">Сценарий Б</th>
                <th className="py-3.5 px-4 text-right font-semibold">Разница (Дельта)</th>
              </tr>
            </thead>
            <tbody
              className="divide-y font-mono text-xs"
              style={{
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface)',
              }}
            >
              <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 font-sans font-semibold">Итоговая чистая прибыль (BYN)</td>
                <td className="py-3.5 px-4 font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>2 854 300 BYN</td>
                <td className="py-3.5 px-4 font-bold text-sky-600">2 510 000 BYN</td>
                <td className="py-3.5 px-4 text-right font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>
                  <div className="flex items-center justify-end gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+344 300 BYN (+13.7%)</span>
                  </div>
                </td>
              </tr>
              <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 font-sans" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Прибыль растениеводства (BYN)</td>
                <td className="py-3.5 px-4">1 547 200 BYN</td>
                <td className="py-3.5 px-4">1 320 000 BYN</td>
                <td className="py-3.5 px-4 text-right font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>+227 200 BYN</td>
              </tr>
              <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 font-sans" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Прибыль животноводства (BYN)</td>
                <td className="py-3.5 px-4">1 307 100 BYN</td>
                <td className="py-3.5 px-4">1 190 000 BYN</td>
                <td className="py-3.5 px-4 text-right font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>+117 100 BYN</td>
              </tr>
              <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 font-sans" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Расход минеральных удобрений NPK</td>
                <td className="py-3.5 px-4">135 тонн</td>
                <td className="py-3.5 px-4">120 тонн</td>
                <td className="py-3.5 px-4 text-right font-bold text-amber-600">+15 тонн (+12.5%)</td>
              </tr>
              <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <td className="py-3.5 px-4 font-sans" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>Штраф за монокультуру картофеля</td>
                <td className="py-3.5 px-4" style={{ color: 'var(--md-sys-color-primary)' }}>0 BYN</td>
                <td className="py-3.5 px-4 text-red-500">16 000 BYN</td>
                <td className="py-3.5 px-4 text-right font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>-16 000 BYN (Соблюдено)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </M3Card>
    </div>
  );
};
