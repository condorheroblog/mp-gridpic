import type { EditorConfig, LayoutId, PicItem } from "../lib/types";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HtmlFragment } from "../components/HtmlFragment";
import {
	ArrowRightIcon,
	BoltIcon,
	CopyIcon,
	LanguagesIcon,
	OfflineIcon,
	ShieldCheckIcon,
	ShuffleIcon,
	SlidersIcon,
	SparklesIcon,
} from "../components/icons";
import { LayoutIcon } from "../components/LayoutIcon";
import { Button } from "../components/ui";
import { cn } from "../lib/cn";
import { DEFAULT_CONFIG, LAYOUT_MAP, LAYOUTS } from "../lib/constants";
import {
	DEMO_LANDSCAPE_URLS,
	DEMO_PORTRAIT_URLS,
	DEMO_SQUARE_URLS,
	DEMO_TALL_URLS,
	DEMO_WIDE_URLS,
} from "../lib/demoImages";
import { renderInlineHtml } from "../lib/renderInlineHtml";

/** 按版式要求构造落地页演示图:数量与图片比例与真实编辑器一致 */
function buildShowcaseImages(layout: LayoutId): PicItem[] {
	const make = (urls: string[], count: number): PicItem[] =>
		Array.from({ length: count }, (_, i) => ({
			id: `showcase-${i}`,
			seed: null,
			// 宫格图多于本地素材时循环复用,保证 16 张也能完整演示
			src: urls[i % urls.length],
			// 落地页演示同样写死中文,与复制进公众号的内容保持一致
			caption: `图片 ${i + 1}`,
		}));

	const [wide] = DEMO_WIDE_URLS;
	const [tall] = DEMO_TALL_URLS;
	const [sq1, sq2] = DEMO_SQUARE_URLS;

	switch (layout) {
		// 左右滑动用竖图
		case "swipe-h":
			return make(DEMO_PORTRAIT_URLS, 6);
		// 三图版式:通栏位分别用 2:1 横图 / 1:2 竖图,小图位用方图
		case "tri-top":
			return make([wide, sq1, sq2], 3);
		case "tri-bottom":
			return make([sq1, sq2, wide], 3);
		case "tri-left":
			return make([tall, sq1, sq2], 3);
		case "tri-right":
			return make([sq1, sq2, tall], 3);
		// 单图/双图竖排与编辑器一致,使用 3:2 横图
		case "single":
			return make(DEMO_LANDSCAPE_URLS, 1);
		case "duo-col":
			return make(DEMO_LANDSCAPE_URLS, 2);
		// 宫格固定张数(4/9/16),其余版式 6 张方图
		default:
			return make(DEMO_SQUARE_URLS, LAYOUT_MAP[layout].exactImages ?? 6);
	}
}

function useShowcaseConfig(layout: LayoutId): EditorConfig {
	return useMemo(() => {
		return {
			layout,
			images: buildShowcaseImages(layout),
			gap: 8,
			radius: 8,
			size: 100,
			scroller: { ...DEFAULT_CONFIG.scroller },
			caption: {
				visible: true,
				position: "above",
				fontSize: 14,
				color: "#6b7280",
			},
		};
	}, [layout]);
}

