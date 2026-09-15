import { useMemo } from "react";
import { cn } from "../lib/cn";

interface HtmlFragmentProps {
	html: string
	className?: string
	/** 变换 key:变化时重新挂载以播放切换动画 */
	animationKey?: string | number
}

/**
 * 渲染 renderInlineHtml 产出的内联 HTML。
 * 预览区与复制内容共用同一份字符串,保证所见即所复制。
 */
export function HtmlFragment({ html, className, animationKey }: HtmlFragmentProps) {
	const key = useMemo(() => animationKey ?? html, [animationKey, html]);
	return (
		<div
			key={key}
			className={cn("animate-fade-in", className)}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
