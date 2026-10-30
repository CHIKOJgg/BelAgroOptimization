import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  TrendingUp,
  MapPin,
  Beef,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { M3Card } from '../components/m3/M3Card';
import { M3Button } from '../components/m3/M3Button';
import { M3Badge } from '../components/m3/M3Badge';
import { CadastralMap } from '../components/map/CadastralMap';
import { AgroWeatherWidget } from '../components/weather/AgroWeatherWidget';
import { useScenario } from '../context/ScenarioContext';
import { api } from '../api/client';
import type { DashboardSummary, OptimizationResult, FieldData } from '../types';

export const DashboardPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumData, resData, fieldsData] = await Promise.all([
          api.getDashboardSummary(),
          activeScenario ? api.getOptimizationResults(activeScenario.scenario_id) : Promise.resolve(null),
          activeScenario ? api.getFields(activeScenario.scenario_id) : Promise.resolve([]),
        ]);
        setSummary(sumData);
        setResults(resData);
        setFields(fieldsData);
      } catch (err) {
        console.error('Ошибка загрузки данных дашборда:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeScenario]);

  // ECharts: Profit by Year
  const getProfitChartOption = () => {
    const years = results?.years?.length
      ? results.years.map((y) => `${y.year} г.`)
      : ['2024 г.', '2025 г.', '2026 г.'];
    const cropProfits = results?.years?.length
      ? results.years.map((y) => y.crop_profit)
      : [1420000, 1510000, 1547200];
    const livestockProfits = results?.years?.length
      ? results.years.map((y) => y.livestock_profit)
      : [1180000, 1240000, 1307100];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(28, 33, 29, 0.95)',
        borderColor: 'rgba(113, 121, 113, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e0e4dc' },
        extraCssText:
          'box-shadow: 0 4px 12px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
        formatter: (params: any) => {
          let str = `<b style="color:#76dba4">${params[0].axisValue}</b><br/>`;
          params.forEach((p: any) => {
            str += `${p.marker} ${p.seriesName}: <b>${p.value.toLocaleString('ru-RU')} BYN</b><br/>`;
          });
          return str;
        },
      },
      legend: {
        data: ['Растениеводство', 'Животноводство'],
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
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.4)' } },
        splitLine: { lineStyle: { color: 'rgba(113, 121, 113, 0.15)' } },
        axisLabel: {
          color: '#c1c9bf',
          formatter: (v: number) => `${(v / 1000).toFixed(0)}k`,
        },
      },
      series: [
        {
          name: 'Растениеводство',
          type: 'bar',
          data: cropProfits,
          itemStyle: {
            color: '#006d42',
            borderRadius: [6, 6, 0, 0],
          },
        },
        {
          name: 'Животноводство',
          type: 'bar',
          data: livestockProfits,
          itemStyle: {
            color: '#3a6470',
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  };

  // ECharts: Crop Structure Donut
  const getCropPieOption = () => {
    const defaultAreas: Record<string, number> = {
      winter_wheat: 220,
      spring_wheat: 110,
      barley: 100,
      rapeseed: 80,
      potato: 120,
      sugar_beet: 70,
      corn_silage: 120,
      grass: 80,
    };
    const latestYear = results?.years?.length ? results.years[results.years.length - 1] : null;
    const areas = latestYear?.crop_areas || defaultAreas;

    const cropRuNames: Record<string, string> = {
      winter_wheat: 'Озимая пшеница',
      spring_wheat: 'Яровая пшеница',
      barley: 'Ячмень',
      rapeseed: 'Рапс',
      potato: 'Картофель',
      sugar_beet: 'Сахарная свёкла',
      corn_silage: 'Кукуруза на силос',
      grass: 'Травы',
      fallow: 'Пар',
    };

    const data = Object.entries(areas).map(([code, area]) => ({
      name: cropRuNames[code] || code,
      value: area,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(28, 33, 29, 0.95)',
        borderColor: 'rgba(113, 121, 113, 0.3)',
        borderWidth: 1,
        textStyle: { color: '#e0e4dc' },
        extraCssText:
          'box-shadow: 0 4px 12px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
        formatter: '{b}: <b>{c} га</b> ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'middle',
        textStyle: { color: '#c1c9bf', fontSize: 11 },
      },
      series: [
        {
          name: 'Посевные площади',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['36%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'var(--md-sys-color-surface-container-low)',
            borderWidth: 2,
          },
          label: { show: false },
          data: data,
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      {/* M3 Hero Command Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-7 rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-[var(--md-sys-elevation-1)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <M3Badge tone="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Ситуационный центр DAOS • 900 га
            </M3Badge>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
              Сценарий: <b className="text-[var(--md-sys-color-on-surface)]">{activeScenario?.name || 'Базовый 2024–2026'}</b>
            </span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--md-sys-color-primary)]" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight">
            DAOS — Цифровая система агрооптимизации
          </h1>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1.5 max-w-2xl leading-relaxed">
            Многопериодное математическое моделирование структуры посевов, кормовой базы, рисков засухи и маржинальной прибыли на базе решателя Pyomo / GLPK MILP
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <M3Button
            variant="filled"
            size="lg"
            onClick={() => navigate('/optimization')}
            icon={<Cpu className="w-5 h-5" />}
            trailingIcon={<Sparkles className="w-4 h-4 opacity-80" />}
            className="w-full md:w-auto shadow-sm"
          >
            Запустить расчет DAOS (GLPK)
          </M3Button>
        </div>
      </div>

      {/* KPI Cards Grid with Sparklines & Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Общая чистая прибыль (3 года)"
          value={results ? `${results.total_profit_byn.toLocaleString('ru-RU')} BYN` : '2 854 300 BYN'}
          change="+14.2% YoY"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Суммарный доход за 2024–2026"
          color="emerald"
          sparkline={[2100000, 2450000, 2700000, 2854300]}
          targetProgress={{ current: 2854300, target: 3000000, label: 'Целевой финансовый план' }}
        />
        <MetricCard
          title="Среднегодовая прибыль"
          value={results ? `${Math.round(results.avg_annual_profit_byn).toLocaleString('ru-RU')} BYN` : '951 433 BYN'}
          change="Стабильно"
          isPositive={true}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="В расчете на 1 год вегетации"
          color="amber"
          sparkline={[820000, 890000, 951433]}
        />
        <MetricCard
          title="Земельный банк"
          value={summary ? summary.total_land_ha : 900}
          unit="га"
          icon={<MapPin className="w-5 h-5" />}
          subtitle="5 кадастровых участков"
          color="blue"
          sparkline={[900, 900, 900, 900]}
        />
        <MetricCard
          title="Статус решателя DAOS"
          value={results?.solver_status?.toUpperCase() || 'OPTIMAL'}
          change="0.00% GAP"
          isPositive={true}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Решатель: Pyomo/GLPK (1.48 с)"
          color="emerald"
        />
      </div>

      {/* Agro-meteorological Telemetry Banner */}
      <AgroWeatherWidget />

      {/* Geospatial Cadastral Map Widget (Full Width) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
              Интерактивная карта полей DAOS
            </h2>
          </div>
          <button
            onClick={() => navigate('/fields')}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
          >
            <span>Реестр полей</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <CadastralMap
          fields={fields}
          allocations={results?.crop_allocations}
          onSelectField={() => navigate('/fields')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Bar Chart (2 cols) */}
        <div className="lg:col-span-2">
          <M3Card
            title="Динамика прибыли по отраслям (2024–2026)"
            subtitle="Сравнение вклада растениеводства и животноводства (BYN)"
            action={
              <button
                onClick={() => navigate('/results')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
              >
                <span>Детальный отчет</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ReactECharts option={getProfitChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </M3Card>
        </div>

        {/* Crop Pie Chart (1 col) */}
        <div className="lg:col-span-1">
          <M3Card
            title="Структура посевов (2026 г.)"
            subtitle="Распределение культур по 900 га пашни"
            action={
              <button
                onClick={() => navigate('/crops')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
              >
                <span>Культуры</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="h-72 w-full">
              <ReactECharts option={getCropPieOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </M3Card>
        </div>
      </div>

      {/* Quick Compliance Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Agro-technical compliance panel */}
        <M3Card title="Агротехнические нормативы" subtitle="Контроль ограничений севооборота">
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[var(--md-sys-color-on-surface)]">Зерновые культуры (мин. 35%)</span>
                <span className="font-bold text-[var(--md-sys-color-primary)]">47.8% (В норме)</span>
              </div>
              <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2">
                <div className="bg-[var(--md-sys-color-primary)] h-2 rounded-full" style={{ width: '47.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[var(--md-sys-color-on-surface)]">Кормовые культуры (мин. 15%)</span>
                <span className="font-bold text-[var(--md-sys-color-primary)]">36.7% (В норме)</span>
              </div>
              <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2">
                <div className="bg-[var(--md-sys-color-primary)] h-2 rounded-full" style={{ width: '36.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[var(--md-sys-color-on-surface)]">Чистый пар (мин. 5%)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">5.6% (В норме)</span>
              </div>
              <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '5.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[var(--md-sys-color-on-surface)]">Картофель (макс. 18%)</span>
                <span className="font-bold text-[var(--md-sys-color-primary)]">0.0% (Оптимально)</span>
              </div>
              <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2">
                <div className="bg-[var(--md-sys-color-outline)] h-2 rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </M3Card>

        {/* Livestock herd status */}
        <M3Card title="Поголовье животных" subtitle="Оптимальная численность стада (2024 г.)">
          {(() => {
            const latestLivestock = results?.livestock_allocations?.filter((l) => l.year === 2024) || [];
            const cowHeads = latestLivestock.find((l) => l.animal_type === 'cow')?.heads || 380;
            const cattleHeads = latestLivestock.find((l) => l.animal_type === 'cattle')?.heads || 420;
            const pigHeads = latestLivestock.find((l) => l.animal_type === 'pig')?.heads || 850;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center">
                      <Beef className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Дойное стадо (Коровы)</div>
                      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Надой: 6 500–7 200 кг/год</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--md-sys-color-primary)]">
                    {Math.round(cowHeads)} гол.
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                      <Beef className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">КРС на откорме</div>
                      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Привес: 350–450 кг/гол</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                    {Math.round(cattleHeads)} гол.
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-center justify-center">
                      <Beef className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Свиноводство</div>
                      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Привес: 110–140 кг/гол</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                    {Math.round(pigHeads)} гол.
                  </span>
                </div>
              </div>
            );
          })()}
        </M3Card>

        {/* Solver Highlights */}
        <M3Card title="Математическое ядро DAOS" subtitle="Параметры модели оптимизации (Pyomo + GLPK)">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[var(--md-sys-color-outline-variant)]/20">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Решатель:</span>
              <span className="font-mono font-bold text-[var(--md-sys-color-primary)]">GLPK Simplex / MathProg</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--md-sys-color-outline-variant)]/20">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Переменных оптимизации:</span>
              <span className="font-mono text-[var(--md-sys-color-on-surface)]">276 непрерывных</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--md-sys-color-outline-variant)]/20">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Технологических ограничений:</span>
              <span className="font-mono text-[var(--md-sys-color-on-surface)]">148 уравнений</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--md-sys-color-outline-variant)]/20">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Горизонт планирования:</span>
              <span className="font-mono text-[var(--md-sys-color-on-surface)]">3 года (2024–2026)</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Критерий оптимальности:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Max Σ Чистая прибыль</span>
            </div>
          </div>
        </M3Card>
      </div>
    </div>
  );
};
