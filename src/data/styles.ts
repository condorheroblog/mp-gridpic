/**
 * 内置样式注册表
 * - 每个样式独立存在,与版式解耦。
 * - 提供"标准"和"卡片"两组基础预设,方便用户快速选择。
 */
import type { StylePreset } from "../types";

const BASE_CAPTION = {
	captionFontSize: 13,
	captionColor: "#52525b",
};

const BASE_CARD_LIGHT = {
	cardPadding: 16,
	cardRadius: 16,
	cardBorderColor: "#e4e4e7",
	cardBackground: "#ffffff",
};

const BASE_CARD_DARK = {
	cardPadding: 16,
	cardRadius: 16,
	cardBorderColor: "#27272a",
	cardBackground: "#09090b",
};

export const STYLE_PRESETS: StylePreset[] = [
	{
		id: "style.standard",
		nameKey: "style.standard",
		isBuiltIn: true,
		theme: {
			containerPadding: 0,
			gap: 8,
			borderRadius: 0,
			shadow: false,
			shadowBlur: 0,
			shadowColor: "rgba(0,0,0,0)",
			shadowOffsetY: 0,
			scrollHeight: 240,
			scrollItemWidth: 220,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "below",
		},
	},
	{
		id: "style.card",
		nameKey: "style.card",
		isBuiltIn: true,
		theme: {
			containerPadding: 8,
			gap: 12,
			borderRadius: 12,
			shadow: true,
			shadowBlur: 16,
			shadowColor: "rgba(15,23,42,0.18)",
			shadowOffsetY: 4,
			scrollHeight: 260,
			scrollItemWidth: 240,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "below",
		},
	},
	{
		id: "style.gallery",
		nameKey: "style.gallery",
		isBuiltIn: true,
		theme: {
			containerPadding: 0,
			gap: 10,
			borderRadius: 14,
			shadow: true,
			shadowBlur: 22,
			shadowColor: "rgba(99,102,241,0.25)",
			shadowOffsetY: 6,
			scrollHeight: 300,
			scrollItemWidth: 260,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "below",
		},
	},
];

export function getStylePreset(id: string): StylePreset {
	return STYLE_PRESETS.find(item => item.id === id) ?? STYLE_PRESETS[0];
}

/** 在深色主题下,卡片/说明文字颜色取反。 */
export function getCardColorsForTheme(dark: boolean) {
	return dark ? BASE_CARD_DARK : BASE_CARD_LIGHT;
}
