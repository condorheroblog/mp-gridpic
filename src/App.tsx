import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	HashRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { ToastViewport } from "./components/ToastViewport";
import { EditorPage } from "./pages/EditorPage";
import { LandingPage } from "./pages/LandingPage";
import { useThemeStore } from "./store/theme";

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
	}, [pathname]);
	return null;
}

function Shell() {
	const location = useLocation();
	const isEditor = location.pathname.startsWith("/editor");

	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/editor" element={<EditorPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			{!isEditor && <Footer />}
		</div>
	);
}

export function App() {
	const { i18n: i18nInstance, t } = useTranslation();
	const mode = useThemeStore(state => state.mode);

	// 同步明暗主题到 <html> 与浏览器地址栏配色
	useEffect(() => {
		document.documentElement.classList.toggle("dark", mode === "dark");
		document
			.querySelector("meta[name=\"theme-color\"]")
			?.setAttribute("content", mode === "dark" ? "#09090b" : "#6366f1");
	}, [mode]);

	// 同步 <html lang> 与文档标题
	useEffect(() => {
		const lang = i18nInstance.language?.startsWith("en") ? "en" : "zh-CN";
		document.documentElement.lang = lang;
		document.title = `${t("common.appName")} · mp-gridpic`;
	}, [i18nInstance.language, t]);

	return (
		<HashRouter>
			<ScrollToTop />
			<Shell />
			<ToastViewport />
		</HashRouter>
	);
}
