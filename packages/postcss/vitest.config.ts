import { defineConfig } from 'vitest/config'

export default defineConfig({
  alias: {
    '@': __dirname + '/src',
    '@test': __dirname + '/test'
  },
  test: {
    // ...
  },
})
