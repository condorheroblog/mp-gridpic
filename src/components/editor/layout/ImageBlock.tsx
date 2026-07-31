/**
 * 统一的图片块 - 所有版式都复用同一套"上说明 + 图片 + 下说明"结构,
 * 这样预览区域与导出到公众号的 HTML 会保持一致。
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageCaption } from "../canvas/ImageCaption";
import { ImageCell } from "../canvas/ImageCell";

interface ImageBlockProps {
	image: ImageItem
	theme: StyleTheme
	style?: CSSProperties
	imageStyle?: CSSProperties
}

export function ImageBlock({ image, theme, style, imageStyle }: ImageBlockProps) {
	return (
		<section style={{ display: "block", width: "100%", boxSizing: "border-box", ...style }}>
			<ImageCaption image={image} theme={theme} position="above" />
			<ImageCell
				image={image}
				theme={theme}
				style={{ width: "100%", ...imageStyle }}
			/>
			<ImageCaption image={image} theme={theme} position="below" />
		</section>
	);
}
