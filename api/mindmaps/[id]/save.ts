import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, mindMapNodeToNodeRow, mindMapEdgeToEdgeRow } from '../../lib/db';
import { MindMapNode, MindMapEdge } from '../../../src/types';
import { requireAuth } from '../../lib/middleware';

// POST /api/mindmaps/[id]/save - Save nodes and edges for a mind map
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  const auth = await requireAuth(req, res);
  if (!auth) return;

  // Parse body if it's a Buffer or string
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    body = JSON.parse(body.toString());
  } else if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { nodes, edges } = body as { nodes: MindMapNode[]; edges: MindMapEdge[] };

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid mind map ID' });
  }

  if (!nodes || !Array.isArray(nodes)) {
    return res.status(400).json({ error: 'Nodes array is required' });
  }

  if (!edges || !Array.isArray(edges)) {
    return res.status(400).json({ error: 'Edges array is required' });
  }

  try {
    // Verify mind map exists and belongs to user
    const [mindMap] = await sql`
      SELECT id FROM mind_maps WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    if (!mindMap) {
      return res.status(404).json({ error: 'Mind map not found' });
    }

    // Delete existing nodes and edges
    await sql`DELETE FROM nodes WHERE mind_map_id = ${id}`;
    await sql`DELETE FROM edges WHERE mind_map_id = ${id}`;

    // Insert new nodes
    if (nodes.length > 0) {
      const nodeRows = nodes.map((node: MindMapNode) => mindMapNodeToNodeRow(node, id));
      for (const nodeRow of nodeRows) {
        await sql`
          INSERT INTO nodes (
            id, mind_map_id, type, label, position_x, position_y,
            width, height, parent_id, deletable, style, metadata
          )
          VALUES (
            ${nodeRow.id}, ${nodeRow.mind_map_id}, ${nodeRow.type},
            ${nodeRow.label}, ${nodeRow.position_x}, ${nodeRow.position_y},
            ${nodeRow.width || null}, ${nodeRow.height || null},
            ${nodeRow.parent_id || null}, ${nodeRow.deletable},
            ${JSON.stringify(nodeRow.style)}, ${JSON.stringify(nodeRow.metadata)}
          )
        `;
      }
    }

    // Insert new edges
    if (edges.length > 0) {
      const edgeRows = edges.map((edge: MindMapEdge) => mindMapEdgeToEdgeRow(edge, id));
      for (const edgeRow of edgeRows) {
        await sql`
          INSERT INTO edges (
            id, mind_map_id, source, target, type, animated,
            source_handle, target_handle, style, marker_end
          )
          VALUES (
            ${edgeRow.id}, ${edgeRow.mind_map_id}, ${edgeRow.source}, ${edgeRow.target},
            ${edgeRow.type}, ${edgeRow.animated}, ${edgeRow.source_handle || null},
            ${edgeRow.target_handle || null}, ${JSON.stringify(edgeRow.style)},
            ${edgeRow.marker_end ? JSON.stringify(edgeRow.marker_end) : null}
          )
        `;
      }
    }

    // Update mind map timestamp
    await sql`
      UPDATE mind_maps
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return res.status(200).json({ 
      message: 'Mind map saved successfully',
      nodesCount: nodes.length,
      edgesCount: edges.length
    });
  } catch (error) {
    console.error('Error saving mind map:', error);
    return res.status(500).json({ error: 'Failed to save mind map' });
  }
}
