import React, { useState, useEffect, useRef } from 'react';

interface StatusDropdownProps {
  value: string;
  options: string[];
  onSave: (val: string) => Promise<void>;
  className?: string;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  value,
  options,
  onSave,
  className = '',
}) => {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(value);
  const [error, setError] = useState('');
  const selectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (editing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    if (selected === value) {
      setEditing(false);
      return;
    }
    try {
      await onSave(selected);
      setEditing(false);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setSelected(value);
      setEditing(false);
      setError('');
    }
  };

  const baseClass =
    'inline-block align-baseline text-xs font-medium px-2 py-0.5 rounded transition';
  const displayClass =
    'bg-gray-100 hover:bg-gray-200 cursor-pointer ' +
    baseClass +
    ' ' +
    className;
  const selectClass =
    'bg-gray-100 border rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-400 ' +
    baseClass +
    ' ' +
    className;

  if (editing) {
    return (
      <span className={className}>
        <select
          ref={selectRef}
          value={selected}
          className={selectClass}
          onChange={(e) => setSelected(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
      </span>
    );
  }
  return (
    <span
      className={displayClass}
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setEditing(true);
      }}
      style={{ outline: editing ? '2px solid #60a5fa' : undefined }}
    >
      {value}
    </span>
  );
};

export default StatusDropdown;
