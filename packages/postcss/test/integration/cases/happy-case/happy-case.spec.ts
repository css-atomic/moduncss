import { expect, test } from 'vitest'
import { processFile } from '../../helper/process'

test('happy case', () => {
  expect(processFile('happy-case/data/1.css')).resolves.toMatchSnapshot('happy case')
})
