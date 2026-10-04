import type { DefineComponent } from 'vue'
import type { ThemeInput } from './theme'

export interface CodeProps {
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
  /** Wrap long lines instead of scrolling horizontally */
  wrap?: boolean
}

declare const Code: DefineComponent<CodeProps, Record<string, never>, unknown>

export default Code
