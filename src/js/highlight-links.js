let CURRENT_HIGHLIGHT_LINKS_STATE = false

function highlightLinks(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Bağlantıları Vurgula',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>`,
    id: 'highlightLinksBtn',
    type: 'button',
  }

  const handleHighlightLinks = function () {
    CURRENT_HIGHLIGHT_LINKS_STATE = !CURRENT_HIGHLIGHT_LINKS_STATE
    localStorage.setItem('a11y-highlight-links', CURRENT_HIGHLIGHT_LINKS_STATE)
    setHighlightLinks(CURRENT_HIGHLIGHT_LINKS_STATE)
  }

  function setHighlightLinks(currentState) {
    let styleEl = document.getElementById('a11y-highlight-links-style')

    if (currentState) {
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'a11y-highlight-links-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        a, [role="link"], [onclick] {
          background-color: yellow !important;
          color: black !important;
          text-decoration: underline !important;
          font-weight: bold !important;
        }
      `
    } else {
      if (styleEl) {
        styleEl.remove()
      }
    }

    toggleFeature(button, currentState)
  }

  initButton(button, handleHighlightLinks)

  function control() {
    let option = localStorage.getItem('a11y-highlight-links')
    if (option !== null) {
      CURRENT_HIGHLIGHT_LINKS_STATE = option === 'true'
      setHighlightLinks(CURRENT_HIGHLIGHT_LINKS_STATE)
    }
  }
  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_HIGHLIGHT_LINKS_STATE = false
    setHighlightLinks(false)
  })
}
