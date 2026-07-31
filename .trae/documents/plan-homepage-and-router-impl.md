# mp-gridpic 官网首页 + 路由改造实施计划

本计划基于已审阅的实施文档 `plan-wechat-image-layout-tool.md` / `plan-wechat-image-layout-tool-impl.md`（已被实际实现取代为当前的 React + Zustand + i18next + Tailwind v4 版本）以及对仓库当前状态的探索。所有阶段目标保持与现有架构严格兼容；本计划只补充**具体文件、具体动作、决策细化**。

---

## 0. 关键决策（已与用户确认）

| 决策点 | 选择 | 备注 |
| --- | --- | --- |
| 路由拆分 | 拆为 `/`（首页）和 `/editor`（编辑器） | 按"路由 → 目录"重组源码，符合用户原话"根据路由匹配目录，新增首页之后现在的项目目录就会很乱" |
| 首页"演示效果"形态 | 纯静态 HTML/SVG 占位符 | 不复用 `LayoutRenderer` 也不走 store，纯 React 节点 + Tailwind class，性能、隔离、可维护性均最佳 |
| 不依赖真实图片 | 是 | 演示卡片用渐变 + 几何形状模拟版式截图，避免引入二进制资源 |
| 工作语言 | 中文 | 与最新用户输入一致 |

---

## 1. 当前状态分析

### 1.1 现有源代码（已读文件）

- `src/main.tsx`：直接 `ReactDOM.createRoot(...).render(<App/>)`，**没有路由器**；项目里 `react-router-dom` 是已声明依赖但未接入。
- `src/App.tsx`：包含三栏编辑器（`TopBar + Canvas + aside{TabsPanel}`），**这就是当前唯一的页面**。
- `src/components/layout/TopBar.tsx` 等文件都直接被 `App.tsx` 引用，没有通过路由分发。
- 编辑器状态：单一 `useDocumentStore`（Zustand + persist），初始 layout 是 `hscroll`、初始 3 张图。
- `src/i18n/{en,zh-CN}.ts`：键空间已成型（`app.*` / `nav.*` / `layout.*` / `images.*` / `style.*` / `templates.*` / `common.*`），新增 `home.*` 命名空间即可。
- 暗色主题：`useThemeStore` 已实现，`initTheme()` 在 main.tsx 启动时同步应用。
- `a.html`：根目录下散落的演示导出产物文件，无业务关联，**应保留**（用户没要求清理）。

### 1.2 当前"目录乱"的原因

按"路由匹配目录"原则改造后，未来再多一个 `/about` 之类的页面就会陷入扁平结构。当前 `src/components/{canvas,layout,panels,ui,icons}` 是按"角色"组织的，混合了首页/编辑器两类资源。改造后会拆为：

- `src/components/editor/**`：仅编辑器所用（canvas / panels / layout 渲染器 / 与编辑 store 耦合的 UI）
- `src/components/home/**`：仅首页所用（演示卡片、特性卡片、CTA 区块）
- `src/components/shared/**`：跨路由复用（TopBar、ThemeButton、LanguageButton、Button、Field、Switch、ToastContainer、icons）

### 1.3 现有约束

- 必须用 React 19 兼容写法，所有组件保持函数组件 + hooks。
- `react-router-dom@^7` 已声明但 `package.json` 实际未安装（只有依赖说明里出现）。`vite.config.ts` 没有 `vite-plugin-pwa` 的 router fallback——`workbox.navigateFallback` 指向 `/mp-gridpic/index.html`，GH Pages 子路径下 SPA 刷新需 `BrowserRouter` 配 `basename={import.meta.env.BASE_URL}`。
- i18n 现有 `lang detector` 已读 `localStorage`，首页文案必须使用 `t()`。
- 编辑器初始 `clampToLayoutRange(initialImages, initialLayout)` 用的是 layout 0 (hscroll)；首页只渲染演示，**不应触发** store 写入，避免污染 localStorage。
- `index.html` 中 `<title>` 现为 `Grid Pic`；首页需要把 `<title>` 改成符合官网品味的措辞，并通过 i18n 切换语言时同步。
- 用户输入提到"实际演示效果"——按 §0 决策用 React + Tailwind 静态节点表现版式：横滚卡片、品字、双图、瀑布流网格等示意。

