const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { JSDOM } = require('jsdom')

const projectRoot = path.resolve(__dirname, '..')
const bundle = fs.readFileSync(
  path.join(projectRoot, 'dist', 'widget.js'),
  'utf8',
)

function createDom({
  url = 'https://example.com/',
  config,
  speechSynthesis = false,
} = {}) {
  const dom = new JSDOM(
    '<!doctype html><html><head><style>p{font-size:16px}</style></head><body><nav>Navigation</nav><main><p id="copy">Readable content</p><img id="hero" src="hero.jpg" alt="Sample"></main></body></html>',
    {
      url,
      runScripts: 'dangerously',
      pretendToBeVisual: true,
    },
  )
  const { window } = dom

  window.matchMedia = query => ({
    matches: query.includes('prefers-reduced-motion') ? false : false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
  window.HTMLElement.prototype.scrollIntoView = function () {}

  if (speechSynthesis) {
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text
    }
    window.speechSynthesis = {
      speaking: false,
      paused: false,
      cancel() {},
      speak() {},
      pause() {},
      resume() {},
    }
  }

  if (config) window.AccessibilityPreferenceWidgetConfig = config
  window.eval(bundle)
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'))
  return dom
}

function waitForRuntime(window, milliseconds = 30) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

function getWidget(dom) {
  const host = dom.window.document.querySelector(
    '[data-accessibility-preference-widget]',
  )
  return { host, root: host?.shadowRoot || null }
}

test('auto-mount exposes a stable API and an initially closed dialog', () => {
  const dom = createDom()
  const { window } = dom
  const { host, root } = getWidget(dom)

  assert.ok(host)
  assert.ok(root)
  assert.equal(window.AccessibilityPreferenceWidget.version, '1.1.0')
  assert.equal(window.AccessibilityPreferenceWidget.isMounted(), true)
  assert.equal(root.getElementById('a11y-widget-panel').hidden, true)
  assert.equal(
    root.getElementById('a11y-widget-trigger').getAttribute('aria-expanded'),
    'false',
  )
  dom.window.close()
})

test('open and close manage modal state, background inertness, and focus', async () => {
  const dom = createDom()
  const { window } = dom
  const { host, root } = getWidget(dom)
  const trigger = root.getElementById('a11y-widget-trigger')
  const panel = root.getElementById('a11y-widget-panel')

  trigger.focus()
  window.AccessibilityPreferenceWidget.open()
  await waitForRuntime(window)

  assert.equal(panel.hidden, false)
  assert.equal(trigger.getAttribute('aria-expanded'), 'true')
  assert.equal(window.document.querySelector('main').hasAttribute('inert'), true)
  assert.equal(root.activeElement.classList.contains('a11y-close'), true)

  root.activeElement.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  )
  assert.equal(panel.hidden, true)
  assert.equal(trigger.getAttribute('aria-expanded'), 'false')
  assert.equal(window.document.querySelector('main').hasAttribute('inert'), false)
  assert.equal(root.activeElement, trigger)
  assert.ok(host.isConnected)
  dom.window.close()
})

test('dynamic content receives active text and image preferences and destroy restores it', async () => {
  const dom = createDom()
  const { window } = dom
  const { root } = getWidget(dom)
  const copy = window.document.getElementById('copy')
  const hero = window.document.getElementById('hero')
  copy.style.fontSize = '20px'

  root.getElementById('fontSizeBtn').click()
  root.getElementById('hideImagesBtn').click()
  assert.equal(copy.style.fontSize, '21px')
  assert.equal(hero.style.getPropertyValue('display'), 'none')

  const dynamicCopy = window.document.createElement('p')
  dynamicCopy.textContent = 'Added after mount'
  const dynamicImage = window.document.createElement('img')
  dynamicImage.alt = 'Added after mount'
  window.document.querySelector('main').append(dynamicCopy, dynamicImage)
  await waitForRuntime(window, 60)

  assert.equal(dynamicCopy.getAttribute('data-a11y-font-size'), '1')
  assert.equal(dynamicImage.style.getPropertyValue('display'), 'none')

  window.AccessibilityPreferenceWidget.destroy()

  assert.equal(copy.style.fontSize, '20px')
  assert.equal(hero.style.getPropertyValue('display'), '')
  assert.equal(dynamicCopy.style.getPropertyValue('font-size'), '')
  assert.equal(dynamicImage.style.getPropertyValue('display'), '')
  assert.equal(window.localStorage.getItem('a11y-font-size'), '1')
  assert.equal(window.localStorage.getItem('a11y-hide-images'), 'true')
  assert.equal(getWidget(dom).host, null)
  dom.window.close()
})

test('route exclusions unmount and remount the widget during SPA navigation', async () => {
  const dom = createDom({ config: { excludePaths: ['/badge'] } })
  const { window } = dom
  assert.ok(getWidget(dom).host)

  window.history.pushState({}, '', '/badge/demo')
  window.document.dispatchEvent(
    new window.Event('accessibility-preference-widget:navigate'),
  )
  await waitForRuntime(window, 60)
  assert.equal(getWidget(dom).host, null)

  window.history.pushState({}, '', '/projects')
  window.document.dispatchEvent(
    new window.Event('accessibility-preference-widget:navigate'),
  )
  await waitForRuntime(window, 60)
  assert.ok(getWidget(dom).host)
  dom.window.close()
})

