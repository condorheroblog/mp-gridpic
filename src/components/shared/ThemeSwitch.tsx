/**
 * 主题切换按钮 - 在亮/暗主题间切换,供 SiteHeader 与 EditorHeader 共用。
 *
 * 移动端 (sm 以下) 只显示图标以节省横向空间,桌面端保留 "亮色 / 暗色" 文案。
 */
import { useTranslation } from "react-i18next";

import { useThemeStore } from "../../stores/themeStore";
import { Button } from "./Button";
import { MoonIcon, SunIcon } from "./icons/HeaderIcons";

interface ThemeSwitchProps {
	variant?: "ghost" | "secondary"
}

export function ThemeSwitch({ variant = "ghost" }: ThemeSwitchProps) {
	const { t } = useTranslation();
	const theme = useThemeStore(state => state.theme);
	const toggle = useThemeStore(state => state.toggle);
	const label = theme === "dark" ? t("nav.themeDark") : t("nav.themeLight");
	return (
		<Button
			variant={variant}
			onClick={toggle}
			aria-label={t("nav.theme")}
			title={t("nav.theme")}
		>
			{theme === "dark" ? <MoonIcon /> : <SunIcon />}
			<span className="hidden sm:inline">{label}</span>
		</Button>
	);
}
