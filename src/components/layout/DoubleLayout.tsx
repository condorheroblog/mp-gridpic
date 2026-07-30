/**
 * 双图版式 - 双图横排 / 双图竖排 共用一个组件
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	direction: "row" | "column"
}

export function DoubleLayout({ images, theme, direction }: LayoutProps) {
	const [a, b] = images;
	if (!a || !b)
		return null;
	const containerStyle: CSSProperties = {
		display: "flex",
		flexDirection: direction,
		gap: `${theme.gap}px`,
	};
	const cellStyle: CSSProperties = {
		flex: 1,
		width: direction === "row" ? "50%" : "100%",
		aspectRatio: `${a.ratio}`,
	};
	const cellStyleB: CSSProperties = {
		flex: 1,
		width: direction === "row" ? "50%" : "100%",
		aspectRatio: `${b.ratio}`,
	};
	return (
		<div style={containerStyle}>
			<ImageCell image={a} theme={theme} style={cellStyle} />
			<ImageCell image={b} theme={theme} style={cellStyleB} />
		</div>
	);
}
