# mp-gridpic 实施计划：公众号纯图片排版工具

本计划基于已审阅的实施文档 `plan-wechat-image-layout-tool.md` 与对仓库现状的探索（React 19 + Vite 8 + TS + Tailwind v4 + Zustand + i18next + PWA）落地。所有阶段目标与原则遵循实施文档；本计划只补充**具体文件、具体动作、决策细化**。

---

## 0. 关键决策（已与用户确认）

| 决策点 | 选择 | 备注 |
| --- | --- | --- |
| 占位图来源 | 本地 `public/placeholders/` + PNG/SVG | 导出时转换为 GitHub Pages 绝对 HTTPS 地址 |
| 首批内置布局 | 7 种全部 | 单图 / 双图 / 品字 / 三列网格 / 自适应多图网格 / 横向滑动画廊 / 固定高度垂直滑动画廊 |
| 路由 | 使用 `react-router-dom` | 全部参数明文持久化到 URL query，方便分享 |
| URL 编码 | 明文 query 参数 | `?layout=grid&cols=3&gap=8&r=4&shadow=md...` 可读，新增字段逐项映射 |
| 包管理器 | pnpm（与 CI 一致） | 文档未指定，按现有 `.github/workflows/deploy.yml` 采用 pnpm |
| 缩进/引号 | tab + double quotes + semicolons | 遵循 `eslint.config.js` |

---

## 1. 当前状态分析

### 1.1 仓库现状（已读文件）

- `src/main.tsx`：已 import `./stores/themeStore` 并 `initTheme()`，但该模块**不存在**——直接 `pnpm dev` 会失败。
- `src/App.tsx`：空文件。
- `src/i18n/{en,zh-CN}.ts`：空对象，i18n 当前无可用文案。
- `src/i18n.ts`：配置语言检测、`localStorage` 键 `mp-gridpic.lang`、`fallbackLng: 'en'`、`supportedLngs: ['en', 'zhCN']`。
- `src/index.css`：仅 Tailwind v4 import + `@custom-variant dark` 绑定 `.dark` class。
- `index.html`：`body` 已写 `bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration=200`。
- `vite.config.ts`：`base: "/mp-gridpic/"`，PWA 已配置 `start_url` 与 `scope` 同此路径，OG 图固定为 `https://condorheroblog.github.io/mp-gridpic/og-image.jpg`。
- `package.json`：React 19 / Vite 8 / TS 6 / Tailwind 4 / Zustand 5 / i18next 26 / react-i18next 17 / react-router-dom 7；**未安装** `@dnd-kit/*`、`clsx`、图片处理库。
- `tsconfig.json`：`#*` 路径别名映射到 `./`，可使用 `#/src/...`。
- `eslint.config.js`：双引号、分号、tab 缩进、`react/dom-no-dangerously-set-innerhtml: "off"`（导出预览可放心用）。
- `.gitignore`：忽略 `node_modules`、`dist`、`.DS_Store`、`*.local`、`.vite`、`TODO.md`。
- `README.md`：仅 License 段落。
- `src/` 下除上面外无其它文件，亦无 `public/placeholders/`。

### 1.2 现有约束

- `mp-gridpic.lang` 已用作 i18n localStorage 键，**复用不变**。
- 站点部署到 GitHub Pages：`https://condorheroblog.github.io/mp-gridpic/`，导出 HTML 引用资源必须使用该绝对地址。
- 不能引入 Vue/Element UI/Vant 风格重量级 UI 框架（实施文档 §12 明确）。
- PWA `globPatterns` 已包含 `png/webp/svg`，占位图可被预缓存。
- ESLint 关掉了 `react-hooks/exhaustive-deps` 与 `react/set-state-in-effect`，编写时按字面意义即可。
- TS `strict: true` —— 所有 store action 需有显式类型。

---

## 2. 总体实施原则

1. **布局与样式解耦**：`LayoutConfig` 决定 DOM 结构，`StyleConfig` 决定视觉，所有渲染走 `LayoutDefinition` 接口。
2. **导出 HTML 微信友好**：仅白名单标签（`section` / `p` / `span` / `img`），全部样式内联，自动补 `max-width:100%;height:auto;display:block;`。
3. **图片走绝对 HTTPS**：所有占位图通过 `buildAssetUrl()` 统一转换绝对地址。
4. **三向状态同步**：编辑器状态 ⇄ URL query（明文） ⇄ Zustand store；任何修改同时写 store 与 query；URL 变更（前进/后退/粘贴）反向同步 store。
5. **三段式预设**：`layout-presets` / `style-presets` / `composed-presets` 三套独立存储与列表。
6. **i18n 全量文案**：所有可见字符串必须来自 `t()`，中英同结构、不漏 key。

