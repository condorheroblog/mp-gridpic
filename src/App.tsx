/**
 * App 根组件 - 三栏布局(预览 / 编辑面板)
 * 移动端退化为单列;PC 端编辑面板在超出视口高度时内部滚动,避免触发浏览器整页滚动。
 */
import { Canvas } from "./components/canvas/Canvas";
import { TopBar } from "./components/layout/TopBar";
import { TabsPanel } from "./components/panels/TabsPanel";
import { ToastContainer } from "./components/ui/ToastContainer";
import { useUrlSync } from "./hooks/useUrlSync";

export default function App() {
	// 把当前版式/样式同步到 URL query,支持通过链接分享当前画布
	useUrlSync();
	return (
		<div className="min-h-screen bg-zinc-100 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
			<TopBar />
			<main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_360px]">
				<div className="flex flex-col gap-4">
					<Canvas />
				</div>
				{/* PC 端:aside 固定为视口高度(扣除 TopBar),内部内容溢出时独立滚动,不影响浏览器整页滚动。
					 移动端:让 aside 跟随内容自然撑开,使用整页滚动。 */}
				<aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
					<TabsPanel />
				</aside>
			</main>
			<ToastContainer />
		</div>
	);
}
