let CURRENT_FOCUS_INDICATOR_STATE = false

function focusIndicator(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Odak Görünürlüğü',
    icon: `
      <svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"
          stroke="currentColor" stroke-width="2" fill="none"/>
        <circle cx="12" cy="12" r="4"
          stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
    id: 'focusIndicatorBtn',
    type: 'button',
  }

  const handleFocusIndicator = function () {
    CURRENT_FOCUS_INDICATOR_STATE = !CURRENT_FOCUS_INDICATOR_STATE
    localStorage.setItem('a11y-focus-indicator', CURRENT_FOCUS_INDICATOR_STATE)
    setFocusIndicator(CURRENT_FOCUS_INDICATOR_STATE)
  }

  function setFocusIndicator(currentState) {
    let styleEl = document.getElementById('a11y-focus-indicator-style')

    if (currentState) {
      if (!styleEl) {
        styleEl = prepareWidgetStyle(document.createElement('style'))
        styleEl.id = 'a11y-focus-indicator-style'
        document.head.appendChild(styleEl)
      }

      styleEl.textContent = `
        /* Temel odak stilleri - Daha belirgin ve profesyonel */
        *:focus {
          outline: 4px solid #FF3B30 !important;
          outline-offset: 3px !important;
          box-shadow:
            0 0 0 8px rgba(255, 59, 48, 0.4),
            0 0 20px rgba(255, 59, 48, 0.6) !important;
          border-radius: 4px !important;
          position: relative !important;
          z-index: 9999 !important;
        }

        /* Butonlar için - Mavi ton */
        button:focus,
        [role="button"]:focus,
        [type="button"]:focus,
        [type="submit"]:focus {
          outline: 5px solid #007AFF !important;
          outline-offset: 4px !important;
          box-shadow:
            0 0 0 10px rgba(0, 122, 255, 0.4),
            0 0 25px rgba(0, 122, 255, 0.7),
            inset 0 0 10px rgba(255, 255, 255, 0.5) !important;
          transform: translateY(-2px) !important;
          transition: all 0.2s ease !important;
        }

        /* Linkler için - Mor ton */
        a:focus,
        [role="link"]:focus {
          outline: 4px solid #5856D6 !important;
          outline-offset: 3px !important;
          box-shadow:
            0 0 0 8px rgba(88, 86, 214, 0.4),
            0 0 15px rgba(88, 86, 214, 0.6) !important;
          text-decoration: underline !important;
          text-decoration-thickness: 3px !important;
          text-underline-offset: 4px !important;
        }

        /* Form elementleri için - Yeşil ton */
        input:focus,
        select:focus,
        textarea:focus {
          outline: 4px solid #34C759 !important;
          outline-offset: 2px !important;
          box-shadow:
            0 0 0 6px rgba(52, 199, 89, 0.4),
            0 0 15px rgba(52, 199, 89, 0.6),
            inset 0 0 8px rgba(52, 199, 89, 0.2) !important;
          border-color: #34C759 !important;
        }

        /* Tab ve navigasyon elementleri için - Turuncu ton */
        [role="tab"]:focus,
        [role="menuitem"]:focus,
        .tab:focus,
        .nav-item:focus {
          outline: 4px solid #FF9500 !important;
          outline-offset: 3px !important;
          box-shadow:
            0 0 0 8px rgba(255, 149, 0, 0.4),
            0 0 20px rgba(255, 149, 0, 0.6) !important;
        }

        /* Özel durum: Skip to content link'i */
        .skip-link:focus,
        [href="#main-content"]:focus {
          outline: 5px solid #FF2D55 !important;
          outline-offset: 4px !important;
          box-shadow:
            0 0 0 12px rgba(255, 45, 85, 0.5),
            0 0 30px rgba(255, 45, 85, 0.8) !important;
          background: #FF2D55 !important;
          color: white !important;
        }

        /* Animasyon ekleme - dikkat çekici puls efekti */
        @keyframes a11y-focus-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 59, 48, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0); }
        }

        /* Sadece klavye odağı için puls efekti (fare ile tıklamada yok) */
        *:focus-visible {
          animation: a11y-focus-pulse 1.5s infinite !important;
        }

        /* İçerik alanları için */
        [role="main"]:focus,
        [role="article"]:focus,
        main:focus,
        article:focus {
          outline: 6px solid #5AC8FA !important;
          outline-offset: 4px !important;
          box-shadow:
            0 0 0 15px rgba(90, 200, 250, 0.3),
            0 0 30px rgba(90, 200, 250, 0.5) !important;
        }
      `
    } else {
      if (styleEl) styleEl.remove()
    }

    toggleFeature(button, currentState)
  }

  handleFocusIndicator.setPreference = state => {
    localStorage.setItem('a11y-focus-indicator', String(Boolean(state)))
    setFocusIndicator(Boolean(state))
  }
  initButton(button, handleFocusIndicator)

  function control() {
    let option = localStorage.getItem('a11y-focus-indicator')
    if (option !== null) {
      CURRENT_FOCUS_INDICATOR_STATE = option === 'true'
      setFocusIndicator(CURRENT_FOCUS_INDICATOR_STATE)
    }
  }
  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_FOCUS_INDICATOR_STATE = false
    setFocusIndicator(false)
  })
}
