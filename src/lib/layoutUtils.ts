import type { ImageItem } from "../types";

/**
 * 把顺序数组按固定长度切分,便于网格版式按行渲染。
 */
export function chunkItems<T>(items: T[], size: number): T[][] {
	if (size <= 0)
		return [items];
	const rows: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		rows.push(items.slice(index, index + size));
	}
	return rows;
}

/**
 * 计算横向并排单元格的左右留白,让相邻单元之间保持 gap,同时不在容器边缘额外撑开。
 */
export function getColumnSpacing(index: number, total: number, gap: number) {
	return {
		left: index === 0 ? 0 : gap / 2,
		right: index === total - 1 ? 0 : gap / 2,
	};
}

/**
 * 按累计高度把图片分配到较短的一列,用于瀑布流版式。
 */
export function distributeWaterfall(images: ImageItem[], columns: number): ImageItem[][] {
	const buckets: ImageItem[][] = Array.from({ length: columns }, () => []);
	const totals = Array.from<number>({ length: columns }).fill(0);
	images.forEach((image) => {
		let target = 0;
		for (let index = 1; index < columns; index++) {
			if (totals[index] < totals[target])
				target = index;
		}
		buckets[target].push(image);
		totals[target] += 1 / Math.max(image.ratio, 0.1);
	});
	return buckets;
}
