import Dexie, { Table } from 'dexie';

// 模板界面定义属性
export interface TemplateAttribute {
  name: string;           // 属性中文名称（如"主体"、"背景"）
  key: string;            // 属性英文键（如"subject"、"background"）
  description?: string;   // 描述
  order: number;          // 排序
}

// 模板
export interface Template {
  id?: string;
  name: string;           // 模板名称（如"人物写真"、"风景摄影"）
  description?: string;   // 模板描述
  attributes: TemplateAttribute[];  // 模板包含的属性
  templateString: string; // 提示词模板（如"{主体}，{背景}..."）
  category: string;       // 分类
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 灵感项（支持动态添加）
export interface InspirationItem {
  id?: string;
  attributeKey: string;   // 关联的属性键（如"subject"）
  attributeName: string;  // 关联的属性中文名
  items: string[];        // 灵感词汇列表
  createdAt: string;
  updatedAt: string;
}

// 提示词（基于模板创建）
export interface Prompt {
  id?: string;
  name: string;
  templateId: string;     // 关联的模板ID
  values: Record<string, string>;  // 属性值（键值对）
  finalPrompt: string;    // 最终中文提示词
  finalPromptEn?: string; // 翻译后的英文提示词
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

class PromptDB extends Dexie {
  templates!: Table<Template>;
  inspirations!: Table<InspirationItem>;
  prompts!: Table<Prompt>;

