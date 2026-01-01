import React from 'react';
import { Layout, GitFork, GitMerge } from 'lucide-react';
import { useMindMapStore } from '../../store/useMindMapStore';
import { TemplateType } from '../../types';

interface TemplateButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  description: string;
}

const TemplateButton: React.FC<TemplateButtonProps> = ({ icon: Icon, label, onClick, description }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group w-full"
  >
    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/10 mb-3 transition-colors">
      <Icon size={24} />
    </div>
    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{label}</span>
    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">{description}</span>
  </button>
);

interface TemplateSelectorProps {
  onSelect: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const applyTemplate = useMindMapStore((state) => state.applyTemplate);

  const handleSelect = (type: TemplateType) => {
    applyTemplate(type);
    onSelect();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <TemplateButton
        icon={Layout}
        label="Brainstorm"
        description="Central idea with radiating topics"
        onClick={() => handleSelect(TemplateType.BRAINSTORM)}
      />
      <TemplateButton
        icon={GitFork}
        label="Hierarchy"
        description="Top-down organizational chart"
        onClick={() => handleSelect(TemplateType.HIERARCHY)}
      />
      <TemplateButton
        icon={GitMerge}
        label="Process Flow"
        description="Linear step-by-step sequence"
        onClick={() => handleSelect(TemplateType.PROCESS)}
      />
    </div>
  );
};

export default TemplateSelector;