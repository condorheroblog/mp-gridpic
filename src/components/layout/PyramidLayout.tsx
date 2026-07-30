/**
 * 品字三图:上方大图+下方双图
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { getColumnSpacing } from "../../lib/layoutUtils";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
}

export function PyramidLayout({ images, theme }: LayoutProps) {
	const [a, b, c] = images;
	if (!a || !b || !c)
		return null;
	const bottom: CSSProperties = {
		fontSize: 0,
		lineHeight: 0,
		marginTop: `${theme.gap}px`,
	};
	const half = (index: number): CSSProperties => {
		const spacing = getColumnSpacing(index, 2, theme.gap);
		return {
			display: "inline-block",
			verticalAlign: "top",
			width: "50%",
			paddingLeft: `${spacing.left}px`,
			paddingRight: `${spacing.right}px`,
			boxSizing: "border-box",
		};
	};
	return (
		<section>
			<ImageBlock image={a} theme={theme} />
			<section style={bottom}>
				<section style={half(0)}>
					<ImageBlock image={b} theme={theme} />
				</section>
				<section style={half(1)}>
					<ImageBlock image={c} theme={theme} />
				</section>
			</section>
		</section>
	);
}
