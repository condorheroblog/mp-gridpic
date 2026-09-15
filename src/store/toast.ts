/**
 * 轻量全局 Toast(自动消失由 ToastViewport 组件处理)
 */
import { nanoid } from "nanoid";
import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
	id: string
	type: ToastType
	message: string
}

interface ToastState {
	toasts: ToastItem[]
	push: (message: string, type?: ToastType) => string
	dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>(set => ({
	toasts: [],
	push: (message, type = "info") => {
		const id = nanoid(8);
		set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
		return id;
	},
	dismiss: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

/** 命令式调用入口(便于在非组件逻辑中反馈) */
export function toast(message: string, type: ToastType = "info") {
	return useToastStore.getState().push(message, type);
}
