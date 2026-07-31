/**
 * 网格版式 - 通过列数切分等宽图片
 */
import type { CSSProperties } from "react";

import type { ImageItem, StyleTheme } from "../../../types";
import { chunkItems, getColumnSpacing } from "../../../lib/layoutUtils";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
	columns: number
}

export function GridLayout({ images, theme, columns }: LayoutProps) {
	const rows = chunkItems(images, columns);
	const rowStyle: CSSProperties = {
		fontSize: 0,
		lineHeight: 0,
		marginTop: `${theme.gap}px`,
	};
	const cellStyle = (index: number): CSSProperties => {
		const spacing = getColumnSpacing(index, columns, theme.gap);
		return {
			display: "inline-block",
			verticalAlign: "top",
			width: `${(100 / columns).toFixed(4)}%`,
			paddingLeft: `${spacing.left}px`,
			paddingRight: `${spacing.right}px`,
			boxSizing: "border-box",
		};
	};
	const emptyCellStyle = (index: number): CSSProperties => ({
		...cellStyle(index),
		minHeight: "1px",
	});
	return (
		<section>
			{rows.map((row, rowIndex) => {
				const rowKey = row.map(image => image.id).join("-");
				const cells: Array<{ key: string, image: ImageItem | null }> = row.map(image => ({
					key: image.id,
					image,
				}));
				while (cells.length < columns) {
					cells.push({
						key: `empty-${rowKey || "row"}-${columns - cells.length}`,
						image: null,
					});
				}
				return (
				// 用补齐空列的方式保持每一行列宽稳定,效果更接近公众号编辑器。
					<section
						key={rowKey || `empty-row-${columns}`}
						style={{ ...rowStyle, marginTop: rowIndex === 0 ? 0 : `${theme.gap}px` }}
					>
						{cells.map((cell, columnIndex) => (
							<section
								key={cell.key}
								style={cell.image ? cellStyle(columnIndex) : emptyCellStyle(columnIndex)}
							>
								{cell.image ? <ImageBlock image={cell.image} theme={theme} /> : null}
							</section>
						))}
					</section>
				);
			})}
		</section>
	);
}
