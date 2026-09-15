import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import i18n from "../../i18n";
import { cn } from "../../lib/cn";
import { useThemeStore } from "../../store/theme";
import { GitHubIcon, GlobeIcon, LogoIcon, MoonIcon, SunIcon } from "../icons";
import { IconButton } from "../ui";

const REPO_URL = "https://github.com/condorheroblog/mp-gridpic";

export function Header() {
	const { t } = useTranslation();
	const mode = useThemeStore(state => state.mode);
	const toggleTheme = useThemeStore(state => state.toggle);
	const isZh = i18n.language?.startsWith("zh") ?? true;

	const switchLanguage = () => {
		void i18n.changeLanguage(isZh ? "en" : "zh");
	};

	return (
		<header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
				<Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
					<LogoIcon className="text-2xl" />
					<span className="text-sm text-zinc-900 dark:text-white">{t("common.appName")}</span>
				</Link>

				<nav className="flex items-center gap-1">
					<NavLink
						to="/editor"
						className={({ isActive }) =>
							cn(
								"hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex",
								isActive
									? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"
									: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
							)}
					>
						{t("nav.editor")}
					</NavLink>

					<IconButton label={t("lang.toggle")} onClick={switchLanguage}>
						<span className="flex items-center gap-1 text-base">
							<GlobeIcon />
							<span className="text-[10px] font-bold">{isZh ? "EN" : "中"}</span>
						</span>
					</IconButton>

					<IconButton label={t("theme.toggle")} onClick={toggleTheme}>
						{mode === "dark" ? <SunIcon /> : <MoonIcon />}
					</IconButton>

					<IconButton label={t("common.github")} onClick={() => window.open(REPO_URL, "_blank", "noopener")}>
						<GitHubIcon />
					</IconButton>
				</nav>
			</div>
		</header>
	);
}
