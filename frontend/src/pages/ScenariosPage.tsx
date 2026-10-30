import React, { useState } from 'react';
import { Layers, Plus, Copy, Trash2, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { M3Card } from '../components/m3/M3Card';
import { M3Button, M3IconButton } from '../components/m3/M3Button';
import { M3Badge } from '../components/m3/M3Badge';
import { M3Dialog } from '../components/m3/M3Dialog';
import { M3TextField } from '../components/m3/M3TextField';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useScenario } from '../context/ScenarioContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

export const ScenariosPage: React.FC = () => {
  const { scenarios, refreshScenarios, setSelectedScenarioId } = useScenario();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDesc, setNewScenarioDesc] = useState('');
  const [makeActive, setMakeActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion modal state
  const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await api.createScenario({
        name: newScenarioName,
        description: newScenarioDesc,
        is_active: makeActive,
      });
      setIsModalOpen(false);
      setNewScenarioName('');
      setNewScenarioDesc('');
      await refreshScenarios();
      if (makeActive) {
        setSelectedScenarioId(created.scenario_id);
      }
      success(`Сценарий «${created.name}» успешно создан`);
    } catch (err) {
      error(`Ошибка создания: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const activated = await api.activateScenario(id);
      setSelectedScenarioId(id);
      await refreshScenarios();
      success(`Сценарий «${activated.name}» назначен активным`);
    } catch (err) {
      error(`Ошибка активации: ${err}`);
    }
  };

  const handleClone = async (id: string) => {
    try {
      const cloned = await api.cloneScenario(id);
      await refreshScenarios();
      success(`Создана копия: «${cloned.name}»`);
    } catch (err) {
      error(`Ошибка клонирования: ${err}`);
    }
  };

  const confirmDelete = async () => {
    if (!scenarioToDelete) return;
    try {
      await api.deleteScenario(scenarioToDelete);
      await refreshScenarios();
      success('Сценарий успешно удален');
    } catch (err) {
      error(`Ошибка удаления: ${err}`);
    } finally {
      setScenarioToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="m3-headline-small flex items-center gap-2.5" style={{ color: 'var(--md-sys-color-on-surface)' }}>
            <div
              className="p-2 rounded-[14px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
            >
              <Layers className="w-6 h-6" />
            </div>
            <span>Управление сценариями оптимизации DAOS</span>
          </h1>
          <p className="m3-body-small mt-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Создавайте альтернативные сценарии («What-if» анализ) в системе DAOS для моделирования различных агроклиматических и экономических условий
          </p>
        </div>

        <M3Button
          variant="filled"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Новый сценарий DAOS
        </M3Button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((s) => (
          <M3Card
            key={s.scenario_id}
            variant={s.is_active ? 'elevated' : 'outlined'}
            className={`flex flex-col justify-between transition-all duration-200 ${
              s.is_active
                ? 'ring-2'
                : 'hover:shadow-md'
            }`}
            style={{
              borderColor: s.is_active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="m3-title-medium line-clamp-1" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                  {s.name}
                </h3>
                {s.is_active ? (
                  <M3Badge variant="primary" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Активный
                  </M3Badge>
                ) : (
                  <M3Badge variant="surface" size="md">
                    Черновик
                  </M3Badge>
                )}
              </div>

              <p className="m3-body-small min-h-[36px] line-clamp-2" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {s.description || 'Описание не указано'}
              </p>

              <div
                className="mt-4 pt-3 space-y-2 m3-body-small border-t"
                style={{ borderColor: 'var(--md-sys-color-outline-variant)', color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--md-sys-color-primary)' }} />
                    <span>Итоговая прибыль:</span>
                  </span>
                  <span className="font-mono font-bold" style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {s.last_profit ? `${s.last_profit.toLocaleString('ru-RU')} BYN` : 'Не рассчитан'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
                    <span>Создан:</span>
                  </span>
                  <span className="font-mono">{new Date(s.created_at).toLocaleDateString('ru-RU')}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--md-sys-color-outline)' }}>
                  <span>Полей: {s.fields_count || 5}</span>
                  <span>Культур: {s.crops_count || 9}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div
              className="mt-5 pt-3 flex items-center justify-between gap-2 border-t"
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
            >
              {!s.is_active ? (
                <M3Button
                  variant="tonal"
                  size="sm"
                  onClick={() => handleActivate(s.scenario_id)}
                >
                  Сделать активным
                </M3Button>
              ) : (
                <span
                  className="m3-label-small flex items-center gap-1 font-bold"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Активен для расчетов</span>
                </span>
              )}

              <div className="flex items-center gap-1">
                <M3IconButton
                  title="Клонировать сценарий"
                  onClick={() => handleClone(s.scenario_id)}
                  aria-label="Клонировать сценарий"
                >
                  <Copy className="w-4 h-4" />
                </M3IconButton>
                <M3IconButton
                  title="Удалить сценарий"
                  onClick={() => setScenarioToDelete(s.scenario_id)}
                  aria-label="Удалить сценарий"
                  className="hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </M3IconButton>
              </div>
            </div>
          </M3Card>
        ))}
      </div>

      <ConfirmModal
        isOpen={scenarioToDelete !== null}
        title="Удаление сценария"
        message="Вы уверены, что хотите удалить данный сценарий оптимизации? Все связанные расчеты и параметры будут безвозвратно удалены."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setScenarioToDelete(null)}
      />

      {/* Creation Modal Dialog */}
      <M3Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Создание сценария DAOS"
        maxWidth="md"
        actions={
          <>
            <M3Button
              variant="text"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </M3Button>
            <M3Button
              variant="filled"
              onClick={handleCreate}
              loading={isSubmitting}
            >
              Создать сценарий
            </M3Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <M3TextField
            label="Название сценария"
            required
            placeholder="Например: Засушливое лето 2026 / Высокие цены на молоко"
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
          />

          <div>
            <label
              className="block m3-label-medium mb-1.5"
              style={{ color: 'var(--md-sys-color-on-surface)' }}
            >
              Описание и гипотеза
            </label>
            <textarea
              rows={3}
              placeholder="Опишите предпосылки сценария (климат, цены, технологии)..."
              value={newScenarioDesc}
              onChange={(e) => setNewScenarioDesc(e.target.value)}
              className="w-full rounded-[12px] p-3 m3-body-medium outline-none transition-all duration-200 border"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
                color: 'var(--md-sys-color-on-surface)',
              }}
            />
          </div>

          <label
            htmlFor="makeActive"
            className="flex items-center gap-3 p-2.5 rounded-[12px] cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
          >
            <input
              type="checkbox"
              id="makeActive"
              checked={makeActive}
              onChange={(e) => setMakeActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="m3-label-medium select-none" style={{ color: 'var(--md-sys-color-on-surface)' }}>
              Сразу назначить сценарий активным
            </span>
          </label>
        </form>
      </M3Dialog>
    </div>
  );
};
