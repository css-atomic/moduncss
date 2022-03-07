import * as path from 'path'
import postcss from 'postcss'
import replaceClasses from 'replace-classes'
import { expect } from 'vitest'
import plug from '@/index'
import { Browser, Page } from 'playwright-core'

const getComputedStyles = (page: Page) => page.evaluate(
  function getPhantomComputedStyles() {
    return [].slice.call(document.body.getElementsByTagName('*')).map(function getTagComputedStyles(element) {
      return window.getComputedStyle(element)
    })
  },
)


export default (browser: Browser, filePath: string) => async (done) => {
  const src = path.resolve(__dirname, filePath)
  const page = await browser.newPage()

  await page.goto(src)
  const originalComputedStyles = await getComputedStyles(page)

  const globalRules = new Map<string, string>()
  const globalAtomic = new Map<string, string[]>()

  let atomicMap
  const atomisedCSS = await postcss([plug({
    onResult: json => {
      atomicMap = Object.assign({}, json)
    },
    globalAtomic,
    globalRules,
  })]).process(src.match(/<style>([\s\S]*)<\/style>/)?.[1] || '')

  const stringifiedAtomicMap = Object.keys(atomicMap).reduce((map, className) =>
      Object.assign(map, {
        [className]: `${className} ${atomicMap[className]}`,
      })
    , {})

  const atomisedSrc = replaceClasses(src, stringifiedAtomicMap)
    .replace(/(<style>)([\s\S]*)(<\/style>)/, `$1${atomisedCSS.css}$3`)

  await page.setContent(atomisedSrc)
  const atomisedComputedStyles = await getComputedStyles(page)

  expect(src).not.toEqual(atomisedSrc)

  // make sure we've got something like what we'd expect back from phantom (not a given!)
  expect(Object.keys(originalComputedStyles[0])).toContain('fontSize')
  expect(Object.keys(atomisedComputedStyles[0])).toContain('fontSize')

  // test what we got back
  expect(originalComputedStyles).toEqual(atomisedComputedStyles)

  await page.close()
  done()
};
