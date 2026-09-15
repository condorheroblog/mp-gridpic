import type { EditorConfig, LayoutId, PicItem } from "./types";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "./constants";
import {
	escapeHtml,
	renderInlineHtml,
	renderPlainText,
	selectLayoutImages,
} from "./renderInlineHtml";
import { validateArticleHtml } from "./validate";

function makeImages(count: number): PicItem[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `pic-${i + 1}`,
		seed: `seed-${i + 1}`,
		src: `https://picsum.photos/seed/seed-${i + 1}/600/600`,
		caption: `图片 ${i + 1}`,
	}));
}

function makeConfig(overrides: Partial<EditorConfig> = {}): EditorConfig {
	return {
		...DEFAULT_CONFIG,
		// 默认造足 16 张,覆盖四宫格的固定上限
		images: makeImages(16),
		...overrides,
		scroller: { ...DEFAULT_CONFIG.scroller, ...overrides.scroller },
		caption: { ...DEFAULT_CONFIG.caption, ...overrides.caption },
	};
}

const ALL_LAYOUTS: LayoutId[] = [
	"single",
	"duo-row",
	"duo-col",
	"tri-top",
	"tri-bottom",
	"tri-left",
	"tri-right",
	"grid-2",
	"grid-3",
	"grid-4",
	"swipe-h",
	"swipe-v",
];

describe("renderInlineHtml —— 公众号编辑器规范合规性", () => {
	it("全部 12 种版式均通过本地规范预检", () => {
		for (const layout of ALL_LAYOUTS) {
			const result = validateArticleHtml(renderInlineHtml(makeConfig({ layout })));
			expect(result.valid, `${layout}: ${result.issues.map(i => i.message).join("; ")}`).toBe(true);
		}
	});

	it("所有版式都不出现固定 px 宽度(规范 1.4)", () => {
		for (const layout of ALL_LAYOUTS) {
			const html = renderInlineHtml(makeConfig({ layout }));
			expect(html).not.toMatch(/width\s*:\s*\d+px/);
		}
	});

	it("所有 <img> 都带 data-w 原始宽度(规范 1.4.3)", () => {
		const html = renderInlineHtml(makeConfig({ layout: "grid-3" }));
		const imgCount = (html.match(/<img /g) || []).length;
		expect(imgCount).toBe(9);
		expect((html.match(/data-w="\d+"/g) || []).length).toBe(imgCount);
	});

	it("不使用 !important / font-family / <pre> / opacity:0", () => {
		const html = renderInlineHtml(makeConfig({ layout: "grid-2" }));
		expect(html).not.toMatch(/!important/);
		expect(html).not.toMatch(/font-family/);
		expect(html).not.toMatch(/<pre/);
		expect(html).not.toMatch(/opacity\s*:\s*0(?!\.\d)/);
	});

	it("嵌套层级远低于 10 层上限(规范 2.1)", () => {
		const html = renderInlineHtml(makeConfig({ layout: "swipe-h" }));
		let depth = 0;
		let maxDepth = 0;
		for (const match of html.matchAll(/<\/?section/g)) {
			if (match[0] === "<section") {
				depth++;
				maxDepth = Math.max(maxDepth, depth);
			}
			else {
				depth--;
			}
		}
		expect(maxDepth).toBeLessThanOrEqual(5);
	});
});

describe("renderInlineHtml —— 各版式结构", () => {
	it("single 只渲染第 1 张图,宽度跟随 size 百分比", () => {
		const html = renderInlineHtml(makeConfig({ layout: "single", size: 80 }));
		expect((html.match(/<img /g) || []).length).toBe(1);
		expect(html).toContain("width:80%");
		expect(selectLayoutImages(makeConfig({ layout: "single" }))).toHaveLength(1);
	});

	it("duo-row 横排两张图,使用 flex 等分", () => {
		const html = renderInlineHtml(makeConfig({ layout: "duo-row" }));
		expect((html.match(/<img /g) || []).length).toBe(2);
		expect(html).toContain("flex-direction:row");
		expect(html).toContain("flex:1 1 0%");
	});

	it("duo-col 竖排两张图", () => {
		const html = renderInlineHtml(makeConfig({ layout: "duo-col" }));
		expect((html.match(/<img /g) || []).length).toBe(2);
		expect(html).toContain("flex-direction:column");
	});

	it("grid-3 使用 calc 计算三等分列宽", () => {
		const config = makeConfig({ layout: "grid-3", gap: 9 });
		const html = renderInlineHtml(config);
		expect(html).toContain("width:calc((100% - 18px) / 3)");
		expect(html).toContain("flex-wrap:wrap");
	});

	it("grid-2 / grid-4 分别渲染为 2 列与 4 列网格", () => {
		expect(renderInlineHtml(makeConfig({ layout: "grid-2", gap: 0 }))).toContain("(100% - 0px) / 2");
		expect(renderInlineHtml(makeConfig({ layout: "grid-4", gap: 0 }))).toContain("(100% - 0px) / 4");
	});
});

