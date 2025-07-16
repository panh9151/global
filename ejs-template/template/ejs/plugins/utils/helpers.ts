import { posix } from 'path'

export function getShortName(file: string, root: string) {
  return file.startsWith(root + '/') ? posix.relative(root, file) : file
}

export function withTrailingSlash(path: string): string {
  if (path[path.length - 1] !== '/') {
    return `${path}/`
  }
  return path
}

export function getPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  const userAgent = process.env.npm_config_user_agent

  if (!userAgent) {
    return 'npm'
  }

  if (userAgent.startsWith('yarn')) {
    return 'yarn'
  }

  if (userAgent.startsWith('pnpm')) {
    return 'pnpm'
  }

  return 'npm'
}
