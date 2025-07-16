import { ResolvedConfig } from 'vite'

export type Context =
  | Record<string, unknown>
  | ((path: string, config: ResolvedConfig) => Record<string, unknown>)
  | ((path: string, config: ResolvedConfig) => Promise<Record<string, unknown>>)

export async function resolveContext(
  context: Context | undefined,
  pagePath: string,
  config: ResolvedConfig,
): Promise<Record<string, unknown> | undefined> {
  if (typeof context === 'undefined') {
    return context
  }

  if (typeof context === 'function') {
    return resolveContext(await context(pagePath, config), pagePath, config)
  }

  const output: Record<string, unknown> = {}

  for (const key of Object.keys(context)) {
    const value = context[key]

    if (typeof value === 'function') {
      output[key] = await value(pagePath)
    } else {
      output[key] = value
    }
  }

  return output
}
