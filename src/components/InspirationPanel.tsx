import { db } from '../db';
import { useEffect, useState } from 'react';

export default function InspirationPanel() {
  const [inspirations, setInspirations] = useState<Record<string, string[]>>({});
  const [selectedField, setSelectedField] = useState<string>('');

  useEffect(() => {
    const loadInspirations = async () => {
      const all = await db.inspirations.toArray();
      const map: Record<string, string[]> = {};
      all.forEach((item) => {
        map[item.attributeName] = item.items;
      });
      setInspirations(map);
      if (all.length > 0) {
        setSelectedField(all[0].attributeName);
      }
    };
    loadInspirations();
  }, []);

  const fields = Object.keys(inspirations);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">💡 灵感库</h3>

      {fields.length > 0 ? (
        <div>
          {/* Field Selector */}
          <div className="mb-4">
            <label className="label">选择属性</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="input-field"
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Inspirations Grid */}
          {selectedField && inspirations[selectedField] && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">
                {selectedField.replace(/_/g, ' ').toUpperCase()} 建议:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {inspirations[selectedField].map((item) => (
                  <div
                    key={item}
                    className="p-2 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded cursor-pointer hover:shadow-md hover:border-purple-400 transition-all text-xs text-gray-700 text-center"
                    title={`Click to use: ${item}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <p>💭 浏览灵感获取创意，点击可快速应用到编辑器</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">正在加载灵感库...</p>
      )}
    </div>
  );
}