---

## 3. 目标目录结构

```text
mp-gridpic/
├── public/
│   ├── placeholders/
│   │   ├── placeholder-1.svg … placeholder-10.svg   # 自托管占位图
│   │   └── INDEX.md                                 # 记录宽高比元数据
│   └── (favicon.svg, icons/* 保留)
├── src/
│   ├── main.tsx                       # 增: BrowserRouter + 路由
│   ├── App.tsx                        # 重写: 顶层路由出口
│   ├── i18n.ts                        # 不变
│   ├── index.css                      # 增: 全局滚动样式 + 导出预览用样式
│   ├── i18n/
│   │   ├── en.ts                      # 重写: 完整英文文案
│   │   └── zh-CN.ts                   # 重写: 完整中文文案
│   ├── stores/
│   │   ├── themeStore.ts              # 新建
│   │   ├── editorStore.ts             # 新建
│   │   ├── uiStore.ts                 # 新建
│   │   └── presetStore.ts             # 新建
│   ├── hooks/
│   │   ├── useUrlState.ts             # 新建: store ⇄ URL 双向同步
│   │   ├── useMediaQuery.ts           # 新建: 移动端断点
│   │   └── useClipboardHtml.ts        # 新建: 复制富文本
│   ├── types/
│   │   ├── document.ts                # 新建: Layout/Style/ImageItem/CompositionDocument
│   │   ├── preset.ts                  # 新建
│   │   └── layout.ts                  # 新建: LayoutDefinition 等
│   ├── constants/
│   │   ├── placeholders.ts            # 新建: 占位图清单 + 长宽比
│   │   ├── url.ts                     # 新建: query key 名
│   │   └── defaults.ts                # 新建: 默认文档/样式/布局
│   ├── utils/
│   │   ├── id.ts                      # 新建: nanoid 封装（或 crypto.randomUUID）
│   │   ├── assetUrl.ts                # 新建: buildAssetUrl
│   │   ├── inlineStyle.ts             # 新建: 对象 → style="a:b;c:d"
│   │   ├── exportHtml.ts              # 新建: 文档 → HTML 字符串
│   │   ├── shadowStyle.ts             # 新建: shadow 枚举 → CSS
│   │   └── color.ts                   # 新建: 容器背景/图片边框辅助
│   ├── layout-engine/
│   │   ├── index.ts                   # 注册与调度
│   │   ├── definitions/
│   │   │   ├── single.ts
│   │   │   ├── twoColumn.ts
│   │   │   ├── pinThree.ts
│   │   │   ├── gridThree.ts
│   │   │   ├── adaptiveGrid.ts
│   │   │   ├── horizontalScroll.ts
│   │   │   └── verticalScroll.ts
│   │   ├── Preview.tsx                # 根据 layout.kind 选择对应 PreviewRenderer
│   │   └── shared.tsx                 # 公用 Preview 子组件（如图片项、空状态）
│   ├── preset-library/
│   │   ├── builtinLayoutPresets.ts    # 内置布局预设
│   │   ├── builtinStylePresets.ts     # 内置样式预设
│   │   └── builtinComposedPresets.ts  # 内置组合预设
│   ├── components/
│   │   ├── shell/
│   │   │   ├── Shell.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── ExportBar.tsx
│   │   ├── controls/
│   │   │   ├── LayoutPanel.tsx
│   │   │   ├── StylePanel.tsx
│   │   │   ├── ImageSlotList.tsx
│   │   │   ├── ImageSlotItem.tsx
│   │   │   ├── NumberSlider.tsx       # 滑块 + 数字输入组合控件
│   │   │   ├── Select.tsx             # 轻量下拉
│   │   │   ├── Segmented.tsx          # 分段控件（阴影枚举）
│   │   │   ├── PresetPicker.tsx
│   │   │   ├── Drawer.tsx             # 移动端抽屉壳
│   │   │   └── IconButton.tsx
│   │   ├── preview/
│   │   │   ├── PreviewFrame.tsx       # 公众号宽度容器
│   │   │   ├── PreviewTabs.tsx        # 编辑态 / 导出预览态切换
│   │   │   └── ExportedPreview.tsx    # dangerouslySetInnerHTML 注入导出 HTML
│   │   ├── export/
│   │   │   ├── CopyButton.tsx
│   │   │   ├── SourceDialog.tsx       # 源码查看/手动复制兜底弹层
│   │   │   └── CompatibilityHints.tsx
│   │   └── dnd/
│   │       └── SortableImageList.tsx  # 基于 @dnd-kit/sortable
│   ├── pages/
│   │   └── EditorPage.tsx             # 主路由 / 内容
│   └── router.tsx                     # 新建: createBrowserRouter
└── .trae/documents/
    ├── plan-wechat-image-layout-tool.md         # 已有
    └── plan-wechat-image-layout-tool-impl.md    # 本文件
```