---

## 2. 总体实施原则

1. **路由先行**：`src/router.tsx` 注册 `/` 与 `/editor`，`App.tsx` 仅保留 `RouterProvider`。
2. **页面视图与组件分离**：每个路由有自己的 page 组件，page 只负责拼装，不放具体 UI。
3. **页面目录与路由一一对应**：`src/pages/home/HomePage.tsx`、`src/pages/editor/EditorPage.tsx`。
4. **共享组件集中**：`src/components/shared/**` 仅放跨页面复用物。
5. **编辑器零回归**：所有现有逻辑（Canvas / Layout / Panels / Stores）原样保留，只是文件被搬动而行为不变。
6. **首屏文案全部进 i18n**：新增 `home.*` 命名空间（hero / features / showcase / cta / footer 等）。
7. **演示区不读 store**：首页完全静态，使用本地常量数据，避免共享 store 影响编辑器持久化。

---

## 3. 目标目录结构

改造后（新增/移动均带 `★`，未标注的保持位置不变但路径会随 `shared` 整理而调整）：

```text
mp-gridpic/
├── public/
│   └── (favicon.svg, icons/* 保留)
├── src/
│   ├── main.tsx                       # 改为 RouterProvider 入口
│   ├── router.tsx                    ★ 新建: createBrowserRouter
│   ├── App.tsx                        # 改为 <RouterProvider />
│   ├── i18n.ts
│   ├── index.css                      # 微增: home 演示卡片用样式
│   ├── i18n/
│   │   ├── en.ts                      # 增: home.* 命名空间
│   │   └── zh-CN.ts                   # 增: home.* 命名空间
│   ├── pages/                        ★ 新建目录: 路由 → 页面
│   │   ├── home/
│   │   │   ├── HomePage.tsx          ★ 首页外壳
│   │   │   ├── HeroSection.tsx       ★ Hero 区(标题/简介/CTA)
│   │   │   ├── ShowcaseSection.tsx   ★ 版式展示 6 个卡片
│   │   │   ├── ShowcaseCard.tsx      ★ 单个版式占位卡
│   │   │   ├── FeaturesSection.tsx   ★ 功能特性
│   │   │   ├── CtaSection.tsx        ★ 底部行动召唤
│   │   │   ├── HomeFooter.tsx        ★ 页脚
│   │   │   ├── showcasePreviews.ts  ★ 6 个版式占位卡的"形状参数"
│   │   │   └── homeData.ts           ★ 首页纯文案/特性项数据(中英两份聚合,便于消费)
│   │   └── editor/
│   │       └── EditorPage.tsx        ★ 编辑器路由对应页面,把原 App.tsx 中 main+aside 拼装搬来
│   ├── components/
│   │   ├── shared/                   ★ 新建: 跨路由复用 UI
│   │   │   ├── SiteHeader.tsx        ★ 官网顶栏(产品名/导航/语言/主题/打开编辑器)
│   │   │   ├── EditorHeader.tsx      ★ 编辑器顶栏(原 TopBar 改名,行为不变)
│   │   │   ├── Button.tsx            ← 来自 src/components/ui/Button.tsx
│   │   │   ├── Field.tsx             ← 来自 src/components/ui/Field.tsx
│   │   │   ├── Switch.tsx            ← 来自 src/components/ui/Switch.tsx
│   │   │   ├── ToastContainer.tsx    ← 来自 src/components/ui/ToastContainer.tsx
│   │   │   ├── LanguageSwitch.tsx    ★ 抽出: 语言切换按钮(共享给 SiteHeader 与 EditorHeader)
│   │   │   ├── ThemeSwitch.tsx       ★ 抽出: 主题切换按钮(同上)
│   │   │   └── icons/                ← 来自 src/components/icons/
│   │   │       └── LayoutIcon.tsx
│   │   ├── editor/                   ★ 新建: 仅编辑器使用
│   │   │   ├── canvas/               ← 来自 src/components/canvas/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── ImageCaption.tsx
│   │   │   │   └── ImageCell.tsx
│   │   │   ├── layout/               ← 来自 src/components/layout/ 全部
│   │   │   │   ├── DoubleLayout.tsx
│   │   │   │   ├── GridLayout.tsx
│   │   │   │   ├── HScrollLayout.tsx
│   │   │   │   ├── ImageBlock.tsx
│   │   │   │   ├── LayoutRenderer.tsx
│   │   │   │   ├── PyramidLayout.tsx
│   │   │   │   ├── SingleLayout.tsx
│   │   │   │   ├── VScrollLayout.tsx
│   │   │   │   └── WaterfallLayout.tsx
│   │   │   └── panels/               ← 来自 src/components/panels/
│   │   │       ├── ImagesPanel.tsx
│   │   │       ├── LayoutPanel.tsx
│   │   │       ├── StylePanel.tsx
│   │   │       ├── TabsPanel.tsx
│   │   │       └── TemplatesPanel.tsx
│   ├── data/                          # 不变
│   │   ├── layouts.ts
│   │   └── styles.ts
│   ├── hooks/
│   │   ├── useMounted.ts              # 不变
│   │   └── useUrlSync.ts              # 路径变更(./)
│   ├── lib/                           # 不变
│   │   ├── clipboard.ts
│   │   ├── image.ts
│   │   ├── inlineHtml.ts
│   │   └── layoutUtils.ts
│   ├── stores/                        # 不变
│   │   ├── documentStore.ts
│   │   ├── templateStore.ts
│   │   ├── themeStore.ts
│   │   └── toastStore.ts
│   └── types/                         # 不变
│       └── index.ts
└── .trae/documents/
    ├── plan-wechat-image-layout-tool.md
    ├── plan-wechat-image-layout-tool-impl.md
    └── plan-homepage-and-router-impl.md  ★ 本文件
```

