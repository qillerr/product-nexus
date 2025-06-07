import React from 'react';
import EditableField from './EditableField';
import StatusDropdown from './StatusDropdown';
import { Objective, KeyResult } from '@/types/okr';
import { useTranslation } from 'next-i18next';

// NewKeyResult is the same as KeyResult but unit is always a string (not undefined)
type NewKeyResult = Omit<KeyResult, 'id' | 'unit'> & {
  id: string;
  unit: string;
};

interface ObjectiveDetailsProps {
  objective: Objective;
  onPatchObjective: (patch: Partial<Objective>) => Promise<void>;
  onPatchKeyResult: (krId: string, patch: any) => Promise<void>;
  createKeyResult: (kr: NewKeyResult) => Promise<void>;
  deleteKeyResult: (krId: string) => Promise<void>;
}

const ObjectiveDetails: React.FC<ObjectiveDetailsProps> = ({
  objective,
  onPatchObjective,
  onPatchKeyResult,
  createKeyResult,
  deleteKeyResult,
}) => {
  const { t } = useTranslation('common');
  const [newKeyResults, setNewKeyResults] = React.useState<NewKeyResult[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<{
    [key: string]: string;
  }>({});
  const [krFieldErrors, setKrFieldErrors] = React.useState<{
    [id: string]: string;
  }>({});

  const handleAddKeyResult = () => {
    setNewKeyResults([
      ...newKeyResults,
      {
        id: `new-${Date.now()}`,
        title: '',
        currentValue: 0,
        targetValue: 0,
        unit: '',
        status: 'IN_PROGRESS',
      },
    ]);
  };

  const handleEditNewKeyResult = (
    idx: number,
    field: keyof NewKeyResult,
    value: any
  ) => {
    setNewKeyResults((krs) => {
      const copy = [...krs];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const validateObjectiveField = (field: string, value: string) => {
    if (!value || value.trim() === '') {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: t('field-required'),
      }));
      return false;
    } else {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      return true;
    }
  };

  const validateNewKeyResult = (kr: NewKeyResult) => {
    if (!kr.title || kr.title.trim() === '') {
      setKrFieldErrors((prev) => ({
        ...prev,
        [kr.id]: t('title-required'),
      }));
      return false;
    } else {
      setKrFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[kr.id];
        return copy;
      });
      return true;
    }
  };

  const handleSaveObjectiveField = async (
    field: keyof Objective,
    value: string
  ) => {
    if (!validateObjectiveField(field, value)) return;
    await onPatchObjective({ [field]: value });
  };

  const handleSaveNewKeyResult = async (idx: number) => {
    const kr = newKeyResults[idx];
    if (!validateNewKeyResult(kr)) return;
    await createKeyResult(kr);
    setNewKeyResults((krs) => krs.filter((_, i) => i !== idx));
  };

  const handleFieldBlur = (field: keyof Objective, value: string) => {
    validateObjectiveField(field, value);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">
        <EditableField
          value={objective.title}
          onSave={(val) => handleSaveObjectiveField('title', val)}
          field="title"
          className="inline-block align-baseline"
          inputClassName="text-2xl font-bold align-baseline"
          placeholder={t('objective-title')}
          error={fieldErrors.title}
          onFieldBlur={(val) => handleFieldBlur('title', val)}
          onFieldChange={(val) => validateObjectiveField('title', val)}
        />
      </h1>
      <p className="text-gray-600 mb-2">
        <EditableField
          value={objective.description || ''}
          onSave={(val) => onPatchObjective({ description: val })}
          field="description"
          className="inline-block align-baseline w-full"
          inputClassName="text-base align-baseline"
          placeholder={t('objective-description')}
          multiline
          rows={4}
        />
      </p>
      <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
        <StatusDropdown
          value={objective.status}
          options={['ACTIVE', 'COMPLETED', 'ARCHIVED']}
          onSave={(val) => onPatchObjective({ status: val })}
          className="inline-block"
        />
        <span>|</span>
        <EditableField
          value={objective.startDate.slice(0, 10)}
          onSave={(val) => handleSaveObjectiveField('startDate', val)}
          field="startDate"
          type="date"
          className="inline-block"
          inputClassName="text-xs"
          placeholder="YYYY-MM-DD"
          error={fieldErrors.startDate}
          onFieldBlur={(val) => handleFieldBlur('startDate', val)}
          onFieldChange={(val) => validateObjectiveField('startDate', val)}
        />
        <span>-</span>
        <EditableField
          value={objective.endDate.slice(0, 10)}
          onSave={(val) => handleSaveObjectiveField('endDate', val)}
          field="endDate"
          type="date"
          className="inline-block"
          inputClassName="text-xs"
          placeholder="YYYY-MM-DD"
          error={fieldErrors.endDate}
          onFieldBlur={(val) => handleFieldBlur('endDate', val)}
          onFieldChange={(val) => validateObjectiveField('endDate', val)}
        />
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">{t('key-results')}</h2>
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleAddKeyResult}
            type="button"
          >
            + {t('add-key-result')}
          </button>
        </div>
        <ul className="list-disc ml-6">
          {objective.keyResults.map((kr) => (
            <li
              key={kr.id}
              className="mb-1 flex items-center group hover:bg-gray-50 rounded px-2 transition relative"
            >
              <div className="flex items-center space-x-2 flex-1 group/keyresult">
                <EditableField
                  value={kr.title}
                  onSave={(val) => onPatchKeyResult(kr.id, { title: val })}
                  field="title"
                  className="font-medium align-baseline"
                  inputClassName="font-medium align-baseline"
                  placeholder={t('key-result-title-lower')}
                />
                <EditableField
                  value={kr.currentValue}
                  onSave={(val) =>
                    onPatchKeyResult(kr.id, { currentValue: Number(val) })
                  }
                  field="currentValue"
                  type="number"
                  className="ml-2 text-sm text-gray-500 align-baseline"
                  inputClassName="w-16 text-sm text-gray-500 align-baseline"
                  placeholder={t('current')}
                />
                <span className="text-sm text-gray-500">/</span>
                <EditableField
                  value={kr.targetValue}
                  onSave={(val) =>
                    onPatchKeyResult(kr.id, { targetValue: Number(val) })
                  }
                  field="targetValue"
                  type="number"
                  className="text-sm text-gray-500 align-baseline"
                  inputClassName="w-16 text-sm text-gray-500 align-baseline"
                  placeholder={t('target')}
                />
                <EditableField
                  value={kr.unit || ''}
                  onSave={(val) => onPatchKeyResult(kr.id, { unit: val })}
                  field="unit"
                  className="ml-1 text-sm text-gray-500 align-baseline"
                  inputClassName="text-sm text-gray-500 align-baseline"
                  placeholder={t('unit')}
                />
                <StatusDropdown
                  value={kr.status}
                  options={['IN_PROGRESS', 'ACHIEVED', 'BLOCKED', 'DROPPED']}
                  onSave={(val) => onPatchKeyResult(kr.id, { status: val })}
                  className="ml-2 text-xs text-gray-400 align-baseline"
                />
              </div>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group/keyresult-hover:opacity-100 transition-opacity px-2 py-0.5 text-xs text-white bg-gray-400 hover:bg-red-500 hover:text-white rounded-full focus:outline-none"
                onClick={() => deleteKeyResult(kr.id)}
                type="button"
                aria-label={t('remove-key-result')}
                title={t('remove-key-result')}
              >
                {t('remove-key-result-x')}
              </button>
            </li>
          ))}
          {newKeyResults.map((kr, idx) => (
            <li
              key={kr.id}
              className="mb-1 flex items-center space-x-2 bg-blue-50 rounded px-2 py-1"
            >
              <EditableField
                value={kr.title}
                onSave={(val) =>
                  Promise.resolve(handleEditNewKeyResult(idx, 'title', val))
                }
                field="title"
                className="font-medium align-baseline"
                inputClassName="font-medium align-baseline"
                placeholder={t('key-result-title-lower')}
                error={krFieldErrors[kr.id]}
              />
              <EditableField
                value={kr.currentValue}
                onSave={(val) =>
                  Promise.resolve(
                    handleEditNewKeyResult(idx, 'currentValue', Number(val))
                  )
                }
                field="currentValue"
                type="number"
                className="ml-2 text-sm text-gray-500 align-baseline"
                inputClassName="w-16 text-sm text-gray-500 align-baseline"
                placeholder={t('current')}
              />
              <span className="text-sm text-gray-500">/</span>
              <EditableField
                value={kr.targetValue}
                onSave={(val) =>
                  Promise.resolve(
                    handleEditNewKeyResult(idx, 'targetValue', Number(val))
                  )
                }
                field="targetValue"
                type="number"
                className="text-sm text-gray-500 align-baseline"
                inputClassName="w-16 text-sm text-gray-500 align-baseline"
                placeholder={t('target')}
              />
              <EditableField
                value={kr.unit || ''}
                onSave={(val) =>
                  Promise.resolve(handleEditNewKeyResult(idx, 'unit', val))
                }
                field="unit"
                className="ml-1 text-sm text-gray-500 align-baseline"
                inputClassName="text-sm text-gray-500 align-baseline"
                placeholder={t('unit')}
              />
              <StatusDropdown
                value={kr.status}
                options={['IN_PROGRESS', 'ACHIEVED', 'BLOCKED', 'DROPPED']}
                onSave={(val) =>
                  Promise.resolve(handleEditNewKeyResult(idx, 'status', val))
                }
                className="ml-2 text-xs text-gray-400 align-baseline"
              />
              <button
                className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                onClick={() => handleSaveNewKeyResult(idx)}
                type="button"
                disabled={!kr.title || kr.title.trim() === ''}
              >
                {t('save')}
              </button>
              <button
                className="ml-1 px-2 py-0.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() =>
                  setNewKeyResults((krs) => krs.filter((_, i) => i !== idx))
                }
                type="button"
                aria-label={t('remove-key-result')}
                title={t('remove-key-result')}
              >
                {t('remove-key-result-x')}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-1">{t('initiatives')}</h2>
        <ul className="list-disc ml-6">
          {objective.initiatives.map((init) => (
            <li key={init.id}>
              {init.title}{' '}
              <span className="ml-2 text-xs text-gray-400">{init.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ObjectiveDetails;
