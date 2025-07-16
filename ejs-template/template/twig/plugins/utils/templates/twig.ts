import { Context, resolveContext } from '../context'
import { ResolvedConfig, normalizePath } from 'vite'
import { addBase } from '../resolveLinks'
import { getPackageManager } from '../helpers'
import pc from 'picocolors'

type Twig = typeof import('twig')

export interface TwigOption {
  context?: Context
  namespaces?: object
  extend?: ((twig: import('twig').Twig, config: ResolvedConfig) => void)[]
}

export function twig(options?: TwigOption): Templating {
  let template: Twig
  let loaded = false
  const packageManager = getPackageManager()

  const twigRender: Templating = async (html, path, config) => {
    if (!loaded) {
      try {
        template = (await import('twig')).default
      } catch (e) { }
      loaded = true
    }

    if (!template) {
      console.log()
      console.log(
        `${pc.yellow(
          '[Warning]',
        )} Package twig is not installed. Please run \`${pc.green(
          packageManager +
          (packageManager === 'yarn' ? ' add' : ' install') +
          ' twig',
        )}\` to use this template.`,
      )
      return html
    }

    const parameters: import('twig').Parameters & {
      namespaces?: object
    } = {
      data: html,
      path: config.root + path,
      namespaces: options?.namespaces,
    }

    template.extend((twig) => {
      twig.exports.extendFunction('baseUrl', (url) => {
        return addBase(url, path, config)
      })
    })

    template.extend((twig) => {
      options?.extend?.forEach((fn) => fn(twig, config))
    })

    template.cache(false)

    const render = template.twig(parameters)

    const resolvedContext = await resolveContext(
      options?.context,
      normalizePath(path),
      config,
    )
    return render.render(resolvedContext)
  }
  return twigRender
}
