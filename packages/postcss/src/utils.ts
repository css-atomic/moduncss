import * as postcss from 'postcss'

export const getContext = (node: postcss.Declaration | postcss.Rule): Array<postcss.Container> => {
  const parents: Array<postcss.Container> = []
  let node2: postcss.AnyNode | postcss.Container = node

  while (node2.parent) {
    parents.push(node2.parent as postcss.Container)
    node2 = node2.parent
  }
  return parents
}

export function createRule(decl: postcss.Declaration, selector: string, atRules: Array<postcss.AtRule>) {
  const rule = postcss.rule({ selector }).append(decl)

  for (const atRule of atRules) {
    postcss.atRule({ name: atRule.name, params: atRule.params }).append(rule)
  }

  return rule
}
