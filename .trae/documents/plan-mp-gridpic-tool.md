# 公众号图片排版工具 (mp-gridpic) 实施计划

## Summary

基于现有 React 19 + Vite 8 + TypeScript + Tailwind v4 + Zustand + react-i18next 技术栈，开发一个**纯图片排版工具**，面向微信公众号后台粘贴使用。工具不包含任何文字编辑功能，只生成带内联样式的 HTML `<section>` 片段，复制后直接粘贴到公众号编辑器即可渲染。

工具核心价值：**版式 (Layout) 与样式 (Style) 解耦**，用户可自由组合预设版式与样式，并保存自定义模板到 localStorage。

---

## Phase 1 探索：当前技术栈现状

### 已确认事实

| 类别 | 现状 |
|---|---|
| 框架 | React 19 + TypeScript + Vite 8 (`/Users/david/i/mp-gridpic/package.json`) |
| 样式 | Tailwind v4 (`@import "tailwindcss"` in `src/index.css`) |
| 状态 | Zustand 5 (`zustand`) |
| 路由 | react-router-dom 7（已装但未用） |
| 国际化 | i18next + react-i18next + LanguageDetector（已接入 localStorage 检测，key = `mp-gridpic.lang`） |
| 主题 | `index.html` 中已存在 `class="... dark:bg-zinc-950 dark:text-zinc-100"`，但**没有主题切换逻辑**，需要新增 |
| 部署 | GitHub Pages via `.github/workflows/deploy.yml`，base = `/mp-gridpic/` |
| PWA | 已配置 vite-plugin-pwa |
| 文件 | `App.tsx` 为空；`src/i18n/zh-CN.ts`、`src/i18n/en.ts` 为空对象 |
| TODO | `TODO.md` 仅一条图标替换备注，与本任务无关 |

### 关键约束

- 公众号编辑器只识别**内联 `style` 属性**，对 `<style>` 标签、CSS 变量、`class` 中的 Tailwind 工具类在粘贴后**全部失效**。
- 公众号阅读器对 `position:fixed`、`z-index`、`transform: translate3d` 部分行为异常，**应避免使用**。
- 公众号对 `<svg>` + `<foreignObject>` 在长文中支持不稳定，故放弃该方案。
- 输出必须是**单个根节点**的 HTML 片段，避免与公众号自动包裹的 `<p>` 冲突——使用 `<section style="...">` 作为根。

---

## Phase 2 已澄清的关键决策

| 决策点 | 用户选择 |
|---|---|
| 导出格式 | 纯内联 `style` HTML 片段（外加格式化可读版本） |
| 滑动画廊实现 | 纯 HTML + 内联 `overflow-x/y` + `-webkit-overflow-scrolling:touch` |
| 持久化 | localStorage + JSON 导入/导出 |

---

## Phase 3 实施方案

### 3.1 目录结构

