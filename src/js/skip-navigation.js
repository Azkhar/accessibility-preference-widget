let CURRENT_SKIP_NAV_STATE = false

function skipNavigation(
  root,
  initButton,
  toggleFeature,
  registerReset,
  runtime = {},
) {
  const button = {
    name: 'İçeriğe Atla',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>`,
    id: 'skipNavigationBtn',
    type: 'button',
  }

  let skipLink = null
  let target = null
  let targetState = null

  function translate(key) {
    return window.a11yI18n ? window.a11yI18n.t(key) : 'Skip to main content'
  }

  function findMainContent() {
    const selectors = [
      '#main-content',
      'main',
      '[role="main"]',
      '.main-content',
      '.page-content',
      '#content',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element && !element.closest('[data-accessibility-preference-widget]')) {
        return element
      }
    }
    return null
  }

  function restoreTarget() {
    if (!target || !targetState || !target.isConnected) {
      target = null
      targetState = null
      return
    }

    if (targetState.generatedId) target.removeAttribute('id')
    if (targetState.generatedTabindex) target.removeAttribute('tabindex')
    target = null
    targetState = null
  }

  function updateTarget() {
    if (!CURRENT_SKIP_NAV_STATE || !skipLink) return
    const nextTarget = findMainContent()
    if (nextTarget === target) return

    restoreTarget()
    target = nextTarget
    if (!target) {
      skipLink.removeAttribute('href')
      skipLink.setAttribute('aria-disabled', 'true')
      return
    }

    targetState = {
      generatedId: !target.id,
      generatedTabindex: target.getAttribute('tabindex') === null,
    }
    if (!target.id) target.id = 'a11y-main-content'
    if (targetState.generatedTabindex) target.setAttribute('tabindex', '-1')

    skipLink.href = `#${target.id}`
    skipLink.removeAttribute('aria-disabled')
  }

  function handleSkip(event) {
    event.preventDefault()
    updateTarget()
    if (!target) return

    target.focus({ preventScroll: true })
    target.scrollIntoView({
      behavior:
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      block: 'start',
    })
  }

  function createSkipLink() {
    if (skipLink) return

    skipLink = document.createElement('a')
    skipLink.id = 'a11y-skip-link'
    skipLink.setAttribute('data-a11y-owned', '')
    skipLink.textContent = translate('skipLink')
    skipLink.style.cssText = `
      position: fixed !important;
      inset-block-start: 0 !important;
      inset-inline-start: 1rem !important;
      z-index: 2147483647 !important;
      padding: 0.75rem 1rem !important;
      border: 2px solid currentColor !important;
      border-radius: 0 0 0.5rem 0.5rem !important;
      background: #111827 !important;
      color: #ffffff !important;
      font: 600 1rem/1.25 system-ui, sans-serif !important;
      text-decoration: none !important;
      transform: translateY(-120%) !important;
      transition: transform 0.15s ease !important;
    `
    skipLink.addEventListener('click', handleSkip)
    skipLink.addEventListener('focus', () => {
      skipLink.style.setProperty('transform', 'translateY(0)', 'important')
    })
    skipLink.addEventListener('blur', () => {
      skipLink.style.setProperty('transform', 'translateY(-120%)', 'important')
    })
    document.body.insertBefore(skipLink, document.body.firstChild)
    updateTarget()
  }

  function removeSkipLink() {
    restoreTarget()
    if (skipLink) {
      skipLink.removeEventListener('click', handleSkip)
      skipLink.remove()
      skipLink = null
    }
  }

  function setSkipNavigation(currentState) {
    CURRENT_SKIP_NAV_STATE = Boolean(currentState)
    if (CURRENT_SKIP_NAV_STATE) createSkipLink()
    else removeSkipLink()
    toggleFeature(button, CURRENT_SKIP_NAV_STATE)
  }

  function handleSkipNavigation() {
    const nextState = !CURRENT_SKIP_NAV_STATE
    localStorage.setItem('a11y-skip-nav', String(nextState))
    setSkipNavigation(nextState)
  }

  initButton(button, handleSkipNavigation)

  const previousLanguageUpdater = window.updateSkipLinkText
  const updateSkipLinkText = function () {
    if (skipLink) skipLink.textContent = translate('skipLink')
  }
  window.updateSkipLinkText = updateSkipLinkText

  const savedState = localStorage.getItem('a11y-skip-nav')
  if (savedState !== null) setSkipNavigation(savedState === 'true')

  registerReset(() => setSkipNavigation(false))
  if (runtime.registerRefresh) runtime.registerRefresh(updateTarget)
  if (runtime.registerCleanup) {
    runtime.registerCleanup(() => {
      removeSkipLink()
      if (window.updateSkipLinkText === updateSkipLinkText) {
        if (previousLanguageUpdater) {
          window.updateSkipLinkText = previousLanguageUpdater
        } else {
          delete window.updateSkipLinkText
        }
      }
    })
  }
}
