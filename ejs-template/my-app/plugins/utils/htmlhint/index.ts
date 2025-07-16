import fs, { existsSync, readFileSync } from 'fs'
import fg, { Options } from 'fast-glob'
import { normalizePath } from 'vite'
import path, { isAbsolute, resolve } from 'path'
import { HTMLHint } from 'htmlhint'
import colors from 'picocolors'

import getConfigForFile from './getConfigForFile'
import prepareReturnValue from './prepareReturnValue'
import classValue from './classValue'
import ignore, { Ignore } from 'ignore'

const DEFAULT_IGNORE_FILENAME = '.htmlhintignore'

const { isPathValid } = ignore

function getFileIgnorer({
  ignorePath,
  ignorePattern,
  cwd,
}: {
  ignorePath: string
  ignorePattern: string
  cwd: string
}) {
  const ignorer = ignore()
  const ignorePaths = [ignorePath || []].flat()

  if (ignorePaths.length === 0) {
    ignorePaths.push('.stylelintignore')
  }

  for (const ignoreFilePath of ignorePaths) {
    const absoluteIgnoreFilePath = isAbsolute(ignoreFilePath)
      ? ignoreFilePath
      : resolve(cwd || '', ignoreFilePath)

    if (!existsSync(absoluteIgnoreFilePath)) continue

    const ignoreText = readFileSync(absoluteIgnoreFilePath, {
      // utf must remain lowercased to hit the fast path
      // see nodejs/node#49888
      encoding: 'utf8',
      flag: 'r',
    })

    ignorer.add(ignoreText)
  }

  if (ignorePattern) ignorer.add(ignorePattern)

  return ignorer
}

function filterFilePaths(ignorer: Ignore, filePaths: string[]) {
  const validForIgnore = filePaths.filter(isPathValid)
  // Paths which starts with `..` are not valid for `ignore`, e. g. `../style.css`
  const notValidForIgnore = new Set(
    filePaths.filter((p) => !validForIgnore.includes(p)),
  )

  const filteredByIgnore = new Set(ignorer.filter(validForIgnore))

  // Preserving files order, while removing paths which were filtered by `ignore`
  return filePaths.filter(
    (p) => notValidForIgnore.has(p) || filteredByIgnore.has(p),
  )
}

HTMLHint.addRule(classValue)

export function defaultFormat(results: (HTMLHintResult | undefined)[]) {
  let output = ''
  results.forEach((result) => {
    if (!result?.warnings.length) return

    const firstLineCol = result.warnings[0].line + ':' + result.warnings[0].col
    output += `  ${colors.underline(result.relativeFilePath)}${colors.hidden(
      `:${firstLineCol}`,
    )}\n`
    const arrLogs = HTMLHint.format(result.warnings, {
      colors: true,
      indent: 2,
    })
    arrLogs.forEach((str) => {
      output += str + '\n'
    })
    output += '\n'
  })
  return output
}

export async function htmlhint({
  config,
  configBasedir,
  configFile,
  cwd = process.cwd(),
  files,
  formatter,
  globbyOptions,
  ignorePattern,
  maxWarnings,
}: HTMLHintOptions) {
  let ignorer: any
  try {
    ignorer = getFileIgnorer({
      cwd,
      ignorePath: DEFAULT_IGNORE_FILENAME,
      ignorePattern,
    })
  } catch (error) {
    return Promise.reject(error)
  }

  if (!formatter) {
    formatter = defaultFormat
  }

  if (!config) {
    try {
      const getConfig = await getConfigForFile(configFile, configBasedir)
      config = getConfig.config
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fileList = [files].flat().map((entry) => {
    const globCWD = (globbyOptions && globbyOptions.cwd) || cwd
    const absolutePath = !path.isAbsolute(entry)
      ? path.join(globCWD, entry)
      : path.normalize(entry)

    if (fs.existsSync(absolutePath)) {
      // This path points to a file. Return an escaped path to avoid globbing
      return fg.escapePath(normalizePath(entry))
    }

    return entry
  })

  const effectiveGlobbyOptions: Options = {
    cwd,
    ...(globbyOptions || {}),
    absolute: true,
  }

  const globCWD = effectiveGlobbyOptions.cwd

  let filePaths = await fg.glob(fileList, effectiveGlobbyOptions)

  filePaths = filterFilePaths(
    ignorer,
    filePaths.map((p) => (globCWD ? path.relative(globCWD, p) : p)),
  )

  const absoluteFilePaths = filePaths.map((filePath) => {
    if (!globCWD) return filePath

    const absoluteFilepath = !path.isAbsolute(filePath)
      ? path.join(globCWD, filePath)
      : path.normalize(filePath)

    return absoluteFilepath
  })

  const getResults = absoluteFilePaths.map<HTMLHintResult | undefined>(
    (absoluteFilepath) => {
      try {
        const dataRaw = fs.readFileSync(absoluteFilepath, 'utf8')
        return {
          filePath: absoluteFilepath,
          relativeFilePath: globCWD
            ? path.relative(globCWD, absoluteFilepath)
            : absoluteFilepath,
          warnings: HTMLHint.verify(dataRaw, config),
        }
      } catch (error) {
        console.log(error)
      }
    },
  )

  const result = prepareReturnValue(
    (getResults as HTMLHintResult[]).filter(Boolean),
    maxWarnings,
    formatter,
    cwd,
  )
  return result
}
