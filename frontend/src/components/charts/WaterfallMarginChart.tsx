import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { DollarSign } from 'lucide-react';
import { M3Card } from '../m3/M3Card';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';
import type { OptimizationResult } from '../../types';

interface WaterfallMarginChartProps {
  results: OptimizationResult | null;
}

export const WaterfallMarginChart: React.FC<WaterfallMarginChartProps> = ({ results }) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);

  if (!results || !results.years || results.years.length === 0) {
    return null;
  }

  const currentYear = results.years[selectedYearIndex] || results.years[0];

  const cropRev = currentYear.crop_profit * 2.35;
  const livestockRev = currentYear.livestock_profit * 2.1;
  const seedCosts = -(cropRev * 0.18);
  const npkCosts = -(cropRev * 0.22);
  const feedCosts = -(livestockRev * 0.38);
  const machineryFuel = -(cropRev * 0.16 + livestockRev * 0.12);
  const microclimatePenalty =
    currentYear.weather_rain && currentYear.weather_rain < 450 ? -85000 : 0;
  const netMargin = currentYear.total_profit;

  const rawItems = [
    { name: 'Выручка растениеводства', value: Math.round(cropRev), type: 'inflow' },
    { name: 'Выручка животноводства', value: Math.round(livestockRev), type: 'inflow' },
    { name: 'Семена и СЗР', value: Math.round(seedCosts), type: 'cost' },
    { name: 'Минеральные NPK удобрения', value: Math.round(npkCosts), type: 'cost' },
    { name: 'Корма (заготовка и закупка)', value: Math.round(feedCosts), type: 'cost' },
    { name: 'ГСМ и амортизация МТП', value: Math.round(machineryFuel), type: 'cost' },
    ...(microclimatePenalty !== 0
      ? [{ name: 'Климатический штраф (засуха)', value: microclimatePenalty, type: 'cost' }]
      : []),
    { name: 'Чистая операционная прибыль', value: Math.round(netMargin), type: 'total' },
  ];

  const categories: string[] = [];
  const placeholderData: number[] = [];
  const positiveData: (number | string)[] = [];
  const negativeData: (number | string)[] = [];
  const totalData: (number | string)[] = [];

  let running = 0;

  rawItems.forEach((item) => {
    categories.push(item.name);
    if (item.type === 'total') {
      placeholderData.push(0);
      positiveData.push('-');
      negativeData.push('-');
      totalData.push(item.value);
    } else if (item.type === 'inflow') {
      placeholderData.push(running);
      positiveData.push(item.value);
      negativeData.push('-');
      totalData.push('-');
      running += item.value;
    } else {
      const absVal = Math.abs(item.value);
      running -= absVal;
      placeholderData.push(running);
      positiveData.push('-');
      negativeData.push(absVal);
      totalData.push('-');
    }
  });

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
        const item = rawItems[params[0].dataIndex];
        const sign = item.value > 0 && item.type !== 'total' ? '+' : '';
        const color =
          item.type === 'inflow'
            ? '#76dba4'
            : item.type === 'cost'
            ? '#ffb4ab'
            : '#a2cddb';
        return `<div style="font-weight:700; color:#e0e4dc; margin-bottom:4px;">${item.name}</div>
          <div style="color: ${color}; font-weight:800; font-size:13px; font-family: 'JetBrains Mono', monospace;">
            ${sign}${item.value.toLocaleString('ru-RU')} BYN
          </div>`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      axisLabel: {
        color: '#c1c9bf',
        fontSize: 11,
        fontWeight: 500,
        interval: 0,
        rotate: 18,
        formatter: (v: string) => (v.length > 18 ? v.substring(0, 16) + '…' : v),
      },
    },
    yAxis: {
      type: 'value',
      name: 'BYN',
      nameTextStyle: { color: '#c1c9bf', fontSize: 11, fontWeight: 600 },
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      splitLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
      axisLabel: {
        color: '#c1c9bf',
        fontSize: 11,
        formatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'all',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: placeholderData,
      },
      {
        name: 'Доходы (+)',
        type: 'bar',
        stack: 'all',
        data: positiveData,
        itemStyle: {
          color: '#006d42',
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Затраты (-)',
        type: 'bar',
        stack: 'all',
        data: negativeData,
        itemStyle: {
          color: '#ba1a1a',
          borderRadius: [0, 0, 6, 6],
        },
      },
      {
        name: 'Чистая прибыль (=)',
        type: 'bar',
        stack: 'all',
        data: totalData,
        itemStyle: {
          color: '#3a6470',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  return (
    <M3Card variant="elevated" className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[var(--md-sys-color-on-surface)] text-base tracking-tight">
              Водопад формирования маржинальной прибыли (Waterfall Breakdown)
            </h3>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Декомпозиция выручки, прямых технологических затрат и результирующей чистой прибыли
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

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-primary)] shrink-0" />
            <span className="text-[var(--md-sys-color-on-surface)] font-medium">Выручка растениеводства: {Math.round(cropRev).toLocaleString('ru-RU')} BYN</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-primary)] shrink-0" />
            <span className="text-[var(--md-sys-color-on-surface)] font-medium">Выручка животноводства: {Math.round(livestockRev).toLocaleString('ru-RU')} BYN</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[var(--md-sys-color-on-surface-variant)] mr-2">Итоговая чистая маржа:</span>
          <span className="font-extrabold font-['JetBrains_Mono',monospace] text-base text-[var(--md-sys-color-primary)]">
            {netMargin.toLocaleString('ru-RU')} BYN
          </span>
        </div>
      </div>
    </M3Card>
  );
};
