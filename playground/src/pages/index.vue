<script setup lang="ts">
import type { HighlightTheme, ThemeInput } from '@uni-helper/highlight/theme'
import Code from '@uni-helper/highlight'
import { resolveTheme } from '@uni-helper/highlight/theme'
import { computed, ref } from 'vue'

const isDark = ref(getInitialDark())
const showLineNumbers = ref(true)
const selectable = ref(false)
const wrap = ref(false)

function getInitialDark(): boolean {
  try {
    const { theme } = uni.getSystemInfoSync()
    if (theme)
      return theme === 'dark'
  }
  catch {}
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    return true
  // #endif
  return false
}

// 小程序端没有浏览器窗口，用状态栏高度撑起顶部安全区；H5 走 CSS env()
const statusBarHeight = ref(0)
// #ifndef H5
try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0
}
catch {}
// #endif

const topInsetStyle = computed(() =>
  statusBarHeight.value ? { paddingTop: `${statusBarHeight.value}px` } : {},
)

const theme = computed<ThemeInput>(() => (isDark.value ? 'dark' : 'light'))

const customTheme: Partial<HighlightTheme> = {
  backgroundColor: '#1a1b26',
  foreground: '#c0caf5',
  colors: {
    keyword: '#bb9af7',
    string: '#9ece6a',
    class: '#ff9e64',
    comment: '#565f89',
    sign: '#89ddff',
  },
}

const tsSnippet = `import { createSSRApp } from 'vue'

interface User {
  id: number
  name: string
  tags?: string[]
}

// fetch user info from remote
export async function getUser(id: number): Promise<User | null> {
  const cache = users.find(user => user.id === id)
  return cache ?? null
}`

const vueSnippet = `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
<\/script>

<template>
  <view class="counter" @click="count++">
    {{ count }}
  </view>
</template>`

const jsonSnippet = `{
  "name": "@uni-helper/highlight",
  "version": "0.1.0",
  "keywords": ["uni-app", "highlight", "sugar-high"],
  "sideEffects": false,
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}`

const diffSnippet = `@@ -1,4 +1,5 @@
 function main() {
-  console.log('hello')
+  // greet the world
+  console.log('hello, uni-app')
   main()
 }`

const shellSnippet = `# install the component
pnpm add @uni-helper/highlight

# start dev server
pnpm dev:h5

# build for wechat mini program
pnpm build:mp-weixin`

const pythonSnippet = `from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

def greet(user: User) -> str:
    """Return a friendly greeting."""
    return f"Hello, {user.name}!"`

const cssSnippet = `.card {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  border-radius: 12rpx;
  /* card background */
  background-color: #ffffff;
}`

const layoutSnippet = `export function createOptions<T extends Record<string, unknown>>(options: T, defaults: Partial<T> = {}, overrides: Partial<T> = {}, deepMerge = false): T {
\treturn deepMerge ? mergeDeep(defaults, options, overrides) : { ...defaults, ...options, ...overrides }
}`

interface DemoSection {
  title: string
  desc: string
  lang?: string
  code: string
  theme?: ThemeInput
  tabSize?: number
}

const sections: DemoSection[] = [
  {
    title: 'TypeScript',
    desc: 'lang="ts"：别名自动归一化，接口、类型标注与注释',
    lang: 'ts',
    code: tsSnippet,
  },
  {
    title: 'Vue 单文件组件',
    desc: 'lang="vue"：template 与 script 混合高亮',
    lang: 'vue',
    code: vueSnippet,
  },
  {
    title: 'JSON',
    desc: 'lang="json"',
    code: jsonSnippet,
  },
  {
    title: 'Git Diff',
    desc: 'lang="diff"：行级标注自动加背景色',
    lang: 'diff',
    code: diffSnippet,
  },
  {
    title: 'Shell',
    desc: 'lang="sh"',
    lang: 'sh',
    code: shellSnippet,
  },
  {
    title: 'Python',
    desc: 'lang="py"',
    lang: 'py',
    code: pythonSnippet,
  },
  {
    title: '自定义主题',
    desc: '传入 Partial<HighlightTheme>，未指定的颜色回落到浅色主题',
    lang: 'css',
    code: cssSnippet,
    theme: customTheme,
  },
  {
    title: '长行与 Tab',
    desc: '默认横向滚动（打开"自动换行"对比），Tab 以 tabSize=4 展开',
    lang: 'ts',
    code: layoutSnippet,
    tabSize: 4,
  },
]

const resolvedSections = computed(() =>
  sections.map(section => ({
    ...section,
    theme: section.theme ?? theme.value,
    cardBg: resolveTheme(section.theme ?? theme.value).backgroundColor,
  })),
)

const options = computed(() => [
  { label: '深色模式', value: isDark.value, toggle: () => (isDark.value = !isDark.value) },
  { label: '显示行号', value: showLineNumbers.value, toggle: () => (showLineNumbers.value = !showLineNumbers.value) },
  { label: '文本可复制', value: selectable.value, toggle: () => (selectable.value = !selectable.value) },
  { label: '自动换行', value: wrap.value, toggle: () => (wrap.value = !wrap.value) },
])

function openGithub() {
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open('https://github.com/uni-helper/highlight')
  }
  else {
    uni.showToast({
      icon: 'none',
      title: '请使用浏览器打开',
    })
  }
}
</script>