```
src/
├── App.tsx                     # 根组件 + 路由/布局
├── main.tsx                    # 已有
├── index.css                   # 仅工具样式（不导出）
├── i18n.ts                     # 已有，扩展 fallback 与资源
│
├── components/
│   ├── Layout/
│   │   ├── AppHeader.tsx       # Logo、语言、主题切换
│   │   ├── AppSidebar.tsx      # 版式库、样式库、自定义模板
│   │   └── AppFooter.tsx
│   ├── Editor/
│   │   ├── ImageUploader.tsx   # 多图上传（拖拽 + 点选）
│   │   ├── ImageList.tsx       # 图片列表 + 拖拽排序 + 删除
│   │   ├── LayoutPicker.tsx    # 当前布局预览
│   │   └── StylePanel.tsx      # 边距/圆角/阴影/间距
│   ├── Preview/
│   │   ├── PreviewPane.tsx     # 实时预览（公众号样式容器）
│   │   └── WechatMock.tsx      # 公众号阅读器模拟容器
│   ├── Export/
│   │   ├── ExportDialog.tsx    # 复制 + 格式化预览
│   │   └── HtmlPreview.tsx     # 格式化 HTML 展示
│   └── Templates/
│       ├── TemplateGallery.tsx # 预设模板
│       ├── TemplateEditor.tsx  # 自定义模板编辑
│       └── TemplateIO.tsx      # 导入/导出 JSON
│
├── layouts/                    # 版式定义
│   ├── types.ts                # LayoutId / LayoutDescriptor
│   ├── registry.ts             # 版式注册表
│   ├── single.ts               # 单图
│   ├── double.ts               # 双图（左右/上下）
│   ├── triple.ts               # 三图（横排/品字）
│   ├── grid2x2.ts              # 四宫格
│   ├── grid3.ts                # 三列网格
│   ├── masonry.ts              # 瀑布流（CSS columns）
│   ├── horizontalScroll.ts     # 横向滑动画廊
│   └── verticalScroll.ts       # 固定高度垂直滑动画廊
│
├── styles/                     # 样式定义（与版式解耦）
│   ├── types.ts                # StyleId / StyleDescriptor
│   ├── registry.ts
│   ├── plain.ts                # 无修饰
│   ├── rounded.ts              # 圆角
│   ├── shadow.ts               # 阴影
│   ├── card.ts                 # 卡片描边
│   └── polaroid.ts             # 拍立得（圆角+阴影+轻微内边距）
│
├── generators/                 # 输出生成（核心）
│   ├── html.ts                 # 版式 → HTML 结构
│   ├── style.ts                # 样式 → 内联 CSS
│   ├── builder.ts              # 组合版式+样式 → 最终 snippet
│   └── sanitize.ts             # 图片 src 处理（支持 base64 与远程 URL）
│
├── stores/
│   ├── editorStore.ts          # 当前编辑状态：images、layoutId、styleId、styleConfig
│   ├── templateStore.ts        # 用户自定义模板（localStorage 持久化）
│   └── themeStore.ts           # 主题（light/dark/system，localStorage）
│
├── hooks/
│   ├── useMediaQuery.ts        # 移动端判断
│   ├── useClipboard.ts         # 复制到剪贴板
│   ├── useDragSort.ts          # 拖拽排序（Pointer Events）
│   └── useColorScheme.ts       # 监听系统主题
│
├── i18n/
│   ├── en.ts                   # 扩展
│   ├── zh-CN.ts                # 扩展
│   └── keys.ts                 # 类型化 key
│
└── utils/
    ├── formatHtml.ts           # HTML 格式化（prettify）
    ├── download.ts             # 触发下载 JSON
    └── uid.ts                  # 简易 id
```

### 3.2 数据模型

```ts
// generators/types.ts
interface ImageItem {
	id: string
	src: string // url 或 dataURL
	name?: string
	width?: number
	height?: number
}

type LayoutId
	= | "single" | "double-row" | "double-col"
	  | "triple-row" | "triple-pinz"
	  | "grid-2x2" | "grid-3col"
	  | "masonry"
	  | "h-scroll" | "v-scroll";

interface LayoutDescriptor {
	id: LayoutId
	nameKey: string // i18n key
	minImages: number
	maxImages: number // Infinity 表示不限
	supportedImageCounts: number[] // 1,2,3,4... 哪些张数可用
	generator: (images: ImageItem[], cfg: LayoutConfig) => string
}

type StyleId
	= | "plain" | "rounded" | "shadow" | "card" | "polaroid";

interface StyleConfig {
	margin: number // 外边距（px）
	gap: number // 图片间距（px）
	borderRadius: number // 圆角
	boxShadow: string // CSS 阴影串
	padding: number // 内边距（卡纸用）
	borderColor: string // 卡片描边颜色
}

interface StyleDescriptor {
	id: StyleId
	nameKey: string
	defaultConfig: StyleConfig
	toInline: (cfg: StyleConfig) => Record<string, string>
}
```

### 3.3 核心模块详细设计

