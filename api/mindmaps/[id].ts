import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, nodeRowToMindMapNode, edgeRowToMindMapEdge, mindMapNodeToNodeRow, mindMapEdgeToEdgeRow } from '../lib/db';
import { MindMapNode, MindMapEdge } from '../../src/types';
import { requireAuth } from '../lib/middleware';

// GET /api/mindmaps/[id] - Get a specific mind map with nodes and edges
// PUT /api/mindmaps/[id] - Update a mind map
// DELETE /api/mindmaps/[id] - Delete a mind map
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid mind map ID' });
  }

  if (req.method === 'GET') {
    try {
      // Get mind map
      const [mindMap] = await sql`
        SELECT id, name, created_at, updated_at, is_dark_mode, user_id
        FROM mind_maps
        WHERE id = ${id} AND user_id = ${auth.userId}
      `;

      if (!mindMap) {
        return res.status(404).json({ error: 'Mind map not found' });
      }

      // Get nodes
      const nodeRows = await sql`
        SELECT * FROM nodes
        WHERE mind_map_id = ${id}
      `;

      // Get edges
      const edgeRows = await sql`
        SELECT * FROM edges
        WHERE mind_map_id = ${id}
      `;

      const nodes = nodeRows.map(nodeRowToMindMapNode);
      const edges = edgeRows.map(edgeRowToMindMapEdge);

      return res.status(200).json({
        ...mindMap,
        nodes,
        edges,
      });
    } catch (error) {
      console.error('Error fetching mind map:', error);
      return res.status(500).json({ error: 'Failed to fetch mind map' });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Parse body if it's a Buffer or string
      let body = req.body;
      if (Buffer.isBuffer(body)) {
        body = JSON.parse(body.toString());
      } else if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      const { name, nodes, edges, isDarkMode } = body as { 
        name?: string; 
        nodes?: MindMapNode[]; 
        edges?: MindMapEdge[]; 
        isDarkMode?: boolean 
      };

      // Update mind map metadata
      if (name !== undefined || isDarkMode !== undefined) {
        await sql`
          UPDATE mind_maps
          SET 
            name = COALESCE(${name}, name),
            is_dark_mode = COALESCE(${isDarkMode}, is_dark_mode),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;
      }

      // Update nodes and edges if provided
      if (nodes && Array.isArray(nodes)) {
        // Delete existing nodes
        await sql`DELETE FROM nodes WHERE mind_map_id = ${id}`;
        
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
      }

      if (edges && Array.isArray(edges)) {
        // Delete existing edges
        await sql`DELETE FROM edges WHERE mind_map_id = ${id}`;
        
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
      }

      // Return updated mind map
      const [updatedMindMap] = await sql`
        SELECT id, name, created_at, updated_at, is_dark_mode, user_id
        FROM mind_maps
        WHERE id = ${id}
      `;

      return res.status(200).json(updatedMindMap);
    } catch (error) {
      console.error('Error updating mind map:', error);
      return res.status(500).json({ error: 'Failed to update mind map' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Verify ownership before deleting
      const [mindMap] = await sql`
        SELECT id FROM mind_maps WHERE id = ${id} AND user_id = ${auth.userId}
      `;
      
      if (!mindMap) {
        return res.status(404).json({ error: 'Mind map not found' });
      }

      // CASCADE delete will handle nodes and edges
      await sql`DELETE FROM mind_maps WHERE id = ${id} AND user_id = ${auth.userId}`;
      return res.status(200).json({ message: 'Mind map deleted successfully' });
    } catch (error) {
      console.error('Error deleting mind map:', error);
      return res.status(500).json({ error: 'Failed to delete mind map' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

