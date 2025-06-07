import type { NextApiRequest, NextApiResponse } from 'next';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { updateKeyResult, patchKeyResult } from 'models/keyResult';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, body } = req;
  const { objectiveId, keyResultId } = query;

  try {
    const teamMember = await throwIfNoTeamAccess(req, res);
    switch (method) {
      case 'PUT': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        const { currentValue } = body;
        if (typeof currentValue !== 'number') {
          return res.status(400).json({ error: { message: 'Invalid value' } });
        }
        const updated = await updateKeyResult(
          keyResultId as string,
          objectiveId as string,
          currentValue
        );
        res.status(200).json({ data: updated });
        break;
      }
      case 'PATCH': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        // Allow partial update of title, currentValue, targetValue, unit, status
        const allowedFields = [
          'title',
          'currentValue',
          'targetValue',
          'unit',
          'status',
        ];
        const patchData: any = {};
        for (const key of allowedFields) {
          if (body[key] !== undefined) patchData[key] = body[key];
        }
        if (Object.keys(patchData).length === 0) {
          return res
            .status(400)
            .json({ error: { message: 'No valid fields to update' } });
        }
        const updated = await patchKeyResult(
          keyResultId as string,
          objectiveId as string,
          patchData
        );
        res.status(200).json({ data: updated });
        break;
      }
      case 'DELETE': {
        throwIfNotAllowed(teamMember, 'okr', 'delete');
        // Delete the key result by ID
        const { deleteKeyResult } = await import('models/keyResult');
        await deleteKeyResult(keyResultId as string);
        res.status(204).end();
        break;
      }
      default:
        res.setHeader('Allow', 'PUT, PATCH, DELETE');
        res
          .status(405)
          .json({ error: { message: `Method ${method} Not Allowed` } });
    }
  } catch (error: any) {
    console.error('KeyResult API error:', error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}
