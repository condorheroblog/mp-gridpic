/**
 * i18next 初始化:中英文双语
 * - 语言偏好缓存到 localStorage(key: mp-gridpic-lang)
 * - load=languageOnly: zh/zh-CN/zh-TW/en-US 等区域码统一按主语言查找资源
 * - 非中英语言回落到中文
 */
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

export const SUPPORTED_LANGUAGES = ["zh", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "mp-gridpic-lang";

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			zh: { translation: zhCN },
			en: { translation: en },
		},
		fallbackLng: "zh",
		supportedLngs: SUPPORTED_LANGUAGES,
		load: "languageOnly",
		interpolation: { escapeValue: false },
		detection: {
			order: ["localStorage", "navigator", "htmlTag"],
			lookupLocalStorage: LANGUAGE_STORAGE_KEY,
			caches: ["localStorage"],
		},
		returnEmptyString: false,
	});

export default i18n;
