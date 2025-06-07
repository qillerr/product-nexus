import { prisma } from '@/lib/prisma';

export const getJiraLinksByKeyResult = async (keyResultId: string) => {
  return prisma.jiraIssueLink.findMany({
    where: { keyResultId },
    orderBy: { syncedAt: 'desc' },
  });
};

export const createJiraIssueLink = async (data) => {
  return prisma.jiraIssueLink.create({ data });
};
