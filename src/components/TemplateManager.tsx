import { useState } from 'react';
import { useAppStore } from '../store';
import { templateActions, inspirationActions } from '../db';

export default function TemplateManager() {
  const { templates, inspirations, removeTemplate, setInspirations } = useAppStore();
  const [selectedTab, setSelectedTab] = useState<'templates' | 'inspirations'>('templates');
  const [newLibraryName, setNewLibraryName] = useState('');
  const [showAddLibrary, setShowAddLibrary] = useState(false);
  const [addWordModalOpen, setAddWordModalOpen] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      try {
        await templateActions.delete(id);
        removeTemplate(id);
        alert('模板已删除');
      } catch (error) {
        console.error('删除模板失败:', error);
        alert('删除失败');
      }
    }
  };

  const handleAddLibrary = async () => {
    if (!newLibraryName.trim()) {
      alert('请输入条目名字');
      return;
    }

    // 检查是否重复
    const exists = inspirations.find((i) => i.attributeName === newLibraryName.trim());
    if (exists) {
      alert('该条目已存在，不能重复添加');
      return;
    }

    try {
      const attributeKey = newLibraryName.toLowerCase().replace(/\s+/g, '_');
      await inspirationActions.create({
        attributeKey,
        attributeName: newLibraryName.trim(),
        items: [],
      });
      
      // 立即从数据库重新加载
      const updated = await inspirationActions.getAll();
      setInspirations(updated);
      setNewLibraryName('');
      setShowAddLibrary(false);
      alert('条目已创建');
    } catch (error) {
      console.error('创建条目失败:', error);
      alert('创建失败');
    }
  };

  const handleAddWordToLibrary = async (libraryId: string) => {
    if (!newWord.trim()) {
      alert('请输入词汇');
      return;
    }

    try {
      // 获取当前条目
      const library = inspirations.find((i) => i.id === libraryId);
      if (!library) {
        alert('条目不存在');
        return;
      }

      // 检查词汇是否已存在
      if (library.items.includes(newWord.trim())) {
        alert('该词汇已存在');
        return;
      }

      // 添加词汇
      await inspirationActions.addItem(library.attributeKey, newWord.trim());
      
      // 立即从数据库重新加载
      const updated = await inspirationActions.getAll();
      setInspirations(updated);
      setNewWord('');
      setAddWordModalOpen(null);
      alert('词汇已添加');
    } catch (error) {
      console.error('添加词汇失败:', error);
      alert('添加失败');
    }
  };

  const handleRemoveInspirationWord = async (libraryId: string, word: string) => {
    try {
      await inspirationActions.removeItem(libraryId, word);
      // 立即从数据库重新加载
      const updated = await inspirationActions.getAll();
      setInspirations(updated);
    } catch (error) {
      console.error('删除词汇失败:', error);
      alert('删除失败');
    }
  };

  const handleDeleteInspirationLibrary = async (id: string) => {
    if (confirm('确定要删除这个条目吗？')) {
      try {
        await inspirationActions.delete(id);
        // 立即从数据库重新加载
        const updated = await inspirationActions.getAll();
        setInspirations(updated);
        alert('条目已删除');
      } catch (error) {
        console.error('删除条目失败:', error);
        alert('删除失败');
      }
    }
  };

  const handleExportTemplates = () => {
    if (templates.length === 0) {
      alert('没有模板可导出');
      return;
    }

    const content = JSON.stringify(templates, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `templates_${new Date().getTime()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('模板已导出');
  };

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ 管理中心</h2>

        {/* 标签页 */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('templates')}
            className={`py-3 px-4 font-semibold border-b-2 transition ${
              selectedTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 模板管理
          </button>
          <button
            onClick={() => setSelectedTab('inspirations')}
            className={`py-3 px-4 font-semibold border-b-2 transition ${
              selectedTab === 'inspirations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            💡 灵感库管理
          </button>
        </div>

        {/* 模板管理 */}
        {selectedTab === 'templates' && (
          <div>
            <div className="mb-4 flex justify-between">
              <p className="text-gray-600">总共 {templates.length} 个模板</p>
              <button
                onClick={handleExportTemplates}
                className="btn-secondary text-sm"
              >
                📥 导出模板
              </button>
            </div>

            {templates.length > 0 ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        属性数: {template.attributes.length}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id!)}
                      className="btn-danger text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>还没有模板</p>
              </div>
            )}
          </div>
        )}

        {/* 灵感库管理 */}
        {selectedTab === 'inspirations' && (
          <div>
            {/* 添加条目按钮 */}
            <div className="mb-6">
              {!showAddLibrary ? (
                <button
                  onClick={() => setShowAddLibrary(true)}
                  className="btn-primary"
                >
                  + 添加条目
                </button>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">新建条目</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLibraryName}
                      onChange={(e) => setNewLibraryName(e.target.value)}
                      className="input-field flex-1"
                      placeholder="输入条目名字（如：颜色、风格、光线）"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddLibrary();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAddLibrary}
                      className="btn-primary whitespace-nowrap"
                    >
                      确定
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLibrary(false);
                        setNewLibraryName('');
                      }}
                      className="btn-secondary whitespace-nowrap"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 灵感库列表 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                当前灵感库 ({inspirations.length} 项)
              </h3>
              {inspirations.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {inspirations.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.attributeName}
                          </p>
                          <p className="text-xs text-gray-600">共 {item.items.length} 个词汇</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAddWordModalOpen(item.id!)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                          >
                            ➕ 添加词汇
                          </button>
                          <button
                            onClick={() => handleDeleteInspirationLibrary(item.id!)}
                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </div>

                      {/* 添加词汇弹框 */}
                      {addWordModalOpen === item.id && (
                        <div className="mb-3 p-3 bg-white border border-blue-200 rounded">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newWord}
                              onChange={(e) => setNewWord(e.target.value)}
                              className="input-field flex-1 text-sm h-8"
                              placeholder="输入词汇"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') handleAddWordToLibrary(item.id!);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddWordToLibrary(item.id!)}
                              className="btn-primary text-sm px-3 whitespace-nowrap"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => {
                                setAddWordModalOpen(null);
                                setNewWord('');
                              }}
                              className="btn-secondary text-sm px-3 whitespace-nowrap"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 词汇列表 */}
                      <div className="flex flex-wrap gap-2">
                        {item.items.length > 0 ? (
                          item.items.map((word, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs flex items-center gap-1 group hover:bg-red-50"
                            >
                              <span>{word}</span>
                              <button
                                onClick={() => handleRemoveInspirationWord(item.id!, word)}
                                className="text-gray-400 hover:text-red-600 hidden group-hover:inline text-xs font-bold cursor-pointer"
                                title="删除词汇"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400">暂无词汇</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">📭 还没有灵感库条目</p>
                  <p className="text-sm">点击"添加条目"开始创建吧</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

