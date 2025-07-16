import { PluginOption, WebSocketServer } from 'vite'
import path from 'path'
import colors from 'picocolors'
import { defaultFormat, htmlhint } from './utils/htmlhint'
import stylelint, { LinterOptions as StylelintOptions } from 'stylelint'
import { ESLint } from 'eslint'
import eslintFormatter from 'eslint-formatter-pretty'
import {
  prepareStylelintResults,
  prepareESLintResults,
} from './utils/prepareResults'

// @ts-ignore
import stylelintFormatter from 'stylelint-formatter-pretty'

enum LintType {
  HTMLHint = 'htmlhint',
  Stylelint = 'stylelint',
  ESLint = 'eslint',
}

interface LinterObject {
  id: LintType
  inStorage: boolean
}

export default function Linter(options: LinterOption = {}): PluginOption {
  const default_options: LinterOption = {
    dev: true,
    build: true,
    errorOverlay: true,
  }
  let _command: 'serve' | 'build'
  options = Object.assign(default_options, options)

  let ws: WebSocketServer
  const lint: {
    [key: string]: (options?: any, inStorage?: boolean) => Promise<void>
  } = {}
  let storage: LintStorage = {}

  function initLint<Type>(
    id: LintType,
    op: any = {},
    fn: (this: LinterObject, op: Type) => Promise<void>,
  ) {
    if (!id || typeof fn !== 'function') return
    if (!options[id]) return;
    options[id] = Object.assign(op, options[id])
    lint[id] = async (option = options[id], inStorage = false) => {
      if (!options[id]) return
      const linter: LinterObject = {
        id,
        inStorage,
      }
      await fn.bind(linter)(option)
    }
  }

  function mergeStorage(oldValue: Results[], newValue: Results[]) {
    if (!oldValue) return newValue
    if (!newValue) return oldValue
    return oldValue.map((file: any) => {
      const newFile = newValue.find(
        (f: any) => f.relativeFilePath === file.relativeFilePath,
      )
      if (!newFile) return file
      return newFile
    })
  }

  function sendToClient() {
    if (!options.errorOverlay) return
    if (_command === 'build') return
    ws.send('lint:results', storage)
  }

  function setStorage(id: LintType, value: Results[]) {
    storage[id] = mergeStorage(storage[id], value)
    sendToClient()
  }

  function logStorage(id: LintType | undefined) {
    for (const [key, results] of Object.entries(
      id ? { [id]: storage[id] } : storage,
    )) {
      switch (key) {
        case 'htmlhint': {
          const htmlhintResults = results as (HTMLHintResult | undefined)[]
          if (htmlhintResults.some((result) => result?.warnings.length)) {
            console.log(`\n  ${colors.magenta('[HTMLHint]')}\n`)
            console.log(defaultFormat(htmlhintResults))
          }
          break
        }
        case 'stylelint': {
          const stylelintResults = results as NewStylelintResult[]
          if (stylelintResults.some((result) => result.warnings.length)) {
            console.log(`\n  ${colors.magenta('[stylelint]')}`)
            console.log(stylelintFormatter(stylelintResults))
          }
          break
        }
        case 'eslint': {
          const eslintResults = results as NewESLintResult[]
          if (eslintResults.some((result) => result.messages.length)) {
            console.log(`\n  ${colors.magenta('[ESLint]')}`)
            console.log(eslintFormatter(eslintResults))
          }
          break
        }

        default:
          break
      }
    }
  }

  const default_htmlhint: HTMLHintOptions = {
    files: ['src/**/*.html'],
  }
  initLint<HTMLHintOptions>(
    LintType.HTMLHint,
    default_htmlhint,
    async function (op) {
      try {
        const { results } = await htmlhint(op)
        setStorage(this.id, results)
        logStorage(this.inStorage ? undefined : this.id)
      } catch (error) {
        console.log(error)
      }
    },
  )

  const default_stylelint: StylelintOptions = {
    files: ['src/**/*.{vue,css,scss,sass,less,styl,svelte}'],
    cache: true,
    cacheLocation: path.join('node_modules', '.vite', 'stylelint'),
  }
  initLint<StylelintOptions>(
    LintType.Stylelint,
    default_stylelint,
    async function (op) {
      try {
        op.cache = this.inStorage ? op.cache : undefined
        const { results } = await stylelint.lint(op)
        setStorage(this.id, prepareStylelintResults(results))
        logStorage(this.inStorage ? undefined : this.id)
      } catch (error) {
        console.log(error)
      }
    },
  )

  const default_eslint: ESLintOptions = {
    files: ['src/_public/assets/js/**/*.js'],
    options: {
      cache: true,
      cacheLocation: path.join('node_modules', '.vite', 'eslint'),
    },
  }
  initLint<ESLintOptions>(LintType.ESLint, default_eslint, async function (op) {
    try {
      const results = await new ESLint(op.options).lintFiles(op.files)
      setStorage(this.id, prepareESLintResults(results))
      logStorage(this.inStorage ? undefined : this.id)
      if (op.options?.fix) {
        ESLint.outputFixes(results)
      }
    } catch (error) {
      console.log(error)
    }
  })

  async function handleLintAll() {
    storage = {}
    const promise: Promise<void>[] = []
    Object.values(lint).forEach((lintFn) => promise.push(lintFn()))
    await Promise.all(promise)
  }

  function handleLintInStorage(file: string) {
    loop1: for (const [id, results] of Object.entries(storage)) {
      for (let index = 0; index < results.length; index++) {
        const result = results[index]
        if (
          (result as HTMLHintResult).filePath === file ||
          (result as NewStylelintResult | NewESLintResult).source === file
        ) {
          lint[id]({ ...options[id as LintType], ...{ files: [file] } }, true)
          break loop1
        }
      }
    }
  }

  return {
    name: 'lint',
    apply(_, { command }) {
      _command = command
      if (command === 'serve' && options.dev) return true
      if (command === 'build' && options.build) return true
      return false
    },

    config: () => ({
      resolve: {
        alias: [
          {
            find: /^[/]?@injects\/client/,
            replacement: path.resolve(__dirname, './injects/client.ts'),
          },
        ],
      },
    }),

    configureServer(server) {
      ws = server.ws
      server.watcher.on('ready', handleLintAll)
      server.watcher.on('add', handleLintAll)
      server.watcher.on('unlink', handleLintAll)
      server.watcher.on('change', handleLintInStorage)
      ws.on('client:ready', sendToClient)
    },

    async buildStart() {
      await handleLintAll()
    },

    transformIndexHtml: {
      order: 'pre',
      handler() {
        if (_command === 'build') return
        if (!options.errorOverlay) return
        return [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: '/@injects/client',
            },
            injectTo: 'head-prepend',
          },
        ]
      },
    },
  }
}
