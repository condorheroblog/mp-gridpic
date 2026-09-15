import type {
	CaptionConfig,
	EditorConfig,
	LayoutId,
	PicItem,
	ScrollerConfig,
} from "../lib/types";
/**
 * 编辑器全局状态(zustand + localStorage 持久化)
 *
 * 用户的图片、说明、间距、圆角等所有偏好自动保存,刷新不丢失。
 */
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CONFIG, LAYOUT_MAP, LIMITS } from "../lib/constants";
import {
	buildPicsumUrl,
	createRandomSeed,
	DEMO_SEEDS,
	getLayoutDimensions,
} from "../lib/picsum";

function makeImage(index: number, layout: LayoutId = DEFAULT_CONFIG.layout, seed?: string): PicItem {
	const finalSeed = seed ?? DEMO_SEEDS[index] ?? createRandomSeed();
	return {
		id: nanoid(10),
		seed: finalSeed,
		src: buildPicsumUrl(finalSeed, getLayoutDimensions(layout, index)),
		// 说明需要复制进公众号,强制写死中文,不做国际化
		caption: `图片 ${index + 1}`,
	};
}

function createDefaultImages(count = 6): PicItem[] {
	return Array.from({ length: count }, (_, i) => makeImage(i));
}

/** 切换版式后,占位图按新版式槽位尺寸重新生成(自定义链接保持不变) */
function resizeSeedImages(images: PicItem[], layout: LayoutId): PicItem[] {
	return images.map((item, index) =>
		item.seed
			? { ...item, src: buildPicsumUrl(item.seed, getLayoutDimensions(layout, index)) }
			: item,
	);
}

/**
 * 让图片列表与版式要求保持一致:
 * 先按新版式槽位尺寸刷新占位图;宫格/三图等固定张数版式再自动补齐或裁剪。
 */
function reconcileImages(images: PicItem[], layout: LayoutId): PicItem[] {
	const resized = resizeSeedImages(images, layout);
	const exact = LAYOUT_MAP[layout]?.exactImages;
	if (!exact || resized.length === exact) {
		return resized;
	}
	if (resized.length > exact) {
		return resized.slice(0, exact);
	}
	const added = Array.from({ length: exact - resized.length }, (_, offset) =>
		makeImage(resized.length + offset, layout));
	return [...resized, ...added];
}

/** 当前版式是否锁定图片张数(宫格/三图) */
function isCountLocked(layout: LayoutId): boolean {
	return Boolean(LAYOUT_MAP[layout]?.exactImages);
}

function clampCount(n: number) {
	return Math.min(LIMITS.maxImages, Math.max(LIMITS.minImages, Math.round(n)));
}

interface EditorState extends EditorConfig {
	setLayout: (layout: LayoutId) => void
	setCount: (count: number) => void
	addImage: () => void
	removeImage: (id: string) => void
	/** 拖拽排序:把 activeId 移动到 overId 的位置 */
	moveImage: (activeId: string, overId: string) => void
	setCaption: (id: string, caption: string) => void
	setImageSrc: (id: string, src: string) => void
	/** 批量把所有图片替换为同一个链接 */
	replaceAllSrc: (src: string) => void
	shuffleOne: (id: string) => void
	shuffleAll: () => void
	setGap: (gap: number) => void
	setRadius: (radius: number) => void
	setSize: (size: number) => void
	patchScroller: (patch: Partial<ScrollerConfig>) => void
	patchCaption: (patch: Partial<CaptionConfig>) => void
	reset: () => void
}

const initialState: EditorConfig = {
	...DEFAULT_CONFIG,
	images: createDefaultImages(6),
};

export const useEditorStore = create<EditorState>()(
	persist(
		(set, get) => ({
			...initialState,

			setLayout: layout =>
				set(state => ({
					layout,
					images: reconcileImages(state.images, layout),
				})),

			setCount: count =>
				set((state) => {
					// 固定张数版式(宫格/三图)不允许手动调整数量
					if (isCountLocked(state.layout)) {
						return {};
					}
					const target = clampCount(count);
					if (target === state.images.length) {
						return {};
					}
					if (target < state.images.length) {
						return { images: state.images.slice(0, target) };
					}
					const added = Array.from({ length: target - state.images.length }, (_, i) =>
						makeImage(state.images.length + i, state.layout));
					return { images: [...state.images, ...added] };
				}),

			addImage: () => {
				const state = get();
				if (isCountLocked(state.layout) || state.images.length >= LIMITS.maxImages) {
					return;
				}
				state.setCount(state.images.length + 1);
			},

			removeImage: id =>
				set(state => ({
					images:
						isCountLocked(state.layout) || state.images.length <= LIMITS.minImages
							? state.images
							: state.images.filter(item => item.id !== id),
				})),

			moveImage: (activeId, overId) =>
				set((state) => {
					if (activeId === overId) {
						return {};
					}
					const from = state.images.findIndex(item => item.id === activeId);
					const to = state.images.findIndex(item => item.id === overId);
					if (from === -1 || to === -1) {
						return {};
					}
					const images = [...state.images];
					const [moved] = images.splice(from, 1);
					images.splice(to, 0, moved);
					return { images };
				}),

			setCaption: (id, caption) =>
				set(state => ({
					images: state.images.map(item =>
						item.id === id ? { ...item, caption } : item,
					),
				})),

			setImageSrc: (id, src) =>
				set(state => ({
					images: state.images.map(item =>
						item.id === id ? { ...item, src: src.trim(), seed: null } : item,
					),
				})),

			replaceAllSrc: src =>
				set(state => ({
					images: state.images.map(item => ({
						...item,
						src: src.trim(),
						seed: null,
					})),
				})),

			shuffleOne: id =>
				set(state => ({
					images: state.images.map((item, index) => {
						if (item.id !== id) {
							return item;
						}
						const seed = createRandomSeed();
						return {
							...item,
							seed,
							src: buildPicsumUrl(seed, getLayoutDimensions(state.layout, index)),
						};
					}),
				})),

			shuffleAll: () =>
				set(state => ({
					images: resizeSeedImages(
						state.images.map((item) => {
							const seed = createRandomSeed();
							return { ...item, seed };
						}),
						state.layout,
					),
				})),

			setGap: gap => set({ gap }),
			setRadius: radius => set({ radius }),
			setSize: size => set({ size }),
			patchScroller: patch =>
				set(state => ({ scroller: { ...state.scroller, ...patch } })),
			patchCaption: patch =>
				set(state => ({ caption: { ...state.caption, ...patch } })),

			reset: () => set({ ...DEFAULT_CONFIG, images: createDefaultImages(6) }),
		}),
		{
			name: "mp-gridpic-editor",
			version: 2,
			// v1→v2 结构无破坏性变化,兼容处理统一在 merge 中完成;
			// 仍需提供 migrate,避免版本不匹配时控制台报错
			migrate: persisted => persisted as EditorState,
			// 深合并嵌套配置,避免旧版本缓存缺少新增字段
			merge: (persisted, current) => {
				const saved = persisted as Partial<EditorState> | undefined;
				if (!saved) {
					return current;
				}
				const layout: LayoutId = saved.layout ?? current.layout;
				const savedImages
					= Array.isArray(saved.images) && saved.images.length > 0
						? saved.images
						: current.images;
				return {
					...current,
					...saved,
					layout,
					scroller: { ...current.scroller, ...saved.scroller },
					caption: { ...current.caption, ...saved.caption },
					// 宫格/三图等固定张数版式:旧缓存图片数可能不符,启动时自动补齐/裁剪
					images: reconcileImages(savedImages, layout),
				};
			},
		},
	),
);