#### A. 版式生成器 (`generators/html.ts` + `layouts/*.ts`)

每个版式导出一个 `generate(images, cfg): string`，返回完整的 `<section>...</section>` 字符串，内含**内联 style**。

**关键版式算法：**

- **单图 `single`**：`<section style="..."><img style="display:block;width:100%;..." src="..."></section>`
- **双图 `double-row/col`**：`<section style="display:flex;gap:Xpx"><img style="flex:1;...">×N</section>`
- **三图 `triple-pinz`**（品字）：一个 100% 宽图 + 下面两个 flex:1
- **四宫格 `grid-2x2`**：`display:grid;grid-template-columns:1fr 1fr;gap:Xpx`
- **三列网格 `grid-3col`**：同上 3 列
- **瀑布流 `masonry`**：使用 `column-count:2;column-gap:Xpx`，外层 `<img style="break-inside:avoid;margin-bottom:Xpx">`，**不使用 CSS Grid masonry**（兼容性差）
- **横向滑动画廊 `h-scroll`**：`<section style="overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;white-space:nowrap"><img style="display:inline-block;width:auto;height:200px;margin-right:Xpx">×N</section>`
- **垂直滑动画廊 `v-scroll`**：外层 `<section style="overflow-y:auto;height:400px;-webkit-overflow-scrolling:touch">` + 内层 inline-block 图片

> 滑动画廊使用 `overflow:auto` + `-webkit-overflow-scrolling:touch`，公众号阅读器（iOS WebView）支持此组合。

#### B. 样式生成器 (`styles/*.ts`)

每个样式返回一个 `StyleConfig` 默认值 + `toInline(cfg)`，**只输出内联属性字符串**（如 `border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);`）。

样式作用于**每个 `<img>` 标签**，由 `builder.ts` 在组合阶段统一包裹。

#### C. 解耦组合 (`generators/builder.ts`)

```ts
function build(images: ImageItem[], layout: LayoutDescriptor, style: StyleDescriptor, cfg: StyleConfig): string {
	const inner = layout.generator(images, cfg); // 版式产出结构
	const styled = applyStyle(inner, style.toInline(cfg)); // 给每个 <img> 加 style
	return wrapSection(styled, cfg); // 套外层 section 的 padding/margin
}
```

#### D. 状态管理 (Zustand)

**`editorStore.ts`**：
```ts
interface EditorState {
	images: ImageItem[]
	layoutId: LayoutId
	styleId: StyleId
	styleConfig: StyleConfig
	// actions
	addImages: (files: File[]) => void
	removeImage: (id: string) => void
	reorderImages: (from: number, to: number) => void
	setLayout: (id: LayoutId) => void
	setStyle: (id: StyleId) => void
	updateConfig: (patch: Partial<StyleConfig>) => void
	exportHtml: () => string
	reset: () => void
}
```

**`templateStore.ts`**：保存 `Template[]`，每个 Template = `{ id, name, layoutId, styleId, config, imageSrcs? }`，**只保存配置，不保存图片二进制**（避免 localStorage 溢出）。持久化 key = `mp-gridpic.templates`。

**`themeStore.ts`**：`'light' | 'dark' | 'system'`，在 `<html>` 上添加 `class="dark"`，持久化 key = `mp-gridpic.theme`。

#### E. UI 布局（响应式）

