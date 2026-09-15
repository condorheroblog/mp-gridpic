import type { CaptionPosition } from "../../lib/types";
import { useTranslation } from "react-i18next";
import { LIMITS } from "../../lib/constants";
import { useEditorStore } from "../../store/editor";
import { RangeSlider, SegmentedControl, Switch } from "../ui";

export function StylePanel() {
	const { t } = useTranslation();

	const layout = useEditorStore(state => state.layout);
	const gap = useEditorStore(state => state.gap);
	const radius = useEditorStore(state => state.radius);
	const size = useEditorStore(state => state.size);
	const scroller = useEditorStore(state => state.scroller);
	const caption = useEditorStore(state => state.caption);

	const setGap = useEditorStore(state => state.setGap);
	const setRadius = useEditorStore(state => state.setRadius);
	const setSize = useEditorStore(state => state.setSize);
	const patchScroller = useEditorStore(state => state.patchScroller);
	const patchCaption = useEditorStore(state => state.patchCaption);

	const isSwipe = layout === "swipe-h" || layout === "swipe-v";
	const sizeEnabled = layout === "single" || layout === "duo-col";

	const positionOptions = (["above", "below", "overlay-top", "overlay-bottom"] as const).map(
		position => ({
			value: position as CaptionPosition,
			label: t(
				`editor.position${
					position === "above"
						? "Above"
						: position === "below"
							? "Below"
							: position === "overlay-top"
								? "OverlayTop"
								: "OverlayBottom"
				}`,
			),
		}),
	);

	return (
		<>
			<div className="space-y-5">
				<RangeSlider
					label={t("editor.gap")}
					value={gap}
					min={LIMITS.gap.min}
					max={LIMITS.gap.max}
					step={LIMITS.gap.step}
					displayValue={t("editor.unitPx", { value: gap })}
					onValueChange={setGap}
				/>
				<RangeSlider
					label={t("editor.imageRadius")}
					value={radius}
					min={LIMITS.radius.min}
					max={LIMITS.radius.max}
					step={LIMITS.radius.step}
					displayValue={t("editor.unitPx", { value: radius })}
					onValueChange={setRadius}
				/>
				<RangeSlider
					label={t("editor.imageSize")}
					value={size}
					min={LIMITS.size.min}
					max={LIMITS.size.max}
					step={LIMITS.size.step}
					disabled={!sizeEnabled}
					displayValue={t("editor.unitPercent", { value: size })}
					onValueChange={setSize}
				/>
				{isSwipe && (
					<div className="space-y-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40">
						<p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
							{t("editor.sectionScroller")}
						</p>
						<RangeSlider
							label={t("editor.borderWidth")}
							value={scroller.borderWidth}
							min={LIMITS.scrollerBorder.min}
							max={LIMITS.scrollerBorder.max}
							step={LIMITS.scrollerBorder.step}
							displayValue={
								scroller.borderWidth === 0
									? t("editor.noBorder")
									: t("editor.unitPx", { value: scroller.borderWidth })
							}
							onValueChange={value => patchScroller({ borderWidth: value })}
						/>
						<div className="flex items-center justify-between">
							<label
								htmlFor="scroller-border-color"
								className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
							>
								{t("editor.borderColor")}
							</label>
							<input
								id="scroller-border-color"
								type="color"
								className="color-field"
								value={scroller.borderColor}
								onChange={event => patchScroller({ borderColor: event.target.value })}
							/>
						</div>
						<RangeSlider
							label={t("editor.scrollerRadius")}
							value={scroller.radius}
							min={LIMITS.scrollerRadius.min}
							max={LIMITS.scrollerRadius.max}
							step={LIMITS.scrollerRadius.step}
							displayValue={t("editor.unitPx", { value: scroller.radius })}
							onValueChange={value => patchScroller({ radius: value })}
						/>
						<RangeSlider
							label={t("editor.scrollerPadding")}
							value={scroller.padding}
							min={LIMITS.scrollerPadding.min}
							max={LIMITS.scrollerPadding.max}
							step={LIMITS.scrollerPadding.step}
							displayValue={t("editor.unitPx", { value: scroller.padding })}
							onValueChange={value => patchScroller({ padding: value })}
						/>
						{layout === "swipe-h" && (
							<Switch
								checked={scroller.fullBleed}
								onCheckedChange={fullBleed => patchScroller({ fullBleed })}
								label={t("editor.fullBleed")}
							/>
						)}
						{layout === "swipe-v" && (
							<RangeSlider
								label={t("editor.scrollerHeight")}
								value={scroller.height}
								min={LIMITS.scrollerHeight.min}
								max={LIMITS.scrollerHeight.max}
								step={LIMITS.scrollerHeight.step}
								displayValue={t("editor.unitPx", { value: scroller.height })}
								onValueChange={value => patchScroller({ height: value })}
							/>
						)}
					</div>
				)}
			</div>

			<div className="mt-6 space-y-4 border-t border-zinc-100 pt-5 dark:border-zinc-800">
				<p className="text-[11px] font-semibold text-zinc-500">{t("editor.sectionCaption")}</p>
				<Switch
					checked={caption.visible}
					onCheckedChange={visible => patchCaption({ visible })}
					label={t("editor.captionVisible")}
				/>
				{caption.visible && (
					<>
						<SegmentedControl
							value={caption.position}
							onValueChange={position => patchCaption({ position })}
							options={positionOptions}
						/>
						<RangeSlider
							label={t("editor.captionFontSize")}
							value={caption.fontSize}
							min={LIMITS.captionFontSize.min}
							max={LIMITS.captionFontSize.max}
							step={LIMITS.captionFontSize.step}
							displayValue={t("editor.unitPx", { value: caption.fontSize })}
							onValueChange={value => patchCaption({ fontSize: value })}
						/>
						{(caption.position === "below" || caption.position === "above") && (
							<div className="flex items-center justify-between">
								<label
									htmlFor="caption-color"
									className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
								>
									{t("editor.captionColor")}
								</label>
								<input
									id="caption-color"
									type="color"
									className="color-field"
									value={caption.color}
									onChange={event => patchCaption({ color: event.target.value })}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}
