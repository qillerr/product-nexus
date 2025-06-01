import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useState } from 'react';
import { Objective } from '@/types/okr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useObjectiveDetails() {
  const router = useRouter();
  const { slug, objectiveId } = router.query;

  const { data, error, isLoading, mutate } = useSWR<{ data: Objective }>(
    slug && objectiveId ? `/api/teams/${slug}/okrs/${objectiveId}` : null,
    fetcher
  );

  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const patchObjective = async (patch: Partial<Objective>) => {
    try {
      const res = await fetch(`/api/teams/${slug}/okrs/${objectiveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const json = await res.json();
        throw Error(json.error?.message || 'Failed to update');
      }
      mutate();
    } catch (e: any) {
      showToast(e.message);
      throw e;
    }
  };

  const patchKeyResult = async (krId: string, patch: any) => {
    try {
      const res = await fetch(`/api/teams/${slug}/okrs/${objectiveId}/key-results/${krId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const json = await res.json();
        throw Error(json.error?.message || 'Failed to update key result');
      }
      mutate();
    } catch (e: any) {
      showToast(e.message);
      throw e;
    }
  };

  const createKeyResult = async (kr: any) => {
    try {
      const res = await fetch(`/api/teams/${slug}/okrs/${objectiveId}/key-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kr),
      });
      if (!res.ok) {
        const json = await res.json();
        throw Error(json.error?.message || 'Failed to create key result');
      }
      mutate();
    } catch (e: any) {
      showToast(e.message);
      throw e;
    }
  };

  const deleteKeyResult = async (krId: string) => {
    try {
      const res = await fetch(`/api/teams/${slug}/okrs/${objectiveId}/key-results/${krId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw Error(json.error?.message || 'Failed to delete key result');
      }
      mutate();
    } catch (e: any) {
      showToast(e.message);
      throw e;
    }
  };

  return {
    objective: data?.data,
    isLoading,
    error,
    patchObjective,
    patchKeyResult,
    createKeyResult,
    deleteKeyResult,
    toast,
    setToast,
    goBack: () => router.back(),
  };
}

export default useObjectiveDetails;
