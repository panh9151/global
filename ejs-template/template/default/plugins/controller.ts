import { PluginOption, ResolvedConfig } from 'vite'
import js_beautify from 'js-beautify'

var beautify_html = js_beautify.html

export default function Controller(): PluginOption {
  let config: ResolvedConfig
  return {
    name: 'controller',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        html = html.replace(
          `<link rel="stylesheet" crossorigin`,
          `<link rel="stylesheet"`,
        )

        html = beautify_html(html, {
          indent_size: 2,
          preserve_newlines: false,
          indent_inner_html: true,
        })
        return html
      },
    },
  }
}
