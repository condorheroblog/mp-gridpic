import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en";
import zhCN from "./i18n/zh-CN";

const resources = {
	en: { translation: en },
	zhCN: { translation: zhCN },
};

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		supportedLngs: ["en", "zhCN"],
		detection: {
			order: ["localStorage", "navigator"],
			lookupLocalStorage: "mp-gridpic.lang",
			caches: ["localStorage"],
		},
		interpolation: { escapeValue: false },
	});

/**
 * @see `https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang`
 */
i18n.on("languageChanged", (lng) => {
	document.documentElement.lang = lng;
	// 切换语言时同步 <title>,提升浏览器历史/书签的可读性
	if (typeof document !== "undefined")
		document.title = i18n.t("app.title", { defaultValue: "mp-gridpic" });
});

export default i18n;
