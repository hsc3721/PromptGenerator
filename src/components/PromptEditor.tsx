import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { promptActions, inspirationActions } from '../db';

export default function PromptEditor() {
  const { templates, inspirations, selectedTemplateId, addPrompt: storeAddPrompt } = useAppStore();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedTemplateId || '');
  const [promptName, setPromptName] = useState('');
  const [promptValues, setPromptValues] = useState<Record<string, string>>({});
  const [customAttributes, setCustomAttributes] = useState<Array<{ name: string; key: string }>>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [inspirationInputs, setInspirationInputs] = useState<Record<string, string>>({});
  const [expandedInspirations, setExpandedInspirations] = useState<Record<string, boolean>>({});

  const currentTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplate),
    [templates, selectedTemplate]
  );

  // 获取当前模板的灵感库
  const templateInspirations = useMemo(() => {
    if (!currentTemplate) return {};
    const result: Record<string, string[]> = {};
    currentTemplate.attributes.forEach((attr) => {
      const inspirationItem = inspirations.find((i) => i.attributeKey === attr.key);
      if (inspirationItem) {
        result[attr.key] = inspirationItem.items;
      }
    });
    return result;
  }, [currentTemplate, inspirations]);

  // 处理模板选择
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setPromptValues({});
    setCustomAttributes([]);
    setPromptName('');
    setNewCustomKey('');
  };

  // 处理属性值变化
  const handleAttributeChange = (key: string, value: string) => {
    setPromptValues({
      ...promptValues,
      [key]: value,
    });
  };

  // 添加自定义属性
  const handleAddCustomAttribute = () => {
    if (newCustomKey.trim()) {
      setCustomAttributes([
        ...customAttributes,
        { name: newCustomKey, key: newCustomKey.toLowerCase() },
      ]);
      setNewCustomKey('');
      setShowAddCustom(false);
    }
  };

  // 删除自定义属性
  const handleRemoveCustomAttribute = (key: string) => {
    setCustomAttributes(customAttributes.filter((a) => a.key !== key));
    const newValues = { ...promptValues };
    delete newValues[key];
    setPromptValues(newValues);
  };

  // 添加灵感词汇
  const handleAddInspirationWord = async (attributeKey: string) => {
    const newWord = inspirationInputs[attributeKey]?.trim();
    if (!newWord) {
      alert('请输入词汇');
      return;
    }

    const inspirationItem = inspirations.find((i) => i.attributeKey === attributeKey);
    if (!inspirationItem) {
      alert('灵感库不存在');
      return;
    }

    // 检查是否重复
    if (inspirationItem.items.includes(newWord)) {
      alert('该词汇已存在');
      return;
    }

    try {
      const updatedItems = [...inspirationItem.items, newWord];
      await inspirationActions.update(inspirationItem.id!, {
        ...inspirationItem,
        items: updatedItems,
      });

      // 清空输入框
      setInspirationInputs({
        ...inspirationInputs,
        [attributeKey]: '',
      });

      // 刷新灵感库数据
      const updated = await inspirationActions.getAll();
      useAppStore.setState({
        inspirations: updated,
      });
    } catch (error) {
      console.error('添加词汇失败:', error);
      alert('添加失败');
    }
  };

  // 删除灵感词汇
  const handleRemoveInspirationWord = async (attributeKey: string, word: string) => {
    if (!confirm(`确定删除词汇"${word}"吗？`)) return;

    const inspirationItem = inspirations.find((i) => i.attributeKey === attributeKey);
    if (!inspirationItem) {
      alert('灵感库不存在');
      return;
    }

    try {
      const updatedItems = inspirationItem.items.filter((w) => w !== word);
      await inspirationActions.update(inspirationItem.id!, {
        ...inspirationItem,
        items: updatedItems,
      });

      // 刷新灵感库数据
      const updated = await inspirationActions.getAll();
      useAppStore.setState({
        inspirations: updated,
      });
    } catch (error) {
      console.error('删除词汇失败:', error);
      alert('删除失败');
    }
  };

  // 转义正则表达式特殊字符
  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // 生成最终提示词
  const generateFinalPrompt = () => {
    if (!currentTemplate) return '';
    
    let result = currentTemplate.templateString;
    
    // 替换模板属性（支持中文名称和英文key两种占位符）
    currentTemplate.attributes.forEach((attr) => {
      const value = promptValues[attr.key] || '';
      
      // 替换中文属性名占位符（如 {场景}）
      if (attr.name) {
        const regexChinese = new RegExp(`\\{${escapeRegExp(attr.name)}\\}`, 'g');
        result = result.replace(regexChinese, value);
      }
      
      // 替换英文key占位符（如 {scene}）
      if (attr.key) {
        const regexEnglish = new RegExp(`\\{${escapeRegExp(attr.key)}\\}`, 'g');
        result = result.replace(regexEnglish, value);
      }
    });

    // 替换自定义属性
    customAttributes.forEach((attr) => {
      const value = promptValues[attr.key] || '';
      
      // 替换中文属性名占位符
      if (attr.name) {
        const regexChinese = new RegExp(`\\{${escapeRegExp(attr.name)}\\}`, 'g');
        result = result.replace(regexChinese, value);
      }
      
      // 替换英文key占位符
      if (attr.key) {
        const regexEnglish = new RegExp(`\\{${escapeRegExp(attr.key)}\\}`, 'g');
        result = result.replace(regexEnglish, value);
      }
    });

    return result.trim();
  };

  // 保存提示词
  const handleSavePrompt = async () => {
    if (!currentTemplate) {
      alert('请先选择模板');
      return;
    }
    if (!promptName.trim()) {
      alert('请输入提示词名称');
      return;
    }

    const finalPrompt = generateFinalPrompt();
    if (!finalPrompt) {
      alert('提示词不能为空，请至少填写一个属性');
      return;
    }

    try {
      const id = await promptActions.create({
        name: promptName,
        templateId: currentTemplate.id!,
        values: promptValues,
        finalPrompt,
        tags: [],
      });

      const newPrompt = {
        id: id.toString(),
        name: promptName,
        templateId: currentTemplate.id!,
        values: promptValues,
        finalPrompt,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      storeAddPrompt(newPrompt);
      alert('提示词已保存！');
      
      // 重置表单
      setPromptName('');
      setPromptValues({});
      setCustomAttributes([]);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    }
  };

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ 创建提示词</h2>

        {/* 模板选择 */}
        <div className="mb-6">
          <label className="label font-semibold">选择模板</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.length > 0 ? (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id!)}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <p className="text-xs text-gray-500 mt-1">属性数: {template.attributes.length}</p>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <p>还没有模板，请先创建一个</p>
              </div>
            )}
          </div>
        </div>

        {currentTemplate && (
          <>
            {/* 提示词名称 */}
            <div className="mb-6">
              <label className="label">提示词名称</label>
              <input
                type="text"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                className="input-field"
                placeholder="为你的提示词起个名字"
              />
            </div>

            {/* 模板属性 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">模板属性</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {currentTemplate.attributes.map((attr) => (
                  <div key={attr.key}>
                    <label className="label">{attr.name}</label>
                    <textarea
                      value={promptValues[attr.key] || ''}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                      className="input-field resize-none h-20"
                      placeholder={`输入${attr.name}`}
                    />
                    {templateInspirations[attr.key] && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <button
                          onClick={() =>
                            setExpandedInspirations({
                              ...expandedInspirations,
                              [attr.key]: !expandedInspirations[attr.key],
                            })
                          }
                          className="font-semibold text-gray-700 mb-2 flex items-center gap-1 hover:text-blue-700 w-full"
                        >
                          💡 灵感词汇 ({templateInspirations[attr.key].length} 项)
                          <span>{expandedInspirations[attr.key] ? '▼' : '▶'}</span>
                        </button>

                        {expandedInspirations[attr.key] && (
                          <>
                            {/* 词汇列表 */}
                            {templateInspirations[attr.key].length > 0 && (
                              <div className="bg-white p-2 rounded mb-2 space-y-1">
                                {templateInspirations[attr.key].map((word) => (
                                  <div
                                    key={word}
                                    className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                                  >
                                    <span
                                      className="cursor-pointer flex-1"
                                      onClick={() => handleAttributeChange(attr.key, word)}
                                    >
                                      {word}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveInspirationWord(attr.key, word)}
                                      className="text-red-600 hover:text-red-800 font-bold text-xs px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 添加新词汇 */}
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={inspirationInputs[attr.key] || ''}
                                onChange={(e) =>
                                  setInspirationInputs({
                                    ...inspirationInputs,
                                    [attr.key]: e.target.value,
                                  })
                                }
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddInspirationWord(attr.key);
                                  }
                                }}
                                className="input-field flex-1 h-7 text-xs px-2 py-0"
                                placeholder="输入新词汇..."
                              />
                              <button
                                onClick={() => handleAddInspirationWord(attr.key)}
                                className="bg-blue-600 text-white px-2 py-0 rounded text-xs hover:bg-blue-700 font-semibold"
                              >
                                + 添加
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 自定义属性 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">自定义属性</h3>
                <button
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {showAddCustom ? '取消' : '+ 添加属性'}
                </button>
              </div>

              {showAddCustom && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newCustomKey}
                    onChange={(e) => setNewCustomKey(e.target.value)}
                    className="input-field w-full"
                    placeholder="属性名称（如：特效、风格）"
                  />
                  <button
                    onClick={handleAddCustomAttribute}
                    className="btn-secondary mt-2 w-full"
                  >
                    确认添加
                  </button>
                </div>
              )}

              {customAttributes.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {customAttributes.map((attr) => (
                    <div key={attr.key}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="label">{attr.name}</label>
                        <button
                          onClick={() => handleRemoveCustomAttribute(attr.key)}
                          className="text-red-600 text-xs font-bold hover:text-red-800"
                        >
                          删除
                        </button>
                      </div>
                      <input
                        type="text"
                        value={promptValues[attr.key] || ''}
                        onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                        className="input-field"
                        placeholder={`输入${attr.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 预览 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">提示词预览</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {generateFinalPrompt() || '填写属性后，提示词将显示在这里'}
                </p>
              </div>
            </div>

            {/* 保存按钮 */}
            <button onClick={handleSavePrompt} className="btn-primary w-full">
              保存提示词
            </button>
          </>
        )}
      </div>
    </div>
  );
}
