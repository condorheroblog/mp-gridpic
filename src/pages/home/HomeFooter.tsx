/**
 * 首页页脚 - 版权 + GitHub + 编辑器入口。
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function HomeFooter() {
	const { t } = useTranslation();
	return (
		<footer className="border-t border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-950">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:px-6">
				<p>{t("home.footer.copyright")}</p>
				<div className="flex items-center gap-4">
					<a
						href="https://github.com/condorheroblog/mp-gridpic/"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-zinc-900 dark:hover:text-zinc-100"
					>
						{t("home.footer.repo")}
					</a>
					<Link to="/editor" className="hover:text-indigo-600 dark:hover:text-indigo-300">
						{t("home.footer.editor")}
					</Link>
				</div>
			</div>
		</footer>
	);
}
