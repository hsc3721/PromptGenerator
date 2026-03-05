import { useState } from 'react';
import { useAppStore } from '../store';
import { templateActions } from '../db';
import { Template, TemplateAttribute } from '../db';

export default function TemplateEditor() {
  const { templates, addTemplate, updateTemplate, removeTemplate, inspirations } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedInspirationId, setSelectedInspirationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    category: 'portrait',
    attributes: [],
    templateString: '',
    tags: [],
  });
  const [newAttribute, setNewAttribute] = useState({ name: '', key: '' });

  const handleAddAttribute = () => {
    if (newAttribute.name && newAttribute.key) {
      const attr: TemplateAttribute = {
        name: newAttribute.name,
        key: newAttribute.key,
        order: formData.attributes.length + 1,
      };
      setFormData({
        ...formData,
        attributes: [...formData.attributes, attr],
      });
      setNewAttribute({ name: '', key: '' });
      setSelectedInspirationId(null);
    }
  };

  const handleSelectInspiration = (inspirationId: string) => {
    const inspiration = inspirations.find((i) => i.id === inspirationId);
    if (inspiration) {
      setSelectedInspirationId(inspirationId);
      setNewAttribute({
        name: inspiration.attributeName,
        key: inspiration.attributeKey,
      });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newAttributes = [...formData.attributes];
    const [draggedAttr] = newAttributes.splice(draggedIndex, 1);
    newAttributes.splice(targetIndex, 0, draggedAttr);

    // 按顺序整被更新 order
    const updatedAttributes = newAttributes.map((attr, idx) => ({
      ...attr,
      order: idx + 1,
    }));

    setFormData({
      ...formData,
      attributes: updatedAttributes,
    });
    setDraggedIndex(null);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || formData.attributes.length === 0) {
      alert('请输入模板名称并至少添加一个属性');
      return;
    }

    try {
      if (editingId) {
        await templateActions.update(editingId, formData);
        updateTemplate(editingId, formData);
      } else {
        const result = await templateActions.create(formData);
        const newTemplate: Template = {
          ...formData,
          id: result.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addTemplate(newTemplate);
      }
      alert('模板保存成功！');
      resetForm();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'portrait',
      attributes: [],
      templateString: '',
      tags: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      await templateActions.delete(id);
      removeTemplate(id);
      alert('删除成功');
    }
  };

  return (
    <div>
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">📋 模板管理</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + 新建模板
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? '编辑模板' : '创建新模板'}
          </h3>

          <div className="space-y-4">
            {/* 基本信息 */}
            <div>
              <label className="label">模板名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="如：人物写真、风景摄影"
              />
            </div>

            <div>
              <label className="label">模板描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="描述这个模板的用途"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="portrait">人物肖像</option>
                  <option value="landscape">风景摄影</option>
                  <option value="product">产品拍摄</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            {/* 属性定义 */}
            <div>
              <label className="label font-semibold mb-3">定义属性</label>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  💡 快速方式：从灵感库选择属性 | 手动输入新属性
                </p>

                {/* 从灵感库选择 */}
                {inspirations.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-300">
                    <label className="text-xs font-semibold text-gray-700 mb-2 block">
                      从灵感库选择
                    </label>
                    <select
                      value={selectedInspirationId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSelectInspiration(e.target.value);
                        }
                      }}
                      className="input-field mb-2"
                    >
                      <option value="">-- 选择灵感库条目 --</option>
                      {inspirations.map((inspiration) => (
                        <option key={inspiration.id} value={inspiration.id}>
                          {inspiration.attributeName} ({inspiration.items.length} 项词汇)
                        </option>
                      ))}
                    </select>
                    {selectedInspirationId && (
                      <button
                        onClick={handleAddAttribute}
                        className="btn-primary w-full"
                      >
                        添加这个属性
                      </button>
                    )}
                  </div>
                )}

                {/* 手动输入 */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">
                    或手动输入新属性
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newAttribute.name}
                      onChange={(e) => {
                        setNewAttribute({ ...newAttribute, name: e.target.value });
                        setSelectedInspirationId(null);
                      }}
                      className="input-field"
                      placeholder="属性名称（中文，如：主体）"
                    />
                    <input
                      type="text"
                      value={newAttribute.key}
                      onChange={(e) => {
                        setNewAttribute({ ...newAttribute, key: e.target.value });
                        setSelectedInspirationId(null);
                      }}
                      className="input-field"
                      placeholder="属性键（英文，如：subject）"
                    />
                    <button
                      onClick={handleAddAttribute}
                      className="btn-secondary w-full"
                    >
                      + 添加属性
                    </button>
                  </div>
                </div>
              </div>

              {/* 已添加属性列表 */}
              {formData.attributes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-2">💡 提示：拖拽化简可排序</p>
                  {formData.attributes.map((attr, idx) => {
                    const relatedInspo = inspirations.find((i) => i.attributeKey === attr.key);
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`flex items-center justify-between bg-primary-50 border-2 p-3 rounded cursor-move transition ${
                          draggedIndex === idx
                            ? 'border-primary-400 bg-primary-100 opacity-50'
                            : 'border-primary-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xs font-bold text-primary-600 bg-white px-2 py-1 rounded">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{attr.name}</p>
                            <p className="text-xs text-gray-600">{attr.key}</p>
                            {relatedInspo && (
                              <p className="text-xs text-blue-600 mt-1">
                                🔗 已关联灵感库：{relatedInspo.attributeName} ({relatedInspo.items.length} 项)
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAttribute(idx)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 模板字符串 */}
            <div>
              <label className="label">提示词模板格式</label>
              <textarea
                value={formData.templateString}
                onChange={(e) => setFormData({ ...formData, templateString: e.target.value })}
                className="input-field h-24 resize-none font-mono text-sm"
                placeholder="使用属性键作为占位符，如：{subject}，{background}..."
              />
              <p className="text-xs text-gray-600 mt-2">
                💡 示例：{'{'}主体{'}'}, {'{'}背景{'}'}, {'{'}光线{'}'}
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveTemplate}
                className="btn-primary flex-1"
              >
                保存模板
              </button>
              <button
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="card">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">属性数: {template.attributes.length}</p>
              <div className="flex flex-wrap gap-1">
                {template.attributes.slice(0, 3).map((attr) => (
                  <span key={attr.key} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                    {attr.name}
                  </span>
                ))}
                {template.attributes.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                    +{template.attributes.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormData(template);
                  setEditingId(template.id!);
                  setShowForm(true);
                }}
                className="btn-secondary text-sm flex-1"
              >
                编辑
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id!)}
                className="btn-danger text-sm flex-1"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">还没有创建模板</p>
          <p className="text-gray-400 text-sm mb-6">点击"新建模板"开始创建你的第一个模板吧</p>
        </div>
      )}
    </div>
  );
}
