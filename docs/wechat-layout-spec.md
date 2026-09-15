# 公众号排版规范落地说明

> 本文档记录 mp-gridpic 生成"可直接粘贴到微信公众号编辑器"的 HTML 时所遵循的规范，以及代码层面的工程约束。**改动渲染逻辑（`src/lib/renderInlineHtml.ts`）或新增样式前，请先对照本文档。**

## 1. 规范来源

| 来源 | 地址 |
| --- | --- |
| 《微信公众平台编辑器插件开发规范》（官方，条款编号以此为准） | <https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html> |
| verify-article-structure-spec（官方校验 CLI，规则权威定义与测试用例） | <https://github.com/wechatjs/verify-article-structure-spec> |

代码中所有"规范 x.x.x"注释均可在上表中找到对应条款。

## 2. 最关键的前提：复制的是"渲染后富文本"，不是源码

公众号编辑器会**过滤和重写 HTML/CSS**（剥离 class、外部样式表、大部分非白名单标签）。因此本工具：

1. 只生成带**全内联样式**（`style="..."`）的片段，不依赖任何 class / 外部 CSS / `<style>` 标签；
2. 结构标签只用公众号编辑器的原生段落标签 `<section>`，不用 `<div>`/`<p>` 做布局容器（避免粘贴后被重排）；
3. 复制走剪贴板富文本通道（`src/lib/clipboard.ts`）：优先 `navigator.clipboard.write` 写入 `text/html`，同时写 `text/plain` 兜底；不支持时回退隐藏 `contenteditable` 容器 + `copy` 事件 `setData` + `execCommand('copy')`。

在工具自身页面上看到的预览 DOM（Tailwind class 那一套）**不是**复制内容；复制内容只由 `renderInlineHtml()` 的字符串拼接产出。

## 3. 官方条款与本项目落地对照

| 条款 | 要求 | 本项目做法 / 代码位置 |
| --- | --- | --- |
| 1.1 opacity | 禁止 `img { opacity: 0 }` 叠 SVG 背景图（发布后图片无法在后台替换） | 不使用 opacity 隐藏图片；图片始终是真实 `<img>`。`validate.ts` 规则 `no-img-opacity-zero` |
| 1.2 caret-color | 禁止隐藏输入光标 | 输出片段不含任何 `caret-color`。规则 `no-caret-transparent` |
| 1.3 line-height | 含文字元素的行高不得小于字号，否则多行叠字 | 图片说明统一 `line-height:1.6`（`captionHtml()`），滑动提示同为 1.6 |
| 1.4 width | 禁止固定 px 宽度导致多屏居中不一致 / 溢出 / 宽度比例不一致 | **所有宽度只能用百分比或 `calc()`**：单图 `width:{size}%`、宫格 `calc((100% - gap*n) / n)`、外框 `width:100%`；px 仅允许用于高度、间距、圆角、边框、字号等非宽度属性 |
| 1.4.3 图片宽度兜底 | 建议每张 `<img>` 带 `data-w`（图片原始像素宽度），图片加载超时时校验引擎按 `style.width → data-w → width 属性` 兜底 | `imgHtml()` 必输出 `data-w`，值由 `getLayoutDimensions()` 按版式给出 |
| 1.4.4 data-ignore-width | 横向滚动等"有意超出容器"的节点须标记 `data-ignore-width`，豁免该节点及其子树的 width 检测 | 左右滑动的滚动容器节点带 `data-ignore-width`（`renderSwipeH()`）。注意：**只豁免 width，不豁免其他规则**，不可滥用 |
| 1.5.1 height:0 | 含文字容器禁止 `height:0`（编辑器可见、移动端空白） | 不产生 height:0 容器；上下滑动的固定高范围 240–600px（`LIMITS.scrollerHeight`） |
| 1.5.2 固定高度裁剪 | 固定高容器内容超出会被裁剪；**带滚动属性的容器豁免** | 上下滑动容器 `height:{n}px;overflow-y:auto`，属于滚动豁免场景（`renderSwipeV()`） |
| 1.6 text-align | 只允许 `left/center/right`，禁止 `start/end`（iOS 18+ 兼容性差异） | 说明只用 `center`（above/below）与 `left`（浮层）。规则 `no-text-align-start-end` |
| 1.7 SVG animate begin | 动画须同时绑定 `touchstart; click` | 本项目无 SVG 动画，暂不涉及；新增交互动画时须遵守 |
| 1.8 pre | 普通文本不得用 `<pre>` 包裹 | 不输出 `<pre>`，说明文字经 `escapeHtml()` 转义后直接放 `<section>`。规则 `no-pre-tag` |
| 2.1 嵌套层级 | 层级过深会被清理，官方上限 10 层 | 工程上自限 **≤ 5 层**；滑动版式外框直接作为最外层返回、不再多包一层 `section`（见 `renderInlineHtml()` 末尾注释），单测有层级断言 |
| 第 3 节 字体 | 不应设置 `font-family`，沿用公众号默认字体栈以保证各端一致 | 输出零 `font-family`，字号只用 px。规则 `no-font-family` |
| 4.2.2 结构顺序 | DOM 结构顺序应与视觉顺序一致 | 上方说明把说明节点渲染在 `<img>` **之前**；浮层说明在相对定位容器内按 DOM 顺序放置并绝对定位（`figureHtml()`） |
| 4.5.2 !important | 禁止 `!important` | 全片段无 `!important`。规则 `no-important` |
| 第 4 节 Dark Mode | 浮层文字须保证深色模式下对比度 | 浮层说明固定白字 `#ffffff` + 半透明黑底 `rgba(0,0,0,0.45)`，不跟随主题取色 |

