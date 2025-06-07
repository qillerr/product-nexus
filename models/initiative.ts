import { prisma } from '@/lib/prisma';

export const getInitiativesByObjective = async (objectiveId: string) => {
  return prisma.initiative.findMany({
    where: { objectiveId },
    include: {
      jiraLinks: true,
      keyResults: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createInitiative = async (data) => {
  return prisma.initiative.create({ data });
};
