/**
 * 横向滑动画廊 - 严格遵循公众号编辑器静态规范
 *
 * 间距规范(三者:说明 / 图片 / 提示文案,横竖向滚动版式保持一致):
 *   - 整体上下边距 = 10px(由卡片外壳 padding 控制,说明隐藏时结构依然对称)
 *   - 滚动视口左右 padding = 10px(图片与卡片左右边缘留 10px)
 *   - 说明 ↔ 图片 = 10px(由 ImageCaption 的 margin 控制)
 *   - 图片 ↔ 提示文案 = 10px(由提示 p 的 margin-top 控制)
 *
 * 内容容器宽度公式:images.length × theme.itemRatio,
 * 单张图固定占视口的 itemRatio,横向滚动根据图片个数自动生效。
 * itemRatio 来自样式主题,默认 1(= 不滚动,刚好一图一屏)。
 *
 * 公众号静态规范注意事项:
 *  - 不设置 font-family,完全沿用平台默认字体栈。
 *  - 容器不使用固定 px 宽度,所有宽度使用百分比。
 *  - 不在文本容器上设置 line-height: 0(规范 §2.3)。
 *  - 不在 img 上设置 opacity: 0(规范 §2.1)。
 *  - 不使用 text-align: start/end(规范 §2.6)。
 *  - 不使用 <pre> 标签包裹普通段落(规范 §2.8)。
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../types";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	dark?: boolean
}

// 与 VScrollLayout 共用的"块间距",保证说明 / 图片 / 提示三者之间的节奏完全一致。
const BLOCK_GAP = 10;

export function HScrollLayout({ images, theme }: LayoutProps) {
	// 卡片外壳:边框 + 圆角 + overflow:hidden + 上下 10px padding,
	// 补齐整体上下边距,确保提示文案与图片节奏对称。
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
		padding: `${BLOCK_GAP}px 0`,
		boxSizing: "border-box",
	};
	// 滚动视口:overflow-x:auto + 左右 padding 10px。
	const viewportStyle: CSSProperties = {
		display: "inline-block",
		width: "100%",
		verticalAlign: "top",
		overflowX: "auto",
		overflowY: "hidden",
		margin: 0,
		padding: `0 ${BLOCK_GAP}px`,
		boxSizing: "border-box",
	};
	// 内容容器:宽度 = 图片张数 × 单图占比(视口百分比),根据图片个数自动分配,
	// 不再使用硬编码 300% / rotate hack,新结构依赖明确的百分比宽度让横向滚动持续生效。
	// 单张图占视口的 theme.itemRatio(默认 1),所以内容容器宽度 = N × itemRatio。
	const itemRatio = theme.itemRatio;
	const scrollerStyle: CSSProperties = {
		overflow: "hidden",
		width: `${(images.length * itemRatio * 100).toFixed(4)}%`,
		boxSizing: "border-box",
	};
	// 单张图占内容容器的 1/N,折算到视口就是 itemRatio:
	//   实际宽度 = (1/N) × (N × itemRatio) = itemRatio,与图片个数无关。
	// 横向间距 = theme.gap:把总间距平分到每张图两侧的 padding,
	// 让用户配置的"图片间距"在横向排列场景下也能生效。
	const halfGap = theme.gap / 2;
	const itemWidthPercent = images.length > 0 ? (1 / images.length) * 100 : 100;
	const itemStyle = (): CSSProperties => ({
		display: "inline-block",
		verticalAlign: "top",
		width: `${itemWidthPercent.toFixed(4)}%`,
		paddingLeft: `${halfGap}px`,
		paddingRight: `${halfGap}px`,
		boxSizing: "border-box",
	});
	// 滑动提示文案:与 VScrollLayout 一致,只有 margin-top 由卡片底部 padding 接管下边距,
	// 保证说明 ↔ 图片 ↔ 提示 三者之间均为 10px 节奏。
	const captionStyle: CSSProperties = {
		textAlign: "center",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		margin: `${BLOCK_GAP}px 0 0 0`,
		// 注意:不在文本容器上设置 line-height: 0(违反公众号静态规范 §2.3)。
		lineHeight: 1.6,
		boxSizing: "border-box",
		// 提示文案固定在卡片底部,确保滚动区域下方始终可见。
		position: "sticky",
		bottom: "0",
		display: "block",
		background: "transparent",
	};
	return (
		<section style={cardStyle}>
			<section style={viewportStyle}>
				<section style={scrollerStyle}>
					{images.map(image => (
						<section key={image.id} style={itemStyle()}>
							<ImageBlock image={image} theme={theme} />
						</section>
					))}
				</section>
			</section>
			{/* 左右滑动查看 提示文案 */}
			<p style={captionStyle} className="select-none">
				左右滑动查看
			</p>
		</section>
	);
}
