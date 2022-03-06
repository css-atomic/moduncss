import postcss from 'postcss'
import { readFileSync } from 'fs'
import * as path from 'path'
import plug from '../../../src'

const processCSS = (css: string) =>
  postcss([plug()]).process(css, {from: `${Math.random().toString(16)}.css`}).then(result => result.toString())

export const processFile = (file: string) => {
  const css = readFileSync(path.resolve(__dirname, '..', 'cases', file)).toString()
  return processCSS(css)
}

export default processCSS
