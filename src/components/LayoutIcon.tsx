/**
 * 版式缩略图标:用小方块示意图片排列方式
 */
import type { LayoutId } from "../lib/types";
import type { IconProps } from "./icons";
import { Base } from "./icons";

export function LayoutIcon({ layout, ...props }: IconProps & { layout: LayoutId }) {
	switch (layout) {
		case "single":
			return (
				<Base {...props}>
					<rect x="4" y="6" width="16" height="12" rx="1.5" />
				</Base>
			);
		case "duo-row":
			return (
				<Base {...props}>
					<rect x="3.5" y="6" width="8" height="12" rx="1.5" />
					<rect x="12.5" y="6" width="8" height="12" rx="1.5" />
				</Base>
			);
		case "duo-col":
			return (
				<Base {...props}>
					<rect x="4" y="3.5" width="16" height="7.5" rx="1.5" />
					<rect x="4" y="13" width="16" height="7.5" rx="1.5" />
				</Base>
			);
		case "grid-2":
			return (
				<Base {...props}>
					<rect x="3.5" y="3.5" width="8" height="8" rx="1.5" />
					<rect x="12.5" y="3.5" width="8" height="8" rx="1.5" />
					<rect x="3.5" y="12.5" width="8" height="8" rx="1.5" />
					<rect x="12.5" y="12.5" width="8" height="8" rx="1.5" />
				</Base>
			);
		case "tri-top":
			// 上一下二:顶部一张通栏,底部两张方图
			return (
				<Base {...props}>
					<rect x="3.5" y="3.5" width="17" height="7.5" rx="1.2" />
					<rect x="3.5" y="13" width="8.2" height="7.5" rx="1.2" />
					<rect x="12.3" y="13" width="8.2" height="7.5" rx="1.2" />
				</Base>
			);
		case "tri-bottom":
			// 下二上一:顶部两张方图,底部一张通栏
			return (
				<Base {...props}>
					<rect x="3.5" y="3.5" width="8.2" height="7.5" rx="1.2" />
					<rect x="12.3" y="3.5" width="8.2" height="7.5" rx="1.2" />
					<rect x="3.5" y="13" width="17" height="7.5" rx="1.2" />
				</Base>
			);
		case "tri-left":
			// 左一右二:左侧一张通栏竖图,右侧两张方图
			return (
				<Base {...props}>
					<rect x="3.5" y="3.5" width="8.2" height="17" rx="1.2" />
					<rect x="12.3" y="3.5" width="8.2" height="8.2" rx="1.2" />
					<rect x="12.3" y="12.3" width="8.2" height="8.2" rx="1.2" />
				</Base>
			);
		case "tri-right":
			// 左二右一:左侧两张方图,右侧一张通栏竖图
			return (
				<Base {...props}>
					<rect x="3.5" y="3.5" width="8.2" height="8.2" rx="1.2" />
					<rect x="3.5" y="12.3" width="8.2" height="8.2" rx="1.2" />
					<rect x="12.3" y="3.5" width="8.2" height="17" rx="1.2" />
				</Base>
			);
		case "grid-3":
			// 三宫格:3×3 小方形
			return (
				<Base {...props}>
					{[3.5, 9.5, 15.5].map(y =>
						[3.5, 9.5, 15.5].map(x => (
							<rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1.1" />
						)),
					)}
				</Base>
			);
		case "grid-4":
			// 四宫格:4×4 小方形
			return (
				<Base {...props}>
					{[3.5, 8, 12.5, 17].map(y =>
						[3.5, 8, 12.5, 17].map(x => (
							<rect key={`${x}-${y}`} x={x} y={y} width="3.6" height="3.6" rx="0.9" />
						)),
					)}
				</Base>
			);
		case "swipe-h":
			return (
				<Base {...props}>
					<path d="M4 12H2M22 12h-2" />
					<path d="m5.5 9-2 3 2 3M18.5 9l2 3-2 3" />
					<rect x="8" y="6" width="8" height="12" rx="1.5" />
				</Base>
			);
		case "swipe-v":
			return (
				<Base {...props}>
					<path d="M12 4V2M12 22v-2" />
					<path d="m9 5.5 3-2 3 2M9 18.5l3 2 3-2" />
					<rect x="4" y="8" width="16" height="8" rx="1.5" />
				</Base>
			);
	}
}
