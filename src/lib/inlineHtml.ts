import type { CaptionPosition, ImageItem, LayoutKind, StyleTheme } from "../types";
/**
 * 公众号可粘贴 HTML 生成器
 *
 */
import { SHADOW_PRESETS } from "../data/styles";
import { chunkItems, distributeWaterfall, getColumnSpacing } from "./layoutUtils";

const SAFE_HOSTS_PATTERN = /^https:\/\//i;

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function ensureHttpsUrl(src: string): string {
	if (!src)
		return src;
	if (SAFE_HOSTS_PATTERN.test(src))
		return src;
	if (src.startsWith("//"))
		return `https:${src}`;
	return src;
}

function toCssKey(key: string): string {
	if (key.startsWith("Webkit"))
		return `-webkit-${key.slice("Webkit".length).replace(/[A-Z]/g, match => `-${match.toLowerCase()}`).replace(/^-/, "")}`;
	return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}

function toStyleText(style: Record<string, string | number | undefined>): string {
	return Object.entries(style)
		.filter(([, value]) => value !== undefined && value !== "")
		.map(([key, value]) => `${toCssKey(key)}:${value}`)
		.join(";");
}

/**
 * 把 StyleTheme 中的阴影计算成 box-shadow 字符串;没开启阴影则返回 undefined。
 * 阴影落在图片右下角,水平与垂直偏移相等,形成 45° 方向的投射效果。
 */
function shadowValue(theme: StyleTheme): string | undefined {
	if (!theme.shadow)
		return undefined;
	const preset = SHADOW_PRESETS[theme.shadowPreset];
	return `${preset.offsetX}px ${preset.offsetY}px ${preset.blur}px ${preset.color}`;
}

/**
 * 单张图片 - 公众号会清洗 img 上的圆角和阴影,
 * 因此用一个 section 包裹图片,圆角 / 阴影 / overflow 都套在该 section 上。
 *
 * 公众号静态规范要点:
 *  - 不写 font-family(沿用默认字体栈,规范 §4)。
 *  - 不在 img 上写 opacity: 0(规范 §2.1)。
 *  - wrap 上不使用 line-height: 0:虽然内部只有 img,但仍然符合"不在文本容器上使用 line-height: 0"的原则。
 */
function imageTag(image: ImageItem, theme: StyleTheme): string {
	const wrapStyle = toStyleText({
		display: "block",
		width: "100%",
		borderRadius: `${theme.borderRadius}px`,
		boxShadow: shadowValue(theme),
		overflow: "hidden",
		background: theme.cardBackground,
		boxSizing: "border-box",
	});
	const imgStyle = toStyleText({
		display: "block",
		width: "100%",
		height: "auto",
		border: "0",
		margin: "0",
		padding: "0",
		verticalAlign: "middle",
		boxSizing: "border-box",
	});
	return `<section style="${wrapStyle}"><img src="${escapeAttr(ensureHttpsUrl(image.src))}" alt="${escapeAttr(image.alt || "")}" style="${imgStyle}"></section>`;
}

/**
 * 图片说明段落的装饰短线 - 用一个行内 span 实现,
 * 公众号对 p 标签内嵌的块级元素保留度不稳定,且按 HTML 规范 p 只能包含行内元素。
 * 因此把装饰短线放在 <p> 外部,既不破坏语义,又能保留视觉装饰。
 */
function captionDecorator(color: string, position: CaptionPosition): string {
	const margin = position === "above" ? "0 auto 6px auto" : "6px auto 0 auto";
	const style = toStyleText({
		display: "block",
		width: "24px",
		height: "1px",
		margin,
		background: color,
		opacity: "0.5",
		fontSize: "0",
		lineHeight: "0",
	});
	return `<span style="${style}">&nbsp;</span>`;
}

/** 图片说明段落 - 内联 p 标签 + 装饰短线,装饰线放在 p 外部,保证 p 内部只有文本节点。 */
function captionTag(image: ImageItem, theme: StyleTheme, position: CaptionPosition): string {
	if (position === "hidden")
		return "";
	const text = (image.caption ?? "").trim();
	if (!text)
		return "";
	const margin = position === "above" ? "0 0 10px 0" : "10px 0 0 0";
	const style = toStyleText({
		margin,
		padding: "0",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		lineHeight: 1.6,
		textAlign: "center",
		fontWeight: 500,
		letterSpacing: "0.04em",
	});
	// 装饰短线放在 <p> 外部:上方说明放在 p 之前,下方说明放在 p 之后。
	const decorator = captionDecorator(theme.captionColor, position);
	if (position === "above")
		return `${decorator}<p style="${style}">${escapeText(text)}</p>`;
	return `<p style="${style}">${escapeText(text)}</p>${decorator}`;
}

