import { describe, expect, test } from 'vitest'
import processCSS from '@test/helper/process'

const globalRules = new Map<string, string>()
const globalAtomic = new Map<string, string[]>()

describe('natural case', () => {
  test('pass globalRules globalAtomic', () => {
    expect(processCSS(`
    .hello {
      color: red;
    }
  `, globalRules, globalAtomic)).resolves.string
    expect(globalRules.size).eq(1)
    expect(globalAtomic.size).eq(1)
  })

  test('respect passed globalRules globalAtomic into plugin', () => {
    expect(processCSS(`
    .hello {
      color: red;
    }
  `, globalRules, globalAtomic)).resolves.string
    expect(globalRules.size).eq(1)
    expect(globalAtomic.size).eq(1)
  })

  test.todo('unchain rules')
  test.todo('update padding/margin')
  test.todo('remove duplicate rules')
})
