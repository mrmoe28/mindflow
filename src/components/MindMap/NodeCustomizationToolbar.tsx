import React, { useState, useRef, useEffect } from 'react';
import { Palette, Link as LinkIcon, Image as ImageIcon, Check, X, Trash2, StickyNote, RefreshCw } from 'lucide-react';
import { MindMapData } from '../../types';

interface NodeCustomizationToolbarProps {
  nodeId: string;
  data: MindMapData;
  onUpdateNode: (nodeId: string, data: Partial<MindMapData>) => void;
}

const COLORS = [
  '#ffffff', // White
  '#fecaca', // Red 200
  '#fed7aa', // Orange 200
  '#fef08a', // Yellow 200
  '#bbf7d0', // Green 200
  '#bfdbfe', // Blue 200
  '#ddd6fe', // Violet 200
  '#e2e8f0', // Slate 200
];

const BORDER_COLORS = [
    '#6366f1', // Indigo (Primary)
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#000000', // Black
    '#ffffff', // White
];

const NodeCustomizationToolbar: React.FC<NodeCustomizationToolbarProps> = ({ 
  nodeId, 
  data, 
  onUpdateNode 
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'link' | 'notes' | 'image' | null>(null);
  const [linkInput, setLinkInput] = useState(data.metadata?.url || '');
  const [notesInput, setNotesInput] = useState(data.metadata?.notes || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with props if data changes externally
  useEffect(() => {
    setNotesInput(data.metadata?.notes || '');
    setLinkInput(data.metadata?.url || '');
  }, [data.metadata?.notes, data.metadata?.url]);

  const handleColorChange = (color: string) => {
    onUpdateNode(nodeId, { 
      style: { ...data.style, backgroundColor: color } 
    });
  };

  const handleLinkSubmit = () => {
    onUpdateNode(nodeId, {
      metadata: { ...data.metadata, url: linkInput }
    });
    setActiveTab(null);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setNotesInput(newVal);
    onUpdateNode(nodeId, {
      metadata: { ...data.metadata, notes: newVal }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateNode(nodeId, {
          metadata: { ...data.metadata, imageSrc: reader.result as string }
        });
        setActiveTab('image'); // Switch to image tab after upload
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const handleImageClick = () => {
      if (data.metadata?.imageSrc) {
          setActiveTab(activeTab === 'image' ? null : 'image');
      } else {
          fileInputRef.current?.click();
      }
  };

  const removeImage = () => {
     onUpdateNode(nodeId, {
        metadata: { ...data.metadata, imageSrc: undefined },
        style: { ...data.style, imageBorderWidth: 0 } // Reset border when image removed
     });
     setActiveTab(null);
  };

  const removeLink = () => {
      setLinkInput('');
      onUpdateNode(nodeId, {
          metadata: { ...data.metadata, url: undefined }
      });
      setActiveTab(null);
  }

  // Image Border Handlers
  const handleImageBorderColor = (color: string) => {
      onUpdateNode(nodeId, {
          style: { ...data.style, imageBorderColor: color }
      });
  };

  const handleImageBorderWidth = (width: number) => {
      onUpdateNode(nodeId, {
          style: { ...data.style, imageBorderWidth: width }
      });
  };

  return (
    <div className="flex flex-col gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
            {/* Color Picker Toggle */}
            <button
            onClick={() => setActiveTab(activeTab === 'color' ? null : 'color')}
            className={`p-2 rounded-md transition-colors ${
                activeTab === 'color' 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Change Background Color"
            >
            <Palette size={16} />
            </button>

            {/* Notes Toggle */}
            <button
            onClick={() => setActiveTab(activeTab === 'notes' ? null : 'notes')}
            className={`p-2 rounded-md transition-colors ${
                activeTab === 'notes' || data.metadata?.notes
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Add Notes"
            >
            <StickyNote size={16} />
            </button>

            {/* Link Toggle */}
            <button
            onClick={() => setActiveTab(activeTab === 'link' ? null : 'link')}
            className={`p-2 rounded-md transition-colors ${
                activeTab === 'link' || data.metadata?.url
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title="Add Link"
            >
            <LinkIcon size={16} />
            </button>

            {/* Image Upload/Settings Toggle */}
            <button
            onClick={handleImageClick}
            className={`p-2 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 ${
                activeTab === 'image' || data.metadata?.imageSrc ? 'bg-primary/10 text-primary' : ''
            }`}
            title={data.metadata?.imageSrc ? "Image Settings" : "Upload Image"}
            >
            <ImageIcon size={16} />
            </button>
            <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            />
        </div>
      </div>

      {/* Node Background Color Picker Content */}
      {activeTab === 'color' && (
        <div className="grid grid-cols-4 gap-2 p-2 border-t border-slate-100 dark:border-slate-700 mt-1">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Notes Content */}
      {activeTab === 'notes' && (
        <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-1 w-64">
             <textarea
                value={notesInput}
                onChange={handleNotesChange}
                placeholder="Enter notes here..."
                className="w-full h-24 text-xs p-2 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary text-slate-900 dark:text-white resize-none"
             />
        </div>
      )}

      {/* Link Input Content */}
      {activeTab === 'link' && (
        <div className="flex items-center gap-2 p-2 border-t border-slate-100 dark:border-slate-700 mt-1 w-48">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
          />
          <button
            onClick={handleLinkSubmit}
            className="p-1 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 rounded transition-colors"
          >
            <Check size={14} />
          </button>
          {data.metadata?.url && (
               <button
                  onClick={removeLink}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors"
               >
                   <X size={14} />
               </button>
          )}
        </div>
      )}
      
      {/* Image Settings Content */}
      {activeTab === 'image' && data.metadata?.imageSrc && (
          <div className="flex flex-col gap-3 p-3 border-t border-slate-100 dark:border-slate-700 mt-1 w-56">
              
              {/* Image Actions */}
              <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 transition-colors"
                  >
                      <RefreshCw size={12} /> Replace
                  </button>
                  <button 
                    onClick={removeImage}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded text-red-600 dark:text-red-400 transition-colors"
                  >
                      <Trash2 size={12} /> Remove
                  </button>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700" />
              
              {/* Border Controls */}
              <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Border Thickness</label>
                  <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={data.style?.imageBorderWidth || 0}
                        onChange={(e) => handleImageBorderWidth(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs w-4 text-center text-slate-600 dark:text-slate-300">
                          {data.style?.imageBorderWidth || 0}
                      </span>
                  </div>
              </div>

               <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Border Color</label>
                  <div className="grid grid-cols-8 gap-1">
                      {BORDER_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => handleImageBorderColor(color)}
                            className={`w-5 h-5 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-110 transition-transform ${
                                (data.style?.imageBorderColor || '#6366f1') === color ? 'ring-2 ring-primary' : ''
                            }`}
                            style={{ 
                                backgroundColor: color
                            }}
                          />
                      ))}
                  </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default NodeCustomizationToolbar;