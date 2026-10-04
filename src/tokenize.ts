import type { ParsedLine, ParseOptions, TokenType } from 'sugar-high/core'
import type { HighlightTheme, ThemeInput } from './theme'
import { parse } from 'sugar-high/core'
import { languages, lang as normalizeLang } from 'sugar-high/lang'
import { resolveTheme } from './theme'

export type { HighlightTheme, ThemeInput } from './theme'

export interface CodeToken {
  type: TokenType
  /** Raw token value */
  value: string
  /**
   * Display value safe for the mini-program `<text>` component.
   * Tabs expand to spaces and collapsing space runs become non-breaking
   * spaces, since consecutive regular spaces collapse on mini-programs.
   */
  text: string
  /** Resolved text color, `undefined` falls back to the theme foreground */
  color?: string
  /** sugar-high semantic class, e.g. `sh__token--keyword` */
  className: string
}

export interface CodeLine {
  index: number
  value: string
  tokens: CodeToken[]
  /** sugar-high semantic classes, e.g. `sh__line sh__line--diff-add` */
  className: string
  /** Line background from a line annotation (diff, markdown) */
  backgroundColor?: string
  /** Fully blank line. Renderers should fill it to keep its height */
  blank: boolean
}

export interface TokenizeOptions {
  /** Language name, alias, or extension, e.g. `ts`, `.tsx`, `python` */
  lang?: string
  theme?: ThemeInput
  /** Number of spaces a tab expands to */
  tabSize?: number
}

export const NBSP = '\u00A0'

/** sugar-high falls back to its JavaScript lexer, with comments and strings */
const javascriptConfig: ParseOptions = languages.find(
  language => language.id === 'javascript',
)!.config!

/**
 * Resolve a language name (canonical, alias, extension, with or without a
 * leading dot, any case) to its sugar-high parse config. Unknown names fall
 * back to the JavaScript config, matching the default `highlight()` behavior.
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

/** Tabs and space runs render unreliably inside mini-program `<text>` nodes */
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
 * Highlight `code` into per-line render models without touching any DOM,
 * so the result can be rendered by `<view>`/`<text>` nodes on every
 * uni-app platform.
 */
export function tokenizeToLines(code: string, options?: TokenizeOptions): CodeLine[] {
  const theme = resolveTheme(options?.theme)
  const tabSize = options?.tabSize ?? 2
  const normalized = code.replace(/\r\n?/g, '\n')
  const parsed = parse(normalized, resolveLanguageConfig(options?.lang))
  return parsed.lines.map(line => transformLine(line, theme, tabSize))
}
