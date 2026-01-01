import React from 'react';
import { Trash2 } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';

interface EdgeContextMenuProps {
  id: string;
  top: number;
  left: number;
  onClick: () => void;
}

const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({ id, top, left, onClick }) => {
  const deleteEdge = useMindMapStore((state) => state.deleteEdge);

  const handleDelete = () => {
    deleteEdge(id);
    onClick();
  };

  return (
    <div
      style={{ top, left }}
      className="absolute z-50 flex flex-col w-40 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left"
    >
      <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connection</span>
      </div>
      
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
      >
        <Trash2 size={16} />
        Delete Line
      </button>
    </div>
  );
};

export default EdgeContextMenu;