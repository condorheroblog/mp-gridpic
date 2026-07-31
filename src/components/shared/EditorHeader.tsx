/**
 * 编辑器顶栏 - 标题、语言、主题、一键复制、回首页。
 *
 * 响应式策略:
 * - sm 以下:隐藏左侧标题/副标题区域(标题只占据一行),右侧所有按钮收起文字仅保留图标。
 *   "首页"→ HomeIcon,"GitHub"→ GitHubIcon,"复制到公众号"→ CopyIcon。
 * - sm 及以上:恢复完整文字按钮与标题副标题。
 *
 * 一键复制:把整个外层卡片 + 内部版式 + 图片说明一起写入剪贴板。
 * 导出结构统一使用 section / inline-block,与预览区域保持一致。
 */
import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { copyHtmlToClipboard } from "../../lib/clipboard";
import { FAVICON_URL } from "../../lib/favicon";
import { renderInlineHtml } from "../../lib/inlineHtml";
import { useDocumentStore } from "../../stores/documentStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "./Button";
import { CopyIcon, GitHubIcon, HomeIcon } from "./icons/HeaderIcons";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeSwitch } from "./ThemeSwitch";

export function EditorHeader() {
	const { t } = useTranslation();
	const docLayout = useDocumentStore(state => state.layout());
	const docStyle = useDocumentStore(state => state.style());
	const docImages = useDocumentStore(state => state.images);
	const docOverride = useDocumentStore(state => state.themeOverride);
	const pushToast = useToastStore(state => state.push);
	// 复制按钮的瞬时颜色反馈状态:空闲 / 复制中(禁用防抖) / 已复制成功(变绿) / 复制失败(变红)
	const [copyState, setCopyState] = useState<"idle" | "loading" | "done" | "error">("idle");

	const handleCopy = async () => {
		const themeResolved = docOverride ?? docStyle.theme;
		const html = renderInlineHtml({
			images: docImages,
			kind: docLayout.kind,
			theme: themeResolved,
		});
		setCopyState("loading");
		try {
			const ok = await copyHtmlToClipboard(html);
			if (ok) {
				setCopyState("done");
				pushToast(t("app.copySuccess"), "success");
			}
			else {
				setCopyState("error");
				pushToast(t("app.copyFail"), "error");
			}
		}
		catch {
			setCopyState("error");
			pushToast(t("app.copyFail"), "error");
		}
		// 1.2s 后恢复默认颜色,避免长时间停留在高亮态造成误导
		window.setTimeout(setCopyState, 1200, "idle");
	};

	const copyLabel = t("app.copy");

	return (
		<header className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
			{/* 移动端 / 桌面端统一使用 favicon 作为品牌图标,与浏览器标签页/PWA 图标视觉一致 */}
			<Link
				to="/"
				aria-label="mp-gridpic"
			>
				<img
					src={FAVICON_URL}
					alt=""
					width={28}
					height={28}
					className="h-7 w-7 rounded-lg"
				/>
			</Link>
			<div className="hidden flex-col md:flex">
				<h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
					<Link to="/" className="hover:underline">{t("app.title")}</Link>
				</h1>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">{t("app.subtitle")}</p>
			</div>
			<div className="ml-auto flex flex-wrap items-center gap-2">
				<Link
					to="/"
					aria-label={t("common.backHome", { defaultValue: "首页" })}
					title={t("common.backHome", { defaultValue: "首页" })}
					className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium bg-transparent hover:bg-zinc-200/60 text-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/60 transition-all duration-150 ease-out hover:-translate-y-px hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					<HomeIcon className="h-4 w-4" />
					<span className="hidden sm:inline">{t("common.backHome", { defaultValue: "首页" })}</span>
				</Link>
				<a
					href="https://github.com/condorheroblog/mp-gridpic/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					title="GitHub"
					className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium bg-transparent hover:bg-zinc-200/60 text-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/60 transition-all duration-150 ease-out hover:-translate-y-px hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
				>
					<GitHubIcon className="h-4 w-4" />
					<span className="hidden sm:inline">GitHub</span>
				</a>
				<LanguageSwitch />
				<ThemeSwitch />
				<Button
					variant="primary"
					onClick={handleCopy}
					disabled={copyState === "loading"}
					aria-label={copyLabel}
					title={copyLabel}
					icon={<CopyIcon className="h-4 w-4" />}
					className={clsx(
						// sm 以下隐藏文字,只保留图标;保留过渡色,不再固定 min-w 防止图标按钮过宽
						"px-2 sm:px-3 transition-colors",
						copyState === "done" && "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
						copyState === "error" && "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30",
					)}
				>
					<span className="hidden sm:inline">{copyLabel}</span>
				</Button>
			</div>
		</header>
	);
}
