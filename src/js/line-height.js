const LINE_HEIGHT_VALUES = ['normal', '2.0', '2.5', '3.0']
let CURRENT_LINE_HEIGHT_LEVEL = 0

function lineHeight(root, initButton, cycleFeature, registerReset) {
  const button = {
    name: 'Satır Yüksekliği',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M10 13h10v-2H10v2zm0-8v2h10V5H10zm0 12h10v-2H10v2zM6 5v14l-3-3 3-3V5z"/>
          </svg>`,
    id: 'lineHeightBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 3,
      currentLevel: 0,
    },
  }

  const handleLineHeight = function () {
    CURRENT_LINE_HEIGHT_LEVEL =
      (CURRENT_LINE_HEIGHT_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-line-height', CURRENT_LINE_HEIGHT_LEVEL)
    setLineHeight(CURRENT_LINE_HEIGHT_LEVEL)
  }

  function setLineHeight(currentLevel) {
    const lineHeightValue = LINE_HEIGHT_VALUES[currentLevel]

    let styleEl = document.getElementById('a11y-line-height-style')

    // Eğer seviye 0 ise (normal - orijinal durum), style elementini kaldır
    if (currentLevel === 0) {
      if (styleEl) {
        styleEl.remove()
      }
      cycleFeature(button, currentLevel)
      return
    }

    // Style elementini oluştur veya güncelle
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'a11y-line-height-style'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
      body, body *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
        line-height: ${lineHeightValue} !important;
      }
    `

    cycleFeature(button, currentLevel)
  }

  initButton(button, handleLineHeight)

  function control() {
    let option = localStorage.getItem('a11y-line-height')
    if (option !== null) {
      CURRENT_LINE_HEIGHT_LEVEL = parseInt(option)
      setLineHeight(CURRENT_LINE_HEIGHT_LEVEL)
      // Buton görsel durumunu güncelle
      cycleFeature(button, CURRENT_LINE_HEIGHT_LEVEL)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_LINE_HEIGHT_LEVEL = 0
    setLineHeight(0)
  })
}