describe("renderInlineHtml —— 固定张数版式(宫格/三图)", () => {
	it("两/三/四宫格分别固定渲染 4/9/16 张图片", () => {
		const cases = [
			["grid-2", 4],
			["grid-3", 9],
			["grid-4", 16],
		] as const;
		for (const [layout, count] of cases) {
			const html = renderInlineHtml(makeConfig({ layout }));
			expect((html.match(/<img /g) || []).length, `${layout} 渲染张数`).toBe(count);
			expect(selectLayoutImages(makeConfig({ layout }))).toHaveLength(count);
		}
	});

	it("图片超出固定张数时只渲染前 N 张(渲染层兜底)", () => {
		const html = renderInlineHtml(makeConfig({ layout: "grid-2" }));
		expect(html).toContain("alt=\"图片 1\"");
		expect(html).toContain("alt=\"图片 4\"");
		expect(html).not.toContain("alt=\"图片 5\"");
	});

	it("四种三图版式均固定渲染 3 张图片", () => {
		for (const layout of ["tri-top", "tri-bottom", "tri-left", "tri-right"] as const) {
			const html = renderInlineHtml(makeConfig({ layout }));
			expect((html.match(/<img /g) || []).length, layout).toBe(3);
			expect(selectLayoutImages(makeConfig({ layout }))).toHaveLength(3);
		}
	});

	it("tri-top 纵向排列:第 1 槽位是 2:1 通栏横图(data-w=1200),其下两张方图", () => {
		const html = renderInlineHtml(makeConfig({ layout: "tri-top" }));
		const dataWs = [...html.matchAll(/data-w="(\d+)"/g)].map(m => Number(m[1]));
		expect(dataWs).toEqual([1200, 600, 600]);
		expect(html).toContain("flex-direction:column");
		expect(html).toContain("flex-direction:row");
	});

	it("tri-bottom:两张方图在上,第 3 槽位才是通栏横图", () => {
		const html = renderInlineHtml(makeConfig({ layout: "tri-bottom" }));
		const dataWs = [...html.matchAll(/data-w="(\d+)"/g)].map(m => Number(m[1]));
		expect(dataWs).toEqual([600, 600, 1200]);
	});

	it("tri-left / tri-right 横向排列:通栏竖图与双图列各占一半,且无固定 px 宽度", () => {
		for (const layout of ["tri-left", "tri-right"] as const) {
			const html = renderInlineHtml(makeConfig({ layout }));
			expect(html).toContain("flex-direction:row");
			expect(html).toContain("width:calc((100% - 8px) / 2)");
			expect(html).not.toMatch(/width\s*:\s*\d+px/);
		}
	});
});

describe("renderInlineHtml —— 滑动版式(核心特性)", () => {
	it("默认配置即 swipe-h,且默认上方说明/内边距/fullBleed 开启", () => {
		expect(DEFAULT_CONFIG.layout).toBe("swipe-h");
		expect(DEFAULT_CONFIG.caption.position).toBe("above");
		expect(DEFAULT_CONFIG.scroller.padding).toBe(12);
		expect(DEFAULT_CONFIG.scroller.fullBleed).toBe(true);
	});

	it("swipe-h:横向滚动 + scroll-snap + data-ignore-width 豁免 + 默认灰色圆角边框", () => {
		const html = renderInlineHtml(makeConfig({ layout: "swipe-h" }));
		expect(html).toContain("overflow-x:auto");
		expect(html).toContain("scroll-snap-type:x mandatory");
		expect(html).toContain("-webkit-overflow-scrolling:touch");
		expect(html).toContain("touch-action:pan-x");
		expect(html).toContain("data-ignore-width");
		expect(html).toContain("1px solid #d1d5db");
		expect(html).toContain("border-radius:12px");
		// fullBleed 默认开启:单张撑满 + 居中吸附
		expect(html).toContain("flex:0 0 100%");
		expect(html).toContain("scroll-snap-align:center");
	});

	it("swipe-h fullBleed 关闭后恢复 62% 卡片宽度并起始吸附", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "swipe-h",
				scroller: { ...DEFAULT_CONFIG.scroller, fullBleed: false },
			}),
		);
		expect(html).toContain("flex:0 0 62%");
		expect(html).toContain("scroll-snap-align:start");
		expect(html).not.toContain("flex:0 0 100%");
	});

	it("swipe-h 边框宽度为 0 时输出 border:0", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "swipe-h",
				scroller: { ...DEFAULT_CONFIG.scroller, borderWidth: 0 },
			}),
		);
		expect(html).toContain("border:0");
	});

	it("滑动容器使用 scroller.padding 作为内容与容器的距离", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "swipe-h",
				scroller: { ...DEFAULT_CONFIG.scroller, padding: 20 },
			}),
		);
		expect(html).toContain("padding:20px");
	});

	it("滑动容器底部固定中文提示,且提示在滚动区之外(绝对定位、不跟随滚动)", () => {
		const htmlH = renderInlineHtml(makeConfig({ layout: "swipe-h" }));
		expect(htmlH).toContain("左右滑动查看");
		const hintH = htmlH.indexOf("左右滑动查看");
		const scrollEndH = htmlH.lastIndexOf("</section>", htmlH.indexOf("左右滑动查看"));
		// 提示位于横向滚动容器闭合标签之后,是外框的兄弟节点
		expect(htmlH.slice(scrollEndH, hintH)).not.toContain("overflow-x:auto");
		expect(htmlH).toMatch(
			/position:absolute;left:0;right:0;bottom:0[^>]*>左右滑动查看/,
		);

		const htmlV = renderInlineHtml(makeConfig({ layout: "swipe-v" }));
		expect(htmlV).toContain("上下滑动查看");
		expect(htmlV).toMatch(
			/position:absolute;left:0;right:0;bottom:0[^>]*>上下滑动查看/,
		);
	});

	it("swipe-v:固定高度 + 纵向滚动,属于规范豁免场景", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "swipe-v",
				scroller: { ...DEFAULT_CONFIG.scroller, height: 420 },
			}),
		);
		expect(html).toContain("height:420px");
		expect(html).toContain("overflow-y:auto");
		expect(html).toContain("scroll-snap-type:y mandatory");
		expect(html).toContain("touch-action:pan-y");
	});
});

