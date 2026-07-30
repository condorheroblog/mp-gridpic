import type { CaptionPosition, ImageItem, LayoutPreset, ShadowPreset, StylePreset, StyleTheme } from "../types";
/**
 * 文档 Store - 当前画布的版式、样式、图片列表与所有变更操作
 * 选用 Zustand:轻量、API 直接,与 React 19 兼容良好
 */
import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";
import { getLayoutPreset, LAYOUT_PRESETS } from "../data/layouts";
import { getStylePreset, STYLE_PRESETS } from "../data/styles";
import { createImageItem, reorderArray } from "../lib/image";

/** 兼容旧版本的 theme 字段。 */
function migrateTheme(theme: Partial<StyleTheme> | null | undefined): StyleTheme | null {
	if (!theme)
		return null;
	const fallback = getStylePreset("style.standard").theme;
	// 旧版本含 shadowBlur / shadowColor / shadowOffsetY 字段,新版本合并为 shadowPreset,
	// 因此显式剔除旧字段避免污染。scrollItemWidth 已在重构中替换为 itemRatio,同样需要剔除。
	const cleaned: Partial<StyleTheme> = { ...theme };
	delete (cleaned as Record<string, unknown>).shadowBlur;
	delete (cleaned as Record<string, unknown>).shadowColor;
	delete (cleaned as Record<string, unknown>).shadowOffsetY;
	delete (cleaned as Record<string, unknown>).scrollItemWidth;
	return {
		...fallback,
		...cleaned,
		// 旧版本没有 captionPosition,显式补全默认值。
		captionPosition: (theme.captionPosition as CaptionPosition | undefined) ?? fallback.captionPosition,
		// 旧版本没有 shadowPreset,统一补全默认中档。
		shadowPreset: (theme.shadowPreset as ShadowPreset | undefined) ?? fallback.shadowPreset,
	};
}

interface DocumentStore {
	layoutId: string
	styleId: string
	images: ImageItem[]
	/** 用户对当前样式的局部覆盖(修改面板中产生的临时值) */
	themeOverride: StyleTheme | null

	layout: () => LayoutPreset
	style: () => StylePreset
	theme: () => StyleTheme

	setLayout: (id: string) => void
	setStyle: (id: string) => void
	updateTheme: (patch: Partial<StyleTheme>) => void
	resetThemeToPreset: () => void

	addImage: () => void
	removeImage: (id: string) => void
	updateImage: (id: string, patch: Partial<ImageItem>) => void
	reorder: (from: number, to: number) => void
	clearImages: () => void

	fillToCount: (count: number) => void
	loadFromTemplate: (layoutId: string, styleId: string, images?: ImageItem[]) => void
}

const initialLayout = LAYOUT_PRESETS[0];
const initialStyle = STYLE_PRESETS[0];
const initialImages: ImageItem[] = [
	createImageItem({ id: "img-init-1", alt: "demo 1", ratio: 4 / 3 }),
	createImageItem({ id: "img-init-2", alt: "demo 2", ratio: 4 / 3 }),
	createImageItem({ id: "img-init-3", alt: "demo 3", ratio: 4 / 3 }),
];

function clampToLayoutRange(images: ImageItem[], layout: LayoutPreset): ImageItem[] {
	if (images.length < layout.minItems) {
		const extra: ImageItem[] = [];
		for (let i = images.length; i < layout.minItems; i++) {
			extra.push(createImageItem());
		}
		return [...images, ...extra];
	}
	if (images.length > layout.maxItems) {
		return images.slice(0, layout.maxItems);
	}
	return images;
}

export const useDocumentStore = create<DocumentStore>()(
	persist(
		(set, get) => ({
			layoutId: initialLayout.id,
			styleId: initialStyle.id,
			images: clampToLayoutRange(initialImages, initialLayout),
			themeOverride: null,

			layout: () => getLayoutPreset(get().layoutId),
			style: () => getStylePreset(get().styleId),
			theme: () => get().themeOverride ?? getStylePreset(get().styleId).theme,

			setLayout: (id) => {
				const layout = getLayoutPreset(id);
				set(state => ({
					layoutId: id,
					images: clampToLayoutRange(state.images, layout),
				}));
			},

			setStyle: id => set({ styleId: id, themeOverride: null }),

			updateTheme: (patch) => {
				set((state) => {
					const base = state.themeOverride ?? getStylePreset(state.styleId).theme;
					return { themeOverride: { ...base, ...patch } };
				});
			},

			resetThemeToPreset: () => set({ themeOverride: null }),

			addImage: () => {
				const layout = get().layout();
				set((state) => {
					if (state.images.length >= layout.maxItems)
						return state;
					// 新增图片默认填入非空的图片说明(如 "图片 N"),保证预览与复制后能看到说明文字。
					const nextIndex = state.images.length + 1;
					const caption = `图片 ${nextIndex}`;
					return { images: [...state.images, createImageItem({ caption })] };
				});
			},

			removeImage: (id) => {
				const layout = get().layout();
				set((state) => {
					if (state.images.length <= layout.minItems)
						return state;
					return { images: state.images.filter(item => item.id !== id) };
				});
			},

			updateImage: (id, patch) => {
				set(state => ({
					images: state.images.map(item => item.id === id ? { ...item, ...patch } : item),
				}));
			},

			reorder: (from, to) => {
				set(state => ({ images: reorderArray(state.images, from, to) }));
			},

			clearImages: () => {
				const layout = get().layout();
				const minCount = layout.minItems;
				set({ images: Array.from({ length: minCount }, () => createImageItem()) });
			},

			fillToCount: (count) => {
				const layout = get().layout();
				const target = Math.max(layout.minItems, Math.min(layout.maxItems, count));
				set((state) => {
					if (state.images.length === target)
						return state;
					if (state.images.length < target) {
						const extras: ImageItem[] = [];
						for (let i = state.images.length; i < target; i++) {
							extras.push(createImageItem());
						}
						return { images: [...state.images, ...extras] };
					}
					return { images: state.images.slice(0, target) };
				});
			},

			loadFromTemplate: (layoutId, styleId, images) => {
				const layout = getLayoutPreset(layoutId);
				const baseImages = images && images.length > 0 ? images : [createImageItem(), createImageItem(), createImageItem()];
				set({
					layoutId,
					styleId,
					themeOverride: null,
					images: clampToLayoutRange(baseImages, layout),
				});
			},
		}),
		{
			name: "mp-gridpic.doc",
			storage: createJSONStorage(() => localStorage),
			version: 2,
			// 旧版本数据没有 captionPosition 字段;migrate 补齐默认值。
			migrate: (persistedState, _version) => {
				if (!persistedState || typeof persistedState !== "object")
					return persistedState as DocumentStore;
				const state = persistedState as Partial<DocumentStore>;
				return {
					...state,
					themeOverride: migrateTheme(state.themeOverride),
				} as DocumentStore;
			},
		},
	),
);
