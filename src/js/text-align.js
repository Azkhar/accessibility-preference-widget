const TEXT_ALIGN_VALUES = ['left', 'center', 'right', 'justify']
let CURRENT_TEXT_ALIGN_LEVEL = 0

function textAlign(root, initButton, cycleFeature, registerReset) {
  const button = {
    name: 'Metin Hizala',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M4 5h16v2H4V5zm0 4h12v2H4V9zm0 4h16v2H4v-2zm0 4h12v2H4v-2z"/>
          </svg>`,
    id: 'textAlignBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 3,
      currentLevel: 0,
    },
  }

  const handleTextAlign = function () {
    CURRENT_TEXT_ALIGN_LEVEL =
      (CURRENT_TEXT_ALIGN_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-text-align', CURRENT_TEXT_ALIGN_LEVEL)
    setTextAlign(CURRENT_TEXT_ALIGN_LEVEL)
  }

  function setTextAlign(currentLevel) {
    const textAlignValue = TEXT_ALIGN_VALUES[currentLevel]

    let styleEl = document.getElementById('a11y-text-align-style')

    // Eğer seviye 0 ise (left - orijinal durum), style elementini kaldır
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
      styleEl.id = 'a11y-text-align-style'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
      body, body *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
        text-align: ${textAlignValue} !important;
      }
    `

    cycleFeature(button, currentLevel)
  }

  initButton(button, handleTextAlign)

  function control() {
    let option = localStorage.getItem('a11y-text-align')
    if (option !== null) {
      CURRENT_TEXT_ALIGN_LEVEL = parseInt(option)
      setTextAlign(CURRENT_TEXT_ALIGN_LEVEL)
      // Buton görsel durumunu güncelle
      cycleFeature(button, CURRENT_TEXT_ALIGN_LEVEL)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_TEXT_ALIGN_LEVEL = 0
    setTextAlign(0)
  })
}
