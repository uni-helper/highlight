// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: false,
    antislop: true,
    // lint & format `<style>` blocks in SFCs and plain CSS files
    formatters: true,
  },
)