<template>
  <view class="page" :class="{ 'page--dark': isDark }">
    <view class="toolbar" :style="topInsetStyle">
      <view class="toolbar__inner">
        <text class="toolbar__title">
          Highlight
        </text>
        <view class="toolbar__action" @click="openGithub">
          <text class="toolbar__action-label">
            GitHub
          </text>
        </view>
      </view>
    </view>

    <view class="hero">
      <text class="hero__eyebrow">
        uni-helper
      </text>
      <text class="hero__title">
        Highlight
      </text>
      <text class="hero__subtitle">
        基于 sugar-high 的 uni-app 代码高亮组件
      </text>
    </view>

    <scroll-view class="chips" :scroll-x="true" :show-scrollbar="false">
      <view
        v-for="option in options"
        :key="option.label"
        class="chip"
        :class="{ 'chip--on': option.value }"
        @click="option.toggle()"
      >
        {{ option.label }}
      </view>
    </scroll-view>

    <view v-for="section in resolvedSections" :key="section.title" class="section">
      <text class="section__title">
        {{ section.title }}
      </text>
      <text class="section__desc">
        {{ section.desc }}
      </text>
      <view class="section__card" :style="{ backgroundColor: section.cardBg }">
        <Code
          :code="section.code"
          :lang="section.lang"
          :theme="section.theme"
          :show-line-numbers="showLineNumbers"
          :selectable="selectable"
          :wrap="wrap"
          :tab-size="section.tabSize ?? 2"
        />
      </view>
    </view>

    <view class="footer">
      <view class="footer__link" @click="openGithub">
        <text class="footer__label">
          uni-helper/highlight
        </text>
      </view>
      <text class="footer__hint">
        MIT License
      </text>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f2f2f7;
  color: #1d1d1f;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

.page--dark {
  background-color: #000000;
  color: #f5f5f7;
}

/* 顶部工具栏：半透明材质，内容从下方滚过 */
.toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top);
  background-color: rgba(242, 242, 247, 0.78);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.page--dark .toolbar {
  background-color: rgba(22, 22, 24, 0.75);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.toolbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
}

.toolbar__title {
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.toolbar__action {
  margin-right: -12rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.toolbar__action:active {
  opacity: 0.5;
  transform: scale(0.94);
}

.toolbar__action-label {
  font-size: 30rpx;
  font-weight: 500;
  color: #007aff;
}

.page--dark .toolbar__action-label {
  color: #0a84ff;
}

/* 大标题 */
.hero {
  padding: 40rpx 32rpx 8rpx;
  animation: hero-in 500ms cubic-bezier(0.25, 0.1, 0.25, 1) both;
}

.hero__eyebrow {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #007aff;
}

.page--dark .hero__eyebrow {
  color: #0a84ff;
}

.hero__title {
  display: block;
  margin-top: 8rpx;
  font-size: 64rpx;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero__subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  line-height: 1.4;
  color: rgba(60, 60, 67, 0.6);
}

.page--dark .hero__subtitle {
  color: rgba(235, 235, 245, 0.6);
}

/* 选项胶囊 */
.chips {
  box-sizing: border-box;
  padding: 24rpx 16rpx 8rpx;
  white-space: nowrap;
}

.chip {
  display: inline-block;
  margin-left: 16rpx;
  height: 68rpx;
  line-height: 68rpx;
  padding: 0 30rpx;
  border-radius: 999rpx;
  font-size: 27rpx;
  font-weight: 500;
  background-color: rgba(120, 120, 128, 0.12);
  color: #3a3a3c;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    transform 150ms ease,
    opacity 150ms ease;
}

.page--dark .chip {
  background-color: rgba(120, 120, 128, 0.24);
  color: #f5f5f7;
}

.chip--on {
  background-color: #007aff;
  color: #ffffff;
}

.page--dark .chip--on {
  background-color: #0a84ff;
}

.chip:active {
  opacity: 0.85;
  transform: scale(0.94);
}

/* 代码展示分区 */
.section {
  margin: 40rpx 32rpx 0;
}

.section__title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.section__desc {
  display: block;
  margin: 8rpx 0 20rpx;
  font-size: 26rpx;
  line-height: 1.45;
  color: rgba(60, 60, 67, 0.6);
}

.page--dark .section__desc {
  color: rgba(235, 235, 245, 0.6);
}

.section__card {
  overflow: hidden;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
}

/* H5 端隐藏代码块横向滚动条，露出裁切边缘即可提示可滚动 */
.section__card :deep(.uh-highlight .uni-scroll-view) {
  scrollbar-width: none;
}

.section__card :deep(.uh-highlight .uni-scroll-view::-webkit-scrollbar) {
  display: none;
}

.page--dark .section__card {
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

/* 页脚 */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 56rpx;
  padding: 0 32rpx calc(48rpx + env(safe-area-inset-bottom));
}

.footer__link {
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  transition: opacity 150ms ease;
}

.footer__link:active {
  opacity: 0.5;
}

.footer__label {
  font-size: 28rpx;
  font-weight: 500;
  color: #007aff;
}

.page--dark .footer__label {
  color: #0a84ff;
}

.footer__hint {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: rgba(60, 60, 67, 0.6);
}

.page--dark .footer__hint {
  color: rgba(235, 235, 245, 0.6);
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(12rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero {
    animation: none;
  }

  .chip,
  .toolbar__action,
  .footer__link {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .toolbar {
    background-color: #f2f2f7;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .page--dark .toolbar {
    background-color: #161618;
  }
}
</style>