---

## 4. 阶段化任务

每个阶段都列出**目标 → 具体文件 → 验收点**。执行时按 Phase 顺序，可合并提交但 PR 拆分。

### Phase 1：应用骨架与基础能力

**目标**：跑通“启动 → 渲染 Shell → 主题/语言切换 → 三个 store 占位 → URL 同步占位”。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 1.1 | `package.json` | 新增依赖：`@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`、`clsx`、`nanoid`。运行 `pnpm install`。 |
| 1.2 | `src/stores/themeStore.ts` | 新建：导出 `useThemeStore`、`initTheme()`、`toggleTheme()`、`setTheme()`。基于 `localStorage` 键 `mp-gridpic.theme`，值 `light` \| `dark` \| `system`。`initTheme()` 同步给 `document.documentElement.classList` 添加/移除 `.dark`，并在 `system` 下订阅 `matchMedia`。 |
| 1.3 | `src/stores/uiStore.ts` | 新建：面板抽屉开合、语言、复制状态。**不持久化语言**（由 i18n 自行持久化 `mp-gridpic.lang`）。 |
| 1.4 | `src/stores/editorStore.ts` | 新建：占位的 `images`、`layout`、`style`、`currentPresetId`，并暴露基础 action（`addImage`、`removeImage`、`updateStyle` 等，Phase 2 完善）。 |
| 1.5 | `src/stores/presetStore.ts` | 新建：内置模板与自定义模板的合并视图，提供 `getLayoutPresets()`、`getStylePresets()`、`saveAsCustomPreset()`、`removeCustomPreset()`、`applyPreset()`。`localStorage` 键 `mp-gridpic.presets.v1`。 |
| 1.6 | `src/types/*.ts` | 新建 `document.ts`、`preset.ts`、`layout.ts`，**先定义 `LayoutKind`/`ImageItem`/`LayoutConfig`/`StyleConfig`/`CompositionDocument`/`LayoutDefinition`**（与实施文档 §6.1、§7 严格对齐）。 |
| 1.7 | `src/constants/*` | 新建 `defaults.ts`（默认 `StyleConfig`、默认 `LayoutConfig`、默认 4 张图初始状态）、`url.ts`（导出 query key 名）、`placeholders.ts`（占位图清单 + 各自 `ratio`，与 `public/placeholders/` 对应）。 |
| 1.8 | `src/utils/id.ts` | 封装 `newId()`：优先 `crypto.randomUUID()`，回退 `nanoid(10)`。 |
| 1.9 | `src/utils/assetUrl.ts` | `buildAssetUrl(path)`：根据当前 `location.origin` + `BASE_PATH`（`/mp-gridpic/`）拼接绝对地址，便于本地预览与 GitHub Pages 行为一致；并提供 `toAbsoluteExportUrl(src)` 用于导出 HTML 强制写绝对 HTTPS。 |
| 1.10 | `src/utils/inlineStyle.ts` | `toInlineStyle(obj)`：稳定顺序输出 `k:v;k:v`，过滤空值。 |
| 1.11 | `src/utils/shadowStyle.ts` | `shadowToBoxShadow(level)`：根据 `none/sm/md/lg` 返回 CSS。 |
| 1.12 | `src/hooks/useMediaQuery.ts` | `(query: string) => boolean`，SSR 安全（默认 `false`）。 |
| 1.13 | `src/hooks/useUrlState.ts` | 关键 hook：接收 `encode(state) → URLSearchParams`、`decode(params) → Partial<state>`；通过 `useSearchParams` 读取并 `replace` 写回；与 store 形成单向循环（URL 是 source of truth，store 仅作派生），避免死循环（用一个 `isApplyingRef` 守护）。 |
| 1.14 | `src/router.tsx` | `createBrowserRouter([{ path: "/", element: <EditorPage /> }])`，`basename: import.meta.env.BASE_URL`（即 `/mp-gridpic/`），保证 GitHub Pages 子路径生效。 |
| 1.15 | `src/main.tsx` | 改为：`<RouterProvider router={router} />`。**保留** `initTheme()` 调用。 |
| 1.16 | `src/App.tsx` | 直接 `<RouterProvider />`。 |
| 1.17 | `src/components/shell/Shell.tsx` | 三段式（TopBar + 主区 + ExportBar）；仅占位骨架。 |
| 1.18 | `src/components/shell/TopBar.tsx` | 产品名 + 语言切换（`useTranslation` + i18next 自带） + 主题切换（`useThemeStore`）。 |
| 1.19 | `src/i18n/en.ts`、`src/i18n/zh-CN.ts` | 写出 `app` 命名空间：`name`、`tagline`、`language.en`、`language.zhCN`、`theme.light`、`theme.dark`、`theme.system`。 |
| 1.20 | `index.html` | 调整 `<title>` 为 `mp-gridpic`。 |

