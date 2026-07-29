const FONT_FAMILY_VALUES = [
  'reset',
  'Arial, sans-serif',
  'Verdana, sans-serif',
  'Georgia, serif',
  '"Courier New", monospace',
]

let CURRENT_FONT_FAMILY_LEVEL = 0

function fontFamily(root, initButton, cycleFeature, registerReset) {
  const button = {
    name: 'Yazı Tipi',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>
          </svg>`,
    id: 'fontFamilyBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: FONT_FAMILY_VALUES.length - 1,
      currentLevel: 0,
    },
  }

  const handleFontFamily = function () {
    CURRENT_FONT_FAMILY_LEVEL =
      (CURRENT_FONT_FAMILY_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-font-family', CURRENT_FONT_FAMILY_LEVEL)
    setFontFamily(CURRENT_FONT_FAMILY_LEVEL)
  }

  function setFontFamily(currentLevel) {
    let styleEl = document.getElementById('a11y-font-family-style')

    if (styleEl) {
      styleEl.remove()
    }

    if (currentLevel > 0) {
      const fontFamilyValue = FONT_FAMILY_VALUES[currentLevel]
      styleEl = prepareWidgetStyle(document.createElement('style'))
      styleEl.id = 'a11y-font-family-style'
      styleEl.textContent = `
      body, body *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not([class*="icon"]):not([class*="Icon"]):not(.glyphicon):not([class*="bi-"]):not([class*="ti-"]) {
        font-family: ${fontFamilyValue} !important;
      }
    `
      document.head.appendChild(styleEl)
    }

    cycleFeature(button, currentLevel)
  }

  handleFontFamily.setPreference = level => {
    localStorage.setItem('a11y-font-family', String(level))
    setFontFamily(Number(level))
  }
  initButton(button, handleFontFamily)

  function control() {
    let option = localStorage.getItem('a11y-font-family')
    if (option !== null) {
      CURRENT_FONT_FAMILY_LEVEL = parseInt(option)
      setFontFamily(CURRENT_FONT_FAMILY_LEVEL)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_FONT_FAMILY_LEVEL = 0
    setFontFamily(0)
  })
}
