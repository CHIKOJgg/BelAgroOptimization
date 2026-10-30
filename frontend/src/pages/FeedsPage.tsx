import React, { useEffect, useState } from 'react';
import { Sprout, Edit2, Check, X, Info, RefreshCw } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { M3Badge } from '../components/m3/M3Badge';
import { M3IconButton } from '../components/m3/M3Button';
import { FeedBalanceChart } from '../components/charts/FeedBalanceChart';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import type { FeedData, OptimizationResult } from '../types';

export const FeedsPage: React.FC = () => {
  const { activeScenario } = useScenario();
  const { success, error } = useToast();
  const [feeds, setFeeds] = useState<FeedData[]>([]);
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<string | null>(null);

  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCowNeed, setEditCowNeed] = useState<number>(0);
  const [editCattleNeed, setEditCattleNeed] = useState<number>(0);
  const [editPigNeed, setEditPigNeed] = useState<number>(0);

  useEffect(() => {
    async function loadFeeds() {
      if (!activeScenario) return;
      try {
        setLoading(true);
        const [data, resData] = await Promise.all([
          api.getFeeds(activeScenario.scenario_id),
          api.getOptimizationResults(activeScenario.scenario_id).catch(() => null),
        ]);
        setFeeds(data);
        setResults(resData);
      } catch (err) {
        console.error('Ошибка загрузки кормов:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeeds();
  }, [activeScenario]);

  const getFeedRuName = (type: string) => {
    switch (type) {
      case 'silage':
        return 'Кукурузный силос';
      case 'hay':
        return 'Сено злаково-бобовое';
      case 'concentrate':
        return 'Концентраты (комбикорм)';
      case 'pasture':
        return 'Пастбищный зеленый корм';
      default:
        return type;
    }
  };

  const startEdit = (feed: FeedData) => {
    setEditingType(feed.feed_type);
    setEditPrice(feed.price_byn_per_centner);
    setEditCowNeed(feed.cow_need);
    setEditCattleNeed(feed.cattle_need);
    setEditPigNeed(feed.pig_need);
  };

  const cancelEdit = () => {
    setEditingType(null);
  };

  const saveEdit = async (feed: FeedData) => {
    if (!activeScenario) return;
    try {
      const updated = await api.updateFeed(activeScenario.scenario_id, feed.feed_type, {
        price_byn_per_centner: Number(editPrice),
        cow_need: Number(editCowNeed),
        cattle_need: Number(editCattleNeed),
        pig_need: Number(editPigNeed),
      });
      setFeeds(feeds.map((f) => (f.feed_type === feed.feed_type ? updated : f)));
      setEditingType(null);
      success(`Нормативы корма «${getFeedRuName(feed.feed_type)}» успешно сохранены`);
    } catch (err) {
      error(`Ошибка сохранения корма: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2.5">
          <Sprout className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
          <span>Баланс кормовой базы и рационы DAOS</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
          Оптимизация кормовых балансов DAOS: нормативы потребности в кормах, рыночные цены закупки и сезонные коэффициенты
        </p>
      </div>

      {/* Feed Balance Breakdown Chart */}
      <FeedBalanceChart results={results} />

      {/* Info notice */}
      <div className="bg-[var(--md-sys-color-tertiary-container)]/30 border border-[var(--md-sys-color-tertiary)]/20 rounded-[16px] p-4 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-[var(--md-sys-color-on-surface)] space-y-1">
          <div className="font-bold text-[var(--md-sys-color-on-surface)]">Баланс кормов в модели DAOS (Pyomo):</div>
          <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            Собственное производство с полей (силос, сено, фуражное зерно, пастбище) покрывает потребность скота.
            При дефиците модель закупает корма на рынке по рыночной цене с учетом сезонной надбавки (зимой ×1.15 ... ×1.30).
            Пастбище не подлежит покупке на рынке.
          </p>
        </div>
      </div>

      {/* Feeds Table */}
      <M3Card
        title="Нормативы и стоимость кормовых ресурсов"
        subtitle="Расход корма указан в центнерах на 1 голову в год"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--md-sys-color-outline-variant)]/40 text-xs font-semibold uppercase text-[var(--md-sys-color-on-surface-variant)]">
              <tr>
                <th className="pb-3 px-4">Вид корма</th>
                <th className="pb-3 px-4">Базовая цена (BYN/ц)</th>
                <th className="pb-3 px-4">Зимний коэфф.</th>
                <th className="pb-3 px-4">Норма: Корова</th>
                <th className="pb-3 px-4">Норма: КРС</th>
                <th className="pb-3 px-4">Норма: Свинья</th>
                <th className="pb-3 px-4">Отдача (Beta)</th>
                <th className="pb-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[var(--md-sys-color-primary)]" />
                      <span>Загрузка рационов...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                feeds.map((feed) => {
                  const isEditing = editingType === feed.feed_type;

                  return (
                    <tr
                      key={feed.feed_data_id}
                      className="hover:bg-[var(--md-sys-color-surface-container)]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--md-sys-color-on-surface)]">
                          {getFeedRuName(feed.feed_type)}
                        </div>
                        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          {feed.feed_type}
                        </div>
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
                            {feed.price_byn_per_centner} BYN
                          </span>
                        )}
                      </td>

                      {/* Winter mult */}
                      <td className="py-3.5 px-4 text-xs">
                        <M3Badge tone="tertiary" size="sm">
                          ×{feed.winter_price_multiplier}
                        </M3Badge>
                      </td>

                      {/* Cow Need */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editCowNeed}
                            onChange={(e) => setEditCowNeed(Number(e.target.value))}
                            className="w-16 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface)]">{feed.cow_need} ц</span>
                        )}
                      </td>

                      {/* Cattle Need */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editCattleNeed}
                            onChange={(e) => setEditCattleNeed(Number(e.target.value))}
                            className="w-16 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface)]">{feed.cattle_need} ц</span>
                        )}
                      </td>

                      {/* Pig Need */}
                      <td className="py-3.5 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editPigNeed}
                            onChange={(e) => setEditPigNeed(Number(e.target.value))}
                            className="w-16 bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)] rounded-lg px-2 py-1 text-sm font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)]"
                          />
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface)]">{feed.pig_need} ц</span>
                        )}
                      </td>

                      {/* Diminishing Beta */}
                      <td className="py-3.5 px-4 text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
                        β={feed.diminishing_beta}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <M3IconButton
                              variant="filled"
                              size="sm"
                              onClick={() => saveEdit(feed)}
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
                            onClick={() => startEdit(feed)}
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
    </div>
  );
};
