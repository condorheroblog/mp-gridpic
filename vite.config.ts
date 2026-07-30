import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { codeInspectorPlugin } from "code-inspector-plugin";
import { defineConfig } from "vite";
import openGraph from "vite-plugin-open-graph";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	base: "/mp-gridpic/",

	plugins: [
		react(),
		tailwindcss(),
		codeInspectorPlugin({
			bundler: "vite",
			// hideConsole: true,
		}),
		openGraph({
			basic: {
				title: "公众号图片排版",
				type: "website",
				url: "https://condorheroblog.github.io/mp-gridpic/",
				siteName: "mp-gridpic",
				description:
					"一款专为微信公众号打造的纯图片版式排版工具，支持单图、双图、品字、网格、瀑布流、横向滑动等多种版式，一键复制即可粘贴到公众号编辑器。",
				image: "https://condorheroblog.github.io/mp-gridpic/og-image.jpg",
				locale: "zh_CN",
			},
			twitter: {
				card: "summary_large_image",
				title: "公众号图片排版",
				description:
					"一款专为微信公众号打造的纯图片版式排版工具，支持单图、双图、品字、网格、瀑布流、横向滑动等多种版式，一键复制即可粘贴到公众号编辑器。",
				image: "https://condorheroblog.github.io/mp-gridpic/og-image.jpg",
				imageAlt: "mp-gridpic —— 公众号图片排版工具",
			},
		}),
		VitePWA({
			base: "/mp-gridpic/",
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["favicon.svg", "icons/*"],
			manifest: {
				name: "公众号图片排版",
				short_name: "mp-gridpic",
				description: "专为微信公众号打造的纯图片版式排版工具，支持多种版式，一键复制粘贴。",
				theme_color: "#6366f1",
				background_color: "#09090b",
				display: "standalone",
				start_url: "/mp-gridpic/",
				scope: "/mp-gridpic/",
				icons: [
					{ src: "icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{
						src: "icons/pwa-512x512-maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				navigateFallback: "/mp-gridpic/index.html",
				// 仅预缓存应用外壳；图片资源体积较大，走运行时缓存，避免安装阶段阻塞
				globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
				// 应用外壳通常小于 5MB；超出此体积的资源交由运行时缓存处理
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			},
			devOptions: { enabled: false },
		}),
	],
	server: {
		port: 5173,
		host: true,
		// 开发期代理微信公众号接口,绕过浏览器 CORS 限制。
		// 前端调用 /wx-api/article-bin/verify_article_structure 即可,
		// Vite 会把请求转发到 https://mp.weixin.qq.com。
		proxy: {
			"/wx-api": {
				target: "https://mp.weixin.qq.com",
				changeOrigin: true,
				secure: true,
				rewrite: path => path.replace(/^\/wx-api/, ""),
			},
		},
	},
});
