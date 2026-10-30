import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Check,
  FileText,
  Building2,
  Database,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useScenario } from '../../context/ScenarioContext';
import { M3Dialog } from '../m3/M3Dialog';
import { M3Button } from '../m3/M3Button';
import { M3Badge } from '../m3/M3Badge';
import { M3SegmentedButton } from '../m3/M3SegmentedButton';
import type { FieldData } from '../../types';

interface DatasetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetApplied?: (fields: Partial<FieldData>[]) => void;
}

interface ParsedFieldRow {
  code: string;
  area_ha: number;
  soil_type: string;
  soil_fertility: number;
  isValid: boolean;
  validationErrors: string[];
}

interface FarmPreset {
  id: string;
  name: string;
  region: string;
  areaHa: number;
  fieldsCount: number;
  soilType: string;
  description: string;
  fields: Array<{
    code: string;
    area_ha: number;
    soil_type: string;
    soil_fertility: number;
  }>;
}

const FARM_PRESETS: FarmPreset[] = [
  {
    id: 'optimum_agro',
    name: 'СПК «Оптимум-Агро»',
    region: 'Минская обл., Несвижский р-н',
    areaHa: 900,
    fieldsCount: 5,
    soilType: 'Чернозёмы окультуренные / суглинки',
    description: 'Эталонное семеноводческое хозяйство центральной Беларуси с интенсивной химизацией.',
    fields: [
      { code: 'field1', area_ha: 150.0, soil_type: 'чернозём', soil_fertility: 1.2 },
      { code: 'field2', area_ha: 200.0, soil_type: 'суглинок', soil_fertility: 1.0 },
      { code: 'field3', area_ha: 180.0, soil_type: 'супесь', soil_fertility: 0.9 },
      { code: 'field4', area_ha: 120.0, soil_type: 'чернозём', soil_fertility: 1.1 },
      { code: 'field5', area_ha: 250.0, soil_type: 'суглинок', soil_fertility: 1.0 },
    ],
  },
  {
    id: 'snov_agro',
    name: 'Агрокомбинат «Снов»',
    region: 'Минская обл., Несвижский р-н',
    areaHa: 1450,
    fieldsCount: 8,
    soilType: 'Высокоплодородные тяжелосуглинистые почвы',
    description: 'Крупнейший агрохолдинг мясо-молочного направления с замкнутым кормовым циклом.',
    fields: [
      { code: 'поле_север_1', area_ha: 220.0, soil_type: 'суглинок', soil_fertility: 1.25 },
      { code: 'поле_север_2', area_ha: 180.0, soil_type: 'чернозём', soil_fertility: 1.30 },
      { code: 'поле_пойменное', area_ha: 260.0, soil_type: 'чернозём', soil_fertility: 1.20 },
      { code: 'поле_центральное', area_ha: 190.0, soil_type: 'суглинок', soil_fertility: 1.15 },
      { code: 'поле_южное_1', area_ha: 150.0, soil_type: 'суглинок', soil_fertility: 1.10 },
      { code: 'поле_южное_2', area_ha: 140.0, soil_type: 'супесь', soil_fertility: 0.95 },
      { code: 'поле_запад_клин', area_ha: 170.0, soil_type: 'суглинок', soil_fertility: 1.05 },
      { code: 'поле_восток_травы', area_ha: 140.0, soil_type: 'суглинок', soil_fertility: 1.00 },
    ],
  },
  {
    id: 'vasilishki',
    name: 'ОАО «Василишки»',
    region: 'Гродненская обл., Щучинский р-н',
    areaHa: 1100,
    fieldsCount: 6,
    soilType: 'Дерново-подзолистые супеси и суглинки',
    description: 'Типичное хозяйство Принеманья со сложным почвенным рельефом и высокой долей озимого рапса.',
    fields: [
      { code: 'участок_1', area_ha: 210.0, soil_type: 'суглинок', soil_fertility: 1.05 },
      { code: 'участок_2', area_ha: 190.0, soil_type: 'супесь', soil_fertility: 0.88 },
      { code: 'участок_3', area_ha: 230.0, soil_type: 'суглинок', soil_fertility: 1.00 },
      { code: 'участок_4', area_ha: 160.0, soil_type: 'супесь', soil_fertility: 0.92 },
      { code: 'участок_5', area_ha: 170.0, soil_type: 'суглинок', soil_fertility: 1.02 },
      { code: 'участок_6', area_ha: 140.0, soil_type: 'чернозём', soil_fertility: 1.12 },
    ],
  },
];

