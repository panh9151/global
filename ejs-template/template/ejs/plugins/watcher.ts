import { posix, relative, sep } from 'path'
import colors from 'picocolors'
import anymatch from 'anymatch'
import { PluginOption } from 'vite'
import { getShortName } from './utils/helpers'

function convertPath(path: string) {
  return path.split(sep).join(posix.sep)
}

export default function Watcher(
  paths: string | string[] = '',
  config: WatcherConfig = {},
): PluginOption {
  return {
    name: 'watch',
    apply: 'serve',

    config: () => ({ server: { watch: { disableGlobbing: false } } }),
    configureServer({ watcher, ws, config: { logger, root } }) {
      const { log = true, always = true, delay = 0 } = config
      const checkReload = (path: string) => {
        const definitelyPosix = convertPath(path)
        if (anymatch(paths, getShortName(definitelyPosix, root))) {
          setTimeout(
            () => ws.send({ type: 'full-reload', path: always ? '*' : path }),
            delay,
          )
          if (log)
            logger.info(
              `${colors.green('page reload')} ${colors.dim(
                relative(root, path),
              )}`,
              { clear: true, timestamp: true },
            )
        }
      }
      watcher.on('add', checkReload)
      watcher.on('change', checkReload)
      watcher.on('unlink', checkReload)
    },
  }
}
