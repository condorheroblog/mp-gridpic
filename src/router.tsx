/**
 * 路由配置 - SPA 路由,首页 /,编辑器 /editor
 * basename 跟随 Vite 的 base 配置,本地为 "/"、生产为 "/mp-gridpic/",保证 GitHub Pages 子路径生效。
 */
import { createBrowserRouter } from "react-router-dom";

import { EditorPage } from "./pages/editor/EditorPage";
import { HomePage } from "./pages/home/HomePage";

export const router = createBrowserRouter(
	[
		{ path: "/", element: <HomePage /> },
		{ path: "/editor", element: <EditorPage /> },
	],
	{ basename: import.meta.env.BASE_URL },
);
