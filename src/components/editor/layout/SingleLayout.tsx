/**
 * 单图版式
 */
import type { ImageItem, StyleTheme } from "../../../types";
import { ImageBlock } from "./ImageBlock";

interface LayoutProps {
	images: ImageItem[]
	theme: StyleTheme
}

export function SingleLayout({ images, theme }: LayoutProps) {
	const first = images[0];
	if (!first)
		return null;
	return (
		<section style={{ margin: "0 auto", width: "100%", maxWidth: 600 }}>
			<ImageBlock
				image={first}
				theme={theme}
				imageStyle={{ width: "100%" }}
			/>
		</section>
	);
}
