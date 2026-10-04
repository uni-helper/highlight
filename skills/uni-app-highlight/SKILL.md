---
name: uni-app-highlight
description: 在 uni-app（Vue 3）项目中使用 @uni-helper/highlight 实现轻量级代码高亮。当需要在 uni-app 页面或组件中展示、美化代码片段（小程序 / H5 / App），配置高亮主题、行号、自动换行，或用 tokenizeToLines 自定义渲染时使用；排查小程序下代码高亮的空格折叠、颜色不生效等问题时也使用。提到 uni-app 代码高亮、代码块组件、sugar-high、@uni-helper/highlight 时，即使用户没有明说"高亮"也应使用。
---

# @uni-helper/highlight

基于 sugar-high 的 uni-app 代码高亮组件，gzip 后约 1.5 kB，内置 30+ 种语言与亮 / 暗两套主题。
渲染纯 `<view>`/`<text>` 节点加内联样式，不依赖 DOM、不使用 `rich-text`、没有运行时渲染函数，因此小程序、H5、App（vue）全部可用。

前置要求：uni-app Vue 3 项目（`vue >= 3.3`）。

## 安装与基本用法

```sh
pnpm add @uni-helper/highlight
```

```vue
<script setup lang="ts">
import Code from '@uni-helper/highlight'
</script>

<template>
  <Code
    :code="snippet"
    lang="ts"
    theme="dark"
    show-line-numbers
  />
</template>
```

包的入口就是原始 `.vue` 单文件组件（不是打包后的 JS）。uni-app 编译器只有在 import 直接解析到 `.vue` 文件时才能静态注册组件，所以不要用 alias 把这个导入重定向到自建产物，正常安装即可在所有平台开箱即用。

## Props

| 属性              | 类型                                           | 默认值    | 说明                                            |
| ----------------- | ---------------------------------------------- | --------- | ----------------------------------------------- |
| `code`            | `string`                                       | （必填）  | 需要高亮的源代码                                |
| `lang`            | `string`                                       | （无）    | 语言名、别名或扩展名，如 `ts`、`.tsx`、`python` |
| `theme`           | `'light' \| 'dark' \| Partial<HighlightTheme>` | `'light'` | 主题预设或自定义覆盖项                          |
| `showLineNumbers` | `boolean`                                      | `false`   | 左侧渲染行号                                    |
| `tabSize`         | `number`                                       | `2`       | 制表符展开的空格数                              |
| `wrap`            | `boolean`                                      | `false`   | `true` 长行自动换行；`false` 横向滚动           |
| `customClass`     | `string`                                       | （无）    | 追加到根节点（scroll-view）上的类名             |

语言规则：接受规范名（`typescript`）、别名（`ts`）和扩展名（`.tsx`），大小写不敏感、点号可省略。未知语言回退到 JavaScript 词法分析器（不会报错）；传 `plaintext` 可完全禁用高亮。用 `lang="diff"` 时，`+`/`-` 行会按主题的 `lineColors` 自动加整行背景。完整语言与别名映射见 sugar-high skill。

## 主题

内置 sugar-high 官方亮 / 暗两套配色：

```vue
<Code :code="snippet" theme="dark" />
```

传入部分主题对象可覆盖任意颜色。注意：**部分对象是在亮色主题基础上合并的，不是在当前主题上**。要在暗色基础上改色，先展开 `darkTheme`：

```ts
import { darkTheme } from '@uni-helper/highlight/theme'

// 在暗色基础上覆盖关键字颜色
const theme = { ...darkTheme, colors: { ...darkTheme.colors, keyword: '#bb9af7' } }

// 只传 colors 时基于亮色主题合并
const lightOverride = { colors: { string: '#9ece6a' } }
```

```vue
<Code :code="snippet" :theme="theme" />
```

`@uni-helper/highlight/theme` 还导出 `lightTheme`、`darkTheme` 和 `resolveTheme`。主题结构：

```ts
interface HighlightTheme {
  backgroundColor: string
  foreground: string
  /** 每个 token 类型的文字颜色 */
  colors: Partial<Record<TokenType, string>>
  /** 行注释对应的整行背景色，例如 `diff-add`、`markdown-heading` */
  lineColors: Record<string, string>
}
```

## 底层 API：tokenizeToLines

需要自定义渲染（非默认 UI、嵌入其他渲染器）时，用数据模型自己画，全程不碰 DOM：

```ts
import { tokenizeToLines } from '@uni-helper/highlight/tokenize'

const lines = tokenizeToLines('const a = 1', { lang: 'ts', theme: 'dark' })
// [{ index, value, tokens: [...], className, backgroundColor?, blank }]
```

- `CodeLine`：`index`、`value`、`tokens`、`className`（如 `sh__line sh__line--diff-add`）、`backgroundColor?`（由行注释和 `lineColors` 得出）、`blank`（是否为空行）
- `CodeToken`：`type`、`value`（原始值）、`text`（展示值）、`color?`、`className`（如 `sh__token--keyword`）

自己渲染 token 时用 `text`，不要用 `value`：小程序 `<text>` 内连续普通空格会被折叠、制表符不可靠，`text` 已把 tab 展开为空格（按 `tabSize`）、连续空格替换为不换行空格。空行同理：`blank` 为 `true` 的行要渲染一个 NBSP 占位，否则行高会塌掉。

## 平台与样式注意事项

- 颜色以内联样式呈现，因为小程序上页面样式无法可靠作用到组件内部。改配色用 `theme` prop，不要指望在小程序里用 CSS 覆盖 token 颜色。
- H5 等支持的平台可以叠加 CSS：组件类名有 `uh-highlight`（根节点是一个 `scroll-view`）、`uh-highlight__line`、`uh-highlight__token`、`uh-highlight__line-number`、`uh-highlight__blank`，以及修饰类 `uh-highlight--wrap` / `uh-highlight--scroll`。节点上还保留了 sugar-high 语义类名（`sh__line`、`sh__token--keyword`、`sh__line--diff-add` 等），定制样式时优先基于语义类名。
- 组件未开启 `virtualHost`，小程序上组件会多出一层宿主节点（默认 `display: block`）。写在标签上的 `style` 落在宿主节点上：`padding`、`margin`、背景、边框、`width` 等盒模型属性直接生效；`font-size`、`line-height` 等继承属性会传入组件内部，直接写即可。写在标签上的 `class` 只能修饰宿主节点本身；要让类名作用到组件根节点（scroll-view），用 `custom-class` prop 并配合页面级 CSS。
- 默认字号 13px、行高 1.6：微信小程序上由组件的 `:host` 样式提供，H5 / App 上由根节点类名提供。标签上的 inline style 优先于默认值；组件自身不写死字号，外部设置多少就渲染多少。
- `wrap` 为 `false`（默认）时根节点是 `scroll-x` 的 scroll-view，长代码横向滚动；外层容器需要给定宽度，否则滚动区域不生效。
