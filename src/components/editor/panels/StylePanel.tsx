import type { CaptionPosition, StyleTheme } from "../../types";

/**
 * 样式面板 - 选择预设 + 自定义参数
 * 包含:边距、间距、圆角、滑动区参数、外层卡片样式、图片说明样式
 */
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { STYLE_PRESETS } from "../../data/styles";
import { useDocumentStore } from "../../stores/documentStore";
import { Button } from "../ui/Button";
import { ColorPicker, NumberSlider } from "../ui/Field";

const CAPTION_POSITIONS: CaptionPosition[] = ["above", "below", "hidden"];

export function StylePanel() {
	const { t } = useTranslation();
	const styleId = useDocumentStore(state => state.styleId);
	const setStyle = useDocumentStore(state => state.setStyle);
	const theme = useDocumentStore(state => state.theme());
	const updateTheme = useDocumentStore(state => state.updateTheme);
	const reset = useDocumentStore(state => state.resetThemeToPreset);
	const layoutKind = useDocumentStore(state => state.layout().kind);
	const isHScroll = layoutKind === "hscroll";

	const handleUpdate = (patch: Partial<StyleTheme>) => updateTheme(patch);

	return (
		<section className="flex flex-col gap-3">
			<header className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("style.title")}</h2>
				<Button variant="ghost" onClick={reset}>{t("style.reset")}</Button>
			</header>
			<div className="grid grid-cols-3 gap-2">
				{STYLE_PRESETS.map(preset => (
					<button
						key={preset.id}
						type="button"
						onClick={() => setStyle(preset.id)}
						className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
							styleId === preset.id
								? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
								: "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
						}`}
					>
						{t(preset.nameKey)}
					</button>
				))}
			</div>
			{/* 图片基础参数 */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<NumberSlider
					label={t("style.containerPadding")}
					suffix="px"
					min={0}
					max={48}
					value={theme.containerPadding}
					onChange={n => handleUpdate({ containerPadding: n })}
				/>
				<NumberSlider
					label={t("style.gap")}
					suffix="px"
					min={0}
					max={48}
					value={theme.gap}
					onChange={n => handleUpdate({ gap: n })}
				/>
				<NumberSlider
					label={t("style.borderRadius")}
					suffix="px"
					min={0}
					max={48}
					value={theme.borderRadius}
					onChange={n => handleUpdate({ borderRadius: n })}
				/>
				<NumberSlider
					label={t("style.scrollHeight")}
					suffix="px"
					min={160}
					max={640}
					value={theme.scrollHeight}
					onChange={n => handleUpdate({ scrollHeight: n })}
				/>
				{/* itemRatio 仅对横向滚动版式生效:1 = 一图一屏,<1 时形成横向滚动 */}
				{isHScroll && (
					<NumberSlider
						label={t("style.itemRatio")}
						step={0.1}
						min={0.5}
						max={1}
						value={theme.itemRatio}
						onChange={n => handleUpdate({ itemRatio: n })}
					/>
				)}
			</div>
			{/* 预览卡片样式 - 导出时会一并写入剪贴板 */}
			<div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
				<span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
					{t("style.cardSection")}
				</span>
				<NumberSlider
					label={t("style.cardPadding")}
					suffix="px"
					min={0}
					max={64}
					value={theme.cardPadding}
					onChange={n => handleUpdate({ cardPadding: n })}
				/>
				<NumberSlider
					label={t("style.cardRadius")}
					suffix="px"
					min={0}
					max={48}
					value={theme.cardRadius}
					onChange={n => handleUpdate({ cardRadius: n })}
				/>
				<ColorPicker
					label={t("style.cardBorderColor")}
					value={theme.cardBorderColor}
					onChange={cardBorderColor => handleUpdate({ cardBorderColor })}
				/>
				<ColorPicker
					label={t("style.cardBackground")}
					value={theme.cardBackground}
					onChange={cardBackground => handleUpdate({ cardBackground })}
				/>
			</div>
			{/* 图片说明样式 */}
			<div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
				<span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
					{t("style.captionSection")}
				</span>
				<NumberSlider
					label={t("style.captionFontSize")}
					suffix="px"
					min={10}
					max={24}
					value={theme.captionFontSize}
					onChange={n => handleUpdate({ captionFontSize: n })}
				/>
				<ColorPicker
					label={t("style.captionColor")}
					value={theme.captionColor}
					onChange={captionColor => handleUpdate({ captionColor })}
				/>
				<div>
					<span className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
						{t("style.captionPositionLabel")}
					</span>
					<div className="flex gap-1 rounded-lg bg-zinc-100 p-1 text-xs dark:bg-zinc-800/60">
						{CAPTION_POSITIONS.map((key) => {
							const selected = theme.captionPosition === key;
							return (
								<button
									key={key}
									type="button"
									onClick={() => handleUpdate({ captionPosition: key })}
									aria-pressed={selected}
									className={clsx(
										"flex-1 rounded-md px-2 py-1 text-center transition-colors",
										selected
											? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
											: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
									)}
								>
									{t(`images.captionPosition.${key}`)}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
