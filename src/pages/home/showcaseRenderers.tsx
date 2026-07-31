/**
 * 首页"效果展示"区 - 静态版式渲染器集合。
 * 此文件只导出 React 组件,常量(待渲染列表)放在 homeData.ts 中以便与组件解耦。
 *
 * 设计:
 *   - 占位图使用渐变 + 几何 SVG,不依赖任何真实图片。
 *   - 横向滚动(HScroll)与纵向滚动(VScroll)是真滚动的:卡片内是 overflow 视口 + 内容容器宽度>100%,
 *     并且在视口下方放置提示文案,对应编辑器的"左右滑动查看" / "上下滑动查看"。
 */
import type { ReactNode } from "react";
import type { LayoutKind } from "../../types";

import { useTranslation } from "react-i18next";

/**
 * 占位图块 - 统一视觉语言:渐变 + 中央几何 SVG + 角标"图 N"
 * 通过不同 aspect + 渐变色让所有占位块放在一起时仍有差异度。
 */
export interface PlaceholderProps {
	label: string
	tone: "indigo" | "fuchsia" | "emerald" | "amber" | "sky" | "rose"
	aspect?: "video" | "square" | "portrait"
}

const TONE_GRADIENT: Record<PlaceholderProps["tone"], string> = {
	indigo: "from-indigo-300/80 to-indigo-500/40 dark:from-indigo-700/60 dark:to-indigo-900/40",
	fuchsia: "from-fuchsia-300/80 to-fuchsia-500/40 dark:from-fuchsia-700/60 dark:to-fuchsia-900/40",
	emerald: "from-emerald-300/80 to-emerald-500/40 dark:from-emerald-700/60 dark:to-emerald-900/40",
	amber: "from-amber-300/80 to-amber-500/40 dark:from-amber-700/60 dark:to-amber-900/40",
	sky: "from-sky-300/80 to-sky-500/40 dark:from-sky-700/60 dark:to-sky-900/40",
	rose: "from-rose-300/80 to-rose-500/40 dark:from-rose-700/60 dark:to-rose-900/40",
};

const ASPECT: Record<NonNullable<PlaceholderProps["aspect"]>, string> = {
	video: "aspect-[16/10]",
	square: "aspect-square",
	portrait: "aspect-[3/4]",
};

/**
 * 给占位图的角标编号:≤9 时补 0 占两位(01、02...09),≥10 时按实际数字显示(10、11...),
 * 这样满 16 张的 grid-4 也能保持视觉一致(01 ~ 16)。
 */
function padLabel(n: number): string {
	return n <= 9 ? `0${n}` : `${n}`;
}

export function Placeholder({ label, tone, aspect = "video" }: PlaceholderProps) {
	return (
		<div
			className={`relative w-full ${ASPECT[aspect]} overflow-hidden rounded-lg bg-gradient-to-br ${TONE_GRADIENT[tone]} ring-1 ring-black/5 dark:ring-white/10`}
		>
			<svg
				viewBox="0 0 80 50"
				className="absolute inset-0 h-full w-full opacity-50 mix-blend-overlay"
				aria-hidden
			>
				<circle cx="20" cy="20" r="14" fill="white" />
				<path d="M0 50 L30 25 L55 40 L80 18 L80 50 Z" fill="white" fillOpacity="0.6" />
			</svg>
			<span className="absolute right-1.5 top-1.5 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 backdrop-blur-sm dark:bg-black/40 dark:text-zinc-200">
				{label}
			</span>
		</div>
	);
}

const GAP = "gap-2";
const INNER = "rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60";
/** 滚动版式卡上方的"图占区域"的固定高度(不含下方提示文案) */
const SCROLL_FRAME_HEIGHT = "h-40 sm:h-44";
/** 滚动提示文案样式,放在滚动视口下方,不随视口内容滚动 */
const HINT_BASE = "mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400";

function ScrollHint({ i18nKey }: { i18nKey: "home.showcase.hint.hscroll" | "home.showcase.hint.vscroll" }) {
	const { t } = useTranslation();
	return <p className={HINT_BASE}>{t(i18nKey)}</p>;
}

export function SinglePreview(): ReactNode {
	return (
		<div className={`flex h-full flex-col justify-center ${INNER}`}>
			<Placeholder label="01" tone="indigo" aspect="video" />
		</div>
	);
}

export function DoubleRowPreview(): ReactNode {
	return (
		<div className={`grid h-full grid-cols-2 ${GAP} ${INNER}`}>
			<Placeholder label="01" tone="fuchsia" aspect="square" />
			<Placeholder label="02" tone="sky" aspect="square" />
		</div>
	);
}

export function DoubleColPreview(): ReactNode {
	return (
		<div className={`flex h-full flex-col ${GAP} ${INNER}`}>
			<Placeholder label="01" tone="indigo" aspect="video" />
			<Placeholder label="02" tone="rose" aspect="video" />
		</div>
	);
}