> 旧路径 `src/components/{canvas,layout,panels}` 与 `src/components/{ui,icons}` 在改造后**全部删除**，但因为是 `git mv` 风格的纯路径调整，逻辑零回归。

---

## 4. 阶段化任务

### Phase 1：路由基础设施与目录迁移

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 1.1 | `package.json` | 显式声明 `react-router-dom@^7.18.1`（已在 §1.3 标注的范围内）。若发现 `pnpm-lock.yaml` 没装，则 `pnpm add react-router-dom@^7`。 |
| 1.2 | `src/components/ui/*` → `src/components/shared/*` | 4 个文件整体迁移（`Button.tsx` / `Field.tsx` / `Switch.tsx` / `ToastContainer.tsx`），包内 `import` 改为 `../shared/...`。 |
| 1.3 | `src/components/icons/LayoutIcon.tsx` → `src/components/shared/icons/LayoutIcon.tsx` | 同上，更新内部相对 import。 |
| 1.4 | `src/components/canvas/*` → `src/components/editor/canvas/*` | 迁移 3 文件，更新 `Canvas.tsx` 内 `from "../layout/LayoutRenderer"` 为 `from "../layout/LayoutRenderer"`（相对路径仍正确）。 |
| 1.5 | `src/components/layout/*` → `src/components/editor/layout/*` | 迁移 9 文件；`LayoutRenderer.tsx` 内相对 path 已经按 `./DoubleLayout` 等组织，无需修改。**`EditorHeader.tsx` 就是原 `TopBar.tsx` 的改名版**，单独抽出。 |
| 1.6 | `src/components/panels/*` → `src/components/editor/panels/*` | 迁移 5 文件。 |
| 1.7 | 抽 `LanguageSwitch.tsx` | 从 `EditorHeader.tsx`（原 `TopBar.tsx`）抽出 `toggleLanguage`+按钮为独立组件，供 `SiteHeader` / `EditorHeader` 共用。 |
| 1.8 | 抽 `ThemeSwitch.tsx` | 同上，抽出亮暗按钮。 |
| 1.9 | `src/components/shared/EditorHeader.tsx` | 新建：原 `TopBar.tsx` 改名的同时，把语言/主题按钮替换为新抽出的 `LanguageSwitch` / `ThemeSwitch`；GitHub 链接、复制按钮、标题副标题都保留。 |
| 1.10 | `src/pages/editor/EditorPage.tsx` | 新建：把原 `App.tsx` 中 `<div min-h-screen><TopBar/><main><Canvas/><aside><TabsPanel/></aside></main><ToastContainer/></div>` 整段搬过来，**行为零变更**。 |
| 1.11 | `src/router.tsx` | 新建：导出 `router = createBrowserRouter([{ path: "/", element: <HomePage/> }, { path: "/editor", element: <EditorPage/> }], { basename: import.meta.env.BASE_URL })`。 |
| 1.12 | `src/App.tsx` | 改为仅：`<RouterProvider router={router}/>`，外层薄壳保留 Tailwind 主题背景类。 |
| 1.13 | `src/main.tsx` | 不变，仍调用 `initTheme()`。 |
| 1.14 | 验证 | `pnpm dev` 后 `/editor` 与原编辑器完全一致；`/` 暂时 404（Phase 2 再补）。 |

