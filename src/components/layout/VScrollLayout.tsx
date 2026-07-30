/**
 * 固定区域垂直滚动画廊 - 通过固定 height + overflow-y:auto 实现
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCaption } from "../canvas/ImageCaption";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	dark?: boolean
}

export function VScrollLayout({ images, theme, dark: _dark }: LayoutProps) {
	const wrapperStyle: CSSProperties = {
		overflowX: "hidden",
		overflowY: "auto",
		WebkitOverflowScrolling: "touch",
		display: "flex",
		flexDirection: "column",
		gap: `${theme.gap}px`,
		height: `${theme.scrollHeight}px`,
		scrollSnapType: "y proximity",
	};
	const itemStyle = (image: ImageItem): CSSProperties => ({
		width: "100%",
		aspectRatio: `${image.ratio}`,
		scrollSnapAlign: "start",
		display: "flex",
		flexDirection: "column",
	});
	return (
		<div style={wrapperStyle}>
			{images.map(image => (
				<div key={image.id} style={itemStyle(image)}>
					<ImageCaption image={image} theme={theme} position="above" />
					<ImageCell image={image} theme={theme} style={{ width: "100%", flex: 1 }} />
					<ImageCaption image={image} theme={theme} position="below" />
				</div>
			))}
		</div>
	);
}
