import type { EditorConfig } from "../../lib/types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { renderInlineHtml } from "../../lib/renderInlineHtml";
import { validateArticleHtml } from "../../lib/validate";
import { HtmlFragment } from "../HtmlFragment";
import { ShieldCheckIcon } from "../icons";

interface PreviewPaneProps {
	config: EditorConfig
}

export function PreviewPane({ config }: PreviewPaneProps) {
	const { t } = useTranslation();
	const html = useMemo(() => renderInlineHtml(config), [config]);
	const validation = useMemo(() => validateArticleHtml(html), [html]);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
						{t("editor.preview")}
					</h2>
					<p className="text-[11px] text-zinc-500">{t("editor.previewDesc")}</p>
				</div>
				<span
					className={cn(
						"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
						validation.valid
							? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
							: "bg-red-50 text-red-600 dark:bg-red-950/50",
					)}
				>
					<ShieldCheckIcon className="text-xs" />
					{validation.valid ? t("editor.validationOk") : t("editor.validationFail")}
				</span>
			</div>

			<div className="article-surface overflow-hidden rounded-2xl shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-200 dark:ring-zinc-800">
				<div className="border-b border-zinc-100 px-5 py-2.5">
					<span className="text-[11px] font-medium text-zinc-400">
						{t("editor.articleSurface")}
					</span>
				</div>
				<div className="p-4 sm:p-6">
					<HtmlFragment html={html} animationKey={config.layout} />
				</div>
			</div>
		</div>
	);
}