/**
 * 解析某张图的最终说明位置。
 * 说明位置由主题 theme.captionPosition 统一控制。
 */
function resolveImageCaptionPosition(image: ImageItem, theme: StyleTheme): CaptionPosition | null {
	if (!image.caption || image.caption.trim().length === 0)
		return null;
	if (theme.captionPosition === "hidden")
		return "hidden";
	return theme.captionPosition;
}

/** 一个完整的"上说明 + 图片 + 下说明"组合,统一使用 section 结构。 */
function imageBlockHtml(image: ImageItem, theme: StyleTheme): string {
	const positionResolved = resolveImageCaptionPosition(image, theme);
	const above = captionTag(image, theme, "above");
	const below = captionTag(image, theme, "below");
	const onlyAbove = positionResolved === "above" ? above : "";
	const onlyBelow = positionResolved === "below" ? below : "";
	const img = imageTag(image, theme);
	return `<section style="${toStyleText({ display: "block", width: "100%", boxSizing: "border-box" })}">${onlyAbove}${img}${onlyBelow}</section>`;
}

/**
 * 外层卡片容器 - 边框/圆角/背景/内边距,保证粘贴到公众号后卡片样式保留。
 * 公众号对 <section> 的 border / border-radius / background / padding 都能保留。
 */
function cardWrapper(innerHtml: string, theme: StyleTheme): string {
	const style = toStyleText({
		margin: "0",
		padding: `${theme.cardPadding}px`,
		border: `1px solid ${theme.cardBorderColor}`,
		borderRadius: `${theme.cardRadius}px`,
		background: theme.cardBackground,
		boxSizing: "border-box",
	});
	return `<section style="${style}">${innerHtml}</section>`;
}

/**
 * 把多个块按竖向顺序串起来,通过 margin-top 控制间距。
 */
function stackHtml(blocks: string[], gap: number): string {
	return blocks
		.filter(Boolean)
		.map((block, index) => `<section style="${toStyleText({ marginTop: index === 0 ? 0 : `${gap}px`, boxSizing: "border-box" })}">${block}</section>`)
		.join("");
}

/**
 * 横向滑动画廊 - 严格遵循公众号静态规范。
 *
 * 关键结构:
 *   ┌─ 卡片外壳(border + radius + overflow:hidden + 上下 padding) ─┐
 *   │ ┌─ 视口(overflow-x:auto, padding:0 10px) ──┐ │
 *   │ │ ┌─ 内容容器(width = N × itemRatio) ─┐ │ │
 *   │ │ │ N 个各占 1/N 的图片(折算到视口 = itemRatio)│ │ │
 *   │ │ └─────────────────────────────────────┘ │ │
 *   │ └─────────────────────────────────────┘ │
 *   │              左右滑动查看                   │
 *   └─────────────────────────────────────────┘
 *
 * 内容容器宽度公式:images.length × theme.itemRatio,
 * 单张图固定占视口的 itemRatio,横向滚动根据图片个数自动生效,
 * 不再使用硬编码 300% / rotate hack。itemRatio 默认 1(= 不滚动,刚好一图一屏)。
 *
 * 间距规范(说明 / 图片 / 提示文案 三者间距 = 10px,与 vscroll 保持一致):
 *  - 整体上下边距 = 10px(由卡片外壳 padding 控制)
 *  - 滚动视口左右 padding = 10px
 *  - 说明 ↔ 图片 = 10px
 *  - 图片 ↔ 提示文案 = 10px
 *
 * 公众号静态规范要点:
 *  - 不写 font-family。
 *  - 容器宽度一律百分比,禁止固定 px 宽度(规范 §2.4)。
 *  - 文本容器不写 line-height: 0(规范 §2.3)。
 *  - 不在 img 上写 opacity: 0(规范 §2.1)。
 *  - 不写 text-align: start/end(规范 §2.6)。
 */
