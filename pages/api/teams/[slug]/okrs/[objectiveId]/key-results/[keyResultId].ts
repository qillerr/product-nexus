import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { updateKeyResult } from 'models/keyResult';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const { slug, objectiveId, keyResultId } = query;

  try {
    const teamMember = await throwIfNoTeamAccess(req, res);
    switch (method) {
      case 'PUT': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        const { currentValue } = body;
        if (typeof currentValue !== 'number') {
          return res.status(400).json({ error: { message: 'Invalid value' } });
        }
        const updated = await updateKeyResult(keyResultId as string, objectiveId as string, currentValue);
        res.status(200).json({ data: updated });
        break;
      }
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({ error: { message: `Method ${method} Not Allowed` } });
    }
  } catch (error: any) {
    console.error('KeyResult API error:', error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}
