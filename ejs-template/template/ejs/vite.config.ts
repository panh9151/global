import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import fg from 'fast-glob'

import Watcher from './plugins/watcher'
import Template from './plugins/template'
import Linter from './plugins/linter'
import Controller from './plugins/controller'

import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import data from './src/_data'
import { ejs } from './plugins/utils/templates/ejs'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const base = env.VITE_BASE_URL

  const input = {}
  const paths = await fg.glob(['src/**/*.html'])

  paths.forEach((path) => {
    const name = path.replace('src/', '').replace('.html', '')
    input[name] = resolve(path)
  })

  return {
    root: 'src',
    publicDir: '_public',
    base,
    build: {
      outDir: '../dist',
      modulePreload: {
        polyfill: false,
      },
      rollupOptions: {
        input,
        output: {
          entryFileNames: 'assets/js/[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: 'assets/[ext]/[name].[ext]',
        },
      },
    },
    css: {
      devSourcemap: true,
    },

    plugins: [
      Watcher(['_public/**']),
      Template([
        ejs({
          data,
          options: {
            views: ['src'],
          },
        }),
      ]),
      Linter({
        dev: true,
        build: true,
        errorOverlay: true,
        htmlhint: {
          files: ['src/**/*.{html,ejs}'],
        },
        stylelint: {
          files: ['src/**/*.{vue,css,scss,sass,less,styl,svelte}'],
          fix: true,
        },
        eslint: {
          files: ['src/_public/assets/js/**/*.js'],
          options: {
            fix: true,
          },
        },
      }),

      Controller(),
      ViteImageOptimizer(),
    ],
  }
})
