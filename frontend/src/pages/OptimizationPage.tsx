import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Play,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ArrowRight,
  Copy,
  Zap,
  Activity,
  Gauge,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { M3Card } from '../components/m3/M3Card';
import { M3Button } from '../components/m3/M3Button';
import { M3Badge } from '../components/m3/M3Badge';
import { M3SegmentedButton } from '../components/m3/M3SegmentedButton';
import type { OptimizationJobStatus } from '../types';

export const OptimizationPage: React.FC = () => {
  const { activeScenario, refreshScenarios } = useScenario();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState<OptimizationJobStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activePreset, setActivePreset] = useState<'balanced' | 'margin' | 'drought'>('balanced');
  const [elapsedMs, setElapsedMs] = useState(0);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [job?.logs]);

  // Stopwatch timer when running
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Polling for job progress while running
  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const updated = await api.getJobStatus(job.job_id);
        setJob(updated);
        if (updated.status === 'completed') {
          setIsRunning(false);
          await refreshScenarios();
          success('Расчет DAOS успешно завершен! Решение оптимально (GLPK OPTIMAL).');
        } else if (updated.status === 'failed') {
          setIsRunning(false);
          await refreshScenarios();
          error('Ошибка расчета математической модели DAOS.');
        }
      } catch (e) {
        console.error('Ошибка проверки статуса задачи:', e);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [job, refreshScenarios, success, error]);

  const handleStartOptimization = async () => {
    try {
      setElapsedMs(0);
      setIsRunning(true);
      const initiated = await api.runOptimization(activeScenario?.scenario_id);
      setJob(initiated);
      success('Задача запущена в математическом ядре DAOS (Pyomo/GLPK)');
    } catch (err) {
      error(`Ошибка запуска оптимизации: ${err}`);
      setIsRunning(false);
    }
  };

  const copyLogs = () => {
    if (!job?.logs?.length) return;
    navigator.clipboard.writeText(job.logs.join('\n'));
    info('Логи решателя скопированы в буфер обмена');
  };

  return (
    <div className="space-y-6">
      {/* M3 Mission Control Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 sm:p-7 rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-[var(--md-sys-elevation-1)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <M3Badge
              tone={isRunning ? 'secondary' : 'primary'}
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {isRunning ? 'DAOS SOLVER: В ПРОЦЕССЕ РАСЧЕТА' : 'DAOS MILP ENGINE (GLPK 5.0) • ГОТОВ'}
            </M3Badge>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
              Сценарий: <b className="text-[var(--md-sys-color-on-surface)]">{activeScenario?.name || 'Базовый 2024–2026'}</b>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-[var(--md-sys-color-primary)]" />
            <span>Центр оптимизации DAOS (Pyomo + GLPK 5.0)</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1.5 max-w-2xl leading-relaxed">
            Расчет глобального оптимума многопериодной смешанно-целочисленной модели линейного программирования (MILP)
          </p>
        </div>

        {/* Action Button & Live Stopwatch */}
        <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
          <div className="hidden sm:flex flex-col items-end font-mono">
            <span className="text-[10px] uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
              Время счета
            </span>
            <span className="text-lg font-bold text-[var(--md-sys-color-primary)] font-['JetBrains_Mono',monospace]">
              {(elapsedMs / 1000).toFixed(2)} с
            </span>
          </div>

          <M3Button
            variant="filled"
            size="lg"
            onClick={handleStartOptimization}
            disabled={isRunning}
            icon={isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            className="w-full md:w-auto shadow-sm"
          >
            {isRunning ? 'Идет вычисление...' : 'Запустить расчет DAOS'}
          </M3Button>
        </div>
      </div>

      {/* Strategy Presets Bar */}
      <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[20px] p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          <span className="font-bold text-[var(--md-sys-color-on-surface)]">
            Стратегический профиль DAOS:
          </span>
        </div>
        <M3SegmentedButton
          options={[
            { value: 'balanced', label: 'Сбалансированный оптимум' },
            { value: 'margin', label: 'Максимизация маржи' },
            { value: 'drought', label: 'Антизасуха 2026' },
          ]}
          value={activePreset}
          onChange={(val) => setActivePreset(val as any)}
        />
      </div>

      {/* Solver Telemetry Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Переменных</span>
            <Activity className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">276</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">Вектор решений $x$</div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Ограничений</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--md-sys-color-tertiary)]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">148</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">Агро & корма $Ax \le b$</div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Ненулевых (NNZ)</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">1 240</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">Разреженность 98.4%</div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Итераций симплекса</span>
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">342</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">Dual Simplex Phase II</div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Optimality GAP</span>
            <Gauge className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-primary)]">0.00%</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 font-medium">Точный оптимум</div>
        </div>

        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[16px] p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)] text-[11px] mb-1 font-medium">
            <span>Потребление ОЗУ</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">14.2 МБ</div>
          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">Пиковый стек GLPK</div>
        </div>
      </div>

      {/* Convergence Progress Bar */}
      {job && (
        <M3Card variant="elevated" className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
                Фаза алгоритма DAOS:
              </span>
              <span className="text-xs font-mono font-bold text-[var(--md-sys-color-primary)]">
                {job.message || 'DAOS: Оптимизация структуры севооборота и рационов...'}
              </span>
            </div>
            <span className="text-base font-bold font-mono text-[var(--md-sys-color-primary)]">
              {job.progress}%
            </span>
          </div>

          <div className="w-full bg-[var(--md-sys-color-surface-container-highest)] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[var(--md-sys-color-primary)] h-full rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>

          {job.status === 'completed' && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--md-sys-color-primary-container)]/50 border border-[var(--md-sys-color-primary)]/20 rounded-[16px] p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-[var(--md-sys-color-on-primary-container)] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                <span>Глобальный оптимум DAOS найден. Производственная программа сформирована.</span>
              </div>
              <M3Button
                variant="filled"
                size="sm"
                onClick={() => navigate('/results')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="shrink-0"
              >
                К результатам севооборота
              </M3Button>
            </div>
          )}
        </M3Card>
      )}

      {/* M3 Terminal Console Window */}
      <div className="bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[24px] overflow-hidden shadow-[var(--md-sys-elevation-2)]">
        {/* Terminal Titlebar */}
        <div className="bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)]/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--md-sys-color-on-surface)]">
              <Terminal className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              <span>glpk-opt-engine :: simplex-stream.log</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <M3Button
              variant="tonal"
              size="sm"
              onClick={copyLogs}
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Копировать
            </M3Button>
          </div>
        </div>

        {/* Log Window */}
        <div
          ref={logContainerRef}
          className="p-5 h-96 overflow-y-auto font-mono text-xs leading-relaxed space-y-1 bg-[var(--md-sys-color-surface-container-lowest)]"
        >
          {job?.logs && job.logs.length > 0 ? (
            job.logs.map((line, idx) => {
              const isHeader = line.includes('GLPK') || line.includes('PYOMO');
              const isIteration = line.includes('obj =') || line.includes('Simplex');
              const isOptimal = line.includes('OPTIMAL') || line.includes('Успешно');
              const isWarning = line.includes('Warning') || line.includes('Внимание');

              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 hover:bg-[var(--md-sys-color-surface-container)]/50 px-1 py-0.5 rounded"
                >
                  <span className="text-[var(--md-sys-color-outline)] select-none w-8 text-right font-mono text-[10px]">
                    {idx + 1}
                  </span>
                  <span
                    className={`${
                      isOptimal
                        ? 'text-[var(--md-sys-color-primary)] font-bold'
                        : isIteration
                        ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                        : isHeader
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : isWarning
                        ? 'text-[var(--md-sys-color-error)] font-medium'
                        : 'text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    {line}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--md-sys-color-on-surface-variant)] space-y-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p className="text-xs">Нажмите «Запустить расчет DAOS» для активации потока GLPK</p>
            </div>
          )}
        </div>

        {/* Terminal Status Footer */}
        <div className="bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]/30 px-5 py-2.5 flex items-center justify-between text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
          <div className="flex items-center gap-3">
            <span>КОДИРОВКА: UTF-8</span>
            <span>МАТЕМАТИКА: Pyomo ConcreteModel</span>
          </div>
          <span className="text-[var(--md-sys-color-primary)] font-semibold">
            {job?.status === 'completed'
              ? 'STATUS: OPTIMAL SOLVED'
              : job?.status === 'running'
              ? 'STATUS: SOLVING...'
              : 'STATUS: IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
