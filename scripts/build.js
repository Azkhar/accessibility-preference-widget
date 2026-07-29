const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { transform } = require('esbuild')

const projectRoot = path.resolve(__dirname, '..')
const sourceRoot = path.join(projectRoot, 'src')
const distRoot = path.join(projectRoot, 'dist')

const moduleOrder = [
  'i18n.js',
  'audio-description.js',
  'focus-indicator.js',
  'font-family.js',
  'font-size.js',
  'hide-images.js',
  'high-contrast.js',
  'highlight-links.js',
  'highlight-title.js',
  'language-selector.js',
  'large-cursor.js',
  'letter-spacing.js',
  'line-height.js',
  'monochrome.js',
  'pause-animations.js',
  'profiles.js',
  'reading-guide.js',
  'skip-navigation.js',
  'text-align.js',
  'tooltip.js',
  'init.js',
]

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function escapeTemplateLiteral(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/<\/script/gi, '<\\/script')
}

function extractWidgetMarkup(documentSource) {
  const startMarker = '<!--? WIDGETSTART ?-->'
  const endMarker = '<!--? WIDGETEND ?-->'
  const start = documentSource.indexOf(startMarker)
  const end = documentSource.indexOf(endMarker)

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Widget source markers are missing or out of order.')
  }

  return documentSource.slice(start + startMarker.length, end).trim()
}

async function build() {
  const template = read('compiler/widget.js')
  const html = extractWidgetMarkup(read('src/widget.html'))
  const cssFiles = fs
    .readdirSync(path.join(sourceRoot, 'css'))
    .filter(file => file.endsWith('.css'))
    .sort()
  const css = cssFiles
    .map(file => fs.readFileSync(path.join(sourceRoot, 'css', file), 'utf8'))
    .join('\n')
  const javascript = moduleOrder
    .map(file => {
      const absolutePath = path.join(sourceRoot, 'js', file)
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Required module is missing: src/js/${file}`)
      }
      return fs.readFileSync(absolutePath, 'utf8')
    })
    .join('\n')
  const packageMetadata = JSON.parse(read('package.json'))

  const bundle = template
    .replaceAll('@WIDGETVERSION', packageMetadata.version)
    .replace('@WIDGETHTML', escapeTemplateLiteral(html))
    .replace('@WIDGETCSS', escapeTemplateLiteral(css))
    .replace('/* @WIDGETJS */', javascript)

  if (
    bundle.includes('@WIDGETHTML') ||
    bundle.includes('@WIDGETCSS') ||
    bundle.includes('@WIDGETJS') ||
    bundle.includes('@WIDGETVERSION')
  ) {
    throw new Error('Build template contains an unresolved placeholder.')
  }

  const banner = `/*! Accessibility Preference Widget v${packageMetadata.version} | MIT License */\n`

  fs.mkdirSync(distRoot, { recursive: true })
  const development = await transform(bundle, {
    legalComments: 'inline',
    minify: false,
    sourcemap: 'external',
    sourcefile: 'widget.source.js',
    target: ['es2018'],
  })
  const developmentCode =
    banner + development.code + '//# sourceMappingURL=widget.js.map\n'
  fs.writeFileSync(path.join(distRoot, 'widget.js'), developmentCode)
  fs.writeFileSync(path.join(distRoot, 'widget.js.map'), development.map)

  const production = await transform(bundle, {
    legalComments: 'inline',
    minify: true,
    sourcemap: 'external',
    sourcefile: 'widget.source.js',
    target: ['es2018'],
  })
  const productionCode =
    banner + production.code + '//# sourceMappingURL=widget.min.js.map\n'
  fs.writeFileSync(path.join(distRoot, 'widget.min.js'), productionCode)
  fs.writeFileSync(path.join(distRoot, 'widget.min.js.map'), production.map)

  const integrity = {}
  for (const [name, content] of [
    ['widget.js', developmentCode],
    ['widget.min.js', productionCode],
  ]) {
    integrity[name] =
      'sha384-' +
      crypto.createHash('sha384').update(content, 'utf8').digest('base64')
  }
  fs.writeFileSync(
    path.join(distRoot, 'integrity.json'),
    JSON.stringify(integrity, null, 2) + '\n',
  )

  process.stdout.write(
    'Built readable/minified bundles, source maps, and integrity metadata in dist/\n',
  )
}

build().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`)
  process.exitCode = 1
})
