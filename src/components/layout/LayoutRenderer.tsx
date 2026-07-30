/**
 * 版式分发中心 - 根据当前 LayoutKind 返回对应 React 节点
 */
import type { CSSProperties } from "react";

import type { ImageItem, LayoutKind, StyleTheme } from "../../types";
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
	const wrapperStyle: CSSProperties = {
		padding: `${theme.containerPadding}px`,
		background: "transparent",
	};
	switch (kind) {
		case "single":
			return <div style={wrapperStyle}><SingleLayout images={images} theme={theme} /></div>;
		case "double-row":
			return <div style={wrapperStyle}><DoubleLayout images={images} theme={theme} direction="row" /></div>;
		case "double-col":
			return <div style={wrapperStyle}><DoubleLayout images={images} theme={theme} direction="column" /></div>;
		case "triple-pyramid":
			return <div style={wrapperStyle}><PyramidLayout images={images} theme={theme} /></div>;
		case "grid-2":
			return <div style={wrapperStyle}><GridLayout images={images} theme={theme} columns={2} /></div>;
		case "grid-3":
			return <div style={wrapperStyle}><GridLayout images={images} theme={theme} columns={3} /></div>;
		case "grid-4":
			return <div style={wrapperStyle}><GridLayout images={images} theme={theme} columns={4} /></div>;
		case "waterfall":
			return <div style={wrapperStyle}><WaterfallLayout images={images} theme={theme} columns={2} /></div>;
		case "hscroll":
			return <div style={wrapperStyle}><HScrollLayout images={images} theme={theme} /></div>;
		case "vscroll":
			return <div style={wrapperStyle}><VScrollLayout images={images} theme={theme} /></div>;
		default: {
			const exhaustive: never = kind;
			void exhaustive;
			return null;
		}
	}
}
