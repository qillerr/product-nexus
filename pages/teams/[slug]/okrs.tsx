import { Loading, Error } from '@/components/shared';
import Modal from '@/components/shared/Modal';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useSWR, { mutate } from 'swr';
import { useEffect, useRef, useState } from 'react';

type KeyResult = {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: string;
};

type Initiative = {
  id: string;
  title: string;
  status: string;
};

type Objective = {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  keyResults: KeyResult[];
  initiatives: Initiative[];
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Okrs = () => {
  const { t } = useTranslation('common');
  const { team, isLoading, isError } = useTeam();
  // Modal
  const [showModal, setShowModal] = useState(false);
  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Delete
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Auto-validation in modal
  const [modal_touched, setModalTouched] = useState<{ [key: string]: boolean }>({});

  

  const { data, error } = useSWR<{ data: Objective[] }>(
    team ? `/api/teams/${team.slug}/okrs` : null,
    fetcher
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error message={isError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;
  if (error) return <Error message={t('error-loading-okrs')} />;

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setStatus('ACTIVE');
    setStartDate('');
    setEndDate('');
    setModalTouched({});
    setErrorMsg('');
  };


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/teams/${team.slug}/okrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          startDate,
          endDate,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        return <Error message={json.error?.message || 'Failed to create objective'} />;
      }
      setShowModal(false);
      setTitle('');
      setDescription('');
      setStatus('ACTIVE');
      setStartDate('');
      setEndDate('');
      mutate(`/api/teams/${team.slug}/okrs`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
      setModalTouched({});
      resetModal();
      setShowModal(false);
    }
  };

  const handleDelete = async (objectiveId: string) => {
    setDeletingId(objectiveId);
    try {
      const res = await fetch(`/api/teams/${team.slug}/okrs/${objectiveId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        setErrorMsg(json.error?.message || 'Failed to delete objective');
        return;
      }
      mutate(`/api/teams/${team.slug}/okrs`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setDeletingId(null);
      setDropdownOpenId(null);
    }
  };

  // Validation logic
  const modal_errors = {
    title: !title,
    startDate: !startDate,
    endDate: !endDate,
  };



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {team.name}: {t('Objectives & Key Results')}
      </h1>


      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        {t('Create Objective')}
      </button>

      <Modal open={showModal} close={() => setShowModal(false)}>
        <Modal.Header>{t('Create Objective')}</Modal.Header>
        <Modal.Body>
          <form className="space-y-4" onSubmit={handleCreate}>
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
            onClick={() => setShowModal(false)}
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
            onClick={handleCreate}
          >
            {creating ? t('Creating...') : t('Create')}
          </button>
        </Modal.Footer>
      </Modal>     


      {Array.isArray(data?.data) && data.data.length === 0 && (
        <div className="text-gray-500">{t('No OKRs found for this team.')}</div>
      )}
      {Array.isArray(data?.data) && data.data.map((objective) => (
        <div key={objective.id} className="mb-8 border rounded p-4 shadow relative">
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
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => handleDelete(objective.id)}
                  disabled={deletingId === objective.id}
                >
                  {deletingId === objective.id ? t('Deleting...') : t('Delete')}
                </button>
              </div>
            )}
          </div>
          { /* Objective details */}
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
      ))}
    </div>
  );
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Okrs;