  constructor() {
    super('AIPromptGeneratorDB');
    this.version(2).stores({
      templates: '++id, category, createdAt',
      inspirations: '++id, attributeKey',
      prompts: '++id, templateId, createdAt',
    });
  }
}

export const db = new PromptDB();

// ========== 模板操作 ==========
export const templateActions = {
  async create(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `template_${Date.now()}`;
    return db.templates.add({
      ...template,
      id,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll() {
    return db.templates.toArray();
  },

  async getById(id: string) {
    return db.templates.get(id);
  },

  async update(id: string, updates: Partial<Template>) {
    return db.templates.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string) {
    return db.templates.delete(id);
  },

  async search(keyword: string) {
    const all = await db.templates.toArray();
    return all.filter(t =>
      t.name.toLowerCase().includes(keyword.toLowerCase()) ||
      t.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  },
};

// ========== 灵感库操作 ==========
export const inspirationActions = {
  // 获取某属性的灵感项
  async getByAttributeKey(attributeKey: string) {
    return db.inspirations.where('attributeKey').equals(attributeKey).first();
  },

  // 获取所有灵感项
  async getAll() {
    return db.inspirations.toArray();
  },

  // 创建灵感项
  async create(inspiration: Omit<InspirationItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `inspiration_${Date.now()}`;
    return db.inspirations.add({
      ...inspiration,
      id,
      createdAt: now,
      updatedAt: now,
    });
  },

  // 更新灵感项（添加/删除词汇）
  async update(id: string, updates: Partial<InspirationItem>) {
    return db.inspirations.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // 添加单个词汇到灵感项
  async addItem(attributeKey: string, item: string) {
    const existing = await this.getByAttributeKey(attributeKey);
    if (existing) {
      if (!existing.items.includes(item)) {
        existing.items.push(item);
        return this.update(existing.id!, { items: existing.items });
      }
    }
    return null;
  },

  // 删除灵感项中的词汇
  async removeItem(id: string, item: string) {
    const inspiration = await db.inspirations.get(id);
    if (inspiration) {
      inspiration.items = inspiration.items.filter(i => i !== item);
      return this.update(id, { items: inspiration.items });
    }
  },

  // 删除灵感项
  async delete(id: string) {
    return db.inspirations.delete(id);
  },
};

// ========== 提示词操作 ==========
export const promptActions = {
  async create(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const id = `prompt_${Date.now()}`;
    return db.prompts.add({
      ...prompt,
      id,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getAll() {
    return db.prompts.toArray();
  },

  async getByTemplateId(templateId: string) {
    return db.prompts.where('templateId').equals(templateId).toArray();
  },

  async getById(id: string) {
    return db.prompts.get(id);
  },

  async update(id: string, updates: Partial<Prompt>) {
    return db.prompts.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string) {
    return db.prompts.delete(id);
  },

  async search(keyword: string) {
    const all = await db.prompts.toArray();
    return all.filter(p =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.finalPrompt.toLowerCase().includes(keyword.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  },
};

// ========== 初始化默认数据 ==========
export const initializeDefaultData = async () => {
  // 检查是否已初始化
  const existingTemplates = await db.templates.count();
  if (existingTemplates > 0) return;

  const now = new Date().toISOString();

  // 创建默认模板
  const portraitTemplate: Template = {
    id: 'template_portrait',
    name: '人物写真',
    description: '用于生成人物肖像和写真风格的提示词',
    category: 'portrait',
    tags: ['人物', '肖像', '写真'],
    attributes: [
      { name: '主体', key: 'subject', order: 1 },
      { name: '服装类型', key: 'clothing_type', order: 2 },
      { name: '服装颜色', key: 'clothing_color', order: 3 },
      { name: '服装风格', key: 'clothing_style', order: 4 },
      { name: '发型', key: 'hairstyle', order: 5 },
      { name: '妆容', key: 'makeup', order: 6 },
      { name: '姿态', key: 'pose', order: 7 },
      { name: '背景', key: 'background', order: 8 },
      { name: '光线', key: 'lighting', order: 9 },
      { name: '品质', key: 'quality', order: 10 },
    ],
    templateString: '{主体}，穿着{服装风格}{服装颜色}{服装类型}，{发型}，{妆容}，{姿态}，{背景}，{光线}，{品质}',
    createdAt: now,
    updatedAt: now,
  };

  const landscapeTemplate: Template = {
    id: 'template_landscape',
    name: '风景摄影',
    description: '用于生成风景摄影类提示词',
    category: 'landscape',
    tags: ['风景', '摄影', '自然'],
    attributes: [
      { name: '场景', key: 'scene', order: 1 },
      { name: '季节', key: 'season', order: 2 },
      { name: '天气', key: 'weather', order: 3 },
      { name: '光线', key: 'lighting', order: 4 },
      { name: '视角', key: 'perspective', order: 5 },
      { name: '颜色', key: 'colors', order: 6 },
      { name: '品质', key: 'quality', order: 7 },
    ],
    templateString: '{场景}，{季节}，{天气}，{光线}，{视角}，{颜色}，{品质}',
    createdAt: now,
    updatedAt: now,
  };

  await db.templates.bulkAdd([portraitTemplate, landscapeTemplate]);

  // 创建默认灵感库
  const inspirations: InspirationItem[] = [
    {
      id: 'inspiration_subject',
      attributeKey: 'subject',
      attributeName: '主体',
      items: ['一个美女', '一个漂亮女孩', '一个优雅女性', '一个迷人美女', '一个年轻女人'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_clothing_type',
      attributeKey: 'clothing_type',
      attributeName: '服装类型',
      items: ['裙子', '连衣裙', '上衣', '牛仔裤', '礼服', '衬衫'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_clothing_color',
      attributeKey: 'clothing_color',
      attributeName: '服装颜色',
      items: ['红色', '蓝色', '白色', '黑色', '粉色', '绿色', '紫色', '金色'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_clothing_style',
      attributeKey: 'clothing_style',
      attributeName: '服装风格',
      items: ['优雅', '性感', '甜美', '复古', '现代', '波西米亚风'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_hairstyle',
      attributeKey: 'hairstyle',
      attributeName: '发型',
      items: ['长直发', '长卷发', '齐肩发', '及腰长发', '空气刘海', '法式烫', '编辫子'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_makeup',
      attributeKey: 'makeup',
      attributeName: '妆容',
      items: ['素颜妆', '烟熏妆', '欧美妆', '日系妆', '精致妆容', '淡妆'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_pose',
      attributeKey: 'pose',
      attributeName: '姿态',
      items: ['站立', '坐着', '躺着', '靠着', '走路', '扭头看', '回眸'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_background',
      attributeKey: 'background',
      attributeName: '背景',
      items: ['纯白背景', '工作室灯光', '自然景色', '城市街景', '沙滩', '森林', '虚化背景'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_lighting',
      attributeKey: 'lighting',
      attributeName: '光线',
      items: ['柔和光线', '金色光线', '侧光', '逆光', '自然光', '暖光', '冷光'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_quality',
      attributeKey: 'quality',
      attributeName: '品质',
      items: ['8K', '超细节', '杰作', '电影质感', '高质量', '专业级', '精细细节'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_scene',
      attributeKey: 'scene',
      attributeName: '场景',
      items: ['山川', '海边', '森林', '城市', '草原', '沙漠', '湖泊', '峡谷'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_season',
      attributeKey: 'season',
      attributeName: '季节',
      items: ['春季', '夏季', '秋季', '冬季', '樱花季', '金色秋天', '白雪皑皑'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_weather',
      attributeKey: 'weather',
      attributeName: '天气',
      items: ['晴天', '多云', '阴天', '雨天', '雾天', '彩虹', '日出', '日落'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_perspective',
      attributeKey: 'perspective',
      attributeName: '视角',
      items: ['广角', '俯拍', '仰拍', '侧面', '远景', '近景', '全景'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'inspiration_colors',
      attributeKey: 'colors',
      attributeName: '颜色',
      items: ['暖色调', '冷色调', '金色', '紫色系', '绿色系', '蓝色系', '柔和配色'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.inspirations.bulkAdd(inspirations);
};
