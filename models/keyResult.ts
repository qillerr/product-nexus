import { prisma } from '@/lib/prisma';

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

export const createKeyResult = async (data) => {
  return prisma.keyResult.create({ data });
};

export const updateKeyResult = async (id: string, objectiveId: string, currentValue: number) => {
  return prisma.keyResult.update({
    where: { id, objectiveId },
    data: { currentValue },
  });
};