import { prisma } from '@/lib/prisma';
import type { ObjectiveStatus } from '@prisma/client';

export const getObjectivesByTeam = async (teamId: string) => {
  return prisma.objective.findMany({
    where: { teamId },
    include: {
      keyResults: true,
      initiatives: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createObjective = async (data) => {
  return prisma.objective.create({ data });
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
  }>
) => {
  return prisma.objective.update({
    where: { id, teamId },
    data,
  });
};