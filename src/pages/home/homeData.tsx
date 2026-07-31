/**
 * 首页静态数据 - 标题/描述键与渲染器。
 * 渲染器来自 showcaseRenderers;文案全部通过 i18n key 引用,本文件不持有翻译。
 *
 * 此文件只导出数据(常量),便于 fast refresh。
 *
 * 顺序说明:横滚 / 纵滚放最前面,因为它们是 mp-gridpic 的招牌特性,
 * 同时也是用户在编辑器主页面打开就能看到的初始画布。
 */
import type { ReactNode } from "react";

import {
	DoubleColPreview,
	DoubleRowPreview,
	Grid2Preview,
	Grid3Preview,
	Grid4Preview,
	HScrollPreview,
	PyramidPreview,
	SinglePreview,
	VScrollPreview,
	WaterfallPreview,
} from "./showcaseRenderers";

export interface HomeShowcaseItem {
	kind: string
	titleKey: string
	descKey: string
	render: () => ReactNode
}

export const HOME_SHOWCASE: HomeShowcaseItem[] = [
	{ kind: "hscroll", titleKey: "home.showcase.hscroll.title", descKey: "home.showcase.hscroll.desc", render: HScrollPreview },
	{ kind: "vscroll", titleKey: "home.showcase.vscroll.title", descKey: "home.showcase.vscroll.desc", render: VScrollPreview },
	{ kind: "single", titleKey: "home.showcase.single.title", descKey: "home.showcase.single.desc", render: SinglePreview },
	{ kind: "double-row", titleKey: "home.showcase.doubleRow.title", descKey: "home.showcase.doubleRow.desc", render: DoubleRowPreview },
	{ kind: "double-col", titleKey: "home.showcase.doubleCol.title", descKey: "home.showcase.doubleCol.desc", render: DoubleColPreview },
	{ kind: "triple-pyramid", titleKey: "home.showcase.triplePyramid.title", descKey: "home.showcase.triplePyramid.desc", render: PyramidPreview },
	{ kind: "grid-2", titleKey: "home.showcase.grid2.title", descKey: "home.showcase.grid2.desc", render: Grid2Preview },
	{ kind: "grid-3", titleKey: "home.showcase.grid3.title", descKey: "home.showcase.grid3.desc", render: Grid3Preview },
	{ kind: "grid-4", titleKey: "home.showcase.grid4.title", descKey: "home.showcase.grid4.desc", render: Grid4Preview },
	{ kind: "waterfall", titleKey: "home.showcase.waterfall.title", descKey: "home.showcase.waterfall.desc", render: WaterfallPreview },
];
