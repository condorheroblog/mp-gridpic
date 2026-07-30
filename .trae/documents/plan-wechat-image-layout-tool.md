# 公众号纯图片排版工具实施方案

## 1. 项目现状与技术基线

当前仓库技术栈并非 Vue，而是：

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4
- Zustand
- i18next + react-i18next
- PWA（vite-plugin-pwa）

当前代码状态非常早期：

- `src/App.tsx` 为空
- `src/main.tsx` 已接入 i18n，并引用了尚未落地的 `themeStore`
- 已有中英文国际化目录结构
- 已有亮暗主题意图，但主题存储模块缺失

这意味着本次功能适合直接按“完整单页工具”方式搭建，避免后期重构成本。

## 2. 产品目标

开发一个**微信公众号专属的纯图片排版工具**，仅处理图片布局与图片样式，不提供文字编辑能力。产物需支持：

- 在工具内完成图片数量增删、顺序拖拽、布局切换、样式调整、模板保存
- 实时预览排版效果
- 一键复制为**可粘贴到公众号编辑器**的 HTML 内容
- 兼容中英文双语、亮暗主题、桌面端与移动端操作

## 3. 关键兼容性结论

### 3.1 导出必须采用内联样式 HTML

公众号编辑器对外部 CSS 和脚本支持非常有限，因此导出内容必须采用：

- 纯 HTML 结构
- 所有样式写入 `style=""`
- 不依赖 `<style>`、JS、事件处理器、复杂选择器

### 3.2 图片资源必须走 HTTPS，且应使用稳定可访问来源

不实现上传功能的前提下，默认图片应使用**HTTPS 占位图**。为降低微信对第三方图床拦截的不确定性，建议采用：

- 项目静态资源内置占位图，随站点部署
- 导出时使用绝对 HTTPS 地址，例如当前 GitHub Pages 域名下的占位图

不建议默认依赖不受控的第三方占位图库。

### 3.3 滚动布局可做，但实现需“微信友好”

本项目中的横向滑动画廊、固定区域垂直滚动画廊，均按以下原则实现：

- 使用结构化容器 + 内联 `overflow-x/overflow-y`
- 仅依赖浏览器原生滚动
- 不依赖脚本、手势库、动画运行时
- 不依赖 sticky / fixed / complex grid hacks 等高风险样式

### 3.4 复制能力需要双通道兜底

为了兼容桌面端与移动端，导出采用两级策略：

1. 优先使用 Clipboard API 写入 `text/html`
2. 回退到隐藏可编辑节点 + `execCommand("copy")`

同时保留一个“导出源码面板”，用于极端设备上的手动复制兜底。

## 4. 功能范围定义

### 4.1 本次纳入范围

- 单图、双图、多图基础排版
- 横向滑动画廊
- 固定高度垂直滑动画廊
- 图片增删改序
- 图片边距、圆角、阴影、间距配置
- 布局模板与样式模板分离
- 模板保存与复用
- 实时预览
- 一键复制到剪贴板
- 中英双语
- 亮暗主题
- 移动端可操作

### 4.2 明确不纳入范围

- 图片上传
- 图片裁剪、压缩、滤镜
- 文字、标题、段落编辑
- 云端账户体系
- 服务端渲染

## 5. 推荐信息架构

建议采用单页工具结构：

1. 顶部栏
2. 左侧布局面板（移动端折叠为抽屉）
3. 中间实时预览区
4. 右侧样式面板（移动端折叠为抽屉）
5. 底部导出/复制操作区

### 5.1 顶部栏

- 产品名称
- 语言切换
- 主题切换
- 新建画布
- 保存模板
- 复制到公众号

### 5.2 布局面板

- 布局类型选择
- 图片列表管理
- 添加图片槽位
- 删除图片槽位
- 拖拽调整顺序
- 预设布局模板选择

### 5.3 样式面板

- 全局容器宽度与留白
- 图片圆角
- 图片阴影
- 图片间距
- 单图边距
- 画廊滚动区域高度
- 样式模板选择与保存

### 5.4 预览区

- 编辑态预览
- 接近公众号宽度的预览容器
- 导出态 HTML 预检查

### 5.5 导出区

- 复制富文本 HTML
- 查看导出源码
- 复制源码
- 兼容性提示

## 6. 核心架构设计

## 6.1 布局与样式完全解耦

核心原则：

