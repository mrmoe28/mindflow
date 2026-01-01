import { sql, MindMapRow } from '../lib/db';
import { requireAuth } from '../lib/middleware';

export interface VercelRequest {
  method?: string;
  headers: {
    authorization?: string;
  };
  query: Record<string, string | string[]>;
  body: any;
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

// GET /api/mindmaps - List all mind maps for authenticated user
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const mindMaps = await sql<MindMapRow[]>`
        SELECT id, name, created_at, updated_at, is_dark_mode, user_id
        FROM mind_maps
        WHERE user_id = ${auth.userId}
        ORDER BY updated_at DESC
      `;

      return res.status(200).json(mindMaps);
    } catch (error) {
      console.error('Error fetching mind maps:', error);
      return res.status(500).json({ error: 'Failed to fetch mind maps' });
    }
  }

  if (req.method === 'POST') {
    const auth = requireAuth(req, res);
    if (!auth) return;

    try {
      const { name, isDarkMode } = req.body;

      const [mindMap] = await sql<MindMapRow[]>`
        INSERT INTO mind_maps (name, is_dark_mode, user_id)
        VALUES (${name || 'Untitled Map'}, ${isDarkMode || false}, ${auth.userId})
        RETURNING id, name, created_at, updated_at, is_dark_mode, user_id
      `;

      return res.status(201).json(mindMap);
    } catch (error) {
      console.error('Error creating mind map:', error);
      return res.status(500).json({ error: 'Failed to create mind map' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
