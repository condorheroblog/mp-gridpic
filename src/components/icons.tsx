/**
 * 内联 SVG 图标集(stroke = currentColor,跟随文字颜色)
 */
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export function Base({ children, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.8}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			width="1em"
			height="1em"
			{...props}
		>
			{children}
		</svg>
	);
}

export function LogoIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 64 64" width="1em" height="1em" aria-hidden="true" {...props}>
			<defs>
				<linearGradient id="mp-logo-g" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#6366f1" />
					<stop offset="1" stopColor="#8b5cf6" />
				</linearGradient>
			</defs>
			<rect x="2" y="2" width="60" height="60" rx="14" fill="url(#mp-logo-g)" />
			<rect x="13" y="13" width="16" height="16" rx="4" fill="#fff" />
			<rect x="35" y="13" width="16" height="16" rx="4" fill="#fff" opacity="0.82" />
			<rect x="13" y="35" width="16" height="16" rx="4" fill="#fff" opacity="0.82" />
			<rect x="35" y="35" width="16" height="16" rx="4" fill="#fff" opacity="0.64" />
		</svg>
	);
}

export function SunIcon(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
		</Base>
	);
}

export function MoonIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
		</Base>
	);
}

export function GlobeIcon(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
		</Base>
	);
}

export function GitHubIcon(props: IconProps) {
	return (
		<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
		</svg>
	);
}

export function CopyIcon(props: IconProps) {
	return (
		<Base {...props}>
			<rect x="9" y="9" width="12" height="12" rx="2.5" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		</Base>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M20 6 9 17l-5-5" />
		</Base>
	);
}

export function ShuffleIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
		</Base>
	);
}

export function RefreshIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
		</Base>
	);
}

export function TrashIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
		</Base>
	);
}

export function GripIcon(props: IconProps) {
	return (
		<Base {...props}>
			<circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
			<circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
			<circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
		</Base>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 5v14M5 12h14" />
		</Base>
	);
}

export function ArrowLeftIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M19 12H5M12 19l-7-7 7-7" />
		</Base>
	);
}

export function ArrowRightIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M5 12h14M12 5l7 7-7 7" />
		</Base>
	);
}

export function SparklesIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
		</Base>
	);
}

export function ShieldCheckIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
			<path d="m9 12 2 2 4-4" />
		</Base>
	);
}

export function BoltIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
		</Base>
	);
}

export function LanguagesIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M5 8h7M9 5v3c0 4-3 7-6 8M5 12c0 3 2.5 6 6 7M13 20l4-9 4 9M14.5 16h5" />
		</Base>
	);
}

export function OfflineIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M3 8.5a13 13 0 0 1 18 0M6.5 12a8 8 0 0 1 11 0M9.5 15.5a3.5 3.5 0 0 1 5 0" />
			<circle cx="12" cy="19" r="1" fill="currentColor" />
		</Base>
	);
}

export function SlidersIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
			<circle cx="16" cy="6" r="2" />
			<circle cx="8" cy="12" r="2" />
			<circle cx="18" cy="18" r="2" />
		</Base>
	);
}

export function LinkIcon(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
			<path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
		</Base>
	);
}

export function TemplateIcon(props: IconProps) {
	return (
		<Base {...props}>
			<rect x="3" y="4" width="18" height="7" rx="1.5" />
			<rect x="3" y="13" width="8" height="7" rx="1.5" />
			<rect x="13" y="13" width="8" height="7" rx="1.5" />
		</Base>
	);
}

export function ImageIcon(props: IconProps) {
	return (
		<Base {...props}>
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<circle cx="9" cy="9.5" r="1.5" />
			<path d="m21 16-5-5L5 20" />
		</Base>
	);
}

export function ImageOffIcon(props: IconProps) {
	return (
		<Base {...props}>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<circle cx="9" cy="10" r="1.5" />
			<path d="m21 17-5-5-9 9M3 3l18 18" />
		</Base>
	);
}
