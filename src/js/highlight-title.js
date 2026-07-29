/**
 * Başlıkları Vurgulama Modülü
 */

let CURRENT_HIGHLIGHT_TITLES_STATE = false

function highlightTitles(root, initButton, toggleFeature, registerReset) {
  const button = {
    id: 'highlightTitlesBtn',
    icon: `<svg class="a11y-card-icon" viewBox="0 0 24 24"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>`, // Header icon
    name: 'Başlıkları Vurgula',
    type: 'toggle',
  }

  const handleHighlightTitles = function () {
    CURRENT_HIGHLIGHT_TITLES_STATE = !CURRENT_HIGHLIGHT_TITLES_STATE
    localStorage.setItem(
      'a11y-highlight-titles',
      CURRENT_HIGHLIGHT_TITLES_STATE,
    )
    setHighlightTitles(CURRENT_HIGHLIGHT_TITLES_STATE)
  }

  function setHighlightTitles(state) {
    let styleEl = document.getElementById('a11y-highlight-titles-style')

    if (state) {
      if (!styleEl) {
        styleEl = prepareWidgetStyle(document.createElement('style'))
        styleEl.id = 'a11y-highlight-titles-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        h1, h2, h3, h4, h5, h6,
        [role="heading"] {
          outline: 2px dashed rgba(247, 221, 23, 1) !important;
          outline-offset: 4px !important;
          background-color: rgba(247, 221, 23, 0.45) !important;
          color: inherit !important;
        }
      `
    } else {
      if (styleEl) {
        styleEl.remove()
      }
    }

    toggleFeature(button, state)
  }

  handleHighlightTitles.setPreference = state => {
    localStorage.setItem('a11y-highlight-titles', String(Boolean(state)))
    setHighlightTitles(Boolean(state))
  }
  initButton(button, handleHighlightTitles)

  // Load State
  const saved = localStorage.getItem('a11y-highlight-titles')
  if (saved === 'true') {
    CURRENT_HIGHLIGHT_TITLES_STATE = true
    setHighlightTitles(true)
  }

  // Register Reset
  registerReset(() => {
    CURRENT_HIGHLIGHT_TITLES_STATE = false
    setHighlightTitles(false)
  })
}
