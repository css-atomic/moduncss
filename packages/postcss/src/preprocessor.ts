import * as postcss from 'postcss'
import parseSides from 'parse-css-sides'
import parseFont from 'parse-css-font'
import parseSelector from 'postcss-selector-parser'
import { getContext } from './utils'
import resolveProp from 'postcss-resolve-prop'
import uniqBy from 'lodash.uniqby'

export class AtomicPreprocessor {
  clean(css: postcss.Root) {
    css.walkRules(rule => {
      rule.replaceWith(rule.selectors.map(selector => rule.clone({ selector })))
    })
    css.walkRules((rule) => {
      rule.parent?.each((testRule) => {
        if (testRule instanceof postcss.Rule && rule.selector === testRule.selector && rule !== testRule) {
          testRule.walkDecls((decl) => {
            rule.append(decl)
            decl.remove()
          })
          testRule.remove()
        }
      })
    })
    css.walkDecls((decl) => {
      ['margin', 'padding'].forEach(prop => {
        if (decl.prop === prop) {
          const sides = parseSides(decl.value)
          decl.replaceWith(Object.keys(sides).map(key =>
            postcss.decl({ prop: `${prop}-${key}`, value: sides[key] }),
          ))
        }
      })
      if (decl.prop === 'font') {
        const fontProps = parseFont(decl.value)
        decl.replaceWith(Object.keys(fontProps).map(key => {
          if (key === 'lineHeight') {
            return postcss.decl({ prop: 'line-height', value: fontProps[key] })
          }
          return postcss.decl({ prop: `font-${key}`, value: fontProps[key].toString() })
        }))
      }
    })

    // TODO: this should implement by another way since our atomic is global
    css.walkRules(rule => {
      const resolvedDecls: postcss.Declaration[] = []
      rule.walkDecls(decl => {
        const { prop } = decl
        resolvedDecls.push(postcss.decl({ prop, value: resolveProp(rule, prop), }))
      })
      rule.removeAll()
      rule.append(uniqBy(resolvedDecls, 'prop'))
    })
  }

  refineInvalidRule(css: postcss.Root, newRoot: postcss.Root, result: postcss.Result) {
    css.walkRules(rule => {
      const parser = parseSelector(selectors => {
        selectors.each((selector) => {
          const [first, ...rest] = selector.nodes
          if (first.type !== 'class' || rest.some(textSelector => textSelector.type !== 'pseudo')) {
            rule.assign(this.refineRule(rule))
            result.warn(`${rule.selector} has been removed because it can't be atomic CSS`, { node: rule })
          }
          return false
        })
      })
      parser.processSync(rule.selector)
    })
  }

  private refineRule(rule: postcss.Rule) {
    return getContext(rule).reduce((newRule, context) => {
      if (context !== rule.root()) {
        const newParent = context.clone()
        newParent.removeAll()
        newParent.append(newRule)
        return newParent
      }
      return newRule
    }, rule.clone()) as postcss.Rule
  }
}