**Phase 1 验收**：

- `pnpm dev` 不再因 `themeStore` 缺失报错，页面渲染 “mp-gridpic” TopBar。
- 点击主题按钮切换亮暗，刷新保持。
- 切换语言立即生效。
- 路由 `/` 与 `/anything-else`（除 `/` 外）只命中首页。

---

### Phase 2：基础排版能力（5 种非滚动布局）

**目标**：单图/双图/品字/三列网格/自适应网格全部跑通，样式滑块实时预览，URL 同步状态。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 2.1 | `public/placeholders/placeholder-1.svg … -10.svg` | 用脚本生成 10 张 SVG 占位图，含不同长宽比（横/方/竖各几张），背景灰渐变 + 居中文本 “P1 … P10 + WxH”。**脚本可以放进 `scripts/gen-placeholders.mjs`**，生成后再纳入版本控制，避免运行时依赖。 |
| 2.2 | `src/constants/placeholders.ts` | 数组：每项 `{ id, src, ratio: number, label }`。`src` 用相对路径 `/mp-gridpic/placeholders/placeholder-N.svg`（`assetUrl` 自行拼接），导出时 `toAbsoluteExportUrl` 转换。 |
| 2.3 | `src/layout-engine/definitions/single.ts` | 导出 `LayoutDefinition`：min=1, max=1, supportsScroll=false；`renderPreview` 返回单 `<img>`；`renderExport` 输出白名单 HTML 片段。 |
| 2.4 | `src/layout-engine/definitions/twoColumn.ts` | 双图并排，`columns=2`。 |
| 2.5 | `src/layout-engine/definitions/pinThree.ts` | 品字：1 大 + 2 小（两列小图）。 |
| 2.6 | `src/layout-engine/definitions/gridThree.ts` | 三列等宽网格，`columns=3`。 |
| 2.7 | `src/layout-engine/definitions/adaptiveGrid.ts` | 自适应多图网格：`columns` 由用户控制 2–5。 |
| 2.8 | `src/layout-engine/shared.tsx` | 抽出 `<ImageSlot>` 组件：受控渲染 src/alt/ratio/radius/padding/shadow/gap，受 style-engine 输出。 |
| 2.9 | `src/layout-engine/Preview.tsx` | 根据 `layout.kind` 选择对应 `renderPreview`。**仅展示编辑态**。 |
| 2.10 | `src/layout-engine/index.ts` | `LAYOUT_DEFINITIONS: Record<LayoutKind, LayoutDefinition>`，`getLayout(kind)`，`getLayoutsForImages(n)`（按图片数量筛选可用布局，UI 中灰显不可用项）。 |
| 2.11 | `src/components/preview/PreviewFrame.tsx` | 公众号宽度容器：`max-width: 677px`（公众号图文正文常见宽度），圆角白底。 |
| 2.12 | `src/components/controls/LayoutPanel.tsx` | 布局列表（卡片）+ 当前不可用布局灰显；点击切换 `layout.kind`，同时重置 `columns`（若适用）。 |
| 2.13 | `src/components/controls/ImageSlotList.tsx` | 列表展示当前 images；每项显示缩略图 + 顺序号 + 删除按钮 + 切换占位图下拉（来自 `placeholders`）。 |
| 2.14 | `src/components/controls/ImageSlotItem.tsx` | 单行：缩略图 / 顺序 / 占位图切换 / 删除。 |
| 2.15 | `src/components/controls/StylePanel.tsx` | 容器 `containerPadding` / `imageGap` / `imageRadius` / `imagePadding` / `imageShadow`（分段控件）/ `backgroundColor`（仅编辑态有效，导出固定白底）。 |
| 2.16 | `src/components/controls/NumberSlider.tsx` | 滑块 + 数字输入双向绑定；统一回写 store。 |
| 2.17 | `src/components/controls/Select.tsx`、`Segmented.tsx` | 不引入第三方 UI 库；用 `<select>` / `<input type="radio">` + Tailwind 风格化。 |
| 2.18 | `src/components/controls/PresetPicker.tsx` | 展示当前预设选择 + “另存为自定义模板”入口（Phase 4 落地保存）。 |
| 2.19 | `src/pages/EditorPage.tsx` | 用 Shell 包裹，布局 grid：左 LayoutPanel / 中 PreviewFrame / 右 StylePanel；移动端用 Drawer 折叠。 |
| 2.20 | `src/hooks/useUrlState.ts` 接线 | 在 `EditorPage` 中：`editorStore.subscribe` + `useSearchParams` 形成双向，序列化字段：`layout`, `cols`, `rows`（pinThree 时）, `n`（图片数）, `imgs`（图片序号逗号分隔）, `pad`, `gap`, `r`, `shadow`, `bg`。 |

