;(function (global, document) {
  'use strict'

  const VERSION = '@WIDGETVERSION'
  const GLOBAL_NAME = 'AccessibilityPreferenceWidget'
  const HOST_ATTRIBUTE = 'data-accessibility-preference-widget'
  const DEFAULT_CONFIG = {
    autoMount: true,
    disabled: false,
    excludePaths: [],
    includePaths: [],
    observeDom: true,
    position: 'bottom-right',
    offsetX: '25px',
    offsetY: '25px',
    zIndex: 999999,
    language: 'auto',
    nonce: '',
  }
  const localStorage = createSafeStorage()

  let activeConfig
  let controller = null
  let host = null
  let routeObserver = null
  let routeCheckScheduled = false
  let cancelScheduledRouteCheck = null
  let lastPath = getCurrentPath()

  function createSafeStorage() {
    const fallback = new Map()
    let nativeStorage = null
    try {
      nativeStorage = global.localStorage
      const probeKey = '__a11y_widget_storage_probe__'
      nativeStorage.setItem(probeKey, '1')
      nativeStorage.removeItem(probeKey)
    } catch {
      nativeStorage = null
    }

    return {
      get length() {
        return nativeStorage ? nativeStorage.length : fallback.size
      },
      key(index) {
        if (nativeStorage) return nativeStorage.key(index)
        return [...fallback.keys()][index] ?? null
      },
      getItem(key) {
        if (nativeStorage) return nativeStorage.getItem(key)
        return fallback.has(String(key)) ? fallback.get(String(key)) : null
      },
      setItem(key, value) {
        if (nativeStorage) nativeStorage.setItem(key, String(value))
        else fallback.set(String(key), String(value))
      },
      removeItem(key) {
        if (nativeStorage) nativeStorage.removeItem(key)
        else fallback.delete(String(key))
      },
      clear() {
        if (nativeStorage) nativeStorage.clear()
        else fallback.clear()
      },
    }
  }

  function parseBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback
    return !['false', '0', 'off', 'no'].includes(String(value).toLowerCase())
  }

  function parsePathList(value) {
    if (!value) return []
    if (Array.isArray(value)) return value
    return String(value)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  function readScriptConfig() {
    const script = document.currentScript
    if (!script) return {}

    const { dataset } = script
    return {
      autoMount: parseBoolean(dataset.autoMount, undefined),
      disabled: parseBoolean(dataset.disabled, undefined),
      excludePaths: parsePathList(dataset.excludePaths),
      includePaths: parsePathList(dataset.includePaths),
      observeDom: parseBoolean(dataset.observeDom, undefined),
      position: dataset.position,
      offsetX: dataset.offsetX,
      offsetY: dataset.offsetY,
      zIndex: dataset.zIndex ? Number(dataset.zIndex) : undefined,
      language: dataset.language,
      nonce: dataset.nonce,
    }
  }

  function removeUndefined(object) {
    return Object.fromEntries(
      Object.entries(object).filter(([, value]) => value !== undefined),
    )
  }

  function normalizeConfig(options = {}) {
    const globalConfig = global.AccessibilityPreferenceWidgetConfig || {}
    const merged = {
      ...DEFAULT_CONFIG,
      ...removeUndefined(globalConfig),
      ...removeUndefined(readScriptConfig()),
      ...removeUndefined(options),
    }

    merged.excludePaths = parsePathList(merged.excludePaths)
    merged.includePaths = parsePathList(merged.includePaths)
    merged.position =
      merged.position === 'bottom-left' ? 'bottom-left' : 'bottom-right'
    merged.offsetX = String(merged.offsetX || DEFAULT_CONFIG.offsetX)
    merged.offsetY = String(merged.offsetY || DEFAULT_CONFIG.offsetY)
    merged.zIndex = Number.isFinite(Number(merged.zIndex))
      ? Number(merged.zIndex)
      : DEFAULT_CONFIG.zIndex
    merged.nonce = String(merged.nonce || '')
    return merged
  }

  function getCurrentPath() {
    return global.location
      ? `${global.location.pathname}${global.location.search}${global.location.hash}`
      : '/'
  }

  function matchesPath(path, matcher) {
    if (typeof matcher === 'function') return Boolean(matcher(path))
    if (matcher instanceof RegExp) return matcher.test(path)
    if (typeof matcher !== 'string' || matcher.length === 0) return false

    if (matcher.endsWith('*')) return path.startsWith(matcher.slice(0, -1))
    return path === matcher || path.startsWith(`${matcher.replace(/\/$/, '')}/`)
  }

  function shouldMount(config = activeConfig) {
    if (config.disabled) return false

    const path = getCurrentPath()
    if (
      config.includePaths.length > 0 &&
      !config.includePaths.some(matcher => matchesPath(path, matcher))
    ) {
      return false
    }

    return !config.excludePaths.some(matcher => matchesPath(path, matcher))
  }

  function emit(name, detail = {}) {
    if (typeof global.CustomEvent !== 'function') return
    document.dispatchEvent(
      new global.CustomEvent(`accessibility-preference-widget:${name}`, {
        detail: { version: VERSION, ...detail },
      }),
    )
  }

  function applyHostConfig(target, config) {
    target.dataset.position = config.position
    target.style.setProperty('--a11y-widget-offset-x', config.offsetX)
    target.style.setProperty('--a11y-widget-offset-y', config.offsetY)
    target.style.setProperty('--a11y-widget-z-index', String(config.zIndex))
  }

  function prepareWidgetStyle(style) {
    style.setAttribute('data-a11y-owned', '')
    if (activeConfig.nonce) style.setAttribute('nonce', activeConfig.nonce)
    return style
  }

  function mount(options = {}) {
    activeConfig = normalizeConfig({ ...activeConfig, ...options })

    if (!shouldMount()) {
      destroy()
      return null
    }

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => mount(options), {
        once: true,
      })
      return null
    }

    if (controller && host && host.isConnected) {
      applyHostConfig(host, activeConfig)
      controller.configure(activeConfig)
      controller.refresh()
      return host
    }

    const existingHost = document.querySelector(`[${HOST_ATTRIBUTE}]`)
    if (existingHost) existingHost.remove()

    host = document.createElement('div')
    host.id = `accessibility-preference-widget-${Math.random()
      .toString(36)
      .slice(2, 8)}`
    host.setAttribute(HOST_ATTRIBUTE, '')
    host.setAttribute('data-version', VERSION)
    applyHostConfig(host, activeConfig)
    document.body.appendChild(host)

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const style = prepareWidgetStyle(document.createElement('style'))
    style.textContent = `@WIDGETCSS`
    shadowRoot.appendChild(style)

    const container = document.createElement('div')
    container.innerHTML = `@WIDGETHTML`
    while (container.firstChild) {
      shadowRoot.appendChild(container.firstChild)
    }

    /* @WIDGETJS */

    controller = main(shadowRoot, {
      config: activeConfig,
      host,
      version: VERSION,
    })
    emit('mounted', { hostId: host.id })
    return host
  }

  function destroy(options = {}) {
    if (!controller && !host) return

    const currentHost = host
    const currentController = controller
    controller = null
    host = null

    if (currentController) {
      currentController.destroy({
        preservePreferences: options.preservePreferences !== false,
      })
    }
    if (currentHost && currentHost.isConnected) currentHost.remove()
    emit('destroyed')
  }

  function refresh() {
    if (!shouldMount()) {
      destroy()
      return
    }
    if (!controller) {
      mount()
      return
    }
    controller.refresh()
    emit('refreshed')
  }

  function open() {
    if (!controller) mount()
    if (controller) controller.open()
  }

  function close() {
    if (controller) controller.close()
  }

  function reset() {
    if (controller) controller.reset()
  }

  function configure(options = {}) {
    activeConfig = normalizeConfig({ ...activeConfig, ...options })
    if (shouldMount()) mount(activeConfig)
    else destroy()
    return { ...activeConfig }
  }

  function scheduleRouteCheck() {
    if (routeCheckScheduled) return
    routeCheckScheduled = true

    const schedule =
      typeof global.requestAnimationFrame === 'function'
        ? global.requestAnimationFrame
        : callback => global.setTimeout(callback, 0)
    const cancel =
      typeof global.cancelAnimationFrame === 'function'
        ? global.cancelAnimationFrame
        : global.clearTimeout

    const handle = schedule(() => {
      cancelScheduledRouteCheck = null
      routeCheckScheduled = false
      const currentPath = getCurrentPath()
      if (currentPath === lastPath) {
        if (controller && activeConfig.observeDom !== false) controller.refresh()
        return
      }
      lastPath = currentPath
      if (shouldMount()) mount()
      else destroy()
      emit('routechange', { path: currentPath })
    })
    cancelScheduledRouteCheck = () => cancel.call(global, handle)
  }

  function startRouteWatcher() {
    global.addEventListener('popstate', scheduleRouteCheck)
    global.addEventListener('hashchange', scheduleRouteCheck)
    document.addEventListener(
      'accessibility-preference-widget:navigate',
      scheduleRouteCheck,
    )

    if (typeof global.MutationObserver === 'function' && document.documentElement) {
      routeObserver = new global.MutationObserver(scheduleRouteCheck)
      routeObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    }
  }

  function disconnect() {
    destroy()
    if (cancelScheduledRouteCheck) cancelScheduledRouteCheck()
    cancelScheduledRouteCheck = null
    routeCheckScheduled = false
    global.removeEventListener('popstate', scheduleRouteCheck)
    global.removeEventListener('hashchange', scheduleRouteCheck)
    document.removeEventListener(
      'accessibility-preference-widget:navigate',
      scheduleRouteCheck,
    )
    if (routeObserver) routeObserver.disconnect()
    routeObserver = null
  }

  const previousApi = global[GLOBAL_NAME]
  if (previousApi && typeof previousApi.disconnect === 'function') {
    previousApi.disconnect()
  }

  activeConfig = normalizeConfig()
  const api = {
    version: VERSION,
    mount,
    destroy,
    refresh,
    open,
    close,
    reset,
    configure,
    disconnect,
    getConfig: () => ({ ...activeConfig }),
    isMounted: () => Boolean(controller && host && host.isConnected),
    getHost: () => host,
  }

  global[GLOBAL_NAME] = api
  startRouteWatcher()

  if (activeConfig.autoMount) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => mount(), { once: true })
    } else {
      mount()
    }
  }
})(window, document)
