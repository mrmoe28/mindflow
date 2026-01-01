import { MindMapNode, MindMapEdge } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export interface MindMap {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_dark_mode: boolean;
  user_id?: string;
  nodes?: MindMapNode[];
  edges?: MindMapEdge[];
}

// List all mind maps
export async function listMindMaps(): Promise<MindMap[]> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch mind maps');
  }
  return response.json();
}

// Get a specific mind map with nodes and edges
export async function getMindMap(id: string): Promise<MindMap> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps/${id}`, {
    headers,
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Mind map not found');
    }
    throw new Error('Failed to fetch mind map');
  }
  return response.json();
}

// Create a new mind map
export async function createMindMap(data: {
  name?: string;
  isDarkMode?: boolean;
  userId?: string;
}): Promise<MindMap> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create mind map');
  }
  return response.json();
}

// Update a mind map
export async function updateMindMap(
  id: string,
  data: {
    name?: string;
    nodes?: MindMapNode[];
    edges?: MindMapEdge[];
    isDarkMode?: boolean;
  }
): Promise<MindMap> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update mind map');
  }
  return response.json();
}

// Save nodes and edges for a mind map
export async function saveMindMap(
  id: string,
  nodes: MindMapNode[],
  edges: MindMapEdge[]
): Promise<{ message: string; nodesCount: number; edgesCount: number }> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps/${id}/save`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ nodes, edges }),
  });
  if (!response.ok) {
    throw new Error('Failed to save mind map');
  }
  return response.json();
}

// Delete a mind map
export async function deleteMindMap(id: string): Promise<void> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/mindmaps/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to delete mind map');
  }
}

