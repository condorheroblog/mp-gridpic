# mp-gridpic

> 公众号纯图片版式排版工具 · 选中版式与样式,一键复制即可粘贴到公众号编辑器。
>
> 🌐 在线访问: <https://condorheroblog.github.io/mp-gridpic/>
> ⭐ 源码仓库: <https://github.com/condorheroblog/mp-gridpic/>

## ✨ 核心特性

- **10 种内置版式**:单图 / 双图横排 / 双图竖排 / 品字 / 二宫格 / 三宫格 / 四宫格 / 瀑布流 / 横向滑动画廊 / 固定高度垂直滚动画廊
- **3 套内置样式**:标准 / 卡片 / 画廊,可微调外层卡片(内边距、圆角、边框、背景)、图片间距、图片圆角、阴影强度、画廊高度、单图占比、图片说明(位置、字号、颜色)
- **版式与样式完全解耦**,支持自定义模板保存与一键复用(布局、样式、组合三类模板分别管理)
- **中英双语 UI、亮 / 暗主题切换**,所有偏好自动写入 `localStorage`
- **拖拽改序**(@dnd-kit),参数实时生效,移动端可完成全部排版操作
- **一键复制富文本到剪贴板**,粘贴进公众号编辑器即生效(全部内联样式,严格遵守公众号静态规范:仅使用白名单标签、容器一律百分比、不写 `font-family`、图片走 HTTPS)
- **PWA**:可安装到桌面 / 移动端主屏,离线可访问

## 🧱 技术栈

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- Zustand 5(persist 中间件,自动写入 `localStorage`)
- i18next + react-i18next(中英双语)
- @dnd-kit/core / sortable / utilities(图片拖拽排序)
- vite-plugin-pwa(Workbox,离线可安装)

## 🚀 开发

```bash
pnpm install
pnpm dev          # 本地开发
pnpm build        # 产物到 dist/
pnpm preview      # 预览构建产物
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test         # vitest run
```

## 📋 使用流程

1. 在右侧面板 **版式** Tab 选择需要的结构,不可用版式(图片数不在其范围内)会自动灰显
2. 在 **图片** Tab 增删图片、替换图片链接、调整宽高比,按住 `≡` 拖动可调整顺序
3. 在 **样式** Tab 切换标准 / 卡片 / 画廊预设,或微调外层卡片样式、图片间距 / 圆角 / 阴影 / 说明文字
4. 在 **模板** Tab 保存当前组合为模板(布局 / 样式 / 组合三类),后续一键复用
5. 点击右上角 **复制到公众号**,到公众号后台正文区 `⌘/Ctrl + V` 即可

## 🖼️ 占位图说明

工具默认使用 `https://picsum.photos/seed/{seed}/{w}/{h}` 作为占位图:

- HTTPS 协议,公众号编辑器可正常拉取
- `seed` 与图片槽位绑定,刷新后保持一致便于预览
- 真实使用时,把每张图替换为自有 HTTPS 图床链接即可(图片面板里可逐张替换)
- 非 HTTPS 的图片链接会自动补全为 `https://`,避免公众号拦截

## 🔒 兼容约束

为了保证粘贴到公众号编辑器后能正常显示:

- 所有样式均为**内联**(`style` 属性),不依赖 `<style>` 与外链 CSS
- 所有图片 `src` 强制 HTTPS,协议非 HTTPS 的链接会自动补全 `https://`
- 导出标签白名单:`section` / `p` / `span` / `img`,避免公众号清洗导致结构错位
- 容器宽度一律百分比,不写 `font-family`,图片不写 `opacity: 0`,文本容器不写 `line-height: 0`
- 圆角 / 阴影用 `<section>` 包裹 `<img>` 实现(公众号会清洗 `img` 上的圆角和阴影)
- 横向 / 纵向滚动使用 `overflow-x/y` + `-webkit-overflow-scrolling:touch`,公众号移动端可正常滚动
- 网格 / 瀑布流使用 `inline-block + 百分比宽度` 实现,避免公众号编辑器去除 `<table>` 后错位

## 📁 目录结构

```
src/
├── components/
│   ├── canvas/      画布与图片渲染(Canvas / ImageCell / ImageCaption)
│   ├── layout/      顶部栏与各版式渲染器(Single / Double / Grid / Pyramid / Waterfall / HScroll / VScroll)
│   ├── panels/      版式 / 图片 / 样式 / 模板面板
│   └── ui/          基础 UI 控件
├── data/            内置版式 / 样式注册表
├── hooks/           通用 hooks
├── i18n/            中英双语文案
├── lib/             通用工具(图片、剪贴板、内联 HTML 生成)
├── stores/          Zustand 状态(document / template / theme / toast)
└── types/           全局类型
```

## 📝 License

[MIT](https://github.com/condorheroblog/mp-gridpic/blob/main/LICENSE) License © 2026-Present [Condor Hero](https://github.com/condorheroblog)