let CURRENT_HIDE_IMAGES_STATE = false

function hideImages(root, initButton, toggleFeature, registerReset) {
  const button = {
    name: 'Resimleri Gizle',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
          </svg>`,
    id: 'hideImagesBtn',
    type: 'button',
  }

  let hiddenImages = []

  const handleHideImages = function () {
    CURRENT_HIDE_IMAGES_STATE = !CURRENT_HIDE_IMAGES_STATE
    localStorage.setItem('a11y-hide-images', CURRENT_HIDE_IMAGES_STATE)
    setHideImages(CURRENT_HIDE_IMAGES_STATE)
  }

  function setHideImages(currentState) {
    if (currentState) {
      // Tüm resimleri bul ve gizle (widget resimleri hariç)
      const images = document.querySelectorAll(
        'img:not(#a11y-widget-trigger *):not(#a11y-widget-panel *)',
      )

      images.forEach(img => {
        // Orijinal display değerini kaydet
        const originalDisplay = img.style.display

        // Resmi gizle
        img.style.display = 'none'

        hiddenImages.push({
          img,
          originalDisplay,
        })
      })
    } else {
      // Tüm resimleri geri getir
      hiddenImages.forEach(({ img, originalDisplay }) => {
        img.style.display = originalDisplay
      })

      hiddenImages = []
    }

    toggleFeature(button, currentState)
  }

  initButton(button, handleHideImages)

  function control() {
    let option = localStorage.getItem('a11y-hide-images')
    if (option !== null) {
      CURRENT_HIDE_IMAGES_STATE = option === 'true'
      setHideImages(CURRENT_HIDE_IMAGES_STATE)
      toggleFeature(button, CURRENT_HIDE_IMAGES_STATE)
    }
  }

  control()

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_HIDE_IMAGES_STATE = false
    setHideImages(false)
  })
}
