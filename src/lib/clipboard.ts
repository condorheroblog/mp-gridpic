/**
 * 富文本剪贴板写入
 * - 优先使用 navigator.clipboard.write([ClipboardItem]) 写入 text/html + text/plain
 * - 降级方案:使用隐藏的 contenteditable + execCommand("copy"),触发 copy 事件并写入 text/html
 * - 都失败时抛出错误,UI 层用 toast 提示
 *
 * HTML 字符串额外处理:
 *  - 公众号编辑器对换行非常敏感,把所有换行折叠成空字符串,避免产生 <br> 或 <p>
 *    把多行属性粘贴到一起。
 */
export async function copyHtmlToClipboard(html: string, plainText?: string): Promise<boolean> {
	if (typeof window === "undefined")
		return false;
	const compactHtml = html.replace(/\s+/g, " ").trim();
	const text = plainText ?? compactHtml;
	if (navigator?.clipboard?.write && typeof ClipboardItem !== "undefined") {
		try {
			const item = new ClipboardItem({
				"text/html": new Blob([compactHtml], { type: "text/html" }),
				"text/plain": new Blob([text], { type: "text/plain" }),
			});
			await navigator.clipboard.write([item]);
			return true;
		}
		catch {
			// 继续走降级方案
		}
	}
	return copyHtmlViaExecCommand(compactHtml, text);
}

function copyHtmlViaExecCommand(html: string, text: string): boolean {
	const container = document.createElement("div");
	container.contentEditable = "true";
	container.style.position = "fixed";
	container.style.left = "-10000px";
	container.style.top = "0";
	container.style.opacity = "0";
	container.style.whiteSpace = "pre";
	container.innerHTML = html;
	document.body.appendChild(container);

	const range = document.createRange();
	range.selectNodeContents(container);
	const selection = window.getSelection();
	const previousSelection = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
	if (selection) {
		selection.removeAllRanges();
		selection.addRange(range);
	}

	let success = false;
	try {
		success = document.execCommand("copy");
	}
	catch {
		success = false;
	}

	if (selection) {
		selection.removeAllRanges();
		if (previousSelection)
			selection.addRange(previousSelection);
	}
	document.body.removeChild(container);
	void text;
	return success;
}
