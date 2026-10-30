import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { M3Card } from '../m3/M3Card';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';
import type { OptimizationResult } from '../../types';

interface FeedBalanceChartProps {
  results: OptimizationResult | null;
}

const FEED_NAMES: Record<string, string> = {
  silage: 'Силос кукурузный',
  hay: 'Сено злаково-бобовое',
  concentrate: 'Концентраты (комбикорм)',
  pasture: 'Пастбищный зелёный корм',
};

export const FeedBalanceChart: React.FC<FeedBalanceChartProps> = ({ results }) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);

  if (!results || !results.years || results.years.length === 0) {
    return null;
  }

  const currentYear = results.years[selectedYearIndex] || results.years[0];
  const feedBalances = currentYear.feed_balances || {};
  const feedKeys = Object.keys(feedBalances);

  const categories = feedKeys.map((k) => FEED_NAMES[k] || k);
  const producedData = feedKeys.map((k) => feedBalances[k].produced);
  const neededData = feedKeys.map((k) => feedBalances[k].needed);
  const purchasedData = feedKeys.map((k) => feedBalances[k].purchased);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(28, 33, 29, 0.95)',
      borderColor: 'rgba(113, 121, 113, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e0e4dc', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: (params: any) => {
        let str = `<div style="font-weight:700; color:#e0e4dc; margin-bottom:4px;">${params[0].axisValue}</div>`;
        params.forEach((p: any) => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin-top:3px;">
            <span style="color:#c1c9bf; font-size:11px;">${p.marker} ${p.seriesName}:</span>
            <span style="font-weight:700; color:#76dba4; font-size:12px;">${p.value.toLocaleString('ru-RU')} ц</span>
          </div>`;
        });
        return str;
      },
    },
    legend: {
      data: ['Произведено в хозяйстве', 'Потребно стаду', 'Закуплено со стороны'],
      textStyle: { color: '#c1c9bf', fontSize: 11, fontWeight: 500 },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      axisLabel: { color: '#c1c9bf', fontSize: 11, fontWeight: 500 },
    },
    yAxis: {
      type: 'value',
      name: 'Центнеры (ц)',
      nameTextStyle: { color: '#c1c9bf', fontSize: 11, fontWeight: 600 },
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      splitLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
      axisLabel: { color: '#c1c9bf', fontSize: 11 },
    },
    series: [
      {
        name: 'Произведено в хозяйстве',
        type: 'bar',
        data: producedData,
        itemStyle: { color: '#006d42', borderRadius: [6, 6, 0, 0] },
      },
      {
        name: 'Потребно стаду',
        type: 'bar',
        data: neededData,
        itemStyle: { color: '#3a6470', borderRadius: [6, 6, 0, 0] },
      },
      {
        name: 'Закуплено со стороны',
        type: 'bar',
        data: purchasedData,
        itemStyle: { color: '#f59e0b', borderRadius: [6, 6, 0, 0] },
      },
    ],
  };

  return (
    <M3Card variant="elevated" className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[var(--md-sys-color-on-surface)] text-base tracking-tight">
              Баланс кормопроизводства и самообеспеченности стада
            </h3>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Соотношение собственной кормовой базы и коммерческих закупок кормов
          </p>
        </div>

        {/* Year Selector */}
        <M3SegmentedButton
          size="sm"
          options={results.years.map((y, idx) => ({
            value: idx,
            label: `${y.year} год`,
          }))}
          value={selectedYearIndex}
          onChange={(val) => setSelectedYearIndex(Number(val))}
        />
      </div>

      <div className="h-72 w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
      </div>

      {/* Breakdown indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30">
        {feedKeys.map((k) => {
          const item = feedBalances[k];
          const sufficiency = item.needed > 0 ? (item.produced / item.needed) * 100 : 100;
          const isFullySupplied = sufficiency >= 100;

          return (
            <div
              key={k}
              className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[14px] p-3.5 text-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {FEED_NAMES[k] || k}
                </span>
                {isFullySupplied ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>

              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px]">
                  <span>Обеспеченность:</span>
                  <span
                    className={`font-mono font-bold ${
                      isFullySupplied
                        ? 'text-[var(--md-sys-color-primary)]'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {sufficiency.toFixed(0)}%
                  </span>
                </div>
                {item.purchased > 0 && (
                  <div className="flex justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px]">
                    <span>Закупка:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {item.purchased} ц
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </M3Card>
  );
};
