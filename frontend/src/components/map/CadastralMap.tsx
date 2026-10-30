import React, { useState } from 'react';
import { Layers, Eye, MapPin } from 'lucide-react';
import type { FieldData, CropAllocation } from '../../types';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';
import { M3Badge } from '../m3/M3Badge';

export type MapLayer = 'crops' | 'fertility' | 'npk' | 'soil';

interface CadastralMapProps {
  fields: FieldData[];
  allocations?: CropAllocation[];
  selectedFieldId?: string | null;
  onSelectField?: (fieldCode: string) => void;
  initialLayer?: MapLayer;
  initialYear?: number;
  compact?: boolean;
}

interface FieldGeometry {
  code: string;
  name: string;
  path: string;
  center: { x: number; y: number };
}

const FIELD_GEOMETRIES: Record<string, FieldGeometry> = {
  field1: {
    code: 'field1',
    name: 'Участок №1 «Северный»',
    path: 'M 60,60 L 320,50 L 300,210 L 80,200 Z',
    center: { x: 190, y: 125 },
  },
  field2: {
    code: 'field2',
    name: 'Участок №2 «Восточный массив»',
    path: 'M 345,50 L 730,70 L 710,230 L 330,220 Z',
    center: { x: 530, y: 140 },
  },
  field3: {
    code: 'field3',
    name: 'Участок №3 «Приречный»',
    path: 'M 60,250 L 260,240 L 240,430 L 80,440 L 50,340 Z',
    center: { x: 150, y: 340 },
  },
  field4: {
    code: 'field4',
    name: 'Участок №4 «Центральный»',
    path: 'M 285,250 L 490,260 L 470,430 L 265,420 Z',
    center: { x: 380, y: 340 },
  },
  field5: {
    code: 'field5',
    name: 'Участок №5 «Южная равнина»',
    path: 'M 515,260 L 740,250 L 730,440 L 495,435 Z',
    center: { x: 620, y: 345 },
  },
};

const CROP_COLOR_MAP: Record<string, { fill: string; stroke: string; label: string }> = {
  winter_wheat: { fill: '#006d42', stroke: '#92f7be', label: 'Озимая пшеница' },
  spring_wheat: { fill: '#006874', stroke: '#97f0ff', label: 'Яровая пшеница' },
  barley: { fill: '#8b5000', stroke: '#ffdcbe', label: 'Ячмень' },
  rapeseed: { fill: '#735c00', stroke: '#ffe082', label: 'Озимый рапс' },
  potato: { fill: '#9c4314', stroke: '#ffdbd0', label: 'Картофель' },
  sugar_beet: { fill: '#991b5b', stroke: '#ffd8e6', label: 'Сахарная свёкла' },
  corn_silage: { fill: '#4a6700', stroke: '#cdfa66', label: 'Кукуруза на силос' },
  grass: { fill: '#1d6b38', stroke: '#99f6b1', label: 'Многолетние травы' },
  fallow: { fill: '#414942', stroke: '#8b938a', label: 'Чистый пар' },
};

