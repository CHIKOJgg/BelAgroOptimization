import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { CloudSun, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { MetricCard } from '../components/common/MetricCard';
import { useScenario } from '../context/ScenarioContext';
import { api } from '../api/client';
import type { WeatherSummary } from '../types';

export const WeatherPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const [weather, setWeather] = useState<WeatherSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const data = await api.getWeather(activeScenario.scenario_id);
        setWeather(data);
      } catch (err) {
        console.error('Ошибка загрузки погоды:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [activeScenario]);

  const getWeatherChartOption = () => {
    if (!weather.length) return {};
    const years = weather.map((w) => `${w.year} г.`);
    const rainfall = weather.map((w) => w.rain_total);
    const temperatures = weather.map((w) => w.temp_avg);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(28, 33, 29, 0.95)',
        borderColor: 'rgba(113, 121, 113, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e0e4dc' },
        extraCssText:
          'box-shadow: 0 4px 12px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      },
      legend: {
        data: ['Годовые осадки (мм)', 'Средняя температура (°C)'],
        textStyle: { color: '#c1c9bf' },
        top: 0,
      },
      grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: years,
        axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
        axisLabel: { color: '#c1c9bf' },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Осадки (мм)',
          min: 0,
          max: 700,
          axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
          splitLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
          axisLabel: { color: '#38bdf8' },
          nameTextStyle: { color: '#38bdf8' },
        },
        {
          type: 'value',
          name: 'Температура (°C)',
          min: 0,
          max: 15,
          position: 'right',
          axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
          splitLine: { show: false },
          axisLabel: { color: '#f59e0b' },
          nameTextStyle: { color: '#f59e0b' },
        },
      ],
      series: [
        {
          name: 'Годовые осадки (мм)',
          type: 'bar',
          data: rainfall,
          itemStyle: { color: '#3a6470', borderRadius: [6, 6, 0, 0] },
          markLine: {
            silent: true,
            data: [
              {
                yAxis: 480,
                lineStyle: { color: 'var(--md-sys-color-error)', type: 'dashed', width: 2 },
                label: {
                  formatter: 'Порог засухи (<480 мм)',
                  color: 'var(--md-sys-color-error)',
                  fontWeight: 'bold',
                },
              },
            ],
          },
        },
        {
          name: 'Средняя температура (°C)',
          type: 'line',
          yAxisIndex: 1,
          data: temperatures,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { width: 3 },
          symbolSize: 8,
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
          <CloudSun className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          <span>Агрометеорология и климатические риски DAOS</span>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-[var(--md-sys-color-primary)]" />}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
          Климатический модуль DAOS: температурный режим, влагообеспеченность, расчет стрессовых факторов и риск засухи
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="2024 год"
          value="570 мм"
          unit="осадков"
          icon={<Droplets className="w-5 h-5" />}
          subtitle="7.8°C — Благоприятный год"
          color="blue"
        />
        <MetricCard
          title="2025 год"
          value="490 мм"
          unit="осадков"
          icon={<Droplets className="w-5 h-5" />}
          subtitle="8.4°C — Умеренная влажность"
          color="amber"
        />
        <MetricCard
          title="2026 год"
          value="430 мм"
          unit="осадков"
          change="Засуха"
          isPositive={false}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="9.1°C — Засушливый стресс-тест"
          color="rose"
        />
      </div>

      {/* Chart */}
      <M3Card
        title="Динамика осадков и температуры"
        subtitle="Сравнение с критическим порогом засухи DAOS (480 мм)"
      >
        <div className="h-80 w-full">
          <ReactECharts option={getWeatherChartOption()} style={{ height: '100%', width: '100%' }} />
        </div>
      </M3Card>

      {/* Sensitivity table */}
      <M3Card
        title="Чувствительность культур к засухе"
        subtitle="Коэффициенты стресс-тестирования моделей DAOS при дефиците влаги"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
            <div className="font-bold text-[var(--md-sys-color-on-surface)] mb-1">Сахарная свёкла</div>
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              Коэфф. чувствительности: <b className="text-[var(--md-sys-color-error)]">0.60</b>
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Наиболее уязвима к засухе; урожай падает до 40%
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
            <div className="font-bold text-[var(--md-sys-color-on-surface)] mb-1">Картофель</div>
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              Коэфф. чувствительности: <b className="text-[var(--md-sys-color-error)]">0.50</b>
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Высокая потребность в регулярном поливе и осадках
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
            <div className="font-bold text-[var(--md-sys-color-on-surface)] mb-1">Рапс</div>
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              Коэфф. чувствительности: <b className="text-amber-600 dark:text-amber-400">0.45</b>
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Умеренно-высокая зависимость от весенних осадков
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 shadow-xs">
            <div className="font-bold text-[var(--md-sys-color-on-surface)] mb-1">Озимая пшеница & Ячмень</div>
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              Коэфф. чувствительности: <b className="text-[var(--md-sys-color-primary)]">0.30</b>
            </div>
            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-2">
              Устойчивые зерновые за счет ранней вегетации
            </div>
          </div>
        </div>
      </M3Card>
    </div>
  );
};
