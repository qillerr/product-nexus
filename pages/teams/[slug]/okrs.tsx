import { Error } from '@/components/shared';
import ObjectiveModal from '@/components/okrs/ObjectiveModal';
import ObjectiveCard from '@/components/okrs/ObjectiveCard';
import { KeyResultDraft } from '@/components/okrs/KeyResultsInput';
import useTeam from 'hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { Objective } from '@/types/okr';
import { useOkrs } from '../../../hooks/useOkrs';
import Toast from '@/components/shared/Toast';
import { useRouter } from 'next/router';

const Okrs = () => {
  const { t } = useTranslation('common');
  const { team, isError: teamError } = useTeam();
  const router = useRouter();
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
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null
  );
  // Auto-validation in modal
  const [modal_touched, setModalTouched] = useState<{ [key: string]: boolean }>(
    {}
  );
  // Key Results state for modal
  const [keyResults, setKeyResults] = useState<KeyResultDraft[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  // Pagination and OKR data logic
  const {
    objectives,
    total,
    isError,
    page,
    setPage,
    pageSize,
    createOrUpdateObjective,
    deleteObjective,
  } = useOkrs(team?.slug, 10);

  if (teamError) return <Error message={teamError.message} />;
  if (!team) return <Error message={t('team-not-found')} />;
  if (isError) return <Error message={t('error-loading-okrs')} />;

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setStatus('ACTIVE');
    setStartDate('');
    setEndDate('');
    setModalTouched({});
    setErrorMsg('');
    setKeyResults([]);
  };

  const formatDate = (dateStr: string) => (dateStr ? dateStr.slice(0, 10) : '');

  const openEditModal = (objective: Objective) => {
    setEditingObjective(objective);
    setTitle(objective.title);
    setDescription(objective.description || '');
    setStatus(objective.status);
    setStartDate(formatDate(objective.startDate));
    setEndDate(formatDate(objective.endDate));
    setKeyResults(
      objective.keyResults.map((kr) => ({
        title: kr.title,
        targetValue: kr.targetValue,
        unit: kr.unit,
      }))
    );
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    try {
      await createOrUpdateObjective(
        {
          title,
          description,
          status,
          startDate,
          endDate,
          keyResults,
        },
        editingObjective?.id
      );
      setShowModal(false);
      resetModal();
      setEditingObjective(null);
    } catch (err: any) {
      setToastMsg(err.message);
    } finally {
      setCreating(false);
      setModalTouched({});
      setShowModal(false);
    }
  };

  const handleDelete = async (objectiveId: string) => {
    setDeletingId(objectiveId);
    try {
      await deleteObjective(objectiveId);
    } catch (err: any) {
      setToastMsg(err.message);
    } finally {
      setDeletingId(null);
      setDropdownOpenId(null);
    }
  };

  // DEV: Test Toast button (only in development)
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="p-6">
      {/* DEV: Show Toast test button only in development */}
      {isDev && (
        <button
          className="mb-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={() => setToastMsg('This is a test toast!')}
        >
          {t('show-test-toast')}
        </button>
      )}

      <h1 className="text-2xl font-bold mb-4">
        {team.name}: {t('objectives-key-results')}
      </h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        {t('create-objective')}
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
        keyResults={keyResults}
        setKeyResults={setKeyResults}
      />

      {objectives.length === 0 && (
        <div className="text-gray-500">{t('no-okrs-found')}</div>
      )}
      {objectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          dropdownOpenId={dropdownOpenId}
          setDropdownOpenId={setDropdownOpenId}
          deletingId={deletingId}
          handleDelete={handleDelete}
          t={t}
          onEdit={openEditModal}
          onDetails={(obj) =>
            router.push(`/teams/${team?.slug}/okrs/${obj.id}`)
          }
        />
      ))}
      {/* Pagination controls */}
      {total > pageSize && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            {t('previous')}
          </button>
          <span className="px-2 py-1">
            {t('page')} {page}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page * pageSize >= total}
          >
            {t('next')}
          </button>
        </div>
      )}
      <Toast message={toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default Okrs;
