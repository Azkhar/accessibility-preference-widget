let CURRENT_MONOCHROME_STATE = false

function monochrome(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Monokrom',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <circle cx="12" cy="12" r="5"/>
          </svg>`,
    id: 'monochromeBtn',
    type: 'button',
  }

  const handleMonochrome = function () {
    CURRENT_MONOCHROME_STATE = !CURRENT_MONOCHROME_STATE
    localStorage.setItem('a11y-monochrome', CURRENT_MONOCHROME_STATE)
    setMonochrome(CURRENT_MONOCHROME_STATE)
  }

  function setMonochrome(currentState) {
    let styleEl = document.getElementById('a11y-monochrome-style')

    if (currentState) {
      if (!styleEl) {
        styleEl = prepareWidgetStyle(document.createElement('style'))
        styleEl.id = 'a11y-monochrome-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        html {
          filter: grayscale(100%) !important;
        }
      `
    } else {
      if (styleEl) {
        styleEl.remove()
      }
    }

    toggleFeature(button, currentState)
  }

  handleMonochrome.setPreference = state => {
    localStorage.setItem('a11y-monochrome', String(Boolean(state)))
    setMonochrome(Boolean(state))
  }
  initButton(button, handleMonochrome)

  function control() {
    let option = localStorage.getItem('a11y-monochrome')
    if (option !== null) {
      CURRENT_MONOCHROME_STATE = option === 'true'
      setMonochrome(CURRENT_MONOCHROME_STATE)
    }
  }
  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_MONOCHROME_STATE = false
    setMonochrome(false)
  })
}
