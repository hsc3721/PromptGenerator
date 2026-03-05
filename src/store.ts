import { create } from 'zustand';
import { Template, Prompt, InspirationItem } from './db';

interface AppStore {
  // 模板相关
  templates: Template[];
  selectedTemplateId: string | null;
  
  // 提示词相关
  prompts: Prompt[];
  currentPrompt: Prompt | null;
  
  // 灵感库相关
  inspirations: InspirationItem[];
  
  // UI状态
  activeTab: 'template-editor' | 'prompt-editor' | 'library' | 'manage';
  
  // 模板操作
  setTemplates: (templates: Template[]) => void;
  setSelectedTemplateId: (id: string | null) => void;
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  
  // 提示词操作
  setPrompts: (prompts: Prompt[]) => void;
  setCurrentPrompt: (prompt: Prompt | null) => void;
  addPrompt: (prompt: Prompt) => void;
  removePrompt: (id: string) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  
  // 灵感库操作
  setInspirations: (inspirations: InspirationItem[]) => void;
  updateInspirationItems: (id: string, items: string[]) => void;
  
  // UI操作
  setActiveTab: (tab: 'template-editor' | 'prompt-editor' | 'library' | 'manage') => void;
}

export const useAppStore = create<AppStore>((set) => ({
  templates: [],
  selectedTemplateId: null,
  prompts: [],
  currentPrompt: null,
  inspirations: [],
  activeTab: 'template-editor',

  setTemplates: (templates) => set({ templates }),
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [template, ...state.templates],
    })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  setPrompts: (prompts) => set({ prompts }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  addPrompt: (prompt) =>
    set((state) => ({
      prompts: [prompt, ...state.prompts],
    })),
  removePrompt: (id) =>
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
    })),
  updatePrompt: (id, updates) =>
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setInspirations: (inspirations) => set({ inspirations }),
  updateInspirationItems: (id, items) =>
    set((state) => ({
      inspirations: state.inspirations.map((i) =>
        i.id === id ? { ...i, items } : i
      ),
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
