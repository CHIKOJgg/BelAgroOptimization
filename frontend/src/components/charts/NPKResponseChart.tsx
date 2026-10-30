import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Sprout, Info } from 'lucide-react';
import { M3Card } from '../m3/M3Card';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';
import { M3Badge } from '../m3/M3Badge';

interface CropProfile {
  name: string;
  code: string;
  baseYield: number;
  maxYield: number;
  costPerKgNpk: number;
  cropPricePerTs: number;
  soils: {
    name: string;
    color: string;
    b0: number;
    b1: number;
    b2: number;
    optimalKg: number;
  }[];
}

const CROP_PROFILES: Record<string, CropProfile> = {
  winter_wheat: {
    name: 'Озимая пшеница',
    code: 'winter_wheat',
    baseYield: 48,
    maxYield: 70,
    costPerKgNpk: 2.7,
    cropPricePerTs: 46.0,
    soils: [
      { name: 'Чернозём типичный', color: '#006d42', b0: 38, b1: 0.26, b2: 0.00062, optimalKg: 175 },
      { name: 'Дерново-подзолистый суглинок', color: '#3a6470', b0: 27, b1: 0.22, b2: 0.00058, optimalKg: 155 },
      { name: 'Супесь связная', color: '#8b5000', b0: 19, b1: 0.17, b2: 0.00052, optimalKg: 130 },
    ],
  },
  barley: {
    name: 'Ячмень фуражный',
    code: 'barley',
    baseYield: 40,
    maxYield: 60,
    costPerKgNpk: 2.7,
    cropPricePerTs: 40.0,
    soils: [
      { name: 'Чернозём типичный', color: '#006d42', b0: 32, b1: 0.23, b2: 0.0006, optimalKg: 160 },
      { name: 'Дерново-подзолистый суглинок', color: '#3a6470', b0: 24, b1: 0.2, b2: 0.00056, optimalKg: 145 },
      { name: 'Супесь связная', color: '#8b5000', b0: 17, b1: 0.15, b2: 0.0005, optimalKg: 120 },
    ],
  },
  rapeseed: {
    name: 'Рапс масличный',
    code: 'rapeseed',
    baseYield: 28,
    maxYield: 42,
    costPerKgNpk: 2.7,
    cropPricePerTs: 98.0,
    soils: [
      { name: 'Чернозём типичный', color: '#006d42', b0: 22, b1: 0.16, b2: 0.00042, optimalKg: 165 },
      { name: 'Дерново-подзолистый суглинок', color: '#3a6470', b0: 16, b1: 0.14, b2: 0.0004, optimalKg: 150 },
      { name: 'Супесь связная', color: '#8b5000', b0: 11, b1: 0.11, b2: 0.00038, optimalKg: 125 },
    ],
  },
  corn_silage: {
    name: 'Кукуруза на силос',
    code: 'corn_silage',
    baseYield: 360,
    maxYield: 520,
    costPerKgNpk: 2.7,
    cropPricePerTs: 8.5,
    soils: [
      { name: 'Чернозём типичный', color: '#006d42', b0: 280, b1: 1.85, b2: 0.0042, optimalKg: 200 },
      { name: 'Дерново-подзолистый суглинок', color: '#3a6470', b0: 220, b1: 1.6, b2: 0.004, optimalKg: 180 },
      { name: 'Супесь связная', color: '#8b5000', b0: 160, b1: 1.25, b2: 0.0036, optimalKg: 150 },
    ],
  },
};

const DOSES = [0, 30, 60, 90, 120, 150, 180, 210, 240];

export const NPKResponseChart: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('winter_wheat');
  const crop = CROP_PROFILES[selectedCrop] || CROP_PROFILES.winter_wheat;

  const series = crop.soils.map((s) => {
    const data = DOSES.map((x) => {
      const y = s.b0 + s.b1 * x - s.b2 * Math.pow(x, 2);
      return Number(Math.max(0, y).toFixed(1));
    });

    return {
      name: s.name,
      type: 'line',
      smooth: true,
      data,
      lineStyle: { width: 3, color: s.color },
      itemStyle: { color: s.color },
      markPoint: {
        symbol: 'pin',
        symbolSize: 42,
        data: [
          {
            name: 'Агрономический оптимум',
            coord: [
              s.optimalKg.toString(),
              Number((s.b0 + s.b1 * s.optimalKg - s.b2 * Math.pow(s.optimalKg, 2)).toFixed(1)),
            ],
            value: `${s.optimalKg} кг`,
          },
        ],
      },
    };
  });

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28, 33, 29, 0.95)',
      borderColor: 'rgba(113, 121, 113, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e0e4dc', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: (params: any) => {
        const dose = params[0].axisValue;
        let str = `<div style="font-weight:700; color:#76dba4; margin-bottom:4px;">Доза NPK: ${dose} кг д.в./га</div>`;
        params.forEach((p: any) => {
          str += `<div style="display:flex; justify-content:space-between; gap:16px; margin-top:2px;">
            <span style="color:#c1c9bf">${p.marker} ${p.seriesName}:</span>
            <span style="font-weight:700; color:#e0e4dc">${p.value} ц/га</span>
          </div>`;
        });
        return str;
      },
    },
    legend: {
      data: crop.soils.map((s) => s.name),
      textStyle: { color: '#c1c9bf', fontSize: 11 },
      top: 0,
      icon: 'roundRect',
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      name: 'Доза NPK (кг д.в./га)',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#c1c9bf', fontSize: 11 },
      data: DOSES.map(String),
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      axisLabel: { color: '#c1c9bf', fontSize: 11 },
      splitLine: { show: true, lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
    },
    yAxis: {
      type: 'value',
      name: 'Урожайность (ц/га)',
      nameTextStyle: { color: '#c1c9bf', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
      splitLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
      axisLabel: { color: '#c1c9bf', fontSize: 11 },
    },
    series,
  };

  return (
    <M3Card variant="elevated" className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[var(--md-sys-color-on-surface)] text-base tracking-tight">
              Кривая агрономического отклика урожайности на дозы NPK
            </h3>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Модель Митчерлиха-Бауле с эффектом убывающей отдачи по гранулометрическим типам почв РБ
          </p>
        </div>

        {/* Crop Selector */}
        <M3SegmentedButton
          size="sm"
          options={Object.values(CROP_PROFILES).map((cp) => ({
            value: cp.code,
            label: cp.name,
          }))}
          value={selectedCrop}
          onChange={(val) => setSelectedCrop(String(val))}
        />
      </div>

      <div className="h-72 w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
      </div>

      {/* Soil metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30">
        {crop.soils.map((s) => (
          <div
            key={s.name}
            className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[14px] p-3.5 text-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
              <M3Badge tone="neutral" size="sm">
                Оптимум: {s.optimalKg} кг/га
              </M3Badge>
            </div>
            <div className="mt-2 text-[var(--md-sys-color-on-surface-variant)] text-[11px] leading-relaxed">
              Предельная окупаемость: 1 кг NPK даёт{' '}
              <span className="text-[var(--md-sys-color-primary)] font-bold">
                {((s.b1 - 2 * s.b2 * 120) * 100).toFixed(0)} кг зерна
              </span>{' '}
              при дозе 120 кг/га.
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center gap-2.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container)] p-3 rounded-[12px] border border-[var(--md-sys-color-outline-variant)]/30">
        <Info className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
        <span>
          При превышении точки перегиба (&gt;180 кг/га) маржинальные затраты на удобрения превышают стоимость
          дополнительного прироста зерна (закон убывающего плодородия Либиха-Митчерлиха).
        </span>
      </div>
    </M3Card>
  );
};
