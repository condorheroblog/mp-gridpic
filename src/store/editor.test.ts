import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "./editor";

describe("editor store —— 固定张数版式", () => {
	beforeEach(() => {
		localStorage.clear();
		useEditorStore.getState().reset();
	});

	it("默认进入左右滑动版式,6 张图片", () => {
		const state = useEditorStore.getState();
		expect(state.layout).toBe("swipe-h");
		expect(state.images).toHaveLength(6);
	});

	it("切换到两宫格自动裁剪为 4 张,四宫格自动补齐到 16 张", () => {
		useEditorStore.getState().setLayout("grid-2");
		expect(useEditorStore.getState().images).toHaveLength(4);

		useEditorStore.getState().setLayout("grid-4");
		const images = useEditorStore.getState().images;
		expect(images).toHaveLength(16);
		// 补齐的图片有独立 id 与占位图地址
		expect(new Set(images.map(i => i.id)).size).toBe(16);
		expect(images[15].src).toContain("/400/400");
	});

	it("三宫格固定 9 张,数量操作全部失效", () => {
		useEditorStore.getState().setLayout("grid-3");
		const state = useEditorStore.getState();
		expect(state.images).toHaveLength(9);

		useEditorStore.getState().setCount(3);
		useEditorStore.getState().addImage();
		useEditorStore.getState().removeImage(state.images[0].id);
		expect(useEditorStore.getState().images).toHaveLength(9);
	});

	it("切到上一下二三图:3 张,首槽位是 2:1 横图(1200×600),其余为方图", () => {
		useEditorStore.getState().setLayout("tri-top");
		const images = useEditorStore.getState().images;
		expect(images).toHaveLength(3);
		expect(images[0].src).toContain("/1200/600");
		expect(images[1].src).toContain("/600/600");
		expect(images[2].src).toContain("/600/600");
	});

	it("切到左二右一:第 3 槽位是 1:2 竖图(600×1200)", () => {
		useEditorStore.getState().setLayout("tri-right");
		const images = useEditorStore.getState().images;
		expect(images[0].src).toContain("/600/600");
		expect(images[2].src).toContain("/600/1200");
	});

	it("从四宫格切回左右滑动保留 16 张,且仍可手动减到 9 张", () => {
		useEditorStore.getState().setLayout("grid-4");
		useEditorStore.getState().setLayout("swipe-h");
		expect(useEditorStore.getState().images).toHaveLength(16);

		useEditorStore.getState().setCount(9);
		expect(useEditorStore.getState().images).toHaveLength(9);
	});
});
