/**
 * 瀑布流版式 - 拆成两列,按累计高度交替填入
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	columns?: number
}

export function WaterfallLayout({ images, theme, columns = 2 }: LayoutProps) {
	const buckets: ImageItem[][] = Array.from({ length: columns }, () => []);
	const totals = Array.from<number>({ length: columns }).fill(0);
	images.forEach((image) => {
		let target = 0;
		for (let i = 1; i < columns; i++) {
			if (totals[i] < totals[target])
				target = i;
		}
		buckets[target].push(image);
		totals[target] += 1 / Math.max(image.ratio, 0.1);
	});
	const columnStyle: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		gap: `${theme.gap}px`,
	};
	return (
		<div style={{ display: "flex", flexDirection: "row", gap: `${theme.gap}px` }}>
			{buckets.map((bucket, index) => (
				// eslint-disable-next-line react/no-array-index-key
				<div key={`col-${index}-${bucket[0]?.id ?? "empty"}`} style={columnStyle}>
					{bucket.map(image => (
						<ImageCell
							key={image.id}
							image={image}
							theme={theme}
							style={{ width: "100%", aspectRatio: `${image.ratio}` }}
						/>
					))}
				</div>
			))}
		</div>
	);
}
