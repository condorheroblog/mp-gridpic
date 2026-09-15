/**
 * 复制到公众号:同时写入 text/html 与 text/plain 两个通道。
 *
 *  - 优先使用 Async Clipboard API(navigator.clipboard.write + ClipboardItem),
 *    公众号编辑器 / Word / 邮件编辑器会读取 text/html 并保留全部内联样式;
 *  - 不支持时(旧浏览器、非安全上下文)回退到"隐藏 contenteditable 容器 +
 *    copy 事件 setData + execCommand('copy')"方案。
 */

export type CopyChannel = "clipboard-api" | "exec-command";

export interface CopyResult {
	channel: CopyChannel
}

function toHtmlBlob(html: string): Blob {
	return new Blob([html], { type: "text/html" });
}

function toTextBlob(text: string): Blob {
	return new Blob([text], { type: "text/plain" });
}

async function copyViaClipboardApi(html: string, text: string): Promise<boolean> {
	if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
		return false;
	}
	try {
		const data: Record<string, Blob> = {
			"text/html": toHtmlBlob(html),
			"text/plain": toTextBlob(text),
		};
		await navigator.clipboard.write([new ClipboardItem(data)]);
		return true;
	}
	catch {
		return false;
	}
}

/** 回退方案:选区 + copy 事件双通道写入 */
function copyViaExecCommand(html: string, text: string): boolean {
	const holder = document.createElement("div");
	holder.setAttribute("contenteditable", "true");
	holder.setAttribute("aria-hidden", "true");
	holder.style.cssText = [
		"position:fixed",
		"top:0",
		"left:-9999px",
		"width:640px",
		"height:auto",
		"opacity:0",
		"pointer-events:none",
	].join(";");
	holder.innerHTML = html;
	document.body.appendChild(holder);

	const onCopy = (event: ClipboardEvent) => {
		event.clipboardData?.setData("text/html", html);
		event.clipboardData?.setData("text/plain", text);
		event.preventDefault();
	};
	document.addEventListener("copy", onCopy);

	let ok = false;
	try {
		if (typeof document.execCommand !== "function") {
			return false;
		}
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(holder);
		selection?.removeAllRanges();
		selection?.addRange(range);
		ok = document.execCommand("copy");
		selection?.removeAllRanges();
	}
	catch {
		ok = false;
	}
	finally {
		document.removeEventListener("copy", onCopy);
		holder.remove();
	}
	return ok;
}

/**
 * 把排版结果复制到剪贴板
 * @throws 当两种通道都失败时抛出错误,由 UI 层提示用户手动复制
 */
export async function copyHtmlToClipboard(html: string, text: string): Promise<CopyResult> {
	if (await copyViaClipboardApi(html, text)) {
		return { channel: "clipboard-api" };
	}
	if (copyViaExecCommand(html, text)) {
		return { channel: "exec-command" };
	}
	throw new Error("CLIPBOARD_UNAVAILABLE");
}
