import { Node, Edge, Connection } from 'reactflow';

export interface MindMapData {
  label: string;
  parentId?: string;
  style?: {
    backgroundColor?: string;
    imageBorderColor?: string;
    imageBorderWidth?: number;
  };
  metadata?: {
    url?: string;
    imageSrc?: string;
    notes?: string;
  };
}

export type MindMapNode = Node<MindMapData> & {
  measured?: {
    width?: number;
    height?: number;
  };
};

export type MindMapEdge = Edge;

export type Alignment = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';

export enum TemplateType {
  BRAINSTORM = 'BRAINSTORM',
  HIERARCHY = 'HIERARCHY',
  PROCESS = 'PROCESS',
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface HistoryState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface StoreState {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  isDarkMode: boolean;
  
  // History
  history: HistoryState[];
  future: HistoryState[];

  // Actions
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => void;
  addNode: (parentNodeId?: string, position?: { x: number; y: number }, initialLabel?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeData: (nodeId: string, data: Partial<MindMapData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  reparentNode: (nodeId: string, newParentId: string) => void;
  alignNodes: (alignment: Alignment) => void;
  toggleDarkMode: () => void;
  applyTemplate: (type: TemplateType) => void;
  clearCanvas: () => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  
  // API Actions (optional - for database persistence)
  currentMindMapId?: string;
  saveToDatabase: (mindMapId?: string) => Promise<void>;
  loadFromDatabase: (mindMapId: string) => Promise<void>;
  createNewMindMap: (name?: string) => Promise<string>;
}