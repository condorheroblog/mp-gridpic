/**
 * 效果展示卡 - 把单个版式静态渲染装在卡片外壳里。
 * 卡片高度自适应:不同版式由各自的 preview 组件(占位 + 滚动提示)决定高度,
 * 这样滚动版式可以保持"可视口 + 下方提示"的结构,其它版式则按自身内容撑开。
 */
import type { HomeShowcaseItem } from "./homeData";
import { useTranslation } from "react-i18next";

interface ShowcaseCardProps {
	item: HomeShowcaseItem
}

export function ShowcaseCard({ item }: ShowcaseCardProps) {
	const { t } = useTranslation();
	return (
		<article
			role="img"
			aria-label={`${t(item.titleKey)} 预览`}
			className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
		>
			<div className="flex w-full flex-col">
				{item.render()}
			</div>
			<div className="mt-auto flex flex-col gap-1 pt-3">
				<h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t(item.titleKey)}</h3>
				<p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{t(item.descKey)}</p>
			</div>
		</article>
	);
}
