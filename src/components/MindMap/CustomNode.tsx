import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Plus, Trash2, GripHorizontal, ExternalLink, StickyNote } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { MindMapData } from '../../types';
import NodeCustomizationToolbar from './NodeCustomizationToolbar';

const CustomNode = ({ id, data, isConnectable, selected }: NodeProps<MindMapData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const updateNodeLabel = useMindMapStore((state) => state.updateNodeLabel);
  const updateNodeData = useMindMapStore((state) => state.updateNodeData);
  const addNode = useMindMapStore((state) => state.addNode);
  const deleteNode = useMindMapStore((state) => state.deleteNode);
  const takeSnapshot = useMindMapStore((state) => state.takeSnapshot);

  // Sync internal label state with data prop if it changes externally
  useEffect(() => {
    setLabel(data.label);
  }, [data.label]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    updateNodeLabel(id, label);
  };

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
      handleBlur();
    }
  };

  const onAddChild = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    // Pass undefined position so store calculates it
    addNode(id, undefined, 'New Idea'); 
  }, [addNode, id]);

  const onDelete = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    deleteNode(id);
  }, [deleteNode, id]);

  const handleTextClick = (evt: React.MouseEvent) => {
    // Enable editing on click
    evt.stopPropagation();
    setIsEditing(true);
  };

  // Common styles for the interactive handles
  const handleStyle = `
    !w-3 !h-3 !bg-slate-400 dark:!bg-slate-600 
    !border-2 !border-white dark:!border-slate-900 
    !transition-all !duration-200 
    opacity-0 group-hover:opacity-100 
    hover:!bg-primary hover:!scale-125
    !z-50
  `;

  // Invisible target styles (larger hit area)
  const targetHandleStyle = `
    !w-6 !h-6 !bg-transparent !border-none !z-40
  `;

  // Determine Background Style
  const customBg = data.style?.backgroundColor;
  const bgClasses = customBg 
    ? '' 
    : 'bg-white dark:bg-slate-900';
  const styleObj = customBg ? { backgroundColor: customBg } : {};

  // Image Styles
  const imgBorderWidth = data.style?.imageBorderWidth || 0;
  const imgBorderColor = data.style?.imageBorderColor || '#6366f1';
  const imgStyle = {
    borderWidth: `${imgBorderWidth}px`,
    borderColor: imgBorderColor,
    borderStyle: 'solid',
    boxSizing: 'border-box' as const
  };

  const hasImage = !!data.metadata?.imageSrc;

  return (
    <div 
      className={`
        group relative min-w-[150px] min-h-[50px] h-full w-full rounded-xl shadow-sm 
        border-2
        cursor-grab active:cursor-grabbing
        animate-pop-in
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${bgClasses}
        ${selected 
          ? 'border-primary shadow-lg animate-pulse-glow z-20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50'
        }
      `}
      style={styleObj}
    >
      <NodeResizer 
        color="#6366f1" 
        isVisible={selected} 
        minWidth={100} 
        minHeight={50} 
        onResizeStart={takeSnapshot}
      />

      {/* Top Customization Toolbar - Visible on Hover - Using padding for safe hover bridge */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 delay-75 pointer-events-none group-hover:pointer-events-auto w-max origin-bottom group-hover:-translate-y-1">
         <NodeCustomizationToolbar 
            nodeId={id} 
            data={data} 
            onUpdateNode={updateNodeData} 
         />
      </div>
      
      {/* 
         INTERACTIVE HANDLES 
      */}

      {/* TOP */}
      <Handle type="target" position={Position.Top} id="top-target" className={targetHandleStyle} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Top} id="top-source" className={handleStyle} isConnectable={isConnectable} />

      {/* RIGHT */}
      <Handle type="target" position={Position.Right} id="right-target" className={targetHandleStyle} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="right-source" className={handleStyle} isConnectable={isConnectable} />

      {/* BOTTOM */}
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={targetHandleStyle} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className={handleStyle} isConnectable={isConnectable} />

      {/* LEFT */}
      <Handle type="target" position={Position.Left} id="left-target" className={targetHandleStyle} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="left-source" className={handleStyle} isConnectable={isConnectable} />
      
      {/* Node Content */}
      <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center">
        
        {/* Image Section - Background */}
        {hasImage && (
          <>
            <img 
               src={data.metadata!.imageSrc} 
               alt="Node attachment" 
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               draggable={false}
               style={imgStyle}
             />
             {/* Dim overlay for readability */}
             <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity group-hover:bg-black/30" />
          </>
        )}

        {/* Text Section - Overlay */}
        <div className="relative z-10 px-4 py-3 w-full max-w-full flex items-center justify-center">
            {isEditing ? (
            <input
                ref={inputRef}
                value={label}
                onChange={(evt) => setLabel(evt.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`nodrag cursor-text w-full text-center bg-transparent border-none focus:ring-0 p-0 text-sm font-medium ${
                    hasImage ? 'text-white placeholder-white/70 drop-shadow-md' : 'text-slate-900 dark:text-slate-100'
                }`}
                style={hasImage ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : {}}
            />
            ) : (
            <div 
                onClick={handleTextClick}
                className={`w-full text-center text-sm font-medium break-words cursor-grab ${
                    hasImage ? 'text-white drop-shadow-md' : 'text-slate-900 dark:text-slate-100'
                }`}
                style={hasImage ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : {}}
            >
                {label}
            </div>
            )}
        </div>

        {/* Icons container (Top Right of Node) */}
        <div className="absolute top-2 right-2 z-20 flex gap-1">
            {/* Notes Indicator */}
            {data.metadata?.notes && (
                <div 
                    className={`p-0.5 transition-colors animate-fade-in ${
                        hasImage ? 'text-white/80 hover:text-white drop-shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="Has notes"
                >
                    <StickyNote size={12} />
                </div>
            )}
            
            {/* Link Indicator */}
            {data.metadata?.url && !isEditing && (
                <a 
                    href={data.metadata.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-0.5 transition-colors animate-fade-in ${
                        hasImage ? 'text-white/80 hover:text-white drop-shadow-md' : 'text-primary hover:text-primary/80'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    title={data.metadata.url}
                >
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
      </div>

      {/* Hover Controls (Toolbar) - Using padding for safe hover bridge */}
      <div className={`
        nodrag
        absolute top-full left-1/2 -translate-x-1/2 pt-3
        flex items-end justify-center
        opacity-0 group-hover:opacity-100 transition-all duration-200 delay-75 pointer-events-none group-hover:pointer-events-auto
        z-50 origin-top group-hover:translate-y-1
      `}>
         <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
              title="Edit Text"
            >
              <GripHorizontal size={14} />
            </button>
            <button 
              onClick={onAddChild}
              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md text-primary transition-colors"
              title="Add Child"
            >
              <Plus size={14} />
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button 
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-red-500 transition-colors"
              title="Delete Node"
            >
              <Trash2 size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomNode);