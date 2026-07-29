function main(root) {
  const panel = root.getElementById('a11y-widget-panel')
  const trigger = root.getElementById('a11y-widget-trigger')
  const closeButton = root.querySelector('.a11y-close')
  const buttonsContainer = root.getElementById('a11y-widget-panel-buttons')
  const resetButton = root.getElementById('a11y-reset-btn')

  if (!panel || !trigger || !closeButton || !buttonsContainer) {
    throw new Error('Accessibility preference widget markup is incomplete.')
  }

  const moduleHandlers = {}
  const resetRegistry = []
  const backgroundInertState = new Map()
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')
  let restoreFocusTo = trigger

  function registerReset(resetFunction) {
    resetRegistry.push(resetFunction)
  }

  function setBackgroundInert(shouldBeInert) {
    const host = root.host
    if (!host || !document.body) return

    if (shouldBeInert) {
      for (const element of document.body.children) {
        if (element === host) continue
        backgroundInertState.set(element, element.hasAttribute('inert'))
        element.setAttribute('inert', '')
      }
      return
    }

    for (const [element, wasInert] of backgroundInertState) {
      if (!wasInert) element.removeAttribute('inert')
    }
    backgroundInertState.clear()
  }

  function getFocusableElements() {
    return [...panel.querySelectorAll(focusableSelector)].filter(
      element => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
    )
  }

  function openPanel() {
    if (!panel.hidden) return

    restoreFocusTo = root.activeElement || trigger
    panel.hidden = false
    panel.removeAttribute('inert')
    panel.classList.add('open')
    trigger.setAttribute('aria-expanded', 'true')
    setBackgroundInert(true)

    requestAnimationFrame(() => closeButton.focus())
  }

  function closePanel({ restoreFocus = true } = {}) {
    if (panel.hidden) return

    panel.classList.remove('open')
    panel.hidden = true
    panel.setAttribute('inert', '')
    trigger.setAttribute('aria-expanded', 'false')
    setBackgroundInert(false)

    if (restoreFocus && restoreFocusTo && typeof restoreFocusTo.focus === 'function') {
      restoreFocusTo.focus()
    }
  }

  function togglePanel() {
    if (panel.hidden) openPanel()
    else closePanel()
  }

  function handlePanelKeydown(event) {
    if (panel.hidden) return

    if (event.key === 'Escape') {
      event.preventDefault()
      closePanel()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) {
      event.preventDefault()
      closeButton.focus()
      return
    }

    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]
    const activeElement = root.activeElement

    if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function handleReset() {
    resetRegistry.forEach(resetFunction => {
      try {
        resetFunction()
      } catch {
        // A failed module reset must not prevent the remaining preferences from resetting.
      }
    })

    const keysToRemove = []
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key && key.startsWith('a11y-') && key !== 'a11y-lang') {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    root.querySelectorAll('.brutalist-button').forEach(button => {
      button.classList.remove('active')
      button.setAttribute('aria-pressed', 'false')
      button
        .querySelectorAll('.bar')
        .forEach(progressBar => progressBar.classList.remove('active'))
    })
  }

  function attachEventListeners() {
    trigger.addEventListener('click', togglePanel)
    closeButton.addEventListener('click', () => closePanel())
    if (resetButton) resetButton.addEventListener('click', handleReset)

    root.addEventListener('keydown', handlePanelKeydown)
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault()
        closePanel()
      }
    })

    buttonsContainer.addEventListener('click', event => {
      const button = event.target.closest('.brutalist-button')
      if (!button) return

      const handler = moduleHandlers[button.id]
      if (handler) handler()
    })

    document.addEventListener('pointerdown', event => {
      if (panel.hidden) return
      const path = event.composedPath()
      if (!path.includes(panel) && !path.includes(trigger)) closePanel()
    })
  }

  function initButton(button, handler) {
    let progressBars = '<div class="progress-bars">'
    for (let index = 0; index < (button?.cycleOptions?.maxLevel ?? 0); index += 1) {
      progressBars += '<div class="bar"></div>'
    }
    progressBars += '</div>'

    const translatedName = window.a11yI18n
      ? window.a11yI18n.t(button.id)
      : button.name

    const markup = `
      <div class="button-container">
        <span class="a11y-card-check" aria-hidden="true">✓</span>
        <button
          type="button"
          class="brutalist-button button-1"
          id="${button.id}"
          aria-pressed="false"
        >
          <div class="feature-icon" aria-hidden="true">
            ${button.icon}
          </div>
          <div class="button-text">
            <span>${translatedName}</span>
          </div>
          ${button.type === 'cycle' ? progressBars : ''}
        </button>
      </div>
    `

    buttonsContainer.insertAdjacentHTML('beforeend', markup)
    moduleHandlers[button.id] = handler
  }

  function toggleFeature(button, state) {
    const buttonElement = root.getElementById(button.id)
    if (!buttonElement) return

    buttonElement.classList.toggle('active', state)
    buttonElement.setAttribute('aria-pressed', state ? 'true' : 'false')
  }

  function cycleFeature(button, currentLevel) {
    const buttonElement = root.getElementById(button.id)
    if (!buttonElement) return

    buttonElement.querySelectorAll('.progress-bars > .bar').forEach((bar, index) => {
      bar.classList.toggle('active', index < currentLevel)
    })
    buttonElement.classList.toggle('active', currentLevel > 0)
    buttonElement.setAttribute('aria-pressed', currentLevel > 0 ? 'true' : 'false')
  }

  if (window.a11yI18n) {
    window.a11yI18n.initLanguage(root)
    window.a11yI18n.setLanguage(window.a11yI18n.getCurrentLang(), root)
  }

  attachEventListeners()
  if (typeof languageSelector === 'function') languageSelector(root)

  fontSize(root, initButton, cycleFeature, registerReset)
  highContrast(root, initButton, cycleFeature, registerReset)
  readingGuide(root, initButton, cycleFeature, registerReset)
  monochrome(root, initButton, toggleFeature, registerReset)
  skipNavigation(root, initButton, toggleFeature, registerReset)
  fontFamily(root, initButton, cycleFeature, registerReset)
  lineHeight(root, initButton, cycleFeature, registerReset)
  pauseAnimations(root, initButton, toggleFeature, registerReset)
  hideImages(root, initButton, toggleFeature, registerReset)
  highlightLinks(root, initButton, toggleFeature, registerReset)
  highlightTitles(root, initButton, toggleFeature, registerReset)
  largeCursor(root, initButton, toggleFeature, registerReset)
  letterSpacing(root, initButton, cycleFeature, registerReset)
  textAlign(root, initButton, cycleFeature, registerReset)
  tooltip(root, initButton, toggleFeature, registerReset)
  focusIndicator(root, initButton, toggleFeature, registerReset)
  audioDescription(root, initButton, toggleFeature, registerReset)

  if (typeof profiles === 'function') {
    profiles(root, moduleHandlers, registerReset)
  }
}
