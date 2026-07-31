/**
 * Hero 区 - 主标题、副标题、主/次 CTA。
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "../../components/shared/Button";

export function HeroSection() {
	const { t } = useTranslation();
	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white py-20 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-zinc-950 sm:py-28">
			{/* 装饰背景 */}
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
				<div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/40 to-fuchsia-200/40 blur-3xl dark:from-indigo-900/40 dark:to-fuchsia-900/40" />
			</div>
			<div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
				<span className="rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm backdrop-blur dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
					{t("home.hero.badge")}
				</span>
				<h1 className="bg-gradient-to-br from-zinc-900 via-indigo-700 to-fuchsia-700 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent dark:from-zinc-50 dark:via-indigo-300 dark:to-fuchsia-300 sm:text-5xl">
					{t("home.hero.title")}
				</h1>
				<p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
					{t("home.hero.tagline")}
				</p>
				<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
					<Link to="/editor">
						<Button variant="primary" className="px-5 py-2.5 text-base">
							<span>{t("home.hero.ctaPrimary")}</span>
							<span aria-hidden>→</span>
						</Button>
					</Link>
					<a
						href="https://github.com/condorheroblog/mp-gridpic/"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
					>
						{t("home.hero.ctaSecondary")}
					</a>
					<a
						href="#showcase"
						className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
					>
						<span>{t("home.hero.ctaAnchor")}</span>
						<span aria-hidden>↓</span>
					</a>
				</div>
			</div>
		</section>
	);
}
