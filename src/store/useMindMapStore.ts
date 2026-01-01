import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  updateEdge,
} from 'reactflow';
import { StoreState, TemplateType, MindMapNode, MindMapEdge, Alignment, MindMapData } from '../types';
import { nanoid } from 'nanoid';

// Initial placeholder state
const initialNodes: MindMapNode[] = [
  {
    id: 'root',
    type: 'mindMap',
    data: { label: 'Central Topic' },
    position: { x: 0, y: 0 },
    deletable: false, 
  },
];

const initialEdges: MindMapEdge[] = [];

// Helper to generate template data
const getTemplateData = (type: TemplateType): { nodes: MindMapNode[]; edges: MindMapEdge[] } => {
  const rootId = 'root-' + nanoid();
  let nodes: MindMapNode[] = [];
  let edges: MindMapEdge[] = [];

  const commonStyle = { type: 'mindMap' };

  switch (type) {
    case TemplateType.BRAINSTORM:
      nodes = [
        { ...commonStyle, id: rootId, position: { x: 0, y: 0 }, data: { label: 'Main Idea' } },
        { ...commonStyle, id: '1', position: { x: -250, y: -100 }, data: { label: 'Factor A' } },
        { ...commonStyle, id: '2', position: { x: 250, y: -100 }, data: { label: 'Factor B' } },
        { ...commonStyle, id: '3', position: { x: -250, y: 100 }, data: { label: 'Factor C' } },
        { ...commonStyle, id: '4', position: { x: 250, y: 100 }, data: { label: 'Factor D' } },
      ];
      edges = [
        { id: `e${rootId}-1`, source: rootId, target: '1', type: 'floating', animated: false, sourceHandle: 'left-source', targetHandle: 'right-target' },
        { id: `e${rootId}-2`, source: rootId, target: '2', type: 'floating', animated: false, sourceHandle: 'right-source', targetHandle: 'left-target' },
        { id: `e${rootId}-3`, source: rootId, target: '3', type: 'floating', animated: false, sourceHandle: 'left-source', targetHandle: 'right-target' },
        { id: `e${rootId}-4`, source: rootId, target: '4', type: 'floating', animated: false, sourceHandle: 'right-source', targetHandle: 'left-target' },
      ];
      break;

    case TemplateType.HIERARCHY:
      nodes = [
        { ...commonStyle, id: rootId, position: { x: 0, y: 0 }, data: { label: 'CEO' } },
        { ...commonStyle, id: 'h1', position: { x: -200, y: 150 }, data: { label: 'Manager A' } },
        { ...commonStyle, id: 'h2', position: { x: 200, y: 150 }, data: { label: 'Manager B' } },
        { ...commonStyle, id: 'h3', position: { x: -300, y: 300 }, data: { label: 'Team 1' } },
        { ...commonStyle, id: 'h4', position: { x: -100, y: 300 }, data: { label: 'Team 2' } },
      ];
      edges = [
        { id: `e${rootId}-h1`, source: rootId, target: 'h1', type: 'floating', animated: false, sourceHandle: 'bottom-source', targetHandle: 'top-target' },
        { id: `e${rootId}-h2`, source: rootId, target: 'h2', type: 'floating', animated: false, sourceHandle: 'bottom-source', targetHandle: 'top-target' },
        { id: `eh1-h3`, source: 'h1', target: 'h3', type: 'floating', animated: false, sourceHandle: 'bottom-source', targetHandle: 'top-target' },
        { id: `eh1-h4`, source: 'h1', target: 'h4', type: 'floating', animated: false, sourceHandle: 'bottom-source', targetHandle: 'top-target' },
      ];
      break;

    case TemplateType.PROCESS:
      nodes = [
        { ...commonStyle, id: 'p1', position: { x: 0, y: 0 }, data: { label: 'Start' } },
        { ...commonStyle, id: 'p2', position: { x: 250, y: 0 }, data: { label: 'Process' } },
        { ...commonStyle, id: 'p3', position: { x: 500, y: 0 }, data: { label: 'Review' } },
        { ...commonStyle, id: 'p4', position: { x: 750, y: 0 }, data: { label: 'End' } },
      ];
      edges = [
        { id: 'ep1-p2', source: 'p1', target: 'p2', type: 'floating', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, sourceHandle: 'right-source', targetHandle: 'left-target' },
        { id: 'ep2-p3', source: 'p2', target: 'p3', type: 'floating', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, sourceHandle: 'right-source', targetHandle: 'left-target' },
        { id: 'ep3-p4', source: 'p3', target: 'p4', type: 'floating', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, sourceHandle: 'right-source', targetHandle: 'left-target' },
      ];
      break;
  }
  return { nodes, edges };
};

