import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectiveStatus } from '@prisma/client';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { updateObjective, deleteObjective } from 'models/objective';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { objectiveId } = query;

  try {
    const teamMember = await throwIfNoTeamAccess(req, res);

    switch (method) {
      case 'PUT': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        const { title, description, status, startDate, endDate } = body;
        if (!title || !startDate || !endDate) {
          return res.status(400).json({ error: { message: 'Missing required fields' } });
        }
        const updated = await updateObjective(
          objectiveId as string,
          teamMember.team.id,
          {
            title,
            description: description || '',
            status: status || ObjectiveStatus.ACTIVE,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        );
        res.status(200).json({ data: updated });
        break;
      }
      case 'DELETE': {
        throwIfNotAllowed(teamMember, 'okr', 'delete');
        await deleteObjective(objectiveId as string, teamMember.team.id);
        res.status(204).end();
        break;
      }
      default:
        res.setHeader('Allow', 'PUT, DELETE');
        res.status(405).json({ error: { message: `Method ${method} Not Allowed` } });
    }
  } catch (error: any) {
    console.error('Objective API error:', error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}