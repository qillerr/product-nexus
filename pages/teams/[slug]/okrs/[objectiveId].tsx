import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Objective } from '@/types/okr';
import { Loading, Error } from '@/components/shared';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ObjectivePage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug, objectiveId } = router.query;

  const { data, error, isLoading, mutate } = useSWR<{ data: Objective }>(
    slug && objectiveId ? `/api/teams/${slug}/okrs/${objectiveId}` : null,
    fetcher
  );

  const [editingKrId, setEditingKrId] = useState<string | null>(null);
  const [krProgress, setKrProgress] = useState<string>('');
  const [krError, setKrError] = useState<string>('');

  if (isLoading) return <Loading />;
  if (error) return <Error message={t('error-loading-okrs')} />;
  if (!data?.data) return <Error message={t('Objective not found')} />;

  const objective = data.data;

  const handleEditKr = (krId: string, currentValue: number) => {
    setEditingKrId(krId);
    setKrProgress(currentValue.toString());
    setKrError('');
  };

  const handleSaveKr = async (krId: string) => {
    setKrError('');
    try {
      const res = await fetch(`/api/teams/${slug}/okrs/${objectiveId}/key-results/${krId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: Number(krProgress) }),
      });
      if (!res.ok) {
        const json = await res.json();
        setKrError(json.error?.message || t('Failed to update progress'));
        return;
      }
      setEditingKrId(null);
      setKrProgress('');
      mutate();
    } catch (err: any) {
      setKrError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        className="mb-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 flex items-center"
        onClick={() => router.back()}
      >
        <span className="mr-2" aria-hidden>←</span> {t('Back')}
      </button>
      <h1 className="text-2xl font-bold mb-2">{objective.title}</h1>
      <p className="text-gray-600 mb-2">{objective.description}</p>
      <div className="text-xs text-gray-400 mb-4">
        {objective.status} | {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-1">{t('Key Results')}</h2>
        <ul className="list-disc ml-6">
          {objective.keyResults.map(kr => (
            <li key={kr.id} className="mb-1 flex items-center space-x-2">
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
              {editingKrId === kr.id ? (
                <>
                  <input
                    type="number"
                    className="ml-2 border rounded px-2 py-1 w-20"
                    value={krProgress}
                    onChange={e => setKrProgress(e.target.value)}
                  />
                  <button
                    className="ml-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={() => handleSaveKr(kr.id)}
                  >
                    {t('Save')}
                  </button>
                  <button
                    className="ml-1 px-2 py-1 bg-gray-300 rounded text-xs"
                    onClick={() => setEditingKrId(null)}
                  >
                    {t('Cancel')}
                  </button>
                  {krError && <span className="ml-2 text-xs text-red-500">{krError}</span>}
                </>
              ) : (
                <button
                  className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                  onClick={() => handleEditKr(kr.id, kr.currentValue)}
                >
                  {t('Edit Progress')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-1">{t('Initiatives')}</h2>
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
};

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
}

export default ObjectivePage;
