import { Browser, chromium } from 'playwright-core'
import { describe, beforeAll, afterAll, test } from 'vitest'
import helper from './helper'

describe('PostCSSAtomised test', () => {
  let browser: Browser
  beforeAll(async () => {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    })
  })

  afterAll(async () => {
    await browser.close()
  })

  test.concurrent('renders chained selectors properly', () => {
    helper(browser, './data/chained-selectors.html')
  })
  test.concurrent('renders complex css properly', () => {
    helper(browser, './data/complex.html')
  })
  test.concurrent('renders @font-face declarations properly', () => {
    helper(browser, './data/font-face.html')
  })
  test.concurrent('renders @keyframes properly', () => {
    helper(browser, './data/keyframes.html')
  })
  test.concurrent('renders expanded shorthand declarations properly', () => {
    helper(browser, './data/longhand.html')
  })
  test.concurrent('renders media queries properly', () => {
    helper(browser, './data/mq.html')
  })
  test.concurrent('renders overridden declarations properly', () => {
    helper(browser, './data/overrides.html')
  })
  test.concurrent('renders pseudos properly', () => {
    helper(browser, './pseudo.html')
  })
  test.concurrent('renders common declarations properly', () => {
    helper(browser, './data/repetition.html')
  })
  test.concurrent('renders @supports properly', () => {
    helper(browser, './data/supports.html')
  })
  test.concurrent('renders unatomisable rules properly', () => {
    helper(browser, './data/unatomisable.html')
  })

})
