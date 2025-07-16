import 'vite/client'
import { ESLint } from 'eslint'
import { Hint } from '../../node_modules/@types/htmlhint/types.d'
import {
  LintResult as StylelintResult,
  LinterOptions as StylelintOptions,
} from 'stylelint'
import { ResolvedConfig } from 'vite'

declare global {
  interface LinkItem {
    title?: string
    url?: string
    active?: boolean
    current?: boolean
    links?: LinkItem[]
  }

  interface LinkList extends Record<string, LinkItem[]> { }

  interface HTMLHintOptions {
    config?: any
    configBasedir?: string
    configFile?: string
    cwd?: string
    files: string | string[]
    formatter?: any
    globbyOptions?: any
    ignorePattern?: any
    maxWarnings?: number
  }

  interface HTMLHintCustomRule {
    regId: RegExp
    message: string
  }

  interface HTMLHintResult {
    filePath: string
    relativeFilePath: string
    warnings: Hint[]
  }

  interface NewStylelintResult extends StylelintResult {
    relativeFilePath?: string
  }

  interface NewESLintResult extends ESLint.LintResult {
    relativeFilePath?: string
  }

  interface ESLintOptions {
    files: string | string[]
    options?: ESLint.Options
  }

  interface LinterOption {
    dev?: boolean
    build?: boolean
    errorOverlay?: boolean
    htmlhint?: HTMLHintOptions
    stylelint?: StylelintOptions
    eslint?: ESLintOptions
  }

  type Results = HTMLHintResult | NewStylelintResult | NewESLintResult

  interface LintStorage {
    [key: string]: Results[]
  }

  interface WatcherConfig {
    log?: boolean
    always?: boolean
    delay?: number
  }

  interface TemplateResult {
    name: string
    result: string
  }

  type Templating = (
    html: string,
    path: string,
    config: ResolvedConfig,
  ) => string | Promise<string>
}
