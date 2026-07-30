/**
 * Vitest 配置 - 用于覆盖公众号编辑器兼容性测试
 *
 * 测试目标:
 *  - 验证 renderInlineHtml 生成的 HTML 100% 符合
 *    <https://developers.weixin.qq.com/doc/subscription/guide/product/plugin_spec.html>
 *  - 验证 copyHtmlToClipboard 把 HTML / 纯文本双通道写入剪贴板
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// 浏览器侧 API(navigator.clipboard / document.execCommand)需要 DOM 环境
		environment: "jsdom",
		// 与 ESLint 项目风格保持一致:tab + 双引号 + 分号
		globals: false,
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/lib/**"],
			exclude: ["src/**/*.test.ts"],
		},
	},
});
