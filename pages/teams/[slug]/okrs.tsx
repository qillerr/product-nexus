import { Loading, Error } from '@/components/shared';
import ObjectiveModal from '@/components/okrs/ObjectiveModal';
import ObjectiveCard from '@/components/okrs/ObjectiveCard';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useSWR, { mutate } from 'swr';
import { useEffect, useRef, useState } from 'react';
import { Objective, KeyResult, Initiative } from '@/types/okr';

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
  // Edit
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
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

  const formatDate = (dateStr: string) => dateStr ? dateStr.slice(0, 10) : '';

  const openEditModal = (objective: Objective) => {
    setEditingObjective(objective);
    setTitle(objective.title);
    setDescription(objective.description || '');
    setStatus(objective.status);
    setStartDate(formatDate(objective.startDate));
    setEndDate(formatDate(objective.endDate));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    try {
      const url = editingObjective
        ? `/api/teams/${team.slug}/okrs/${editingObjective.id}`
        : `/api/teams/${team.slug}/okrs`;
      const method = editingObjective ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
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
        setErrorMsg(json.error?.message || (editingObjective ? 'Failed to update objective' : 'Failed to create objective'));
        return;
      }
      setShowModal(false);
      resetModal();
      setEditingObjective(null);
      mutate(`/api/teams/${team.slug}/okrs`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
      setModalTouched({});
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

      <ObjectiveModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetModal();
          setEditingObjective(null);
        }}
        onSubmit={handleSubmit}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        status={status}
        setStatus={setStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        creating={creating}
        errorMsg={errorMsg}
        modal_touched={modal_touched}
        setModalTouched={setModalTouched}
        isEdit={!!editingObjective}
      />

      {Array.isArray(data?.data) && data.data.length === 0 && (
        <div className="text-gray-500">{t('No OKRs found for this team.')}</div>
      )}
      {Array.isArray(data?.data) && data.data.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          dropdownOpenId={dropdownOpenId}
          setDropdownOpenId={setDropdownOpenId}
          deletingId={deletingId}
          handleDelete={handleDelete}
          t={t}
          onEdit={openEditModal}
        />
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