let CURRENT_HIDE_IMAGES_STATE = false

function hideImages(
  root,
  initButton,
  toggleFeature,
  registerReset,
  runtime = {},
) {
  const button = {
    name: 'Resimleri Gizle',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
          </svg>`,
    id: 'hideImagesBtn',
    type: 'button',
  }

  const hiddenImages = new Set()
  const originalStyles = new WeakMap()

  function hideCurrentImages() {
    if (!CURRENT_HIDE_IMAGES_STATE) return

    document.querySelectorAll('img').forEach(image => {
      if (
        image.closest('[data-accessibility-preference-widget]') ||
        originalStyles.has(image)
      ) {
        return
      }

      originalStyles.set(image, {
        value: image.style.getPropertyValue('display'),
        priority: image.style.getPropertyPriority('display'),
      })
      hiddenImages.add(image)
      image.style.setProperty('display', 'none', 'important')
      image.setAttribute('data-a11y-image-hidden', '')
    })
  }

  function restoreImages() {
    hiddenImages.forEach(image => {
      const original = originalStyles.get(image)
      if (image.isConnected && original) {
        if (original.value) {
          image.style.setProperty('display', original.value, original.priority)
        } else {
          image.style.removeProperty('display')
        }
        image.removeAttribute('data-a11y-image-hidden')
      }
      originalStyles.delete(image)
    })
    hiddenImages.clear()
  }

  function setHideImages(currentState) {
    CURRENT_HIDE_IMAGES_STATE = Boolean(currentState)
    if (CURRENT_HIDE_IMAGES_STATE) hideCurrentImages()
    else restoreImages()
    toggleFeature(button, CURRENT_HIDE_IMAGES_STATE)
  }

  function handleHideImages() {
    const nextState = !CURRENT_HIDE_IMAGES_STATE
    localStorage.setItem('a11y-hide-images', String(nextState))
    setHideImages(nextState)
  }
  handleHideImages.setPreference = state => {
    localStorage.setItem('a11y-hide-images', String(Boolean(state)))
    setHideImages(state)
  }

  initButton(button, handleHideImages)

  const savedState = localStorage.getItem('a11y-hide-images')
  if (savedState !== null) setHideImages(savedState === 'true')

  registerReset(() => setHideImages(false))
  if (runtime.registerRefresh) runtime.registerRefresh(hideCurrentImages)
}
