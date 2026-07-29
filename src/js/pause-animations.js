let CURRENT_PAUSE_ANIMATIONS_STATE = false

function pauseAnimations(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Animasyonları Duraklat',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>`,
    id: 'pauseAnimationsBtn',
    type: 'button',
  }

  const handlePauseAnimations = function () {
    CURRENT_PAUSE_ANIMATIONS_STATE = !CURRENT_PAUSE_ANIMATIONS_STATE
    localStorage.setItem(
      'a11y-pause-animations',
      CURRENT_PAUSE_ANIMATIONS_STATE,
    )
    setPauseAnimations(CURRENT_PAUSE_ANIMATIONS_STATE)
  }

  function setPauseAnimations(currentState) {
    let styleEl = document.getElementById('a11y-pause-animations-style')

    if (currentState) {
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'a11y-pause-animations-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          animation-play-state: paused !important;
          transition-property: none !important;
          scroll-behavior: auto !important;
        }

        video, audio, [autoplay] {
          animation: none !important;
          transition: none !important;
        }
      `
    } else {
      if (styleEl) {
        styleEl.remove()
      }
    }

    toggleFeature(button, currentState)
  }

  initButton(button, handlePauseAnimations)

  function control() {
    let option = localStorage.getItem('a11y-pause-animations')
    if (option !== null) {
      CURRENT_PAUSE_ANIMATIONS_STATE = option === 'true'
      setPauseAnimations(CURRENT_PAUSE_ANIMATIONS_STATE)
    }
  }
  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_PAUSE_ANIMATIONS_STATE = false
    setPauseAnimations(false)
  })
}
