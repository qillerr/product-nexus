import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Objective } from '@/types/okr';

export function useOkrs(teamSlug: string | undefined, pageSize = 10) {
  const [page, setPage] = useState(1);
  const key = teamSlug
    ? `/api/teams/${teamSlug}/okrs?page=${page}&limit=${pageSize}`
    : null;
  const { data, error, isLoading } = useSWR<{ data: Objective[]; total: number }>(key, url => fetch(url).then(res => res.json()));

  const refresh = () => {
    if (key) mutate(key);
  };

  const createOrUpdateObjective = async (payload: any, editingObjectiveId?: string) => {
    const url = editingObjectiveId
      ? `/api/teams/${teamSlug}/okrs/${editingObjectiveId}`
      : `/api/teams/${teamSlug}/okrs`;
    const method = editingObjectiveId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error?.message || (editingObjectiveId ? 'Failed to update objective' : 'Failed to create objective'));
    }
    refresh();
  };

  const deleteObjective = async (objectiveId: string) => {
    const url = `/api/teams/${teamSlug}/okrs/${objectiveId}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error?.message || 'Failed to delete objective');
    }
    refresh();
  };

  return {
    objectives: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    error,
    page,
    setPage,
    pageSize,
    createOrUpdateObjective,
    deleteObjective,
    refresh,
  };
}
