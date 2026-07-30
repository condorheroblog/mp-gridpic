/**
 * 内置样式注册表
 * - 每个样式独立存在,与版式解耦。
 * - 提供"标准"和"卡片"两组基础预设,方便用户快速选择。
 */
import type { ShadowPreset, StylePreset } from "../types";

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

/**
 * 阴影预设 - 提供小、中、大三档,统一控制模糊/偏移/颜色
 * 阴影落在图片右下角,故同时存在水平(offsetX)与垂直(offsetY)偏移,
 * offsetX = offsetY 保证斜向下 45° 投射,视觉上更自然。
 */
export const SHADOW_PRESETS: Record<ShadowPreset, { blur: number, offsetX: number, offsetY: number, color: string }> = {
	small: { blur: 8, offsetX: 2, offsetY: 2, color: "rgba(15,23,42,0.10)" },
	medium: { blur: 16, offsetX: 4, offsetY: 4, color: "rgba(15,23,42,0.18)" },
	large: { blur: 32, offsetX: 8, offsetY: 8, color: "rgba(15,23,42,0.25)" },
};

export const STYLE_PRESETS: StylePreset[] = [
	{
		id: "style.standard",
		nameKey: "style.standard",
		isBuiltIn: true,
		theme: {
			containerPadding: 0,
			gap: 16,
			borderRadius: 0,
			shadow: false,
			shadowPreset: "medium",
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
			shadow: true,
			shadowPreset: "medium",
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
			shadow: true,
			shadowPreset: "large",
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
