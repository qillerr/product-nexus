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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const [objectives, total] = await Promise.all([
    getObjectivesByTeam(teamMember.team.id, { skip, take: limit }),
    getObjectivesByTeam(teamMember.team.id, { countOnly: true }),
  ]);
  res.status(200).json({ data: objectives, total });
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'okr', 'create');
  const { title, description, status, startDate, endDate, keyResults } = req.body;
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
    keyResults: keyResults || [],
  });
  res.status(201).json({ data: objective });
};