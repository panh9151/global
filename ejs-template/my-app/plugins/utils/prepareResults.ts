import { ESLint } from 'eslint'
import { LintResult as StylelintResult } from 'stylelint'
import path from 'path'

export function prepareStylelintResults(
  results: StylelintResult[],
): StylelintResult[] {
  return results
    .sort((a, b) => a.warnings.length - b.warnings.length)
    .map((result) => {
      if (!result.source) return result

      const newResult: NewStylelintResult = result
      newResult.relativeFilePath = path.relative('.', result.source)
      newResult.warnings.sort((a, b) => {
        if (a.severity === b.severity) {
          if (a.line === b.line) {
            return a.column < b.column ? -1 : 1
          }

          return a.line < b.line ? -1 : 1
        }

        if (a.severity === 'error' && b.severity !== 'error') {
          return 1
        }

        return -1
      })
      return newResult
    })
}

export function prepareESLintResults(results: ESLint.LintResult[]) {
  return results
    .sort((a, b) => {
      if (a.errorCount === b.errorCount) {
        return b.warningCount - a.warningCount
      }

      if (a.errorCount === 0) {
        return -1
      }

      if (b.errorCount === 0) {
        return 1
      }

      return b.errorCount - a.errorCount
    })
    .map((result) => {
      const newResult: NewESLintResult = result
      newResult.relativeFilePath = path.relative('.', newResult.filePath)
      newResult.messages.sort((a, b) => {
        if (a.fatal === b.fatal && a.severity === b.severity) {
          if (a.line === b.line) {
            return a.column < b.column ? -1 : 1
          }

          return a.line < b.line ? -1 : 1
        }

        if ((a.fatal || a.severity === 2) && (!b.fatal || b.severity !== 2)) {
          return 1
        }

        return -1
      })
      return newResult
    })
}