**Phase 1 验收**：

- `pnpm dev`，`/` 跳到 React Router 默认 404 占位但**不报错**。
- `/editor` 与改造前像素级一致（通过浏览器前后对比截图）。
- `pnpm typecheck` 与 `pnpm lint` 全绿。

---

### Phase 2：首页 HomePage 与各 Section

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 2.1 | `src/pages/home/homeData.ts` | 新建：导出 `homeData`，按 i18n 文案键聚合（hero.titleKey / hero.taglineKey / features[] / cta.* 等），中英两份数据完整、对齐。 |
| 2.2 | `src/pages/home/showcasePreviews.ts` | 新建：6 个版式预览参数（`{ id, titleKey, render: () => ReactNode }`），用 React 节点而非字符串，让 React 编译期就校验 DOM。 |
| 2.3 | `src/pages/home/ShowcaseCard.tsx` | 新建：单卡外壳（圆角、边框、固定高度），把 `render()` 输出的节点嵌在 678px 公众号宽度容器里（`max-w-[678px]`）。 |
| 2.4 | `src/pages/home/HeroSection.tsx` | 新建：标题 + 副标题 + 主 CTA "打开编辑器"(`<Link to="/editor">`)+ 次 CTA "查看源码"(`<a href="https://github.com/...">`)。`useTranslation` 读文案。 |
| 2.5 | `src/pages/home/ShowcaseSection.tsx` | 新建：`grid` 排版 6 个 `ShowcaseCard`，hover 时轻微抬升。 |
| 2.6 | `src/pages/home/FeaturesSection.tsx` | 新建：3-4 个特性卡片（10 种版式 / 3 套样式 / 拖拽排序 / 一键复制）。 |
| 2.7 | `src/pages/home/CtaSection.tsx` | 新建：底部"立即开始"大按钮 → `/editor`。 |
| 2.8 | `src/pages/home/HomeFooter.tsx` | 新建：版权 + GitHub 链接 + `<a href="/editor">` 直达入口。 |
| 2.9 | `src/pages/home/HomePage.tsx` | 新建：组合 `<SiteHeader/> + Hero + Showcase + Features + Cta + Footer`，外层 `min-h-screen` + 同 Tailwind 背景类。 |
| 2.10 | `src/router.tsx` | 把 `HomePage` 加入 `/` 路由。 |
| 2.11 | `src/components/shared/SiteHeader.tsx` | 新建：产品名 + 简短 nav（特性 / 展示 / 编辑器直达）+ LanguageSwitch + ThemeSwitch。滚动时不需 sticky（首页单屏）+ 简单顶部底边。 |
| 2.12 | `src/i18n/zh-CN.ts` 与 `src/i18n/en.ts` | 新增命名空间 `home`：`hero.title / hero.tagline / hero.ctaPrimary / hero.ctaSecondary`；`features.featureA.title / .desc` ×3-4；`showcase.*.title / .desc` ×6；`cta.title / .desc / .button`；`footer.copyright / .repo / .editor`。 |
| 2.13 | `index.html` | 把 `<title>` 改成 `mp-gridpic · 公众号图片版式排版工具`，并加 `<meta name="description" ...>`（与现有 OG description 同步）。 |
| 2.14 | `src/i18n.ts` | 复用既有 `languageChanged` 监听，加 `document.title = i18n.t('app.title')` 或 `home.hero.title` 单值更新（带 fallback）。 |

