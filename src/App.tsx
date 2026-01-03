import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Canvas from './components/MindMap/Canvas';
import TemplateSelector from './components/MindMap/TemplateSelector';
import { useMindMapStore } from './store/useMindMapStore';
import { useAuthStore } from './store/useAuthStore';
import AuthPage from './components/Auth/AuthPage';
import ResetPassword from './components/Auth/ResetPassword';
import { Moon, Sun, Plus, X, Command, Layout, LogOut, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { isDarkMode, toggleDarkMode, clearCanvas, addNode } = useMindMapStore();
  const { user, signOut, isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className={`w-full h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Top Navbar */}
      <div className="h-16 flex-none border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Command size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            MindFlow
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => addNode()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Node
          </button>

          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
          >
            <Layout size={16} />
            New Map
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* User Menu */}
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">
            <User size={16} />
            <span className="hidden sm:inline">{user?.email}</span>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={signOut}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-slate-50 dark:bg-slate-950">
        <Canvas />
      </div>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Choose a Template</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start with a pre-built structure or create a blank canvas.</p>
              </div>
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
              <TemplateSelector onSelect={() => setIsTemplateModalOpen(false)} />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-end">
                <button 
                    onClick={() => {
                        clearCanvas();
                        addNode(undefined, { x: 0, y: 0 }, "Central Topic");
                        setIsTemplateModalOpen(false);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 px-4 py-2"
                >
                    Start Blank
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
