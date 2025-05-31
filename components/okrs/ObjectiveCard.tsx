import React from 'react';
import { Objective, KeyResult, Initiative } from '@/types/okr';

interface ObjectiveCardProps {
  objective: Objective;
  dropdownOpenId: string | null;
  setDropdownOpenId: (id: string | null) => void;
  deletingId: string | null;
  handleDelete: (id: string) => void;
  t: (key: string) => string;
  onEdit?: (objective: Objective) => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  dropdownOpenId,
  setDropdownOpenId,
  deletingId,
  handleDelete,
  t,
  onEdit,
}) => (
  <div className="mb-8 border rounded p-4 shadow relative">
    {/* Dropdown button in top-right */}
    <div className="absolute top-2 right-2 z-10">
      <button
        className="p-2 rounded hover:bg-gray-100"
        onClick={() =>
          setDropdownOpenId(dropdownOpenId === objective.id ? null : objective.id)
        }
        aria-label="More"
      >
        <span style={{ fontSize: 20 }}>⋯</span>
      </button>
      {dropdownOpenId === objective.id && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-20">
          <button
            className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
            onClick={() => onEdit && onEdit(objective)}
            disabled={!!deletingId}
          >
            {t('Edit')}
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            onClick={() => handleDelete(objective.id)}
            disabled={deletingId === objective.id}
          >
            {deletingId === objective.id ? t('Deleting...') : t('Delete')}
          </button>
        </div>
      )}
    </div>
    {/* Objective details */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">{objective.title}</h2>
        <p className="text-gray-600">{objective.description}</p>
        <div className="text-xs text-gray-400">
          {objective.status} | {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
        </div>
      </div>
    </div>
    <div className="mt-4">
      <h3 className="font-semibold">{t('Key Results')}</h3>
      <ul className="list-disc ml-6">
        {objective.keyResults.map(kr => (
          <li key={kr.id} className="mb-1">
            <span className="font-medium">{kr.title}</span>
            {kr.unit && (
              <span className="ml-2 text-sm text-gray-500">
                ({kr.currentValue} / {kr.targetValue} {kr.unit})
              </span>
            )}
            {!kr.unit && (
              <span className="ml-2 text-sm text-gray-500">
                ({kr.currentValue} / {kr.targetValue})
              </span>
            )}
            <span className="ml-2 text-xs text-gray-400">{kr.status}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="mt-4">
      <h3 className="font-semibold">{t('Initiatives')}</h3>
      <ul className="list-disc ml-6">
        {objective.initiatives.map(init => (
          <li key={init.id}>
            {init.title} <span className="ml-2 text-xs text-gray-400">{init.status}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ObjectiveCard;
