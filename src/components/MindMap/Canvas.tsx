import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
  useReactFlow,
  Node,
  Edge,
  SelectionMode
} from 'reactflow';
import { toPng } from 'html-to-image';
import { useMindMapStore } from '../../store/useMindMapStore';
import CustomNode from './CustomNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CustomConnectionLine';
import EdgeContextMenu from './EdgeContextMenu';
import AlignmentToolbar from './AlignmentToolbar';
import { useShallow } from 'zustand/react/shallow';
import { Undo, Redo, Image as ImageIcon, Hand, MousePointer2 } from 'lucide-react';

const nodeTypes = {
  mindMap: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const selector = (state: any) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  onEdgeUpdate: state.onEdgeUpdate,
  onEdgeUpdateStart: state.onEdgeUpdateStart,
  onEdgeUpdateEnd: state.onEdgeUpdateEnd,
  isDarkMode: state.isDarkMode,
  undo: state.undo,
  redo: state.redo,
  takeSnapshot: state.takeSnapshot,
  reparentNode: state.reparentNode,
  history: state.history,
  future: state.future,
});

const CanvasContent = () => {
  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, onEdgeUpdate, 
    onEdgeUpdateStart, onEdgeUpdateEnd,
    isDarkMode, undo, redo, takeSnapshot, reparentNode, history, future 
  } = useMindMapStore(useShallow(selector));
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getIntersectingNodes } = useReactFlow();
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [tool, setTool] = useState<'hand' | 'select'>('hand');

  // Style customization for Dark/Light mode
  const flowStyles = useMemo(() => ({
    background: isDarkMode ? '#020617' : '#f8fafc',
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
    cursor: tool === 'select' ? 'crosshair' : undefined,
  }), [isDarkMode, tool]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo/Redo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
        event.preventDefault();
        redo();
      }

      // Tool Switching via Keys
      const target = event.target as HTMLElement;
      if (event.key === 'h' && !target.matches?.('input, textarea')) {
         setTool('hand');
      }
      if (event.key === 'v' && !target.matches?.('input, textarea')) {
         setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Handle Drag Start (Save History)
  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const intersections = getIntersectingNodes(node);
      const targetNode = intersections.find((n) => n.id !== node.id && n.type === 'mindMap');

      if (targetNode) {
        reparentNode(node.id, targetNode.id);
      }
    },
    [getIntersectingNodes, reparentNode]
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();

      // Calculate position relative to the pane
      const pane = reactFlowWrapper.current?.getBoundingClientRect();
      if(pane) {
          setMenu({
            id: edge.id,
            top: event.clientY - pane.top,
            left: event.clientX - pane.left,
          });
      }
    },
    []
  );

  // Export Function
  const handleExport = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    toPng(reactFlowWrapper.current, {
        backgroundColor: isDarkMode ? '#020617' : '#f8fafc',
        width: reactFlowWrapper.current.offsetWidth,
        height: reactFlowWrapper.current.offsetHeight,
        style: {
            width: reactFlowWrapper.current.offsetWidth.toString(),
            height: reactFlowWrapper.current.offsetHeight.toString(),
        }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export image', err);
      });
  }, [isDarkMode]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={CustomConnectionLine}
        style={flowStyles}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        className="touch-none"
        minZoom={0.2}
        maxZoom={2}
        
        // Interaction Modes
        panOnDrag={tool === 'hand'}
        selectionOnDrag={tool === 'select'}
        selectionMode={SelectionMode.Partial}
        panOnScroll={true}
        
        // Remove dashed lines, make them solid
        connectionLineStyle={{ 
            stroke: '#6366f1', 
            strokeWidth: 2.5,
        }}
        
        defaultEdgeOptions={{ 
            type: 'floating', 
            animated: false,  
            updatable: true,
            style: { 
                stroke: isDarkMode ? '#64748b' : '#94a3b8', 
                strokeWidth: 2.5,
            } 
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color={isDarkMode ? '#334155' : '#cbd5e1'} 
        />
        <Controls showInteractive={false} className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700 !shadow-sm" />
        <MiniMap 
            nodeColor={isDarkMode ? '#475569' : '#e2e8f0'} 
            maskColor={isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)'}
            className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 !rounded-lg !overflow-hidden"
        />
        
        {menu && (
          <EdgeContextMenu
            onClick={onPaneClick}
            {...menu}
          />
        )}
        
        {/* Tool Switcher */}
        <Panel position="top-left" className="flex gap-2">
           <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
              <button 
                  onClick={() => setTool('hand')}
                  className={`p-2 rounded-md transition-colors ${tool === 'hand' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  title="Hand Tool (Pan) - 'H'"
              >
                  <Hand size={18} />
              </button>
              <button 
                  onClick={() => setTool('select')}
                  className={`p-2 rounded-md transition-colors ${tool === 'select' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  title="Selection Tool (Drag to select) - 'V'"
              >
                  <MousePointer2 size={18} />
              </button>
           </div>
        </Panel>

        {/* Alignment Toolbar in the Center Top */}
        <Panel position="top-center">
            <AlignmentToolbar />
        </Panel>

        <Panel position="top-right" className="flex gap-2">
           <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1">
             <button
               onClick={undo}
               disabled={history.length === 0}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               title="Undo (Ctrl+Z)"
             >
               <Undo size={18} />
             </button>
             <button
               onClick={redo}
               disabled={future.length === 0}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               title="Redo (Ctrl+Y)"
             >
               <Redo size={18} />
             </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
             <button
               onClick={handleExport}
               className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
               title="Export as PNG"
             >
               <ImageIcon size={18} />
             </button>
           </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const Canvas = () => (
  <ReactFlowProvider>
    <CanvasContent />
  </ReactFlowProvider>
);

export default Canvas;