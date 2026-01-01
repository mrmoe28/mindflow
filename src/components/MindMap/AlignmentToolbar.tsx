import React from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical, 
  AlignCenterVertical, 
  AlignEndVertical 
} from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { Alignment } from '../../types';

const AlignmentToolbar: React.FC = () => {
  const alignNodes = useMindMapStore((state) => state.alignNodes);
  const nodes = useMindMapStore((state) => state.nodes);
  
  // Only show if at least 2 nodes are selected
  const selectedCount = nodes.filter(n => n.selected).length;
  
  if (selectedCount < 2) return null;

  const buttons: { id: Alignment; icon: React.ElementType; label: string }[] = [
    { id: 'left', icon: AlignLeft, label: 'Align Left' },
    { id: 'center-h', icon: AlignCenter, label: 'Align Center (H)' },
    { id: 'right', icon: AlignRight, label: 'Align Right' },
    { id: 'top', icon: AlignStartVertical, label: 'Align Top' },
    { id: 'center-v', icon: AlignCenterVertical, label: 'Align Center (V)' },
    { id: 'bottom', icon: AlignEndVertical, label: 'Align Bottom' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1 animate-in fade-in slide-in-from-top-4 duration-200">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => alignNodes(btn.id)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
          title={btn.label}
        >
          <btn.icon size={18} />
        </button>
      ))}
      <div className="flex items-center px-2 text-xs text-slate-400 font-medium">
        {selectedCount} Selected
      </div>
    </div>
  );
};

export default AlignmentToolbar;