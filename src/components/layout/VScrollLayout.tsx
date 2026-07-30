/**
 * 固定区域垂直滚动画廊 - 通过固定 height + overflow-y:auto 实现
 *
 * 结构与 HScrollLayout 对齐:外层是带边框/圆角的卡片外壳(用户可直观看到复制后会带边框),
 * 内部滚动容器只负责图片的纵向滚动,"上下滑动查看"提示放在滚动容器外部,避免被覆盖。
 *
 * 间距规范(三者:说明 / 图片 / 提示文案,与 HScrollLayout 保持一致):
 *   - 整体上下边距 = 10px(由卡片外壳的 padding 控制,说明隐藏时结构依然对称)
 *   - 左右总间距 = 20px(卡片外壳 padding 10px + 滚动容器 padding:0 10px,图片与卡片边缘留 20px)
 *   - 说明 ↔ 图片 = 10px(由 ImageCaption 的 margin 控制)
 *   - 图片 ↔ 提示文案 = 10px(由提示 p 的 margin-top 控制)
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	dark?: boolean
}

// 与 HScrollLayout 共用的"块间距",保证说明 / 图片 / 提示三者之间的节奏完全一致。
const BLOCK_GAP = 10;

export function VScrollLayout({ images, theme, dark: _dark }: LayoutProps) {
	// 卡片外壳:边框 + 圆角 + overflow:hidden + 上下左右 10px padding,
	// 与 HScrollLayout 的卡片外壳结构对齐,让用户在预览区直观看到复制后会带边框。
	// padding 四边 10px 配合下方滚动容器的 padding:0 10px,保证左右总间距 20px(与修改前一致)。
	const cardStyle: CSSProperties = {
		display: "inline-block",
		width: "100%",
		verticalAlign: "top",
		alignSelf: "flex-start",
		flex: "0 0 auto",
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: theme.cardBorderColor,
		borderRadius: `${theme.cardRadius}px`,
		overflow: "hidden",
		padding: `${BLOCK_GAP}px`,
		boxSizing: "border-box",
	};
	// 滚动容器:固定高度 + overflow-y:auto,只负责图片的滚动;
	// 这里不再包含"上下滑动查看"提示,提示放在滚动容器外部,避免被覆盖在图片上。
	const scrollerStyle: CSSProperties = {
		overflowX: "hidden",
		overflowY: "auto",
		WebkitOverflowScrolling: "touch",
		height: `${theme.scrollHeight}px`,
		padding: `0 ${BLOCK_GAP}px`,
		boxSizing: "border-box",
	};
	const itemStyle = (): CSSProperties => ({
		width: "100%",
		boxSizing: "border-box",
	});
	// 提示文案样式:与 HScrollLayout 的"左右滑动查看"节奏一致;
	// 只有 margin-top 维持 10px,下边距由卡片外壳的 padding-bottom 接管。
	const hintStyle: CSSProperties = {
		textAlign: "center",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		margin: `${BLOCK_GAP}px 0 0 0`,
		// 注意:不在文本容器上设置 line-height: 0(违反公众号静态规范 §2.3)。
		lineHeight: 1.6,
		boxSizing: "border-box",
	};
	return (
		<section style={cardStyle}>
			<section style={scrollerStyle}>
				{images.map((image, index) => (
					<section
						key={image.id}
						style={{ ...itemStyle(), marginTop: index === 0 ? 0 : `${theme.gap}px` }}
					>
						<ImageBlock image={image} theme={theme} />
					</section>
				))}
			</section>
			{/* 上下滑动查看 提示文案 - 放在滚动容器外部,避免遮挡图片 */}
			<p style={hintStyle} className="select-none">
				上下滑动查看
			</p>
		</section>
	);
}