function hScrollGalleryHtml(images: ImageItem[], theme: StyleTheme): string {
	if (images.length === 0)
		return "";

	// 卡片外壳:边框 + 圆角 + overflow:hidden + 上下左右 padding 由 theme.cardPadding 控制,
	// 与 LayoutRenderer 在预览区提供的卡片外壳结构保持一致,保证预览/复制视觉同步。
	const cardStyle = toStyleText({
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
		padding: `${theme.cardPadding}px`,
		boxSizing: "border-box",
	});
	// 滚动视口:overflow-x:auto + 左右 padding 10px。
	// 同时显式声明 max-width:100% 兜底,避免被公众号编辑器自带样式里的 max-width 限制,
	// 配合 !important 提高优先级,确保预览/复制后横向滚动行为一致。
	const viewportStyle = toStyleText({
		display: "inline-block",
		width: "100%",
		maxWidth: "100% !important",
		verticalAlign: "top",
		overflowX: "auto",
		overflowY: "hidden",
		margin: "0",
		padding: "0 10px",
		boxSizing: "border-box",
	});
	// 内容容器:宽度 = 图片张数 × 单图占比(视口百分比),根据图片个数自动分配。
	// 显式声明 max-width:none !important 抵消公众号编辑器对祖先元素施加的 max-width 限制,
	// 保证内容容器能按 N × itemRatio 正常撑开,触发横向滚动。
	const itemRatio = theme.itemRatio;
	const scrollerStyle = toStyleText({
		overflow: "hidden",
		width: `${(images.length * itemRatio * 100).toFixed(4)}%`,
		maxWidth: "none !important",
		boxSizing: "border-box",
	});
	// 单张图占内容容器的 1/N,折算到视口就是 itemRatio:
	//   实际宽度 = (1/N) × (N × itemRatio) = itemRatio,与图片个数无关。
	// 横向间距 = theme.gap:把总间距平分到每张图两侧的 padding,
	// 让用户配置的"图片间距"在横向排列场景下也能生效。
	const halfGap = theme.gap / 2;
	const itemWidthPercent = (1 / images.length) * 100;
	const itemStyle = toStyleText({
		display: "inline-block",
		verticalAlign: "top",
		width: `${itemWidthPercent.toFixed(4)}%`,
		paddingLeft: `${halfGap}px`,
		paddingRight: `${halfGap}px`,
		boxSizing: "border-box",
	});
	// 左右滑动查看 提示文案样式:line-height 不为 0,符合规范 §2.3。
	// margin-top = 10px,下边距由卡片外壳 padding 接管,与说明 / 图片 节奏一致。
	const hintStyle = toStyleText({
		textAlign: "center",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		margin: "10px 0 0 0",
		lineHeight: 1.6,
		boxSizing: "border-box",
	});

	const items = images.map(image => `<section style="${itemStyle}">${imageBlockHtml(image, theme)}</section>`).join("");
	const hint = `<p style="${hintStyle}">左右滑动查看</p>`;
	return `<section style="${cardStyle}"><section style="${viewportStyle}"><section style="${scrollerStyle}">${items}</section></section>${hint}</section>`;
}

/**
 * 垂直滚动画廊 - 固定区域 + overflow-y:auto,提示文案放在滚动容器外部。
 * 结构与 HScrollLayout 一致:滚动容器与提示平级,提示不会覆盖在图片上。
 * 间距节奏与 hScrollGalleryHtml 完全一致。
 */
function vScrollGalleryHtml(images: ImageItem[], theme: StyleTheme): string {
	if (images.length === 0)
		return "";
	// 卡片外壳:边框 + 圆角 + overflow:hidden + 上下左右 10px padding,
	// 与 VScrollLayout 的卡片外壳结构完全一致(预览/复制视觉同步),
	// padding:10px 配合下方滚动容器的 padding:0 10px,保证左右总间距 20px,
	// 与 hScrollGalleryHtml 节奏一致。
	const cardStyle = toStyleText({
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
		padding: "10px",
		boxSizing: "border-box",
	});
	// 滚动容器:固定高度 + overflow-y:auto + 左右 padding 10px。
	const scrollerStyle = toStyleText({
		overflowX: "hidden",
		overflowY: "auto",
		WebkitOverflowScrolling: "touch",
		height: `${theme.scrollHeight}px`,
		padding: "0 10px",
		boxSizing: "border-box",
	});
	// 上下滑动查看 提示文案样式:line-height 不为 0,符合规范 §2.3。
	// margin-top = 10px,下边距由卡片外壳的 padding-bottom 接管。
	const hintStyle = toStyleText({
		textAlign: "center",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		margin: "10px 0 0 0",
		lineHeight: 1.6,
		boxSizing: "border-box",
	});
	const items = images.map((image, index) => {
		const style = toStyleText({
			width: "100%",
			boxSizing: "border-box",
			marginTop: index === 0 ? 0 : `${theme.gap}px`,
		});
		return `<section style="${style}">${imageBlockHtml(image, theme)}</section>`;
	}).join("");
	const scroller = `<section style="${scrollerStyle}">${items}</section>`;
	const hint = `<p style="${hintStyle}">上下滑动查看</p>`;
	// 滚动容器与提示平级,与 HScrollLayout 结构保持一致;最外层使用与 hscroll 同样的卡片外壳。
	return `<section style="${cardStyle}">${scroller}${hint}</section>`;
}

