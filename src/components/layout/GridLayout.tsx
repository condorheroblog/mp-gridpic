/**
 * 网格版式 - 通过列数切分等宽图片
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	columns: number
}

export function GridLayout({ images, theme, columns }: LayoutProps) {
	const cellStyle = (image: ImageItem): CSSProperties => ({
		width: `calc((100% - ${theme.gap * (columns - 1)}px) / ${columns})`,
		aspectRatio: `${image.ratio}`,
	});
	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: `${theme.gap}px`,
			}}
		>
			{images.map(image => (
				<div key={image.id} style={cellStyle(image)}>
					<ImageCell image={image} theme={theme} style={{ width: "100%", height: "100%" }} />
				</div>
			))}
		</div>
	);
}