export const CadastralMap: React.FC<CadastralMapProps> = ({
  fields,
  allocations = [],
  selectedFieldId,
  onSelectField,
  initialLayer = 'crops',
  initialYear = 2024,
  compact = false,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer);
  const [activeYear, setActiveYear] = useState<number>(initialYear);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const getAlloc = (fieldCode: string, year: number) => {
    return allocations.find(
      (a) => a.field_code.toLowerCase() === fieldCode.toLowerCase() && a.year === year
    );
  };

  const getFieldAppearance = (fieldCode: string) => {
    const field = fields.find((f) => f.code.toLowerCase() === fieldCode.toLowerCase());
    const alloc = getAlloc(fieldCode, activeYear);

    if (activeLayer === 'crops') {
      if (alloc && CROP_COLOR_MAP[alloc.crop_code]) {
        return CROP_COLOR_MAP[alloc.crop_code];
      }
      return { fill: '#2d322d', stroke: '#717971', label: 'Не засеяно' };
    }

    if (activeLayer === 'fertility') {
      const fertility = field?.soil_fertility ?? 1.0;
      if (fertility >= 1.15) {
        return { fill: '#006d42', stroke: '#76dba4', label: `Высокое (${fertility})` };
      }
      if (fertility >= 1.0) {
        return { fill: '#006874', stroke: '#4fd8eb', label: `Среднее (${fertility})` };
      }
      return { fill: '#944b00', stroke: '#ffb784', label: `Пониженное (${fertility})` };
    }

    if (activeLayer === 'npk') {
      const fertKg = alloc?.fert_kg ?? 120;
      if (fertKg > 150) {
        return { fill: '#6e41a6', stroke: '#d9b9ff', label: `${fertKg} кг/га (Интенсивно)` };
      }
      if (fertKg >= 100) {
        return { fill: '#3a6470', stroke: '#a2cddb', label: `${fertKg} кг/га (Оптимум)` };
      }
      return { fill: '#006874', stroke: '#97f0ff', label: `${fertKg} кг/га (Базовый)` };
    }

    if (activeLayer === 'soil') {
      const soil = field?.soil_type || 'суглинок';
      if (soil === 'чернозём') {
        return { fill: '#006d42', stroke: '#92f7be', label: 'Чернозём' };
      }
      if (soil === 'суглинок') {
        return { fill: '#3a6470', stroke: '#bdeaf7', label: 'Суглинок' };
      }
      return { fill: '#8b5000', stroke: '#ffdcbe', label: 'Супесь' };
    }

    return { fill: '#313632', stroke: '#717971', label: 'Поле' };
  };

  const hoveredFieldData = hoveredField
    ? fields.find((f) => f.code.toLowerCase() === hoveredField.toLowerCase())
    : null;
  const hoveredAlloc = hoveredField ? getAlloc(hoveredField, activeYear) : null;

  return (
    <div className="relative bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] rounded-[20px] border border-[var(--md-sys-color-outline-variant)]/40 overflow-hidden shadow-[var(--md-sys-elevation-1)]">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-[var(--md-sys-color-surface-container)] border-b border-[var(--md-sys-color-outline-variant)]/40 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
                Кадастровая карта угодий DAOS
              </span>
              <M3Badge tone="primary" size="sm">
                900 га
              </M3Badge>
            </div>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono hidden sm:block">
              GIS: 53°54′12″N 27°34′30″E • Центральный кластер
            </p>
          </div>
        </div>

        {/* Controls: Layer & Year Segmented Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <M3SegmentedButton
            size="sm"
            options={[
              { value: 'crops', label: 'Севооборот' },
              { value: 'fertility', label: 'Плодородие' },
              { value: 'npk', label: 'NPK' },
              { value: 'soil', label: 'Почва' },
            ]}
            value={activeLayer}
            onChange={(val) => setActiveLayer(val as MapLayer)}
          />

          {(activeLayer === 'crops' || activeLayer === 'npk') && (
            <M3SegmentedButton
              size="sm"
              options={[
                { value: 2024, label: '2024' },
                { value: 2025, label: '2025' },
                { value: 2026, label: '2026' },
              ]}
              value={activeYear}
              onChange={(yr) => setActiveYear(Number(yr))}
            />
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className={`relative w-full ${
          compact ? 'h-64 sm:h-72' : 'h-80 sm:h-96 md:h-[420px]'
        } bg-[var(--md-sys-color-surface-container)] flex items-center justify-center select-none overflow-hidden transition-colors`}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox="0 0 800 480"
          className="w-full h-full object-contain filter drop-shadow-md"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="m3-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <pattern
              id="diagonalHatch"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Drainage canal */}
          <path
            d="M 30,225 Q 280,235 480,245 T 780,240"
            fill="none"
            stroke="#0284c7"
            strokeWidth="5"
            strokeOpacity="0.4"
            strokeDasharray="8,4"
          />
          <text x="680" y="235" fill="#38bdf8" fontSize="9" opacity="0.7" fontFamily="monospace">
            Мелиоративный канал
          </text>

          {/* Roadways */}
          <path
            d="M 40,50 L 760,50 M 325,40 L 325,450 M 500,40 L 500,450 M 40,445 L 760,445"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.2"
            strokeDasharray="4,6"
          />

          {/* Farm Central Hub */}
          <g transform="translate(400, 240)">
            <circle r="16" fill="var(--md-sys-color-surface-container-highest)" stroke="var(--md-sys-color-primary)" strokeWidth="2.5" />
            <circle
              r="22"
              fill="none"
              stroke="var(--md-sys-color-primary)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              className="animate-spin"
              style={{ animationDuration: '24s' }}
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="var(--md-sys-color-primary)"
              fontSize="10"
              fontWeight="bold"
            >
              HQ
            </text>
            <text
              x="0"
              y="26"
              textAnchor="middle"
              fill="var(--md-sys-color-on-surface-variant)"
              fontSize="8"
              fontWeight="bold"
            >
              Агрогородок / МТФ
            </text>
          </g>

          {/* FIELD PARCELS */}
          {Object.entries(FIELD_GEOMETRIES).map(([fieldCode, geo]) => {
            const field = fields.find((f) => f.code.toLowerCase() === fieldCode.toLowerCase());
            const isHovered = hoveredField === fieldCode;
            const isSelected = selectedFieldId?.toLowerCase() === fieldCode.toLowerCase();
            const alloc = getAlloc(fieldCode, activeYear);
            const appearance = getFieldAppearance(fieldCode);

            return (
              <g
                key={fieldCode}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredField(fieldCode)}
                onMouseLeave={() => setHoveredField(null)}
                onClick={() => onSelectField?.(fieldCode)}
              >
                {/* Field Polygon */}
                <path
                  d={geo.path}
                  fill={appearance.fill}
                  fillOpacity={isHovered ? 0.95 : isSelected ? 0.9 : 0.8}
                  stroke={isSelected ? 'var(--md-sys-color-primary)' : isHovered ? '#ffffff' : appearance.stroke}
                  strokeWidth={isSelected ? 4 : isHovered ? 3 : 1.5}
                  strokeDasharray={isSelected ? '6,3' : 'none'}
                  filter={isSelected ? 'url(#m3-glow)' : undefined}
                />

                <path d={geo.path} fill="url(#diagonalHatch)" pointerEvents="none" />

                {/* Floating M3 Parcel Card Badge */}
                <g transform={`translate(${geo.center.x}, ${geo.center.y})`} pointerEvents="none">
                  <rect
                    x="-62"
                    y="-30"
                    width="124"
                    height="60"
                    rx="12"
                    fill="var(--md-sys-color-surface-container-high)"
                    stroke={
                      isSelected
                        ? 'var(--md-sys-color-primary)'
                        : isHovered
                        ? 'var(--md-sys-color-outline)'
                        : 'var(--md-sys-color-outline-variant)'
                    }
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.25))"
                  />

                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="var(--md-sys-color-on-surface)"
                    fontSize="12"
                    fontWeight="800"
                    letterSpacing="0.05em"
                    fontFamily="monospace"
                  >
                    {fieldCode.toUpperCase()}
                  </text>

                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="var(--md-sys-color-on-surface-variant)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {field?.area_ha || 0} га
                  </text>

                  <rect
                    x="-52"
                    y="10"
                    width="104"
                    height="16"
                    rx="8"
                    fill={appearance.fill}
                  />
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {activeLayer === 'crops'
                      ? appearance.label
                      : activeLayer === 'fertility'
                      ? `Бонитет: ${field?.soil_fertility ?? 1.0}`
                      : activeLayer === 'npk'
                      ? `${alloc?.fert_kg ?? 120} кг NPK`
                      : field?.soil_type || 'суглинок'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Compass */}
          <g transform="translate(740, 430)" opacity="0.7">
            <circle r="16" fill="var(--md-sys-color-surface-container-highest)" stroke="var(--md-sys-color-outline)" strokeWidth="1" />
            <path d="M 0,-14 L 4,0 L 0,14 L -4,0 Z" fill="var(--md-sys-color-outline)" />
            <path d="M 0,-14 L 4,0 L 0,0 Z" fill="var(--md-sys-color-error)" />
            <text x="0" y="-17" textAnchor="middle" fill="var(--md-sys-color-error)" fontSize="8" fontWeight="bold">
              N
            </text>
          </g>

          {/* Scale */}
          <g transform="translate(60, 450)" opacity="0.8">
            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--md-sys-color-outline)" strokeWidth="2" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--md-sys-color-outline)" strokeWidth="2" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--md-sys-color-outline)" strokeWidth="2" />
            <text x="30" y="-5" textAnchor="middle" fill="var(--md-sys-color-on-surface-variant)" fontSize="8" fontFamily="monospace">
              500 м
            </text>
          </g>
        </svg>

        {/* Hover Inspector Card */}
        {hoveredFieldData && (
          <div className="absolute top-3 left-3 pointer-events-none bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[16px] p-3.5 shadow-[var(--md-sys-elevation-3)] backdrop-blur-md max-w-xs text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100 z-10">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2">
              <span className="font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                {FIELD_GEOMETRIES[hoveredFieldData.code]?.name || hoveredFieldData.code.toUpperCase()}
              </span>
              <M3Badge tone="primary" size="sm">
                {hoveredFieldData.area_ha} га
              </M3Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Тип почвы:</span>
              <span className="font-semibold capitalize">{hoveredFieldData.soil_type || 'суглинок'}</span>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Бонитет:</span>
              <span className="font-bold font-mono">×{hoveredFieldData.soil_fertility}</span>
              {hoveredAlloc && (
                <>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Культура ({activeYear}):</span>
                  <span className="font-bold text-[var(--md-sys-color-primary)]">
                    {CROP_COLOR_MAP[hoveredAlloc.crop_code]?.label || hoveredAlloc.crop_code}
                  </span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Валовый сбор:</span>
                  <span className="font-semibold font-mono">
                    {hoveredAlloc.yield_ts ? `${hoveredAlloc.yield_ts.toLocaleString()} ц` : '—'}
                  </span>
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Удобрения NPK:</span>
                  <span className="font-semibold text-[var(--md-sys-color-tertiary)] font-mono">
                    {hoveredAlloc.fert_kg} кг/га
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="p-4 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]/40 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            Легенда:
          </span>
          {activeLayer === 'crops' && (
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(CROP_COLOR_MAP).slice(0, 6).map(([key, style]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full shadow-xs text-[11px]"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.fill }} />
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">{style.label}</span>
                </div>
              ))}
            </div>
          )}
          {activeLayer === 'fertility' && (
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span>&gt; 1.15 (Чернозём)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                <span>1.00 (Суглинок)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                <span>&lt; 0.95 (Супесь)</span>
              </div>
            </div>
          )}
          {activeLayer === 'npk' && (
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                <span>&gt; 150 кг/га</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <span>100–150 кг/га</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>&lt; 100 кг/га</span>
              </div>
            </div>
          )}
          {activeLayer === 'soil' && (
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-green-700 shrink-0" />
                <span>Чернозём</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 shrink-0" />
                <span>Суглинок</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 px-2.5 py-1 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700 shrink-0" />
                <span>Супесь</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-medium hidden md:block">
          Кликните по участку для выбора и редактирования
        </div>
      </div>
    </div>
  );
};
