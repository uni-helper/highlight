import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import Code from '../src/code.vue'
import { darkTheme, lightTheme } from '../src/theme'
import { NBSP } from '../src/tokenize'

const block = defineComponent({
  name: 'block',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  },
})

const inline = defineComponent({
  name: 'inline',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('span', attrs, slots.default?.())
  },
})

function mountCode(code: string, props: Record<string, unknown> = {}) {
  return mount(Code, {
    props: { code, ...props },
    global: {
      components: {
        ScrollView: block,
        View: block,
        Text: inline,
      },
    },
  })
}

function tokenNodes(wrapper: ReturnType<typeof mountCode>) {
  return wrapper.findAll('.uh-highlight__token')
}

describe('<Code>', () => {
  it('renders one line block per parsed line with themed tokens', () => {
    const wrapper = mountCode('const a = 1\nconst b = 2')
    const lineEls = wrapper.findAll('.uh-highlight__line')
    expect(lineEls).toHaveLength(2)
    const tokens = tokenNodes(wrapper)
    expect(tokens[0].classes()).toContain('sh__token--keyword')
    expect(tokens[0].attributes('style')).toContain(lightTheme.colors.keyword)
    expect(wrapper.find('.uh-highlight__body').element.style.display).toBe('inline-block')
  })

  it('applies the language alias', () => {
    const wrapper = mountCode('interface Foo { bar: string }', { lang: 'ts' })
    const types = tokenNodes(wrapper).flatMap(node => node.classes())
    expect(types).toContain('sh__token--keyword')
    expect(types).toContain('sh__token--class')
  })

  it('expands tabs and preserves indentation with non-breaking spaces', () => {
    const wrapper = mountCode('\tif (a) {\n\t\treturn a\n}')
    const lineTokens = wrapper
      .findAll('.uh-highlight__line')
      .map(line => line.findAll('.uh-highlight__token'))
    // text() trims whitespace, so read raw textContent for NBSP-only tokens
    expect(lineTokens[0][0].element.textContent).toBe(NBSP.repeat(2))
    expect(lineTokens[1][0].element.textContent).toBe(NBSP.repeat(4))
  })

  it('keeps blank lines tall with a non-breaking filler', () => {
    const wrapper = mountCode('a\n\nb')
    const lineEls = wrapper.findAll('.uh-highlight__line')
    expect(lineEls[1].findAll('.uh-highlight__blank')).toHaveLength(1)
    expect(lineEls[1].find('.uh-highlight__blank').element.textContent).toBe(NBSP)
  })

  it('omits line numbers by default and renders them padded when enabled', () => {
    const plain = mountCode('a\nb')
    expect(plain.findAll('.uh-highlight__line-number')).toHaveLength(0)

    const numbered = mountCode('a\nb\nc', { showLineNumbers: true })
    const numbers = numbered.findAll('.uh-highlight__line-number')
    expect(numbers).toHaveLength(3)
    expect(numbers[0].element.textContent).toBe(`1${NBSP}${NBSP}`)
    expect(numbers[2].element.textContent).toBe(`3${NBSP}${NBSP}`)
  })

  it('styles the root with the theme and supports the dark preset', () => {
    const light = mountCode('const a')
    expect(light.element.style.backgroundColor).toBe('#ffffff')
    expect(light.element.style.color).toBe(lightTheme.foreground)

    const dark = mountCode('const a', { theme: 'dark' })
    const keyword = dark.find('.sh__token--keyword')
    expect(keyword.attributes('style')).toContain(darkTheme.colors.keyword)
  })

  it('renders no user-select attribute on text nodes', () => {
    // copy is the caller's job (uni.setClipboardData on the raw code)
    const wrapper = mountCode('const a')
    expect(wrapper.find('.uh-highlight__token').attributes('user-select')).toBeUndefined()
    expect(wrapper.find('.uh-highlight__line').element.textContent).not.toContain(NBSP)
  })

  it('scrolls horizontally by default and wraps when `wrap` is set', () => {
    const scrolling = mountCode('const a')
    expect(scrolling.element.style.whiteSpace).toBe('')
    expect(scrolling.find('.uh-highlight__line').element.style.whiteSpace).toBe('nowrap')
    expect(scrolling.attributes('scroll-x')).toBe('true')

    const wrapping = mountCode('const a', { wrap: true })
    expect(wrapping.find('.uh-highlight__line').element.style.whiteSpace).toBe('normal')
    expect(wrapping.attributes('scroll-x')).toBe('false')
    expect(wrapping.find('.uh-highlight__body').element.style.display).toBe('')
  })

  it('tints annotated diff lines', () => {
    const wrapper = mountCode('+ added\n- removed', { lang: 'diff' })
    const lines = wrapper.findAll('.uh-highlight__line')
    expect(lines[0].classes()).toContain('sh__line--diff-add')
    expect(lines[0].element.style.backgroundColor).toBeTruthy()
    expect(lines[1].classes()).toContain('sh__line--diff-remove')
  })

  it('renders nothing but the block for empty code', () => {
    const wrapper = mountCode('')
    expect(wrapper.findAll('.uh-highlight__line')).toHaveLength(0)
  })

  it('keeps sugar-high semantic classes for external styling', () => {
    const wrapper = mountCode('// hi', { lang: 'js' })
    expect(wrapper.find('.sh__line').exists()).toBe(true)
    expect(wrapper.find('.sh__token--comment').exists()).toBe(true)
  })
})