**Phase 2 验收**：

- 切换布局 → 预览实时变化；不可用布局灰显。
- 修改 `containerPadding` / `imageRadius` 等 → 预览实时变化（< 100ms）。
- 删除最后一张图时，UI 自动降级到“单图”或提示重选布局。
- URL 变化（粘贴链接 / 前进后退）能完整重建 store 状态。
- 移动端断点（≤768px）下左右面板转为 Drawer。

---

### Phase 3：滚动画廊与拖拽排序

**目标**：横向画廊 + 固定高度垂直画廊跑通；图片列表支持拖拽排序。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 3.1 | `src/layout-engine/definitions/horizontalScroll.ts` | 容器：`overflow-x:auto; white-space:nowrap; scroll-snap-type:x mandatory;`；每项 `display:inline-block; scroll-snap-align:start;`。`scrollHeight` 字段控制每张图的展示高度。 |
| 3.2 | `src/layout-engine/definitions/verticalScroll.ts` | 容器：`overflow-y:auto; height:${scrollHeight}px;`；图片以单列垂直堆叠。 |
| 3.3 | `src/components/dnd/SortableImageList.tsx` | 基于 `@dnd-kit/sortable`：`<DndContext>` + `<SortableContext>` + `useSortable`；支持键盘（Space 抓取，方向键移动，Esc 取消）。`touch-action: none` 适配移动端。 |
| 3.4 | `src/components/controls/LayoutPanel.tsx` | “添加图片槽位”按钮（受 `maxImages` 限制）；拖拽后 `editorStore.reorderImages(from, to)`。 |
| 3.5 | `src/utils/exportHtml.ts` | 横向画廊导出：用 `<section>` 包裹 `<p>` 列表 + `<img>`；inline 完整 `overflow-x:auto; white-space:nowrap;` 等属性。**注意**：导出 HTML 是公众号阅读端，**不要**依赖 JS，但允许纯 CSS scroll-snap（实测兼容可接受）。 |
| 3.6 | 拖拽 a11y | 拖拽句柄添加 `aria-label`，并提供“上移/下移”键盘按钮作为兜底。 |

**Phase 3 验收**：

- 切换到横向画廊，预览区可横向滚动（编辑态）。
- 拖拽改变图片顺序，URL 与导出 HTML 都按新顺序更新。
- 移动端 Safari/微信内置浏览器：拖拽可用且不与原生滚动冲突。

---

### Phase 4：模板体系

**目标**：内置布局/样式/组合模板各 ≥3 套；可保存自定义模板；可复用与删除。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 4.1 | `src/preset-library/builtinLayoutPresets.ts` | 至少 3 套内置：例如 “杂志封面单图 / 公众号双图 / 摄影三联”。 |
| 4.2 | `src/preset-library/builtinStylePresets.ts` | 至少 3 套内置：例如 “干净卡片（圆角 md + 浅阴影） / 极简无修饰 / 杂志硬边（无圆角 + 强间距）”。 |
| 4.3 | `src/preset-library/builtinComposedPresets.ts` | 至少 3 套组合：layout + style + images 一起。 |
| 4.4 | `src/components/controls/PresetPicker.tsx` | 三段 Tab：布局 / 样式 / 组合；每段显示内置 + 自定义（自定义可删除）。 |
| 4.5 | `src/stores/presetStore.ts` | `saveAsCustomPreset(scope, name, payload)`、`removeCustomPreset(scope, id)`、`applyPreset(scope, id)`。 |
| 4.6 | `src/i18n/{en,zh-CN}.ts` | 新增 `template` 命名空间：`tab.layout`、`tab.style`、`tab.composed`、`action.saveAs`、`action.delete`、`action.apply`、`prompt.name`、`builtin.*`。 |

**Phase 4 验收**：

- 选内置模板立即应用。
- 自定义模板保存后刷新仍在（localStorage）。
- 删除自定义模板生效。

---

### Phase 5：导出与复制