/**
 * 构造一行 inline-block 单元格,用百分比宽度模拟公众号内的多列布局。
 */
function inlineColumnsHtml(cells: string[], columns: number, gap: number): string {
	const width = `${(100 / columns).toFixed(4)}%`;
	const html = cells.map((cell, index) => {
		const spacing = getColumnSpacing(index, columns, gap);
		const style = toStyleText({
			display: "inline-block",
			verticalAlign: "top",
			width,
			paddingLeft: `${spacing.left}px`,
			paddingRight: `${spacing.right}px`,
			boxSizing: "border-box",
		});
		return `<section style="${style}">${cell}</section>`;
	}).join("");
	return `<section style="${toStyleText({ boxSizing: "border-box" })}">${html}</section>`;
}

interface RenderOptions {
	images: ImageItem[]
	kind: LayoutKind
	theme: StyleTheme
}

export function renderInlineHtml(options: RenderOptions): string {
	const { images, kind, theme } = options;
	const gap = theme.gap;
	const innerPadding = theme.containerPadding;

	const wrap = (inner: string): string => cardWrapper(inner, theme);

	// 内部版式还会被一层"containerPadding"包住,模拟 Canvas 的内边距。
	const containerInner = (inner: string): string => `<section style="padding:${innerPadding}px;margin:0;box-sizing:border-box;">${inner}</section>`;

	switch (kind) {
		case "single": {
			const [first] = images;
			if (!first)
				return wrap("");
			const inner = containerInner(imageBlockHtml(first, theme));
			return wrap(inner);
		}

		case "double-row": {
			const [a, b] = images;
			if (!a || !b)
				return wrap("");
			const row = inlineColumnsHtml([
				imageBlockHtml(a, theme),
				imageBlockHtml(b, theme),
			], 2, gap);
			return wrap(containerInner(row));
		}

		case "double-col": {
			const [a, b] = images;
			if (!a || !b)
				return wrap("");
			const stack = stackHtml([
				imageBlockHtml(a, theme),
				imageBlockHtml(b, theme),
			], gap);
			return wrap(containerInner(stack));
		}

		case "triple-pyramid": {
			const [a, b, c] = images;
			if (!a || !b || !c)
				return wrap("");
			const bottomRow = inlineColumnsHtml([
				imageBlockHtml(b, theme),
				imageBlockHtml(c, theme),
			], 2, gap);
			const stack = stackHtml([
				imageBlockHtml(a, theme),
				bottomRow,
			], gap);
			return wrap(containerInner(stack));
		}

		case "grid-2":
		case "grid-3":
		case "grid-4": {
			const columns = kind === "grid-2" ? 2 : kind === "grid-3" ? 3 : 4;
			const rows = chunkItems(images, columns).map((row) => {
				const cells = Array.from({ length: columns }, (_, index) => row[index] ? imageBlockHtml(row[index], theme) : "");
				return inlineColumnsHtml(cells, columns, gap);
			});
			return wrap(containerInner(stackHtml(rows, gap)));
		}

		case "waterfall": {
			const columns = 2;
			const buckets = distributeWaterfall(images, columns);
			const cols = buckets.map(bucket => stackHtml(bucket.map(image => imageBlockHtml(image, theme)), gap));
			return wrap(containerInner(inlineColumnsHtml(cols, columns, gap)));
		}

		case "hscroll": {
			// 横向滚动:遵循公众号静态规范,
			// 使用 卡片外壳 + 滚动视口 + 自动宽度内容容器 三层结构,
			// 并附 "左右滑动查看" 提示。
			// 注意:hScrollGalleryHtml 内部已经包含卡片外壳(边框+圆角+overflow:hidden),
			// 因此不再额外 wrap,只套一层 containerPadding 模拟画布内边距。
			return containerInner(hScrollGalleryHtml(images, theme));
		}

		case "vscroll": {
			// 垂直滚动:固定高度 + overflow-y:auto,底部带"上下滑动查看"提示。
			// 注意:vScrollGalleryHtml 内部已经包含滚动容器,不再额外 wrap,只套一层 containerPadding 模拟画布内边距。
			return containerInner(vScrollGalleryHtml(images, theme));
		}

		default: {
			const exhaustive: never = kind;
			void exhaustive;
			return wrap("");
		}
	}
}
