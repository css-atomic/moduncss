import * as postcss from 'postcss'
import { AtomicPreprocessor } from './preprocessor'
import { AtomicCSSCore } from './atomic'

type Options = {
  onResult?(map: Record<string, string>)
}

export default (opts?: Options): postcss.Plugin => {
  return {
    postcssPlugin: 'moduncss',
    async OnceExit(css, { result }) {
      const core = new AtomicCSSCore()
      const preprocessor = new AtomicPreprocessor()

      preprocessor.clean(css)
      preprocessor.refineInvalidRule(css, core.newRoot, result)

      core.passThroughAtRule(css)
      core.process(css)
      core.mergeDuplicateRules(css)
      core.apply(result)
      opts?.onResult?.(core.getClassnameMap())
    }
  }
}
