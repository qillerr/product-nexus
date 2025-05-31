import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectiveStatus } from '@prisma/client';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { getObjectivesByTeam, createObjective } from 'models/objective';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    console.error('OKRs API error:', error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'okr', 'read');
  const objectives = await getObjectivesByTeam(teamMember.team.id);
  res.status(200).json({ data: objectives });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'okr', 'create');
  const { title, description, status, startDate, endDate } = req.body;
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: { message: 'Missing required fields' } });
  }
  const objective = await createObjective({
    teamId: teamMember.team.id,
    title,
    description: description || '',
    status: status || ObjectiveStatus.ACTIVE,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });
  res.status(201).json({ data: objective });
};