**Phase 2 验收**：

- 打开 `/` 显示完整首页：Hero / 6 个版式预览卡 / 特性 / CTA / 页脚。
- 所有文字随 `LanguageSwitch` 切换。
- 暗色主题切换正常。
- 点击 "打开编辑器" 跳转 `/editor`，与编辑模式下状态兼容（store 不被首页污染——首页不调用任何 store action）。

---

### Phase 3：演示卡片视觉与可访问性打磨

| 步骤 | 文件 | 动作 |
| --- | --- | --- |
| 3.1 | `showcasePreviews.ts` | 为每种版式定义"占位图块"：使用渐变背景 + 居中几何 SVG（如圆环 + 折角线）+ 序号，构成"占位图"的统一视觉语言，避免看起来像"图裂了"。 |
| 3.2 | `ShowcaseSection.tsx` | 增加每卡一个简短说明文字（i18n），鼠标 hover 时整卡抬升 + 阴影加深。 |
| 3.3 | `index.css` | 添加 `.home-card-hover` 类，加入 `transition`，移除把 `transition-all` 散落到组件。 |
| 3.4 | `HomePage.tsx` | 锚点导航：Hero CTA "查看展示" → `#showcase`；SiteHeader 的"特性 / 展示" 分别 `#features` / `#showcase`。 |
| 3.5 | `EditorHeader.tsx` 改造 | 在原 `TopBar` 上加 "回首页"(`<Link to="/">`)，与新 "打开编辑器" 构成跨页导航闭环。 |
| 3.6 | 可访问性 | 演示卡 `role="img"` + `aria-label="三宫格 版式预览"`；CTA 按钮 `aria-label`；SiteHeader 使用 `<nav aria-label="primary">`。 |

**Phase 3 验收**：

- Lighthouse Accessibility ≥ 95。
- 移动端 (≤640px) 单列堆叠；Tablet (≥768px) 双列；Desktop (≥1024px) 三列。
- 全部 `<a>` / `<Link>` 在新标签页跳转（外链）或同页（内链）行为正确。

---

## 5. 文件级详细动作（关键文件的设计细节）

### 5.1 `src/router.tsx`

```ts
import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { EditorPage } from "./pages/editor/EditorPage";

export const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/editor", element: <EditorPage /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
```

### 5.2 `src/pages/home/HomePage.tsx`

```tsx
import { SiteHeader } from "../../components/shared/SiteHeader";
import { Footer } from "./HomeFooter";
import { HeroSection } from "./HeroSection";
import { ShowcaseSection } from "./ShowcaseSection";
import { FeaturesSection } from "./FeaturesSection";
import { CtaSection } from "./CtaSection";

export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors">
      <SiteHeader />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
```

