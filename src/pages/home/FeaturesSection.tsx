/**
 * "特性"区 - 4 个特性卡片,介绍核心能力。
 */
import { useTranslation } from "react-i18next";

interface FeatureKey {
	titleKey: string
	descKey: string
	emoji: string
	tone: string
}

const FEATURES: FeatureKey[] = [
	{ titleKey: "home.features.f1.title", descKey: "home.features.f1.desc", emoji: "🎨", tone: "from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/30" },
	{ titleKey: "home.features.f2.title", descKey: "home.features.f2.desc", emoji: "🧩", tone: "from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950/40 dark:to-fuchsia-900/30" },
	{ titleKey: "home.features.f3.title", descKey: "home.features.f3.desc", emoji: "🖱️", tone: "from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30" },
	{ titleKey: "home.features.f4.title", descKey: "home.features.f4.desc", emoji: "📋", tone: "from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30" },
];

export function FeaturesSection() {
	const { t } = useTranslation();
	return (
		<section id="features" className="border-b border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-950 sm:py-20">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<header className="mb-10 flex flex-col items-center gap-2 text-center">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
						{t("home.features.heading")}
					</h2>
					<p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
						{t("home.features.subheading")}
					</p>
				</header>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
					{FEATURES.map(feature => (
						<div
							key={feature.titleKey}
							className={`flex flex-col gap-3 rounded-2xl bg-gradient-to-br ${feature.tone} p-5 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:ring-white/10`}
						>
							<span className="text-2xl" aria-hidden>{feature.emoji}</span>
							<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t(feature.titleKey)}</h3>
							<p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{t(feature.descKey)}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
