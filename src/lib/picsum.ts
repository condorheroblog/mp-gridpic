/**
 * picsum.photos 占位图工具
 *
 * 设计要点:
 *  - 使用 seed 形式(https://picsum.photos/seed/{seed}/{w}/{h})保证同一 seed 永远对应同一张图,
 *    满足"选择并固定示例图片用于功能演示"。
 *  - 每种版式请求统一尺寸,保证宫格内图片比例一致、布局稳定。
 */
import type { LayoutId } from "./types";

export interface PicsumDimensions {
	width: number
	height: number
}

/** 不同版式的占位图请求尺寸(即图片原始宽度,会写入 img[data-w]) */
export const LAYOUT_DIMENSIONS: Record<LayoutId, PicsumDimensions> = {
	"single": { width: 1080, height: 720 },
	"duo-col": { width: 1080, height: 720 },
	"duo-row": { width: 800, height: 800 },
	// 三图版式中两张小图为方图,通栏位尺寸见 getLayoutDimensions
	"tri-top": { width: 600, height: 600 },
	"tri-bottom": { width: 600, height: 600 },
	"tri-left": { width: 600, height: 600 },
	"tri-right": { width: 600, height: 600 },
	"grid-2": { width: 800, height: 800 },
	"grid-3": { width: 600, height: 600 },
	"grid-4": { width: 400, height: 400 },
	"swipe-h": { width: 900, height: 1200 },
	"swipe-v": { width: 1080, height: 810 },
};

/** 三图版式通栏位(大图)尺寸:横版 2:1、竖版 1:2,与两张方图严丝合缝 */
const TRI_WIDE_DIMS: PicsumDimensions = { width: 1200, height: 600 };
const TRI_TALL_DIMS: PicsumDimensions = { width: 600, height: 1200 };

/**
 * 按槽位返回占位图尺寸。
 * 三图版式的通栏位与小图位比例不同,必须按槽位区分;
 * 其余版式所有图片共用同一尺寸。
 */
export function getLayoutDimensions(layout: LayoutId, index: number): PicsumDimensions {
	switch (layout) {
		case "tri-top":
			// 槽位 0 为顶部通栏横图
			return index === 0 ? TRI_WIDE_DIMS : LAYOUT_DIMENSIONS[layout];
		case "tri-bottom":
			// 槽位 2 为底部通栏横图
			return index === 2 ? TRI_WIDE_DIMS : LAYOUT_DIMENSIONS[layout];
		case "tri-left":
			// 槽位 0 为左侧通栏竖图
			return index === 0 ? TRI_TALL_DIMS : LAYOUT_DIMENSIONS[layout];
		case "tri-right":
			// 槽位 2 为右侧通栏竖图
			return index === 2 ? TRI_TALL_DIMS : LAYOUT_DIMENSIONS[layout];
		default:
			return LAYOUT_DIMENSIONS[layout];
	}
}

/** 固定演示种子:刷新页面后示例图保持不变(覆盖四宫格 16 张) */
export const DEMO_SEEDS = [
	"mp-gridpic-demo-1",
	"mp-gridpic-demo-2",
	"mp-gridpic-demo-3",
	"mp-gridpic-demo-4",
	"mp-gridpic-demo-5",
	"mp-gridpic-demo-6",
	"mp-gridpic-demo-7",
	"mp-gridpic-demo-8",
	"mp-gridpic-demo-9",
	"mp-gridpic-demo-10",
	"mp-gridpic-demo-11",
	"mp-gridpic-demo-12",
	"mp-gridpic-demo-13",
	"mp-gridpic-demo-14",
	"mp-gridpic-demo-15",
	"mp-gridpic-demo-16",
];

/** 构造 picsum 链接 */
export function buildPicsumUrl(seed: string, dims: PicsumDimensions): string {
	return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${dims.width}/${dims.height}`;
}

/** 生成一个随机种子,用于"换一张 / 一键换一批" */
export function createRandomSeed(): string {
	return `pic-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

/** 判断链接是否为 http(s) 地址(表单校验用) */
export function isValidImageUrl(url: string): boolean {
	try {
		const u = new URL(url.trim());
		return u.protocol === "http:" || u.protocol === "https:";
	}
	catch {
		return false;
	}
}