### 5.3 `src/pages/home/ShowcaseCard.tsx`

- 固定高度 220 ~ 260px。
- 内层为 678px 公众号宽度的"假画布"，承载 `showcasePreviews[i].render()`。
- 鼠标 hover：阴影 md → lg、translate-y-px。

### 5.4 `src/pages/home/showcasePreviews.ts`（示意）

```ts
import { LayoutKind } from "../../types";

export interface ShowcasePreview {
  kind: LayoutKind;
  titleKey: string;
  descKey: string;
  render: () => React.ReactNode;
}

export const SHOWCASE_PREVIEWS: ShowcasePreview[] = [
  { kind: "single", titleKey: "home.showcase.single.t", descKey: "home.showcase.single.d", render: SinglePreview },
  // ...
];
```

每个 `XxxPreview` 函数返回只使用 Tailwind class + 内联 SVG 占位的"假版式"节点。例如单图：`<div class="aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-200 to-fuchsia-200 flex items-center justify-center text-zinc-500 text-xs">Placeholder</div>`。

### 5.5 `src/pages/editor/EditorPage.tsx`

```tsx
import { EditorHeader } from "../../components/shared/EditorHeader";
import { Canvas } from "../../components/editor/canvas/Canvas";
import { TabsPanel } from "../../components/editor/panels/TabsPanel";
import { ToastContainer } from "../../components/shared/ToastContainer";
import { useUrlSync } from "../../hooks/useUrlSync";

export function EditorPage() {
  useUrlSync();
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <EditorHeader />
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4"><Canvas /></div>
        <aside className="...lg:overflow-hidden ...">
          <TabsPanel />
        </aside>
      </main>
      <ToastContainer />
    </div>
  );
}
```

### 5.6 `src/components/shared/EditorHeader.tsx`

- 复用原 `TopBar.tsx` 的 UI，包括复制按钮。
- 把 GitHub 链接旁边新增 "首页" `<Link to="/">`。
- 把按钮组件 `LanguageSwitch` / `ThemeSwitch` 内联。

### 5.7 `src/components/shared/SiteHeader.tsx`

- 左侧 logo / 名称 → `/`（用 `<Link>`）。
- 中部 3 个 nav link：特性 / 展示 / 编辑器（跳转 `/editor`）。
- 右侧：`<LanguageSwitch/>` + `<ThemeSwitch/>` + 显眼的 "打开编辑器" 按钮 → `/editor`。

### 5.8 i18n 文案骨架（中）

```ts
home: {
  hero: {
    title: "公众号图片版式排版工具",
    tagline: "10 种版式 · 3 套样式 · 一键粘贴到公众号编辑器",
    ctaPrimary: "打开编辑器",
    ctaSecondary: "在 GitHub 查看",
  },
  features: {
    f1: { title: "10 种内置版式", desc: "单图 / 双图 / 品字 / 多宫格 / 瀑布流 / 横滚 / 纵滚" },
    f2: { title: "版式与样式解耦", desc: "任意版式叠加任意样式,组合自由" },
    f3: { title: "拖拽即排序", desc: "按住拖动,移动端同样可用" },
    f4: { title: "导出微信友好", desc: "全内联样式、白名单标签,粘贴即生效" },
  },
  showcase: {
    single:        { t: "单图大图", d: "封面与重点展示" },
    "double-row":  { t: "双图横排", d: "多角度对比" },
    pyramid:       { t: "品字三图", d: "层次分明" },
    grid:          { t: "九宫格", d: "整齐排布,适合多图" },
    waterfall:     { t: "瀑布流", d: "两列交替,适合长列表" },
    hscroll:       { t: "横向滑动", d: "公众号内可左右滑动" },
  },
  cta: { title: "开始制作你的第一张图", desc: "无需注册,所有数据保存在本地", button: "立即开始" },
  footer: { copyright: "© 2026 Condor Hero", repo: "GitHub", editor: "打开编辑器" },
}
```

