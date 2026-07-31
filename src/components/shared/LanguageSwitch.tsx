/**
 * 语言切换按钮 - 中/英 切换,供 SiteHeader 与 EditorHeader 共用。
 */
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

interface LanguageSwitchProps {
	variant?: "ghost" | "secondary"
}

export function LanguageSwitch({ variant = "ghost" }: LanguageSwitchProps) {
	const { i18n } = useTranslation();
	const toggleLanguage = () => {
		const next = i18n.language.startsWith("zh") ? "en" : "zhCN";
		void i18n.changeLanguage(next);
	};
	return (
		<Button variant={variant} onClick={toggleLanguage} aria-label="language switch">
			<span className={clsx("font-mono text-xs", i18n.language.startsWith("zh") ? "text-indigo-500" : "text-zinc-500")}>
				中
			</span>
			<span className="text-zinc-300">/</span>
			<span className={clsx("font-mono text-xs", i18n.language.startsWith("en") ? "text-indigo-500" : "text-zinc-500")}>
				EN
			</span>
		</Button>
	);
}
