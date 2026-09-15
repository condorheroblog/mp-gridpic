/**
 * 无样式依赖的基础 UI 组件(配合 Tailwind 工具类使用)
 */
import type {
	ButtonHTMLAttributes,
	InputHTMLAttributes,
	ReactNode,
} from "react";
import { useId } from "react";
import { cn } from "../lib/cn";

/* -------------------------------- Button -------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
	primary:
		"bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-500 active:bg-indigo-700",
	secondary:
		"bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800",
	ghost:
		"text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800",
	danger:
		"text-red-600 ring-1 ring-red-200 hover:bg-red-50 dark:text-red-400 dark:ring-red-900/60 dark:hover:bg-red-950/40",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
	sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
	md: "h-10 gap-2 rounded-xl px-4 text-sm",
	lg: "h-12 gap-2 rounded-xl px-6 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	size?: ButtonSize
	loading?: boolean
}

export function Button({
	variant = "secondary",
	size = "md",
	loading = false,
	className,
	disabled,
	children,
	...rest
}: ButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled || loading}
			className={cn(
				"inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50",
				VARIANT_CLASS[variant],
				SIZE_CLASS[size],
				className,
			)}
			{...rest}
		>
			{loading && (
				<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
			)}
			{children}
		</button>
	);
}

/* ------------------------------ IconButton ------------------------------ */

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	label: string
	active?: boolean
}

export function IconButton({ label, active, className, children, ...rest }: IconButtonProps) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			aria-pressed={active}
			className={cn(
				"inline-flex size-9 items-center justify-center rounded-lg text-lg transition-colors",
				"text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-500",
				"dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
				active
					&& "bg-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300",
				className,
			)}
			{...rest}
		>
			{children}
		</button>
	);
}

/* -------------------------------- Field -------------------------------- */

interface FieldProps {
	label: string
	htmlFor?: string
	hint?: ReactNode
	error?: string
	children: ReactNode
	className?: string
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<div className="flex items-baseline justify-between gap-2">
				<label
					htmlFor={htmlFor}
					className="text-xs font-medium text-zinc-600 dark:text-zinc-300"
				>
					{label}
				</label>
				{hint && !error && <span className="text-[11px] text-zinc-400">{hint}</span>}
			</div>
			{children}
			{error && <p className="text-[11px] text-red-500">{error}</p>}
		</div>
	);
}

/* ------------------------------- TextInput ------------------------------ */

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean
}

export function TextInput({ invalid, className, ...rest }: TextInputProps) {
	return (
		<input
			className={cn(
				"h-10 w-full rounded-xl border bg-white px-3 text-sm text-zinc-900 outline-none transition-colors",
				"placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
				"dark:bg-zinc-900 dark:text-zinc-100",
				invalid
					? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
					: "border-zinc-200 dark:border-zinc-700",
				className,
			)}
			{...rest}
		/>
	);
}

/* ------------------------------ RangeSlider ----------------------------- */

interface RangeSliderProps {
	label: string
	value: number
	min: number
	max: number
	step?: number
	onValueChange: (value: number) => void
	displayValue?: string
	disabled?: boolean
}

export function RangeSlider({
	label,
	value,
	min,
	max,
	step = 1,
	onValueChange,
	displayValue,
	disabled,
}: RangeSliderProps) {
	const id = useId();
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<label htmlFor={id} className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
					{label}
				</label>
				<span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
					{displayValue ?? value}
				</span>
			</div>
			<input
				id={id}
				type="range"
				className="range"
				value={value}
				min={min}
				max={max}
				step={step}
				disabled={disabled}
				onChange={event => onValueChange(Number(event.target.value))}
			/>
		</div>
	);
}

/* -------------------------------- Switch -------------------------------- */

interface SwitchProps {
	checked: boolean
	onCheckedChange: (checked: boolean) => void
	label: string
	id?: string
}

export function Switch({ checked, onCheckedChange, label, id }: SwitchProps) {
	const autoId = useId();
	const switchId = id ?? autoId;
	return (
		<div className="flex items-center justify-between">
			<label htmlFor={switchId} className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
				{label}
			</label>
			<button
				id={switchId}
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onCheckedChange(!checked)}
				className={cn(
					"relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
					checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700",
				)}
			>
				<span
					className={cn(
						"absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200",
						checked ? "translate-x-5" : "translate-x-0",
					)}
				/>
			</button>
		</div>
	);
}

/* --------------------------- SegmentedControl --------------------------- */

interface SegmentedOption<T extends string> {
	value: T
	label: ReactNode
	title?: string
}

interface SegmentedProps<T extends string> {
	options: SegmentedOption<T>[]
	value: T
	onValueChange: (value: T) => void
	className?: string
}

export function SegmentedControl<T extends string>({
	options,
	value,
	onValueChange,
	className,
}: SegmentedProps<T>) {
	return (
		<div
			role="radiogroup"
			className={cn(
				"flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900",
				className,
			)}
		>
			{options.map(option => (
				<button
					key={option.value}
					type="button"
					role="radio"
					title={option.title}
					aria-checked={option.value === value}
					onClick={() => onValueChange(option.value)}
					className={cn(
						"flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
						option.value === value
							? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-300"
							: "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

/* ----------------------------- SectionCard ------------------------------ */

interface SectionCardProps {
	title: string
	icon?: ReactNode
	children: ReactNode
	action?: ReactNode
}

export function SectionCard({ title, icon, children, action }: SectionCardProps) {
	return (
		<section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
			<header className="flex items-center justify-between">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
					{icon && <span className="text-base text-indigo-500">{icon}</span>}
					{title}
				</h3>
				{action}
			</header>
			{children}
		</section>
	);
}
