/**
 * Toast 容器 - 渲染来自 toastStore 的消息队列
 */
import clsx from "clsx";

import { useToastStore } from "../../stores/toastStore";

export function ToastContainer() {
	const messages = useToastStore(state => state.messages);
	const remove = useToastStore(state => state.remove);
	return (
		<div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2">
			{messages.map(item => (
				<button
					key={item.id}
					type="button"
					className={clsx(
						"pointer-events-auto rounded-lg px-3 py-2 text-sm shadow-lg ring-1",
						item.tone === "success" && "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700",
						item.tone === "error" && "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-700",
						item.tone === "info" && "bg-zinc-50 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
					)}
					onClick={() => remove(item.id)}
				>
					{item.text}
				</button>
			))}
		</div>
	);
}
