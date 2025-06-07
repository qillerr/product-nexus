import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectiveStatus } from '@prisma/client';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import {
  updateObjective,
  deleteObjective,
  getObjectiveById,
} from 'models/objective';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, body } = req;
  const { objectiveId } = query;

  try {
    const teamMember = await throwIfNoTeamAccess(req, res);

    switch (method) {
      case 'GET': {
        throwIfNotAllowed(teamMember, 'okr', 'read');
        const objective = await getObjectiveById(
          objectiveId as string,
          teamMember.team.id
        );
        if (!objective) {
          return res
            .status(404)
            .json({ error: { message: 'Objective not found' } });
        }
        res.status(200).json({ data: objective });
        break;
      }
      case 'PUT': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        const { title, description, status, startDate, endDate, keyResults } =
          body;
        if (!title || !startDate || !endDate) {
          return res
            .status(400)
            .json({ error: { message: 'Missing required fields' } });
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
            keyResults: keyResults || [],
          }
        );
        res.status(200).json({ data: updated });
        break;
      }
      case 'PATCH': {
        throwIfNotAllowed(teamMember, 'okr', 'update');
        // Accepts partial updates for title, description, status, dates
        const allowedFields = [
          'title',
          'description',
          'status',
          'startDate',
          'endDate',
        ];
        const updateData: any = {};
        for (const key of allowedFields) {
          if (body[key] !== undefined) updateData[key] = body[key];
        }
        if (Object.keys(updateData).length === 0) {
          return res
            .status(400)
            .json({ error: { message: 'No valid fields to update' } });
        }
        // Convert dates if present
        if (updateData.startDate)
          updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
          updateData.endDate = new Date(updateData.endDate);
        // Convert status to enum if present
        if (updateData.status && typeof updateData.status === 'string') {
          // Only allow valid enum values
          const allowed = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
          const upper = updateData.status.toUpperCase();
          if (allowed.includes(upper)) {
            updateData.status =
              upper as import('@prisma/client').ObjectiveStatus;
          } else {
            delete updateData.status;
          }
        }
        // Remove undefined fields (especially keyResults)
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === undefined) delete updateData[key];
        });
        const updated = await updateObjective(
          objectiveId as string,
          teamMember.team.id,
          updateData
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
        res.setHeader('Allow', 'GET, PUT, PATCH, DELETE');
        res
          .status(405)
          .json({ error: { message: `Method ${method} Not Allowed` } });
    }
  } catch (error: any) {
    console.error('Objective API error:', error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;
    res.status(status).json({ error: { message } });
  }
}
