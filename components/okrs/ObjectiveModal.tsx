import Modal from '@/components/shared/Modal';
import { useTranslation } from 'next-i18next';
import React from 'react';

interface ObjectiveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
  errorMsg: string;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  modal_touched: { [key: string]: boolean };
  setModalTouched: (v: { [key: string]: boolean }) => void;
  isEdit?: boolean;
}

const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  open,
  onClose,
  onSubmit,
  creating,
  errorMsg,
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  modal_touched,
  setModalTouched,
  isEdit = false,
}) => {
  const { t } = useTranslation('common');
  const modal_errors = {
    title: !title,
    startDate: !startDate,
    endDate: !endDate,
  };

  return (
    <Modal open={open} close={onClose}>
      <Modal.Header>{isEdit ? t('Edit Objective') : t('Create Objective')}</Modal.Header>
      <Modal.Body>
        <form className="space-y-4" onSubmit={onSubmit} id="objective-form">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="objective-title">
              {t('Title')}
            </label>
            <input
              id="objective-title"
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder={t('Enter objective title')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setModalTouched({ ...modal_touched, title: true })}
              required
            />
            {modal_touched.title && modal_errors.title && (
              <div className="text-xs text-red-500 mt-1">* {t('Field required')}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="objective-description">
              {t('Description')}
            </label>
            <textarea
              id="objective-description"
              className="w-full border rounded px-3 py-2"
              placeholder={t('Enter objective description')}
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="objective-status">
              {t('Status')}
            </label>
            <select
              id="objective-status"
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="ACTIVE">{t('Active')}</option>
              <option value="COMPLETED">{t('Completed')}</option>
              <option value="ARCHIVED">{t('Archived')}</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" htmlFor="objective-start-date">
                {t('Start Date')}
              </label>
              <input
                id="objective-start-date"
                type="date"
                className="w-full border rounded px-3 py-2"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                onBlur={() => setModalTouched({ ...modal_touched, startDate: true })}
                required
              />
              {modal_touched.startDate && modal_errors.startDate && (
                <div className="text-xs text-red-500 mt-1">* {t('Field required')}</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" htmlFor="objective-end-date">
                {t('End Date')}
              </label>
              <input
                id="objective-end-date"
                type="date"
                className="w-full border rounded px-3 py-2"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                onBlur={() => setModalTouched({ ...modal_touched, endDate: true })}
                required
              />
              {modal_touched.endDate && modal_errors.endDate && (
                <div className="text-xs text-red-500 mt-1">* {t('Field required')}</div>
              )}
            </div>
          </div>
          {errorMsg && <div className="text-red-500">{errorMsg}</div>}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          className="px-4 py-2 bg-gray-200 rounded mr-2"
          onClick={onClose}
          type="button"
          disabled={creating}
        >
          {t('Cancel')}
        </button>
        <button
          className={`px-4 py-2 bg-blue-600 text-white rounded
                ${creating || !title || !startDate || !endDate
              ? 'bg-blue-300 cursor-not-allowed opacity-60'
              : 'bg-blue-600 hover:bg-blue-700'}
            `}
          type="submit"
          form="objective-form"
          disabled={creating || !title || !startDate || !endDate}
        >
          {creating ? (isEdit ? t('Saving...') : t('Creating...')) : (isEdit ? t('Save') : t('Create'))}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ObjectiveModal;
