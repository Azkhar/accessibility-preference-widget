const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const projectRoot = path.resolve(__dirname, '..')
const sourceDirectories = ['compiler', 'scripts', 'src', 'test']
const excludedDirectories = new Set(['dist', 'node_modules'])

function collectJavaScriptFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectJavaScriptFiles(absolutePath))
    else if (entry.name.endsWith('.js')) files.push(absolutePath)
  }
  return files
}

const files = sourceDirectories.flatMap(relativeDirectory =>
  collectJavaScriptFiles(path.join(projectRoot, relativeDirectory)),
)

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }
}

const runtimeFiles = collectJavaScriptFiles(path.join(projectRoot, 'src')).concat(
  collectJavaScriptFiles(path.join(projectRoot, 'compiler')),
)
const runtime = runtimeFiles
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n')

const prohibitedPatterns = [
  {
    name: 'private integration code',
    pattern: /data-license|validateLicense|licenseCode|signLanguage|sign-language/i,
  },
  {
    name: 'private IPv4 address',
    pattern:
      /\b(?:10|127|192\.168)\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?|\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(?::\d+)?/,
  },
  {
    name: 'definitive WCAG claim',
    pattern:
      /WCAG[^\n]{0,30}(?:compliant|uyumlu|conformant)|(?:compliant|uyumlu|conformant)[^\n]{0,30}WCAG/i,
  },
  {
    name: 'debug console statement',
    pattern: /console\.(?:log|debug|info|warn)\s*\(/,
  },
]

for (const { name, pattern } of prohibitedPatterns) {
  if (pattern.test(runtime)) {
    process.stderr.write(`Check failed: ${name} found in public runtime.\n`)
    process.exit(1)
  }
}

process.stdout.write(
  `Checked ${files.length} JavaScript files and public runtime policy.\n`,
)
