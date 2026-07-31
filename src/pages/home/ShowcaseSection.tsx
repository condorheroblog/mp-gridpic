/**
 * "效果展示"区 - 10 个版式预览卡片,支持响应式 1/2/3/4 列。
 * 滚动版式(hscroll/vscroll)放在最前面,符合其作为 mp-gridpic 招牌特性的定位。
 */
import { useTranslation } from "react-i18next";

import { HOME_SHOWCASE } from "./homeData";
import { ShowcaseCard } from "./ShowcaseCard";

export function ShowcaseSection() {
	const { t } = useTranslation();
	return (
		<section id="showcase" className="border-b border-zinc-200 bg-white/60 py-16 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/40 sm:py-20">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<header className="mb-8 flex flex-col gap-2 text-center sm:mb-10">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
						{t("home.showcase.heading")}
					</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">{t("home.showcase.subheading")}</p>
				</header>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
					{HOME_SHOWCASE.map(item => (
						<ShowcaseCard key={item.kind} item={item} />
					))}
				</div>
			</div>
		</section>
	);
}