```
┌──────────────────────────────────────────────────────────────┐
│ AppHeader  Logo │ 中/EN │ ☀/🌙                                │
├──────────────┬───────────────────────────────────┬────────────┤
│ Sidebar      │ Editor 区域                       │ Preview    │
│ (Tabs)       │                                   │ (实时)     │
│ • 版式       │ ┌─ 上传区 ────────────────┐       │ ┌────────┐ │
│ • 样式       │ │ [+ 添加图片] / 拖拽到这里 │       │ │公众号 │ │
│ • 我的模板   │ └──────────────────────────┘       │ │模拟器 │ │
│ • 导入/导出  │ ┌─ 图片列表（可拖拽排序）─┐        │ │        │ │
│              │ │ [图1][图2][图3][+删除] │        │ └────────┘ │
│              │ └──────────────────────────┘       │            │
│              │ ┌─ 版式选择 ──────────────┐        │ [复制HTML] │
│              │ │ [单][双][三][四][...]   │        │            │
│              │ └──────────────────────────┘       │            │
│              │ ┌─ 样式参数 ──────────────┐        │            │
│              │ │ 边距/间距/圆角/阴影      │        │            │
│              │ └──────────────────────────┘       │            │
└──────────────┴───────────────────────────────────┴────────────┘
```

**移动端 (<768px)**：改为顶部 Tab 切换「编辑 | 预览」，Sidebar 转为底部抽屉。

#### F. 拖拽排序 (`useDragSort.ts`)

使用 **Pointer Events** 实现（兼容触屏）：
1. `onPointerDown` 记录起始位置与索引
2. `onPointerMove` 计算位移并通过 `transform: translateY(...)` 视觉跟随
3. `onPointerUp` 计算落点索引，dispatch `reorderImages(from, to)`

移动端自动启用，`touch-action: none` 防止浏览器默认滚动干扰。

#### G. i18n 资源

`src/i18n/zh-CN.ts` 与 `en.ts` 必须覆盖以下 key（节选）：

```ts
{
  app: { title, subtitle },
  header: { language, theme, themes: { light, dark, system } },
  editor: {
    upload: { dragHint, button },
    list: { empty, remove, dragTip },
    layout: { title, unsupported },
    style: {
      title,
      margin, gap, borderRadius, padding, boxShadow, borderColor,
      presets: { plain, rounded, shadow, card, polaroid }
    }
  },
  preview: { title, copy, copied, formatPreview },
  templates: { title, save, load, delete, import, export, confirmDelete },
  layouts: {
    single, doubleRow, doubleCol, tripleRow, triplePinz,
    grid2x2, grid3col, masonry, hScroll, vScroll
  },
  common: { reset, confirm, cancel, save }
}
```

#### H. 主题切换

- `themeStore` 持久化偏好
- 在 `App.tsx` 启动时根据 `localStorage` + `prefers-color-scheme` 决定初始 `<html class>`
- 监听 `matchMedia('(prefers-color-scheme: dark)')` 变化，仅在 `theme === 'system'` 时响应
- Tailwind v4 使用 `@variant dark` 时默认基于 `.dark` 类，已与 `index.html` 兼容

#### I. 复制到剪贴板 (`useClipboard.ts`)

优先使用 `navigator.clipboard.writeText()`；失败时降级到 `document.execCommand('copy')` + 隐藏 textarea。复制成功后 Snackbar 提示。

#### J. JSON 导入/导出 (`templates/TemplateIO.tsx`)

- 导出：把当前 templates 数组序列化为 JSON，触发下载 `<timestamp>-templates.json`
- 导入：`<input type="file" accept="application/json">` → 校验 schema → 合并（按 id 去重）

### 3.4 关键文件清单与变更

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `src/App.tsx` | 改造 | 应用主布局，挂载 store 与全局监听 |
| `src/main.tsx` | 微调 | 在 render 前初始化 themeStore（同步读取 localStorage） |
| `src/index.css` | 扩展 | 仅工具类（动画、滑块样式），不导出 |
| `src/i18n.ts` | 微调 | `fallbackLng: ['en', 'zhCN']`，新增 `ns` 配置 |
| `src/i18n/zh-CN.ts` `en.ts` | 填充 | 全部 UI 文案 |
| `src/layouts/*` | 新增 | 10 个版式 |
| `src/styles/*` | 新增 | 5 个样式 |
| `src/generators/*` | 新增 | 组合与导出核心 |
| `src/stores/*` | 新增 | editor / template / theme |
| `src/components/**` | 新增 | UI 组件 |
| `src/hooks/**` | 新增 | 复用逻辑 |
| `src/utils/**` | 新增 | 工具函数 |

