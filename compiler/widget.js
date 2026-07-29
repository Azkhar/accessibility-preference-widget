;(function () {
  function mountAccessibilityPreferenceWidget() {
    if (document.querySelector('[data-accessibility-preference-widget]')) return

    const host = document.createElement('div')
    host.id = 'accessibility-preference-widget-' + Math.random().toString(36).slice(2, 8)
    host.setAttribute('data-accessibility-preference-widget', '')
    document.body.appendChild(host)

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `@WIDGETCSS`
    shadowRoot.appendChild(style)

    const container = document.createElement('div')
    container.innerHTML = `@WIDGETHTML`
    while (container.firstChild) {
      shadowRoot.appendChild(container.firstChild)
    }

    /* @WIDGETJS */

    main(shadowRoot)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAccessibilityPreferenceWidget, {
      once: true,
    })
  } else {
    mountAccessibilityPreferenceWidget()
  }
})()