英文版关键字段一一对应，`title` / `tagline` 等保持语义。

---

## 6. 假设与权衡

1. **首页不读取 store**：保证首页对 localStorage 零写入，刷新回到 `/editor` 时还原编辑态。
2. **路由参数不变**：`useUrlSync` 仍把 layout/style 写到 query，但首页不消费，避免影响 store。
3. **不引入新依赖**：除 `react-router-dom`（已声明 / 待安装）外不引入任何包。
4. **首页不启用 Service Worker 预缓存**：默认首页为静态资源 + Tailwind，不引入大体积图像。
5. **不创建 `not-found` 页面**：用户没要求；React Router 默认 404 占位即可。
6. **不修改 editor 任何行为**：通过 `EditorPage.tsx` 整体搬运 + 切分 header，避免 bug 风险。
7. **移动端优先**：首页核心交互即为跳转 `/editor`，移动端只调整排版为一列堆叠。

---

## 7. 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| `react-router-dom` 没真实安装 | Phase 1.1 显式 `pnpm add` 后再继续 |
| `import.meta.env.BASE_URL` 取自 `vite.config.ts` 默认 `/` 本地 vs `/mp-gridpic/` 生产 | `router.tsx` 直接使用 `basename` 参数，Vite 自动注入对应值，本地与生产都对 |
| 编辑器搬迁后引用失效 | 用 `git mv` 而非新增 / 删除；Phase 1.14 通过浏览器逐步对比 |
| 首页 i18n 文案缺失导致键值裸露 | 提供 `home.*` 默认键 + `fallbackLng: 'en'`，未补中英文案时显示英文 |
| 暗色模式 i18n 文案同步切换 title | 在 `i18n.ts` 的 `languageChanged` 监听器里 `document.title = ...` |
| `index.html` 静态 title 在 SPA 切换语言时不更新 | 已在 2.14 步骤处理；本地测试需刷新页面才能看到 —— 通过监听器即可热更新 |

---

## 8. 验收标准（最终交付前必过）

### 8.1 功能

- 浏览器打开 `http://localhost:5173/` 显示完整首页。
- 点击 "打开编辑器" 跳转 `/editor`，与改造前编辑器像素级一致。
- 首页所有文字随语言切换；主题切换随按钮切换；状态保持。
- 演示卡显示 6 个不同版式预览（静态），不会因点击或 hover 进入"演示版编辑器"。

### 8.2 目录结构

- `src/pages/{home,editor}/**` 与路由一一对应。
- `src/components/{shared,editor,home}/**` 不混用：home 子目录只在 home 页出现；editor 子目录只在 editor 页出现；shared 是跨页复用。
- `src/components/{canvas,layout,panels,ui,icons}` 旧目录已彻底移除。

### 8.3 工程

- `pnpm typecheck` 通过。
- `pnpm lint` 通过。
- `pnpm build` 通过，生成 `dist/index.html` 与 `dist/assets/*`。

---

## 9. 执行节奏建议

| 工作块 | 步骤数 | 依赖 |
| --- | --- | --- |
| Phase 1：路由 + 迁移 | 14 | 无 |
| Phase 2：首页内容 | 14 | Phase 1 |
| Phase 3：打磨 | 6 | Phase 2 |

执行顺序固定为 1 → 2 → 3。

---

## 10. 一旦计划被接受

执行人需按以下顺序开机：

1. 确认本机已 `pnpm install`。
2. `pnpm add react-router-dom@^7`（如未安装）。
3. 按 Phase 1 → 2 → 3 顺序推进。
4. 每完成一个 Phase，跑 `pnpm typecheck && pnpm lint` 并手动打开 `/` 与 `/editor` 各页面一次。
5. 全部完成后跑 `pnpm build` 验证产物。