## 4. 输出片段的固定写法（改渲染器时保持）

`boxStyle()` 给每个布局 `<section>` 统一重置：`margin:0;padding:0;box-sizing:border-box;`。

`<img>` 固定属性组合（`imgHtml()`）：

```html
<img src="..." alt="..." data-w="..."
  style="display:block;width:100%;height:auto;margin:0;padding:0;border:0;
         border-radius:Npx;vertical-align:top;background-color:#f3f4f6;
         box-sizing:border-box;" />
```

- `display:block` + `vertical-align:top`：消除行内图片底部缝隙；
- `width:100%;height:auto`：宽度永远跟随容器，高度自适应，不变形；
- `background-color:#f3f4f6`：图片加载中的占位底色。

说明文字（`captionHtml()`）：

- `margin:0;padding:0`，above 用 `margin-bottom:6px`、below 用 `margin-top:6px`；
- `word-break:break-word` 防长链接撑破容器；
- 空文案不渲染节点；用户文案经 HTML 转义，杜绝注入；
- 文案与滑动提示**强制中文写死**（`图片 N`、`左右滑动查看`、`上下滑动查看`），不走 i18n——因为粘贴进公众号的是最终 HTML，多语言会把外文一并复制给中文号读者。

滑动提示（`swipeHintHtml()` / `swipeFrameHtml()`）：

- 提示是外框内、滚动区外的兄弟节点，`position:absolute;left:0;right:0;bottom:0`，**不随图片滚动**；
- 定位只用 `left/right`，不写固定 px `width`（遵守 1.4）；
- 外框 `padding-bottom:30px`（`SWIPE_HINT_HEIGHT`）为提示留位，白底防止图片透过来。

## 5. 图片链接的注意事项

- 粘贴到公众号编辑器时，微信会把图片**转存到 mmbiz.qpic.cn**，因此 `src` 必须是**公网可直接访问的图片 URL**（本工具演示图用 picsum）；`localhost`、blob:、data: 地址粘贴后无法被转存。
- 落地页（营销页）不涉及复制，图片已本地化到 `src/assets/demo/` 走 Vite 打包；**编辑器演示图刻意保留远程 picsum 链接**，二者不要混淆。
- 批量替换链接（`replaceAllSrc`）后 seed 置空，防止"一键换一批"再把链接覆盖回去。

## 6. 参数取值范围（`src/lib/constants.ts` LIMITS）

| 参数 | 范围 | 说明 |
| --- | --- | --- |
| 图片数量 | 1–16 | |
| 间距 gap | 0–30px | 用于 flex `gap`，px 安全 |
| 图片圆角 radius | 0–40px | |
| 单图/竖排宽度 size | 50–100% | 百分比，禁止 px |
| 滚动容器边框 | 0–10px | |
| 滚动容器圆角 | 0–32px | |
| 滚动容器内边距 padding | 0–40px，默认 12 | |
| 上下滚动高度 | 240–600px，步进 4 | 固定高 + overflow-y 豁免 |
| 说明字号 | 12–20px，默认 14 | |
| 说明字数 | ≤ 50 字 | |
| 左右滑动单图占比 | fullBleed 开：100% + 居中吸附；关：62%（`SWIPE_H_ITEM_PERCENT`，露下一张提示） |

## 7. 改动后的自检

1. **本地预检**：`validateArticleHtml()`（`src/lib/validate.ts`）对最终 HTML 跑 7 条静态规则，预览页顶部显示"规范预检通过/失败"。新增禁用 token 时，在 `RULES` 数组追加规则即可（`test` 返回 true 表示违规）。
2. **单元测试**：`pnpm test`。`renderInlineHtml.test.ts` 中的硬约束：
   - 正则禁止输出固定 px 宽度（`width:\d+px`），height 不受限；
   - 滑动容器必须含 `data-ignore-width`；
   - 嵌套 `<section>` 深度 ≤ 5；
   - 提示文案为固定中文、绝对定位且位于滚动容器闭合之后。
3. **typecheck / lint / build**：`pnpm typecheck && pnpm lint && pnpm build`。
4. **可选的官方全量校验**：本工具的 `validate.ts` 只覆盖无需布局测量的静态规则；官方 CLI（puppeteer，含实际渲染测量的宽度差异、height 溢出、叠字检测）可对导出 HTML 做补充验证：

   ```bash
   git clone https://github.com/wechatjs/verify-article-structure-spec.git
   cd verify-article-structure-spec/cli
   npm install
   npm run check ./article.html        # 人类可读明细
   npm run check ./article.html --json # 结构化 JSON
   ```
