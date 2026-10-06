import React, { useEffect, useState } from 'react';
import { Sprout, Edit2, Check, X, Info, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Sprout className="w-6 h-6 text-emerald-700" />
          <span>Баланс кормовой базы и рационы DAOS</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Оптимизация кормовых балансов DAOS: нормативы потребности в кормах, рыночные цены закупки и сезонные коэффициенты удорожания
        </p>
      </div>

      {/* Feed Balance Breakdown Chart */}
      <FeedBalanceChart results={results} />

      {/* Info notice */}
      <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <div className="font-bold text-sky-950">Баланс кормов в модели DAOS (Pyomo):</div>
          <p className="text-slate-600 leading-relaxed">
            Собственное производство с полей (силос, сено, фуражное зерно, пастбище) покрывает потребность скота.
            При дефиците модель закупает корма на рынке по рыночной цене с учетом сезонной надбавки (зимой ×1.15 ... ×1.30).
            Пастбище не подлежит покупке на рынке.
          </p>
        </div>
      </div>

      {/* Feeds Table */}
      <Card title="Нормативы и стоимость кормовых ресурсов" subtitle="Расход корма указан в центнерах на 1 голову в год">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
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
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>Загрузка рационов...</span>
                    </div>
                  </td>
                </tr>
              ) : feeds.map((feed) => {
                const isEditing = editingType === feed.feed_type;

                return (
                  <tr key={feed.feed_data_id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{getFeedRuName(feed.feed_type)}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{feed.feed_type}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      ) : (
                        <span className="font-semibold text-emerald-700">{feed.price_byn_per_centner} BYN</span>
                      )}
                    </td>

                    {/* Winter mult */}
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <Badge variant="blue">×{feed.winter_price_multiplier}</Badge>
                    </td>

                    {/* Cow Need */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editCowNeed}
                          onChange={(e) => setEditCowNeed(Number(e.target.value))}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      ) : (
                        <span className="text-slate-800">{feed.cow_need} ц</span>
                      )}
                    </td>

                    {/* Cattle Need */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editCattleNeed}
                          onChange={(e) => setEditCattleNeed(Number(e.target.value))}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      ) : (
                        <span className="text-slate-800">{feed.cattle_need} ц</span>
                      )}
                    </td>

                    {/* Pig Need */}
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editPigNeed}
                          onChange={(e) => setEditPigNeed(Number(e.target.value))}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                        />
                      ) : (
                        <span className="text-slate-800">{feed.pig_need} ц</span>
                      )}
                    </td>

                    {/* Diminishing Beta */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      β={feed.diminishing_beta}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(feed)}
                            title="Сохранить"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Отмена"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 shadow-2xs"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(feed)}
                          title="Редактировать параметры"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors border border-transparent hover:border-emerald-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
