/**
 * 基础 UI - 开关
 */
import clsx from "clsx";

interface SwitchProps {
	checked: boolean
	onChange: (next: boolean) => void
	label?: string
	disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
	return (
		<label className={clsx("inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400", disabled && "opacity-50")}>
			<span
				role="switch"
				tabIndex={0}
				aria-checked={checked}
				onClick={() => !disabled && onChange(!checked)}
				onKeyDown={(event) => {
					if (event.key === " " || event.key === "Enter") {
						event.preventDefault();
						if (!disabled)
							onChange(!checked);
					}
				}}
				className={clsx(
					"relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
					checked ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700",
					disabled && "cursor-not-allowed",
				)}
			>
				<span
					className={clsx(
						"inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
						checked ? "translate-x-4" : "translate-x-0.5",
					)}
				/>
			</span>
			{label !== undefined && <span>{label}</span>}
		</label>
	);
}