**目标**：富文本复制 + 源码兜底，公众号粘贴结构稳定。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 5.1 | `src/utils/exportHtml.ts` | 完整实现：接收 `CompositionDocument`，输出单一字符串；按 layout.kind 路由到对应 `renderExport`。**白名单**：`section` / `p` / `span` / `img`；`img` 强制 `max-width:100%;height:auto;display:block;`；所有 `src` 走 `toAbsoluteExportUrl`；`alt` 必填（默认 `''`），`width/height` 按 `ratio` 输出像素数；`style` 顺序由 `toInlineStyle` 统一。 |
| 5.2 | `src/hooks/useClipboardHtml.ts` | 策略 A：`navigator.clipboard.write([new ClipboardItem({'text/html': blob, 'text/plain': blob})])`；策略 B：临时 `<div contenteditable>` + `document.execCommand('copy')`；策略 C：打开 `SourceDialog` 让用户手动复制。返回 `{ status: 'ok' \| 'fallback' \| 'manual', message }`。 |
| 5.3 | `src/components/export/CopyButton.tsx` | 接入 `useClipboardHtml`；按钮显示 loading / success / error 三态，提示信息来自 i18n `message.copy.*`。 |
| 5.4 | `src/components/export/SourceDialog.tsx` | 模态框：textarea 只读 + “复制源码”按钮 + “关闭”。i18n `export.dialog.*`。 |
| 5.5 | `src/components/export/CompatibilityHints.tsx` | 静态提示：粘贴到公众号编辑器建议使用 Chrome / Edge 桌面；图片需先在公众号素材库上传或保证 HTTPS 第三方可被微信抓取。 |
| 5.6 | `src/components/preview/PreviewTabs.tsx` | “编辑态预览 / 导出态预览”切换；导出态通过 `dangerouslySetInnerHTML` 注入 `exportHtml()` 输出，并用 `PreviewFrame` 包住。 |
| 5.7 | `src/components/shell/ExportBar.tsx` | 桌面端底部固定；移动端吸顶；包含 `CopyButton` + “查看源码”按钮 + `CompatibilityHints` 折叠。 |

**Phase 5 验收**：

- Chrome 桌面端点击复制 → 粘贴到公众号编辑器（手动验证）能看到图片布局，结构未乱。
- Safari iPhone 模拟器中策略 B 工作（手动验证）。
- 在不支持剪贴板的旧 WebView 中弹出 `SourceDialog`，可手动复制。

---

### Phase 6：打磨与验收

**目标**：全量 i18n、暗色主题细化、移动端适配、性能与边界。

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 6.1 | `src/i18n/{en,zh-CN}.ts` | 补齐 `app/toolbar/layout/style/export/template/message` 所有命名空间；en/zh 结构必须一一对应。 |
| 6.2 | `src/index.css` | 增：`.wechat-frame` 容器白底 + 安全内边距；`.scroll-x` / `.scroll-y` 用于画廊预览态；导出态预览使用 `pointer-events: none` 避免误触。 |
| 6.3 | 暗色主题 | TopBar / 左右面板 / 预览外壳用 Tailwind 暗色 token；预览区“编辑态”跟随主题，“导出态”强制白底。 |
| 6.4 | 移动端 | `useMediaQuery('(max-width:768px)')`；左/右面板改为 `<Drawer>`（底部弹出），顶部 Tabs 切换；增加拖拽句柄点击热区至 ≥44×44。 |
| 6.5 | 可访问性 | 所有按钮 `aria-label`，滑块 `<label>` + `<input type="range">` 配合 `aria-valuetext`。导出态预览标注 `role="region" aria-label`。 |
| 6.6 | 性能 | `React.memo` 包装 `ImageSlot`；`useCallback` 包装 store actions；20 张图内拖拽无明显卡顿。 |
| 6.7 | PWA | 验证 `pnpm build` 后 `dist/placeholders/*` 已包含；`vite.config.ts` 中 `workbox.globPatterns` 已覆盖 svg（已覆盖）。 |
| 6.8 | Lint | `pnpm lint` 与 `pnpm typecheck` 全绿。 |
| 6.9 | 真机验证 | 在 Chrome 桌面 / Safari iPhone / 微信内置浏览器跑完 Phase 5 验收清单。 |

**Phase 6 验收**：

- 中英无遗漏 key。
- 暗色下 UI 与编辑态预览正常，导出态白底。
- 移动端可独立完成“创建画布 → 切布局 → 调样式 → 复制”全流程。

---

## 5. 文件级详细动作（按实施顺序的关键文件）

下面给出 Phase 1–6 中**最具实现风险**的文件的设计细节，确保执行人无歧义。

### 5.1 `src/types/document.ts`

