/**
 * 图片说明 - 渲染在图片上方 / 下方;样式由 StyleTheme 控制。
 * 说明位置由主题 theme.captionPosition 统一决定,可在样式面板的"图片说明样式"中切换。
 * 组件的 position 参数表示"这个槽位是上方还是下方",最终是否渲染取决于主题设置。
 */
import type { CSSProperties } from "react";
import type { CaptionPosition, ImageItem, StyleTheme } from "../../types";

interface ImageCaptionProps {
	image: ImageItem
	theme: StyleTheme
	/**
	 * 该说明所处的槽位 - "above" 表示图片上方槽位,"below" 表示图片下方槽位。
	 * 实际是否渲染取决于 theme.captionPosition:
	 * - theme.captionPosition === "hidden": 该组件不渲染
	 * - theme.captionPosition === "above": 只渲染 above 槽位
	 * - theme.captionPosition === "below": 只渲染 below 槽位
	 */
	position?: CaptionPosition
	centerAlign?: boolean
}

/**
 * 判断这张图是否需要显示说明文字。
 * 说明位置完全由主题 theme.captionPosition 决定。
 */
// eslint-disable-next-line react-refresh/only-export-components
export function shouldRenderCaption(image: ImageItem, theme?: StyleTheme): boolean {
	if (!image.caption || image.caption.trim().length === 0)
		return false;
	return resolveCaptionPosition(image, theme) !== "hidden";
}

/**
 * 返回该图说明的最终渲染位置;若没有可显示的文字则返回 "hidden"。
 */
// eslint-disable-next-line react-refresh/only-export-components
export function resolveCaptionPosition(image: ImageItem, theme?: StyleTheme): CaptionPosition {
	if (!image.caption || image.caption.trim().length === 0)
		return "hidden";
	return theme?.captionPosition ?? "below";
}

export function ImageCaption({ image, theme, position, centerAlign = true }: ImageCaptionProps) {
	const slot: CaptionPosition = position ?? theme.captionPosition;
	const resolved = resolveCaptionPosition(image, theme);
	// 槽位与主题不一致时不渲染(例如槽位是 above,主题设置为 below);
	// hidden 时所有槽位都不渲染。
	if (resolved === "hidden" || resolved !== slot || !image.caption)
		return null;
	// 好看的样式:略大的字距 + 中等粗细 + 上下点缀短线,
	// 在公众号编辑器与预览区域都能呈现精致的说明文字。
	const style: CSSProperties = {
		margin: resolved === "above" ? "0 0 10px 0" : "10px 0 0 0",
		padding: "0",
		fontSize: `${theme.captionFontSize}px`,
		color: theme.captionColor,
		lineHeight: 1.6,
		textAlign: centerAlign ? "center" : "left",
		fontWeight: 500,
		letterSpacing: "0.04em",
	};
	// 装饰短线原本用 span 套块级样式再放进 <p>,违反了 p 只能包含行内元素的规则。
	// 这里把短线移到 <p> 外部,改为纯行内的 short line(下划线 + 颜色 + opacity),
	// 既保留视觉装饰,又让 <p> 内只剩纯文本。
	const decoratorStyle: CSSProperties = {
		display: "block",
		width: "24px",
		height: "1px",
		margin: resolved === "above" ? "0 auto 6px auto" : "6px auto 0 auto",
		backgroundColor: theme.captionColor,
		opacity: 0.5,
	};
	return (
		<>
			{resolved === "above" && <span style={decoratorStyle} aria-hidden="true" />}
			<p style={style} className="select-none break-words">
				{image.caption}
			</p>
			{resolved === "below" && <span style={decoratorStyle} aria-hidden="true" />}
		</>
	);
}
