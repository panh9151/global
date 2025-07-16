import { extname } from 'path'
import { Plugin, ResolvedConfig } from 'vite'
import picocolors from 'picocolors'
import { getShortName } from './utils/helpers'

export default function Template(templates: Templating[] = []): Plugin {
  let config: ResolvedConfig

  return {
    name: 'template',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async handleHotUpdate({ server, file }) {
      const watch = templates.map(
        (template) => '.' + template.name.replace('Render', ''),
      )

      if (watch.includes(extname(file))) {
        config.logger.info(
          picocolors.green('page reload ') +
            picocolors.dim(getShortName(file, config.root)),
          {
            clear: true,
            timestamp: true,
          },
        )
        server.ws.send({ type: 'full-reload' })
      }
    },

    transformIndexHtml: {
      order: 'pre',

      async handler(html, ctx) {
        for (let i = 0; i < templates.length; i++) {
          html = await templates[i](html, ctx.path, config)
        }

        return html
      },
    },
  }
}
