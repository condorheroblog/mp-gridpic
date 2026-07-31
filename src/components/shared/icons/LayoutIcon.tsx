/**
 * 版式图标 - 用纯 HTML/CSS 模拟每个版式的排布结构,
 * 而不是依赖 Unicode 字符(展示效果不可控)。
 *
 * 设计原则:
 * - 使用 currentColor 继承父级文字颜色,深浅模式自动适配
 * - 在 16px ~ 20px 的小尺寸下仍能看清结构
 * - 每个图标都对应真实版式,而不是抽象装饰
 */
import type { LayoutKind } from "../../../types";

interface IconProps {
	className?: string
}

// 所有图标公共样式 - 24x24 的方形 viewBox,使用 stroke 渲染矩形
const ROOT_CLASS = "inline-block align-middle";

export function LayoutIcon({ kind, className }: { kind: LayoutKind } & IconProps) {
	const cls = className ?? "h-5 w-5";
	switch (kind) {
		case "single": return <SingleIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "double-row": return <DoubleRowIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "double-col": return <DoubleColIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "triple-pyramid": return <TriplePyramidIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "grid-2": return <Grid2Icon className={`${ROOT_CLASS} ${cls}`} />;
		case "grid-3": return <Grid3Icon className={`${ROOT_CLASS} ${cls}`} />;
		case "grid-4": return <Grid4Icon className={`${ROOT_CLASS} ${cls}`} />;
		case "waterfall": return <WaterfallIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "hscroll": return <HScrollIcon className={`${ROOT_CLASS} ${cls}`} />;
		case "vscroll": return <VScrollIcon className={`${ROOT_CLASS} ${cls}`} />;
		default: return null;
	}
}

// 单图:一个占满的矩形
function SingleIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 双图横排:左右两个矩形
function DoubleRowIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="6" width="8" height="12" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="13" y="6" width="8" height="12" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 双图纵排:上下两个矩形
function DoubleColIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="5" y="3" width="14" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="5" y="13" width="14" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 品字形:上一下二
function TriplePyramidIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="3" width="18" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="3" y="14" width="8.5" height="7" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="12.5" y="14" width="8.5" height="7" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 2 列网格
function Grid2Icon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="3" width="8.5" height="8.5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="12.5" y="3" width="8.5" height="8.5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="3" y="12.5" width="8.5" height="8.5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="12.5" y="12.5" width="8.5" height="8.5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 3 列网格(1 个略大 + 3x3 共 4 格,体现多图网格)
function Grid3Icon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="9.25" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="15.5" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="3" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="9.25" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="15.5" y="9.25" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="3" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="9.25" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="15.5" y="15.5" width="5.5" height="5.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

// 4 列网格 - 只画 4x4 中的部分(完整 16 太密)
function Grid4Icon({ className }: IconProps) {
	const cells = Array.from({ length: 16 }, (_, idx) => {
		const row = Math.floor(idx / 4);
		const col = idx % 4;
		return { idx, row, col };
	});
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			{cells.map(({ idx, row, col }) => (
				<rect
					key={`g4-${idx}`}
					x={3 + col * 4.625}
					y={3 + row * 4.625}
					width="4.25"
					height="4.25"
					rx="0.75"
					fill="currentColor"
					fillOpacity={(row + col) % 2 ? 0.15 : 0.05}
					stroke="currentColor"
					strokeWidth="1"
				/>
			))}
		</svg>
	);
}

// 瀑布流:三列高低不齐的矩形
function WaterfallIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="3" y="3" width="5" height="9" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
			<rect x="9.5" y="3" width="5" height="14" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
			<rect x="16" y="3" width="5" height="6" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
			<rect x="3" y="13" width="5" height="8" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
			<rect x="16" y="10" width="5" height="11" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
			<rect x="9.5" y="18" width="5" height="3" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
		</svg>
	);
}

// 横向滚动:容器比内容窄,且有滑动箭头
function HScrollIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
			<rect x="4" y="8" width="11" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="16" y="8" width="6" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
		</svg>
	);
}

// 纵向滚动:容器比内容矮,且有下滑箭头
function VScrollIcon({ className }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
			<rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
			<rect x="6" y="4" width="12" height="10" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
			<rect x="6" y="15" width="12" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
		</svg>
	);
}