test('manual mount applies placement configuration without duplicate hosts', () => {
  const dom = createDom({ config: { autoMount: false } })
  const { window } = dom
  assert.equal(getWidget(dom).host, null)

  window.AccessibilityPreferenceWidget.mount({
    position: 'bottom-left',
    offsetX: '2rem',
    offsetY: '3rem',
  })
  window.AccessibilityPreferenceWidget.mount()

  const hosts = window.document.querySelectorAll(
    '[data-accessibility-preference-widget]',
  )
  assert.equal(hosts.length, 1)
  assert.equal(hosts[0].dataset.position, 'bottom-left')
  assert.equal(hosts[0].style.getPropertyValue('--a11y-widget-offset-x'), '2rem')
  assert.equal(hosts[0].style.getPropertyValue('--a11y-widget-offset-y'), '3rem')
  dom.window.close()
})

test('CSP nonce is applied to widget-owned style elements', () => {
  const dom = createDom({ config: { nonce: 'test-nonce' } })
  const { window } = dom
  const { root } = getWidget(dom)

  assert.equal(root.querySelector('style').getAttribute('nonce'), 'test-nonce')
  root.getElementById('highContrastBtn').click()
  assert.equal(
    window.document
      .querySelector('style[data-a11y-owned]')
      .getAttribute('nonce'),
    'test-nonce',
  )
  dom.window.close()
})

test('reset clears widget preferences except language and restores images', () => {
  const dom = createDom()
  const { window } = dom
  const { root } = getWidget(dom)
  const image = window.document.getElementById('hero')

  window.localStorage.setItem('a11y-lang', 'en')
  root.getElementById('hideImagesBtn').click()
  assert.equal(image.style.getPropertyValue('display'), 'none')

  window.AccessibilityPreferenceWidget.reset()

  assert.equal(image.style.getPropertyValue('display'), '')
  assert.equal(window.localStorage.getItem('a11y-hide-images'), null)
  assert.equal(window.localStorage.getItem('a11y-lang'), 'en')
  dom.window.close()
})

test('runtime configuration can update the interface language', () => {
  const dom = createDom({ config: { language: 'en' } })
  const { window } = dom
  const { root } = getWidget(dom)

  assert.equal(root.getElementById('a11y-title').innerText, 'ACCESSIBILITY TOOLS')
  window.AccessibilityPreferenceWidget.configure({ language: 'tr' })
  assert.equal(
    root.getElementById('a11y-title').innerText,
    'ERİŞİLEBİLİRLİK ARAÇLARI',
  )
  dom.window.close()
})

test('language and profile disclosures are keyboard-native buttons', () => {
  const dom = createDom()
  const { root } = getWidget(dom)
  const languageToggle = root.getElementById('a11y-lang-toggle')
  const languageContent = root.getElementById('a11y-lang-content')
  const profileToggle = root.querySelector('.a11y-profiles-header')
  const profileContent = root.getElementById('a11y-profiles-content')

  assert.equal(languageToggle.tagName, 'BUTTON')
  assert.equal(profileToggle.tagName, 'BUTTON')
  assert.equal(languageToggle.getAttribute('aria-expanded'), 'false')
  assert.equal(profileToggle.getAttribute('aria-expanded'), 'false')
  assert.equal(languageContent.hidden, true)
  assert.equal(profileContent.hidden, true)

  languageToggle.click()
  profileToggle.click()

  assert.equal(languageToggle.getAttribute('aria-expanded'), 'true')
  assert.equal(profileToggle.getAttribute('aria-expanded'), 'true')
  assert.equal(languageContent.hidden, false)
  assert.equal(profileContent.hidden, false)
  dom.window.close()
})

test('preference profiles use neutral labels instead of medical safety claims', () => {
  const dom = createDom({ config: { language: 'en' } })
  const { root } = getWidget(dom)
  const labels = [...root.querySelectorAll('.a11y-profile-title')].map(
    element => element.textContent.trim(),
  )

  assert.ok(labels.includes('Reduced Motion'))
  assert.ok(labels.includes('Readable Typography'))
  assert.doesNotMatch(labels.join(' '), /safe|epilep|disability|impaired/i)
  dom.window.close()
})

test('skip navigation adds a focusable link without hiding site navigation', () => {
  const dom = createDom()
  const { window } = dom
  const { root } = getWidget(dom)
  const navigation = window.document.querySelector('nav')
  const main = window.document.querySelector('main')

  root.getElementById('skipNavigationBtn').click()
  const skipLink = window.document.getElementById('a11y-skip-link')

  assert.ok(skipLink)
  assert.equal(navigation.style.getPropertyValue('display'), '')
  skipLink.click()
  assert.equal(window.document.activeElement, main)

  window.AccessibilityPreferenceWidget.destroy()
  assert.equal(window.document.getElementById('a11y-skip-link'), null)
  assert.equal(main.hasAttribute('tabindex'), false)
  dom.window.close()
})

test('read-aloud control is disabled when the Web Speech API is unavailable', () => {
  const dom = createDom()
  const { root } = getWidget(dom)
  const button = root.getElementById('audioDescriptionBtn')

  assert.equal(button.disabled, true)
  assert.equal(button.getAttribute('aria-disabled'), 'true')
  dom.window.close()
})

test('mount remains functional when browser storage is unavailable', () => {
  const dom = createDom({ url: 'about:blank' })
  const { root } = getWidget(dom)

  assert.ok(root)
  root.getElementById('highlightLinksBtn').click()
  assert.equal(
    root.getElementById('highlightLinksBtn').getAttribute('aria-pressed'),
    'true',
  )
  dom.window.close()
})
