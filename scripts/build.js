const fs = require('node:fs')
const path = require('node:path')
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

  const bundle = template
    .replace('@WIDGETHTML', escapeTemplateLiteral(html))
    .replace('@WIDGETCSS', escapeTemplateLiteral(css))
    .replace('/* @WIDGETJS */', javascript)

  if (bundle.includes('@WIDGETHTML') || bundle.includes('@WIDGETCSS') || bundle.includes('@WIDGETJS')) {
    throw new Error('Build template contains an unresolved placeholder.')
  }

  const packageMetadata = JSON.parse(read('package.json'))
  const banner = `/*! Accessibility Preference Widget v${packageMetadata.version} | MIT License */\n`

  fs.mkdirSync(distRoot, { recursive: true })
  fs.writeFileSync(path.join(distRoot, 'widget.js'), banner + bundle + '\n')

  const production = await transform(bundle, {
    legalComments: 'inline',
    minify: true,
    target: ['es2018'],
  })
  fs.writeFileSync(path.join(distRoot, 'widget.min.js'), banner + production.code)

  process.stdout.write('Built dist/widget.js and dist/widget.min.js\n')
}

build().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`)
  process.exitCode = 1
})
