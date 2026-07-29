let CURRENT_TOOLTIP_STATE = false

function tooltip(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'İpucu Balonu',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>`,
    id: 'tooltipBtn',
    type: 'button',
  }

  let tooltipElement = null
  let activeElements = []

  const handleTooltip = function () {
    CURRENT_TOOLTIP_STATE = !CURRENT_TOOLTIP_STATE
    localStorage.setItem('a11y-tooltip', CURRENT_TOOLTIP_STATE)
    setTooltip(CURRENT_TOOLTIP_STATE)
  }

  // EN GÖRÜNÜR VERSİYON
  function createTooltip() {
    const tooltip = document.createElement('div')
    tooltip.style.cssText = `
    position: fixed;
    background: #0f766e; /* Daha koyu bir teal */
    color: white;
    padding: 8px 12px;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 700;
    z-index: 100000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    max-width: 380px;
    text-align: left;
    line-height: 1.6;
    box-shadow:
      0 12px 50px rgba(0,0,0,0.5),
      0 8px 25px rgba(0,0,0,0.4),
      0 0 0 3px #ffffff;
    border: 3px solid #ffffff;
    word-wrap: break-word;
    white-space: normal;
    text-transform: none;
  `
    return tooltip
  }

  function getSmartPosition(element, tooltipRect) {
    const rect = element.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const positions = []
    const spacing = 10

    // Sağ pozisyon (elementin sağına)
    if (rect.right + tooltipRect.width + spacing <= viewport.width) {
      positions.push({
        x: rect.right + spacing,
        y: rect.top + rect.height / 2 - tooltipRect.height / 2,
        placement: 'right',
      })
    }

    // Sol pozisyon (elementin soluna)
    if (rect.left - tooltipRect.width - spacing >= 0) {
      positions.push({
        x: rect.left - tooltipRect.width - spacing,
        y: rect.top + rect.height / 2 - tooltipRect.height / 2,
        placement: 'left',
      })
    }

    // Alt pozisyon (elementin altına)
    if (rect.bottom + tooltipRect.height + spacing <= viewport.height) {
      positions.push({
        x: rect.left + rect.width / 2 - tooltipRect.width / 2,
        y: rect.bottom + spacing,
        placement: 'bottom',
      })
    }

    // Üst pozisyon (elementin üstüne)
    if (rect.top - tooltipRect.height - spacing >= 0) {
      positions.push({
        x: rect.left + rect.width / 2 - tooltipRect.width / 2,
        y: rect.top - tooltipRect.height - spacing,
        placement: 'top',
      })
    }

    // En iyi pozisyonu seç (mümkünse sağ veya sol)
    const preferredOrder = ['right', 'left', 'bottom', 'top']
    for (const placement of preferredOrder) {
      const position = positions.find(p => p.placement === placement)
      if (position) return position
    }

    // Hiçbiri uygun değilse, viewport içinde sığdırmaya çalış
    return {
      x: Math.max(
        spacing,
        Math.min(viewport.width - tooltipRect.width - spacing, rect.left),
      ),
      y: Math.max(
        spacing,
        Math.min(viewport.height - tooltipRect.height - spacing, rect.top),
      ),
      placement: 'fallback',
    }
  }

  function showTooltip(element, text) {
    if (!tooltipElement) {
      tooltipElement = createTooltip()
      document.body.appendChild(tooltipElement)
    }

    if (!text || text.trim() === '') return

    tooltipElement.textContent = text
    tooltipElement.style.opacity = '0' // Önce gizle

    // Tooltip'i görünür yap ve boyutlarını al
    const tooltipRect = tooltipElement.getBoundingClientRect()

    // Akıllı pozisyon belirleme
    const position = getSmartPosition(element, tooltipRect)

    // Pozisyonu ayarla
    tooltipElement.style.left = `${position.x}px`
    tooltipElement.style.top = `${position.y}px`

    // Görünür yap
    tooltipElement.style.opacity = '1'
  }

  function hideTooltip() {
    if (tooltipElement) {
      tooltipElement.style.opacity = '0'
    }
  }

  // ... getElementInfo fonksiyonu aynı kalacak ...

  function getElementInfo(element) {
    // Butonlar için - sadece görünmeyen açıklamaları göster
    if (
      element.tagName === 'BUTTON' ||
      element.getAttribute('role') === 'button'
    ) {
      const ariaLabel = element.getAttribute('aria-label')
      const title = element.getAttribute('title')
      const ariaDescription = element.getAttribute('aria-description')

      // Sadece görünmeyen açıklamaları göster (buton metnini gösterme)
      return ariaLabel || title || ariaDescription
    }

    // Resimler için
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt')
      const title = element.getAttribute('title')
      return alt || title
    }

    // Linkler için
    if (element.tagName === 'A') {
      const ariaLabel = element.getAttribute('aria-label')
      const title = element.getAttribute('title')

      // Sadece görünmeyen açıklamaları göster
      return ariaLabel || title
    }

    // Inputlar için
    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT'
    ) {
      const placeholder = element.getAttribute('placeholder')
      const ariaLabel = element.getAttribute('aria-label')
      const title = element.getAttribute('title')
      const type = element.getAttribute('type')

      return ariaLabel || title || placeholder || `${type || 'Input'} alanı`
    }

    // Form label'ları için
    if (element.tagName === 'LABEL') {
      const text = element.textContent?.trim()
      const forAttr = element.getAttribute('for')
      if (forAttr) {
        const target = document.getElementById(forAttr)
        if (target) {
          const targetType =
            target.getAttribute('type') || target.tagName.toLowerCase()
          return `${text} (${targetType} alanı)`
        }
      }
      return text
    }

    // İkonlar için (font awesome, material icons vb.)
    if (
      element.classList.contains('fa') ||
      element.classList.contains('fas') ||
      element.classList.contains('far') ||
      element.classList.contains('fab') ||
      element.classList.contains('material-icons') ||
      element.textContent?.trim().length === 1
    ) {
      // Tek karakterli içerik (ikon olabilir)
      const ariaLabel = element.getAttribute('aria-label')
      const title = element.getAttribute('title')
      return ariaLabel || title
    }

    // ARIA landmark'ları için
    if (
      element.getAttribute('role') ||
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-description')
    ) {
      const role = element.getAttribute('role')
      const ariaLabel = element.getAttribute('aria-label')
      const ariaDescription = element.getAttribute('aria-description')
      const title = element.getAttribute('title')

      return ariaLabel || ariaDescription || title || role
    }

    return null
  }

  // ... addTooltipToElement ve diğer fonksiyonlar aynı kalacak ...

  function addTooltipToElement(element) {
    const mouseEnterHandler = () => {
      const info = getElementInfo(element)
      if (info) {
        showTooltip(element, info)
      }
    }

    const mouseLeaveHandler = () => {
      hideTooltip()
    }

    element.addEventListener('mouseenter', mouseEnterHandler)
    element.addEventListener('mouseleave', mouseLeaveHandler)
    element.addEventListener('focus', mouseEnterHandler)
    element.addEventListener('blur', mouseLeaveHandler)

    // Touch events for mobile
    element.addEventListener('touchstart', mouseEnterHandler)
    element.addEventListener('touchend', mouseLeaveHandler)

    activeElements.push({
      element,
      mouseEnterHandler,
      mouseLeaveHandler,
    })
  }

  function setTooltip(currentState) {
    if (currentState) {
      // Tooltip'ı aktif et
      if (!tooltipElement) {
        tooltipElement = createTooltip()
        document.body.appendChild(tooltipElement)
      }

      // Tooltip ekleyeceğimiz elementleri seç
      const elements = document.querySelectorAll(`
        img[alt]:not([alt=""]):not(#a11y-widget-trigger *):not(#a11y-widget-panel *),
        button:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        a:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        input:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        textarea:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        select:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        label:not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        [aria-label]:not([aria-label=""]):not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        [title]:not([title=""]):not(#a11y-widget-trigger):not(#a11y-widget-panel *),
        [role]:not(#a11y-widget-trigger):not(#a11y-widget-panel *)
      `)

      elements.forEach(element => {
        // Sadece gerçekten tooltip göstermeye değer elementler
        const info = getElementInfo(element)
        if (info) {
          addTooltipToElement(element)
        }
      })

      // Dinamik olarak eklenen elementler için MutationObserver
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const elements =
                node.querySelectorAll?.(`
                img[alt]:not([alt=""]),
                button,
                a,
                input,
                textarea,
                select,
                label,
                [aria-label]:not([aria-label=""]),
                [title]:not([title=""]),
                [role]
              `) || []

              elements.forEach(element => {
                if (
                  !element.closest('#a11y-widget-trigger') &&
                  !element.closest('#a11y-widget-panel')
                ) {
                  const info = getElementInfo(element)
                  if (info) {
                    addTooltipToElement(element)
                  }
                }
              })
            }
          })
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      window.a11yTooltipObserver = observer
    } else {
      // Tooltip'ı kapat
      if (tooltipElement) {
        tooltipElement.remove()
        tooltipElement = null
      }

      // Event listener'ları temizle
      activeElements.forEach(
        ({ element, mouseEnterHandler, mouseLeaveHandler }) => {
          element.removeEventListener('mouseenter', mouseEnterHandler)
          element.removeEventListener('mouseleave', mouseLeaveHandler)
          element.removeEventListener('focus', mouseEnterHandler)
          element.removeEventListener('blur', mouseLeaveHandler)
          element.removeEventListener('touchstart', mouseEnterHandler)
          element.removeEventListener('touchend', mouseLeaveHandler)
        },
      )

      activeElements = []

      // Observer'ı temizle
      if (window.a11yTooltipObserver) {
        window.a11yTooltipObserver.disconnect()
        delete window.a11yTooltipObserver
      }
    }

    toggleFeature(button, currentState)
  }

  initButton(button, handleTooltip)

  function control() {
    let option = localStorage.getItem('a11y-tooltip')
    if (option !== null) {
      CURRENT_TOOLTIP_STATE = option === 'true'
      setTooltip(CURRENT_TOOLTIP_STATE)
      toggleFeature(button, CURRENT_TOOLTIP_STATE)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_TOOLTIP_STATE = false
    setTooltip(false)
  })
}
