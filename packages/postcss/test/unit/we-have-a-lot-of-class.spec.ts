import { expect, test } from 'vitest'
import processCSS from '../integration/helper/process'

test('a lot of classes', () => {
  expect(processCSS(Array.from({ length: 1_000 }, (_, i) => `._${i} { width: ${i}; }`).join('\n'))).resolves.toMatchSnapshot('happy case')
})
