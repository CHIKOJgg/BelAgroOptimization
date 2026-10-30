import React, { useEffect, useState } from 'react';
import { MapPin, Edit2, Check, X, PieChart, ShieldCheck, RefreshCw, Database } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { M3Card } from '../components/m3/M3Card';
import { M3Button, M3IconButton } from '../components/m3/M3Button';
import { M3Badge } from '../components/m3/M3Badge';
import { CadastralMap } from '../components/map/CadastralMap';
import { DatasetManagerModal } from '../components/datasets/DatasetManagerModal';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { FieldData, CropAllocation } from '../types';

export const FieldsPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const [fields, setFields] = useState<FieldData[]>([]);
  const [allocations, setAllocations] = useState<CropAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFieldCode, setSelectedFieldCode] = useState<string>('field1');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editArea, setEditArea] = useState<number>(0);
  const [editSoil, setEditSoil] = useState<string>('');
  const [editFertility, setEditFertility] = useState<number>(1.0);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);

  const handleDatasetApplied = (imported: Partial<FieldData>[]) => {
    const formatted: FieldData[] = imported.map((r, idx) => ({
      field_data_id: `imported-${idx}-${Date.now()}`,
      scenario_id: activeScenario?.scenario_id || '',
      field_id: `f-imp-${idx}`,
      code: r.code || `field_${idx + 1}`,
      area_ha: Number(r.area_ha) || 100,
      soil_type: r.soil_type || 'суглинок',
      soil_fertility: Number(r.soil_fertility) || 1.0,
    }));
    setFields(formatted);
    if (formatted.length > 0) {
      setSelectedFieldCode(formatted[0].code);
    }
  };

  useEffect(() => {
    async function loadFields() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const [fieldsData, resData] = await Promise.all([
          api.getFields(activeScenario.scenario_id),
          api.getOptimizationResults(activeScenario.scenario_id).catch(() => null),
        ]);
        setFields(fieldsData);
        if (resData?.crop_allocations) {
          setAllocations(resData.crop_allocations);
        }
      } catch (err) {
        console.error('Ошибка загрузки полей:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, [activeScenario]);

  const startEdit = (field: FieldData) => {
    setEditingId(field.field_data_id);
    setEditArea(field.area_ha);
    setEditSoil(field.soil_type || 'суглинок');
    setEditFertility(field.soil_fertility);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (field: FieldData) => {
    if (!activeScenario) return;
    try {
      const updated = await api.updateField(activeScenario.scenario_id, field.field_id, {
        area_ha: Number(editArea),
        soil_type: editSoil,
        soil_fertility: Number(editFertility),
      });
      setFields(fields.map((f) => (f.field_id === field.field_id ? updated : f)));
      setEditingId(null);
      success(`Параметры поля «${field.code.toUpperCase()}» сохранены`);
    } catch (err) {
      error(`Ошибка сохранения поля: ${err}`);
    }
  };

  const totalArea = fields.reduce((acc, f) => acc + f.area_ha, 0);
  const avgFertility = fields.length
    ? (fields.reduce((acc, f) => acc + f.soil_fertility, 0) / fields.length).toFixed(2)
    : '1.0';

  const getSoilBadge = (soil: string | null) => {
    switch (soil) {
      case 'чернозём':
        return <M3Badge tone="primary">Чернозём (высокое)</M3Badge>;
      case 'суглинок':
        return <M3Badge tone="tertiary">Суглинок (среднее)</M3Badge>;
      case 'супесь':
        return <M3Badge tone="secondary">Супесь (легкое)</M3Badge>;
      default:
        return <M3Badge tone="surface">{soil || 'Не указан'}</M3Badge>;
    }
  };

  const selectedField =
    fields.find((f) => f.code.toLowerCase() === selectedFieldCode.toLowerCase()) || fields[0];
  const selectedAllocs = allocations.filter(
    (a) => a.field_code.toLowerCase() === selectedFieldCode.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
            <span>Земельный фонд и контуры полей DAOS</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Цифровой кадастровый реестр полей DAOS: карта контуров, бонитет плодородия и параметры почвы
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--md-sys-color-primary)]" />
              <span>Обновление...</span>
            </div>
          )}
          <M3Button
            variant="filled"
            size="sm"
            onClick={() => setIsDatasetModalOpen(true)}
            icon={<Database className="w-3.5 h-3.5" />}
          >
            Импорт датасета (Excel / CSV)
          </M3Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Совокупная площадь пашни"
          value={totalArea}
          unit="га"
          icon={<MapPin className="w-5 h-5" />}
          subtitle="Общий земельный банк системы DAOS"
          color="emerald"
          sparkline={[850, 880, 900, 900]}
        />
        <MetricCard
          title="Количество полей"
          value={fields.length}
          icon={<PieChart className="w-5 h-5" />}
          subtitle="Единиц в севообороте"
          color="blue"
        />
        <MetricCard
          title="Средний бонитет плодородия"
          value={avgFertility}
          icon={<ShieldCheck className="w-5 h-5" />}
          subtitle="Коэффициент отдачи удобрений"
          color="amber"
          sparkline={[1.02, 1.03, 1.04]}
        />
      </div>

      {/* Geospatial Map + Selected Parcel Inspector (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map (7 cols) */}
        <div className="lg:col-span-7">
          <CadastralMap
            fields={fields}
            allocations={allocations}
            selectedFieldId={selectedFieldCode}
            onSelectField={(code) => setSelectedFieldCode(code)}
          />
        </div>

        {/* Right: Parcel Inspector & Quick Editor (5 cols) */}
        <div className="lg:col-span-5">
          {selectedField ? (
            <M3Card
              title={`Инспектор: ${selectedField.code.toUpperCase()}`}
              subtitle="Параметры и агротехника выбранного участка"
              action={
                <M3Button
                  variant="tonal"
                  size="sm"
                  onClick={() => startEdit(selectedField)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Редактировать
                </M3Button>
              }
            >
              <div className="space-y-4">
                {/* Highlights grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[14px] p-3.5">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold">
                      Площадь
                    </span>
                    <div className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-0.5">
                      {selectedField.area_ha} га
                    </div>
                    <span className="text-[10px] text-[var(--md-sys-color-primary)] font-medium">
                      {totalArea ? `${((selectedField.area_ha / totalArea) * 100).toFixed(1)}% от пашни` : ''}
                    </span>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[14px] p-3.5">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold">
                      Бонитет
                    </span>
                    <div className="text-xl font-bold font-mono text-[var(--md-sys-color-primary)] mt-0.5">
                      ×{selectedField.soil_fertility}
                    </div>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                      Отдача NPK удобрений
                    </span>
                  </div>
                </div>

                {/* Soil type banner */}
                <div className="p-3.5 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[14px] flex items-center justify-between text-xs">
                  <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
                    Тип почвы:
                  </span>
                  <div>{getSoilBadge(selectedField.soil_type)}</div>
                </div>

                {/* Crop history for this field */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] mb-2">
                    Севооборот по годам:
                  </h4>
                  {selectedAllocs.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAllocs.map((a) => (
                        <div
                          key={a.year}
                          className="flex items-center justify-between p-2.5 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 rounded-[12px] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[var(--md-sys-color-on-surface)]">{a.year} г:</span>
                            <span className="font-semibold text-[var(--md-sys-color-primary)]">{a.crop_code}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                            <span>{a.yield_ts ? `${a.yield_ts} ц` : '—'}</span>
                            <span className="text-[var(--md-sys-color-primary)] font-semibold">{a.fert_kg} кг NPK</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                      Запустите оптимизацию в Центре расчета для формирования севооборота
                    </p>
                  )}
                </div>
              </div>
            </M3Card>
          ) : (
            <div className="flex items-center justify-center p-8 text-[var(--md-sys-color-on-surface-variant)] text-xs">
              Выберите участок на карте
            </div>
          )}
        </div>
      </div>

      {/* Cadastral Registry Table */}
      <M3Card
        title="Кадастровый реестр участков"
        subtitle="Редактируемые параметры земельных контуров"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
              <tr>
                <th className="py-3 px-4">Код поля</th>
                <th className="py-3 px-4">Площадь (га)</th>
                <th className="py-3 px-4">Тип почвы</th>
                <th className="py-3 px-4">Коэфф. плодородия</th>
                <th className="py-3 px-4">Доля от пашни</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
              {fields.map((field) => {
                const isEditing = editingId === field.field_data_id;
                const isSelected = selectedFieldCode.toLowerCase() === field.code.toLowerCase();

                return (
                  <tr
                    key={field.field_id}
                    onClick={() => setSelectedFieldCode(field.code)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-secondary-container)]/30 border-l-4 border-[var(--md-sys-color-primary)]'
                        : 'hover:bg-[var(--md-sys-color-surface-container)]/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-[var(--md-sys-color-on-surface)] font-mono">
                      {field.code}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editArea}
                          onChange={(e) => setEditArea(Number(e.target.value))}
                          className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded px-2 py-1 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-mono"
                        />
                      ) : (
                        <span className="font-mono text-[var(--md-sys-color-on-surface)]">{field.area_ha} га</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={editSoil}
                          onChange={(e) => setEditSoil(e.target.value)}
                          className="bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded px-2 py-1 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                        >
                          <option value="чернозём">чернозём</option>
                          <option value="суглинок">суглинок</option>
                          <option value="супесь">супесь</option>
                        </select>
                      ) : (
                        getSoilBadge(field.soil_type)
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.05"
                          value={editFertility}
                          onChange={(e) => setEditFertility(Number(e.target.value))}
                          className="w-20 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded px-2 py-1 text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-mono"
                        />
                      ) : (
                        <span className="font-mono text-[var(--md-sys-color-on-surface-variant)]">×{field.soil_fertility}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[var(--md-sys-color-on-surface-variant)] font-mono text-xs">
                      {totalArea > 0 ? `${((field.area_ha / totalArea) * 100).toFixed(1)}%` : '0%'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <M3IconButton
                            variant="filled"
                            size="sm"
                            title="Сохранить"
                            onClick={() => saveEdit(field)}
                          >
                            <Check className="w-4 h-4" />
                          </M3IconButton>
                          <M3IconButton
                            variant="outlined"
                            size="sm"
                            title="Отмена"
                            onClick={cancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </M3IconButton>
                        </div>
                      ) : (
                        <M3IconButton
                          variant="standard"
                          size="sm"
                          title="Редактировать поле"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(field);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </M3IconButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </M3Card>

      {/* Dataset Manager Modal */}
      <DatasetManagerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onDatasetApplied={handleDatasetApplied}
      />
    </div>
  );
};
