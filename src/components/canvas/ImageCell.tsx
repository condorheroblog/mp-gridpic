import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { ImageItem, StyleTheme } from "../../types";

/**
 * 图片渲染原子 - 渲染单张图片,统一应用样式(圆角 / 阴影 / 间距)
 */
import clsx from "clsx";
import { SHADOW_PRESETS } from "../../data/styles";

interface ImageCellProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
	image: ImageItem
	theme: StyleTheme
	fit?: "cover" | "contain"
	className?: string
}

export function ImageCell({ image, theme, fit = "cover", className, style, ...rest }: ImageCellProps) {
	// 根据 shadowPreset 查表得到具体阴影参数;关闭阴影时取 none。
	// 同时使用水平(offsetX)与垂直(offsetY)偏移,让阴影落在图片右下角。
	const preset = theme.shadow ? SHADOW_PRESETS[theme.shadowPreset] : null;
	const composed: CSSProperties = {
		borderRadius: `${theme.borderRadius}px`,
		boxShadow: preset
			? `${preset.offsetX}px ${preset.offsetY}px ${preset.blur}px ${preset.color}`
			: "none",
		objectFit: fit,
		...style,
	};
	return (
		<img
			{...rest}
			src={image.src}
			alt={image.alt}
			loading="lazy"
			decoding="async"
			className={clsx("block max-w-full select-none", className)}
			style={composed}
		/>
	);
}
