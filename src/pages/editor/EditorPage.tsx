/**
 * 编辑器页面 - 路由 /editor
 * 与原 App.tsx 行为完全一致:
 *  - 顶部 EditorHeader(语言/主题/复制/回首页)
 *  - 三栏:Canvas(中) + TabsPanel(右)
 *  - ToastContainer 全局
 *  - URL 与 store 双向同步
 */
import { Canvas } from "../../components/editor/canvas/Canvas";
import { TabsPanel } from "../../components/editor/panels/TabsPanel";
import { EditorHeader } from "../../components/shared/EditorHeader";
import { ToastContainer } from "../../components/shared/ToastContainer";
import { useUrlSync } from "../../hooks/useUrlSync";

export function EditorPage() {
	useUrlSync();
	return (
		<div className="min-h-screen bg-zinc-100 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
			<EditorHeader />
			<main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-4">
					<Canvas />
				</div>
				{/* PC 端:aside 固定为视口高度(扣除 EditorHeader),内部内容溢出时独立滚动,不影响浏览器整页滚动。
					 移动端:让 aside 跟随内容自然撑开,使用整页滚动。 */}
				<aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
					<TabsPanel />
				</aside>
			</main>
			<ToastContainer />
		</div>
	);
}
