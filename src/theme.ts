import type { TokenType } from 'sugar-high/core'

export interface HighlightTheme {
  /** Code block background color */
  backgroundColor: string
  /** Default text color, applied to identifiers and whitespace */
  foreground: string
  /** Text color per token type, missing types fall back to `foreground` */
  colors: Partial<Record<TokenType, string>>
  /**
   * Line background color per line annotation, e.g. `diff-add`
   * or `markdown-heading` emitted by language presets.
   */
  lineColors: Record<string, string>
}

/** Official palette from the sugar-high documentation site */
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
