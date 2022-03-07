import postcss from 'postcss'
import { readFileSync } from 'fs'
import * as path from 'path'
import plug from '@/index'

const processCSS = (
  css: string,
  globalRules = new Map<string, string>(),
  globalAtomic = new Map<string, string[]>()
) =>
  postcss([plug({
    globalAtomic,
    globalRules,
  })]).process(css, { from: `${Math.random().toString(16)}.css` }).then(result => result.toString())

export const processFile = (
  file: string,
  globalRules = new Map<string, string>(),
  globalAtomic = new Map<string, string[]>()
) => {
  const css = readFileSync(path.resolve(__dirname, '..', 'integration/cases', file)).toString()
  return processCSS(css, globalRules, globalAtomic)
}

export default processCSS
