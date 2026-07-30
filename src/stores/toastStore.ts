import type { ToastMessage } from "../types";

/**
 * Toast Store - 轻量的消息提示,用于"已复制"等场景
 */
import { create } from "zustand";

interface ToastStore {
	messages: ToastMessage[]
	push: (text: string, tone?: ToastMessage["tone"]) => void
	remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
	messages: [],
	push: (text, tone = "info") => {
		const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
		set({ messages: [...get().messages, { id, text, tone }] });
		if (typeof window !== "undefined") {
			window.setTimeout(() => {
				set({ messages: get().messages.filter(item => item.id !== id) });
			}, 2400);
		}
	},
	remove: (id) => {
		set({ messages: get().messages.filter(item => item.id !== id) });
	},
}));
