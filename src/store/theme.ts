/**
 * 明暗主题状态(持久化)
 * 首次访问跟随系统偏好;index.html 中有同步脚本防止刷新闪烁。
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

function getSystemTheme(): ThemeMode {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return "light";
	}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeState {
	mode: ThemeMode
	toggle: () => void
	setMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		set => ({
			mode: getSystemTheme(),
			toggle: () => set(state => ({ mode: state.mode === "dark" ? "light" : "dark" })),
			setMode: mode => set({ mode }),
		}),
		{ name: "mp-gridpic-theme", version: 1 },
	),
);
