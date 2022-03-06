import * as postcss from 'postcss'
import { createRule, getContext } from './utils'
import isEqual from 'lodash.isequal'

// start from 10 ("a" symbol)
let declId = 10

export class AtomicCSSCore {

  newRoot = postcss.parse('')


  rules = new Map<string, string>()
  atomicMap = new Map<string, Array<string>>()

  process(css: postcss.Root) {
    css.walkDecls(decl => {
      const context = getContext(decl)
      const contextAtRules = context.filter((node): node is postcss.AtRule => node.type === 'atrule')
      const [className, ...pseudos] = context
        .filter((node): node is postcss.Rule => node.type === 'rule')[0]
        .selector
        .split(/::|:/)

      const key = createRule(decl, pseudos.join(''), contextAtRules).toString()

      if (!this.rules.has(key)) {
        const shortClassName = (declId++).toString(32)
        const newClassName = Number.isInteger(+shortClassName[0]) ? `_${shortClassName}` : shortClassName
        const atomicClassName = `.${newClassName}${pseudos.join(':')}`

        this.newRoot.push(createRule(decl, atomicClassName, contextAtRules))
        this.rules.set(key, newClassName)
      }

      const mapClassName = className.substring(1)

      const rules: string[] = this.atomicMap.get(mapClassName) || []
      this.atomicMap.set(mapClassName, rules.concat(this.rules[key]))
    })
  }

  passThroughAtRule(css: postcss.Root) {
    css.walkAtRules(atRule => {
      if (['keyframes', 'font-face'].some(name => name === atRule.name)) {
        this.newRoot.push(atRule.clone())
        atRule.remove()
      }
    })
  }

  mergeDuplicateRules(css: postcss.Root) {
    const blacklist = ['keyframes', 'font-face']
    css.walkRules(rule => {
      const ruleName = (rule.parent as postcss.AtRule)?.name
      if (!blacklist.includes(ruleName)) {
        const ruleDecls = this.resolveDecl(rule.nodes)

        rule.parent?.each((node) => {
          if (
            node instanceof postcss.Rule &&
            rule !== node &&
            isEqual(ruleDecls, this.resolveDecl(node.nodes))
          ) {
            rule.selector += `, ${node.selector}`
            node.remove()
          }
        })
      }
    })
  }

  private resolveDecl(node: postcss.ChildNode[]) {
    return node
      .filter((node): node is postcss.Declaration => node.type === 'decl')
      .map((decl) => {
        const { prop, value } = decl
        return { prop, value }
      })
  }


  apply(result: postcss.Result) {
    result.root.removeAll().append(this.newRoot)
  }

  getClassnameMap() {
    const result: Record<string, string> = {}

    this.atomicMap.forEach((atomics, originalClassname) => {
      result[originalClassname] = atomics.join(' ')
    })
    return result
  }
}
