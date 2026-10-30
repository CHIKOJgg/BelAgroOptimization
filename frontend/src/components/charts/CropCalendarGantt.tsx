import React, { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { M3Card } from '../m3/M3Card';
import { M3Chip } from '../m3/M3Chip';

interface CalendarTask {
  cropName: string;
  cropCode: string;
  operation: string;
  category: 'sowing' | 'care' | 'protection' | 'harvest';
  startMonth: number;
  startDecade: 1 | 2 | 3;
  endMonth: number;
  endDecade: 1 | 2 | 3;
  details: string;
}

const TASKS: CalendarTask[] = [
  // Winter wheat
  {
    cropName: 'Озимая пшеница',
    cropCode: 'winter_wheat',
    operation: 'Ранневесенняя азотная подкормка N60',
    category: 'care',
    startMonth: 4,
    startDecade: 1,
    endMonth: 4,
    endDecade: 2,
    details: 'КАС-32 по тало-мерзлой почве',
  },
  {
    cropName: 'Озимая пшеница',
    cropCode: 'winter_wheat',
    operation: 'Фунгицидная защита флагового листа T2',
    category: 'protection',
    startMonth: 5,
    startDecade: 2,
    endMonth: 5,
    endDecade: 3,
    details: 'Протиоконазол + спироксамин',
  },
  {
    cropName: 'Озимая пшеница',
    cropCode: 'winter_wheat',
    operation: 'Прямое комбайнирование зерна',
    category: 'harvest',
    startMonth: 7,
    startDecade: 2,
    endMonth: 8,
    endDecade: 1,
    details: 'Влажность зерна 14-16%',
  },
  {
    cropName: 'Озимая пшеница',
    cropCode: 'winter_wheat',
    operation: 'Осенний сев озимых под урожай N+1',
    category: 'sowing',
    startMonth: 9,
    startDecade: 1,
    endMonth: 9,
    endDecade: 3,
    details: 'Норма высева 4.5 млн всхожих зерен/га',
  },

  // Barley
  {
    cropName: 'Ячмень фуражный',
    cropCode: 'barley',
    operation: 'Ранний сев яровых зерновых',
    category: 'sowing',
    startMonth: 4,
    startDecade: 1,
    endMonth: 4,
    endDecade: 3,
    details: 'Физическая спелость почвы',
  },
  {
    cropName: 'Ячмень фуражный',
    cropCode: 'barley',
    operation: 'Гербицидная обработка в кущение',
    category: 'protection',
    startMonth: 5,
    startDecade: 1,
    endMonth: 5,
    endDecade: 2,
    details: 'Бентазон + 2М-4Х против двудольных',
  },
  {
    cropName: 'Ячмень фуражный',
    cropCode: 'barley',
    operation: 'Уборка ячменя на фураж',
    category: 'harvest',
    startMonth: 7,
    startDecade: 3,
    endMonth: 8,
    endDecade: 2,
    details: 'Кондиционная уборка CLAAS LEXION',
  },

  // Rapeseed
  {
    cropName: 'Рапс озимый/яровой',
    cropCode: 'rapeseed',
    operation: 'Инсектицид против рапсового цветоеда',
    category: 'protection',
    startMonth: 5,
    startDecade: 1,
    endMonth: 5,
    endDecade: 2,
    details: 'Ацетамиприд по бутонизации',
  },
  {
    cropName: 'Рапс озимый/яровой',
    cropCode: 'rapeseed',
    operation: 'Склеивание стручков и десикация',
    category: 'care',
    startMonth: 7,
    startDecade: 1,
    endMonth: 7,
    endDecade: 2,
    details: 'Глифосат + латексный клей',
  },
  {
    cropName: 'Рапс озимый/яровой',
    cropCode: 'rapeseed',
    operation: 'Уборка маслосемян рапса',
    category: 'harvest',
    startMonth: 7,
    startDecade: 2,
    endMonth: 8,
    endDecade: 1,
    details: 'Влажность не выше 8%',
  },
  {
    cropName: 'Рапс озимый/яровой',
    cropCode: 'rapeseed',
    operation: 'Сев озимого рапса',
    category: 'sowing',
    startMonth: 8,
    startDecade: 2,
    endMonth: 8,
    endDecade: 3,
    details: 'Оптимальный срок 15-25 августа',
  },

  // Corn silage
  {
    cropName: 'Кукуруза на силос',
    cropCode: 'corn_silage',
    operation: 'Сев кукурузы в прогретую почву (10°C)',
    category: 'sowing',
    startMonth: 5,
    startDecade: 1,
    endMonth: 5,
    endDecade: 2,
    details: 'Глубина заделки 4-5 см, пунктирный сев',
  },
  {
    cropName: 'Кукуруза на силос',
    cropCode: 'corn_silage',
    operation: 'Междурядная культивация с NPK',
    category: 'care',
    startMonth: 6,
    startDecade: 1,
    endMonth: 6,
    endDecade: 2,
    details: 'В фазе 5-7 листьев',
  },
  {
    cropName: 'Кукуруза на силос',
    cropCode: 'corn_silage',
    operation: 'Уборка на силос с измельчением',
    category: 'harvest',
    startMonth: 9,
    startDecade: 1,
    endMonth: 9,
    endDecade: 3,
    details: 'Восковая спелость зерна, СВ 30-33%',
  },

  // Grasses
  {
    cropName: 'Многолетние травы',
    cropCode: 'grass',
    operation: '1-й укос (сенаж из злаково-бобовых)',
    category: 'harvest',
    startMonth: 5,
    startDecade: 3,
    endMonth: 6,
    endDecade: 1,
    details: 'Фаза бутонизации бобовых',
  },
  {
    cropName: 'Многолетние травы',
    cropCode: 'grass',
    operation: '2-й укос (сено прессованное)',
    category: 'harvest',
    startMonth: 7,
    startDecade: 1,
    endMonth: 7,
    endDecade: 2,
    details: 'Провяливание до 17% влажности',
  },
  {
    cropName: 'Многолетние травы',
    cropCode: 'grass',
    operation: '3-й укос (зеленая масса/отава)',
    category: 'harvest',
    startMonth: 8,
    startDecade: 3,
    endMonth: 9,
    endDecade: 1,
    details: 'Подготовка к перезимовке',
  },
];

const MONTHS = [
  { num: 4, name: 'Апрель' },
  { num: 5, name: 'Май' },
  { num: 6, name: 'Июнь' },
  { num: 7, name: 'Июль' },
  { num: 8, name: 'Август' },
  { num: 9, name: 'Сентябрь' },
  { num: 10, name: 'Октябрь' },
];

const CATEGORY_STYLES = {
  sowing: {
    label: 'Сев / Посадка',
    bg: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/30',
  },
  care: {
    label: 'Подкормка / Уход',
    bg: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30',
  },
  protection: {
    label: 'Защита СЗР',
    bg: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border-[var(--md-sys-color-tertiary)]/30',
  },
  harvest: {
    label: 'Уборка / Укос',
    bg: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-500/30',
  },
};

export const CropCalendarGantt: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hoveredTask, setHoveredTask] = useState<CalendarTask | null>(null);

  const totalDecades = 21;

  const getDecadeIndex = (month: number, decade: number) => {
    return (month - 4) * 3 + (decade - 1);
  };

  const filteredTasks =
    filterCategory === 'all' ? TASKS : TASKS.filter((t) => t.category === filterCategory);

  return (
    <M3Card variant="elevated" className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[var(--md-sys-color-on-surface)] text-base tracking-tight">
              Операционный календарь полевых агроработ (Гант-план)
            </h3>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Сроки сева, химических обработок, подкормок и уборочных кампаний по декадам вегетационного сезона
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <M3Chip
            label="Все работы"
            selected={filterCategory === 'all'}
            onClick={() => setFilterCategory('all')}
          />
          {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
            <M3Chip
              key={key}
              label={style.label}
              selected={filterCategory === key}
              onClick={() => setFilterCategory(key)}
            />
          ))}
        </div>
      </div>

      {/* Gantt Timeline View */}
      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          {/* Timeline Header: Months & Decades */}
          <div className="grid grid-cols-[230px_1fr] border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2.5 mb-2">
            <div className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider pl-2">
              Агрооперация / Культура
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {MONTHS.map((m) => (
                <div key={m.num} className="border-l border-[var(--md-sys-color-outline-variant)]/30 px-1">
                  <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{m.name}</div>
                  <div className="grid grid-cols-3 text-[10px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5 font-mono">
                    <span>I</span>
                    <span>II</span>
                    <span>III</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="space-y-1.5">
            {filteredTasks.map((t, idx) => {
              const startIdx = getDecadeIndex(t.startMonth, t.startDecade);
              const endIdx = getDecadeIndex(t.endMonth, t.endDecade);
              const duration = Math.max(1, endIdx - startIdx + 1);

              const leftPct = (startIdx / totalDecades) * 100;
              const widthPct = (duration / totalDecades) * 100;
              const catStyle = CATEGORY_STYLES[t.category];

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredTask(t)}
                  onMouseLeave={() => setHoveredTask(null)}
                  className="grid grid-cols-[230px_1fr] items-center hover:bg-[var(--md-sys-color-surface-container)] rounded-[12px] p-1.5 transition-colors cursor-pointer"
                >
                  <div className="pr-2 truncate">
                    <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                      {t.operation}
                    </div>
                    <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                      {t.cropName}
                    </div>
                  </div>

                  <div className="relative h-7 bg-[var(--md-sys-color-surface-container)] rounded-[8px] border border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden flex items-center">
                    <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                      {MONTHS.map((m) => (
                        <div
                          key={m.num}
                          className="border-r border-[var(--md-sys-color-outline-variant)]/20 h-full"
                        />
                      ))}
                    </div>

                    <div
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className={`absolute h-5.5 rounded-full px-2.5 flex items-center border text-[10px] font-bold shadow-xs transition-all ${catStyle.bg}`}
                    >
                      <span className="truncate">{t.operation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Details Footer / Legend */}
      <div className="mt-5 pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        {hoveredTask ? (
          <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
            <Sparkles className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
            <span className="font-bold">{hoveredTask.cropName}:</span>
            <span className="text-[var(--md-sys-color-on-surface-variant)]">{hoveredTask.details}</span>
          </div>
        ) : (
          <div className="text-[var(--md-sys-color-on-surface-variant)] text-[11px]">
            Наведите курсор на операцию для просмотра агротехнологических нормативов
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] self-end sm:self-auto flex-wrap">
          {Object.values(CATEGORY_STYLES).map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full border ${s.bg}`} />
              <span className="text-[var(--md-sys-color-on-surface)] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </M3Card>
  );
};
