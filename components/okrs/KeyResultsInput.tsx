import { useState } from 'react';

export type KeyResultDraft = {
  title: string;
  targetValue: number;
  unit?: string;
};

export default function KeyResultsInput({
  keyResults,
  setKeyResults,
  t,
}: {
  keyResults: KeyResultDraft[];
  setKeyResults: (krs: KeyResultDraft[]) => void;
  t: (key: string) => string;
}) {
  const [krTitle, setKrTitle] = useState('');
  const [krTarget, setKrTarget] = useState('');
  const [krUnit, setKrUnit] = useState('');

  const addKeyResult = () => {
    if (!krTitle || !krTarget) return;
    setKeyResults([
      ...keyResults,
      { title: krTitle, targetValue: Number(krTarget), unit: krUnit || undefined },
    ]);
    setKrTitle('');
    setKrTarget('');
    setKrUnit('');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{t('Key Results')}</label>
      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder={t('Key Result title')}
          value={krTitle}
          onChange={e => setKrTitle(e.target.value)}
        />
        <input
          type="number"
          className="w-24 border rounded px-2 py-1"
          placeholder={t('Target')}
          value={krTarget}
          onChange={e => setKrTarget(e.target.value)}
        />
        <input
          type="text"
          className="w-16 border rounded px-2 py-1"
          placeholder={t('Unit')}
          value={krUnit}
          onChange={e => setKrUnit(e.target.value)}
        />
        <button
          type="button"
          className="px-2 py-1 bg-green-500 text-white rounded"
          onClick={addKeyResult}
        >
          {t('Add')}
        </button>
      </div>
      <ul className="list-disc ml-6">
        {keyResults.map((kr, idx) => (
          <li key={idx} className="flex items-center space-x-2">
            <span>
              {kr.title} ({kr.targetValue}
              {kr.unit && ` ${kr.unit}`})
            </span>
            <button
              type="button"
              className="text-xs text-red-500"
              onClick={() => setKeyResults(keyResults.filter((_, i) => i !== idx))}
            >
              {t('Remove')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}