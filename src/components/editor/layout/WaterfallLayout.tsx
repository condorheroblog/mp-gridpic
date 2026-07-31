/**
 * 瀑布流版式 - 拆成两列,按累计高度交替填入
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../../types";
import { distributeWaterfall, getColumnSpacing } from "../../../lib/layoutUtils";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	columns?: number
}

export function WaterfallLayout({ images, theme, columns = 2 }: LayoutProps) {
	if (images.length === 0)
		return null;
	const buckets = distributeWaterfall(images, columns);
	const wrapperStyle: CSSProperties = {
		fontSize: 0,
		lineHeight: 0,
	};
	const columnStyle: CSSProperties = {
		display: "block",
		width: "100%",
		boxSizing: "border-box",
	};
	return (
		<section style={wrapperStyle}>
			{buckets.map((bucket, index) => (
				<section
					key={bucket.map(image => image.id).join("-") || "empty-column"}
					style={{
						display: "inline-block",
						verticalAlign: "top",
						width: `${(100 / columns).toFixed(4)}%`,
						paddingLeft: `${getColumnSpacing(index, columns, theme.gap).left}px`,
						paddingRight: `${getColumnSpacing(index, columns, theme.gap).right}px`,
						boxSizing: "border-box",
					}}
				>
					<section style={columnStyle}>
						{bucket.map((image, itemIndex) => (
							<section key={image.id} style={{ marginTop: itemIndex === 0 ? 0 : `${theme.gap}px` }}>
								<ImageBlock image={image} theme={theme} />
							</section>
						))}
					</section>
				</section>
			))}
		</section>
	);
}
