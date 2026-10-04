<script setup lang="ts">
import type { ThemeInput } from './theme'
import { computed } from 'vue'
import { resolveTheme } from './theme'
import { NBSP, tokenizeToLines } from './tokenize'

interface Props {
  /** Source code to highlight */
  code: string
  /**
   * Language name, alias, or extension, e.g. `ts`, `.tsx`, `python`.
   * Unknown names fall back to the JavaScript lexer. Use `plaintext`
   * to disable highlighting.
   */
  lang?: string
  /** `'light'`, `'dark'`, or a partial theme object */
  theme?: ThemeInput
  /** Render line numbers on the left */
  showLineNumbers?: boolean
  /** Number of spaces a tab expands to */
  tabSize?: number
  /**
   * Wrap long lines instead of scrolling horizontally.
   * Defaults to `false`.
   */
  wrap?: boolean
}

defineOptions({
  options: {
    // merge external class/style into the root scroll-view on mini-programs
    virtualHost: true,
  },
})

const props = withDefaults(defineProps<Props>(), {
  lang: undefined,
  theme: undefined,
  showLineNumbers: false,
  tabSize: 2,
  wrap: false,
})

const theme = computed(() => resolveTheme(props.theme))
const lines = computed(() =>
  tokenizeToLines(props.code, {
    lang: props.lang,
    theme: theme.value,
    tabSize: props.tabSize,
  }),
)

const rootStyle = computed(() => ({
  backgroundColor: theme.value.backgroundColor,
  color: theme.value.foreground,
}))

const bodyStyle = computed(() =>
  props.wrap ? {} : { display: 'inline-block' },
)

function lineNumberText(index: number): string {
  const width = String(lines.value.length).length
  return String(index + 1).padStart(width, NBSP)
}

const lineNumberStyle = computed(() => ({
  color: theme.value.colors.sign ?? theme.value.foreground,
}))

function lineStyle(line: { backgroundColor?: string }): Record<string, string> {
  return {
    whiteSpace: props.wrap ? 'normal' : 'nowrap',
    ...(line.backgroundColor ? { backgroundColor: line.backgroundColor } : {}),
  }
}

function tokenStyle(token: { color?: string }): Record<string, string> {
  return token.color ? { color: token.color } : {}
}
</script>

<template>
  <scroll-view
    class="uh-highlight"
    :class="`uh-highlight--${props.wrap ? 'wrap' : 'scroll'}`"
    :scroll-x="!props.wrap"
    :style="rootStyle"
  >
    <view class="uh-highlight__body" :style="bodyStyle">
      <view
        v-for="line in lines"
        :key="line.index"
        class="uh-highlight__line"
        :class="line.className"
        :style="lineStyle(line)"
      >
        <text
          v-if="showLineNumbers"
          class="uh-highlight__line-number"
          :style="lineNumberStyle"
        >
          {{ lineNumberText(line.index) }}{{ NBSP }}{{ NBSP }}
        </text>
        <text
          v-for="(token, tokenIndex) in line.tokens"
          :key="tokenIndex"
          class="uh-highlight__token"
          :class="token.className"
          :style="tokenStyle(token)"
        >
          {{ token.text }}
        </text>
        <text
          v-if="line.blank"
          class="uh-highlight__blank"
        >
          {{ NBSP }}
        </text>
      </view>
    </view>
  </scroll-view>
</template>

<style>
.uh-highlight {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: 13px;
  line-height: 1.6;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  -webkit-text-size-adjust: none;
}

.uh-highlight__line {
  display: block;
  white-space: nowrap;
}

.uh-highlight__token,
.uh-highlight__line-number,
.uh-highlight__blank {
  display: inline;
  /* 跟随所在行：非换行模式继承 nowrap，换行模式继承 normal，
     避免 uni-h5 给 uni-text 默认的 pre-line 造成意外折行 */
  white-space: inherit;
}
</style>
