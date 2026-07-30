/**
 * 工具函数 - 通用能力
 */

import type { ImageItem } from "../types";

const FALLBACK_RATIO = 1;

/**
 * 从 https://picsum.photos 拼一个可稳定展示的占位图 URL。
 * seed 保证同一个槽位刷新后图不变;ratio 决定大致长宽比。
 */
export function buildPicsumUrl(seed: string, ratio = 1, width = 800): string {
	const safeWidth = Math.max(120, Math.round(width));
	const height = Math.max(120, Math.round(safeWidth / (ratio > 0 ? ratio : FALLBACK_RATIO)));
	return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${safeWidth}/${height}`;
}

export function createImageItem(overrides: Partial<ImageItem> = {}): ImageItem {
	const id = overrides.id ?? `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const ratio = overrides.ratio ?? 1;
	return {
		id,
		alt: overrides.alt ?? "",
		ratio,
		src: overrides.src ?? buildPicsumUrl(id, ratio),
		caption: overrides.caption ?? "",
	};
}

/**
 * 工具:在数组里重新排序,生成新数组(不修改入参)
 */
export function reorderArray<T>(list: T[], from: number, to: number): T[] {
	if (from === to)
		return list.slice();
	const next = list.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}
