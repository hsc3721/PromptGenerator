import { useState } from 'react';

interface PromptPreviewProps {
  prompt: string;
}

export default function PromptPreview({ prompt }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([prompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'prompt.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📤 提示词预览</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 min-h-[120px]">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {prompt || '（暂无内容）'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {copied ? '✓ 已复制' : '📋 复制'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          💾 下载
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
        <p>💡 提示：提示词会实时更新。编辑左侧属性后会自动重新生成。</p>
      </div>
    </div>
  );
}
