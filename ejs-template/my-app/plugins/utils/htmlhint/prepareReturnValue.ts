export default function prepareReturnValue(
  results: HTMLHintResult[],
  maxWarnings: number | undefined,
  formatter: (results: HTMLHintResult[]) => string,
  cwd: string,
) {
  const errored = results.some((result) => result && result.warnings.length > 0)
  const returnValue: {
    cwd: string
    errored: boolean
    results: HTMLHintResult[]
    output: string
    maxWarningsExceeded?: {
      maxWarnings: number
      foundWarnings: number
    }
  } = {
    cwd,
    errored,
    results: [],
    output: '',
  }

  if (maxWarnings !== undefined) {
    const foundWarnings = results.reduce(
      (count, file) => (file ? count + file.warnings.length : count),
      0,
    )

    if (foundWarnings > maxWarnings) {
      returnValue.maxWarningsExceeded = { maxWarnings, foundWarnings }
    }
  }

  returnValue.output += formatter(results)
  returnValue.results = results

  return returnValue
}
