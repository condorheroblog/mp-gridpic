/**
 * 版式分发中心 - 根据当前 LayoutKind 返回对应 React 节点
 *
 * 结构(从外到内,所有版式共享):
 *   - 最外层 canvas:由父级提供,模拟画布背景
 *   - containerPadding 区:整组图片与画布之间的"容器外边距",由 theme.containerPadding 控制
 *   - 卡片外壳:border + borderRadius + background + padding,由 theme.card* 控制,
 *     对所有版式统一生效,与 lib/inlineHtml.ts 的 cardWrapper 行为一致
 *   - 版式主体:single / double / grid / pyramid / waterfall / hscroll / vscroll
 */
import type { CSSProperties } from "react";

import type { ImageItem, LayoutKind, StyleTheme } from "../../../types";
import { DoubleLayout } from "./DoubleLayout";
import { GridLayout } from "./GridLayout";
import { HScrollLayout } from "./HScrollLayout";
import { PyramidLayout } from "./PyramidLayout";
import { SingleLayout } from "./SingleLayout";
import { VScrollLayout } from "./VScrollLayout";
import { WaterfallLayout } from "./WaterfallLayout";

interface LayoutRendererProps {
	kind: LayoutKind
	images: ImageItem[]
	theme: StyleTheme
}

export function LayoutRenderer({ kind, images, theme }: LayoutRendererProps) {
	// 最外层容器外边距:整组图片与画布之间的间距,由 theme.containerPadding 控制。
	const containerStyle: CSSProperties = {
		padding: `${theme.containerPadding}px`,
		background: "transparent",
		boxSizing: "border-box",
	};
	// 卡片外壳:所有版式共享,使外层卡片样式(边框/圆角/背景/内边距)在预览区都能直观看到,
	// 并与 inlineHtml.ts 中的 cardWrapper 保持一致,保证预览/导出视觉同步。
	const cardStyle: CSSProperties = {
		padding: `${theme.cardPadding}px`,
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: theme.cardBorderColor,
		borderRadius: `${theme.cardRadius}px`,
		background: theme.cardBackground,
		boxSizing: "border-box",
		overflow: "hidden",
	};
	let inner: React.ReactNode = null;
	switch (kind) {
		case "single":
			inner = <SingleLayout images={images} theme={theme} />;
			break;
		case "double-row":
			inner = <DoubleLayout images={images} theme={theme} direction="row" />;
			break;
		case "double-col":
			inner = <DoubleLayout images={images} theme={theme} direction="column" />;
			break;
		case "triple-pyramid":
			inner = <PyramidLayout images={images} theme={theme} />;
			break;
		case "grid-2":
			inner = <GridLayout images={images} theme={theme} columns={2} />;
			break;
		case "grid-3":
			inner = <GridLayout images={images} theme={theme} columns={3} />;
			break;
		case "grid-4":
			inner = <GridLayout images={images} theme={theme} columns={4} />;
			break;
		case "waterfall":
			inner = <WaterfallLayout images={images} theme={theme} columns={2} />;
			break;
		case "hscroll":
			// hscroll 内部的滚动视口本身就需要占满宽度,所以这里不再额外嵌套卡片外壳;
			// 直接由外层 LayoutRenderer 提供的卡片外壳统一负责 border / padding / radius。
			inner = <HScrollLayout images={images} theme={theme} />;
			break;
		case "vscroll":
			inner = <VScrollLayout images={images} theme={theme} />;
			break;
		default: {
			const exhaustive: never = kind;
			void exhaustive;
			inner = null;
		}
	}
	return (
		<div style={containerStyle}>
			<div style={cardStyle}>{inner}</div>
		</div>
	);
}
