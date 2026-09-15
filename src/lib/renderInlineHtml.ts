/**
 * 公众号编辑器内联 HTML 渲染器
 *
 * 严格遵循《微信公众平台编辑器插件开发规范》:
 * https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html
 *
 * 合规要点:
 *  1. 全部使用内联样式,不依赖外部 CSS / class;
 *  2. 宽度一律使用百分比 / calc,杜绝固定 px 宽度导致的多屏溢出(1.4);
 *     横向滑动容器按规范 1.4.4 加 data-ignore-width 豁免;
 *  3. 每张 <img> 都带 data-w(原始像素宽度),加载超时也能正确兜底(1.4.3);
 *  4. 纵向滚动容器带 overflow-y:auto,属于规范 1.5.2 的豁免场景;
 *  5. 图片说明 line-height:1.6,大于字号,杜绝叠字(1.3);
 *  6. text-align 只使用 left/center/right(1.6),不使用 start/end;
 *  7. 不设置 font-family,沿用公众号默认字体栈(第 3 节);
 *  8. 不使用 opacity:0 + SVG 背景图(1.1)、不使用 !important(4.5.2)、不使用 <pre>(1.8);
 *  9. 嵌套层级最大 5 层,远低于 10 层限制(2.1);
 *  10. 浮层说明使用高对比白字 + 半透明黑底,Dark Mode 下仍清晰(第 4 节)。
 */
import type { CaptionConfig, EditorConfig, PicItem, ScrollerConfig } from "./types";
import { LAYOUT_MAP, SWIPE_H_ITEM_PERCENT } from "./constants";
import { getLayoutDimensions } from "./picsum";

/** HTML 文本转义(说明文字用) */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * 按版式选取需要展示的图片:
 * 单图取 1 张、双图取 2 张;宫格/三图按固定张数截取(状态层已保证数量一致,
 * 这里再兜一层底);滑动版式展示全部。
 */
export function selectLayoutImages(config: EditorConfig): PicItem[] {
	const meta = LAYOUT_MAP[config.layout];
	const limit = meta?.maxImages ?? meta?.exactImages;
	return limit ? config.images.slice(0, limit) : config.images;
}

function imgHtml(item: PicItem, index: number, dataW: number, radius: number): string {
	const alt = item.caption.trim() || `图片 ${index + 1}`;
	return (
		"<img "
		+ `src="${escapeHtml(item.src)}" `
		+ `alt="${escapeHtml(alt)}" `
		+ `data-w="${dataW}" `
		+ "style=\"display:block;width:100%;height:auto;margin:0;padding:0;border:0;"
		+ `border-radius:${radius}px;vertical-align:top;background-color:#f3f4f6;box-sizing:border-box;" />`
	);
}

function captionHtml(caption: CaptionConfig, text: string, radius: number): string {
	if (!caption.visible) {
		return "";
	}
	const trimmed = text.trim();
	if (!trimmed) {
		return "";
	}
	const base = `margin:0;padding:0;font-size:${caption.fontSize}px;line-height:1.6;word-break:break-word;`;
	if (caption.position === "below") {
		return (
			`<section style="${base}margin-top:6px;color:${caption.color};text-align:center;">`
			+ `${escapeHtml(trimmed)}</section>`
		);
	}
	if (caption.position === "above") {
		return (
			`<section style="${base}margin-bottom:6px;color:${caption.color};text-align:center;">`
			+ `${escapeHtml(trimmed)}</section>`
		);
	}
	const isTop = caption.position === "overlay-top";
	const corner = isTop
		? `border-radius:${radius}px ${radius}px 0 0;top:0;`
		: `border-radius:0 0 ${radius}px ${radius}px;bottom:0;`;
	return (
		`<section style="position:absolute;left:0;right:0;${corner}${base}`
		+ "padding:6px 10px;color:#ffffff;background-color:rgba(0,0,0,0.45);text-align:left;\">"
		+ `${escapeHtml(trimmed)}</section>`
	);
}

/** 单个"图片 + 说明"单元;cellStyle 决定单元在容器中的尺寸行为 */
function figureHtml(
	item: PicItem,
	index: number,
	config: EditorConfig,
	cellStyle: string,
): string {
	const { radius, caption } = config;
	const dataW = getLayoutDimensions(config.layout, index).width;
	const img = imgHtml(item, index, dataW, radius);
	const cap = captionHtml(caption, item.caption, radius);
	const showCap = caption.visible && item.caption.trim() !== "";

	if (showCap && (caption.position === "overlay-top" || caption.position === "overlay-bottom")) {
		// 浮层说明:相对定位包裹,结构顺序与视觉顺序一致(规范 4.2.2)
		return (
			`<section style="position:relative;${cellStyle}">`
			+ `${img}${cap}</section>`
		);
	}
	if (showCap && caption.position === "above") {
		// 图片上方:说明节点渲染在 <img> 之前
		return `<section style="${cellStyle}">${cap}${img}</section>`;
	}
	return `<section style="${cellStyle}">${img}${cap}</section>`;
}

