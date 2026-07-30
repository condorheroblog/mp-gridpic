/**
 * 主题 Store - 在亮/暗主题间切换并持久化到 localStorage
 */
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
	theme: Theme
	toggle: () => void
	setTheme: (theme: Theme) => void
}

const STORAGE_KEY = "mp-gridpic.theme";

function readInitialTheme(): Theme {
	if (typeof window === "undefined")
		return "light";
	const cached = window.localStorage.getItem(STORAGE_KEY);
	if (cached === "light" || cached === "dark")
		return cached;
	const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
	return prefersDark ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
	if (typeof document === "undefined")
		return;
	document.documentElement.classList.toggle("dark", theme === "dark");
	document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>((set) => {
	const initial = readInitialTheme();
	applyTheme(initial);
	return {
		theme: initial,
		toggle: () => {
			set((state) => {
				const next: Theme = state.theme === "dark" ? "light" : "dark";
				applyTheme(next);
				if (typeof window !== "undefined") {
					window.localStorage.setItem(STORAGE_KEY, next);
				}
				return { theme: next };
			});
		},
		setTheme: (theme) => {
			applyTheme(theme);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY, theme);
			}
			set({ theme });
		},
	};
});

/**
 * 用于在 main.tsx 启动时同步初始化一次主题(避免闪烁)
 */
export function initTheme(): void {
	readInitialTheme();
}
