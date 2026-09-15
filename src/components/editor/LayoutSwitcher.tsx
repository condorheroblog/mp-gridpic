import type { LayoutGroup, LayoutId } from "../../lib/types";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { LAYOUTS } from "../../lib/constants";
import { LayoutIcon } from "../LayoutIcon";

interface LayoutSwitcherProps {
	value: LayoutId
	onChange: (layout: LayoutId) => void
}

const GROUP_ORDER: LayoutGroup[] = ["scroll", "basic", "tri", "grid"];

export function LayoutSwitcher({ value, onChange }: LayoutSwitcherProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-3">
			{GROUP_ORDER.map(group => (
				<div key={group}>
					<p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
						{t(`editor.layoutGroup${group[0].toUpperCase()}${group.slice(1)}`)}
					</p>
					<div className="grid grid-cols-4 gap-1.5">
						{LAYOUTS.filter(meta => meta.group === group).map(meta => (
							<button
								key={meta.id}
								type="button"
								aria-pressed={value === meta.id}
								onClick={() => onChange(meta.id)}
								className={cn(
									"flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-medium transition-all active:scale-95",
									value === meta.id
										? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
										: "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
								)}
							>
								<LayoutIcon layout={meta.id} className="text-xl" />
								{t(`editor.layout.${meta.id}`)}
							</button>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
