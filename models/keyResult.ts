import { prisma } from '@/lib/prisma';
import type { KeyResultStatus } from '@prisma/client';

export const getKeyResultsByObjective = async (objectiveId: string) => {
  return prisma.keyResult.findMany({
    where: { objectiveId },
    include: {
      jiraLinks: true,
      snapshots: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createKeyResult = async (objectiveId: string, data: any) => {
  return prisma.keyResult.create({
    data: {
      ...data,
      objectiveId,
    },
  });
};

export const updateKeyResult = async (
  id: string,
  objectiveId: string,
  currentValue: number
) => {
  return prisma.keyResult.update({
    where: { id, objectiveId },
    data: { currentValue },
  });
};

export const patchKeyResult = async (
  id: string,
  objectiveId: string,
  data: Partial<{
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    status: KeyResultStatus;
  }>
) => {
  // Convert status string to enum if present
  const patchData = { ...data };
  if (patchData.status && typeof patchData.status === 'string') {
    patchData.status = patchData.status as KeyResultStatus;
  }
  return prisma.keyResult.update({
    where: { id, objectiveId },
    data: patchData,
  });
};

export const deleteKeyResult = async (id: string) => {
  return prisma.keyResult.delete({ where: { id } });
};