- **布局**决定 DOM 结构与图片排列关系
- **样式**决定视觉外观与局部尺寸参数

建议数据模型拆分为：

```ts
type LayoutKind =
	| "single"
	| "two-column"
	| "grid"
	| "masonry-like"
	| "horizontal-scroll"
	| "vertical-scroll";

type ImageItem = {
	id: string;
	src: string;
	alt: string;
	ratio: number;
};

type LayoutConfig = {
	kind: LayoutKind;
	columns?: number;
	rowLimit?: number;
	scrollHeight?: number;
};

type StyleConfig = {
	containerPadding: number;
	imageGap: number;
	imageRadius: number;
	imageShadow: "none" | "sm" | "md" | "lg";
	imagePadding: number;
	backgroundColor: string;
};

type CompositionDocument = {
	images: ImageItem[];
	layout: LayoutConfig;
	style: StyleConfig;
};
```

页面运行时始终围绕 `CompositionDocument` 渲染；模板保存时拆分保存为：

- `layout-presets`
- `style-presets`
- `composed-presets`

## 6.2 组件层划分

建议目录：

```text
src/
  app/
  components/
    shell/
    controls/
    preview/
    export/
    dnd/
  features/
    editor/
    layout-engine/
    style-engine/
    preset-library/
    export-html/
    clipboard/
    i18n/
    theme/
  stores/
  hooks/
  utils/
  types/
```

建议关键模块：

- `features/editor`：聚合编辑器状态与动作
- `features/layout-engine`：把布局配置转成预览结构
- `features/style-engine`：把样式配置转成预览样式与导出样式
- `features/export-html`：生成公众号兼容 HTML
- `features/clipboard`：封装多策略复制
- `features/preset-library`：本地模板保存与读取
- `stores/themeStore`：补齐当前缺失的主题状态

## 6.3 状态管理策略

使用 Zustand 即可，无需额外引入复杂状态库。

建议拆为三个 store：

1. `editorStore`
   - 当前图片列表
   - 当前布局
   - 当前样式
   - 当前模板选择

2. `uiStore`
   - 语言
   - 主题
   - 面板开合
   - 当前复制状态

3. `presetStore`
   - 内置模板
   - 本地自定义模板

持久化使用 `localStorage`。

## 7. 布局引擎方案

本项目不建议让每种布局各自写一套完全独立页面逻辑，而建议统一抽象为：

- `LayoutDefinition`
- `PreviewRenderer`
- `ExportRenderer`

```ts
type LayoutDefinition = {
	id: LayoutKind;
	minImages: number;
	maxImages?: number;
	supportsScroll: boolean;
	renderPreview: (doc: CompositionDocument) => ReactNode;
	renderExport: (doc: CompositionDocument) => string;
};
```

这样布局新增时，不会污染整个编辑器。

### 首批内置布局

1. 单图大图
2. 双图并排
3. 三图品字
4. 三列网格
5. 自适应多图网格
6. 横向滑动画廊
7. 固定区域垂直滑动画廊

## 8. 占位图策略

不实现上传时，建议内置一组项目自托管占位图：

- `public/placeholders/placeholder-1.png`
- `public/placeholders/placeholder-2.png`
- `public/placeholders/placeholder-3.png`
- ...

导出时统一转换为绝对地址：

```ts
const PUBLIC_ASSET_ORIGIN = "https://condorheroblog.github.io";
const BASE_PATH = "/mp-gridpic";
```

最终 `src` 类似：

```text
https://condorheroblog.github.io/mp-gridpic/placeholders/placeholder-1.png
```

这样既满足 HTTPS，也避免第三方占位图不可控。

## 9. 导出与复制方案

## 9.1 导出目标

导出内容不是“应用页面 HTML”，而是“公众号文章片段 HTML”。

要求：

- 根节点尽量简洁
- 不带 React 标记
- 不带 class 名依赖
- 不带脚本
- 所有样式内联

## 9.2 导出模块职责

`export-html` 模块负责：

- 把运行时文档模型转成纯 HTML 字符串
- 只输出白名单标签：`section`、`p`、`img`、`span`
- 统一 style 字符串顺序，降低粘贴差异
- 自动补齐 `max-width:100%;height:auto;display:block;`

## 9.3 复制策略

复制按钮流程：

1. 先生成 HTML 字符串
2. 生成富文本片段
3. 写入 `text/html`
4. 同时写入 `text/plain`
5. 成功后提示“请直接粘贴到公众号编辑器”

