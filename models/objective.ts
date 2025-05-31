import { prisma } from '@/lib/prisma';
import type { ObjectiveStatus } from '@prisma/client';

export const getObjectivesByTeam = async (
  teamId: string,
  opts?: { skip?: number; take?: number; countOnly?: boolean }
) => {
  if (opts?.countOnly) {
    return prisma.objective.count({ where: { teamId } });
  }
  return prisma.objective.findMany({
    where: { teamId },
    include: {
      keyResults: true,
      initiatives: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take,
  });
};

export const createObjective = async (data: any) => {
  const { keyResults, ...objectiveData } = data;
  return prisma.objective.create({
    data: {
      ...objectiveData,
      keyResults: keyResults && Array.isArray(keyResults)
        ? {
            create: keyResults.map(kr => ({
              title: kr.title,
              targetValue: kr.targetValue,
              currentValue: kr.currentValue ?? 0,
              unit: kr.unit,
              status: kr.status ?? 'IN_PROGRESS',
            })),
          }
        : undefined,
    },
    include: {
      keyResults: true,
      initiatives: true,
    },
  });
};

export const deleteObjective = async (id: string, teamId: string) => {
  return prisma.objective.delete({
    where: { id, teamId },
  });
};

export const updateObjective = async (
  id: string,
  teamId: string,
  data: Partial<{
    title: string;
    description: string;
    status: ObjectiveStatus;
    startDate: Date;
    endDate: Date;
    keyResults: any[];
  }>
) => {
  const { keyResults, ...objectiveData } = data;
  // For simplicity: delete all and recreate (production: use diff logic)
  if (keyResults) {
    await prisma.keyResult.deleteMany({ where: { objectiveId: id } });
  }
  return prisma.objective.update({
    where: { id, teamId },
    data: {
      ...objectiveData,
      keyResults: keyResults
        ? {
            create: keyResults.map(kr => ({
              title: kr.title,
              targetValue: kr.targetValue,
              currentValue: kr.currentValue ?? 0,
              unit: kr.unit,
              status: kr.status ?? 'IN_PROGRESS',
            })),
          }
        : undefined,
    },
    include: {
      keyResults: true,
      initiatives: true,
    },
  });
};