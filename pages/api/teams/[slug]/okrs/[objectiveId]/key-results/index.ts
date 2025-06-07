import type { NextApiRequest, NextApiResponse } from 'next';
import { createKeyResult } from 'models/keyResult';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { objectiveId } = req.query;

  if (req.method === 'POST') {
    try {
      const kr = await createKeyResult(objectiveId as string, req.body);
      res.status(201).json({ data: kr });
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
