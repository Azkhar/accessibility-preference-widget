const LETTER_SPACING_VALUES = ['normal', '0.1em', '0.2em', '0.3em']
let CURRENT_LETTER_SPACING_LEVEL = 0

function letterSpacing(root, initButton, cycleFeature, registerReset) {
  const button = {
    name: 'Harf Boşluğu',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"/>
          </svg>`,
    id: 'letterSpacingBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 3,
      currentLevel: 0,
    },
  }

  const handleLetterSpacing = function () {
    CURRENT_LETTER_SPACING_LEVEL =
      (CURRENT_LETTER_SPACING_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-letter-spacing', CURRENT_LETTER_SPACING_LEVEL)
    setLetterSpacing(CURRENT_LETTER_SPACING_LEVEL)
  }

  function setLetterSpacing(currentLevel) {
    const letterSpacingValue = LETTER_SPACING_VALUES[currentLevel]

    let styleEl = document.getElementById('a11y-letter-spacing-style')

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
      styleEl = prepareWidgetStyle(document.createElement('style'))
      styleEl.id = 'a11y-letter-spacing-style'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
      body, body *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
        letter-spacing: ${letterSpacingValue} !important;
        word-spacing: ${letterSpacingValue} !important;
      }
    `

    cycleFeature(button, currentLevel)
  }

  handleLetterSpacing.setPreference = level => {
    localStorage.setItem('a11y-letter-spacing', String(level))
    setLetterSpacing(Number(level))
  }
  initButton(button, handleLetterSpacing)

  function control() {
    let option = localStorage.getItem('a11y-letter-spacing')
    if (option !== null) {
      CURRENT_LETTER_SPACING_LEVEL = parseInt(option)
      setLetterSpacing(CURRENT_LETTER_SPACING_LEVEL)
      // Buton görsel durumunu güncelle
      cycleFeature(button, CURRENT_LETTER_SPACING_LEVEL)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_LETTER_SPACING_LEVEL = 0
    setLetterSpacing(0)
  })
}
