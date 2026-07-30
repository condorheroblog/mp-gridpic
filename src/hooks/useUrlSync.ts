/**
 * URL 同步 Hook - 把当前版式(layout)与样式(style)写入 URL query,
 * 同时支持通过 URL 反向同步 store,实现"通过链接分享当前画布"。
 *
 * query 约定:
 *   ?layout=<layoutId>&style=<styleId>
 *
 * 行为:
 *   - 初始:从 URL 读取 layout/style,若与当前 store 不同则覆盖,确保首屏就是 URL 指向的状态。
 *   - 变更:订阅 store,layout/style 变化时用 history.replaceState 更新 URL(不触发 popstate)。
 *   - 守卫:`applyingRef` 在 URL → store 反向同步期间为 true,阻断后续 encode 触发死循环。
 */

import { useEffect, useRef } from "react";

import { LAYOUT_PRESETS } from "../data/layouts";
import { STYLE_PRESETS } from "../data/styles";
import { useDocumentStore } from "../stores/documentStore";

const QUERY_LAYOUT = "layout";
const QUERY_STYLE = "style";
const VALID_LAYOUT_IDS = new Set(LAYOUT_PRESETS.map(item => item.id));
const VALID_STYLE_IDS = new Set(STYLE_PRESETS.map(item => item.id));

interface UrlState {
	layoutId: string
	styleId: string
}

function readUrlState(): UrlState | null {
	if (typeof window === "undefined")
		return null;
	const params = new URLSearchParams(window.location.search);
	const layoutId = params.get(QUERY_LAYOUT);
	const styleId = params.get(QUERY_STYLE);
	if (!layoutId && !styleId)
		return null;
	return {
		layoutId: layoutId && VALID_LAYOUT_IDS.has(layoutId) ? layoutId : "",
		styleId: styleId && VALID_STYLE_IDS.has(styleId) ? styleId : "",
	};
}

function writeUrlState(state: UrlState): void {
	if (typeof window === "undefined")
		return;
	const params = new URLSearchParams(window.location.search);
	const defaultLayout = LAYOUT_PRESETS[0].id;
	const defaultStyle = STYLE_PRESETS[0].id;
	if (state.layoutId && state.layoutId !== defaultLayout)
		params.set(QUERY_LAYOUT, state.layoutId);
	else
		params.delete(QUERY_LAYOUT);
	if (state.styleId && state.styleId !== defaultStyle)
		params.set(QUERY_STYLE, state.styleId);
	else
		params.delete(QUERY_STYLE);
	const nextSearch = params.toString();
	const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
	if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`)
		window.history.replaceState(null, "", nextUrl);
}

/**
 * 在应用根组件挂载一次即可,自动维持 URL 与 documentStore 的双向同步。
 */
export function useUrlSync(): void {
	const applyingRef = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined")
			return;

		// 初始:从 URL 反向同步到 store
		const fromUrl = readUrlState();
		if (fromUrl) {
			const { layoutId, styleId } = useDocumentStore.getState();
			applyingRef.current = true;
			try {
				if (fromUrl.layoutId && fromUrl.layoutId !== layoutId)
					useDocumentStore.getState().setLayout(fromUrl.layoutId);
				if (fromUrl.styleId && fromUrl.styleId !== styleId)
					useDocumentStore.getState().setStyle(fromUrl.styleId);
			}
			finally {
				applyingRef.current = false;
			}
		}

		// 后续:订阅 store → 写 URL
		const unsubscribe = useDocumentStore.subscribe((state) => {
			if (applyingRef.current)
				return;
			writeUrlState({ layoutId: state.layoutId, styleId: state.styleId });
		});

		// 监听 popstate(浏览器前进/后退) → 反向同步到 store
		const handlePopState = () => {
			const next = readUrlState();
			if (!next)
				return;
			applyingRef.current = true;
			try {
				const current = useDocumentStore.getState();
				if (next.layoutId && next.layoutId !== current.layoutId)
					current.setLayout(next.layoutId);
				if (next.styleId && next.styleId !== current.styleId)
					current.setStyle(next.styleId);
			}
			finally {
				applyingRef.current = false;
			}
		};
		window.addEventListener("popstate", handlePopState);

		return () => {
			unsubscribe();
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);
}
