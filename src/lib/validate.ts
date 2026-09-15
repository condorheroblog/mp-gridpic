/**
 * 公众号文章结构本地预检(对标官方 verify-article-structure-spec 的静态部分)
 *
 * 渲染器在构造上已保证合规,这里做输出级回归校验:
 * 一旦后续改动引入违规 token,预览区与测试都会立刻报警。
 */

export interface ValidationIssue {
	rule: string
	message: string
}

export interface ValidationResult {
	valid: boolean
	issues: ValidationIssue[]
}

interface Rule {
	rule: string
	message: string
	test: (html: string) => boolean
}

const RULES: Rule[] = [
	{
		rule: "no-important",
		message: "禁止使用 !important(规范 4.5.2)",
		test: html => /!important/i.test(html),
	},
	{
		rule: "no-font-family",
		message: "不建议设置 font-family,应沿用公众号默认字体栈(规范第 3 节)",
		test: html => /font-family\s*:/i.test(html),
	},
	{
		rule: "no-pre-tag",
		message: "普通文本不应使用 <pre> 包裹(规范 1.8)",
		test: html => /<pre[\s>]/i.test(html),
	},
	{
		rule: "no-img-opacity-zero",
		message: "不应将图片 opacity 设为 0(规范 1.1)",
		test: html => /opacity\s*:\s*0(?!\.\d)/i.test(html),
	},
	{
		rule: "no-text-align-start-end",
		message: "text-align 只允许 left/center/right(规范 1.6)",
		test: html => /text-align\s*:\s*(?:start|end)\b/i.test(html),
	},
	{
		rule: "no-caret-transparent",
		message: "不应隐藏输入光标(规范 1.2)",
		test: html => /caret-color\s*:/i.test(html),
	},
	{
		rule: "scroll-ignore-width",
		message: "横向滚动容器必须声明 data-ignore-width(规范 1.4.4)",
		test: html =>
			/overflow-x\s*:\s*(?:auto|scroll)/i.test(html)
			&& !/data-ignore-width/i.test(html),
	},
];

export function validateArticleHtml(html: string): ValidationResult {
	const issues = RULES.filter(r => r.test(html)).map(r => ({
		rule: r.rule,
		message: r.message,
	}));
	return { valid: issues.length === 0, issues };
}
