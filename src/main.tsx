import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initTheme } from "./stores/themeStore";
import "./i18n";
import "./index.css";

// 应用主题：在第一次渲染前同步应用，避免主题闪烁
initTheme();

const rootEl = document.getElementById("root");
if (!rootEl)
	throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
