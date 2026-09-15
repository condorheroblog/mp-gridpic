import type { ToastItem } from "../store/toast";
import { useEffect } from "react";
import { cn } from "../lib/cn";
import { useToastStore } from "../store/toast";
import { CheckIcon, ImageOffIcon } from "./icons";

const VISIBLE_MS = 2600;

function ToastCard({ toast: item }: { toast: ToastItem }) {
	const dismiss = useToastStore(state => state.dismiss);

	useEffect(() => {
		const timer = window.setTimeout(dismiss, VISIBLE_MS, item.id);
		return () => window.clearTimeout(timer);
	}, [item.id, dismiss]);

	return (
		<div
			role="status"
			className={cn(
				"pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg",
				"animate-slide-up",
				item.type === "success" && "bg-emerald-600",
				item.type === "error" && "bg-red-600",
				item.type === "info" && "bg-zinc-800 dark:bg-zinc-700",
			)}
			onClick={() => dismiss(item.id)}
		>
			{item.type === "success"
				? <CheckIcon className="text-base" />
				: item.type === "error"
					? <ImageOffIcon className="text-base" />
					: null}
			<span>{item.message}</span>
		</div>
	);
}

export function ToastViewport() {
	const toasts = useToastStore(state => state.toasts);

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
			{toasts.map(item => (
				<ToastCard key={item.id} toast={item} />
			))}
		</div>
	);
}
