/**
 * 内置样式注册表
 * - 每个样式独立存在,与版式解耦。
 * - 提供"标准"和"卡片"两组基础预设,方便用户快速选择。
 */
import type { StylePreset } from "../types";

const BASE_CAPTION = {
	captionFontSize: 14,
	captionColor: "#a0a0a0",
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
			gap: 16,
			borderRadius: 6,
			scrollHeight: 400,
			itemRatio: 1,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "above",
		},
	},
	{
		id: "style.card",
		nameKey: "style.card",
		isBuiltIn: true,
		theme: {
			containerPadding: 0,
			gap: 24,
			borderRadius: 12,
			scrollHeight: 400,
			itemRatio: 1,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "above",
		},
	},
	{
		id: "style.gallery",
		nameKey: "style.gallery",
		isBuiltIn: true,
		theme: {
			containerPadding: 0,
			gap: 32,
			borderRadius: 14,
			scrollHeight: 400,
			itemRatio: 1,
			...BASE_CARD_LIGHT,
			...BASE_CAPTION,
			captionPosition: "above",
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
