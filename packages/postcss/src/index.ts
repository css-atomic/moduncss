import * as postcss from 'postcss'
import { AtomicPreprocessor } from './preprocessor'
import { AtomicCSSCore } from './atomic'

type Options = {
  globalRules: Map<string, string>
  globalAtomic: Map<string, string[]>
  onResult?(map: Record<string, string>)
}

const plugin = (opts: Options): postcss.Plugin => {
  return {
    postcssPlugin: 'moduncss',
    async OnceExit(css, { result }) {
      const core = new AtomicCSSCore()
      const preprocessor = new AtomicPreprocessor()

      core.rules = opts.globalRules
      core.atomicMap = opts.globalAtomic

      preprocessor.clean(css)
      preprocessor.refineInvalidRule(css, core.newRoot, result)

      core.passThroughAtRule(css)
      core.process(css)
      core.mergeDuplicateRules(css)
      core.apply(result)
      opts.onResult?.(core.getClassnameMap())
    }
  }
}

export default plugin
