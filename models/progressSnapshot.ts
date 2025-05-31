import { prisma } from '@/lib/prisma';

export const getSnapshotsByKeyResult = async (keyResultId: string) => {
  return prisma.progressSnapshot.findMany({
    where: { keyResultId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createProgressSnapshot = async (data) => {
  return prisma.progressSnapshot.create({ data });
};