```ts
export type LayoutKind =
  | "single"
  | "two-column"
  | "pin-three"
  | "grid-three"
  | "adaptive-grid"
  | "horizontal-scroll"
  | "vertical-scroll";

export interface ImageItem {
  id: string;
  /** 占位图标识（来自 PLACEHOLDERS 的 id） */
  placeholderId: string;
  /** 用户可改 alt */
  alt: string;
}

export interface LayoutConfig {
  kind: LayoutKind;
  /** adaptive-grid: 2–5 */
  columns?: number;
  /** horizontal/vertical scroll: 展示高度 px */
  scrollHeight?: number;
}

export type ShadowLevel = "none" | "sm" | "md" | "lg";

export interface StyleConfig {
  containerPadding: number; // px
  imageGap: number;        // px
  imageRadius: number;     // px
  imagePadding: number;    // px
  imageShadow: ShadowLevel;
  /** 仅编辑态生效；导出固定白底 */
  backgroundColor: string;
}

export interface CompositionDocument {
  images: ImageItem[];
  layout: LayoutConfig;
  style: StyleConfig;
}
```

### 5.2 `src/types/layout.ts`

```ts
import type { ReactNode } from "react";
import type { CompositionDocument } from "./document";

export interface LayoutDefinition {
  id: LayoutKind;
  label: string; // i18n key
  minImages: number;
  maxImages?: number;
  supportsScroll: boolean;
  renderPreview: (doc: CompositionDocument) => ReactNode;
  /** 返回 HTML 片段字符串（不含 <html><body>） */
  renderExport: (doc: CompositionDocument) => string;
}
```

### 5.3 `src/utils/exportHtml.ts`

签名：

```ts
export function buildExportHtml(doc: CompositionDocument): string;
export function buildExportHtmlFragment(doc: CompositionDocument): string; // 不含 <section> 包裹，用于画廊内联
```

行为：

- 顶层 `<section data-mp-gridpic="1" style="...container inline style...">`。
- 非滚动布局：每个 `ImageItem` 输出一个 `<p style="margin:0;padding:0;text-align:center;"><img .../></p>`，块间留白由 `imageGap` 控制 `margin-bottom`。
- 滚动布局：
  - horizontal：内层 `<section style="overflow-x:auto;white-space:nowrap;...">` 包裹多个 `<span style="display:inline-block;...">`。
  - vertical：内层 `<section style="overflow-y:auto;height:Npx;">` 包裹多 `<p>`。
- `<img>` 必带属性：`src`（绝对 URL）/`alt`（默认空串）/`loading="lazy"`（可选，若微信清洗则去掉）/ `style="display:block;max-width:100%;height:auto;border-radius:Npx;box-shadow:...;padding:Npx;margin:0 Npx Npx 0;"`。

### 5.4 `src/hooks/useUrlState.ts`

策略：

- 单一 `useUrlState<T>({ encode, decode, defaults })`：
  - 初始：读 URL → `decode(searchParams)` → 合并 `defaults` → 应用到 store。
  - 后续：监听 store 变化 → `encode(state)` → 与当前 query 差异比对 → 不同则 `setSearchParams(..., { replace: true })`。
  - 守卫：`isApplyingRef` 在 `decode` → 写 store 期间为 true，避免再触发 encode。
- 编码方案（按 §0 决策）：
  - `layout=<kind>`
  - `cols=<n>`（adaptive-grid 时）
  - `rows=<n>`（pin-three 时，目前固定 2，仅占位）
  - `h=<px>`（scrollHeight）
  - `n=<imagesCount>`
  - `imgs=<id1>,<id2>,...`（每个 ImageItem 的 placeholderId）
  - `pad=<px>`、`gap=<px>`、`r=<px>`、`ip=<px>`、`shadow=<none|sm|md|lg>`、`bg=<hex>`（仅编辑态）
- 链接分享：复制当前 URL 即分享整张画布。

### 5.5 `src/stores/editorStore.ts`

动作：

- `setLayoutKind(kind: LayoutKind)`
- `setLayoutColumns(n: number)`
- `setScrollHeight(px: number)`
- `setImages(images: ImageItem[])`
- `addImage()`（按当前 layout maxImages 限制）
- `removeImage(id: string)`
- `updateImage(id, patch)`
- `reorderImages(from: number, to: number)`
- `setStyle(patch: Partial<StyleConfig>)`
- `resetAll()`
- `applyDocument(doc: CompositionDocument)`（模板应用入口）

### 5.6 `src/layout-engine/definitions/*.ts`

每个文件导出：

```ts
export const single: LayoutDefinition = {
  id: "single",
  label: "layout.kind.single",
  minImages: 1, maxImages: 1, supportsScroll: false,
  renderPreview: (doc) => <ImageSlot ... />,
  renderExport: (doc) => `<section ...>...</section>`,
};
```