function boxStyle(extra: string): string {
	return `margin:0;padding:0;box-sizing:border-box;${extra}`;
}

function borderCss(scroller: ScrollerConfig): string {
	return scroller.borderWidth > 0
		? `${scroller.borderWidth}px solid ${scroller.borderColor}`
		: "0";
}

function renderSingle(config: EditorConfig, images: PicItem[]): string {
	return figureHtml(images[0], 0, config, boxStyle(`width:${config.size}%;margin:0 auto;`));
}

function renderDuoRow(config: EditorConfig, images: PicItem[]): string {
	const cells = images
		.map((item, i) => figureHtml(item, i, config, "flex:1 1 0%;min-width:0;"))
		.join("");
	return `<section style="${boxStyle(`display:flex;flex-direction:row;align-items:flex-start;gap:${config.gap}px;width:100%;`)}">${cells}</section>`;
}

function renderDuoCol(config: EditorConfig, images: PicItem[]): string {
	const cells = images
		.map((item, i) => figureHtml(item, i, config, boxStyle(`width:${config.size}%;`)))
		.join("");
	return `<section style="${boxStyle(`display:flex;flex-direction:column;align-items:center;gap:${config.gap}px;width:100%;`)}">${cells}</section>`;
}

function renderGrid(config: EditorConfig, images: PicItem[], columns: number): string {
	const cellWidth = `calc((100% - ${config.gap * (columns - 1)}px) / ${columns})`;
	const cells = images
		.map((item, i) => figureHtml(item, i, config, boxStyle(`width:${cellWidth};`)))
		.join("");
	return `<section style="${boxStyle(`display:flex;flex-wrap:wrap;gap:${config.gap}px;width:100%;`)}">${cells}</section>`;
}

/** 三图版式的四种排列;通栏位是 2:1 横图或 1:2 竖图,其余两张为方图 */
type TriVariant = "top" | "bottom" | "left" | "right";

function renderTri(config: EditorConfig, images: PicItem[], variant: TriVariant): string {
	const { gap } = config;
	// 通栏位与"两张方图列"各占容器一半,保证两侧等宽
	const halfStyle = boxStyle(`width:calc((100% - ${gap}px) / 2);`);
	const fullStyle = boxStyle("width:100%;");
	// 通栏位槽位:top/left 在 0,bottom/right 在 2;两个小图槽位为剩余的两个
	const fullIndex = variant === "top" || variant === "left" ? 0 : 2;
	const smallIndices = fullIndex === 0 ? [1, 2] : [0, 1];
	const fullFigure = figureHtml(images[fullIndex], fullIndex, config, fullStyle);

	if (variant === "top" || variant === "bottom") {
		// 两张方图横向并排,flex 等分
		const pairRow = (
			`<section style="${boxStyle(`display:flex;flex-direction:row;align-items:flex-start;gap:${gap}px;width:100%;`)}">${
				smallIndices
					.map(i => figureHtml(images[i], i, config, "flex:1 1 0%;min-width:0;"))
					.join("")
			}</section>`
		);
		const blocks = variant === "top" ? [fullFigure, pairRow] : [pairRow, fullFigure];
		return (
			`<section style="${boxStyle(`display:flex;flex-direction:column;align-items:stretch;gap:${gap}px;width:100%;`)}">${
				blocks.join("")
			}</section>`
		);
	}

	// 两张方图上下堆叠,整列固定占一半宽度
	const pairCol = (
		`<section style="${boxStyle(`display:flex;flex-direction:column;align-items:stretch;gap:${gap}px;width:calc((100% - ${gap}px) / 2);`)}">${
			smallIndices
				.map(i => figureHtml(images[i], i, config, fullStyle))
				.join("")
		}</section>`
	);
	const tallFigure = figureHtml(images[fullIndex], fullIndex, config, halfStyle);
	const blocks = variant === "left" ? [tallFigure, pairCol] : [pairCol, tallFigure];
	return (
		`<section style="${boxStyle(`display:flex;flex-direction:row;align-items:flex-start;gap:${gap}px;width:100%;`)}">${
			blocks.join("")
		}</section>`
	);
}

/** 底部提示占用的容器高度(提示固定在滚动区之外,不随图片滑动) */
const SWIPE_HINT_HEIGHT = 30;

/**
 * 滑动容器底部的固定中文提示。
 * 文案强制中文且包含在复制 HTML 中(粘贴进公众号后依然展示)。
 */
