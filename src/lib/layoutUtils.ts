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
 * 把图片按顺序轮流分到各列,用于瀑布流版式。
 */
export function distributeWaterfall<T>(items: T[], columns: number): T[][] {
	if (columns <= 0)
		return [items];
	const buckets: T[][] = Array.from({ length: columns }, () => []);
	items.forEach((item, index) => {
		buckets[index % columns].push(item);
	});
	return buckets;
}
