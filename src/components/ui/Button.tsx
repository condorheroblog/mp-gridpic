/**
 * 基础 UI - 按钮
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	icon?: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm disabled:bg-indigo-300",
	secondary: "bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 disabled:opacity-60",
	ghost: "bg-transparent hover:bg-zinc-200/60 text-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/60",
	danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm disabled:bg-rose-300",
};

export function Button({ variant = "secondary", icon, className, children, ...rest }: ButtonProps) {
	return (
		<button
			type="button"
			className={clsx(
				"inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
				"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
				"disabled:cursor-not-allowed",
				VARIANT_CLASSES[variant],
				className,
			)}
			{...rest}
		>
			{icon}
			{children}
		</button>
	);
}
