import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { promptActions } from '../db';

export default function TemplateLibrary() {
  const { prompts, templates, removePrompt } = useAppStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    if (!searchKeyword.trim()) {
      return prompts;
    }

    return prompts.filter((p) =>
      p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.finalPrompt.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [prompts, searchKeyword]);

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedPromptId) || null,
    [prompts, selectedPromptId]
  );

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板！');
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm('确定要删除这个提示词吗？')) {
      await promptActions.delete(id);
      removePrompt(id);
      if (selectedPromptId === id) {
        setSelectedPromptId(null);
      }
      alert('删除成功');
    }
  };

  const getTemplateName = (templateId: string) => {
    return templates.find((t) => t.id === templateId)?.name || '未知模板';
  };

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 提示词库</h2>

        {/* 搜索 */}
        <div className="mb-6">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field w-full"
            placeholder="搜索提示词..."
          />
        </div>

        {/* 提示词列表 */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 列表 */}
            <div className="lg:col-span-1">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPromptId(prompt.id!)}
                    className={`w-full text-left p-3 border rounded-lg transition ${
                      selectedPromptId === prompt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 truncate">
                      {prompt.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {getTemplateName(prompt.templateId)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 详情 */}
            {selectedPrompt && (
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedPrompt.name}
                  </h3>

                  {/* 模板信息 */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>模板:</strong> {getTemplateName(selectedPrompt.templateId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>创建时间:</strong>{' '}
                      {new Date(selectedPrompt.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>

                  {/* 属性值 */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">属性值</h4>
                    <div className="space-y-2 bg-white p-4 rounded-lg">
                      {Object.entries(selectedPrompt.values).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs font-semibold text-gray-700">{key}</p>
                          <p className="text-sm text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 提示词预览 */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">提示词内容</h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-20">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedPrompt.finalPrompt}
                      </p>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyPrompt(selectedPrompt.finalPrompt)}
                      className="btn-primary flex-1"
                    >
                      📋 复制
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(selectedPrompt.id!)}
                      className="btn-danger flex-1"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">📭 还没有保存的提示词</p>
            <p className="text-sm">去创建提示词页面创建你的第一个提示词吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
