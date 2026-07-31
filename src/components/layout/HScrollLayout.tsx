/**
 * 横向滑动画廊 - 严格遵循公众号编辑器静态规范
 *
 * 注意:外层"卡片外壳"(border / radius / padding / background)由父级 LayoutRenderer 统一提供,
 * 本组件只负责"滚动视口 + 内容容器 + 图片项 + 提示文案",避免重复嵌套造成 padding / 边框叠加。
 *
 * 间距规范(三者:说明 / 图片 / 提示文案,横竖向滚动版式保持一致):
 *   - 整体上下边距 = 卡片外壳 padding 控制(由 LayoutRenderer 提供)
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
	// 滚动视口:overflow-x:auto + 左右 padding 10px。
	// maxWidth 显式声明 100% 并加 !important,避免被公众号编辑器自带样式里的 max-width 限制,
	// 保持预览/复制行为一致。
	const viewportStyle: CSSProperties = {
		display: "inline-block",
		width: "100%",
		maxWidth: "100% !important",
		verticalAlign: "top",
		overflowX: "auto",
		overflowY: "hidden",
		margin: 0,
		// padding: `0 ${BLOCK_GAP}px`,
		boxSizing: "border-box",
	};
	// 内容容器:宽度 = 图片张数 × 单图占比(视口百分比),根据图片个数自动分配,
	// 不再使用硬编码 300% / rotate hack,新结构依赖明确的百分比宽度让横向滚动持续生效。
	// 单张图占视口的 theme.itemRatio(默认 1),所以内容容器宽度 = N × itemRatio。
	// maxWidth 显式声明 none 并加 !important,抵消公众号编辑器对祖先元素施加的 max-width 限制,
	// 保证内容容器能按 N × itemRatio 正常撑开,触发横向滚动。
	const itemRatio = theme.itemRatio;
	const scrollerStyle: CSSProperties = {
		overflow: "hidden",
		width: `${(images.length * itemRatio * 100).toFixed(4)}%`,
		maxWidth: "none !important",
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
	// 滑动提示文案:放在滚动视口外部,与 VScrollLayout 保持一致,
	// 这样横向滑动图片时提示文案不会被一起滚走,始终固定在卡片底部可见。
	// margin-top = BLOCK_GAP 保证图片 ↔ 提示 节奏;下边距由卡片外壳 padding 接管。
	const captionStyle: CSSProperties = {
		textAlign: "center",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		margin: `${BLOCK_GAP}px 0 0 0`,
		// 注意:不在文本容器上设置 line-height: 0(违反公众号静态规范 §2.3)。
		lineHeight: 1.6,
		boxSizing: "border-box",
	};
	return (
		<>
			{/* 滚动视口只负责图片的横向滚动 */}
			<section style={viewportStyle}>
				<section style={scrollerStyle}>
					{images.map(image => (
						<section key={image.id} style={itemStyle()}>
							<ImageBlock image={image} theme={theme} />
						</section>
					))}
				</section>
			</section>
			{/* 左右滑动查看 提示文案 - 放在滚动视口外部,横向滚动时不被带走,始终显示在卡片底部 */}
			<p style={captionStyle} className="select-none">
				左右滑动查看
			</p>
		</>
	);
}
