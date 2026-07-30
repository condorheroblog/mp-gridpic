# mp-gridpic

> 公众号纯图片版式排版工具 · 选中版式与样式,一键复制即可粘贴到公众号编辑器。

## ✨ 核心特性

- 10 种内置版式:单图 / 双图横竖排 / 品字 / 2/3/4 宫格 / 瀑布流 / 横向滑动 / 固定区域垂直滚动
- 3 套内置样式:标准 / 卡片 / 画廊,可任意微调圆角、阴影、间距、边距、画廊高度与单图宽度
- 版式与样式完全解耦,支持用户保存自定义模板并一键复用
- 中英双语 UI、亮 / 暗主题切换
- 拖拽改序(@dnd-kit),参数实时生效,移动端可完成全部排版操作
- 一键复制富文本到剪贴板,粘贴进公众号编辑器即生效(全部内联样式,兼容微信白名单)

## 🧱 技术栈

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4
- Zustand(persist 中间件,自动写入 `localStorage`)
- i18next + react-i18next
- @dnd-kit/core / sortable
- vite-plugin-pwa

## 🚀 开发

```bash
pnpm install
pnpm dev          # 本地开发
pnpm build        # 产物到 dist/
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
```

## 📋 使用流程

1. 在右侧 **版式** 面板选择需要的结构
2. 在 **图片** 面板中调整占位图、增删改图片,按住 `≡` 拖动可调整顺序
3. 在 **样式** 面板中切换预设或调整间距 / 圆角 / 阴影等参数
4. 在 **模板** 面板保存当前组合为模板,后续一键复用
5. 点击右上角 **复制到公众号**,到公众号后台正文区 `⌘/Ctrl + V` 即可

## 🖼️ 占位图说明

工具默认使用 `https://picsum.photos/seed/{seed}/{w}/{h}` 作为占位图:

- HTTPS 协议,公众号编辑器会正常拉取
- `seed` 与图片槽位绑定,刷新后保持一致便于预览
- 真实使用时,把每张图替换为自有 HTTPS 图床链接即可(图片面板里可逐张替换)

## 🔒 兼容约束

为了保证粘贴到公众号编辑器后能正常显示:

- 所有样式均为**内联**(`style` 属性),不依赖 `<style>` 与外链 CSS
- 所有图片 `src` 强制 HTTPS,协议非 HTTPS 的链接会自动补全 `https://`
- 横向 / 纵向滚动使用 `overflow-x/y` + `-webkit-overflow-scrolling:touch`,在公众号移动端可正常滚动
- 网格 / 瀑布流使用 `<table>` + `border-collapse:collapse` 实现,避免公众号编辑器去除 `<table>` 后错位

## 📁 目录结构

```
src/
├── components/
│   ├── canvas/      画布与图片渲染
│   ├── layout/      顶部栏、TopBar 与各版式渲染器
│   ├── panels/      版式 / 图片 / 样式 / 模板面板
│   └── ui/          基础 UI 控件
├── data/            内置版式/样式注册表
├── hooks/           通用 hooks
├── i18n/            国际化文案
├── lib/             通用工具(图片、剪贴板、内联 HTML 生成)
├── stores/          Zustand 状态
└── types/           全局类型
```

## 📝 License

[MIT](https://github.com/condorheroblog/mp-gridpic/blob/main/LICENSE) License © 2026-Present [Condor Hero](https://github.com/condorheroblog)
