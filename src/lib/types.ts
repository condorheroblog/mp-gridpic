/**
 * 公众号图片排版工具的领域模型
 */

/** 支持的版式 */
export type LayoutId
	= | "single" // 单图
	| "duo-row" // 双图横排
	| "duo-col" // 双图竖排
	| "tri-top" // 三图·上一下二
	| "tri-bottom" // 三图·下二上一
	| "tri-left" // 三图·左一右二
	| "tri-right" // 三图·左二右一
	| "grid-2" // 两宫格(2×2,固定 4 张)
	| "grid-3" // 三宫格(3×3,固定 9 张)
	| "grid-4" // 四宫格(4×4,固定 16 张)
	| "swipe-h" // 左右滑动
	| "swipe-v"; // 上下滑动

/** 单张图片 */
export interface PicItem {
	/** 前端唯一标识(nanoid) */
	id: string
	/** picsum 占位图种子;为 null 表示用户自定义链接 */
	seed: string | null
	/** 图片地址 */
	src: string
	/** 图片说明 */
	caption: string
}

/** 说明文字位置 */
export type CaptionPosition = "above" | "below" | "overlay-top" | "overlay-bottom";

/** 图片说明配置 */
export interface CaptionConfig {
	/** 是否显示说明 */
	visible: boolean
	position: CaptionPosition
	/** 字号 px */
	fontSize: number
	/** 文字颜色 */
	color: string
}

/** 滚动容器样式配置(仅左右/上下滑动版式生效) */
export interface ScrollerConfig {
	/** 边框宽度 px,0 表示无边框 */
	borderWidth: number
	/** 边框颜色 */
	borderColor: string
	/** 容器圆角 px */
	radius: number
	/** 纵向滚动容器高度 px(仅 swipe-v) */
	height: number
	/** 内部元素与容器边框的距离 px */
	padding: number
	/** 仅 swipe-h:单张图片撑满容器宽度并居中,第二张需滑动查看 */
	fullBleed: boolean
}

/** 编辑器完整配置(持久化到 localStorage) */
export interface EditorConfig {
	layout: LayoutId
	images: PicItem[]
	/** 图片间距 px */
	gap: number
	/** 图片圆角 px */
	radius: number
	/** 图片尺寸百分比(50-100) */
	size: number
	scroller: ScrollerConfig
	caption: CaptionConfig
}

/** 版式分组(用于切换器 UI) */
export type LayoutGroup = "basic" | "tri" | "grid" | "scroll";

/** 版式元信息 */
export interface LayoutMeta {
	id: LayoutId
	group: LayoutGroup
	/** 该版式展示的图片数量限制:undefined 表示展示全部 */
	maxImages?: number
	/** 固定图片张数:切换到该版式时自动补齐/裁剪,不允许手动增删 */
	exactImages?: number
}