export const DatasetManagerModal: React.FC<DatasetManagerModalProps> = ({
  isOpen,
  onClose,
  onDatasetApplied,
}) => {
  const { success, error, info } = useToast();
  const { activeScenario } = useScenario();

  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedRows, setParsedRows] = useState<ParsedFieldRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process File (Excel or CSV)
  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!json || json.length === 0) {
        throw new Error('Файл пуст или содержит нераспознанную структуру данных');
      }

      const rows: ParsedFieldRow[] = json.map((row: any, idx: number) => {
        const code = String(
          row['code'] ||
            row['Код поля'] ||
            row['Поле'] ||
            row['Номер поля'] ||
            row['Название'] ||
            `field_${idx + 1}`
        ).trim();

        const rawArea =
          row['area_ha'] ||
          row['area'] ||
          row['Площадь (га)'] ||
          row['Площадь'] ||
          row['Площадь, га'] ||
          '0';
        const area_ha = parseFloat(String(rawArea).replace(',', '.')) || 0;

        const rawSoil =
          row['soil_type'] ||
          row['soil'] ||
          row['Тип почвы'] ||
          row['Почва'] ||
          'суглинок';
        const soil_type = String(rawSoil).trim().toLowerCase();

        const rawFert =
          row['soil_fertility'] ||
          row['fertility'] ||
          row['Балл плодородия'] ||
          row['Плодородие'] ||
          '1.0';
        let soil_fertility = parseFloat(String(rawFert).replace(',', '.')) || 1.0;
        if (soil_fertility > 10) {
          soil_fertility = Number((soil_fertility / 35.0).toFixed(2));
        }

        const errors: string[] = [];
        if (!code) errors.push('Отсутствует код поля');
        if (area_ha <= 0) errors.push('Площадь должна быть > 0 га');
        if (soil_fertility < 0.4 || soil_fertility > 2.0)
          errors.push('Коэф. плодородия вне диапазона [0.4 ... 2.0]');

        return {
          code,
          area_ha,
          soil_type,
          soil_fertility,
          isValid: errors.length === 0,
          validationErrors: errors,
        };
      });

      setParsedRows(rows);
      const validCount = rows.filter((r) => r.isValid).length;
      if (validCount === rows.length) {
        success(`Успешно обработано ${rows.length} полей из файла «${file.name}»`);
      } else {
        info(`Файл прочитан: ${validCount} из ${rows.length} валидны. Проверьте статус.`);
      }
    } catch (err: any) {
      error(`Ошибка разбора файла: ${err.message || err}`);
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDownloadXlsxTemplate = () => {
    const templateData = [
      {
        'Код поля': 'field_nord_1',
        'Площадь (га)': 180.5,
        'Тип почвы': 'суглинок',
        'Балл плодородия': 1.15,
      },
      {
        'Код поля': 'field_nord_2',
        'Площадь (га)': 220.0,
        'Тип почвы': 'чернозём',
        'Балл плодородия': 1.28,
      },
      {
        'Код поля': 'field_south_3',
        'Площадь (га)': 140.0,
        'Тип почвы': 'супесь',
        'Балл плодородия': 0.90,
      },
      {
        'Код поля': 'field_east_4',
        'Площадь (га)': 260.0,
        'Тип почвы': 'суглинок',
        'Балл плодородия': 1.05,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DAOS_Поля_Шаблон');
    XLSX.writeFile(wb, 'daos_fields_template.xlsx');
    success('Шаблон полей DAOS (.XLSX) загружен');
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = [
      '\uFEFFКод поля;Площадь (га);Тип почвы;Балл плодородия',
      'field_nord_1;180.5;суглинок;1.15',
      'field_nord_2;220.0;чернозём;1.28',
      'field_south_3;140.0;супесь;0.90',
      'field_east_4;260.0;суглинок;1.05',
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daos_fields_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success('Шаблон полей DAOS (.CSV) загружен');
  };

  const handleApplyDataset = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      error('Нет валидных строк для применения');
      return;
    }

    if (onDatasetApplied) {
      onDatasetApplied(validRows);
    }
    success(`Датасет (${validRows.length} полей) успешно применён!`);
    onClose();
  };

  const handleApplyPreset = (preset: FarmPreset) => {
    if (onDatasetApplied) {
      onDatasetApplied(preset.fields);
    }
    success(`Датасет хозяйства «${preset.name}» (${preset.areaHa} га) успешно загружен!`);
    onClose();
  };

  const totalAreaParsed = parsedRows.reduce((acc, r) => acc + (r.isValid ? r.area_ha : 0), 0);
  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <M3Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Агрономические датасеты DAOS"
      icon={<Database className="w-5 h-5 text-[var(--md-sys-color-primary)]" />}
      maxWidth="2xl"
      actions={
        <>
          <div className="mr-auto text-xs text-[var(--md-sys-color-on-surface-variant)] hidden sm:block">
            {activeScenario && (
              <span>
                Сценарий: <b>{activeScenario.name}</b>
              </span>
            )}
          </div>
          <M3Button variant="text" size="sm" onClick={onClose}>
            Отмена
          </M3Button>
          {activeTab === 'upload' && parsedRows.length > 0 && (
            <M3Button
              variant="filled"
              size="sm"
              onClick={handleApplyDataset}
              disabled={validCount === 0}
              icon={<Check className="w-4 h-4" />}
            >
              Применить ({validCount} полей)
            </M3Button>
          )}
        </>
      }
    >
      {/* Segmented Control */}
      <div className="flex justify-center mb-4">
        <M3SegmentedButton
          options={[
            {
              value: 'upload',
              label: 'Загрузка файла (.xlsx/.csv)',
              icon: <UploadCloud className="w-4 h-4" />,
            },
            {
              value: 'presets',
              label: 'Эталонные хозяйства РБ',
              icon: <Building2 className="w-4 h-4" />,
            },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'upload' | 'presets')}
        />
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-4">
          {/* Drag & Drop Surface */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/30'
                : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {isProcessing ? 'Обработка файла...' : 'Перетащите файл .XLSX или .CSV сюда'}
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm">
                Поддерживаются файлы Excel Microsoft 365, LibreOffice Calc и CSV с разделителями «;» или «,»
              </p>
            </div>
          </div>

          {/* Template Download actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[12px] text-xs">
            <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">
              Нужен готовый образец структуры колонок?
            </span>
            <div className="flex items-center gap-2">
              <M3Button
                variant="tonal"
                size="sm"
                onClick={handleDownloadXlsxTemplate}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
              >
                Шаблон Excel
              </M3Button>
              <M3Button
                variant="tonal"
                size="sm"
                onClick={handleDownloadCsvTemplate}
                icon={<FileText className="w-3.5 h-3.5 text-sky-600" />}
              >
                Шаблон CSV
              </M3Button>
            </div>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
                    Предпросмотр: {fileName}
                  </span>
                  <M3Badge tone="primary" size="sm">
                    {validCount} из {parsedRows.length} валидны
                  </M3Badge>
                  <M3Badge tone="neutral" size="sm">
                    {totalAreaParsed.toFixed(1)} га
                  </M3Badge>
                </div>
              </div>

              <div className="border border-[var(--md-sys-color-outline-variant)]/40 rounded-[12px] overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-bold sticky top-0 border-b border-[var(--md-sys-color-outline-variant)]/40">
                    <tr>
                      <th className="py-2.5 px-3">Код поля</th>
                      <th className="py-2.5 px-3 text-right">Площадь (га)</th>
                      <th className="py-2.5 px-3">Тип почвы</th>
                      <th className="py-2.5 px-3 text-right">Плодородие</th>
                      <th className="py-2.5 px-3 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/20 bg-[var(--md-sys-color-surface-container-lowest)]">
                    {parsedRows.map((r, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[var(--md-sys-color-surface-container-high)]/50 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono font-medium text-[var(--md-sys-color-on-surface)]">
                          {r.code}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--md-sys-color-on-surface)]">
                          {r.area_ha.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-[var(--md-sys-color-on-surface-variant)] capitalize">
                          {r.soil_type}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--md-sys-color-on-surface)]">
                          {r.soil_fertility.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {r.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-[var(--md-sys-color-primary)] inline" />
                          ) : (
                            <span
                              title={r.validationErrors.join(', ')}
                              className="inline-flex items-center gap-1 text-[var(--md-sys-color-error)] cursor-help"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Presets Tab */
        <div className="space-y-3">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-2">
            Выберите агропромышленный комплекс с предварительно откалиброванными контурами пашни по стандартам системы DAOS:
          </p>

          <div className="grid grid-cols-1 gap-3">
            {FARM_PRESETS.map((farm) => (
              <div
                key={farm.id}
                className="p-4 rounded-[16px] border border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--md-sys-color-on-surface)] text-sm">
                      {farm.name}
                    </span>
                    <M3Badge tone="primary" size="sm">
                      {farm.areaHa} га • {farm.fieldsCount} полей
                    </M3Badge>
                  </div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                    <span>{farm.region}</span>
                    <span>•</span>
                    <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                      {farm.soilType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] max-w-lg">
                    {farm.description}
                  </p>
                </div>

                <M3Button
                  variant="filled"
                  size="sm"
                  onClick={() => handleApplyPreset(farm)}
                  icon={<Check className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Загрузить
                </M3Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </M3Dialog>
  );
};