export function PyramidPreview(): ReactNode {
	return (
		<div className={`flex h-full flex-col ${GAP} ${INNER}`}>
			<Placeholder label="01" tone="emerald" aspect="video" />
			<div className={`grid grid-cols-2 ${GAP}`}>
				<Placeholder label="02" tone="amber" aspect="square" />
				<Placeholder label="03" tone="rose" aspect="square" />
			</div>
		</div>
	);
}

export function Grid2Preview(): ReactNode {
	const tones: PlaceholderProps["tone"][] = ["indigo", "fuchsia", "emerald", "amber"];
	return (
		<div className={`grid h-full grid-cols-2 ${GAP} ${INNER}`}>
			{tones.map((tone, i) => (
				<Placeholder key={`g2-${tone}-${i}`} label={padLabel(i + 1)} tone={tone} aspect="square" />
			))}
		</div>
	);
}

export function Grid3Preview(): ReactNode {
	const tones: PlaceholderProps["tone"][] = ["indigo", "fuchsia", "sky", "emerald", "amber", "rose", "indigo", "fuchsia", "sky"];
	return (
		<div className={`grid h-full grid-cols-3 ${GAP} ${INNER}`}>
			{tones.map((tone, i) => (
				<Placeholder key={`g3-${tone}-${i}`} label={padLabel(i + 1)} tone={tone} aspect="square" />
			))}
		</div>
	);
}

export function Grid4Preview(): ReactNode {
	const tones: PlaceholderProps["tone"][] = [
		"indigo",
		"fuchsia",
		"sky",
		"emerald",
		"amber",
		"rose",
		"indigo",
		"sky",
		"emerald",
		"amber",
		"rose",
		"fuchsia",
		"indigo",
		"emerald",
		"sky",
		"amber",
	];
	return (
		<div className={`grid h-full grid-cols-4 ${GAP} ${INNER}`}>
			{tones.map((tone, i) => (
				<Placeholder key={`g4-${tone}-${i}`} label={padLabel(i + 1)} tone={tone} aspect="square" />
			))}
		</div>
	);
}

export function WaterfallPreview(): ReactNode {
	return (
		<div className={`grid h-full grid-cols-2 ${GAP} ${INNER}`}>
			<div className={`flex flex-col ${GAP}`}>
				<Placeholder label="01" tone="indigo" aspect="video" />
				<Placeholder label="03" tone="emerald" aspect="square" />
				<Placeholder label="05" tone="rose" aspect="video" />
			</div>
			<div className={`flex flex-col ${GAP}`}>
				<Placeholder label="02" tone="fuchsia" aspect="square" />
				<Placeholder label="04" tone="amber" aspect="square" />
			</div>
		</div>
	);
}

/**
 * 横向滑动画廊 - 真滚动。
 * 卡片内:overflow-x:auto 视口 + 内层 w-[200%] 容纳 6 张 50% 宽的占位块,
 * 鼠标在桌面端可以拖拽滚动,移动端可触摸滚动。
 * 下方提示放在视口外,不随内容滚走。
 */
export function HScrollPreview(): ReactNode {
	const tones: PlaceholderProps["tone"][] = ["indigo", "fuchsia", "sky", "emerald", "amber", "rose"];
	return (
		<div className="flex flex-col">
			{/* 滚动视口:overflow-x:auto,内层宽度远大于 100% */}
			<div className={`relative ${SCROLL_FRAME_HEIGHT} overflow-x-auto overflow-y-hidden ${INNER}`}>
				<div className={`flex h-full w-[200%] ${GAP}`}>
					{tones.map((tone, i) => (
						<div key={`hs-${tone}-${i}`} className="w-1/6 shrink-0">
							<Placeholder label={padLabel(i + 1)} tone={tone} aspect="video" />
						</div>
					))}
				</div>
				<span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-base text-zinc-500 dark:text-zinc-400">›</span>
			</div>
			<ScrollHint i18nKey="home.showcase.hint.hscroll" />
		</div>
	);
}

/**
 * 纵向滚动 - 真滚动。固定高度视口 + overflow-y:auto,内层高度超出视口,
 * 桌面端滚轮可滚、移动端可触摸滚动;下方提示放在视口外。
 */
export function VScrollPreview(): ReactNode {
	const tones: PlaceholderProps["tone"][] = ["indigo", "fuchsia", "emerald", "amber", "sky", "rose"];
	return (
		<div className="flex flex-col">
			<div className={`relative ${SCROLL_FRAME_HEIGHT} overflow-y-auto overflow-x-hidden ${INNER}`}>
				<div className={`flex w-full flex-col ${GAP}`}>
					{tones.map((tone, i) => (
						<Placeholder key={`vs-${tone}-${i}`} label={padLabel(i + 1)} tone={tone} aspect="video" />
					))}
				</div>
			</div>
			<ScrollHint i18nKey="home.showcase.hint.vscroll" />
		</div>
	);
}

// 只导出组件,避免 "fast refresh only works when a file only exports components" 错误
export type ShowcaseKind = LayoutKind;
