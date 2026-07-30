/**
 * 基础 UI - 数字滑块 + 输入框
 */
import clsx from "clsx";

interface NumberSliderProps {
	value: number
	min: number
	max: number
	step?: number
	onChange: (next: number) => void
	disabled?: boolean
	label?: string
	suffix?: string
}

export function NumberSlider({ value, min, max, step = 1, onChange, disabled, label, suffix }: NumberSliderProps) {
	return (
		<label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
			{label !== undefined && (
				<span className="flex items-center justify-between">
					<span>{label}</span>
					<span className="font-mono text-zinc-700 dark:text-zinc-200">
						{value}
						{suffix ?? ""}
					</span>
				</span>
			)}
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				disabled={disabled}
				onChange={event => onChange(Number(event.currentTarget.value))}
				className="accent-indigo-500 disabled:opacity-50"
			/>
		</label>
	);
}

interface TextInputProps {
	value: string
	onChange: (next: string) => void
	placeholder?: string
	label?: string
	disabled?: boolean
	className?: string
	type?: "text" | "url"
}

export function TextInput({ value, onChange, placeholder, label, disabled, className, type = "text" }: TextInputProps) {
	return (
		<label className={clsx("flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400", className)}>
			{label !== undefined && <span>{label}</span>}
			<input
				type={type}
				value={value}
				placeholder={placeholder}
				disabled={disabled}
				onChange={event => onChange(event.currentTarget.value)}
				className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			/>
		</label>
	);
}