const MAX_HISTORY = 50;

export const useMindMapStore = create<StoreState & { 
  onEdgeUpdateStart: (event: any, edge: Edge, handleType: any) => void; 
  onEdgeUpdateEnd: (event: any, edge: Edge, handleType: any) => void;
}>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  isDarkMode: false,
  
  history: [],
  future: [],

  // Helpers
  takeSnapshot: () => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { nodes: [...nodes], edges: [...edges] }];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({ history: newHistory, future: [] });
  },

  undo: () => {
    const { history, future, nodes, edges } = get();
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    
    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      history: newHistory,
      future: [{ nodes, edges }, ...future],
    });
  },

  redo: () => {
    const { history, future, nodes, edges } = get();
    if (future.length === 0) return;

    const nextState = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      history: [...history, { nodes, edges }],
      future: newFuture,
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    get().takeSnapshot(); 
    // Set animated to false for solid lines
    const edge = { ...connection, type: 'floating', animated: false };
    set({
      edges: addEdge(edge, get().edges),
    });
  },

  onEdgeUpdate: (oldEdge: Edge, newConnection: Connection) => {
    get().takeSnapshot();
    set({
      edges: updateEdge(oldEdge, newConnection, get().edges),
    });
  },

  onEdgeUpdateStart: () => {
    // Optional: could add visual feedback state here
  },

  onEdgeUpdateEnd: () => {
    // Optional: could handle deletion on drop-in-void here
  },

  addNode: (parentNodeId, position, initialLabel) => {
    get().takeSnapshot(); 
    const newNodeId = nanoid();
    
    let newPosition = position;
    
    // Auto-layout logic for child nodes to visualize branching
    if (!newPosition) {
       const nodes = get().nodes;
       const edges = get().edges;
       const parent = nodes.find(n => n.id === parentNodeId);
       
       if (parent) {
         // Find existing children to distribute the new node
         const existingChildren = edges
            .filter(e => e.source === parentNodeId)
            .map(e => nodes.find(n => n.id === e.target))
            .filter(Boolean) as MindMapNode[];

         const siblingSpacing = 200; // Distance between siblings
         
         // If first child, place directly below
         // If subsequent children, alternate sides or spread out
         const offset = existingChildren.length === 0 
            ? 0 
            : (existingChildren.length % 2 === 0 ? 1 : -1) * (Math.ceil(existingChildren.length / 2) * siblingSpacing);

         newPosition = { 
            x: parent.position.x + offset, 
            y: parent.position.y + 150 
         };
       } else {
         newPosition = { x: Math.random() * 400, y: Math.random() * 400 };
       }
    }

    const newNode: MindMapNode = {
      id: newNodeId,
      type: 'mindMap',
      data: { label: initialLabel || 'New Idea', parentId: parentNodeId },
      position: newPosition,
    };

    const newEdges: MindMapEdge[] = [];
    if (parentNodeId) {
      newEdges.push({
        id: `e-${parentNodeId}-${newNodeId}`,
        source: parentNodeId,
        target: newNodeId,
        type: 'floating',
        animated: false, // Solid line
        sourceHandle: 'bottom-source', // Connect from bottom of parent to create tree structure
        targetHandle: 'top-target',    // Connect to top of child
      });
    }

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, ...newEdges],
    });
  },

  reparentNode: (nodeId: string, newParentId: string) => {
    const { nodes, edges } = get();

    if (nodeId === newParentId) return;

    const existingEdge = edges.find(e => e.target === nodeId && e.source === newParentId);
    if (existingEdge) return;

    const isDescendant = (parent: string, target: string, checked: Set<string> = new Set()): boolean => {
        if (parent === target) return true;
        if (checked.has(parent)) return false; 
        checked.add(parent);
        
        const children = edges.filter(e => e.source === parent).map(e => e.target);
        for (const child of children) {
            if (isDescendant(child, target, checked)) return true;
        }
        return false;
    };

    if (isDescendant(nodeId, newParentId)) {
        console.warn("Cycle detected: Cannot move node into its own descendant.");
        return;
    }

    get().takeSnapshot();

    const filteredEdges = edges.filter(e => e.target !== nodeId);

    const newEdge: MindMapEdge = {
        id: `e-${newParentId}-${nodeId}-${nanoid()}`,
        source: newParentId,
        target: nodeId,
        type: 'floating', 
        animated: false,
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target', 
    };

    const updatedNodes = nodes.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, parentId: newParentId } } : n
    );

    set({
        edges: [...filteredEdges, newEdge],
        nodes: updatedNodes
    });
  },

  alignNodes: (alignment: Alignment) => {
    const { nodes } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    
    // We need at least 2 nodes to align
    if (selectedNodes.length < 2) return;
    
    get().takeSnapshot();

    // Helper to get dimensions (fallback if not measured yet)
    // React Flow 11 uses 'measured' property
    const getDim = (n: MindMapNode) => ({
      w: n.measured?.width ?? n.width ?? 150,
      h: n.measured?.height ?? n.height ?? 50,
    });

    let newNodes = [...nodes];
    let val = 0;
    
    switch (alignment) {
      case 'left':
        val = Math.min(...selectedNodes.map(n => n.position.x));
        newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, x: val } } : n);
        break;
      case 'right':
        const maxRight = Math.max(...selectedNodes.map(n => n.position.x + getDim(n).w));
        newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, x: maxRight - getDim(n).w } } : n);
        break;
      case 'center-h':
        // Average center X
        const avgCenterX = selectedNodes.reduce((acc, n) => acc + n.position.x + getDim(n).w / 2, 0) / selectedNodes.length;
        newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, x: avgCenterX - getDim(n).w / 2 } } : n);
        break;
      case 'top':
         val = Math.min(...selectedNodes.map(n => n.position.y));
         newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, y: val } } : n);
         break;
      case 'bottom':
         const maxBottom = Math.max(...selectedNodes.map(n => n.position.y + getDim(n).h));
         newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, y: maxBottom - getDim(n).h } } : n);
         break;
      case 'center-v':
         // Average center Y
         const avgCenterY = selectedNodes.reduce((acc, n) => acc + n.position.y + getDim(n).h / 2, 0) / selectedNodes.length;
         newNodes = newNodes.map(n => n.selected ? { ...n, position: { ...n.position, y: avgCenterY - getDim(n).h / 2 } } : n);
         break;
    }

    set({ nodes: newNodes });
  },

  updateNodeLabel: (nodeId, label) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if(node && node.data.label !== label) {
       get().takeSnapshot();
       set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label } };
          }
          return node;
        }),
      });
    }
  },

  updateNodeData: (nodeId: string, data: Partial<MindMapData>) => {
    get().takeSnapshot();
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Deep merge logic for style and metadata if needed, 
          // but shallow merge of top-level properties is usually sufficient if careful
          return { 
            ...node, 
            data: { 
                ...node.data, 
                ...data,
                style: { ...node.data.style, ...data.style },
                metadata: { ...node.data.metadata, ...data.metadata }
            } 
          };
        }
        return node;
      }),
    });
  },

  deleteNode: (nodeId) => {
    get().takeSnapshot(); 
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
  },

  deleteEdge: (edgeId) => {
    get().takeSnapshot();
    set({
        edges: get().edges.filter(e => e.id !== edgeId)
    });
  },

  toggleDarkMode: () => {
    const newMode = !get().isDarkMode;
    set({ isDarkMode: newMode });
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  applyTemplate: (type) => {
    get().takeSnapshot();
    const { nodes, edges } = getTemplateData(type);
    set({ nodes, edges });
  },

  clearCanvas: () => {
    get().takeSnapshot();
    set({ nodes: [], edges: [] });
  }
}));