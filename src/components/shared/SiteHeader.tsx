/**
 * 官网顶栏 - 首页专用,导航 + 语言 + 主题 + 打开编辑器。
 *
 * 响应式策略:
 * - sm 以下:仅保留 favicon 品牌图标,隐藏 "mp-gridpic" 文字、隐藏中间导航锚链接;
 *   "打开编辑器" 按钮变成方形图标按钮(笔图标),与语言/主题保持同一节奏。
 * - sm 及以上:保留 favicon 品牌图标 + 恢复完整文字按钮与导航链接。
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { FAVICON_URL } from "../../lib/favicon";
import { Button } from "./Button";
import { PenIcon } from "./icons/HeaderIcons";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeSwitch } from "./ThemeSwitch";

export function SiteHeader() {
	const { t } = useTranslation();
	return (
		<header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
			<nav
				aria-label="primary"
				className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6"
			>
				<Link
					to="/"
					aria-label="mp-gridpic"
					className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-50"
				>
					{/* 移动端 / 桌面端统一使用 favicon 作为品牌图标,与浏览器标签页/PWA 图标视觉一致 */}
					<img
						src={FAVICON_URL}
						alt=""
						width={28}
						height={28}
						className="h-7 w-7 rounded-lg"
					/>
					<span className="hidden sm:inline">mp-gridpic</span>
				</Link>
				<div className="ml-6 hidden items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
					<a
						href="#features"
						className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						{t("nav.features")}
					</a>
					<a
						href="#showcase"
						className="rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						{t("nav.showcase")}
					</a>
				</div>
				<div className="ml-auto flex items-center gap-1 sm:gap-2">
					<LanguageSwitch variant="ghost" />
					<ThemeSwitch variant="ghost" />
					<Link
						to="/editor"
						aria-label={t("home.hero.ctaPrimary")}
						title={t("home.hero.ctaPrimary")}
					>
						<Button
							variant="primary"
							// sm 以下隐藏文字并改为方形图标按钮,避免溢出;sm 以上保留原文案
							className="px-2 sm:px-3"
							icon={<PenIcon className="h-4 w-4" />}
						>
							<span className="hidden sm:inline">{t("home.hero.ctaPrimary")}</span>
						</Button>
					</Link>
				</div>
			</nav>
		</header>
	);
}
