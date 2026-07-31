/**
 * 顶栏通用图标 - 全部基于 stroke 风格,使用 currentColor 适配深浅模式。
 *
 * 与 LayoutIcon 一样使用 24x24 viewBox,但线条偏细 (1.5/1.75) 让 16~20px
 * 尺寸下视觉密度更接近 Heroicons / Lucide,避免按钮内过粗。
 */
interface IconProps {
	className?: string
}

const ROOT_CLASS = "inline-block align-middle shrink-0";

export function PenIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<path
				d="M16.862 4.487 18.55 2.799a2.121 2.121 0 1 1 3 3L19.86 7.487"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19 8 8 19l-4 1 1-4L18 3"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M14 5l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function CopyIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<rect
				x="9"
				y="9"
				width="11"
				height="11"
				rx="2"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 15V6a2 2 0 0 1 2-2h9"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function HomeIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<path
				d="M3 11.5 12 4l9 7.5"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 10.5V19a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-8.5"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function GitHubIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.475 2 2 6.475 2 12c0 4.425 2.862 8.166 6.838 9.487.5.087.687-.213.687-.476 0-.237-.012-1.025-.012-1.862-2.513.462-3.163-.612-3.363-1.175-.112-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.012 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.112-4.55-4.937 0-1.088.387-1.987 1.025-2.687-.1-.25-.45-1.275.1-2.65 0 0 .837-.263 2.75 1.025a9.28 9.28 0 0 1 2.5-.337c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.025 2.75-1.025.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.687-4.562 4.937.362.313.675.913.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .263.188.575.688.475A10.02 10.02 0 0 0 22 12c0-5.525-4.475-10-10-10Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function SunIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function MoonIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${ROOT_CLASS} ${className ?? "h-4 w-4"}`}
			aria-hidden
		>
			<path
				d="M20.354 14.354A8 8 0 0 1 9.646 3.646 8.001 8.001 0 1 0 20.354 14.354Z"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
