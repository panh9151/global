import type { Rule } from 'htmlhint/types'

const ruleData: Rule = {
  id: 'class-value',
  description: 'The class attribute values must meet the specified rules.',
  init(parser, reporter, options) {
    const arrRules: Record<
      string,
      {
        regId: RegExp
        message: string
      }
    > = {
      underline: {
        regId: /^[a-z\d]+(_[a-z\d]+)*$/,
        message:
          'The class attribute values must be in lowercase and split by an underscore.',
      },
      dash: {
        regId: /^[a-z\d]+(-[a-z\d]+)*$/,
        message:
          'The class attribute values must be in lowercase and split by a dash.',
      },
      hump: {
        regId: /^[a-z][a-zA-Z\d]*([A-Z][a-zA-Z\d]*)*$/,
        message: 'The class attribute values must meet the camelCase style.',
      },
    }
    let rule: any
    if (typeof options === 'string') {
      rule = arrRules[options]
    } else {
      rule = options
    }
    if (typeof rule === 'object' && rule.regId) {
      const regHandlebars = /{[{|%]([^%{}]*)[}|%]}/g
      const regEjs = /<([^<>]*)>/g

      let regId = rule.regId
      const message = rule.message
      if (!(regId instanceof RegExp)) {
        regId = new RegExp(regId)
      }
      parser.addListener('tagstart', (event) => {
        const attrs = event.attrs
        let attr
        const col = event.col + event.tagName.length + 1
        for (let i = 0, l1 = attrs.length; i < l1; i++) {
          attr = attrs[i]
          if (attr.name.toLowerCase() === 'class') {
            const value = attr.value
              .replace(regHandlebars, '')
              .replace(regEjs, '')

            const arrClass = value.split(/\s+/g)
            let classValue
            for (let j = 0, l2 = arrClass.length; j < l2; j++) {
              classValue = arrClass[j]
              if (classValue && regId.test(classValue) === false) {
                reporter.warn(
                  message,
                  event.line,
                  col + attr.index,
                  this,
                  classValue,
                )
              }
            }
          }
        }
      })
    }
  },
}

export default ruleData
