/**
 * 顶部栏 - 标题、语言切换、主题切换、一键复制
 * 一键复制:把整个外层卡片 + 内部版式 + 图片说明一起写入剪贴板。
 */
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { copyHtmlToClipboard } from "../../lib/clipboard";
import { renderInlineHtml } from "../../lib/inlineHtml";
import { useDocumentStore } from "../../stores/documentStore";
import { useThemeStore } from "../../stores/themeStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "../ui/Button";

export function TopBar() {
	const { t, i18n } = useTranslation();
	const theme = useThemeStore(state => state.theme);
	const toggle = useThemeStore(state => state.toggle);
	const docLayout = useDocumentStore(state => state.layout());
	const docStyle = useDocumentStore(state => state.style());
	const docImages = useDocumentStore(state => state.images);
	const docOverride = useDocumentStore(state => state.themeOverride);
	const pushToast = useToastStore(state => state.push);

	const toggleLanguage = () => {
		const next = i18n.language.startsWith("zh") ? "en" : "zhCN";
		void i18n.changeLanguage(next);
	};

	const handleCopy = async () => {
		const themeResolved = docOverride ?? docStyle.theme;
		const html = renderInlineHtml({
			images: docImages,
			kind: docLayout.kind,
			theme: themeResolved,
		});
		try {
			const ok = await copyHtmlToClipboard(html);
			if (ok)
				pushToast(t("app.copySuccess"), "success");
			else pushToast(t("app.copyFail"), "error");
		}
		catch {
			pushToast(t("app.copyFail"), "error");
		}
	};

	return (
		<header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
			<div className="flex flex-col">
				<h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{t("app.title")}</h1>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">{t("app.subtitle")}</p>
			</div>
			<div className="ml-auto flex flex-wrap items-center gap-2">
				<Button variant="ghost" onClick={toggleLanguage}>
					<span className={clsx("font-mono text-xs", i18n.language.startsWith("zh") ? "text-indigo-500" : "text-zinc-500")}>
						中
					</span>
					<span className="text-zinc-300">/</span>
					<span className={clsx("font-mono text-xs", i18n.language.startsWith("en") ? "text-indigo-500" : "text-zinc-500")}>
						EN
					</span>
				</Button>
				<Button variant="ghost" onClick={toggle} aria-label="theme">
					{theme === "dark" ? `🌙 ${t("nav.themeDark")}` : `☀️ ${t("nav.themeLight")}`}
				</Button>
				<Button variant="primary" onClick={handleCopy}>{t("app.copy")}</Button>
			</div>
		</header>
	);
}
