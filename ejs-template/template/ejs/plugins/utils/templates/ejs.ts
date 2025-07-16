import { ResolvedConfig, normalizePath } from 'vite'
import { addBase } from '../resolveLinks'
import { getPackageManager } from '../helpers'
import pc from 'picocolors'

export interface EjsOption {
  data?: (pagePath: string, config: ResolvedConfig) => Record<string, any>
  options?: import('ejs').Options
}
export function ejs(options?: EjsOption): Templating {
  let template: typeof import('ejs')
  let loaded = false
  const packageManager = getPackageManager()

  const ejsRender: Templating = async (html, path, config) => {
    if (!loaded) {
      try {
        template = (await import('ejs')).default
      } catch (e) { }
      loaded = true
    }

    if (!template) {
      console.log()
      console.log(
        `${pc.yellow(
          '[Warning]',
        )} Package ejs is not installed. Please run \`${pc.green(
          packageManager +
          (packageManager === 'yarn' ? ' add' : ' install') +
          ' ejs',
        )}\` to use this template.`,
      )
      return html
    }

    try {
      const data = options?.data?.(normalizePath(path), config) || {}
      data.env = config.env
      data.baseUrl = (url?: string) => {
        return addBase(url, path, config)
      }

      html = await template.render(html, data, options?.options)

      const re = new RegExp('<!-- @(.*) -->((.|\n|\r)*?)<!-- @@(.*) -->', 'g')
      const temp = []
      let match
      while ((match = re.exec(html)) != null) {
        let content = ''
        let start = ''
        let end = ''
        if (match && match.length == 5) {
          start = match[1]
          content = match[2]
          end = match[4]
        }
        if (start === end) {
          temp.push({
            location: start,
            content,
          })
        }
      }

      html = html.replace(re, '')
      temp.forEach((item) => {
        html = html.replace(
          new RegExp(`{{\\s*${item.location}\\s*}}`, 'g'),
          item.content,
        )
      })
      html = html.replace(/{{\s*\S+\s*}}/g, '')
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      } else {
        console.log(String(e))
      }
    }
    return html
  }
  return ejsRender
}
