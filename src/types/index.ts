/**
 * 类型定义:版式(Layout)、样式(Style)、图片(Image)、模板(Template)
 * 整套数据模型的核心,所有模块围绕这些接口协同。
 */

/** 图片说明的位置:位于图片上方 / 位于图片下方 / 不显示 */
export type CaptionPosition = "above" | "below" | "hidden";

/** 阴影预设 - 提供小、中、大三档,统一控制模糊/偏移/颜色 */
export type ShadowPreset = "small" | "medium" | "large";

export interface ImageItem {
	id: string
	/** 远端图片 URL,默认使用 https://picsum.photos 占位图 */
	src: string
	/** 图片的 alt 属性,主要给屏幕阅读器使用 */
	alt: string
	/** 图片说明文字,会显示在预览区域,并可被复制到公众号 */
	caption?: string
}

/**
 * 版式类型 - 控制图片的"结构",即如何摆放在容器里。
 * - single: 单图
 * - double-row / double-col: 双图(横向 / 纵向两种变形)
 * - triple-pyramid: 品字(三图)
 * - grid-2 / grid-3 / grid-4: 网格
 * - waterfall: 瀑布流(多列,按顺序轮流分配)
 * - hscroll: 横向滑动画廊
 * - vscroll: 固定区域垂直滚动画廊
 */
export type LayoutKind
	= | "single"
	| "double-row"
	| "double-col"
	| "triple-pyramid"
	| "grid-2"
	| "grid-3"
	| "grid-4"
	| "waterfall"
	| "hscroll"
	| "vscroll";

export interface StyleTheme {
	/**
	 * 整组图片最外层容器(在版式之外、包裹一切的外壳)与预览/导出画布之间的间距,
	 * 对应"容器外边距"。单位 px。
	 */
	containerPadding: number
	/** 图片与图片之间的间距,单位 px */
	gap: number
	/** 图片圆角,单位 px */
	borderRadius: number
	/** 是否开启阴影效果 */
	shadow: boolean
	/** 阴影预设 - 小、中、大三档,实际渲染时根据该值计算模糊/偏移/颜色 */
	shadowPreset: ShadowPreset
	/** 横向/纵向画廊的滑动区域高度,仅对 hscroll/vscroll 生效 */
	scrollHeight: number
	/**
	 * 横向画廊单图占比(视口百分比),仅对 hscroll 生效。
	 * 1 表示每张图占满视口宽度,<1 时形成横向滚动。<1 时相邻两张图会自然露出 1-ratio 的部分。
	 */
	itemRatio: number
	/** 预览卡片的内边距,导出时连同外层卡片一起复制到公众号 */
	cardPadding: number
	/** 预览卡片的圆角,导出时连同外层卡片一起复制到公众号 */
	cardRadius: number
	/** 预览卡片的边框颜色,导出时连同外层卡片一起复制到公众号 */
	cardBorderColor: string
	/** 预览卡片的背景颜色,导出时连同外层卡片一起复制到公众号 */
	cardBackground: string
	/** 图片说明文字的字体大小,单位 px */
	captionFontSize: number
	/** 图片说明文字的颜色 */
	captionColor: string
	/**
	 * 全局图片说明位置(默认 below)。
	 * - "above": 所有图片说明显示在图片上方
	 * - "below": 所有图片说明显示在图片下方
	 * - "hidden": 全局不显示图片说明
	 */
	captionPosition: CaptionPosition
}

export interface StylePreset {
	id: string
	/** i18n key,在 zh-CN.ts / en.ts 内提供 name 字符串 */
	nameKey: string
	isBuiltIn: boolean
	theme: StyleTheme
}

export interface LayoutPreset {
	id: string
	/** i18n key */
	nameKey: string
	isBuiltIn: boolean
	kind: LayoutKind
	/** 该版式建议使用的图片数量(下限 / 上限) */
	minItems: number
	maxItems: number
}

export interface Template {
	id: string
	name: string
	layoutId: string
	styleId: string
	createdAt: number
}

export interface DocumentState {
	layoutId: string
	styleId: string
	images: ImageItem[]
}

export interface ToastMessage {
	id: string
	text: string
	tone: "info" | "success" | "error"
}
