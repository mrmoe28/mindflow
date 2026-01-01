import postgres from 'postgres';
import { MindMapNode, MindMapEdge } from '../../src/types';

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 1, // Limit connections for serverless
});

// Database types
export interface MindMapRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_dark_mode: boolean;
  user_id?: string;
}

export interface NodeRow {
  id: string;
  mind_map_id: string;
  type: string;
  label: string;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
  parent_id?: string;
  deletable: boolean;
  style: any;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export interface EdgeRow {
  id: string;
  mind_map_id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  source_handle?: string;
  target_handle?: string;
  style: any;
  marker_end?: any;
  created_at: Date;
}

// Convert database rows to app types
export function nodeRowToMindMapNode(row: NodeRow): MindMapNode {
  return {
    id: row.id,
    type: row.type as any,
    data: {
      label: row.label,
      parentId: row.parent_id,
      style: row.style || {},
      metadata: row.metadata || {},
    },
    position: { x: row.position_x, y: row.position_y },
    deletable: row.deletable,
    ...(row.width && row.height ? { width: row.width, height: row.height } : {}),
  };
}

export function mindMapNodeToNodeRow(node: MindMapNode, mindMapId: string): Omit<NodeRow, 'created_at' | 'updated_at'> {
  return {
    id: node.id,
    mind_map_id: mindMapId,
    type: node.type || 'mindMap',
    label: node.data.label,
    position_x: node.position.x,
    position_y: node.position.y,
    width: node.width,
    height: node.height,
    parent_id: node.data.parentId,
    deletable: node.deletable !== false,
    style: node.data.style || {},
    metadata: node.data.metadata || {},
  };
}

export function edgeRowToMindMapEdge(row: EdgeRow): MindMapEdge {
  return {
    id: row.id,
    source: row.source,
    target: row.target,
    type: row.type as any,
    animated: row.animated,
    sourceHandle: row.source_handle,
    targetHandle: row.target_handle,
    style: row.style || {},
    ...(row.marker_end ? { markerEnd: row.marker_end } : {}),
  };
}

export function mindMapEdgeToEdgeRow(edge: MindMapEdge, mindMapId: string): Omit<EdgeRow, 'created_at'> {
  return {
    id: edge.id,
    mind_map_id: mindMapId,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'floating',
    animated: edge.animated || false,
    source_handle: edge.sourceHandle,
    target_handle: edge.targetHandle,
    style: edge.style || {},
    marker_end: edge.markerEnd,
  };
}

