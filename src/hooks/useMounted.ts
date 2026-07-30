/**
 * 工具类型
 */

import { useEffect, useState } from "react";

/**
 * 在客户端 hydration 后才将状态返回 true,
 * 避免 SSR/CSR 在数值/日期上出现不一致警告。
 */
export function useMounted(): boolean {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	return mounted;
}
