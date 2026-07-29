let CURRENT_LARGE_CURSOR_STATE = false

function largeCursor(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Büyük İmleç',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M13.75 10.19l3.75 3.75-1.48 1.48-3.73-3.73L9 16.94V3h1.5v7.19z"/>
          </svg>`,
    id: 'largeCursorBtn',
    type: 'button',
  }

  const handleLargeCursor = function () {
    CURRENT_LARGE_CURSOR_STATE = !CURRENT_LARGE_CURSOR_STATE
    localStorage.setItem('a11y-large-cursor', CURRENT_LARGE_CURSOR_STATE)
    setLargeCursor(CURRENT_LARGE_CURSOR_STATE)
  }

  function setLargeCursor(currentState) {
    let styleEl = document.getElementById('a11y-large-cursor-style')

    if (currentState) {
      if (!styleEl) {
        styleEl = prepareWidgetStyle(document.createElement('style'))
        styleEl.id = 'a11y-large-cursor-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        body, body * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="black" stroke="white" stroke-width="2"/></svg>') 16 16, auto !important;
        }

        button, a, [role="button"], input, select, textarea {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="blue" stroke="white" stroke-width="2"/></svg>') 16 16, pointer !important;
        }
      `
    } else {
      if (styleEl) {
        styleEl.remove()
      }
    }

    toggleFeature(button, currentState)
  }

  handleLargeCursor.setPreference = state => {
    localStorage.setItem('a11y-large-cursor', String(Boolean(state)))
    setLargeCursor(Boolean(state))
  }
  initButton(button, handleLargeCursor)

  function control() {
    let option = localStorage.getItem('a11y-large-cursor')
    if (option !== null) {
      CURRENT_LARGE_CURSOR_STATE = option === 'true'
      setLargeCursor(CURRENT_LARGE_CURSOR_STATE)
    }
  }
  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_LARGE_CURSOR_STATE = false
    setLargeCursor(false)
  })
}