function swipeHintHtml(text: string): string {
	return (
		"<section style=\"position:absolute;left:0;right:0;bottom:0;margin:0;padding:5px 0 4px;"
		+ "font-size:13px;line-height:1.6;color:#8a8a8a;text-align:center;background-color:#ffffff;"
		+ `box-sizing:border-box;">${text}</section>`
	);
}

/**
 * 滑动版式统一外框:边框/圆角画在外框上,滚动区与提示是其中两个兄弟节点,
 * 提示绝对定位钉在外框底部,不会跟随图片滚动。
 */
function swipeFrameHtml(scroller: ScrollerConfig, scroll: string, hint: string): string {
	return (
		`<section style="${boxStyle(`position:relative;width:100%;overflow:hidden;border:${borderCss(scroller)};border-radius:${scroller.radius}px;padding-bottom:${SWIPE_HINT_HEIGHT}px;background-color:#ffffff;`)}">${
			scroll
		}${hint
		}</section>`
	);
}

function renderSwipeH(config: EditorConfig, images: PicItem[]): string {
	const { gap, scroller } = config;
	// fullBleed(默认):单张撑满容器可视宽度并居中吸附,第二张在容器外需滑动查看;
	// 关闭后保留 62% 卡片宽度,露出下一张作为滑动提示
	const cellFlex = scroller.fullBleed
		? "flex:0 0 100%;scroll-snap-align:center;"
		: `flex:0 0 ${SWIPE_H_ITEM_PERCENT}%;scroll-snap-align:start;`;
	const cells = images
		.map((item, i) => figureHtml(item, i, config, cellFlex))
		.join("");
	// data-ignore-width:横向滚动内容有意超出视口,按规范 1.4.4 豁免 width 检测
	const scroll = (
		`<section data-ignore-width style="${boxStyle("width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;touch-action:pan-x;background-color:transparent;")}">`
		+ `<section style="${boxStyle(`display:flex;flex-direction:row;align-items:flex-start;gap:${gap}px;padding:${scroller.padding}px;width:auto;`)}">${cells}</section>`
		+ "</section>"
	);
	return swipeFrameHtml(scroller, scroll, swipeHintHtml("左右滑动查看"));
}

function renderSwipeV(config: EditorConfig, images: PicItem[]): string {
	const { gap, scroller } = config;
	const cells = images
		.map((item, i) =>
			figureHtml(item, i, config, boxStyle("width:100%;scroll-snap-align:start;")),
		)
		.join("");
	// 固定高度 + overflow-y:auto 属于规范 1.5.2 的滚动豁免场景
	const scroll = (
		`<section style="${boxStyle(`width:100%;height:${scroller.height}px;overflow-y:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:y mandatory;touch-action:pan-y;background-color:transparent;`)}">`
		+ `<section style="${boxStyle(`display:flex;flex-direction:column;align-items:stretch;gap:${gap}px;padding:${scroller.padding}px;`)}">${cells}</section>`
		+ "</section>"
	);
	return swipeFrameHtml(scroller, scroll, swipeHintHtml("上下滑动查看"));
}

/** 渲染可直接粘贴进公众号编辑器的 HTML 片段 */
export function renderInlineHtml(config: EditorConfig): string {
	const images = selectLayoutImages(config).filter(item => item.src.trim() !== "");
	if (images.length === 0) {
		return "";
	}

	let body = "";
	switch (config.layout) {
		case "single":
			body = renderSingle(config, images);
			break;
		case "duo-row":
			body = renderDuoRow(config, images);
			break;
		case "duo-col":
			body = renderDuoCol(config, images);
			break;
		case "tri-top":
			body = renderTri(config, images, "top");
			break;
		case "tri-bottom":
			body = renderTri(config, images, "bottom");
			break;
		case "tri-left":
			body = renderTri(config, images, "left");
			break;
		case "tri-right":
			body = renderTri(config, images, "right");
			break;
		case "grid-2":
			body = renderGrid(config, images, 2);
			break;
		case "grid-3":
			body = renderGrid(config, images, 3);
			break;
		case "grid-4":
			body = renderGrid(config, images, 4);
			break;
		case "swipe-h":
			// 滑动外框自带 width:100% 与盒模型重置,无需再包一层(控制嵌套深度)
			return renderSwipeH(config, images);
		case "swipe-v":
			return renderSwipeV(config, images);
	}

	return `<section style="${boxStyle("width:100%;")}">${body}</section>`;
}

/** 渲染纯文本版本(剪贴板 text/plain 通道,兜底使用) */
export function renderPlainText(config: EditorConfig): string {
	return selectLayoutImages(config)
		.map(item => item.caption.trim())
		.filter(Boolean)
		.join("\n");
}
