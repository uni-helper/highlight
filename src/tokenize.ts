import type { ParsedLine, ParseOptions, TokenType } from 'sugar-high/core'
import type { HighlightTheme, ThemeInput } from './theme'
import { parse } from 'sugar-high/core'
import { languages, lang as normalizeLang } from 'sugar-high/lang'
import { resolveTheme } from './theme'

export type { HighlightTheme, ThemeInput } from './theme'

export interface CodeToken {
  type: TokenType
  /** token 的原始文本 */
  value: string
  /**
   * 可安全用于小程序 `<text>` 组件的展示文本。
   * 制表符展开为空格，连续空格串替换为不换行空格，
   * 因为小程序端连续的普通空格会被折叠。
   */
  text: string
  /** 解析后的文本颜色，`undefined` 表示回退到主题前景色 */
  color?: string
  /** sugar-high 语义类名，例如 `sh__token--keyword` */
  className: string
}

export interface CodeLine {
  index: number
  value: string
  tokens: CodeToken[]
  /** sugar-high 语义类名，例如 `sh__line sh__line--diff-add` */
  className: string
  /** 行注解（diff、markdown）对应的行背景色 */
  backgroundColor?: string
  /** 完全空白的行。渲染时应填充内容以撑起行高 */
  blank: boolean
}

export interface TokenizeOptions {
  /** 语言名称、别名或扩展名，例如 `ts`、`.tsx`、`python` */
  lang?: string
  theme?: ThemeInput
  /** 制表符展开后的空格数 */
  tabSize?: number
}

export const NBSP = '\u00A0'

/** 未知语言时 sugar-high 回退使用的 JavaScript 解析配置（含注释与字符串规则） */
const javascriptConfig: ParseOptions = languages.find(
  language => language.id === 'javascript',
)!.config!

/**
 * 将语言名称（标准名、别名、扩展名，可带前导点、大小写不限）
 * 解析为对应的 sugar-high 解析配置。未知名称回退到 JavaScript
 * 配置，与 `highlight()` 的默认行为一致。
 */
export function resolveLanguageConfig(lang?: string): ParseOptions {
  if (!lang)
    return javascriptConfig
  const canonical = normalizeLang(lang)
  const language = canonical
    ? languages.find(candidate => candidate.id === canonical)
    : undefined
  return language?.config ?? javascriptConfig
}

/** 制表符和连续空格在小程序 `<text>` 节点内渲染不可靠 */
function toDisplayText(value: string, tabSize: number): string {
  if (!value)
    return value
  return value
    .replace(/\t/g, ' '.repeat(tabSize))
    .replace(/ {2,}/g, spaces => NBSP.repeat(spaces.length))
}

function transformToken(
  { type, value }: ParsedLine['tokens'][number],
  theme: HighlightTheme,
  tabSize: number,
): CodeToken {
  return {
    type,
    value,
    text: toDisplayText(value, tabSize),
    color: theme.colors[type],
    className: `sh__token--${type}`,
  }
}

function transformLine(
  line: ParsedLine,
  theme: HighlightTheme,
  tabSize: number,
): CodeLine {
  const backgroundColor = line.annotations
    .map(annotation => theme.lineColors[annotation])
    .find(color => color)
  return {
    index: line.index,
    value: line.value,
    tokens: line.tokens.map(token => transformToken(token, theme, tabSize)),
    className: `sh__line${line.annotations.map(annotation => ` sh__line--${annotation}`).join('')}`,
    backgroundColor,
    blank: line.tokens.length === 0,
  }
}

/**
 * 将 `code` 高亮为逐行的渲染模型，全程不操作 DOM，
 * 因此结果可以在所有 uni-app 平台上用 `<view>`/`<text>` 节点渲染。
 */
export function tokenizeToLines(code: string, options?: TokenizeOptions): CodeLine[] {
  const theme = resolveTheme(options?.theme)
  const tabSize = options?.tabSize ?? 2
  const normalized = code.replace(/\r\n?/g, '\n')
  const parsed = parse(normalized, resolveLanguageConfig(options?.lang))
  return parsed.lines.map(line => transformLine(line, theme, tabSize))
}
