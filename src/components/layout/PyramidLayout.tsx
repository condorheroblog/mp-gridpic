/**
 * 品字三图:上方大图+下方双图
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCell } from "../canvas/ImageCell";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
}

export function PyramidLayout({ images, theme }: LayoutProps) {
	const [a, b, c] = images;
	if (!a || !b || !c)
		return null;
	const top: CSSProperties = { width: "100%", aspectRatio: `${a.ratio}` };
	const bottom: CSSProperties = {
		display: "flex",
		flexDirection: "row",
		gap: `${theme.gap}px`,
		marginTop: `${theme.gap}px`,
	};
	const half: CSSProperties = { flex: 1, aspectRatio: `${b.ratio}` };
	return (
		<div>
			<ImageCell image={a} theme={theme} style={top} />
			<div style={bottom}>
				<ImageCell image={b} theme={theme} style={half} />
				<ImageCell image={c} theme={theme} style={half} />
			</div>
		</div>
	);
}
