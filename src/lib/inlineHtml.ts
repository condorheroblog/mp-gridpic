/**
 * 公众号可粘贴 HTML 生成器
 *
 * 关键约束:公众号编辑器会清洗大量 CSS,以下写法在粘贴后基本保留:
 *  - section/table/tr/td 的内联属性
 *  - img 内联 width/height
 *  - p 标签的内联文字样式
 *
 * 以下写法会被清洗或渲染异常:
 *  - flex / gap(部分清洗为 normal)
 *  - aspect-ratio / object-fit
 *  - scroll-snap / overflow
 *  - position absolute
 *  - img 上的 border-radius / box-shadow(被剥离)
 *
 * 因此本文件统一使用 table 布局 + td padding 实现"间距"和"网格",
 * 把 border-radius / box-shadow 套在包裹图片的 <section> 上以保证圆角阴影的保留。
 */
import type { CaptionPosition, ImageItem, LayoutKind, StyleTheme } from "../types";

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

function toStyleText(style: Record<string, string | number | undefined>): string {
	return Object.entries(style)
		.filter(([, v]) => v !== undefined && v !== "")
		.map(([k, v]) => `${k}:${v}`)
		.join(";");
}

/** 把 StyleTheme 中的阴影计算成 box-shadow 字符串;没开启阴影则返回 undefined。 */
function shadowValue(theme: StyleTheme): string | undefined {
	if (!theme.shadow)
		return undefined;
	return `0 ${theme.shadowOffsetY}px ${theme.shadowBlur}px ${theme.shadowColor}`;
}

/**
 * 单张图片 - 公众号会清洗 img 上的圆角和阴影,
 * 因此用一个 section 包裹图片,圆角 / 阴影 / overflow 都套在该 section 上。
 */
function imageTag(image: ImageItem, theme: StyleTheme): string {
	const wrapStyle = toStyleText({
		display: "block",
		width: "100%",
		borderRadius: `${theme.borderRadius}px`,
		boxShadow: shadowValue(theme),
		overflow: "hidden",
		background: theme.cardBackground,
	});
	const imgStyle = toStyleText({
		display: "block",
		width: "100%",
		height: "auto",
		border: "0",
		margin: "0",
		padding: "0",
	});
	return `<section style="${wrapStyle}"><img src="${escapeAttr(ensureHttpsUrl(image.src))}" alt="${escapeAttr(image.alt || "")}" style="${imgStyle}"></section>`;
}

/**
 * 图片说明段落的装饰短线 - 用一个内联 section 实现,
 * 公众号对 p 标签内嵌的 span / div 样式保留度更高,放在 p 内更容易对齐。
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
	return `<section style="${style}">&nbsp;</section>`;
}

/** 图片说明段落 - 内联 p 标签,带公众号适配的字体族 + 装饰短线。 */
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
		fontStyle: "italic",
		fontFamily: "-apple-system, BlinkMacSystemFont, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Songti SC\", serif",
	});
	// 装饰短线放在文字一侧:上方说明放在文字之前,下方说明放在文字之后。
	const decorator = captionDecorator(theme.captionColor, position);
	if (position === "above") {
		return `<p style="${style}">${decorator}${escapeText(text)}</p>`;
	}
	return `<p style="${style}">${escapeText(text)}${decorator}</p>`;
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

