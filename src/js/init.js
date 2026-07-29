function main(root, runtime = {}) {
  const panel = root.getElementById('a11y-widget-panel')
  const trigger = root.getElementById('a11y-widget-trigger')
  const closeButton = root.querySelector('.a11y-close')
  const buttonsContainer = root.getElementById('a11y-widget-panel-buttons')
  const resetButton = root.getElementById('a11y-reset-btn')
  const statusRegion = root.getElementById('a11y-widget-status')

  if (!panel || !trigger || !closeButton || !buttonsContainer) {
    throw new Error('Accessibility preference widget markup is incomplete.')
  }

  const moduleHandlers = {}
  const resetRegistry = []
  const refreshRegistry = []
  const cleanupRegistry = []
  const backgroundInertState = new Map()
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')
  let config = runtime.config || {}
  let restoreFocusTo = trigger
  let mutationObserver = null
  let refreshScheduled = false
  let destroyed = false

  function registerReset(resetFunction) {
    if (typeof resetFunction === 'function') resetRegistry.push(resetFunction)
  }

  function registerRefresh(refreshFunction) {
    if (typeof refreshFunction === 'function') refreshRegistry.push(refreshFunction)
  }

  function registerCleanup(cleanupFunction) {
    if (typeof cleanupFunction === 'function') cleanupRegistry.push(cleanupFunction)
  }

  const moduleRuntime = {
    config,
    registerCleanup,
    registerRefresh,
  }

  function getPreferenceSnapshot() {
    const snapshot = new Map()
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key && key.startsWith('a11y-')) {
          snapshot.set(key, localStorage.getItem(key))
        }
      }
    } catch {
      // Storage may be unavailable in hardened or opaque-origin contexts.
    }
    return snapshot
  }

  function restorePreferenceSnapshot(snapshot) {
    try {
      for (const [key, value] of snapshot) {
        if (value !== null) localStorage.setItem(key, value)
      }
    } catch {
      // Runtime cleanup must still succeed when storage is unavailable.
    }
  }

  function runSafely(functions) {
    functions.forEach(callback => {
      try {
        callback()
      } catch {
        // A failed module must not prevent the remaining modules from cleaning up.
      }
    })
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
      if (!wasInert && element.isConnected) element.removeAttribute('inert')
    }
    backgroundInertState.clear()
  }

  function getFocusableElements() {
    return [...panel.querySelectorAll(focusableSelector)].filter(element => {
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false
      return !element.closest('[hidden], [inert]')
    })
  }

  function openPanel() {
    if (destroyed || !panel.hidden) return

    restoreFocusTo = root.activeElement || trigger
    panel.hidden = false
    panel.removeAttribute('inert')
    panel.classList.add('open')
    trigger.setAttribute('aria-expanded', 'true')
    setBackgroundInert(true)

    requestAnimationFrame(() => {
      if (!destroyed && !panel.hidden) closeButton.focus()
    })
  }

  function closePanel({ restoreFocus = true } = {}) {
    if (panel.hidden) {
      setBackgroundInert(false)
      return
    }

    panel.classList.remove('open')
    panel.hidden = true
    panel.setAttribute('inert', '')
    trigger.setAttribute('aria-expanded', 'false')
    setBackgroundInert(false)

    if (
      restoreFocus &&
      restoreFocusTo &&
      restoreFocusTo.isConnected &&
      typeof restoreFocusTo.focus === 'function'
    ) {
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

  function resetPreferences() {
    runSafely(resetRegistry)

    try {
      const keysToRemove = []
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key && key.startsWith('a11y-') && key !== 'a11y-lang') {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch {
      // Visual reset remains useful when persistent storage is unavailable.
    }

    root.querySelectorAll('.brutalist-button').forEach(button => {
      button.classList.remove('active')
      button.setAttribute('aria-pressed', 'false')
      button
        .querySelectorAll('.bar')
        .forEach(progressBar => progressBar.classList.remove('active'))
    })

    if (statusRegion) {
      statusRegion.textContent = window.a11yI18n
        ? window.a11yI18n.t('resetSettings')
        : 'Settings reset'
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault()
      closePanel()
    }
  }

  function handleButtonsClick(event) {
    const button = event.target.closest('.brutalist-button')
    if (!button) return

    const handler = moduleHandlers[button.id]
    if (handler) handler()
  }

  function handleDocumentPointerdown(event) {
    if (panel.hidden) return
    const path =
      typeof event.composedPath === 'function' ? event.composedPath() : []
    if (!path.includes(panel) && !path.includes(trigger)) closePanel()
  }

  function attachEventListeners() {
    trigger.addEventListener('click', togglePanel)
    closeButton.addEventListener('click', closePanel)
    if (resetButton) resetButton.addEventListener('click', resetPreferences)
    root.addEventListener('keydown', handlePanelKeydown)
    document.addEventListener('keydown', handleDocumentKeydown)
    buttonsContainer.addEventListener('click', handleButtonsClick)
    document.addEventListener('pointerdown', handleDocumentPointerdown)
  }

  function detachEventListeners() {
    trigger.removeEventListener('click', togglePanel)
    closeButton.removeEventListener('click', closePanel)
    if (resetButton) resetButton.removeEventListener('click', resetPreferences)
    root.removeEventListener('keydown', handlePanelKeydown)
    document.removeEventListener('keydown', handleDocumentKeydown)
    buttonsContainer.removeEventListener('click', handleButtonsClick)
    document.removeEventListener('pointerdown', handleDocumentPointerdown)
  }

  function initButton(button, handler) {
    let progressBars = '<div class="progress-bars" aria-hidden="true">'
    for (let index = 0; index < (button?.cycleOptions?.maxLevel ?? 0); index += 1) {
      progressBars += '<span class="bar"></span>'
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
          <span class="feature-icon" aria-hidden="true">
            ${button.icon}
          </span>
          <span class="button-text">
            <span>${translatedName}</span>
          </span>
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
    buttonElement.setAttribute('data-level', String(currentLevel))
  }

  function refresh() {
    if (destroyed) return
    runSafely(refreshRegistry)
  }

  function scheduleRefresh() {
    if (refreshScheduled || destroyed) return
    refreshScheduled = true
    const schedule =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : callback => setTimeout(callback, 0)
    schedule(() => {
      refreshScheduled = false
      refresh()
    })
  }

  function startDomObserver() {
    if (
      mutationObserver ||
      config.observeDom === false ||
      typeof MutationObserver !== 'function' ||
      !document.body
    ) {
      return
    }

    mutationObserver = new MutationObserver(mutations => {
      const hasHostMutation = mutations.some(mutation =>
        [...mutation.addedNodes].some(node => {
          if (node.nodeType !== 1) return false
          return node !== root.host
        }),
      )
      if (hasHostMutation) scheduleRefresh()
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })
  }

  function stopDomObserver() {
    if (mutationObserver) mutationObserver.disconnect()
    mutationObserver = null
  }

  function configure(nextConfig = {}) {
    config = { ...config, ...nextConfig }
    moduleRuntime.config = config
    if (
      nextConfig.language &&
      nextConfig.language !== 'auto' &&
      window.a11yI18n
    ) {
      window.a11yI18n.setLanguage(nextConfig.language, root)
    }
    if (config.observeDom === false) stopDomObserver()
    else startDomObserver()
  }

  function destroy({ preservePreferences = true } = {}) {
    if (destroyed) return
    destroyed = true

    const preferenceSnapshot = preservePreferences
      ? getPreferenceSnapshot()
      : new Map()

    stopDomObserver()
    closePanel({ restoreFocus: false })
    detachEventListeners()
    runSafely(resetRegistry)
    runSafely([...cleanupRegistry].reverse())
    setBackgroundInert(false)
    document
      .querySelectorAll('[data-a11y-owned]')
      .forEach(element => element.remove())

    if (preservePreferences) restorePreferenceSnapshot(preferenceSnapshot)
  }

  if (window.a11yI18n) {
    window.a11yI18n.initLanguage(root)
    const requestedLanguage =
      config.language && config.language !== 'auto'
        ? config.language
        : window.a11yI18n.getCurrentLang()
    window.a11yI18n.setLanguage(requestedLanguage, root)
  }

  attachEventListeners()
  if (typeof languageSelector === 'function') {
    languageSelector(root, moduleRuntime)
  }

  fontSize(root, initButton, cycleFeature, registerReset, moduleRuntime)
  highContrast(root, initButton, cycleFeature, registerReset, moduleRuntime)
  readingGuide(root, initButton, cycleFeature, registerReset, moduleRuntime)
  monochrome(root, initButton, toggleFeature, registerReset, moduleRuntime)
  skipNavigation(root, initButton, toggleFeature, registerReset, moduleRuntime)
  fontFamily(root, initButton, cycleFeature, registerReset, moduleRuntime)
  lineHeight(root, initButton, cycleFeature, registerReset, moduleRuntime)
  pauseAnimations(root, initButton, toggleFeature, registerReset, moduleRuntime)
  hideImages(root, initButton, toggleFeature, registerReset, moduleRuntime)
  highlightLinks(root, initButton, toggleFeature, registerReset, moduleRuntime)
  highlightTitles(root, initButton, toggleFeature, registerReset, moduleRuntime)
  largeCursor(root, initButton, toggleFeature, registerReset, moduleRuntime)
  letterSpacing(root, initButton, cycleFeature, registerReset, moduleRuntime)
  textAlign(root, initButton, cycleFeature, registerReset, moduleRuntime)
  tooltip(root, initButton, toggleFeature, registerReset, moduleRuntime)
  focusIndicator(root, initButton, toggleFeature, registerReset, moduleRuntime)
  audioDescription(root, initButton, toggleFeature, registerReset, moduleRuntime)

  if (typeof profiles === 'function') {
    profiles(root, moduleHandlers, registerReset, moduleRuntime)
  }

  startDomObserver()

  return {
    open: openPanel,
    close: closePanel,
    reset: resetPreferences,
    refresh,
    configure,
    destroy,
  }
}
