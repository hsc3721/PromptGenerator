import { useEffect, useState } from 'react';
import { initializeDefaultData, templateActions, promptActions, inspirationActions } from './db';
import { useAppStore } from './store';
import TemplateEditor from './components/TemplateEditor';
import PromptEditor from './components/PromptEditor';
import TemplateLibrary from './components/TemplateLibrary';
import TemplateManager from './components/TemplateManager';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    setTemplates, 
    setPrompts, 
    setInspirations,
    activeTab,
    setActiveTab
  } = useAppStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeDefaultData();
        const templates = await templateActions.getAll();
        const prompts = await promptActions.getAll();
        const inspirations = await inspirationActions.getAll();
        
        setTemplates(templates);
        setPrompts(prompts);
        setInspirations(inspirations);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [setTemplates, setPrompts, setInspirations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🎨 提示词生成器
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            轻松创建和管理你的 AI 提示词，释放创意潜能
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('template-editor')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'template-editor'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 创建模板
            </button>
            <button
              onClick={() => setActiveTab('prompt-editor')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'prompt-editor'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ✨ 创建提示词
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'library'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 提示词库
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'manage'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ 管理
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-6 py-8">
        {activeTab === 'template-editor' && <TemplateEditor />}
        {activeTab === 'prompt-editor' && <PromptEditor />}
        {activeTab === 'library' && <TemplateLibrary />}
        {activeTab === 'manage' && <TemplateManager />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-full mx-auto px-6 py-6 text-center text-gray-600 text-sm">
          <p>© 2026 AI 提示词生成器 | 让创意无处不在</p>
        </div>
      </footer>
    </div>
  );
}
