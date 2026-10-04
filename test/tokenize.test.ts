import { describe, expect, it } from 'vitest'
import { darkTheme, lightTheme, resolveTheme } from '../src/theme'
import { NBSP, resolveLanguageConfig, tokenizeToLines } from '../src/tokenize'

describe('resolveLanguageConfig', () => {
  it('falls back to the javascript config without a lang', () => {
    expect(resolveLanguageConfig()).toBe(resolveLanguageConfig('javascript'))
    expect(resolveLanguageConfig()).not.toBeNull()
  })

  it('normalizes aliases, extensions, dots and case', () => {
    expect(resolveLanguageConfig('ts')).toBe(resolveLanguageConfig('typescript'))
    expect(resolveLanguageConfig('.tsx')).toBe(resolveLanguageConfig('ts'))
    expect(resolveLanguageConfig(' XML ')).toBe(resolveLanguageConfig('html'))
  })

  it('falls back to the javascript config for unknown languages', () => {
    expect(resolveLanguageConfig('definitely-not-a-language')).toBe(
      resolveLanguageConfig('javascript'),
    )
  })
})

describe('tokenizeToLines', () => {
  it('splits code into lines with themed tokens', () => {
    const lines = tokenizeToLines('const a = 1')
    expect(lines).toHaveLength(1)
    const tokens = lines[0].tokens
    expect(tokens[0]).toMatchObject({
      type: 'keyword',
      value: 'const',
      className: 'sh__token--keyword',
      color: lightTheme.colors.keyword,
    })
    expect(tokens.map(token => token.value).join('')).toBe('const a = 1')
  })

  it('highlights typescript through the `ts` alias', () => {
    const [line] = tokenizeToLines('const n: number = 1', { lang: 'ts' })
    const types = Object.fromEntries(
      line.tokens.map(({ value, type }) => [value, type]),
    )
    expect(types.number).toBe('keyword')
    expect(types[':']).toBe('sign')
  })

  it('still highlights comments when the lang is unknown', () => {
    const [line] = tokenizeToLines('const a = 1 // note', { lang: 'nope' })
    expect(line.tokens.at(-1)).toMatchObject({ type: 'comment' })
  })

  it('does not highlight comments in plaintext', () => {
    const [line] = tokenizeToLines('// note', { lang: 'plaintext' })
    expect(line.tokens.map(token => token.type)).not.toContain('comment')
  })

  it('keeps every platform-renderable line model DOM-free', () => {
    const lines = tokenizeToLines('const a = 1', { lang: 'js' })
    expect(JSON.stringify(lines)).not.toContain('<div')
    expect(JSON.stringify(lines)).not.toContain('class="')
  })

  it('expands tabs to `tabSize` spaces', () => {
    const [line] = tokenizeToLines('\tconst a', { tabSize: 2 })
    const indent = line.tokens[0]
    expect(indent.type).toBe('space')
    expect(indent.text).toBe(NBSP.repeat(2))
    expect(indent.value).toBe('\t')

    const [expanded] = tokenizeToLines('\tconst a', { tabSize: 4 })
    expect(expanded.tokens[0].text).toBe(NBSP.repeat(4))
  })

  it('turns space runs into non-breaking spaces to survive mini-program <text>', () => {
    const lines = tokenizeToLines('if (a) {\n    return "a  b"\n}')
    const indent = lines[1].tokens[0]
    expect(indent.type).toBe('space')
    expect(indent.value).toBe('    ')
    expect(indent.text).toBe(NBSP.repeat(4))
    // 单个空格保持原样，可正常复制
    const single = tokenizeToLines('a b')[0].tokens[1]
    expect(single.text).toBe(' ')
  })

  it('normalizes CRLF line endings', () => {
    const lines = tokenizeToLines('const a = 1\r\nconst b = 2\rconst c = 3')
    expect(lines).toHaveLength(3)
    lines.forEach((line) => {
      line.tokens.forEach((token) => {
        expect(token.text).not.toContain('\r')
      })
    })
  })

  it('marks blank lines so renderers can keep their height', () => {
    const lines = tokenizeToLines('a\n\nb')
    expect(lines).toHaveLength(3)
    expect(lines[1].blank).toBe(true)
    expect(lines[1].tokens).toHaveLength(0)
    expect(lines[0].blank).toBe(false)
  })

  it('returns no lines for empty code', () => {
    expect(tokenizeToLines('')).toEqual([])
  })

  it('annotates diff lines with backgrounds', () => {
    const lines = tokenizeToLines('+ added\n- removed\n@@ -1 +1 @@', { lang: 'diff' })
    expect(lines[0].className).toBe('sh__line sh__line--diff-add')
    expect(lines[0].backgroundColor).toBe(lightTheme.lineColors['diff-add'])
    expect(lines[1].className).toContain('sh__line--diff-remove')
    expect(lines[2].className).toContain('sh__line--diff-hunk')
  })

  it('resolves the dark theme', () => {
    const lines = tokenizeToLines('const a', { theme: 'dark' })
    expect(lines[0].tokens[0].color).toBe(darkTheme.colors.keyword)
  })

  it('merges partial theme overrides over the light theme', () => {
    const lines = tokenizeToLines('const a', {
      theme: { colors: { keyword: '#123456' } },
    })
    expect(lines[0].tokens[0].color).toBe('#123456')
    // untouched token colors still come from the light theme
    const signs = tokenizeToLines('a = b', {
      theme: { colors: { keyword: '#123456' } },
    })[0].tokens.find(token => token.type === 'sign')
    expect(signs?.color).toBe(lightTheme.colors.sign)
  })
})

describe('resolveTheme', () => {
  it('returns the presets untouched', () => {
    expect(resolveTheme('light')).toBe(lightTheme)
    expect(resolveTheme('dark')).toBe(darkTheme)
    expect(resolveTheme()).toBe(lightTheme)
  })

  it('merges partial overrides', () => {
    const theme = resolveTheme({ backgroundColor: '#000' })
    expect(theme.backgroundColor).toBe('#000')
    expect(theme.foreground).toBe(lightTheme.foreground)
    expect(theme.colors.keyword).toBe(lightTheme.colors.keyword)
    expect(theme.lineColors['diff-add']).toBe(lightTheme.lineColors['diff-add'])
  })
})
