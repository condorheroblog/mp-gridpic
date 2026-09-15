/**
 * 全局常量与默认配置
 */
import type { EditorConfig, LayoutMeta } from "./types";

/** 各可调参数的取值范围(同时用于表单验证) */
export const LIMITS = {
	minImages: 1,
	maxImages: 16,
	gap: { min: 0, max: 30, step: 1 },
	radius: { min: 0, max: 40, step: 1 },
	size: { min: 50, max: 100, step: 1 },
	scrollerBorder: { min: 0, max: 10, step: 1 },
	scrollerRadius: { min: 0, max: 32, step: 1 },
	scrollerPadding: { min: 0, max: 40, step: 1 },
	scrollerHeight: { min: 240, max: 600, step: 4 },
	captionFontSize: { min: 12, max: 20, step: 1 },
	captionMaxLength: 50,
} as const;

/** 左右滑动时,每张图片相对可视宽度的占比(留出"露出下一张"的提示) */
export const SWIPE_H_ITEM_PERCENT = 62;

/** 版式元信息(顺序即切换器展示顺序;滑动版式置顶,默认进入即左右滑动) */
export const LAYOUTS: readonly LayoutMeta[] = [
	{ id: "swipe-h", group: "scroll" },
	{ id: "swipe-v", group: "scroll" },
	{ id: "single", group: "basic", maxImages: 1 },
	{ id: "duo-row", group: "basic", maxImages: 2 },
	{ id: "duo-col", group: "basic", maxImages: 2 },
	{ id: "tri-top", group: "tri", exactImages: 3 },
	{ id: "tri-bottom", group: "tri", exactImages: 3 },
	{ id: "tri-left", group: "tri", exactImages: 3 },
	{ id: "tri-right", group: "tri", exactImages: 3 },
	{ id: "grid-2", group: "grid", exactImages: 4 },
	{ id: "grid-3", group: "grid", exactImages: 9 },
	{ id: "grid-4", group: "grid", exactImages: 16 },
] as const;

export const LAYOUT_MAP = Object.fromEntries(LAYOUTS.map(l => [l.id, l])) as Record<
	EditorConfig["layout"],
	LayoutMeta
>;

/** 默认编辑器配置 */
export const DEFAULT_CONFIG: EditorConfig = {
	layout: "swipe-h",
	images: [],
	gap: 8,
	radius: 8,
	size: 100,
	scroller: {
		// 系统默认:灰色边框 + 适当圆角 + 内容与容器保持距离
		borderWidth: 1,
		borderColor: "#d1d5db",
		radius: 12,
		padding: 12,
		height: 380,
		fullBleed: true,
	},
	caption: {
		visible: true,
		position: "above",
		fontSize: 14,
		color: "#6b7280",
	},
};
