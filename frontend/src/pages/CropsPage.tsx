import React, { useEffect, useState } from 'react';
import { Wheat, Edit2, Check, X, ShieldAlert, RefreshCw } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { M3Badge } from '../components/m3/M3Badge';
import { M3IconButton } from '../components/m3/M3Button';
import { NPKResponseChart } from '../components/charts/NPKResponseChart';
import { CropCalendarGantt } from '../components/charts/CropCalendarGantt';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { CropData } from '../types';

export const CropsPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const [crops, setCrops] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  // Edit fields
  const [editYield, setEditYield] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);
  const [editFertResponse, setEditFertResponse] = useState<number>(0);

  useEffect(() => {
    async function loadCrops() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const data = await api.getCrops(activeScenario.scenario_id);
        setCrops(data);
      } catch (err) {
        console.error('Ошибка загрузки культур:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCrops();
  }, [activeScenario]);

  const startEdit = (crop: CropData) => {
    setEditingCode(crop.code);
    setEditYield(crop.base_yield_tha);
    setEditPrice(crop.price_byn_per_ts);
    setEditCost(crop.cost_byn_per_ha);
    setEditFertResponse(crop.fert_response);
  };

  const cancelEdit = () => {
    setEditingCode(null);
  };

  const saveEdit = async (crop: CropData) => {
    if (!activeScenario) return;
    try {
      const updated = await api.updateCrop(activeScenario.scenario_id, crop.code, {
        base_yield_tha: Number(editYield),
        price_byn_per_ts: Number(editPrice),
        cost_byn_per_ha: Number(editCost),
        fert_response: Number(editFertResponse),
      });
      setCrops(crops.map((c) => (c.code === crop.code ? updated : c)));
      setEditingCode(null);
      success(`Параметры культуры «${crop.name}» успешно обновлены`);
    } catch (err) {
      error(`Ошибка сохранения культуры: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
          <Wheat className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          <span>Агротехнологические нормативы культур DAOS</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
          Технологические карты DAOS: базовые урожайности, рыночные цены реализации, производственные затраты и регламенты севооборота
        </p>
      </div>

      {/* Potato Penalty Notice Card in M3 Warning Style */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-[16px] p-4 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-900 dark:text-amber-200">
            Особые технологические ограничения по картофелю:
          </div>
          <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            В модели учитывается повышенная трудоёмкость культуры: дополнительный скрытый штраф{' '}
            <b className="font-bold">+8 000 BYN/га</b>, жёсткое ограничение площади посева{' '}
            <b className="font-bold">≤ 18%</b> от пашни и запрет повторного посева на одном поле чаще 1 раза в 3 года.
          </p>
        </div>
      </div>

      {/* Crops Table */}
      <M3Card
        title="Параметры возделываемых культур"
        subtitle="Кликните на иконку карандаша для изменения показателей"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
              <tr>
                <th className="pb-3 px-4">Культура</th>
                <th className="pb-3 px-4">Урожайность (ц/га)</th>
                <th className="pb-3 px-4">Цена (BYN/ц)</th>
                <th className="pb-3 px-4">Затраты (BYN/га)</th>
                <th className="pb-3 px-4">Отклик на NPK</th>
                <th className="pb-3 px-4">Макс. доля</th>
                <th className="pb-3 px-4">Севооборот (лет)</th>
                <th className="pb-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[var(--md-sys-color-primary)]" />
                      <span>Загрузка данных...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                crops.map((crop) => {
                  const isEditing = editingCode === crop.code;

                  return (
                    <tr
                      key={crop.crop_data_id}
                      className="hover:bg-[var(--md-sys-color-surface-container)]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--md-sys-color-on-surface)]">{crop.name}</div>
                        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          {crop.code}
                        </div>
                      </td>

                      {/* Yield */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editYield}
                            onChange={(e) => setEditYield(Number(e.target.value))}
                            className="w-20 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2.5 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                            {crop.base_yield_tha}
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-20 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2.5 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="font-bold text-[var(--md-sys-color-primary)]">
                            {crop.price_byn_per_ts} BYN
                          </span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="50"
                            value={editCost}
                            onChange={(e) => setEditCost(Number(e.target.value))}
                            className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2.5 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface-variant)]">
                            {crop.cost_byn_per_ha} BYN
                          </span>
                        )}
                      </td>

                      {/* Fert response */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.005"
                            value={editFertResponse}
                            onChange={(e) => setEditFertResponse(Number(e.target.value))}
                            className="w-20 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2.5 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                            +{crop.fert_response} ц/кг
                          </span>
                        )}
                      </td>

                      {/* Max Area % */}
                      <td className="py-3.5 px-4">
                        {crop.max_area_pct < 100 ? (
                          <M3Badge tone="secondary">до {crop.max_area_pct}%</M3Badge>
                        ) : (
                          <M3Badge tone="neutral">Без лимита</M3Badge>
                        )}
                      </td>

                      {/* Rotation gap */}
                      <td className="py-3.5 px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {crop.rotation_gap_years > 0
                          ? `≥ ${crop.rotation_gap_years} года`
                          : '0 (бессменно)'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <M3IconButton
                              variant="filled"
                              size="sm"
                              onClick={() => saveEdit(crop)}
                              title="Сохранить"
                            >
                              <Check className="w-4 h-4" />
                            </M3IconButton>
                            <M3IconButton
                              variant="outlined"
                              size="sm"
                              onClick={cancelEdit}
                              title="Отмена"
                            >
                              <X className="w-4 h-4" />
                            </M3IconButton>
                          </div>
                        ) : (
                          <M3IconButton
                            variant="standard"
                            size="sm"
                            onClick={() => startEdit(crop)}
                            title="Редактировать параметры"
                          >
                            <Edit2 className="w-4 h-4" />
                          </M3IconButton>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </M3Card>

      {/* Advanced Agronomy Visualizations */}
      <div className="space-y-6">
        <NPKResponseChart />
        <CropCalendarGantt />
      </div>
    </div>
  );
};
