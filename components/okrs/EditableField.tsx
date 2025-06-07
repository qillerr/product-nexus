import React, { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
  value: string | number;
  onSave: (val: string) => Promise<void>;
  field: string;
  type?: string;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  multiline?: boolean;
  rows?: number;
  children?: React.ReactNode;
  error?: string;
  onFieldBlur?: (val: string) => void;
  onFieldChange?: (val: string) => void; // <-- added
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  type = 'text',
  className = '',
  inputClassName = '',
  placeholder = '',
  min,
  max,
  multiline = false,
  rows = 3,
  children,
  error: externalError, // <-- added
  onFieldBlur, // <-- added
  onFieldChange, // <-- added
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) (inputRef.current as HTMLInputElement).select();
    }
  }, [editing, multiline]);

  const handleSave = async () => {
    if (inputValue === value) {
      setEditing(false);
      return;
    }
    try {
      await onSave(inputValue as string);
      setEditing(false);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setInputValue(value);
      setEditing(false);
      setError('');
    }
    if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (editing) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-block',
          minWidth: 1,
          width: multiline ? '100%' : undefined,
        }}
      >
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={inputValue}
            rows={rows}
            placeholder={placeholder}
            className={`bg-gray-100 border rounded px-2 py-1 w-full resize-vertical shadow focus:shadow-lg transition-all duration-150 ${inputClassName}`}
            style={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              minHeight: '2.5em',
              height: 'auto',
              maxHeight: '16em',
              boxShadow: '0 2px 8px 0 #0001',
              overflow: 'auto',
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (onFieldChange) onFieldChange(e.target.value);
              const el = inputRef.current as HTMLTextAreaElement | null;
              if (el) {
                el.style.height = '2.5em';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            onBlur={(e) => {
              handleSave();
              if (onFieldBlur) onFieldBlur(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <input
            ref={inputRef as any}
            type={type}
            value={inputValue}
            min={min}
            max={max}
            placeholder={placeholder}
            className={`bg-gray-100 border rounded px-1 py-0.5 ${inputClassName}`}
            style={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              height: 'auto',
            }}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (onFieldChange) onFieldChange(e.target.value);
            }}
            onBlur={(e) => {
              handleSave();
              if (onFieldBlur) onFieldBlur(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />
        )}
        {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
        {externalError && (
          <span className="ml-2 text-xs text-red-500">{externalError}</span>
        )}
      </span>
    );
  }
  return (
    <span
      className={`${className} cursor-pointer transition bg-transparent hover:bg-gray-100 rounded px-1 block whitespace-pre-line`}
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setEditing(true);
      }}
      style={{
        outline: editing ? '2px solid #60a5fa' : undefined,
        minHeight: multiline ? '3.5em' : undefined,
      }}
    >
      {children ||
        (value ? value : <span className="text-gray-400">{placeholder}</span>)}
    </span>
  );
};

export default EditableField;