并在 `index.ts` 注册：

```ts
export const LAYOUT_DEFINITIONS: Record<LayoutKind, LayoutDefinition> = {
  single, "two-column": twoColumn, "pin-three": pinThree,
  "grid-three": gridThree, "adaptive-grid": adaptiveGrid,
  "horizontal-scroll": horizontalScroll, "vertical-scroll": verticalScroll,
};
```

---

## 6. 假设与权衡

1. **占位图采用 SVG**：体积小、矢量、与 PWA 缓存友好；导出时仍以绝对 HTTPS 引用。
2. **URL 持久化采用明文 query**：可读性好；20 张图以内 URL 长度可接受；若未来加入上传导致图片体积增大，可改为 hash + LZ-string。
3. **不使用 Service Worker 做图片代理**：避免与 PWA 配置复杂化，保持单文件 `<500KB` 应用外壳。
4. **不引入 Element UI / Vant 等**：与现有轻量栈一致。
5. **拖拽库选用 `@dnd-kit`**：移动端体验与 a11y 优于手写。
6. **导出标签白名单限定**：宁缺勿滥，避免微信清洗导致结构错乱。
7. **不实现 SSR / SSG**：当前为纯 SPA + 静态部署。
8. **不实现账号体系**：完全本地化，所有状态进 `localStorage`。

---

## 7. 风险与缓解（针对实施层）

| 风险 | 缓解 |
| --- | --- |
| URL 过长导致部分代理截断 | 限制 `n ≤ 20`；超过则提示“导出状态过长，建议保存为模板”。 |
| `navigator.clipboard.write` 在某些 WebView 不可用 | 自动回退 execCommand；再次失败则打开 SourceDialog。 |
| 微信清洗 `scroll-snap-type` | 横向画廊导出仍保留原生横向滚动；snap 视为可选增强（被清洗仍可滚动）。 |
| 暗色主题下导出的预览与公众号不一致 | 导出态预览固定白底，并在 UI 中明示“此即公众号阅读端样式”。 |
| dnd-kit 在 iOS Safari 与原生滚动冲突 | 监听 `touchstart` 时设置 `touch-action: pan-y`（垂直）/ `none`（横向画廊）；并提供“上移/下移”键盘按钮。 |
| 大量图导致 URL 过长 | 提供“精简分享 URL”开关：仅编码 layout/style，images 全部用当前默认。 |

---

## 8. 验收标准（最终交付前必过）

### 8.1 功能

- 7 种布局均可切换、预览实时更新。
- 图片可增/删/换占位图/拖拽排序。
- 样式参数（容器内边距/间距/圆角/阴影/图片内边距）实时生效。
- 模板可保存、复用、删除。
- 富文本复制 → 粘贴到公众号编辑器（Chrome 桌面）成功，结构未乱。
- 源码查看与手动复制兜底可用。

### 8.2 兼容性

- Chrome 桌面端（最新版）。
- Safari iPhone（iOS 17+）。
- 微信内置浏览器（X5 内核）。
- 公众号编辑器粘贴后：图片显示正常；横向画廊可滑动；垂直画廊可滚动。

### 8.3 性能

- 20 张图内：拖拽无明显卡顿（≥30fps）。
- 样式调整响应 < 100ms。
- 首屏 JS gzip < 200KB（增量 `@dnd-kit` + `clsx` 后）。

### 8.4 工程

- `pnpm typecheck` 通过。
- `pnpm lint` 通过。
- `pnpm build` 通过，`dist/placeholders/*.svg` 存在。

---

## 9. 执行节奏建议

| 工作块 | 估算步骤数 | 依赖 |
| --- | --- | --- |
| Phase 1：骨架 | 20 | 无 |
| Phase 2：基础排版 | 20 | Phase 1 |
| Phase 3：滚动 + 拖拽 | 6 | Phase 2 |
| Phase 4：模板 | 6 | Phase 2 |
| Phase 5：导出 + 复制 | 7 | Phase 2/3 |
| Phase 6：打磨 | 9 | 全部 |

执行顺序固定为 1 → 2 → (3 与 4 可并行) → 5 → 6。

---

## 10. 一旦计划被接受

执行人需按以下顺序开机：

1. `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities clsx nanoid`。
2. 新建 `src/stores/themeStore.ts`，**先让 `pnpm dev` 可启动**。
3. 按 Phase 1 → 6 顺序推进。
4. 每完成一个 Phase，运行 `pnpm typecheck && pnpm lint` 并截图验收。
5. 全部完成后跑 `pnpm build` 并验证 `dist/placeholders/` 存在。