function Hero() {
	const { t } = useTranslation();
	const config = useShowcaseConfig("swipe-h");
	const html = useMemo(() => renderInlineHtml(config), [config]);

	const stats = [
		t("landing.stat1"),
		t("landing.stat2"),
		t("landing.stat3"),
		t("landing.stat4"),
	];

	return (
		<section className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute -top-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20"
			/>
			<div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
				<div className="mx-auto max-w-3xl text-center">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
						<ShieldCheckIcon className="text-sm" />
						{t("landing.badge")}
					</span>

					<h1 className="mt-6 whitespace-pre-line text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
						{t("landing.heroTitle")}
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
						{t("landing.heroDesc")}
					</p>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Link to="/editor">
							<Button variant="primary" size="lg">
								{t("landing.ctaPrimary")}
								<ArrowRightIcon />
							</Button>
						</Link>
						<a href="#showcase">
							<Button size="lg">{t("landing.ctaSecondary")}</Button>
						</a>
					</div>

					<dl className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
						{stats.map(stat => (
							<div
								key={stat}
								className="rounded-xl bg-white/70 px-2 py-3 text-xs font-semibold text-indigo-700 ring-1 ring-zinc-200 backdrop-blur dark:bg-zinc-900/70 dark:text-indigo-300 dark:ring-zinc-800"
							>
								{stat}
							</div>
						))}
					</dl>
				</div>

				<div className="relative mx-auto mt-14 max-w-sm">
					<div
						aria-hidden
						className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl"
					/>
					<div className="relative animate-float rounded-[2rem] bg-white p-3 shadow-2xl shadow-indigo-900/10 ring-1 ring-zinc-200">
						<div className="mb-3 flex items-center gap-1.5 px-1">
							<span className="size-2.5 rounded-full bg-red-400" />
							<span className="size-2.5 rounded-full bg-amber-400" />
							<span className="size-2.5 rounded-full bg-emerald-400" />
							<span className="ml-2 text-[10px] text-zinc-400">mp-gridpic</span>
						</div>
						<div className="article-surface rounded-2xl">
							<HtmlFragment html={html} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function LayoutShowcase() {
	const { t } = useTranslation();
	const [active, setActive] = useState<LayoutId>("swipe-h");
	const config = useShowcaseConfig(active);
	const html = useMemo(() => renderInlineHtml(config), [config]);

	return (
		<section id="showcase" className="scroll-mt-20 py-16">
			<div className="mx-auto max-w-6xl px-4">
				<div className="text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
						{t("landing.showcaseTitle")}
					</h2>
					<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
						{t("landing.showcaseDesc")}
					</p>
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
					<div className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
						{LAYOUTS.map(meta => (
							<button
								key={meta.id}
								type="button"
								onClick={() => setActive(meta.id)}
								className={cn(
									"flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all lg:shrink",
									active === meta.id
										? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
										: "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
								)}
							>
								<LayoutIcon layout={meta.id} className="text-lg" />
								{t(`editor.layout.${meta.id}`)}
							</button>
						))}
					</div>

					{/* 演示区固定高度并居中:切换版式时左侧按钮列不再随内容高低跳动 */}
					<div className="flex h-[600px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:h-[720px] sm:p-8">
						<div className="w-full min-w-0 max-w-md">
							<div className="article-surface overflow-hidden rounded-2xl shadow-xl shadow-zinc-900/5 ring-1 ring-zinc-200 dark:ring-zinc-800">
								<div className="p-4">
									<HtmlFragment html={html} animationKey={active} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const FEATURE_ICONS = [
	<LayoutIcon key="layouts" layout="grid-3" />,
	<ShuffleIcon key="swipe" />,
	<SlidersIcon key="sliders" />,
	<CopyIcon key="copy" />,
	<LanguagesIcon key="i18n" />,
	<OfflineIcon key="pwa" />,
];

function Features() {
	const { t } = useTranslation();
	const features = [
		["f1Title", "f1Desc"],
		["f2Title", "f2Desc"],
		["f3Title", "f3Desc"],
		["f4Title", "f4Desc"],
		["f5Title", "f5Desc"],
		["f6Title", "f6Desc"],
	] as const;

	return (
		<section className="border-y border-zinc-200/70 bg-white/60 py-16 dark:border-zinc-800/70 dark:bg-zinc-900/30">
			<div className="mx-auto max-w-6xl px-4">
				<div className="text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
						{t("landing.featuresTitle")}
					</h2>
					<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
						{t("landing.featuresDesc")}
					</p>
				</div>

				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{features.map(([titleKey, descKey], i) => (
						<div
							key={titleKey}
							className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-900/5 dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/60 dark:text-indigo-300">
								{FEATURE_ICONS[i]}
							</div>
							<h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
								{t(`landing.${titleKey}`)}
							</h3>
							<p className="mt-1.5 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
								{t(`landing.${descKey}`)}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Steps() {
	const { t } = useTranslation();
	const steps = [
		["step1Title", "step1Desc"],
		["step2Title", "step2Desc"],
		["step3Title", "step3Desc"],
	] as const;

	return (
		<section className="py-16">
			<div className="mx-auto max-w-6xl px-4">
				<h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl dark:text-white">
					{t("landing.stepsTitle")}
				</h2>
				<ol className="mt-10 grid gap-4 md:grid-cols-3">
					{steps.map(([titleKey, descKey], i) => (
						<li
							key={titleKey}
							className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
						>
							<span className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
								{i + 1}
							</span>
							<h3 className="mt-4 text-base font-semibold dark:text-white">
								{t(`landing.${titleKey}`)}
							</h3>
							<p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
								{t(`landing.${descKey}`)}
							</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

function FinalCta() {
	const { t } = useTranslation();
	return (
		<section className="px-4 pb-20">
			<div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-14 text-center shadow-xl shadow-indigo-600/20">
				<SparklesIcon className="mx-auto text-4xl text-white/90" />
				<h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
					{t("landing.finalCta")}
				</h2>
				<p className="mx-auto mt-2 max-w-md text-sm text-indigo-100">
					{t("landing.finalDesc")}
				</p>
				<div className="mt-7 flex justify-center">
					<Link
						to="/editor"
						className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-indigo-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
					>
						<BoltIcon />
						{t("nav.start")}
					</Link>
				</div>
				<p className="mx-auto mt-6 max-w-2xl text-[11px] leading-5 text-indigo-200/80">
					{t("landing.specNote")}
				</p>
			</div>
		</section>
	);
}

export function LandingPage() {
	return (
		<>
			<Hero />
			<LayoutShowcase />
			<Features />
			<Steps />
			<FinalCta />
		</>
	);
}