describe("renderInlineHtml —— 图片说明", () => {
	it("默认输出 图片 1 … 图片 N 说明,且 line-height 安全", () => {
		const html = renderInlineHtml(makeConfig({ layout: "grid-3" }));
		expect(html).toContain("图片 1");
		expect(html).toContain("图片 6");
		expect(html).toContain("line-height:1.6");
		expect(html).toContain("text-align:center");
	});

	it("说明内容经过 HTML 转义", () => {
		const images = makeImages(1);
		images[0].caption = "<script>alert(\"x\")</script>";
		const html = renderInlineHtml(makeConfig({ layout: "single", images }));
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
		expect(html).toContain("&quot;x&quot;");
	});

	it("关闭说明后不再输出说明节点(alt 仍保留用于无障碍)", () => {
		const html = renderInlineHtml(
			makeConfig({ caption: { ...DEFAULT_CONFIG.caption, visible: false } }),
		);
		// 说明以 ">文本</section>" 形式出现,而 alt 位于 <img> 属性内
		expect(html).not.toContain(">图片 1</section>");
	});

	it("说明为空时使用 图片 N 作为 alt,但不渲染空说明", () => {
		const images = makeImages(2);
		images[0].caption = "   ";
		const html = renderInlineHtml(makeConfig({ layout: "duo-row", images }));
		expect(html).toContain("alt=\"图片 1\"");
		expect(html).toContain(">图片 2</section>");
	});

	it("图片上方说明:渲染在 <img> 之前,与图片间距为 margin-bottom", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "single",
				caption: { ...DEFAULT_CONFIG.caption, position: "above" },
			}),
		);
		expect(html).toContain("margin-bottom:6px");
		expect(html).toContain("text-align:center");
		expect(html.indexOf(">图片 1</section>")).toBeLessThan(html.indexOf("<img "));
	});

	it("浮层说明:绝对定位 + 白字半透明黑底 + 顶部圆角", () => {
		const html = renderInlineHtml(
			makeConfig({
				layout: "single",
				radius: 16,
				caption: { ...DEFAULT_CONFIG.caption, position: "overlay-top" },
			}),
		);
		expect(html).toContain("position:absolute");
		expect(html).toContain("top:0");
		expect(html).toContain("color:#ffffff");
		expect(html).toContain("rgba(0,0,0,0.45)");
		expect(html).toContain("border-radius:16px 16px 0 0");
	});
});

describe("renderInlineHtml —— 其他", () => {
	it("圆角与间距写入样式", () => {
		const html = renderInlineHtml(makeConfig({ layout: "grid-3", gap: 20, radius: 24 }));
		expect(html).toContain("gap:20px");
		expect(html).toContain("border-radius:24px");
	});

	it("无有效图片时输出空字符串", () => {
		expect(renderInlineHtml(makeConfig({ images: [] }))).toBe("");
	});

	it("renderPlainText 输出纯文本说明(按行)", () => {
		expect(renderPlainText(makeConfig({ images: makeImages(6) }))).toBe(
			["图片 1", "图片 2", "图片 3", "图片 4", "图片 5", "图片 6"].join("\n"),
		);
	});

	it("escapeHtml 转义全部危险字符", () => {
		expect(escapeHtml("<a href=\"x'&\">")).toBe("&lt;a href=&quot;x&#39;&amp;&quot;&gt;");
	});
});
