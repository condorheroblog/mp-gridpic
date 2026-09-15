import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyHtmlToClipboard } from "./clipboard";

const HTML = "<section style=\"width:100%;\"><img data-w=\"600\" src=\"https://example.com/a.jpg\" /></section>";
const TEXT = "图片 1";

/** jsdom v30 不再实现 execCommand,这里按需挂载桩函数 */
function stubExecCommand(impl?: () => boolean) {
	const exec = vi.fn(impl ?? (() => true));
	Object.defineProperty(document, "execCommand", {
		value: exec,
		configurable: true,
		writable: true,
	});
	return exec;
}

/** 在 execCommand 被调用时同步派发带 clipboardData 的 copy 事件 */
function execThatDispatchesCopy(setData: ReturnType<typeof vi.fn>) {
	return stubExecCommand(() => {
		const event = new Event("copy", { bubbles: true, cancelable: true });
		Object.defineProperty(event, "clipboardData", {
			value: { setData },
		});
		document.dispatchEvent(event);
		return true;
	});
}

describe("copyHtmlToClipboard", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("clipboard API 通道", () => {
		it("优先以 text/html + text/plain 双通道写入", async () => {
			const write = vi.fn().mockResolvedValue(undefined);
			class FakeClipboardItem {
				constructor(public data: Record<string, Blob>) {}
			}
			vi.stubGlobal("ClipboardItem", FakeClipboardItem);
			vi.stubGlobal("navigator", { ...navigator, clipboard: { write } });

			const result = await copyHtmlToClipboard(HTML, TEXT);

			expect(result.channel).toBe("clipboard-api");
			expect(write).toHaveBeenCalledTimes(1);
			const item = write.mock.calls[0][0][0] as FakeClipboardItem;
			expect(item.data).toHaveProperty("text/html");
			expect(item.data).toHaveProperty("text/plain");
			expect(item.data["text/html"].type).toBe("text/html");
			expect(await item.data["text/plain"].text()).toBe(TEXT);
		});

		it("clipboard API 抛错时自动回退 execCommand", async () => {
			vi.stubGlobal("navigator", {
				...navigator,
				clipboard: { write: vi.fn().mockRejectedValue(new Error("NotAllowedError")) },
			});
			class FakeClipboardItem {
				constructor(public data: Record<string, Blob>) {}
			}
			vi.stubGlobal("ClipboardItem", FakeClipboardItem);

			const setData = vi.fn();
			const exec = execThatDispatchesCopy(setData);

			const result = await copyHtmlToClipboard(HTML, TEXT);

			expect(result.channel).toBe("exec-command");
			expect(exec).toHaveBeenCalledWith("copy");
			expect(setData).toHaveBeenCalledWith("text/html", HTML);
			expect(setData).toHaveBeenCalledWith("text/plain", TEXT);
		});
	});

	describe("execCommand 回退通道", () => {
		beforeEach(() => {
			// 模拟不支持 Async Clipboard API 的环境
			vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
			vi.stubGlobal("ClipboardItem", undefined);
		});

		it("通过选区 + copy 事件写入双通道数据", async () => {
			const setData = vi.fn();
			const exec = execThatDispatchesCopy(setData);

			const result = await copyHtmlToClipboard(HTML, TEXT);
			expect(result.channel).toBe("exec-command");
			expect(exec).toHaveBeenCalledTimes(1);
			expect(setData).toHaveBeenCalledWith("text/html", HTML);
			expect(setData).toHaveBeenCalledWith("text/plain", TEXT);
		});

		it("两条通道都失败时抛出 CLIPBOARD_UNAVAILABLE", async () => {
			stubExecCommand(() => false);
			await expect(copyHtmlToClipboard(HTML, TEXT)).rejects.toThrow("CLIPBOARD_UNAVAILABLE");
		});
	});
});
