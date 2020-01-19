const path = require('path')
const fs = require('fs')

export default function(moduleOptions) {
  const options = { ...this.options.api, ...moduleOptions }
  options.dir = options.dir
    ? options.dir.startsWith('~')
      ? options.dir
      : path.join('~', options.dir)
    : '~/api'

  const absoluteBuildPath = path.resolve(this.options.buildDir)
  const absoluteApiPath = path.resolve(
    options.dir.replace('~', this.options.srcDir),
  )
  const relativePath = path.relative(absoluteBuildPath, absoluteApiPath)
  const files = fs
    .readdirSync(absoluteApiPath, { withFileTypes: true })
    .filter(f => f.isFile())
    .map(f => f.name)

  const pluginOptions = {
    apis: files.map(f => ({
      path: path
        .normalize(path.join(relativePath, f))
        .split(/[\\/]/g)
        .join(path.posix.sep),
      name: path.parse(f).name + (options.suffix ? options.suffix : ''),
    })),
  }

  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.template'),
    fileName: 'api.js',
    options: pluginOptions,
  })

  // Axios integration
  this.requireModule(['@nuxtjs/axios'])
}
