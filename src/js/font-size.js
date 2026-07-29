const FONT_STEP = 5
let CURRENT_FONT_SIZE_LEVEL = 0

function fontSize(
  root,
  initButton,
  cycleFeature,
  registerReset,
  runtime = {},
) {
  const TEXT_TAGS =
    'h1, h2, h3, h4, h5, h6, p, a, span, li, td, th, blockquote, label, button, input, textarea, cite, caption, small, b, i, strong, em'
  const touchedElements = new Set()
  const originalStyles = new WeakMap()

  const button = {
    name: 'Yazı Boyutu',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" /></svg>`,
    id: 'fontSizeBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 4,
      currentLevel: 0,
    },
  }

  function rememberElement(element) {
    if (originalStyles.has(element)) {
      touchedElements.add(element)
      return originalStyles.get(element)
    }

    const computedSize = Number.parseFloat(window.getComputedStyle(element).fontSize)
    if (!Number.isFinite(computedSize)) return null

    const original = {
      computedSize,
      inlineValue: element.style.getPropertyValue('font-size'),
      inlinePriority: element.style.getPropertyPriority('font-size'),
    }
    originalStyles.set(element, original)
    touchedElements.add(element)
    return original
  }

  function restoreElement(element) {
    const original = originalStyles.get(element)
    if (!original || !element.isConnected) return

    if (original.inlineValue) {
      element.style.setProperty(
        'font-size',
        original.inlineValue,
        original.inlinePriority,
      )
    } else {
      element.style.removeProperty('font-size')
    }
    element.removeAttribute('data-a11y-font-size')
    originalStyles.delete(element)
  }

  function restoreAll() {
    touchedElements.forEach(restoreElement)
    touchedElements.clear()
  }

  function applyToDocument() {
    if (CURRENT_FONT_SIZE_LEVEL <= 0) return

    const multiplier = 1 + CURRENT_FONT_SIZE_LEVEL * (FONT_STEP / 100)
    document.querySelectorAll(TEXT_TAGS).forEach(element => {
      if (element.closest('[data-accessibility-preference-widget]')) return
      const original = rememberElement(element)
      if (!original) return

      element.style.setProperty(
        'font-size',
        `${original.computedSize * multiplier}px`,
      )
      element.setAttribute(
        'data-a11y-font-size',
        String(CURRENT_FONT_SIZE_LEVEL),
      )
    })
  }

  function setLevel(level) {
    const normalized = Number.isFinite(level)
      ? Math.min(Math.max(Math.trunc(level), 0), button.cycleOptions.maxLevel)
      : 0

    if (normalized === 0) restoreAll()
    CURRENT_FONT_SIZE_LEVEL = normalized

    if (normalized > 0) applyToDocument()
    cycleFeature(button, normalized)
  }

  function handleFontSize() {
    const nextLevel =
      (CURRENT_FONT_SIZE_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-font-size', String(nextLevel))
    setLevel(nextLevel)
  }
  handleFontSize.setPreference = level => {
    localStorage.setItem('a11y-font-size', String(level))
    setLevel(level)
  }

  initButton(button, handleFontSize)

  const savedLevel = Number.parseInt(localStorage.getItem('a11y-font-size'), 10)
  if (Number.isFinite(savedLevel)) setLevel(savedLevel)

  registerReset(() => setLevel(0))
  if (runtime.registerRefresh) runtime.registerRefresh(applyToDocument)
}
