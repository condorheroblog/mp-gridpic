import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { ImageItem, StyleTheme } from "../../types";

/**
 * 图片渲染原子 - 渲染单张图片,统一应用样式(圆角 / 阴影 / 间距)
 */
import clsx from "clsx";

interface ImageCellProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
	image: ImageItem
	theme: StyleTheme
	fit?: "cover" | "contain"
	className?: string
}

export function ImageCell({ image, theme, fit = "cover", className, style, ...rest }: ImageCellProps) {
	const composed: CSSProperties = {
		borderRadius: `${theme.borderRadius}px`,
		boxShadow: theme.shadow
			? `0 ${theme.shadowOffsetY}px ${theme.shadowBlur}px ${theme.shadowColor}`
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
