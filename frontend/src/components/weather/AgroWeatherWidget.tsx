import React, { useState } from 'react';
import { CloudRain, Thermometer, Wind, Droplets, Sun, ShieldAlert } from 'lucide-react';
import type { WeatherSummary } from '../../types';
import { M3Badge } from '../m3/M3Badge';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';

interface AgroWeatherWidgetProps {
  weatherData?: WeatherSummary[];
  className?: string;
}

const DEFAULT_WEATHER: Record<
  number,
  {
    temp: number;
    rain: number;
    gtk: number;
    moisturePct: number;
    eto: number;
    gdd: number;
    isDrought: boolean;
    droughtLevel: string;
  }
> = {
  2024: {
    temp: 7.8,
    rain: 650,
    gtk: 1.38,
    moisturePct: 82,
    eto: 3.2,
    gdd: 2450,
    isDrought: false,
    droughtLevel: 'Норма увлажнения',
  },
  2025: {
    temp: 8.5,
    rain: 580,
    gtk: 1.08,
    moisturePct: 67,
    eto: 3.6,
    gdd: 2610,
    isDrought: false,
    droughtLevel: 'Умеренно влажно',
  },
  2026: {
    temp: 9.6,
    rain: 440,
    gtk: 0.68,
    moisturePct: 41,
    eto: 4.8,
    gdd: 2890,
    isDrought: true,
    droughtLevel: 'Критическая засуха',
  },
};

export const AgroWeatherWidget: React.FC<AgroWeatherWidgetProps> = ({
  weatherData: _weatherData = [],
  className = '',
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const current = DEFAULT_WEATHER[selectedYear] || DEFAULT_WEATHER[2024];

  return (
    <div
      className={`bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[20px] p-5 shadow-[var(--md-sys-elevation-1)] relative overflow-hidden transition-all ${className}`}
    >
      {/* Background glow when drought year selected */}
      {current.isDrought && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--md-sys-color-error-container)]/30 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--md-sys-color-outline-variant)]/30">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs ${
              current.isDrought
                ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
            }`}
          >
            {current.isDrought ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
                Агроклиматическая станция DAOS
              </h3>
              {current.isDrought ? (
                <M3Badge tone="error" size="sm">
                  Засуха (&lt;480 мм)
                </M3Badge>
              ) : (
                <M3Badge tone="primary" size="sm">
                  Оптимум
                </M3Badge>
              )}
            </div>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Метеомониторинг и гидротермический коэффициент Селянинова (ГТК)
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <M3SegmentedButton
          size="sm"
          options={[
            { value: 2024, label: '2024' },
            { value: 2025, label: '2025' },
            { value: 2026, label: '2026' },
          ]}
          value={selectedYear}
          onChange={(yr) => setSelectedYear(Number(yr))}
        />
      </div>

      {/* Grid of Weather Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Metric 1: Temp */}
        <div className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
          <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] text-xs mb-1">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <span>Среднегодовая t°</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
            +{current.temp}°C
          </div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            GDD (&gt;10°C): {current.gdd}
          </div>
        </div>

        {/* Metric 2: Precipitation */}
        <div className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
          <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] text-xs mb-1">
            <CloudRain className="w-4 h-4 text-sky-500" />
            <span>Осадки за год</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
            {current.rain} мм
          </div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Испаряемость: {current.eto} мм/день
          </div>
        </div>

        {/* Metric 3: GTK Index */}
        <div className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
          <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] text-xs mb-1">
            <Droplets className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            <span>Индекс ГТК</span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              current.gtk < 1.0
                ? 'text-[var(--md-sys-color-error)]'
                : 'text-[var(--md-sys-color-primary)]'
            }`}
          >
            {current.gtk}
          </div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate">
            {current.droughtLevel}
          </div>
        </div>

        {/* Metric 4: Soil Moisture */}
        <div className="p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
          <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] text-xs mb-1">
            <Wind className="w-4 h-4 text-teal-500" />
            <span>Влажность почвы</span>
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
            {current.moisturePct}%
          </div>
          <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                current.moisturePct < 50
                  ? 'bg-[var(--md-sys-color-error)]'
                  : 'bg-[var(--md-sys-color-primary)]'
              }`}
              style={{ width: `${current.moisturePct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
