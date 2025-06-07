import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Toast from '@/components/shared/Toast';
import ObjectiveDetails from '@/components/okrs/ObjectiveDetails';
import { useObjectiveDetails } from 'hooks/useObjectiveDetails';
import { Loading, Error } from '@/components/shared';

const ObjectivePage = () => {
  const { t } = useTranslation('common');
  const {
    objective,
    isLoading,
    error,
    patchObjective,
    patchKeyResult,
    createKeyResult,
    deleteKeyResult,
    toast,
    setToast,
    goBack,
  } = useObjectiveDetails();

  if (isLoading) return <Loading />;
  if (error) return <Error message={t('error-loading-okrs')} />;
  if (!objective) return <Error message={t('objective-not-found')} />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        className="mb-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 flex items-center"
        onClick={goBack}
      >
        <span className="mr-2" aria-hidden>
          ←
        </span>{' '}
        {t('back')}
      </button>
      <ObjectiveDetails
        objective={objective}
        onPatchObjective={patchObjective}
        onPatchKeyResult={patchKeyResult}
        createKeyResult={createKeyResult}
        deleteKeyResult={deleteKeyResult}
      />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
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

export default ObjectivePage;