兜底：

- 若 `navigator.clipboard.write` 不可用，则使用 `copy` 事件注入 `text/html`
- 若系统仍拒绝，则展示源码弹层，允许用户手动复制

## 10. 国际化与主题方案

## 10.1 双语

沿用现有 i18next 结构：

- `src/i18n/zh-CN.ts`
- `src/i18n/en.ts`

文案按命名空间组织：

- `app`
- `toolbar`
- `layout`
- `style`
- `export`
- `template`
- `message`

## 10.2 亮暗主题

补齐 `themeStore`，使用 `html.dark` 控制 Tailwind 变量。

主题原则：

- 编辑器 UI 完整支持亮暗模式
- 导出 HTML 默认与主题无关，保持内容稳定
- 导出预览可提供“公众号白底模式”固定展示

## 11. 移动端交互方案

移动端不做桌面缩减版，而是完整可用版。

重点策略：

- 左右面板改为底部抽屉 / 顶部切换标签
- 拖拽句柄加大点击区域
- 参数控件优先使用滑块 + 数字输入组合
- 预览区支持吸顶
- 复制按钮常驻底部操作栏

## 12. 建议依赖

在不破坏现有栈的前提下，建议新增：

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `clsx`

说明：

- 拖拽排序用 `dnd-kit`，移动端体验优于手写
- 样式类拼接用 `clsx`
- 不建议引入重量级 UI 框架，避免偏离当前轻量架构

## 13. 分阶段开发计划

### Phase 1：应用骨架与基础能力

- 搭建页面 Shell
- 补齐 `themeStore`
- 初始化 i18n 文案
- 建立 Zustand stores
- 建立基础路由或单页入口
- 接入亮暗主题与本地持久化

### Phase 2：基础排版能力

- 单图、双图、多图网格布局
- 图片槽位增删
- 占位图轮换
- 样式参数控制
- 实时预览

### Phase 3：高级画廊布局

- 横向滑动画廊
- 固定区域垂直滑动画廊
- 拖拽排序
- 移动端手势可用性优化

### Phase 4：模板体系

- 内置布局模板
- 内置样式模板
- 自定义模板保存
- 模板组合复用

### Phase 5：导出与复制

- HTML 导出器
- 富文本复制
- 源码查看与手动复制兜底
- 公众号粘贴结果验证

### Phase 6：打磨与验收

- 中英文补全
- 暗色主题细化
- 移动端适配
- 可访问性修正
- 性能与边界测试

## 14. 测试与验收标准

### 功能验收

- 可新增/删除图片槽位
- 可拖拽排序
- 布局切换后预览即时更新
- 样式修改即时生效
- 模板可保存、可复用、可删除
- 可成功复制 HTML

### 兼容性验收

- Chrome 桌面端
- Safari iPhone
- 微信内置浏览器
- 公众号编辑器粘贴后结构不乱
- 公众号移动端预览可正常滚动

### 性能验收

- 20 张占位图以内编辑无明显卡顿
- 样式调整响应时间 < 100ms
- 首屏加载保持轻量

## 15. 风险与应对

### 风险 1：微信对外部图片源抓取不稳定

应对：

- 默认使用自托管 HTTPS 占位图
- 为后续真实图片替换预留 `src` 替换入口

### 风险 2：部分移动端浏览器复制 HTML 权限不足

应对：

- 多策略复制
- 提供源码弹层兜底

### 风险 3：微信清洗部分样式

应对：

- 导出器只允许低风险内联属性
- 优先使用 `section/p/img/span`
- 尽量减少复杂布局语义

## 16. 推荐实施顺序

推荐按以下顺序正式开发：

1. 修复当前空壳应用与缺失的主题模块
2. 建立编辑器状态模型
3. 完成基础布局与样式控制
4. 完成滚动画廊
5. 完成模板系统
6. 完成导出复制
7. 做移动端与公众号真实验证

## 17. 本次计划结论

基于当前仓库，完全可以在现有 React 技术栈内落地该工具，无需切换框架。核心成功点不在“页面画得多漂亮”，而在三件事：

- 布局与样式模型必须解耦
- 导出 HTML 必须微信友好且全量内联
- 默认图片资源必须 HTTPS 且可被微信稳定抓取

按上述方案推进，可以较稳地实现一个可真正用于公众号图片排版的生产型工具。
