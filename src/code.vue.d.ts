import type { DefineComponent } from 'vue'
import type { ThemeInput } from './theme'

export interface CodeProps {
  /** 需要高亮的源代码 */
  code: string
  /**
   * 语言名称、别名或扩展名，例如 `ts`、`.tsx`、`python`。
   * 未知的名称会回退到 JavaScript 解析器。
   * 使用 `plaintext` 可禁用高亮。
   */
  lang?: string
  /** `'light'`、`'dark'` 或部分主题对象 */
  theme?: ThemeInput
  /** 在左侧渲染行号 */
  showLineNumbers?: boolean
  /** 制表符展开后的空格数 */
  tabSize?: number
  /** 长行换行显示而不是横向滚动 */
  wrap?: boolean
  /**
   * 追加到根节点 `scroll-view` 上的额外 class。小程序端外部传入的
   * `class` 只能作用到宿主节点，页面样式若需要选中组件根节点，
   * 应改用这个 prop 传入。
   */
  customClass?: string
}

declare const Code: DefineComponent<CodeProps, Record<string, never>, unknown>

export default Code
