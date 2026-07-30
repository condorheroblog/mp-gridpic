import type { ImageItem, Template } from "../types";
/**
 * 模板 Store - 用户保存的版式+样式组合,持久化到 localStorage
 */
import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";

interface TemplateStore {
	templates: Template[]
	save: (name: string, layoutId: string, styleId: string, snapshot?: ImageItem[]) => Template
	remove: (id: string) => void
	rename: (id: string, name: string) => void
}

export const useTemplateStore = create<TemplateStore>()(
	persist(
		(set, get) => ({
			templates: [],
			save: (name, layoutId, styleId) => {
				const template: Template = {
					id: `tpl-${Date.now().toString(36)}`,
					name: name.trim() || "Untitled",
					layoutId,
					styleId,
					createdAt: Date.now(),
				};
				set({ templates: [template, ...get().templates] });
				void ([] as ImageItem[]);
				return template;
			},
			remove: (id) => {
				set({ templates: get().templates.filter(item => item.id !== id) });
			},
			rename: (id, name) => {
				set({
					templates: get().templates.map(item => item.id === id ? { ...item, name: name.trim() || item.name } : item),
				});
			},
		}),
		{
			name: "mp-gridpic.templates",
			storage: createJSONStorage(() => localStorage),
			version: 1,
		},
	),
);
