// pages/api/score-performance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { aiService } from '../../lib/aiService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { playerProfile, messages } = req.body;

    if (!playerProfile || !messages) {
      return res.status(400).json({ error: 'Missing playerProfile or messages in request body' });
    }

    const performanceScore = await aiService.scorePerformance(playerProfile, messages);

    return res.status(200).json(performanceScore);
  } catch (error) {
    console.error('Error in /api/score-performance:', error);
    return res.status(500).json({ error: 'Failed to score performance' });
  }
}
