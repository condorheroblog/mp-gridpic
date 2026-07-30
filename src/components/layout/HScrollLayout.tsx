/**
 * 横向滑动画廊 - 在公众号编辑器内通过 overflow-x:auto + display:flex 实现
 * 关键点:每张图带"上方说明+图+下方说明"的小结构,容器使用 flex 横向排布;
 * 导出到公众号时改用 table[tr] 的 inline-block 等价物,避免 flex/gap 被清洗。
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

export function HScrollLayout({ images, theme, dark: _dark }: LayoutProps) {
	const wrapperStyle: CSSProperties = {
		overflowX: "auto",
		overflowY: "hidden",
		WebkitOverflowScrolling: "touch",
		display: "flex",
		flexDirection: "row",
		gap: `${theme.gap}px`,
		padding: "4px 0 12px 0",
		scrollSnapType: "x mandatory",
	};
	const itemStyle = (image: ImageItem): CSSProperties => ({
		flex: `0 0 ${theme.scrollItemWidth}px`,
		aspectRatio: `${image.ratio}`,
		scrollSnapAlign: "start",
		display: "flex",
		flexDirection: "column",
	});
	return (
		<div style={wrapperStyle}>
			{images.map(image => (
				<div key={image.id} style={itemStyle(image)}>
					{/* 上/下两个说明槽位始终占位,具体由主题 theme.captionPosition 决定渲染哪一个。 */}
					<ImageCaption image={image} theme={theme} position="above" />
					<ImageCell image={image} theme={theme} style={{ width: "100%", flex: 1 }} />
					<ImageCaption image={image} theme={theme} position="below" />
				</div>
			))}
		</div>
	);
}
