/**
 * 编辑面板容器 - 顶部 Tab + 下方渲染当前分类
 * 将原来的 4 个分类面板收纳到 Tab 中,减少右侧栏纵向高度
 * PC 端 Tab 栏固定,下方面板在父容器内独立滚动;移动端跟随整页滚动。
 */
import clsx from "clsx";
import { useState } from "react";

import { useTranslation } from "react-i18next";
import { ImagesPanel } from "./ImagesPanel";
import { LayoutPanel } from "./LayoutPanel";
import { StylePanel } from "./StylePanel";
import { TemplatesPanel } from "./TemplatesPanel";

// Tab 顺序与分类,key 复用 i18n nav.* 文本
type TabKey = "layout" | "images" | "style" | "templates";

const TAB_ORDER: TabKey[] = ["layout", "images", "style", "templates"];

export function TabsPanel() {
	const { t } = useTranslation();
	const [active, setActive] = useState<TabKey>("layout");

	return (
		<section className="flex min-h-0 flex-1 flex-col gap-3">
			{/* Tab 栏 - 在窄列中保持等宽可点 */}
			<div
				role="tablist"
				aria-label={t("app.title")}
				className="flex shrink-0 gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-800/60"
			>
				{TAB_ORDER.map((key) => {
					const selected = key === active;
					return (
						<button
							key={key}
							role="tab"
							type="button"
							aria-selected={selected}
							onClick={() => setActive(key)}
							className={clsx(
								"flex-1 rounded-md px-2 py-1.5 text-center font-medium transition-colors",
								"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
								selected
									? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
									: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
							)}
						>
							{t(`nav.${key}`)}
						</button>
					);
				})}
			</div>
			{/* 当前 Tab 对应的面板 - PC 端在父容器内独立滚动,移动端跟随整页滚动 */}
			<div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto lg:overflow-y-auto">
				{active === "layout" && <LayoutPanel />}
				{active === "images" && <ImagesPanel />}
				{active === "style" && <StylePanel />}
				{active === "templates" && <TemplatesPanel />}
			</div>
		</section>
	);
}
