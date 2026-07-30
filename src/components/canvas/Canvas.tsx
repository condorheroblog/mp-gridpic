/**
 * 画布容器 - 渲染当前版式,模拟公众号正文 678px 宽度
 */
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useDocumentStore } from "../../stores/documentStore";
import { LayoutRenderer } from "../layout/LayoutRenderer";

export function Canvas() {
	const { t } = useTranslation();
	const layout = useDocumentStore(state => state.layout());
	const theme = useDocumentStore(state => state.theme());
	const images = useDocumentStore(state => state.images);
	return (
		<section className="flex flex-col gap-3">
			<header className="flex items-center">
				<span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
					{t(`layout.${layout.kind}`)}
				</span>
			</header>
			<div
				className={clsx(
					"mx-auto w-full max-w-[678px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm",
					"dark:border-zinc-800 dark:bg-zinc-950",
				)}
			>
				<LayoutRenderer kind={layout.kind} images={images} theme={theme} />
			</div>
		</section>
	);
}
