import type { EditorConfig } from "../lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ImagePanel } from "../components/editor/ImagePanel";
import { LayoutSwitcher } from "../components/editor/LayoutSwitcher";
import { PreviewPane } from "../components/editor/PreviewPane";
import { StylePanel } from "../components/editor/StylePanel";
import {
	ArrowLeftIcon,
	CopyIcon,
	ImageIcon,
	RefreshIcon,
	SlidersIcon,
	TemplateIcon,
} from "../components/icons";
import { Button } from "../components/ui";
import { copyHtmlToClipboard } from "../lib/clipboard";
import { cn } from "../lib/cn";
import { renderInlineHtml, renderPlainText } from "../lib/renderInlineHtml";
import { useEditorStore } from "../store/editor";
import { toast } from "../store/toast";

const CONFIG_TABS = [
	{ id: "layout", labelKey: "editor.tabLayout", Icon: TemplateIcon },
	{ id: "images", labelKey: "editor.tabImages", Icon: ImageIcon },
	{ id: "style", labelKey: "editor.tabStyle", Icon: SlidersIcon },
] as const;

type ConfigTabId = (typeof CONFIG_TABS)[number]["id"];

export function EditorPage() {
	const { t } = useTranslation();
	const [copying, setCopying] = useState(false);
	const [activeTab, setActiveTab] = useState<ConfigTabId>("layout");

	const config = useEditorStore(
		useShallow(
			state =>
				({
					layout: state.layout,
					images: state.images,
					gap: state.gap,
					radius: state.radius,
					size: state.size,
					scroller: state.scroller,
					caption: state.caption,
				}) satisfies EditorConfig,
		),
	);
	const setLayout = useEditorStore(state => state.setLayout);
	const reset = useEditorStore(state => state.reset);
	const [confirmReset, setConfirmReset] = useState(false);
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const html = useMemo(() => renderInlineHtml(config), [config]);

	useEffect(() => () => {
		if (resetTimerRef.current) {
			clearTimeout(resetTimerRef.current);
		}
	}, []);

	const handleCopy = useCallback(async () => {
		setCopying(true);
		try {
			await copyHtmlToClipboard(html, renderPlainText(config));
			toast(t("editor.copySuccess"), "success");
		}
		catch {
			toast(t("editor.copyFail"), "error");
		}
		finally {
			setCopying(false);
		}
	}, [html, config, t]);

	const handleReset = () => {
		if (!confirmReset) {
			setConfirmReset(true);
			resetTimerRef.current = setTimeout(setConfirmReset, 3000, false);
			return;
		}
		if (resetTimerRef.current) {
			clearTimeout(resetTimerRef.current);
		}
		setConfirmReset(false);
		reset();
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-5">
			<div className="mb-4 flex items-center justify-between">
				<Link
					to="/"
					className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
				>
					<ArrowLeftIcon />
					{t("editor.backHome")}
				</Link>
				<button
					type="button"
					onClick={handleReset}
					className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
					style={confirmReset ? { color: "#ef4444" } : undefined}
				>
					<RefreshIcon />
					{confirmReset ? t("editor.resetConfirmShort") : t("common.reset")}
				</button>
			</div>

			{/* 标题行:标题居左,复制按钮居右,保持左右对称 */}
			<div className="mb-4 flex items-center justify-between gap-3">
				<h1 className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-50">
					{t("editor.title")}
				</h1>
				<Button
					size="md"
					variant="primary"
					loading={copying}
					onClick={handleCopy}
					className="shrink-0"
				>
					<CopyIcon />
					{copying ? t("editor.copying") : t("editor.copy")}
				</Button>
			</div>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
				{/* 控制面板:Tab 切换 版式 / 图片 / 样式 */}
				<div className="order-2 self-start lg:order-1">
					<div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
						<div
							role="tablist"
							aria-label={t("editor.title")}
							className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800"
						>
							{CONFIG_TABS.map(({ id, labelKey, Icon }) => {
								const active = activeTab === id;
								return (
									<button
										key={id}
										type="button"
										role="tab"
										aria-selected={active}
										onClick={() => setActiveTab(id)}
										className={cn(
											"flex min-w-0 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-xs font-medium transition-colors",
											active
												? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
												: "border-transparent text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
										)}
									>
										<Icon className="shrink-0 text-sm" />
										<span className="truncate">{t(labelKey)}</span>
									</button>
								);
							})}
						</div>
						<div role="tabpanel" className="p-4">
							{activeTab === "layout" && (
								<LayoutSwitcher value={config.layout} onChange={setLayout} />
							)}
							{activeTab === "images" && <ImagePanel />}
							{activeTab === "style" && <StylePanel />}
						</div>
					</div>
				</div>

				{/* 实时预览 */}
				<div className="order-1 self-start lg:sticky lg:top-20 lg:order-2">
					<PreviewPane config={config} />
				</div>
			</div>
		</div>
	);
}
