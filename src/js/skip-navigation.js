let CURRENT_SKIP_NAV_STATE = false

function skipNavigation(root, initButton, toggleFeature, registerReset) {
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
  let hiddenElements = []

  // Helper to get translation
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)

  const handleSkipNavigation = function () {
    CURRENT_SKIP_NAV_STATE = !CURRENT_SKIP_NAV_STATE
    localStorage.setItem('a11y-skip-nav', CURRENT_SKIP_NAV_STATE)
    setSkipNavigation(CURRENT_SKIP_NAV_STATE)
  }

  function createSkipLink() {
    if (skipLink) return skipLink

    skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.id = 'a11y-skip-link'

    // Improved Design with Flexbox for Icon
    skipLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        <span>${tr('skipLink')}</span>
    `

    // Styles
    skipLink.style.cssText = `
      position: fixed !important;
      top: -60px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background: #000 !important;
      background: rgba(17, 24, 39, 0.95) !important;
      color: #fff !important;
      padding: 12px 24px !important;
      z-index: 2147483647 !important;
      text-decoration: none !important;
      border-radius: 0 0 12px 12px !important;
      font-family: 'Inter', sans-serif !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      backdrop-filter: blur(10px) !important;
      transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-top: none !important;
    `

    // Hover effect
    skipLink.addEventListener('mouseenter', () => {
      skipLink.style.background = '#000000'
    })
    skipLink.addEventListener('mouseleave', () => {
      skipLink.style.background = 'rgba(17, 24, 39, 0.95)'
    })

    skipLink.addEventListener('focus', function () {
      this.style.top = '0'
      this.style.outline = '3px solid #F7DD17'
      this.style.outlineOffset = '-3px'
    })

    skipLink.addEventListener('blur', function () {
      this.style.top = '-60px'
      this.style.outline = 'none'
    })

    // Insert at beginning of body
    document.body.insertBefore(skipLink, document.body.firstChild)
    return skipLink
  }

  function findMainContent() {
    let mainContent = document.getElementById('main-content')
    if (!mainContent) {
      const possibleSelectors = [
        'main',
        '[role="main"]',
        '.main-content',
        '.content',
        '#content',
        '.main',
        '.app-main',
        '.page-content',
      ]
      for (let selector of possibleSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          element.id = 'main-content'
          mainContent = element
          if (element.getAttribute('tabindex') === null) {
            element.setAttribute('tabindex', '-1')
          }
          break
        }
      }
      if (!mainContent) {
        const firstChild = document.body.children[0]
        if (
          firstChild &&
          firstChild.tagName !== 'SCRIPT' &&
          firstChild.tagName !== 'STYLE'
        ) {
          firstChild.id = 'main-content'
          firstChild.setAttribute('tabindex', '-1')
          mainContent = firstChild
        }
      }
    }
    return mainContent
  }

  function hideNavigationElements() {
    const navSelectors = [
      'nav',
      'header',
      '.navbar',
      '.navigation',
      '.nav',
      '.header',
      '.site-header',
      '[role="navigation"]',
      '.menu',
      '.main-menu',
    ]
    hiddenElements = []
    navSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (el.offsetParent !== null && !el.closest('#main-content')) {
          const originalStyle = el.getAttribute('style') || ''
          hiddenElements.push({ el, originalStyle })
          el.style.cssText += 'display: none !important;'
        }
      })
    })
  }

  function showNavigationElements() {
    hiddenElements.forEach(({ el, originalStyle }) => {
      el.style.cssText = originalStyle
    })
    hiddenElements = []
  }

  function setSkipNavigation(currentState) {
    if (currentState) {
      if (!skipLink) createSkipLink()
      const mainContent = findMainContent()
      hideNavigationElements()

      // Show and focus
      setTimeout(() => {
        skipLink.style.top = '0'
        skipLink.focus()
        // Auto-hide after delay if focus lost
        setTimeout(() => {
          if (document.activeElement !== skipLink) {
            skipLink.style.top = '-60px'
          }
        }, 3000)
      }, 100)

      // Handle click to scroll
      skipLink.onclick = e => {
        e.preventDefault()
        if (mainContent) {
          mainContent.focus()
          mainContent.scrollIntoView({ behavior: 'smooth' })
          skipLink.style.top = '-60px'
        }
      }
    } else {
      showNavigationElements()
      if (skipLink) {
        skipLink.remove()
        skipLink = null
      }
    }
    toggleFeature(button, currentState)
  }

  initButton(button, handleSkipNavigation)

  // Listen for language changes globally
  const originalUpdate = window.updateAllTexts
  // Hook if not already hooked (simple check)
  // Or better, just expose a function that updateAllTexts calls if we modify i18n.js
  // For now, let's redefine updateSkipLinkText globally
  window.updateSkipLinkText = function () {
    const link = document.getElementById('a11y-skip-link')
    if (link) {
      const span = link.querySelector('span')
      if (span) span.innerText = tr('skipLink')
    }
  }

  function control() {
    let option = localStorage.getItem('a11y-skip-nav')
    if (option !== null) {
      CURRENT_SKIP_NAV_STATE = option === 'true'
      setSkipNavigation(CURRENT_SKIP_NAV_STATE)
    }
  }
  control()

  registerReset(() => {
    CURRENT_SKIP_NAV_STATE = false
    setSkipNavigation(false)
  })
}
