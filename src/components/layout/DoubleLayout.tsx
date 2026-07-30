/**
 * 双图版式 - 双图横排 / 双图竖排 共用一个组件
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { getColumnSpacing } from "../../lib/layoutUtils";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	direction: "row" | "column"
}

export function DoubleLayout({ images, theme, direction }: LayoutProps) {
	const [a, b] = images;
	if (!a || !b)
		return null;
	const rowStyle: CSSProperties = {
		fontSize: 0,
		lineHeight: 0,
	};
	const stackItemStyle = (index: number): CSSProperties => ({
		marginTop: index === 0 ? 0 : `${theme.gap}px`,
	});
	const rowCellStyle = (index: number): CSSProperties => {
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
		direction === "row"
			? (
				<section style={rowStyle}>
					<section style={rowCellStyle(0)}>
						<ImageBlock image={a} theme={theme} />
					</section>
					<section style={rowCellStyle(1)}>
						<ImageBlock image={b} theme={theme} />
					</section>
				</section>
			)
			: (
				<section>
					<section style={stackItemStyle(0)}>
						<ImageBlock image={a} theme={theme} />
					</section>
					<section style={stackItemStyle(1)}>
						<ImageBlock image={b} theme={theme} />
					</section>
				</section>
			)
	);
}
