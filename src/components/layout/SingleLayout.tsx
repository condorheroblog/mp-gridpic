/**
 * 单图版式
 */
import type { ImageItem, StyleTheme } from "../../types";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
}

export function SingleLayout({ images, theme }: LayoutProps) {
	const first = images[0];
	if (!first)
		return null;
	return (
		<div style={{ display: "flex", justifyContent: "center" }}>
			<ImageCell
				image={first}
				theme={theme}
				style={{ width: "100%", maxWidth: 600, aspectRatio: `${first.ratio}` }}
			/>
		</div>
	);
}
