/**
 * Okuma Kılavuzu Modülü (Gelişmiş - Line & Mask)
 */

let CURRENT_READING_GUIDE_LEVEL = 0 // 0: Off, 1: Line, 2: Mask
let readingGuideElement = null
let mouseMoveHandler = null
let touchMoveHandler = null

function readingGuide(root, initButton, cycleFeature, registerReset) {
  const button = {
    name: 'Okuma Kılavuzu',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M3 17h18c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h18c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h18c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1z"/>
            </svg>`,
    id: 'readingGuideBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 2, // 1: Line, 2: Mask
    },
  }

  const handleReadingGuide = function () {
    CURRENT_READING_GUIDE_LEVEL = (CURRENT_READING_GUIDE_LEVEL + 1) % 3
    localStorage.setItem(
      'a11y-reading-guide-level',
      CURRENT_READING_GUIDE_LEVEL,
    )
    setReadingGuide(CURRENT_READING_GUIDE_LEVEL)
  }

  function createReadingGuide() {
    if (readingGuideElement) return readingGuideElement

    readingGuideElement = document.createElement('div')
    readingGuideElement.id = 'a11y-reading-guide'
    // Default styles will be applied based on mode
    readingGuideElement.style.cssText = `
            position: fixed;
            left: 0;
            width: 100%;
            pointer-events: none;
            z-index: 999999;
            display: none;
            transition: top 0.05s linear;
        `
    document.body.appendChild(readingGuideElement)
    return readingGuideElement
  }

  function updateGuideStyle(level) {
    const guide = readingGuideElement || createReadingGuide()

    if (level === 1) {
      // LINE MODE
      guide.style.height = '5px'
      guide.style.background = '#ff4444'
      guide.style.boxShadow = '0 0 15px rgba(255, 68, 68, 1)'
    } else if (level === 2) {
      // MASK MODE
      // Box shadow trick: Transparent center, huge dark shadow around
      guide.style.height = '60px' // Reading strip height
      guide.style.background = 'transparent'
      guide.style.boxShadow = '0 0 0 100vh rgba(0, 0, 0, 0.75)'
    }
  }

  function handleMove(e) {
    const guide = readingGuideElement || createReadingGuide()

    let clientY
    if (e.type === 'scroll') {
      if (e.clientY === undefined) {
        if (!guide.lastClientY) return
        clientY = guide.lastClientY
      } else {
        clientY = e.clientY
        guide.lastClientY = clientY
      }
    } else {
      clientY =
        e.clientY !== undefined
          ? e.clientY
          : e.touches && e.touches.length > 0
          ? e.touches[0].clientY
          : null
      if (clientY === null) return
      guide.lastClientY = clientY
    }

    if (clientY === undefined) return

    guide.style.display = 'block'

    // Position calculation depends on mode
    if (CURRENT_READING_GUIDE_LEVEL === 1) {
      // Line: top at cursor
      guide.style.top = clientY + 'px'
    } else if (CURRENT_READING_GUIDE_LEVEL === 2) {
      // Mask: center around cursor
      // Center is cursor, so top is clientY - height/2
      guide.style.top = clientY - 30 + 'px'
    }
  }

  function setReadingGuide(level) {
    const guide = readingGuideElement || createReadingGuide()

    // Cycle Feature Update
    cycleFeature(button, level)

    if (level > 0) {
      updateGuideStyle(level)

      // Add Listeners
      if (!mouseMoveHandler) {
        mouseMoveHandler = handleMove
        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('touchmove', handleMove, { passive: true })
        window.addEventListener('scroll', handleMove)
      }
      guide.style.display = 'block'

      // If we have a last position, verify it matches the new style's layout
      if (guide.lastClientY) {
        // Re-trigger move to update position based on new mode logic
        handleMove({ clientY: guide.lastClientY })
      }
    } else {
      // OFF
      guide.style.display = 'none'
      if (mouseMoveHandler) {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('touchmove', handleMove)
        window.removeEventListener('scroll', handleMove)
        mouseMoveHandler = null
      }
    }
  }

  handleReadingGuide.setPreference = level => {
    localStorage.setItem('a11y-reading-guide-level', String(level))
    setReadingGuide(Number(level))
  }
  initButton(button, handleReadingGuide)

  // Initial Load
  const savedLevel = localStorage.getItem('a11y-reading-guide-level')

  // Backward compatibility check (old boolean)
  const savedBool = localStorage.getItem('a11y-reading-guide')
  if (savedLevel !== null) {
    CURRENT_READING_GUIDE_LEVEL = parseInt(savedLevel)
  } else if (savedBool === 'true') {
    CURRENT_READING_GUIDE_LEVEL = 1 // Mapping old true to Line mode
  }

  setReadingGuide(CURRENT_READING_GUIDE_LEVEL)

  // Reset
  registerReset(() => {
    CURRENT_READING_GUIDE_LEVEL = 0
    setReadingGuide(0)
  })
}
