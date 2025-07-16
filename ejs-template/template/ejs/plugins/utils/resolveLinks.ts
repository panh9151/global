import { ResolvedConfig, normalizePath } from 'vite'
import path from 'path'

function isAbsoluteURL(url: string) {
  const pat = /^https?:\/\//i
  return pat.test(url)
}

export function addBase(
  url: string | undefined,
  pagePath: string,
  config: ResolvedConfig,
): string {
  if (url) {
    if (isAbsoluteURL(url)) return url

    if (path.isAbsolute(config.base)) return path.join(config.base, url)

    const relativePath = path.posix.relative(
      config.root,
      normalizePath(path.join(config.root, pagePath)),
    )
    const base = path.posix.join(
      path.posix.relative(relativePath, '').slice(0, -2),
      './',
    )
    return path.join(base, url)
  }
  return config.base
}

export default (
  linklists: LinkList,
  pagePath: string,
  config: ResolvedConfig,
) => {
  function checkLinks(links: LinkItem[]) {
    let isParentActive = false
    const result = links.map((link) => {
      link.current = false
      link.active = false

      if (link.url) {
        link.url = addBase(link.url, pagePath, config)

        const compactPath = pagePath.replace('index.html', '')
        let compactUrl = link.url.replace('index.html', '')

        const hashIndex = link.url.lastIndexOf('#')
        const queryIndex = link.url.lastIndexOf('?')

        if (hashIndex !== -1) {
          compactUrl = compactUrl.substring(0, hashIndex)
        }
        if (queryIndex !== -1) {
          compactUrl = compactUrl.substring(0, queryIndex)
        }

        if (compactUrl == compactPath) {
          link.current = true
          isParentActive = true
        }

        if (compactUrl !== '/' && compactPath.startsWith(compactUrl)) {
          link.active = true
        }
      }

      if (link.links) {
        const result = checkLinks(link.links)
        link.links = result.result
        if (result.isParentActive) {
          link.active = true
        }
      }
      return link
    })
    return {
      result,
      isParentActive,
    }
  }

  for (const key in linklists) {
    if (Object.hasOwnProperty.call(linklists, key)) {
      linklists[key] = checkLinks(linklists[key]).result
    }
  }

  return linklists
}
