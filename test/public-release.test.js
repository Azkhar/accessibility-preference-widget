const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const projectRoot = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function collectFiles(relativeDirectories) {
  const files = []

  function visit(absolutePath) {
    for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
      const child = path.join(absolutePath, entry.name)
      if (entry.isDirectory()) visit(child)
      else files.push(child)
    }
  }

  for (const relativeDirectory of relativeDirectories) {
    visit(path.join(projectRoot, relativeDirectory))
  }

  return files
}

test('package metadata points to build artifacts and uses MIT', () => {
  const metadata = JSON.parse(read('package.json'))
  assert.equal(metadata.main, 'dist/widget.js')
  assert.equal(metadata.browser, 'dist/widget.min.js')
  assert.equal(metadata.license, 'MIT')
  assert.match(metadata.description, /^WCAG 2\.2-focused /)
  assert.ok(fs.existsSync(path.join(projectRoot, metadata.main)))
  assert.ok(fs.existsSync(path.join(projectRoot, metadata.browser)))
})

test('build creates readable and minified standalone bundles', () => {
  const development = read('dist/widget.js')
  const production = read('dist/widget.min.js')

  assert.match(development, /attachShadow\(\{ mode: 'open' \}\)/)
  assert.match(development, /main\(shadowRoot\)/)
  assert.ok(production.length < development.length)
  assert.ok(development.length > 1000)
})

test('public runtime contains no private integrations or definitive WCAG claims', () => {
  const runtimeFiles = [
    ...collectFiles(['src', 'compiler']),
    path.join(projectRoot, 'demo', 'index.html'),
    path.join(projectRoot, 'dist', 'widget.js'),
    path.join(projectRoot, 'dist', 'widget.min.js'),
  ]
  const combined = runtimeFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n')

  assert.doesNotMatch(combined, /data-license|validateLicense|licenseCode|signLanguage|sign-language/i)
  assert.doesNotMatch(combined, /\b(?:10|127|192\.168)\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?/)
  assert.doesNotMatch(combined, /\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(?::\d+)?/)
  assert.doesNotMatch(combined, /WCAG[^\n]{0,30}(?:compliant|uyumlu|konform|conforme|cumple|compatível|соответствует|準拠|符合|متوافق)/i)
  assert.doesNotMatch(combined, /(?:compliant|uyumlu|konform|conforme|cumple|compatível|соответствует|準拠|符合|متوافق)[^\n]{0,30}WCAG/i)
  assert.doesNotMatch(combined, /openai-logo|Ctrl\+U|console\.log/)
})

test('dialog starts closed and exposes its state to assistive technology', () => {
  const markup = read('src/widget.html')

  assert.match(markup, /aria-expanded="false"/)
  assert.match(markup, /aria-controls="a11y-widget-panel"/)
  assert.match(markup, /id="a11y-widget-panel"[\s\S]*?\bhidden\b[\s\S]*?\binert\b/)
})

test('demo is independent and uses the readable local bundle', () => {
  const demo = read('demo/index.html')

  assert.match(demo, /src="\.\.\/dist\/widget\.js"/)
  assert.doesNotMatch(demo, /data-license|YOUR_LICENSE_KEY|example\.com/i)
})

test('local and generated directories are excluded from version control', () => {
  const ignoreRules = read('.gitignore')

  assert.match(ignoreRules, /^node_modules\/$/m)
  assert.match(ignoreRules, /^dist\/$/m)
  assert.match(ignoreRules, /^\.serena\/$/m)
})