### 3.5 内置预设（默认提供给用户）

**版式**：单图、双图（左右）、双图（上下）、三图（横排）、三图（品字）、四宫格、三列网格、瀑布流、横向滑动画廊、垂直滑动画廊 = **10 种**

**样式**：无、圆角、阴影、卡片描边、拍立得 = **5 种**

任意组合 = **50 种** 默认排版能力。

---

## Assumptions & Decisions

1. **不引入新依赖**：所有功能用现有依赖实现。拖拽排序自己写 Pointer Events（避免引入 dnd-kit），复制用原生 Clipboard API，HTML 格式化手写简化版（避免引入 prettier）。
2. **不持久化图片**：自定义模板只保存布局+样式配置；用户重新上传图片即可复用。避免 base64 把 localStorage 撑爆。
3. **不接入后端**：纯前端 SPA，所有状态 localStorage。
4. **公众号粘贴兼容**：仅使用 `display`、`flex`、`grid`、`overflow`、`width`、`height`、`margin`、`padding`、`border-radius`、`box-shadow` 等高兼容属性；不使用 `filter`、`backdrop-filter`、`transform 3d`、`position:fixed/sticky` 等不稳定属性。
5. **PWA 不受影响**：保留现有 vite-plugin-pwa 配置即可，主题切换 + 多语言对 PWA 透明。
6. **不实现撤销/重做**：避免引入复杂历史栈；用户不满意可点重置。最小可用原则。
7. **README 与 OG 元数据**：本期不动，按 TODO 提及的「修改 icons」事项留给后续。

---

## Verification

### 功能验证清单

- [ ] 单图、双图（左右/上下）、三图、四宫格、瀑布流、横向滚动、垂直滚动 各版式渲染正确
- [ ] 5 种样式可与任意版式自由组合
- [ ] 边距/间距/圆角/阴影/内边距/描边 6 个参数滑块实时生效
- [ ] 拖拽排序在桌面与移动端均可工作
- [ ] 一键复制，粘贴到公众号后台编辑器能正常显示
- [ ] 横向滑动在手机端公众号阅读器可滑动
- [ ] 垂直滚动在固定区域内可滚动
- [ ] 中英文切换即时生效，`<html lang>` 同步更新
- [ ] 亮/暗主题切换即时生效，刷新后保留
- [ ] 系统主题变化时（仅在 system 模式下）自动跟随
- [ ] 自定义模板保存 → 刷新 → 重新加载 → 应用成功
- [ ] 导入/导出 JSON 文件正常，schema 校验拦截非法输入
- [ ] 移动端布局：编辑/预览 Tab 切换，Sidebar 抽屉化

### 命令验证

```bash
pnpm install
pnpm run typecheck    # TypeScript 零错误
pnpm run lint         # ESLint 零错误
pnpm run dev          # 启动后浏览器手动验证
pnpm run build        # 生产构建无错误
```

### 关键回归测试（手动）

1. **复制测试**：生成 HTML → 复制 → 打开微信公众号图文编辑器 → 粘贴 → 切换到预览 → 滑动与样式都正常
2. **跨设备测试**：Chrome DevTools 切到 iPhone SE / iPhone 14 Pro / iPad 三档验证
3. **主题测试**：在 macOS 切换深色模式，浏览器同步切换

---

## 实施顺序（建议拆分为 5 个里程碑）

1. **M1 数据基础**：types / stores / i18n keys / utils
2. **M2 核心生成**：layouts + styles + generators + builder + 复制
3. **M3 编辑器 UI**：uploader + list + layout picker + style panel + 实时预览
4. **M4 模板系统**：templates gallery + 自定义保存 + JSON 导入导出
5. **M5 打磨**：响应式 / 主题 / 移动端适配 / 文案润色 / lint 修复

每个里程碑结束都能跑 `pnpm run typecheck && pnpm run lint` 通过。