/** 一个完整的"上说明 + 图片 + 下说明"组合,使用 table 而不是 flex。 */
function imageBlockHtml(
	image: ImageItem,
	theme: StyleTheme,
	options: {
		tdStyle?: Record<string, string | number | undefined>
		cellSpacing?: number
	},
): string {
	const { tdStyle, cellSpacing = 0 } = options;
	const positionResolved = resolveImageCaptionPosition(image, theme);
	const above = captionTag(image, theme, "above");
	const below = captionTag(image, theme, "below");
	const onlyAbove = positionResolved === "above" ? above : "";
	const onlyBelow = positionResolved === "below" ? below : "";
	const cellTd = toStyleText({
		padding: `${cellSpacing}px`,
		verticalAlign: "top",
		...tdStyle,
	});
	const img = imageTag(image, theme);
	const rows = [
		onlyAbove ? `<tr><td style="${cellTd}">${onlyAbove}</td></tr>` : "",
		`<tr><td style="${cellTd}">${img}</td></tr>`,
		onlyBelow ? `<tr><td style="${cellTd}">${onlyBelow}</td></tr>` : "",
	].filter(Boolean).join("");
	return `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;table-layout:auto;">${rows}</table>`;
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

	// 内部版式还会被一层"containerPadding"包住,模拟 Canvas 的内边距
	const containerInner = (inner: string): string => `<section style="padding:${innerPadding}px;margin:0;box-sizing:border-box;">${inner}</section>`;

	switch (kind) {
		case "single": {
			const [a] = images;
			if (!a)
				return wrap("");
			const inner = containerInner(imageBlockHtml(a, theme, {}));
			return wrap(inner);
		}

		case "double-row": {
			const [a, b] = images;
			if (!a || !b)
				return wrap("");
			// 通过 table + td padding 实现横向间距。
			const tdStyle: Record<string, string | number> = {
				verticalAlign: "top",
				width: "50%",
			};
			const cellA = `<td style="${toStyleText({ ...tdStyle, paddingRight: `${gap / 2}px` })}">${imageBlockHtml(a, theme, {})}</td>`;
			const cellB = `<td style="${toStyleText({ ...tdStyle, paddingLeft: `${gap / 2}px` })}">${imageBlockHtml(b, theme, {})}</td>`;
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;table-layout:fixed;"><tr>${cellA}${cellB}</tr></table>`;
			return wrap(containerInner(table));
		}

		case "double-col": {
			const [a, b] = images;
			if (!a || !b)
				return wrap("");
			// 纵向间距使用 tr 行高 + 空内容实现。
			const cellA = imageBlockHtml(a, theme, {});
			const spacer = `<tr><td style="height:${gap}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
			const cellB = imageBlockHtml(b, theme, {});
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">${cellA}${spacer}${cellB}</table>`;
			return wrap(containerInner(table));
		}

		case "triple-pyramid": {
			const [a, b, c] = images;
			if (!a || !b || !c)
				return wrap("");
			const topBlock = imageBlockHtml(a, theme, {});
			const spacer = `<tr><td style="height:${gap}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
			const tdStyle = { verticalAlign: "top", width: "50%" };
			const cellB = `<td style="${toStyleText({ ...tdStyle, paddingRight: `${gap / 2}px` })}">${imageBlockHtml(b, theme, {})}</td>`;
			const cellC = `<td style="${toStyleText({ ...tdStyle, paddingLeft: `${gap / 2}px` })}">${imageBlockHtml(c, theme, {})}</td>`;
			const bottomTable = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;table-layout:fixed;"><tr>${cellB}${cellC}</tr></table>`;
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;"><tr><td>${topBlock}</td></tr>${spacer}<tr><td>${bottomTable}</td></tr></table>`;
			return wrap(containerInner(table));
		}

		case "grid-2":
		case "grid-3":
		case "grid-4": {
			const columns = kind === "grid-2" ? 2 : kind === "grid-3" ? 3 : 4;
			const colPct = (100 / columns).toFixed(4);
			const cellTd = (image: ImageItem): string => {
				const tdStyle: Record<string, string | number> = {
					width: `${colPct}%`,
					padding: `${gap / 2}px`,
					verticalAlign: "top",
				};
				return `<td style="${toStyleText(tdStyle)}">${imageBlockHtml(image, theme, {})}</td>`;
			};
			// 公众号对 table-layout 渲染有限制,我们按 N 列一行,把多张图拆成多行;每行之间插入 spacer tr。
			const rows: string[] = [];
			for (let i = 0; i < images.length; i += columns) {
				const rowImages = images.slice(i, i + columns);
				const tds = rowImages.map(cellTd).join("");
				// 补齐空 td 以保证列宽稳定
				const blanks = Array.from({ length: columns - rowImages.length }, () =>
					`<td style="${toStyleText({ width: `${colPct}%`, padding: `${gap / 2}px` })}">&nbsp;</td>`).join("");
				rows.push(`<tr>${tds}${blanks}</tr>`);
				if (i + columns < images.length) {
					// 行间距 spacer
					rows.push(`<tr><td colspan="${columns}" style="height:0;font-size:0;line-height:0;">&nbsp;</td></tr>`);
				}
			}
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;table-layout:fixed;">${rows.join("")}</table>`;
			return wrap(containerInner(table));
		}

		case "waterfall": {
			const columns = 2;
			const buckets: ImageItem[][] = Array.from({ length: columns }, () => []);
			const totals = Array.from<number>({ length: columns }).fill(0);
			images.forEach((image) => {
				let target = 0;
				for (let i = 1; i < columns; i++) {
					if (totals[i] < totals[target])
						target = i;
				}
				buckets[target].push(image);
				totals[target] += 1 / Math.max(image.ratio, 0.1);
			});
			const tdCol = (bucket: ImageItem[]): string => {
				const tdStyle = toStyleText({ width: "50%", padding: `${gap / 2}px`, verticalAlign: "top" });
				const inner = bucket
					.map((image, idx) => {
						const block = imageBlockHtml(image, theme, {});
						const spacer = idx < bucket.length - 1
							? `<section style="height:${gap}px;font-size:0;line-height:0;">&nbsp;</section>`
							: "";
						return `${block}${spacer}`;
					})
					.join("");
				return `<td style="${tdStyle}">${inner}</td>`;
			};
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;table-layout:fixed;"><tr>${buckets.map(tdCol).join("")}</tr></table>`;
			return wrap(containerInner(table));
		}

		case "hscroll": {
			// 横向滚动:公众号对 overflow-x 的支持不稳定,
			// 使用 table-layout:fixed + 每列固定宽度,让表格自然横向溢出公众号正文容器,
			// 用户在编辑器内可以横向滚动查看。
			// 关键:td 必须使用 min-width 而非 width,以确保不被压缩;每个 cell 内联为不可换行的 block。
			const itemWidth = theme.scrollItemWidth;
			const cellTd = (image: ImageItem): string => {
				const tdStyle = toStyleText({
					width: `${itemWidth}px`,
					minWidth: `${itemWidth}px`,
					paddingRight: `${gap}px`,
					verticalAlign: "top",
					whiteSpace: "nowrap",
				});
				return `<td style="${tdStyle}">${imageBlockHtml(image, theme, {})}</td>`;
			};
			const tds = images.map(cellTd).join("");
			// 外层表格采用 table-layout:fixed;整体宽度按所有 td 宽度之和。
			// 同时用 min-width + display:block 让其在公众号正文里横向溢出。
			const totalWidth = images.length * itemWidth + Math.max(0, images.length - 1) * gap;
			const table = `<table cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:${totalWidth}px;table-layout:fixed;">${tds ? `<tr>${tds}</tr>` : ""}</table>`;
			// 外层 section 用 overflow-x:auto 作为兜底,部分公众号版本会保留 overflow。
			const scroller = `<section style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">${table}</section>`;
			return wrap(containerInner(scroller));
		}

		case "vscroll": {
			const inner = images.map((image, index) => {
				const block = imageBlockHtml(image, theme, {});
				const spacer = index < images.length - 1
					? `<section style="height:${gap}px;font-size:0;line-height:0;">&nbsp;</section>`
					: "";
				return `${block}${spacer}`;
			}).join("");
			// 公众号通常保留 overflow-y:auto;外层包滚动容器 + 固定高度。
			const scroller = `<section style="overflow-y:auto;-webkit-overflow-scrolling:touch;height:${theme.scrollHeight}px;">${inner}</section>`;
			return wrap(containerInner(scroller));
		}

		default: {
			const exhaustive: never = kind;
			void exhaustive;
			return wrap("");
		}
	}
}
