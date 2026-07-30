/**
 * 内置版式注册表
 * 每个版式提供一个 id、nameKey、kind、最小/最大图片数。
 * 任何"加版式"操作都只需要往这里追加一项,UI 即可自动渲染。
 */
import type { LayoutKind, LayoutPreset } from "../types";

export const LAYOUT_PRESETS: LayoutPreset[] = [
	// 默认版式 - 横向滑动画廊,首次进入即展示
	{ id: "layout.hscroll", nameKey: "layout.hscroll", isBuiltIn: true, kind: "hscroll", minItems: 2, maxItems: 30 },
	{ id: "layout.vscroll", nameKey: "layout.vscroll", isBuiltIn: true, kind: "vscroll", minItems: 2, maxItems: 30 },
	{ id: "layout.single", nameKey: "layout.single", isBuiltIn: true, kind: "single", minItems: 1, maxItems: 1 },
	{ id: "layout.double-row", nameKey: "layout.double-row", isBuiltIn: true, kind: "double-row", minItems: 2, maxItems: 2 },
	{ id: "layout.double-col", nameKey: "layout.double-col", isBuiltIn: true, kind: "double-col", minItems: 2, maxItems: 2 },
	{ id: "layout.triple-pyramid", nameKey: "layout.triple-pyramid", isBuiltIn: true, kind: "triple-pyramid", minItems: 3, maxItems: 3 },
	{ id: "layout.grid-2", nameKey: "layout.grid-2", isBuiltIn: true, kind: "grid-2", minItems: 2, maxItems: 4 },
	{ id: "layout.grid-3", nameKey: "layout.grid-3", isBuiltIn: true, kind: "grid-3", minItems: 3, maxItems: 9 },
	{ id: "layout.grid-4", nameKey: "layout.grid-4", isBuiltIn: true, kind: "grid-4", minItems: 4, maxItems: 16 },
	{ id: "layout.waterfall", nameKey: "layout.waterfall", isBuiltIn: true, kind: "waterfall", minItems: 3, maxItems: 24 },
];

export type LayoutKindAlias = LayoutKind;

export function getLayoutPreset(id: string): LayoutPreset {
	return LAYOUT_PRESETS.find(item => item.id === id) ?? LAYOUT_PRESETS[0];
}
