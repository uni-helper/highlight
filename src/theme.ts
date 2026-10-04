import type { TokenType } from 'sugar-high/core'

export interface HighlightTheme {
  /** 代码块背景色 */
  backgroundColor: string
  /** 默认文本颜色，应用于标识符和空白字符 */
  foreground: string
  /** 各 token 类型的文本颜色，未指定的类型回退到 `foreground` */
  colors: Partial<Record<TokenType, string>>
  /**
   * 各行注解对应的行背景色，例如语言预设生成的
   * `diff-add` 或 `markdown-heading`。
   */
  lineColors: Record<string, string>
}

/** 取自 sugar-high 官方文档站的配色 */
export const lightTheme: HighlightTheme = {
  backgroundColor: '#ffffff',
  foreground: '#354150',
  colors: {
    keyword: '#f47067',
    string: '#00a99a',
    class: '#8d85ff',
    property: '#4e8fdf',
    entity: '#665ac7',
    jsxliterals: '#bf7db6',
    sign: '#8996a3',
    comment: '#a19595',
  },
  lineColors: {
    'diff-add': 'rgba(46, 160, 67, 0.15)',
    'diff-remove': 'rgba(248, 81, 73, 0.15)',
    'diff-hunk': 'rgba(56, 139, 253, 0.15)',
    'diff-meta': 'rgba(56, 139, 253, 0.08)',
  },
}

export const darkTheme: HighlightTheme = {
  backgroundColor: '#0d1117',
  foreground: '#d4d4d4',
  colors: {
    keyword: '#ffada8',
    string: '#88bbb6',
    class: '#7eb5ff',
    property: '#79c0ff',
    entity: '#b7adff',
    jsxliterals: '#d2a8ff',
    sign: '#8b949e',
    comment: '#8b8b8b',
  },
  lineColors: lightTheme.lineColors,
}

export type ThemeInput = 'light' | 'dark' | Partial<HighlightTheme>

export function resolveTheme(input?: ThemeInput): HighlightTheme {
  if (input === 'dark')
    return darkTheme
  if (input === 'light' || !input)
    return lightTheme
  return {
    backgroundColor: input.backgroundColor ?? lightTheme.backgroundColor,
    foreground: input.foreground ?? lightTheme.foreground,
    colors: { ...lightTheme.colors, ...input.colors },
    lineColors: { ...lightTheme.lineColors, ...input.lineColors },
  }
}
