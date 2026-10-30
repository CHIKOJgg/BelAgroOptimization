import React, { useEffect, useState } from 'react';
import { Beef, Milk, ThermometerSnowflake, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { M3IconButton } from '../components/m3/M3Button';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { LivestockData } from '../types';

export const LivestockPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const [livestock, setLivestock] = useState<LivestockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<string | null>(null);

  const [editMin, setEditMin] = useState<number>(0);
  const [editMax, setEditMax] = useState<number>(0);
  const [editYield, setEditYield] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCostSummer, setEditCostSummer] = useState<number>(0);
  const [editCostWinter, setEditCostWinter] = useState<number>(0);

  useEffect(() => {
    async function loadLivestock() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const data = await api.getLivestock(activeScenario.scenario_id);
        setLivestock(data);
      } catch (err) {
        console.error('Ошибка загрузки животных:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLivestock();
  }, [activeScenario]);

  const getAnimalTitle = (type: string) => {
    switch (type) {
      case 'cow':
        return {
          name: 'Дойное стадо (Коровы)',
          icon: <Milk className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />,
          prodUnit: 'кг молока/гол',
        };
      case 'cattle':
        return {
          name: 'КРС на откорме (Мясное скотоводство)',
          icon: <Beef className="w-5 h-5 text-[var(--md-sys-color-primary)]" />,
          prodUnit: 'кг мяса/гол',
        };
      case 'pig':
        return {
          name: 'Свиноводство',
          icon: <Beef className="w-5 h-5 text-[var(--md-sys-color-error)]" />,
          prodUnit: 'кг мяса/гол',
        };
      default:
        return {
          name: type,
          icon: <Beef className="w-5 h-5 text-[var(--md-sys-color-outline)]" />,
          prodUnit: 'кг/гол',
        };
    }
  };

  const startEdit = (item: LivestockData) => {
    setEditingType(item.animal_type);
    setEditMin(item.min_heads);
    setEditMax(item.max_heads);
    setEditYield(item.base_yield_kg);
    setEditPrice(item.price_byn_per_kg);
    setEditCostSummer(item.cost_summer_byn);
    setEditCostWinter(item.cost_winter_byn);
  };

  const cancelEdit = () => {
    setEditingType(null);
  };

  const saveEdit = async (item: LivestockData) => {
    if (!activeScenario) return;
    try {
      const updated = await api.updateLivestock(activeScenario.scenario_id, item.animal_type, {
        min_heads: Number(editMin),
        max_heads: Number(editMax),
        base_yield_kg: Number(editYield),
        price_byn_per_kg: Number(editPrice),
        cost_summer_byn: Number(editCostSummer),
        cost_winter_byn: Number(editCostWinter),
      });
      setLivestock(livestock.map((l) => (l.animal_type === item.animal_type ? updated : l)));
      setEditingType(null);
      success(`Параметры поголовья «${getAnimalTitle(item.animal_type).name}» успешно сохранены`);
    } catch (err) {
      error(`Ошибка сохранения поголовья: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
          <Beef className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          <span>Животноводство и конверсия кормов DAOS</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
          Моделирование продуктивности стада в системе DAOS: параметры поголовья, базовой и предельной продуктивности, цен реализации и сезонных затрат
        </p>
      </div>

      {/* Cards per animal type */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-[var(--md-sys-color-on-surface-variant)] gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--md-sys-color-primary)]" />
          <span>Загрузка данных животноводства...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {livestock.map((item) => {
            const info = getAnimalTitle(item.animal_type);
            const isEditing = editingType === item.animal_type;

            return (
              <M3Card
                key={item.livestock_data_id}
                variant="elevated"
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--md-sys-color-outline-variant)]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[var(--md-sys-color-on-surface)]">{info.name}</h3>
                        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          {item.animal_type}
                        </span>
                      </div>
                    </div>

                    {!isEditing ? (
                      <M3IconButton
                        variant="standard"
                        size="sm"
                        onClick={() => startEdit(item)}
                        title="Редактировать параметры"
                      >
                        <Edit2 className="w-4 h-4" />
                      </M3IconButton>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <M3IconButton
                          variant="filled"
                          size="sm"
                          onClick={() => saveEdit(item)}
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
                    )}
                  </div>

                  {/* Form / Specs */}
                  <div className="mt-5 space-y-3.5 text-xs">
                    {/* Herd Limits */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">Лимит стада (мин / макс):</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <input
                            type="number"
                            value={editMin}
                            onChange={(e) => setEditMin(Number(e.target.value))}
                            className="w-16 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-medium text-center outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                          <span className="text-[var(--md-sys-color-outline)]">-</span>
                          <input
                            type="number"
                            value={editMax}
                            onChange={(e) => setEditMax(Number(e.target.value))}
                            className="w-16 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-medium text-center outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-[var(--md-sys-color-on-surface)] font-mono">
                          {item.min_heads} – {item.max_heads} голов
                        </span>
                      )}
                    </div>

                    {/* Productivity */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">Продуктивность (базовая):</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editYield}
                          onChange={(e) => setEditYield(Number(e.target.value))}
                          className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-mono font-medium text-right outline-none focus:border-[var(--md-sys-color-primary)]"
                        />
                      ) : (
                        <span className="font-bold text-[var(--md-sys-color-primary)] font-mono">
                          {item.base_yield_kg} {info.prodUnit}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">Цена реализации продукции:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-mono font-medium text-right outline-none focus:border-[var(--md-sys-color-primary)]"
                        />
                      ) : (
                        <span className="font-semibold text-[var(--md-sys-color-on-surface)] font-mono">
                          {item.price_byn_per_kg} BYN/кг
                        </span>
                      )}
                    </div>

                    {/* Summer Cost */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">Летние затраты на голову:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCostSummer}
                          onChange={(e) => setEditCostSummer(Number(e.target.value))}
                          className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-mono font-medium text-right outline-none focus:border-[var(--md-sys-color-primary)]"
                        />
                      ) : (
                        <span className="text-[var(--md-sys-color-on-surface)] font-mono font-medium">
                          {item.cost_summer_byn} BYN
                        </span>
                      )}
                    </div>

                    {/* Winter Cost */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">Зимние затраты на голову:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editCostWinter}
                          onChange={(e) => setEditCostWinter(Number(e.target.value))}
                          className="w-24 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-[var(--md-sys-color-on-surface)] font-mono font-medium text-right outline-none focus:border-[var(--md-sys-color-primary)]"
                        />
                      ) : (
                        <span className="text-[var(--md-sys-color-on-surface)] font-mono font-medium">
                          {item.cost_winter_byn} BYN
                        </span>
                      )}
                    </div>

                    {/* Energy Winter Cost */}
                    <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)]">
                      <span className="flex items-center gap-1.5">
                        <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-500" />
                        <span>Отопление/вентиляция зимой:</span>
                      </span>
                      <span className="text-[var(--md-sys-color-tertiary)] font-bold font-mono">
                        {item.energy_cost_winter_byn} BYN/гол
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="mt-5 pt-3.5 border-t border-[var(--md-sys-color-outline-variant)]/30 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  Модель автоматически масштабирует затраты в зависимости от зимних морозов и снижает продуктивность при летнем тепловом стрессе (&gt;18°C).
                </div>
              </M3Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
