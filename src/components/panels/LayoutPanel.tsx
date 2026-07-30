import type { LayoutKind } from "../../types";
/**
 * 版式面板 - 选择版式 + 显示描述
 */
import clsx from "clsx";

import { useTranslation } from "react-i18next";
import { LAYOUT_PRESETS } from "../../data/layouts";
import { useDocumentStore } from "../../stores/documentStore";

const ICONS: Record<LayoutKind, string> = {
	"single": "▭",
	"double-row": "▭▭",
	"double-col": "▤",
	"triple-pyramid": "△",
	"grid-2": "▦²",
	"grid-3": "▦³",
	"grid-4": "▦⁴",
	"waterfall": "≣",
	"hscroll": "→",
	"vscroll": "↓",
};

export function LayoutPanel() {
	const { t } = useTranslation();
	const layoutId = useDocumentStore(state => state.layoutId);
	const setLayout = useDocumentStore(state => state.setLayout);
	const currentKind = useDocumentStore(state => state.layout().kind);
	const descKey = `layout.desc.${currentKind}`;
	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("nav.layout")}</h2>
			<div className="grid grid-cols-2 gap-2">
				{LAYOUT_PRESETS.map((preset) => {
					const active = preset.id === layoutId;
					return (
						<button
							key={preset.id}
							type="button"
							onClick={() => setLayout(preset.id)}
							className={clsx(
								"flex flex-col items-start gap-1 rounded-lg border p-2 text-left text-sm transition-colors",
								active
									? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
									: "border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/60",
							)}
						>
							<span className="text-base">{ICONS[preset.kind]}</span>
							<span className="font-medium">{t(`layout.${preset.kind}`)}</span>
							<span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t(`layout.desc.${preset.kind}`)}</span>
						</button>
					);
				})}
			</div>
			<p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{t(descKey)}</p>
		</section>
	);
}
